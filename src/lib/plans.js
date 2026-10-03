// src/lib/plans.js — Single source of truth for all plan limits & features
// ⭐ Every logged-in user defaults to "free". No manual selection needed.

export const PLAN_IDS = {
  FREE: "free",
  SELLER: "seller",
  PRO: "pro",
};

export const PLANS = {
  free: {
    id: "free",
    name: "Starter",
    tagline: "Perfect to explore the marketplace",
    priceMonthly: 0,
    priceYearly: 0,
    icon: "rocket",
    popular: false,
    isFree: true,
    limits: {
listings: 5,
      aiImages: 3,
      aiVideoSeconds: 0,
      featuredBoosts: 0,
      chatThreads: 20,
      imageCleanPerMonth: 5,
      analytics: false,
      verifiedBadge: false,
      goldBadge: false,
      prioritySupport: false,
    },
 features: [
  { title: "5 Active Listings",     desc: "Post up to 5 items at once — grow your presence." },
  { title: "3 AI Images / month",   desc: "Try NanoBanana image generation." },
  { title: "Live Seller Chat",      desc: "Message buyers and sellers in real time." },
  { title: "Social Feed",           desc: "Post, like, comment and share." },
  { title: "Escrow Checkout",       desc: "Safe payments on every confirmed deal." },
],
  },

  seller: {
    id: "seller",
    name: "Seller",
    tagline: "For serious sellers who want more reach",
    priceMonthly: 500,
    priceYearly: 5000,
    icon: "bolt",
    popular: true,
    isFree: false,
    limits: {
      listings: 30,
      aiImages: 30,
      aiVideoSeconds: 30,
      featuredBoosts: 1,
      chatThreads: Infinity,
      imageCleanPerMonth: 50,
      analytics: false,
      verifiedBadge: true,
      goldBadge: false,
      prioritySupport: false,
    },
    features: [
      { title: "30 Active Listings",        desc: "6× more than the free plan." },
      { title: "30 AI Images / month",      desc: "Clean product photos without effort." },
      { title: "1 Featured Boost / month",  desc: "Top of category for 7 days." },
      { title: "Verified Seller Badge",     desc: "Build trust with every buyer." },
      { title: "Background Remover",        desc: "One-click cut-outs for any item." },
      { title: "Escrow Protection",         desc: "Safe payments on every deal." },
    ],
  },

  pro: {
    id: "pro",
    name: "Pro Seller",
    tagline: "For power sellers and dealers",
    priceMonthly: 1500,
    priceYearly: 15000,
    icon: "crown",
    popular: false,
    isFree: false,
    limits: {
      listings: Infinity,
      aiImages: 200,
      aiVideoSeconds: 120,
      featuredBoosts: 4,
      chatThreads: Infinity,
      imageCleanPerMonth: Infinity,
      analytics: true,
      verifiedBadge: true,
      goldBadge: true,
      prioritySupport: true,
    },
    features: [
      { title: "Unlimited Listings",        desc: "No caps — list your whole inventory." },
      { title: "200 AI Images / month",     desc: "Full AI Studio access for your store." },
      { title: "4 Featured Boosts / month", desc: "Stay at the top of your category." },
      { title: "Listing Analytics",         desc: "See views, clicks, chats and conversions." },
      { title: "Priority Support",          desc: "Chat with a human within minutes." },
      { title: "Gold Business Badge",       desc: "Stand out as a verified dealer." },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

// Get plan object from a raw plan id (falls back to free)
export const getPlan = (planId) => {
  const key = String(planId || "free").toLowerCase().trim();
  return PLANS[key] || PLANS.free;
};

// Read a specific limit
export const getLimit = (planId, key) => {
  const plan = getPlan(planId);
  return plan.limits[key];
};

// Check a boolean feature
export const hasFeature = (planId, key) => {
  const plan = getPlan(planId);
  return Boolean(plan.limits[key]);
};

/* ⭐ Normalize ANY input into a valid plan id: 'free' | 'seller' | 'pro'
   Handles:
     - explicit plan ids: "pro", "PRO", " pro "
     - pack names:        "Pro Seller", "Advanced", "Premium", "Elite", "Gold"
     - pack-like names:   "100 Credits", "500 Credits", "Advanced Plan"
     - numeric credits:   { credits: 500 } or { pack_credits: 500 }
     - price in PKR:      { price: 1500 } or { final_amount_pkr: 1500 }
   Always returns one of: "free" | "seller" | "pro"
   Never returns null / undefined.
*/
export const normalizePlanId = (input) => {
  // ── 1. Coerce input to string + numeric hints ──
  let rawString = "";
  let credits = 0;
  let price = 0;

  if (typeof input === "string") {
    rawString = input;
  } else if (input && typeof input === "object") {
    rawString = input.plan || input.planId || input.pack_name || input.name || "";
    credits   = Number(input.pack_credits ?? input.credits ?? 0);
    price     = Number(
      input.final_amount_pkr ??
      input.amount_pkr ??
      input.pricePKR ??
      input.priceMonthly ??
      input.price ??
      0
    );
  }

  const s = String(rawString).toLowerCase().trim();

  // ── 2. Exact plan id match ──
  if (s === "pro" || s === "seller" || s === "free") return s;

  // ── 3. Keyword match — word boundaries so "processing" ≠ "pro" ──
  if (/(^|[^a-z])(pro|advanced|advance|premium|elite|gold|deluxe|vip|business)([^a-z]|$)/i.test(s)) {
    return "pro";
  }
  if (/(^|[^a-z])(seller|standard|plus|basic|starter|silver)([^a-z]|$)/i.test(s)) {
    return "seller";
  }
  if (/(^|[^a-z])(free|trial)([^a-z]|$)/i.test(s)) {
    return "free";
  }

  // ── 4. Credits threshold ──
  if (credits >= 500) return "pro";
  if (credits >= 1)   return "seller";

  // ── 5. Price threshold (PKR) ──
  if (price >= 1500) return "pro";
  if (price >= 1)    return "seller";

  // ── 6. Default ──
  return "free";
};

/* ⭐ Same as normalizePlanId but returns the full plan object */
export const normalizePlan = (input) => {
  return getPlan(normalizePlanId(input));
};