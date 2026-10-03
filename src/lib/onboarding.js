// src/lib/onboarding.js — helpers for onboarding config + image upload + per-user tracking
import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════════════
//  DEFAULT INSTRUCTION CONTENT — full, modern, comprehensive
// ═══════════════════════════════════════════════════════════════
export const DEFAULT_SECTIONS = [
  {
    heading: "1. Welcome to APNa Deal",
    body: "You're now part of Pakistan's fastest-growing marketplace. Whether you're buying or selling, our platform is built to be simple, safe, and fast. Most items sell within 3–4 days. Take a moment to read these guidelines so you get the best experience.",
  },
  {
    heading: "2. Be Honest & Accurate",
    body: "Every listing must be genuine. Use real photos of the actual item you're selling. Do not exaggerate conditions, hide defects, or post stock images from the internet. Fake or misleading ads are removed immediately and repeat offenders are permanently banned.",
  },
  {
    heading: "3. Verified Sellers Only",
    body: "Only verified sellers can post ads on APNa Deal. Every seller goes through ID verification. When buying, always look for the green Verified badge on the seller's profile and listing. If a seller isn't verified, do not proceed with the transaction.",
  },
  {
    heading: "4. Safe Payments & Escrow",
    body: "Always prefer our secure escrow system — we hold your payment safely until you confirm you've received the item. Never send money in advance to unknown sellers. APNa Deal is not responsible for off-platform transactions (bank transfers, cash, or WhatsApp deals made outside our system).",
  },
  {
    heading: "5. Chat Etiquette & Respect",
    body: "Our chat is for buying and selling only. Do not harass, spam, or send abusive messages. Do not share other users' personal data. Keep conversations relevant and professional. Users who violate this will have their chat access suspended.",
  },
  {
    heading: "6. Prohibited Items",
    body: "The following are strictly forbidden and will result in an immediate ban: weapons, ammunition, drugs, prescription medicine, stolen goods, counterfeit or fake branded products, adult content, live animals, human body parts, personal data or documents, and any illegal services.",
  },
  {
    heading: "7. Fair Pricing & No Hidden Charges",
    body: "Keep your prices reasonable and clearly list everything included in the sale. Mention any defects, missing parts, or repair history upfront. Do not add hidden charges after a buyer agrees to your listed price. Deceptive pricing is a bannable offense.",
  },
  {
    heading: "8. Photo & Listing Quality",
    body: "Upload clear, well-lit photos from multiple angles. Avoid blurry images, heavy filters, or photos that don't match the actual item. Our AI tools help clean backgrounds and improve lighting — use them. Better photos sell up to 3x faster.",
  },
  {
    heading: "9. Meeting in Person Safely",
    body: "For local deals, meet in a public place — a busy market, shopping mall, or police station parking lot. Bring a friend if possible. Do not invite strangers to your home for the first meeting. Trust your instincts — if something feels wrong, walk away.",
  },
  {
    heading: "10. Report Violations",
    body: "If you see a suspicious listing, a scam attempt, or inappropriate behavior — report it immediately using the report button or our support chat. Reports are reviewed within hours. Your identity stays confidential. Reporting keeps our community safe.",
  },
  {
    heading: "11. Your Data & Privacy",
    body: "We never sell your data to third parties. Your contact information is only shared with a buyer or seller after you approve a chat request. You can delete your account and all associated data at any time from your settings page.",
  },
  {
    heading: "12. Have Questions?",
    body: "Our support team is available 24/7 through the in-app chat. If you're stuck with posting an ad, verifying your account, or resolving a payment issue — just message us. We usually respond within a few minutes.",
  },
];

// ═══════════════════════════════════════════════════════════════
//  DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════
export const DEFAULT_CONFIG = {
  enabled: false,
  mode: "text",
  title: "Welcome to APNa Deal",
  subtitle:
    "Please read our guidelines before you continue. By using the platform you agree to the rules below.",
  sections: DEFAULT_SECTIONS,
  image_url: null,
  cta_label: "I Understand & Agree",
  auto_show_delay: 3000,
  version: 1,
  wizard_enabled: false,
  wizard: [],
};

// ═══════════════════════════════════════════════════════════════
//  FETCH — read the config from Supabase
// ═══════════════════════════════════════════════════════════════
export const fetchOnboardingConfig = async () => {
  if (!supabase) return DEFAULT_CONFIG;

  try {
    const { data, error } = await supabase
      .from("onboarding_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.warn("[Onboarding] Fetch error:", error.message);
      return DEFAULT_CONFIG;
    }
    if (!data) return DEFAULT_CONFIG;

    return {
      ...DEFAULT_CONFIG,
      ...data,
      sections:
        Array.isArray(data.sections) && data.sections.length > 0
          ? data.sections
          : DEFAULT_SECTIONS,
      wizard:
        data.wizard_enabled &&
        Array.isArray(data.wizard) &&
        data.wizard.length > 0
          ? data.wizard
          : [],
    };
  } catch (err) {
    console.warn("[Onboarding] Fetch exception:", err);
    return DEFAULT_CONFIG;
  }
};

// ═══════════════════════════════════════════════════════════════
//  SAVE — update the config in Supabase
// ═══════════════════════════════════════════════════════════════
export const saveOnboardingConfig = async (patch, userId) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const payload = {
    enabled: !!patch.enabled,
    wizard_enabled: !!patch.wizard_enabled,
    mode: patch.mode === "image" ? "image" : "text",
    title: patch.title ?? DEFAULT_CONFIG.title,
    subtitle: patch.subtitle ?? DEFAULT_CONFIG.subtitle,
    sections: Array.isArray(patch.sections) ? patch.sections : DEFAULT_SECTIONS,
    wizard:
      patch.wizard_enabled &&
      Array.isArray(patch.wizard) &&
      patch.wizard.length > 0
        ? patch.wizard
        : [],
    image_url: patch.image_url || null,
    cta_label: patch.cta_label || DEFAULT_CONFIG.cta_label,
    auto_show_delay: Math.max(0, Number(patch.auto_show_delay) || 3000),
    version: Math.max(1, Number(patch.version) || 1),
    updated_at: new Date().toISOString(),
    updated_by: userId || null,
  };

  try {
    const { data: adminCheck } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!adminCheck) {
      throw new Error(
        "Your account is not in the admins table. Add your user_id to 'admins' in Supabase."
      );
    }
  } catch (err) {
    console.warn("[Onboarding] Admin check skipped:", err?.message);
  }

  const { data, error } = await supabase
    .from("onboarding_config")
    .update(payload)
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116" || !data) {
      throw new Error(
        "Update blocked by RLS — your user_id isn't in the admins table."
      );
    }
    throw new Error(error.message || "Failed to save.");
  }

  if (!data) {
    throw new Error(
      "Update was blocked — check that you're in the admins table."
    );
  }

  return data;
};

// ═══════════════════════════════════════════════════════════════
//  UPLOAD — send an onboarding image to Supabase Storage
// ═══════════════════════════════════════════════════════════════
export const uploadOnboardingImage = async (file) => {
  if (!supabase) throw new Error("Supabase not configured.");
  if (!file) throw new Error("No file selected.");

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Max file size is 5MB.");
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `onboarding-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("onboarding")
    .upload(path, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type,
    });

  if (upErr) {
    if (upErr.message?.toLowerCase().includes("policy")) {
      throw new Error(
        "Upload blocked — your account isn't an admin in Supabase."
      );
    }
    throw new Error(upErr.message || "Upload failed.");
  }

  const { data } = supabase.storage.from("onboarding").getPublicUrl(path);
  return data?.publicUrl || null;
};

// ═══════════════════════════════════════════════════════════════
//  PER-USER ONBOARDING TRACKING
// ═══════════════════════════════════════════════════════════════

export const hasUserSeenOnboarding = async (userId) => {
  if (!supabase || !userId) return false;
  try {
    const { data, error } = await supabase
      .from("user_onboarding_status")
      .select("wizard_done, seen_version")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[Onboarding] status fetch error:", error.message);
      return false;
    }
    if (!data) return false;

    return !!data.wizard_done;
  } catch (err) {
    console.warn("[Onboarding] status exception:", err);
    return false;
  }
};

export const markUserSeenOnboarding = async (userId, version = 1) => {
  if (!supabase || !userId) return false;
  try {
    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      wizard_done: true,
      wizard_done_at: now,
      instructions_done: true,
      instructions_done_at: now,
      seen_version: Number(version) || 1,
    };

    const { error } = await supabase
      .from("user_onboarding_status")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.warn("[Onboarding] mark seen error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Onboarding] mark seen exception:", err);
    return false;
  }
};

export const resetUserOnboarding = async (userId) => {
  if (!supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from("user_onboarding_status")
      .delete()
      .eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════
//  SMALL HELPERS
// ═══════════════════════════════════════════════════════════════
export const createEmptySection = () => ({
  heading: "New Section",
  body: "",
});

export const isOnboardingConfigured = (config) => {
  if (!config) return false;
  if (!config.enabled) return false;
  if (config.mode === "image") return !!config.image_url;
  return Array.isArray(config.sections) && config.sections.length > 0;
};

// ═══════════════════════════════════════════════════════════════
//  OPTIONAL DEFAULT EXPORT (so both import styles work)
//  This is what was probably breaking your build — the file had
//  ONLY a default export, hiding the named ones above.
// ═══════════════════════════════════════════════════════════════
const onboarding = {
  DEFAULT_SECTIONS,
  DEFAULT_CONFIG,
  fetchOnboardingConfig,
  saveOnboardingConfig,
  uploadOnboardingImage,
  hasUserSeenOnboarding,
  markUserSeenOnboarding,
  resetUserOnboarding,
  createEmptySection,
  isOnboardingConfigured,
};

export default onboarding;