// src/lib/manualPayments.js — helpers for manual payment receipts + admin review
import { supabase } from "./supabase";
import { normalizePlanId } from "./plans";

/* ═══════════════════════════════════════════════════════════════
   PLAN MAPPING
   Your app uses:  free | seller | pro
   Your DB may use different values in subscriptions.plan_check.
   Adjust DB_PLAN_MAP once and everything else stays consistent.
   ═══════════════════════════════════════════════════════════════ */
const APP_PLANS = ["free", "seller", "pro"];

/**
 * Maps the app's plan id → the value your `subscriptions` table accepts.
 * ⚠️ If your DB constraint allows 'free','seller','pro' directly,
 *    you can leave this map as-is (identity map).
 */
const DB_PLAN_MAP = {
  free:   "free",
  seller: "seller",
  pro:    "pro",
};

/**
 * Clamp any incoming value to a valid app plan, then map to DB value.
 * Always returns a value safe to write into `subscriptions.plan`.
 */
const resolveDbPlan = (rawPlanId) => {
  const s = String(rawPlanId || "").toLowerCase().trim();
  const appPlan = APP_PLANS.includes(s) ? s : "seller";
  const dbPlan = DB_PLAN_MAP[appPlan] || APP_PLANS[1];
  if (!APP_PLANS.includes(s)) {
    console.warn(
      `[ManualPayments] unexpected plan "${rawPlanId}" → using "${appPlan}" (db: "${dbPlan}")`
    );
  }
  return { appPlan, dbPlan };
};

/* ═══════════════════════════════════════════════════════════════
   UPLOAD RECEIPT IMAGE
   ═══════════════════════════════════════════════════════════════ */
export const uploadReceiptImage = async (file, userId) => {
  if (!supabase) throw new Error("Supabase not configured.");
  if (!file) throw new Error("No file selected.");
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Max file size is 5 MB.");
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${userId || "anon"}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("receipts")
    .upload(path, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type,
    });

  if (upErr) {
    const msg = (upErr.message || "").toLowerCase();
    if (msg.includes("policy") || msg.includes("unauthorized")) {
      throw new Error("Upload blocked — please sign in and try again.");
    }
    if (msg.includes("bucket")) {
      throw new Error('Storage bucket "receipts" is missing.');
    }
    if (msg.includes("exceeded") || msg.includes("too large")) {
      throw new Error("File is too large. Max size is 5 MB.");
    }
    throw new Error(upErr.message || "Upload failed.");
  }

  const { data } = supabase.storage.from("receipts").getPublicUrl(path);
  return data?.publicUrl || null;
};

/* ═══════════════════════════════════════════════════════════════
   SAVE MANUAL PAYMENT — creates a PENDING row
   ═══════════════════════════════════════════════════════════════ */
export const saveManualPayment = async ({
  userId,
  userEmail,
  userName,
  plan,
  pack,
  method,
  receiptUrl,
  promoCode,
  promoDiscount,
  finalAmountPKR,
  activationCode,
}) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const now = new Date().toISOString();

const planId = normalizePlanId(
  plan
    ? { plan, pack_name: pack?.name, pack_credits: pack?.credits, price: pack?.pricePKR }
    : { plan: pack?.plan, pack_name: pack?.name, pack_credits: pack?.credits, price: pack?.pricePKR }
);

  const payload = {
    user_id: userId || null,
    user_email: userEmail || null,
    user_name: userName || null,
    plan: planId,
    pack_id: pack?.id || null,
    pack_name: pack?.name || null,
    pack_credits: Number(pack?.credits) || null,
    pack_price_pkr: Number(pack?.pricePKR) || null,
    pack_currency: pack?.currency || "PKR",
    pack_features: Array.isArray(pack?.features) ? pack.features : null,
    method: method || null,
    receipt_url: receiptUrl || null,
    promo_code: promoCode || null,
    promo_discount: Number(promoDiscount) || 0,
    final_amount_pkr: Number(finalAmountPKR) || 0,
    activation_code: activationCode || null,
    status: "pending",
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("manual_payments")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to save payment.");
  return data;
};

/* ═══════════════════════════════════════════════════════════════
   FETCH MANUAL PAYMENTS (admin) — all rows, newest first
   ═══════════════════════════════════════════════════════════════ */
export const fetchManualPayments = async () => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("manual_payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[ManualPayments] fetch error:", error.message);
    return [];
  }
  return data || [];
};

/* ═══════════════════════════════════════════════════════════════
   FETCH PENDING PAYMENTS ONLY (admin)
   ═══════════════════════════════════════════════════════════════ */
export const fetchPendingPayments = async () => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("manual_payments")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[ManualPayments] fetch pending error:", error.message);
    return [];
  }
  return data || [];
};

/* ═══════════════════════════════════════════════════════════════
   UPDATE STATUS (admin) — manual override
   ═══════════════════════════════════════════════════════════════ */
export const updateManualPaymentStatus = async (
  id,
  status,
  adminId,
  adminNote = ""
) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const { data, error } = await supabase
    .from("manual_payments")
    .update({
      status,
      admin_note: adminNote,
      reviewed_by: adminId || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to update.");
  return data;
};

/* ═══════════════════════════════════════════════════════════════
   DELETE PAYMENT (admin)
   ═══════════════════════════════════════════════════════════════ */
export const deleteManualPayment = async (id) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const { error } = await supabase
    .from("manual_payments")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message || "Failed to delete.");
  return true;
};

/* ═══════════════════════════════════════════════════════════════
   APPROVE PAYMENT (admin) — ATOMIC VIA RPC

   Single Postgres RPC does:
     1. Lock the payment row
     2. Verify it's still 'pending'
     3. Flip status → 'approved'
     4. Add pack_credits to user_credits
     5. Return { credits_added, new_balance }

   All in ONE transaction. If any step fails → nothing changes.

   ⭐ AFTER the RPC succeeds, this function ALSO syncs the plan to:
        - users.is_premium
        - subscriptions.plan
        - user_settings.plan_id

   Those post-RPC syncs are BEST-EFFORT: if any fail, credits are
   already added and the payment is already approved, so we log
   the failure and continue instead of throwing.
   ═══════════════════════════════════════════════════════════════ */
export const approveManualPayment = async (payment, adminId) => {
  if (!supabase) throw new Error("Supabase not configured.");
  if (!payment?.id) throw new Error("Missing payment id.");

  /* ─── 1. Atomic approval (credits added via RPC) ─── */
  const { data, error } = await supabase.rpc("admin_approve_payment", {
    p_payment_id: payment.id,
    p_admin_id: adminId || null,
  });

  if (error) {
    throw new Error(error.message || "Failed to approve payment.");
  }

  console.log("[ManualPayments] approval result:", data);

  /* ⭐ Resolve the plan the user actually paid for.
   Trust order:
     1. pack_name ("Pro Seller · Monthly" → pro)
     2. pack_credits (3 → pro, 1 → seller)
     3. payment.plan (legacy field — may be stale)
*/
const detectFromPackName = (name) => {
  const s = String(name || "").toLowerCase();
  if (s.includes("pro")) return "pro";
  if (s.includes("seller")) return "seller";
  if (s.includes("starter") || s.includes("free")) return "free";
  return null;
};

const planFromPackName = detectFromPackName(payment.pack_name);
const planFromCredits =
  Number(payment.pack_credits) >= 3 ? "pro" :
  Number(payment.pack_credits) >= 1 ? "seller" :
  null;
const planFromField = (() => {
  const s = String(payment.plan || "").toLowerCase().trim();
  return ["pro", "seller", "free"].includes(s) ? s : null;
})();

const rawPlanId = planFromPackName || planFromCredits || planFromField || "seller";

console.log("[ManualPayments] plan resolution:", {
  pack_name: payment.pack_name,
  pack_credits: payment.pack_credits,
  payment_plan: payment.plan,
  planFromPackName,
  planFromCredits,
  planFromField,
  chosen: rawPlanId,
});
  const { appPlan, dbPlan } = resolveDbPlan(rawPlanId);

  console.log("[ManualPayments] plan resolution:", {
    input: {
      plan: payment.plan,
      pack_name: payment.pack_name,
      pack_credits: payment.pack_credits,
      final_amount_pkr: payment.final_amount_pkr,
    },
    normalized: rawPlanId,
    appPlan,
    dbPlan,
  });

  const isPremium = appPlan !== "free";
  const now = new Date().toISOString();
  const oneYearFromNow = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString();

  /* ─── 3. Sync to users (best-effort) ─── */
  if (payment.user_id) {
    try {
      const { error: uErr } = await supabase
        .from("users")
        .update({
          is_premium: isPremium,
          premium_since: isPremium ? now : null,
          premium_code: payment.activation_code || `manual-${payment.id}`,
        })
        .eq("id", payment.user_id);
      if (uErr) console.warn("[ManualPayments] users update failed:", uErr.message);
    } catch (e) {
      console.warn("[ManualPayments] users update threw:", e);
    }
  }

  /* ─── 4. Sync to subscriptions (best-effort, uses dbPlan) ─── */
  if (payment.user_id) {
    try {
      const { error: sErr } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: payment.user_id,
            plan: dbPlan,                    // ⭐ DB-safe value
            status: "active",
            start_date: now,
            end_date: oneYearFromNow,
            payment_method: payment.method || "manual",
            updated_at: now,
          },
          { onConflict: "user_id" }
        );

      if (sErr) {
        console.warn("[ManualPayments] subscriptions upsert failed:", sErr.message);
        if (sErr.message?.includes("subscriptions_plan_check")) {
          console.error(
            `[ManualPayments] ⚠️ Plan "${dbPlan}" is not allowed by ` +
            `subscriptions_plan_check. Check your DB constraint, or update ` +
            `DB_PLAN_MAP in src/lib/manualPayments.js. Credits are safe.`
          );
        }
      }
    } catch (e) {
      console.warn("[ManualPayments] subscriptions upsert threw:", e);
    }
  }

  /* ─── 5. Sync to user_settings.plan_id (best-effort) ─── */
  if (payment.user_id) {
    try {
      const { error: setErr } = await supabase
        .from("user_settings")
        .update({ plan_id: appPlan })       // ⭐ app-level value
        .eq("user_id", payment.user_id);
      if (setErr) console.warn("[ManualPayments] user_settings update failed:", setErr.message);
    } catch (e) {
      console.warn("[ManualPayments] user_settings update threw:", e);
    }
  }

  /* ─── 6. Legacy monthly/yearly pack extension (best-effort) ─── */
  const packId = String(payment.pack_id || "").toLowerCase();
  if (payment.user_id && (packId === "monthly" || packId === "yearly")) {
    try {
      const endDate = new Date();
      if (packId === "monthly") endDate.setMonth(endDate.getMonth() + 1);
      else endDate.setFullYear(endDate.getFullYear() + 1);

      const { error: premErr } = await supabase
        .from("users")
        .update({
          is_premium: true,
          premium_since: now,
          premium_until: endDate.toISOString(),
        })
        .eq("id", payment.user_id);

      if (premErr) {
        console.warn(
          "[ManualPayments] legacy premium mark failed (credits still added):",
          premErr.message
        );
      }
    } catch (e) {
      console.warn("[ManualPayments] legacy premium mark threw:", e);
    }
  }

  return { ...data, plan: appPlan, dbPlan };
};

/* ═══════════════════════════════════════════════════════════════
   REJECT PAYMENT (admin) — ATOMIC
   Only flips pending → rejected. NO credits are added.
   ═══════════════════════════════════════════════════════════════ */
export const rejectManualPayment = async (payment, adminId, adminNote = "") => {
  if (!supabase) throw new Error("Supabase not configured.");
  if (!payment?.id) throw new Error("Missing payment id.");

  const now = new Date().toISOString();

  const { data: locked, error } = await supabase
    .from("manual_payments")
    .update({
      status: "rejected",
      admin_note: adminNote,
      reviewed_by: adminId || null,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to reject payment.");
  }
  if (!locked) {
    throw new Error(
      "Payment was already reviewed by someone else — refresh the page."
    );
  }

  return locked;
};

/* ═══════════════════════════════════════════════════════════════
   USER SIDE — fetch own payment history
   ═══════════════════════════════════════════════════════════════ */
export const fetchMyManualPayments = async (userId) => {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("manual_payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[ManualPayments] my fetch error:", error.message);
    return [];
  }
  return data || [];
};