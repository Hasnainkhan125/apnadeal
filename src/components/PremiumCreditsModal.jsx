// src/components/PremiumCreditsModal.jsx
// ⭐ Brand color: #e66000
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaCheck, FaBolt, FaCrown, FaSpinner,
  FaArrowLeft, FaLock, FaInfoCircle, FaStar,
  FaShieldAlt, FaUndo, FaCreditCard, FaCoins,
} from "react-icons/fa";
import ManualPaymentModal from "./ManualPaymentModal";
import { supabase } from "../lib/supabase";

/* ═══════════════════════════════════════════════════════════════
   MEDIA QUERY HOOK
   ═══════════════════════════════════════════════════════════════ */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    m.addEventListener
      ? m.addEventListener("change", onChange)
      : m.addListener(onChange);
    return () => {
      m.removeEventListener
        ? m.removeEventListener("change", onChange)
        : m.removeListener(onChange);
    };
  }, [query]);
  return matches;
};

/* ═══════════════════════════════════════════════════════════════
   CURRENCY
   ═══════════════════════════════════════════════════════════════ */
const PKR_TO_USD = 1 / 278;

const formatPrice = (pricePKR, currency = "PKR") => {
  if (currency === "USD") {
    const usd = pricePKR * PKR_TO_USD;
    return `$${usd.toFixed(2)}`;
  }
  return `PKR ${Number(pricePKR || 0).toLocaleString()}`;
};

const CREDIT_RATE = 10; // 10 credits = 100 PKR

/* ═══════════════════════════════════════════════════════════════
   MEMBERSHIP PLANS
   ═══════════════════════════════════════════════════════════════ */
const MEMBERSHIP_PLANS = [
  {
    id: "monthly",
    name: "Advanced",
    pricePKR: 3700,
    billedNote: "Billed monthly",
    creditsLine: "Unlimited contacts",
    subCreditsLine: "1000 Credits per month",
    credits: 1000,
    yearlyPricePKR: 31080,
    yearlySavingsBadge: "Save PKR 13,320",
    features: [
      { label: "AI Image Generation", desc: "Create stunning product photos and mockups with NanoBanana-powered AI in seconds." },
      { label: "AI Background Removal", desc: "Instantly remove or replace backgrounds on any listing photo — perfect for clean product shots." },
      { label: "AI Image to Image", desc: "Transform existing photos into new variations, styles, or scenes with a single prompt." },
      { label: "Unlimited AI Chat", desc: "Chat with buyers and sellers 24/7 with AI-assisted replies, translations and smart suggestions." },
      { label: "Unlimited Social Posts", desc: "Post unlimited listings, updates and offers to the social feed — no daily caps." },
      { label: "Unlimited Ad Posts", desc: "Add unlimited products across vehicles, mobiles, property, electronics & more." },
    ],
  },
  {
    id: "yearly",
    name: "Advanced",
    pricePKR: 3700,
    billedNote: "Billed yearly",
    creditsLine: "Unlimited contacts",
    subCreditsLine: "1000 Credits per month",
    credits: 12000,
    yearlyPricePKR: 31080,
    yearlySavingsBadge: "Save PKR 13,320",
    features: [
      { label: "AI Image Generation", desc: "Create stunning product photos and mockups with NanoBanana-powered AI in seconds." },
      { label: "AI Background Removal", desc: "Instantly remove or replace backgrounds on any listing photo — perfect for clean product shots." },
      { label: "AI Image to Image", desc: "Transform existing photos into new variations, styles, or scenes with a single prompt." },
      { label: "Unlimited AI Chat", desc: "Chat with buyers and sellers 24/7 with AI-assisted replies, translations and smart suggestions." },
      { label: "Unlimited Social Posts", desc: "Post unlimited listings, updates and offers to the social feed — no daily caps." },
      { label: "Unlimited Ad Posts", desc: "Add unlimited products across vehicles, mobiles, property, electronics & more." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   THEME HOOK — brand #e66000
   ═══════════════════════════════════════════════════════════════ */
const useThemeTokens = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("theme-light") ? "light" : "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const isLight = theme === "light";

  const T = isLight
    ? {
        backdrop: "rgba(15,15,20,0.55)",
        shellBg: "#FFFFFF",
        shellBorder: "rgba(20,20,30,0.06)",
        shellShadow: "0 40px 100px -20px rgba(0,0,0,0.22), 0 4px 12px -4px rgba(0,0,0,0.06)",
        title: "#0E1116",
        subtitle: "#6B7280",
        txt: "#0E1116",
        txtSoft: "rgba(20,20,30,0.62)",
        txtFaint: "rgba(20,20,30,0.42)",
        line: "rgba(20,20,30,0.08)",
        lineStrong: "rgba(20,20,30,0.16)",
        surface: "rgba(0,0,0,0.035)",
        surfaceHover: "rgba(0,0,0,0.06)",
        closeBg: "rgba(0,0,0,0.05)",
        closeBgHover: "rgba(0,0,0,0.10)",
        closeBorder: "rgba(20,20,30,0.10)",
        primary: "#e66000",
        brandGradient: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
        brandGlow: "0 14px 34px -12px rgba(230,96,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
        success: "#16a34a",
        /* ⭐ Hero — brand-tinted dark gradient */
        heroBg: "#2A0F00",
        heroBg2: "#0A0A12",
        heroTxt: "#FFFFFF",
        heroTxtSoft: "rgba(255,255,255,0.68)",
        heroLine: "rgba(255,255,255,0.10)",
        heroSurface: "rgba(255,255,255,0.06)",
        heroAccent: "#ff7a1a",
        heroAccentSoft: "rgba(255,122,26,0.14)",
        heroAccentBorder: "rgba(255,122,26,0.30)",
        inputBg: "#F8F9FB",
        inputBorder: "rgba(20,20,30,0.10)",
      }
    : {
        backdrop: "rgba(0,0,0,0.72)",
        shellBg: "#0B0B0F",
        shellBorder: "rgba(255,255,255,0.06)",
        shellShadow: "0 40px 100px -20px rgba(0,0,0,0.85), 0 4px 12px -4px rgba(0,0,0,0.5)",
        title: "#FFFFFF",
        subtitle: "rgba(255,255,255,0.65)",
        txt: "#FFFFFF",
        txtSoft: "rgba(255,255,255,0.65)",
        txtFaint: "rgba(255,255,255,0.44)",
        line: "rgba(255,255,255,0.08)",
        lineStrong: "rgba(255,255,255,0.15)",
        surface: "rgba(255,255,255,0.045)",
        surfaceHover: "rgba(255,255,255,0.08)",
        closeBg: "rgba(255,255,255,0.06)",
        closeBgHover: "rgba(255,255,255,0.14)",
        closeBorder: "rgba(255,255,255,0.12)",
        primary: "#e66000",
        brandGradient: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
        brandGlow: "0 14px 34px -12px rgba(230,96,0,0.65), inset 0 1px 0 rgba(255,255,255,0.25)",
        success: "#4ade80",
        /* ⭐ Hero — brand-tinted dark gradient */
        heroBg: "#2A0F00",
        heroBg2: "#0A0A12",
        heroTxt: "#FFFFFF",
        heroTxtSoft: "rgba(255,255,255,0.68)",
        heroLine: "rgba(255,255,255,0.10)",
        heroSurface: "rgba(255,255,255,0.06)",
        heroAccent: "#ff7a1a",
        heroAccentSoft: "rgba(255,122,26,0.14)",
        heroAccentBorder: "rgba(255,122,26,0.30)",
        inputBg: "#16161C",
        inputBorder: "rgba(255,255,255,0.10)",
      };

  return { T, isLight };
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function PremiumCreditsModal({
  isOpen,
  onClose,
  onSubscribe,
  onBuyCredits,
  userCredits = 0,
  user = null,
}) {
  const { T, isLight } = useThemeTokens();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmallMobile = useMediaQuery("(max-width: 600px)");

  const [internalUser, setInternalUser] = useState(null);
  const effectiveUser = user || internalUser;

  const [tab, setTab] = useState("membership");
  const [currency, setCurrency] = useState("PKR");
  const [selectedMembership, setSelectedMembership] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");

  const [manualCredits, setManualCredits] = useState(600);
  const [billedYearly, setBilledYearly] = useState(false);

  const [showManualPay, setShowManualPay] = useState(false);
  const [pendingPack, setPendingPack] = useState(null);
  const [isBuying, setIsBuying] = useState(false);

  const [dbAvatar, setDbAvatar] = useState(null);
  const [dbName, setDbName] = useState(null);
  const [dbEmail, setDbEmail] = useState(null);
  const [avatarErrored, setAvatarErrored] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!cancelled) setInternalUser(u || null);
      } catch (err) {
        console.warn("[Premium] getUser error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, user]);

  const avatarUrl = useMemo(() => {
    if (avatarErrored) return null;
    const meta = effectiveUser?.user_metadata || {};
    return (
      dbAvatar ||
      effectiveUser?.avatar_url ||
      effectiveUser?.avatar ||
      effectiveUser?.profile_image ||
      effectiveUser?.picture ||
      meta.avatar_url ||
      meta.avatar ||
      meta.picture ||
      meta.image ||
      null
    );
  }, [dbAvatar, effectiveUser, avatarErrored]);

  const displayName = useMemo(() => {
    const meta = effectiveUser?.user_metadata || {};
    return (
      dbName ||
      effectiveUser?.name ||
      effectiveUser?.full_name ||
      meta.full_name ||
      meta.name ||
      meta.display_name ||
      effectiveUser?.email?.split("@")[0] ||
      "User"
    );
  }, [dbName, effectiveUser]);

  const displayEmail = useMemo(() => {
    const meta = effectiveUser?.user_metadata || {};
    return (
      dbEmail ||
      effectiveUser?.email ||
      meta.email ||
      "no-email@apnadeal.com"
    );
  }, [dbEmail, effectiveUser]);

  const userInitial = (displayName || "A").trim().charAt(0).toUpperCase();

  const manualPrice = useMemo(() => manualCredits * CREDIT_RATE, [manualCredits]);

  const totalDue = useMemo(() => {
    const p = MEMBERSHIP_PLANS.find((x) => x.id === selectedMembership);
    if (tab === "credits") return manualPrice;
    if (billedYearly) return p?.yearlyPricePKR || 0;
    return p?.pricePKR || 0;
  }, [tab, manualPrice, selectedMembership, billedYearly]);

  const selectedMembershipPlan = MEMBERSHIP_PLANS.find(
    (p) => p.id === selectedMembership
  );

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: s } = await supabase
          .from("user_settings")
          .select("full_name, avatar, email")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (s?.avatar) setDbAvatar(s.avatar);
        if (s?.full_name) setDbName(s.full_name);
        if (s?.email) setDbEmail(s.email);
      } catch (err) {
        console.warn("[Premium] user_settings load:", err);
      }

      if (!cancelled) {
        try {
          const { data: u } = await supabase
            .from("users")
            .select("name, full_name, avatar_url, avatar, email")
            .eq("id", user.id)
            .maybeSingle();
          if (cancelled) return;
          if (!dbAvatar && (u?.avatar_url || u?.avatar)) {
            setDbAvatar(u.avatar_url || u.avatar);
          }
          if (!dbName && (u?.full_name || u?.name)) {
            setDbName(u.full_name || u.name);
          }
          if (!dbEmail && u?.email) {
            setDbEmail(u.email);
          }
        } catch (err) {
          console.warn("[Premium] users load:", err);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]);

  useEffect(() => {
    setAvatarErrored(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsBuying(false);
      setShowManualPay(false);
      setPendingPack(null);
    }
  }, [isOpen]);

  const handleBuyNow = async () => {
    setIsBuying(true);
    await new Promise((r) => setTimeout(r, 350));

    const shaped = {
      id: tab === "credits" ? `credits-${manualCredits}` : selectedMembership,
      credits:
        tab === "credits"
          ? manualCredits
          : MEMBERSHIP_PLANS.find((p) => p.id === selectedMembership)?.credits || 0,
      name:
        tab === "credits"
          ? `${manualCredits.toLocaleString()} Credits`
          : MEMBERSHIP_PLANS.find((p) => p.id === selectedMembership)?.name ||
            "Membership",
      price: formatPrice(totalDue, currency),
      pricePKR: totalDue,
      currency,
      paymentMethod,
    };

    setPendingPack(shaped);
    setShowManualPay(true);
    setIsBuying(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              style={{
                position: "fixed", inset: 0,
                background: T.backdrop,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 1000,
              }}
            />

            <div
              key="center-wrapper"
              style={{
                position: "fixed", inset: 0,
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "center",
                padding: isSmallMobile ? 8 : isMobile ? 12 : 24,
                zIndex: 1001,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "relative",
                  width: "min(1100px, 100%)",
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 48px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                  borderRadius: isSmallMobile ? 20 : 28,
                  background: T.shellBg,
                  border: `1px solid ${T.shellBorder}`,
                  boxShadow: T.shellShadow,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  color: T.title,
                  pointerEvents: "auto",
                  boxSizing: "border-box",
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                }}
              >
                {/* ═══════════ LEFT PANEL — Hero (brand #e66000 tint) ═══════════ */}
                <div
                  style={{
                    position: "relative",
                    padding: isSmallMobile ? "28px 22px" : isMobile ? "32px 26px" : "44px 40px",
                    background: `linear-gradient(165deg, ${T.heroBg} 0%, ${T.heroBg2} 100%)`,
                    color: T.heroTxt,
                    display: "flex",
                    flexDirection: "column",
                    gap: 26,
                    overflow: "hidden",
                    borderTopLeftRadius: isMobile ? 20 : 28,
                    borderTopRightRadius: isMobile ? 20 : 0,
                    borderBottomLeftRadius: isMobile ? 0 : 28,
                    minHeight: isMobile ? "auto" : "100%",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -80, right: -80,
                      width: 300, height: 300,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(230,96,0,0.28) 0%, transparent 70%)",
                      filter: "blur(40px)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: -100, left: -60,
                      width: 260, height: 260,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(255,122,26,0.18) 0%, transparent 70%)",
                      filter: "blur(40px)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                      opacity: 0.5,
                      pointerEvents: "none",
                      maskImage: "radial-gradient(ellipse at top right, black 30%, transparent 75%)",
                      WebkitMaskImage: "radial-gradient(ellipse at top right, black 30%, transparent 75%)",
                    }}
                  />

                  {isMobile && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Back"
                      style={{
                        position: "relative", zIndex: 2,
                        width: 40, height: 40,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "#fff",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "flex-start",
                      }}
                    >
                      <FaArrowLeft style={{ fontSize: 14 }} />
                    </button>
                  )}

                  <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 42, height: 42,
                        borderRadius: 12,
                        background: "#FFFFFF",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 20px -6px rgba(0,0,0,0.45)",
                      }}
                    >
                      <FaCrown style={{ color: "#e66000", fontSize: 18 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                        APNa Deal
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: T.heroTxtSoft, marginTop: 2 }}>
                        Kling Ai
                      </div>
                    </div>
                  </div>

                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ fontSize: 12.5, color: T.heroTxtSoft, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>
                      {tab === "credits" ? "Credit pack" : `Subscribe to ${selectedMembershipPlan?.name}`}
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
                      <div
                        style={{
                          fontSize: isSmallMobile ? 44 : 56,
                          fontWeight: 900,
                          letterSpacing: "-0.045em",
                          lineHeight: 0.95,
                          color: "#FFFFFF",
                          fontVariantNumeric: "tabular-nums",
                          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        }}
                      >
                        {currency === "USD"
                          ? formatPrice(totalDue, "USD")
                          : `PKR ${Number(totalDue || 0).toLocaleString()}`}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: T.heroTxtSoft,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          paddingBottom: 6,
                        }}
                      >
                        {tab === "credits"
                          ? "one-time"
                          : billedYearly
                          ? "per year"
                          : "per month"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 14,
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: T.heroAccentSoft,
                        border: `1px solid ${T.heroAccentBorder}`,
                      }}
                    >
                      <FaCoins style={{ color: T.heroAccent, fontSize: 12 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.heroAccent, letterSpacing: "0.01em" }}>
                        {tab === "credits"
                          ? `${manualCredits.toLocaleString()} credits`
                          : `${selectedMembershipPlan?.creditsLine} · ${selectedMembershipPlan?.subCreditsLine}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 900,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: T.heroTxtSoft,
                        marginBottom: 14,
                      }}
                    >
                      What's included
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {tab === "membership" &&
                        (selectedMembershipPlan?.features || []).map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <span
                              style={{
                                flexShrink: 0,
                                width: 22, height: 22,
                                borderRadius: "50%",
                                background: T.heroAccentSoft,
                                border: `1px solid ${T.heroAccentBorder}`,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 1,
                              }}
                            >
                              <FaCheck style={{ color: T.heroAccent, fontSize: 9 }} />
                            </span>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.005em", lineHeight: 1.35, marginBottom: 3 }}>
                                {f.label}
                              </div>
                              <div style={{ fontSize: 11.5, color: T.heroTxtSoft, lineHeight: 1.55, fontWeight: 500 }}>
                                {f.desc}
                              </div>
                            </div>
                          </div>
                        ))}

                      {tab === "credits" && (
                        <>
                          <FeatureRow
                            heroAccent={T.heroAccent}
                            heroAccentSoft={T.heroAccentSoft}
                            heroAccentBorder={T.heroAccentBorder}
                            heroTxtSoft={T.heroTxtSoft}
                            label="Instant delivery"
                            desc="Credits are added to your account immediately after verification."
                          />
                          <FeatureRow
                            heroAccent={T.heroAccent}
                            heroAccentSoft={T.heroAccentSoft}
                            heroAccentBorder={T.heroAccentBorder}
                            heroTxtSoft={T.heroTxtSoft}
                            label="Valid for 2 years"
                            desc="Use them anytime across all AI features on APNa Deal."
                          />
                          <FeatureRow
                            heroAccent={T.heroAccent}
                            heroAccentSoft={T.heroAccentSoft}
                            heroAccentBorder={T.heroAccentBorder}
                            heroTxtSoft={T.heroTxtSoft}
                            label="No subscription"
                            desc="Pay once, no automatic renewal. Yours to keep."
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      position: "relative", zIndex: 2,
                      marginTop: "auto",
                      paddingTop: 22,
                      borderTop: `1px solid ${T.heroLine}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <SummaryRow label="Subtotal" value={currency === "USD" ? formatPrice(totalDue, "USD") : `PKR ${Number(totalDue || 0).toLocaleString()}`} />
                    <SummaryRow label="Tax" value="PKR 0" info />
                    <div
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: 15.5,
                        paddingTop: 12,
                        borderTop: `1px solid ${T.heroLine}`,
                        color: "#FFFFFF",
                        fontWeight: 900,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      <span>Total due today</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>
                        {currency === "USD" ? formatPrice(totalDue, "USD") : `PKR ${Number(totalDue || 0).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ═══════════ RIGHT PANEL — Configuration ═══════════ */}
                <div
                  style={{
                    padding: isSmallMobile ? "26px 20px 26px" : isMobile ? "32px 24px" : "44px 40px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 22,
                  }}
                >
                  {!isMobile && (
                    <button
                      onClick={onClose}
                      type="button"
                      aria-label="Close"
                      style={{
                        position: "absolute",
                        top: 20, right: 20,
                        width: 36, height: 36,
                        borderRadius: "50%",
                        background: T.closeBg,
                        border: `1px solid ${T.closeBorder}`,
                        color: T.title,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 5,
                        transition: "all 0.18s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.closeBgHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = T.closeBg)}
                    >
                      <FaTimes style={{ fontSize: 13 }} />
                    </button>
                  )}

                  <div>
                    <h2
                      style={{
                        fontSize: isSmallMobile ? 22 : 26,
                        fontWeight: 900,
                        margin: "0 0 8px",
                        letterSpacing: "-0.035em",
                        color: T.title,
                        lineHeight: 1.1,
                      }}
                    >
                      {tab === "credits" ? "Choose Credits" : "Choose Your Plan"}
                    </h2>
                    <p
                      style={{
                        fontSize: 13.5,
                        color: T.txtSoft,
                        margin: "0 0 16px",
                        lineHeight: 1.5,
                      }}
                    >
                      {tab === "credits"
                        ? "Pick the number of credits you want to purchase."
                        : "Select a plan and continue to complete your payment."}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          gap: 3,
                          padding: 4,
                          borderRadius: 999,
                          background: T.surface,
                          border: `1px solid ${T.line}`,
                        }}
                      >
                        <SmallTab T={T} active={tab === "membership"} onClick={() => setTab("membership")}>
                          Membership
                        </SmallTab>
                        <SmallTab T={T} active={tab === "credits"} onClick={() => setTab("credits")}>
                          Credits
                        </SmallTab>
                      </div>

                      <div style={{ display: "flex", gap: 5 }}>
                        {["PKR", "USD"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCurrency(c)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 999,
                              border: `1.5px solid ${currency === c ? T.primary : T.line}`,
                              background: currency === c ? T.primary : "transparent",
                              color: currency === c ? "#fff" : T.txtSoft,
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              letterSpacing: "0.03em",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ═══ YOUR ACCOUNT ═══ */}
                  <div>
                    <Label T={T}>Your Account</Label>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px",
                        borderRadius: 14,
                        background: T.surface,
                        border: `1px solid ${T.line}`,
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: 42, height: 42,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: T.surfaceHover,
                          flexShrink: 0,
                          border: `1.5px solid ${T.line}`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 900,
                            color: T.txtSoft,
                            zIndex: 1,
                          }}
                        >
                          {userInitial}
                        </div>

                        {avatarUrl && (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarErrored(true)}
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              zIndex: 2,
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: T.txt,
                            letterSpacing: "-0.01em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayName}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: T.txtSoft,
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayEmail}
                        </div>
                      </div>
                      <FaLock style={{ color: T.success, fontSize: 13, flexShrink: 0 }} />
                    </div>
                  </div>

                  {/* Manual credits input */}
                  {tab === "credits" && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <Label T={T} inline>Enter credits</Label>
                        <span style={{ fontSize: 11, color: T.txtSoft, fontWeight: 600 }}>
                          10 credits = PKR 100
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "stretch", gap: 10 }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <FaCoins
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: T.txtFaint,
                              fontSize: 12,
                            }}
                          />
                          <input
                            type="number"
                            min="10"
                            step="10"
                            value={manualCredits}
                            onChange={(e) => setManualCredits(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                            style={{
                              width: "100%",
                              padding: "14px 14px 14px 36px",
                              borderRadius: 12,
                              background: T.inputBg,
                              border: `1.5px solid ${T.inputBorder}`,
                              color: T.txt,
                              fontSize: 15,
                              fontWeight: 800,
                              fontFamily: "inherit",
                              outline: "none",
                              boxSizing: "border-box",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            padding: "0 16px",
                            borderRadius: 12,
                            background: T.surface,
                            border: `1px solid ${T.line}`,
                            fontSize: 14,
                            fontWeight: 800,
                            color: T.txt,
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                            minWidth: 100,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {currency === "USD" ? formatPrice(manualPrice, "USD") : `PKR ${manualPrice.toLocaleString()}`}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                        {[100, 500, 1000, 2000, 5000].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setManualCredits(c)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              border: `1.5px solid ${manualCredits === c ? T.primary : T.line}`,
                              background: manualCredits === c ? T.primary : "transparent",
                              color: manualCredits === c ? "#fff" : T.txtSoft,
                              fontSize: 11.5,
                              fontWeight: 800,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {c.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Billing cycle choice */}
                  {tab === "membership" && (
                    <div>
                      <Label T={T}>Choose billing cycle</Label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          { id: "monthly", title: "Monthly", sub: "Pay month by month", price: selectedMembershipPlan?.pricePKR, suffix: "/mo" },
                          { id: "yearly",  title: "Yearly",  sub: "Save PKR 13,320 per year", price: selectedMembershipPlan?.yearlyPricePKR, suffix: "/yr" },
                        ].map((option) => {
                          const active = option.id === "yearly" ? billedYearly : !billedYearly;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setBilledYearly(option.id === "yearly")}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 14px",
                                borderRadius: 14,
                                border: `1.5px solid ${active ? (isLight ? "#e66000" : "rgba(255,122,26,0.6)") : T.line}`,
                                background: active
                                  ? (isLight ? "rgba(230,96,0,0.08)" : "rgba(230,96,0,0.10)")
                                  : T.surface,
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: T.txt, letterSpacing: "-0.01em" }}>
                                  {option.title}
                                </div>
                                <div style={{ fontSize: 11.5, color: T.txtSoft, marginTop: 2 }}>
                                  {option.sub}
                                </div>
                              </div>

                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: T.txt,
                                  fontVariantNumeric: "tabular-nums",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {currency === "USD"
                                  ? formatPrice(option.price, "USD")
                                  : `PKR ${Number(option.price || 0).toLocaleString()}`}
                                <span style={{ fontSize: 11, color: T.txtSoft, fontWeight: 600, marginLeft: 3 }}>
                                  {option.suffix}
                                </span>
                              </div>

                              <div
                                style={{
                                  width: 22, height: 22,
                                  borderRadius: "50%",
                                  background: active ? "#e66000" : "transparent",
                                  border: active
                                    ? `1.5px solid #e66000`
                                    : `1.5px solid ${T.lineStrong}`,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {active && (
                                  <FaCheck style={{ color: "#FFFFFF", fontSize: 9 }} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary strip */}
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      background: T.surface,
                      border: `1px solid ${T.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: T.txtFaint, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                        Summary
                      </div>
                      <div style={{ fontSize: 13, color: T.txtSoft, fontWeight: 500 }}>
                        {tab === "credits"
                          ? `${manualCredits.toLocaleString()} credits`
                          : `${selectedMembershipPlan?.name} · ${billedYearly ? "Yearly" : "Monthly"}`}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: T.txt, fontVariantNumeric: "tabular-nums" }}>
                      {currency === "USD" ? formatPrice(totalDue, "USD") : `PKR ${Number(totalDue || 0).toLocaleString()}`}
                    </div>
                  </div>

                  {/* Info note */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 12,
                      borderRadius: 12,
                      background: isLight ? "rgba(230,96,0,0.06)" : "rgba(230,96,0,0.10)",
                      border: `1px solid ${isLight ? "rgba(230,96,0,0.20)" : "rgba(230,96,0,0.28)"}`,
                    }}
                  >
                    <FaCreditCard style={{ color: "#e66000", fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: T.txtSoft, lineHeight: 1.5 }}>
                      Continue to complete your payment via JazzCash, Easypaisa or Bank Transfer.
                    </div>
                  </div>

                  {/* ═══ CTA ═══ */}
                  <button
                    type="button"
                    disabled={isBuying || totalDue <= 0}
                    onClick={handleBuyNow}
                    style={{
                      position: "relative",
                      width: "100%",
                      padding: "18px 24px",
                      borderRadius: 14,
                      border: "none",
                      background: isBuying || totalDue <= 0
                        ? (isLight ? "#E5E7EB" : "rgba(255,255,255,0.08)")
                        : T.brandGradient,
                      color: isBuying || totalDue <= 0 ? T.txtFaint : "#fff",
                      fontSize: 15.5,
                      fontWeight: 900,
                      fontFamily: "inherit",
                      letterSpacing: "-0.005em",
                      cursor: isBuying || totalDue <= 0 ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: isBuying || totalDue <= 0 ? "none" : T.brandGlow,
                      transition: "transform 0.15s ease, filter 0.15s ease",
                      marginTop: 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!(isBuying || totalDue <= 0)) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.filter = "brightness(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(isBuying || totalDue <= 0)) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.filter = "brightness(1)";
                      }
                    }}
                  >
                    {isBuying ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                          style={{ display: "inline-flex" }}
                        >
                          <FaSpinner style={{ fontSize: 15 }} />
                        </motion.span>
                        Processing…
                      </>
                    ) : (
                      <>
                        <FaLock style={{ fontSize: 13 }} />
                        Subscribe · {currency === "USD" ? formatPrice(totalDue, "USD") : `PKR ${Number(totalDue || 0).toLocaleString()}`}
                      </>
                    )}
                  </button>

                  {/* Trust footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      flexWrap: "wrap",
                      marginTop: 4,
                      fontSize: 11,
                      color: T.txtFaint,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <FaShieldAlt style={{ fontSize: 11 }} /> Secure
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <FaUndo style={{ fontSize: 11 }} /> 7-day money-back
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <FaStar style={{ fontSize: 10, color: "#e66000" }} /> 4.8 rated
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Manual payment modal ═══ */}
      <ManualPaymentModal
        isOpen={showManualPay}
        onClose={() => setShowManualPay(false)}
        pack={pendingPack}
        user={user}
        onSuccess={async (credits) => {
          await onBuyCredits?.(pendingPack?.id, credits);
          onClose?.();
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function SmallTab({ active, onClick, children, T }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        background: active ? (T.shellBg === "#FFFFFF" ? "#FFFFFF" : "#1C1C22") : "transparent",
        color: active ? T.txt : T.txtSoft,
        fontSize: 12.5,
        fontWeight: active ? 800 : 600,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 2px 10px -3px rgba(0,0,0,0.15)" : "none",
        whiteSpace: "nowrap",
        letterSpacing: "-0.005em",
      }}
    >
      {children}
    </button>
  );
}

function Label({ children, T, inline = false }) {
  return (
    <div
      style={{
        fontSize: inline ? 13 : 12.5,
        fontWeight: 800,
        color: T.txt,
        marginBottom: inline ? 0 : 10,
        letterSpacing: "-0.005em",
      }}
    >
      {children}
    </div>
  );
}

function SummaryRow({ label, value, info }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13.5,
        color: "rgba(255,255,255,0.68)",
        fontWeight: 500,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {label}
        {info && <FaInfoCircle style={{ fontSize: 10, opacity: 0.55 }} />}
      </span>
      <span style={{ color: "#FFFFFF", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

function FeatureRow({ label, desc, heroAccent, heroAccentSoft, heroAccentBorder, heroTxtSoft }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span
        style={{
          flexShrink: 0,
          width: 22, height: 22,
          borderRadius: "50%",
          background: heroAccentSoft,
          border: `1px solid ${heroAccentBorder}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
        }}
      >
        <FaCheck style={{ color: heroAccent, fontSize: 9 }} />
      </span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.005em", lineHeight: 1.35, marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 11.5, color: heroTxtSoft, lineHeight: 1.55, fontWeight: 500 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}