// src/lib/adminSettings.js
// ─────────────────────────────────────────────────────────────
// Persist admin email assets (hero + logo) across sessions
// ─────────────────────────────────────────────────────────────
import { supabase } from "./supabase";

const TABLE = "admin_settings";
const BUCKET = "email-assets";

const HERO_KEY = "email_hero_image";
const LOGO_KEY = "email_logo_image";
const HERO_HISTORY_KEY = "email_hero_history";
const LOGO_HISTORY_KEY = "email_logo_history";
const MAX_HISTORY = 12;

async function getSetting(key, fallback = null) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.warn(`[adminSettings] get "${key}" error:`, error.message);
      return fallback;
    }
    if (!data) return fallback;
    return data.value ?? fallback;
  } catch (err) {
    console.warn(`[adminSettings] get "${key}" failed:`, err);
    return fallback;
  }
}

async function setSetting(key, value, userId) {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
          updated_by: userId || null,
        },
        { onConflict: "key" }
      );
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`[adminSettings] set "${key}" failed:`, err);
    throw err;
  }
}

/* HERO */
export async function getHeroImage() {
  const val = await getSetting(HERO_KEY, "");
  return typeof val === "string" ? val : "";
}
export async function setHeroImage(url, userId) {
  await setSetting(HERO_KEY, url || "", userId);
}

/* LOGO */
export async function getLogoImage() {
  const val = await getSetting(LOGO_KEY, "");
  return typeof val === "string" ? val : "";
}
export async function setLogoImage(url, userId) {
  await setSetting(LOGO_KEY, url || "", userId);
}

/* HERO HISTORY */
export async function getHeroHistory() {
  const val = await getSetting(HERO_HISTORY_KEY, []);
  return Array.isArray(val) ? val : [];
}
export async function addToHeroHistory(url, userId) {
  if (!url) return;
  try {
    const history = await getHeroHistory();
    const updated = [url, ...history.filter((u) => u !== url)].slice(0, MAX_HISTORY);
    await setSetting(HERO_HISTORY_KEY, updated, userId);
  } catch (err) {
    console.warn("[adminSettings] addToHeroHistory failed:", err);
  }
}

/* LOGO HISTORY */
export async function getLogoHistory() {
  const val = await getSetting(LOGO_HISTORY_KEY, []);
  return Array.isArray(val) ? val : [];
}
export async function addToLogoHistory(url, userId) {
  if (!url) return;
  try {
    const history = await getLogoHistory();
    const updated = [url, ...history.filter((u) => u !== url)].slice(0, MAX_HISTORY);
    await setSetting(LOGO_HISTORY_KEY, updated, userId);
  } catch (err) {
    console.warn("[adminSettings] addToLogoHistory failed:", err);
  }
}

/* UPLOAD */
export async function uploadEmailAsset(file, prefix = "asset") {
  if (!file) throw new Error("No file provided");

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext : "png";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `${prefix}-${unique}.${safeExt}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || "image/png",
    });

  if (uploadErr) {
    console.error("[adminSettings] upload error:", uploadErr);
    throw new Error(uploadErr.message || "Upload failed");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error("Failed to generate public URL");

  return publicUrl;
}

export async function deleteEmailAsset(publicUrl) {
  if (!publicUrl) return false;
  try {
    const parts = publicUrl.split("/");
    const fileName = parts[parts.length - 1];
    if (!fileName) return false;
    const { error } = await supabase.storage.from(BUCKET).remove([fileName]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("[adminSettings] deleteEmailAsset failed:", err);
    return false;
  }
}