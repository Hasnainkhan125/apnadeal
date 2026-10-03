// src/lib/imageStorage.js
import { supabase } from "./supabase";

/* ═══════════════════════════════════════════════════════════════
   SAVE a generated image to Supabase
   ═══════════════════════════════════════════════════════════════ */
export async function saveGeneratedImage({
  url,
  prompt,
  model = "flux-1-schnell",
  style,
  width,
  height,
  seed,
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.warn("saveGeneratedImage: no user");
      return null;
    }

    const meta = user.user_metadata || {};
    const userEmail = user.email || "";
    const userName =
      meta.full_name ||
      meta.name ||
      meta.display_name ||
      userEmail.split("@")[0] ||
      "Anonymous";

    const { data, error } = await supabase
      .from("generated_images")
      .insert({
        user_id: user.id,
        user_email: userEmail,
        user_name: userName,
        url,
        prompt,
        model,
        style,
        width,
        height,
        seed,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("saveGeneratedImage failed:", err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOAD recent generated images (GLOBAL feed — everyone's)
   ═══════════════════════════════════════════════════════════════ */
export async function loadRecentGeneratedImages(limit = 30) {
  try {
    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("loadRecentGeneratedImages failed:", err);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOAD only the CURRENT USER's generated images ("Yours")
   ═══════════════════════════════════════════════════════════════ */
export async function loadMyGeneratedImages(limit = 100) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("loadMyGeneratedImages failed:", err);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   DELETE an image by id (only if owner)
   ═══════════════════════════════════════════════════════════════ */
export async function deleteGeneratedImage(id) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("generated_images")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
  } catch (err) {
    console.warn("deleteGeneratedImage failed:", err);
  }
}

/* ═══════════════════════════════════════════════════════════════
   UPLOAD base64 / blob to Storage and get public URL
   Bucket: "generated-images"  (matches your existing setup)
   - If input is already an https URL → returns it as-is.
   - If storage upload fails → returns the original data URL
     so the DB row still saves with a working image.
   ═══════════════════════════════════════════════════════════════ */
export async function uploadGeneratedToStorage(dataUrl, folder = "generated") {
  try {
    /* Already a remote URL (e.g. from Pollinations)? Use it directly. */
    if (
      typeof dataUrl === "string" &&
      !dataUrl.startsWith("data:") &&
      (dataUrl.startsWith("http://") || dataUrl.startsWith("https://"))
    ) {
      return dataUrl;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return dataUrl || null;

    /* Convert data URL → blob */
    let blob;
    try {
      const res = await fetch(dataUrl);
      blob = await res.blob();
    } catch (fetchErr) {
      console.warn("Could not convert data URL → blob:", fetchErr);
      return dataUrl;
    }

    const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.jpg`;

    const { data, error } = await supabase.storage
      .from("generated-images")
      .upload(fileName, blob, {
        contentType: blob.type || "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.warn("Storage upload failed:", error.message);
      /* Fallback → return original data URL so DB can still save */
      return dataUrl;
    }

    const { data: urlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(data.path);

    return urlData?.publicUrl || dataUrl;
  } catch (err) {
    console.warn("uploadGeneratedToStorage failed:", err);
    /* Return whatever we had so DB still saves it */
    return dataUrl || null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CREDITS — load current user's balance
   Column: "credits".  If no row exists → creates one with 20.
   ═══════════════════════════════════════════════════════════════ */
export async function loadUserCredits() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    /* No row → create default 20 */
    if (!data) {
      const { data: created, error: createErr } = await supabase
        .from("user_credits")
        .insert({ user_id: user.id, credits: 20 })
        .select("credits")
        .single();

      if (createErr) throw createErr;
      return created?.credits ?? 20;
    }

    return data.credits ?? 0;
  } catch (err) {
    console.warn("loadUserCredits failed:", err);
    return 0;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CREDITS — deduct N credits (returns NEW balance, or null on error)
   ═══════════════════════════════════════════════════════════════ */
export async function deductUserCredits(amount) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: current, error: readErr } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readErr && readErr.code !== "PGRST116") throw readErr;

    const existing = current?.credits ?? 20;
    const next = Math.max(0, existing - amount);

    const { data: updated, error: updErr } = await supabase
      .from("user_credits")
      .upsert(
        {
          user_id: user.id,
          credits: next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("credits")
      .single();

    if (updErr) throw updErr;
    return updated?.credits ?? next;
  } catch (err) {
    console.warn("deductUserCredits failed:", err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CREDITS — add N credits (top-up / refund)
   ═══════════════════════════════════════════════════════════════ */
export async function addUserCredits(amount) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: current, error: readErr } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readErr && readErr.code !== "PGRST116") throw readErr;

    const existing = current?.credits ?? 0;
    const next = existing + amount;

    const { data: updated, error: updErr } = await supabase
      .from("user_credits")
      .upsert(
        {
          user_id: user.id,
          credits: next,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("credits")
      .single();

    if (updErr) throw updErr;
    return updated?.credits ?? next;
  } catch (err) {
    console.warn("addUserCredits failed:", err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CREDITS — set exact balance (rare — for admin/reset)
   ═══════════════════════════════════════════════════════════════ */
export async function setUserCredits(amount) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const safe = Math.max(0, Math.floor(amount));

    const { data: updated, error: updErr } = await supabase
      .from("user_credits")
      .upsert(
        {
          user_id: user.id,
          credits: safe,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("credits")
      .single();

    if (updErr) throw updErr;
    return updated?.credits ?? safe;
  } catch (err) {
    console.warn("setUserCredits failed:", err);
    return null;
  }
}