// src/pages/RemoveBackground.jsx — Hero screen + main tool
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner, FaDownload, FaTimes, FaCheck,
  FaImage, FaChevronDown, FaSyncAlt,
  FaSearchPlus, FaSearchMinus, FaUndo,
  FaPalette, FaCrop, FaSlidersH, FaSun, FaMoon,
  FaBolt, FaCloudUploadAlt, FaHeart,
  FaCoins, FaMagic, FaLayerGroup,
  FaCog, FaSignOutAlt, FaUser,
  FaArrowRight,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { removeBackground } from "../lib/removeBg";
import {
  loadUserCredits,
  deductUserCredits,
  addUserCredits,
} from "../lib/imageStorage";
import { supabase } from "../lib/supabase";
import PremiumCreditsModal from "../components/PremiumCreditsModal";
import AIRailSidebar from "./AIRailSidebar";

/* ═══════════════════════════════════════════════════════════════
   CREDIT COST
   ═══════════════════════════════════════════════════════════════ */
const COST_PER_REMOVAL = 5;

/* ═══════════════════════════════════════════════════════════════
   THEME TOKENS — APNa Deal brand palette
   ═══════════════════════════════════════════════════════════════ */
const DARK = {
  bg: "#0A0A12",
  rail: "#0F0F1A",
  panel: "#16161F",
  panel2: "#1C1C28",
  panel3: "#232332",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.15)",
  txt: "#FFFFFF",
  txtSoft: "rgba(255,255,255,0.65)",
  txtFaint: "rgba(255,255,255,0.45)",
  txtDim: "rgba(255,255,255,0.25)",
  primary: "#eb7d34",
  primary2: "#f59e0b",
  primary3: "#c8631f",
  primarySoft: "rgba(235,125,52,0.14)",
  primaryGlow: "rgba(235,125,52,0.45)",
  green: "#22C55E",
  danger: "#EF4444",
  checker: "repeating-conic-gradient(#1a1a26 0% 25%, #12121c 0% 50%) 50% / 22px 22px",
  heroOverlay1: "rgba(10,10,18,0.35)",
  heroOverlay2: "rgba(10,10,18,0.95)",
};

const LIGHT = {
  bg: "#FFFFFF",
  rail: "#FFFFFF",
  panel: "#FFFFFF",
  panel2: "#F4F1EC",
  panel3: "#EBE7E0",
  line: "rgba(20,20,30,0.08)",
  lineStrong: "rgba(20,20,30,0.15)",
  txt: "#1A1613",
  txtSoft: "rgba(26,22,19,0.62)",
  txtFaint: "rgba(26,22,19,0.42)",
  txtDim: "rgba(26,22,19,0.25)",
  primary: "#c8631f",
  primary2: "#eb7d34",
  primary3: "#f59e0b",
  primarySoft: "rgba(200,99,31,0.10)",
  primaryGlow: "rgba(200,99,31,0.35)",
  green: "#16A34A",
  danger: "#DC2626",
  checker: "repeating-conic-gradient(#EAE6E0 0% 25%, #FFFFFF 0% 50%) 50% / 22px 22px",
  heroOverlay1: "rgba(255,255,255,0.30)",
  heroOverlay2: "rgba(255,255,255,0.98)",
};

/* ═══════════════════════════════════════════════════════════════
   ASPECTS / FILTERS / QUALITY
   ═══════════════════════════════════════════════════════════════ */
const ASPECTS = [
  { id: "1:1",  label: "Square",     ratio: 1 },
  { id: "4:3",  label: "Classic",    ratio: 4 / 3 },
  { id: "3:2",  label: "Photo",      ratio: 3 / 2 },
  { id: "16:9", label: "Widescreen", ratio: 16 / 9 },
  { id: "9:16", label: "Mobile",     ratio: 9 / 16 },
  { id: "3:4",  label: "Portrait",   ratio: 3 / 4 },
  { id: "2:3",  label: "Tall",       ratio: 2 / 3 },
];

const FILTERS = [
  { id: "none",      label: "None",      css: "none" },
  { id: "vivid",     label: "Vivid",     css: "saturate(1.6) contrast(1.15) brightness(1.05)" },
  { id: "bw",        label: "B&W",       css: "grayscale(1) contrast(1.1)" },
  { id: "vintage",   label: "Vintage",   css: "sepia(0.5) contrast(0.95) saturate(1.3)" },
  { id: "cinematic", label: "Cinema",    css: "contrast(1.2) saturate(0.9) brightness(0.95)" },
  { id: "warm",      label: "Warm",      css: "sepia(0.2) saturate(1.3) hue-rotate(-10deg)" },
  { id: "cool",      label: "Cool",      css: "saturate(1.1) hue-rotate(15deg)" },
  { id: "fade",      label: "Fade",      css: "contrast(0.85) saturate(0.8) brightness(1.08)" },
];

const QUALITY_TIERS = [
  { id: "low",    label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high",   label: "High" },
  { id: "xhigh",  label: "X-High" },
  { id: "max",    label: "Max" },
];

/* ═══════════════════════════════════════════════════════════════
   MEDIA QUERY
   ═══════════════════════════════════════════════════════════════ */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    m.addEventListener ? m.addEventListener("change", onChange) : m.addListener(onChange);
    return () => {
      m.removeEventListener ? m.removeEventListener("change", onChange) : m.removeListener(onChange);
    };
  }, [query]);
  return matches;
};

/* ═══════════════════════════════════════════════════════════════
   ASPECT ICON
   ═══════════════════════════════════════════════════════════════ */
const AspectIcon = ({ ratio, color, size = 14 }) => {
  let w, h;
  if (ratio >= 1.5)      { w = 22; h = 14; }
  else if (ratio >= 1.15){ w = 20; h = 15; }
  else if (ratio >= 0.95){ w = 18; h = 18; }
  else if (ratio >= 0.7) { w = 14; h = 20; }
  else                   { w = 12; h = 22; }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
      <rect
        x={(24 - w) / 2}
        y={(24 - h) / 2}
        width={w}
        height={h}
        rx={Math.min(w, h) * 0.14}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
      />
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO SCREEN — before/after slider with transparent PNG
   ⭐ Uses APNa Deal brand colors + your theme tokens
   ═══════════════════════════════════════════════════════════════ */
const HeroScreen = ({ onStart, theme }) => {
  const isLight = theme === "light";
  const H = isLight ? LIGHT : DARK;

  const HERO = {
    bg: isLight
      ? `linear-gradient(180deg, ${H.bg} 0%, ${H.panel2} 60%, ${H.bg} 100%)`
      : `linear-gradient(180deg, ${H.bg} 0%, ${H.panel} 55%, ${H.bg} 100%)`,

    card: H.panel,
    cardBorder: H.line,
    cardBorderStrong: H.lineStrong,

    txt: H.txt,
    txtSoft: H.txtSoft,
    txtFaint: H.txtFaint,

    primary: H.primary,
    primary2: H.primary2,
    primarySoft: H.primarySoft,
    primaryGlow: H.primaryGlow,
    primaryGradient: `linear-gradient(135deg, ${H.primary} 0%, ${H.primary2} 100%)`,

    checker: H.checker,
  };

  const PRODUCT_IMG =
    "https://sb.kaleidousercontent.com/67418/992x558/235d7eafc9/stunning-quality-prodcut-transp.png";

  const [sliderPos, setSliderPos] = useState(50);
  const [autoDrag, setAutoDrag] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!autoDrag) return;
    let raf;
    let dir = 1;
    let pos = 50;
    const tick = () => {
      pos += dir * 0.35;
      if (pos >= 82) { pos = 82; dir = -1; }
      if (pos <= 18) { pos = 18; dir = 1; }
      setSliderPos(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoDrag]);

  const handleSliderDrag = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
    setAutoDrag(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleSliderDrag(e);
    const move = (ev) => handleSliderDrag(ev);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      background: HERO.bg,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: "48px 20px 60px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
  overflowX: "hidden",     // ✅ stops horizontal overflow only
  overflowY: "auto",       // ✅ allows vertical scroll
    }}>
      {/* Ambient brand glows */}
      <div aria-hidden style={{
        position: "absolute", top: "8%", left: "15%",
        width: 420, height: 420, borderRadius: "50%",
        background: `radial-gradient(circle, ${HERO.primarySoft} 0%, transparent 70%)`,
        filter: "blur(90px)", pointerEvents: "none", zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: "absolute", top: "38%", right: "12%",
        width: 340, height: 340, borderRadius: "50%",
        background: `radial-gradient(circle, ${HERO.primarySoft} 0%, transparent 70%)`,
        filter: "blur(90px)", pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 960, textAlign: "center" }}>

        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", marginBottom: 28,
            borderRadius: 999,
            background: HERO.card,
            border: `1px solid ${HERO.cardBorder}`,
            color: HERO.txt,
            fontSize: 12.5, fontWeight: 700,
            boxShadow: isLight
              ? `0 4px 14px -6px ${HERO.primaryGlow}`
              : "0 4px 14px -6px rgba(0,0,0,0.5)",
          }}
        >
          <motion.span
            animate={{ rotate: [0, 12, 0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "inline-flex", color: HERO.primary }}
          >
            <FaWandMagicSparkles style={{ fontSize: 11 }} />
          </motion.span>
          AI Powered
        </motion.div>

        {/* HEADLINE */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          style={{
            fontSize: "clamp(34px, 6.2vw, 68px)",
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 1.05,
            margin: "0 0 20px",
            color: HERO.txt,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Cut out backgrounds<br />
          with one{" "}
          <span style={{
            position: "relative",
            display: "inline-block",
            padding: "0 12px",
            borderRadius: 12,
            background: HERO.checker,
          }}>
            click
          </span>
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            fontSize: "clamp(14px, 1.6vw, 16px)",
            lineHeight: 1.6,
            color: HERO.txtSoft,
            margin: "0 auto 32px",
            maxWidth: 540,
            fontWeight: 500,
          }}
        >
          Next-gen removal, fast batch processing, transparent pricing.
        </motion.p>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 56,
            width: "100%",
          }}
        >
          <motion.button
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onStart}
            className="hero-cta-amber"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px 60px",
              width: "100%",
              maxWidth: 420,
              borderRadius: 999,
              background: HERO.primaryGradient,
              color: "#FFFFFF",
              border: "none",
              fontSize: 15.5,
              fontWeight: 800,
              fontFamily: "inherit",
              cursor: "pointer",
              overflow: "hidden",
              boxShadow: `0 14px 34px -14px ${HERO.primaryGlow}`,
            }}
          >
            <span
              aria-hidden
              className="hero-cta-shimmer"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "-40%",
                width: "40%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                transform: "skewX(-20deg)",
                pointerEvents: "none",
              }}
            />
            <span
              aria-hidden
              className="hero-cta-glow"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                background: `radial-gradient(circle at center, ${HERO.primaryGlow} 0%, transparent 70%)`,
                opacity: 0,
                transition: "opacity 0.35s ease",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>Get started</span>
            <FaArrowRight
              className="hero-cta-arrow"
              style={{
                fontSize: 13,
                position: "relative",
                zIndex: 1,
                transition: "transform 0.25s ease",
              }}
            />
          </motion.button>
        </motion.div>

        {/* BEFORE / AFTER SLIDER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{
            borderRadius: 28,
            padding: "32px 24px 40px",
            background: isLight ? "rgba(255,255,255,0.65)" : "rgba(22,22,31,0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${HERO.cardBorder}`,
            boxShadow: isLight
              ? `0 30px 80px -30px ${HERO.primaryGlow}`
              : "0 30px 80px -30px rgba(0,0,0,0.7)",
          }}
        >
          <p style={{
            fontSize: 11, fontWeight: 800,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: HERO.txtSoft,
            margin: "0 0 20px",
          }}>
            See the magic in action — drag the slider
          </p>

          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 640,
              margin: "0 auto",
              aspectRatio: "16/9",
              borderRadius: 20,
              overflow: "hidden",
              cursor: "ew-resize",
              userSelect: "none",
              border: `1px solid ${HERO.cardBorder}`,
            }}
          >
            {/* BEFORE — brand amber gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: HERO.primaryGradient,
            }}>
              <img
                src={PRODUCT_IMG}
                alt="Before"
                draggable={false}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  padding: "8%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* AFTER — checkerboard */}
            <div style={{
              position: "absolute", inset: 0,
              background: HERO.checker,
              clipPath: `inset(0 0 0 ${sliderPos}%)`,
              WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
            }}>
              <img
                src={PRODUCT_IMG}
                alt="After"
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  padding: "8%",
                  boxSizing: "border-box",
                  clipPath: `inset(0 0 0 ${sliderPos}%)`,
                  WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
                }}
              />
            </div>

            {/* Divider */}
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `${sliderPos}%`,
              width: 3, marginLeft: -1.5,
              background: "#FFFFFF",
              boxShadow: "0 0 12px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 3,
            }} />

            {/* Handle */}
            <div
              style={{
                position: "absolute", top: "50%",
                left: `${sliderPos}%`,
                transform: "translate(-50%, -50%)",
                width: 44, height: 44,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
                zIndex: 4,
                pointerEvents: "none",
                color: HERO.primary,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6L3 12l6 6M15 6l6 6-6 6" />
              </svg>
            </div>

            {/* Labels */}
            <span style={{
              position: "absolute", top: 14, left: 14,
              padding: "5px 12px", borderRadius: 999,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              color: "#FFFFFF",
              fontSize: 11, fontWeight: 800,
              zIndex: 5,
            }}>
              Before
            </span>

            <span style={{
              position: "absolute", top: 14, right: 14,
              padding: "5px 12px", borderRadius: 999,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              color: "#FFFFFF",
              fontSize: 11, fontWeight: 800,
              zIndex: 5,
            }}>
              After
            </span>
          </div>

          <p style={{
            fontSize: 11, fontWeight: 600,
            color: HERO.txtSoft,
            margin: "20px 0 0",
            opacity: 0.7,
          }}>
            Drag to compare · 100% free to try
          </p>
        </motion.div>

        <style>{`
          .hero-cta-amber {
            transition: box-shadow 0.3s ease, background 0.3s ease, transform 0.25s ease;
          }
          .hero-cta-amber:hover .hero-cta-glow {
            opacity: 1;
          }
          .hero-cta-amber:hover .hero-cta-shimmer {
            animation: heroCtaShimmer 0.9s ease forwards;
          }
          .hero-cta-amber:hover .hero-cta-arrow {
            transform: translateX(4px);
            color: #FFFFFF;
          }
          @keyframes heroCtaShimmer {
            0% { left: -40%; }
            100% { left: 140%; }
          }
        `}</style>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const RemoveBackground = () => {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmall = useMediaQuery("(max-width: 600px)");
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  });
  const T = theme === "light" ? LIGHT : DARK;

  /* Hero screen — first visit only */
  const [showHero, setShowHero] = useState(() => {
    try {
      return localStorage.getItem("removebg_hero_seen") !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("theme-light") ? "light" : "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  /* User profile */
  const [user, setUser] = useState({
    id: null,
    name: "User",
    email: "",
    avatar: null,
    plan: "Free Plan",
  });
  const [credits, setCredits] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) {
          if (!cancelled) setUser({ id: null, name: "Guest", email: "", avatar: null, plan: "Free Plan" });
          return;
        }

        const meta = u.user_metadata || {};
        const fallbackName =
          meta.full_name ||
          meta.name ||
          meta.display_name ||
          (u.email || "").split("@")[0] ||
          "User";

        let savedName = null;
        let savedAvatar = null;
        try {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("full_name, avatar")
            .eq("user_id", u.id)
            .maybeSingle();
          if (settings) {
            savedName = settings.full_name || null;
            savedAvatar = settings.avatar || null;
          }
        } catch {}

        let isPremium = false;
        try {
          const { data: usrRow } = await supabase
            .from("users")
            .select("is_premium")
            .eq("id", u.id)
            .maybeSingle();
          isPremium = usrRow?.is_premium === true;
        } catch {}

        if (!cancelled) {
          setUser({
            id: u.id,
            name: savedName || fallbackName,
            email: u.email || "",
            avatar: savedAvatar,
            plan: isPremium ? "Premium Plan" : "Free Plan",
          });
        }
      } catch (err) {
        console.warn("Failed to load profile:", err);
      }
    };

    loadProfile();

    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    const onUpdate = () => loadProfile();
    window.addEventListener("user-profile-updated", onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("user-profile-updated", onUpdate);
    };
  }, []);

  /* Load credits */
  useEffect(() => {
    (async () => {
      const c = await loadUserCredits();
      setCredits(c);
    })();
  }, []);

  /* Close user menu on outside click */
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-user-menu]")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  /* Core state */
  const [sourceImage, setSourceImage] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [promptText, setPromptText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, label: "" });
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [showReveal, setShowReveal] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  /* UI state */
  const [aspectId, setAspectId] = useState("1:1");
  const [dragActive, setDragActive] = useState(false);
  const [dragPreview, setDragPreview] = useState(null);
  const [qualityTier, setQualityTier] = useState("medium");
  const [isPublic, setIsPublic] = useState(true);
  const [vipDismissed, setVipDismissed] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);

  /* Crop / adjust */
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [filterId, setFilterId] = useState("none");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const fileInputRef = useRef(null);

  const selectedAspect = ASPECTS.find((a) => a.id === aspectId) || ASPECTS[0];
  const activeFilter = FILTERS.find((f) => f.id === filterId) || FILTERS[0];

  const hasResult = !!resultUrl && !isProcessing;

  const buildFilter = () => {
    const preset = activeFilter.css === "none" ? "" : activeFilter.css;
    const adjusts = [];
    if (brightness !== 100) adjusts.push(`brightness(${brightness / 100})`);
    if (contrast !== 100)   adjusts.push(`contrast(${contrast / 100})`);
    if (saturation !== 100) adjusts.push(`saturate(${saturation / 100})`);
    if (blur !== 0)         adjusts.push(`blur(${blur}px)`);
    return [preset, ...adjusts].filter(Boolean).join(" ") || "none";
  };

  const buildTransform = () => {
    const sx = flipH ? -1 : 1;
    const sy = flipV ? -1 : 1;
    return `scale(${zoom * sx}, ${zoom * sy}) rotate(${rotate}deg)`;
  };

  /* Reveal animation */
  useEffect(() => {
    if (!resultUrl) {
      setShowReveal(false);
      setRevealProgress(0);
      return;
    }
    setShowReveal(true);
    setRevealProgress(0);

    const startTime = Date.now();
    const duration = 2400;
    let raf;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setRevealProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShowReveal(false), 200);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [resultUrl]);

  const resetEditing = () => {
    setZoom(1);
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
    setFilterId("none");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
  };

  const handleFile = useCallback((file) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Image is larger than 25MB");
      return;
    }
    if (sourceImage?.url) URL.revokeObjectURL(sourceImage.url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    const url = URL.createObjectURL(file);
    setSourceImage({ url, name: file.name, size: file.size, id: Date.now() });
    setResultUrl(null);
    setShowReveal(false);
    setPromptText("");
    resetEditing();
  }, [sourceImage, resultUrl]);

  /* Drag */
  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const onDragOver = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!dragActive) setDragActive(true);
    const items = e.dataTransfer?.items;
    if (items && items.length > 0) {
      const item = items[0];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file && !dragPreview) setDragPreview(URL.createObjectURL(file));
      }
    }
  };
  const onDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
      if (dragPreview) { URL.revokeObjectURL(dragPreview); setDragPreview(null); }
    }
  };
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (dragPreview) { URL.revokeObjectURL(dragPreview); setDragPreview(null); }
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /* REMOVE BG */
  const handleRemoveBg = async () => {
    if (!sourceImage) return;

    if (credits < COST_PER_REMOVAL) {
      setError(`Not enough credits. You need ${COST_PER_REMOVAL} credits per removal.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowReveal(false);
    setProgress({ pct: 0, label: "Starting…" });

    const newBal = await deductUserCredits(COST_PER_REMOVAL);
    if (newBal === null) {
      setError("Failed to deduct credits. Please try again.");
      setIsProcessing(false);
      return;
    }
    setCredits(newBal);

    try {
      const cleanedBlob = await removeBackground(sourceImage.url, (p) => {
        setProgress({ pct: p.pct ?? 0, label: p.label ?? "" });
      });
      const url = URL.createObjectURL(cleanedBlob);
      setResultUrl(url);
      setProgress({ pct: 100, label: "Done" });
      setHistory((prev) => [
        { id: Date.now(), url, original: sourceImage.url, name: sourceImage.name, ts: Date.now() },
        ...prev.slice(0, 12),
      ]);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to remove background");

      const refunded = await addUserCredits(COST_PER_REMOVAL);
      if (refunded !== null) setCredits(refunded);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (url, name) => {
    if (!url || isDownloading) return;
    setIsDownloading(true);

    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `no-bg-${(name || Date.now()).replace(/\.\w+$/, "")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.warn("Download failed, falling back:", err);
      const a = document.createElement("a");
      a.href = url;
      a.download = `no-bg-${(name || Date.now()).replace(/\.\w+$/, "")}.png`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    if (sourceImage?.url) URL.revokeObjectURL(sourceImage.url);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSourceImage(null);
    setResultUrl(null);
    setShowReveal(false);
    setPromptText("");
    resetEditing();
  };

  const removeHistoryItem = (id) => {
    setHistory((prev) => {
      const item = prev.find((h) => h.id === id);
      if (item && resultUrl === item.url) setResultUrl(null);
      if (item?.url) { try { URL.revokeObjectURL(item.url); } catch {} }
      return prev.filter((h) => h.id !== id);
    });
  };

  const clearHistory = () => {
    history.forEach((h) => { try { URL.revokeObjectURL(h.url); } catch {} });
    setHistory([]);
    setFavorites(new Set());
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUserMenuOpen(false);
    navigate("/");
  };

  /* PANELS */
  const AspectPanel = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {ASPECTS.map((a) => {
        const active = aspectId === a.id;
        return (
          <button
            key={a.id}
            onClick={() => setAspectId(a.id)}
            type="button"
            style={{
              padding: "10px 4px",
              borderRadius: 8,
              background: active ? T.primarySoft : T.panel2,
              border: `1px solid ${active ? T.primary : T.line}`,
              color: active ? T.primary : T.txtSoft,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AspectIcon ratio={a.ratio} color={active ? T.primary : T.txtFaint} size={16} />
            <span style={{ fontSize: 9, fontWeight: 800, lineHeight: 1 }}>{a.id}</span>
          </button>
        );
      })}
    </div>
  );

  const CropPanel = () => (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.txtSoft }}>Zoom</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: T.primary }}>{Math.round(zoom * 100)}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            type="button"
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: T.panel2, border: `1px solid ${T.line}`,
              color: T.txtSoft, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <FaSearchMinus style={{ fontSize: 10 }} />
          </button>
          <input
            type="range" min="0.5" max="3" step="0.05" value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            type="button"
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: T.panel2, border: `1px solid ${T.line}`,
              color: T.txtSoft, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <FaSearchPlus style={{ fontSize: 10 }} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <button
          onClick={() => setRotate((r) => (r + 90) % 360)}
          type="button"
          style={{
            padding: "10px 6px", borderRadius: 10,
            background: T.panel2, border: `1px solid ${T.line}`,
            color: T.txtSoft, cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}
        >
          <FaSyncAlt style={{ fontSize: 12 }} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Rotate</span>
        </button>
        <button
          onClick={() => setFlipH((v) => !v)}
          type="button"
          style={{
            padding: "10px 6px", borderRadius: 10,
            background: flipH ? T.primarySoft : T.panel2,
            border: `1px solid ${flipH ? T.primary : T.line}`,
            color: flipH ? T.primary : T.txtSoft,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}
        >
          <FaSyncAlt style={{ fontSize: 12, transform: "rotate(90deg)" }} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Flip H</span>
        </button>
        <button
          onClick={() => setFlipV((v) => !v)}
          type="button"
          style={{
            padding: "10px 6px", borderRadius: 10,
            background: flipV ? T.primarySoft : T.panel2,
            border: `1px solid ${flipV ? T.primary : T.line}`,
            color: flipV ? T.primary : T.txtSoft,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}
        >
          <FaSyncAlt style={{ fontSize: 12 }} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Flip V</span>
        </button>
      </div>
    </div>
  );

  const FiltersPanel = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {FILTERS.map((f) => {
        const active = filterId === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setFilterId(f.id)}
            type="button"
            style={{
              position: "relative", padding: 0,
              background: "transparent", border: "none",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <div style={{
              position: "relative", width: "100%", aspectRatio: "1 / 1",
              borderRadius: 9, overflow: "hidden",
              border: `2px solid ${active ? T.primary : T.line}`,
              background: T.panel2,
            }}>
              <img
                src={resultUrl || sourceImage?.url}
                alt={f.label}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", filter: f.css, display: "block",
                }}
              />
              {active && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.30)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: T.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff",
                  }}>
                    <FaCheck style={{ fontSize: 9 }} />
                  </div>
                </div>
              )}
            </div>
            <span style={{
              display: "block", fontSize: 10, fontWeight: 700,
              color: active ? T.primary : T.txtFaint,
              marginTop: 4, textAlign: "center",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {f.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  const AdjustPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { label: "Brightness", value: brightness, setValue: setBrightness, min: 0, max: 200, unit: "%" },
        { label: "Contrast",   value: contrast,   setValue: setContrast,   min: 0, max: 200, unit: "%" },
        { label: "Saturation", value: saturation, setValue: setSaturation, min: 0, max: 200, unit: "%" },
        { label: "Blur",       value: blur,       setValue: setBlur,       min: 0, max: 20,  unit: "px" },
      ].map(({ label, value, setValue, min, max, unit }) => (
        <div key={label}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.txtSoft }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.primary }}>{value}{unit}</span>
          </div>
          <input
            type="range" min={min} max={max} value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            style={{ width: "100%" }}
          />
        </div>
      ))}
    </div>
  );

  /* ═══ HERO — first visit only ═══ */
  if (showHero) {
    return (
      <HeroScreen
        theme={theme}
        onStart={() => {
          try {
            localStorage.setItem("removebg_hero_seen", "1");
          } catch {}
          setShowHero(false);
        }}
      />
    );
  }

  /* ═══ MAIN TOOL ═══ */
  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.txt,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      paddingBottom: isMobile && sourceImage ? 90 : 0,
      position: "relative",
      overflow: "hidden",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ⭐ Ambient brand glows */}
      <div aria-hidden style={{
        position: "fixed", top: "8%", left: "8%",
        width: 420, height: 420, borderRadius: "50%",
        background: `radial-gradient(circle, ${T.primarySoft} 0%, transparent 70%)`,
        filter: "blur(100px)", pointerEvents: "none", zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: "fixed", bottom: "10%", right: "6%",
        width: 380, height: 380, borderRadius: "50%",
        background: `radial-gradient(circle, ${T.primarySoft} 0%, transparent 70%)`,
        filter: "blur(110px)", pointerEvents: "none", zIndex: 0,
      }} />

      <AIRailSidebar
        theme={theme}
        onToggleTheme={() => {
          const isLight = document.documentElement.classList.contains("theme-light");
          document.documentElement.classList.toggle("theme-light", !isLight);
          setTheme(!isLight ? "light" : "dark");
        }}
      />

      <div style={{
        flex: 1,
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "420px 1fr",
        gap: isMobile ? 14 : 20,
        padding: isMobile ? "14px 12px 20px" : "20px 28px 28px",
        alignItems: "flex-start",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1,
      }}>

        {/* ═══ LEFT PANEL ═══ */}
        <aside style={{
          background: T.panel,
          border: `1px solid ${T.line}`,
          borderRadius: 16,
          padding: isMobile ? 16 : 20,
          position: isMobile ? "relative" : "sticky",
          top: isMobile ? undefined : 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          boxSizing: "border-box",
          boxShadow: theme === "light"
            ? "0 20px 50px -30px rgba(20,20,30,0.20)"
            : "0 20px 50px -30px rgba(0,0,0,0.7)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              fontStyle: "italic",
              letterSpacing: "-0.03em",
              color: T.primary,
              margin: 0,
            }}>
              {hasResult ? "Edit Result" : "Background AI"}
            </h1>

            {hasResult && (
              <button
                onClick={handleReset}
                type="button"
                title="Start over"
                style={{
                  width: 32, height: 32,
                  borderRadius: 9,
                  background: T.panel2,
                  border: `1px solid ${T.line}`,
                  color: T.txtFaint,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaSyncAlt style={{ fontSize: 11 }} />
              </button>
            )}
          </div>

          {!sourceImage ? (
            <div
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "relative",
                background: T.panel2,
                border: `1.5px dashed ${dragActive ? T.primary : T.lineStrong}`,
                borderRadius: 12,
                padding: "32px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                textAlign: "center",
              }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 12,
                background: T.panel3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.txtFaint,
              }}>
                <FaCloudUploadAlt style={{ fontSize: 20 }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.txt }}>
                Drop or click to upload
              </div>
              <div style={{ fontSize: 11, color: T.txtFaint }}>
                JPG · PNG · WEBP · up to 25 MB
              </div>
            </div>
          ) : (
            <div style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${T.line}`,
              background: T.checker,
              aspectRatio: "1 / 1",
              maxHeight: 220,
            }}>
              <img
                src={resultUrl || sourceImage.url}
                alt=""
                draggable={false}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "contain",
                  transform: buildTransform(),
                  filter: buildFilter(),
                  display: "block",
                }}
              />

              {isProcessing && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(10,11,13,0.9)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 40, height: 40,
                      borderRadius: "50%",
                      border: `3px solid ${T.primarySoft}`,
                      borderTopColor: T.primary,
                    }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                    {progress.label || "Removing…"}
                  </span>
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                type="button"
                style={{
                  position: "absolute",
                  top: 8, right: 8,
                  padding: "4px 9px",
                  borderRadius: 7,
                  background: "rgba(0,0,0,0.65)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: 10.5, fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                }}
              >
                Replace
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            style={{ display: "none" }}
          />

          {!hasResult && (
            <>
              {/* Mode tabs */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                background: T.panel2, borderRadius: 10, padding: 3, gap: 3,
              }}>
                {["Image to Image", "Text to Image"].map((label, i) => {
                  const active = i === 0;
                  return (
                    <button
                      key={label}
                      type="button"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: active ? T.panel3 : "transparent",
                        border: "none",
                        color: active ? T.txt : T.txtFaint,
                        fontSize: 12.5, fontWeight: 700,
                        fontFamily: "inherit", cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Model selector */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 12px",
                background: T.panel2,
                border: `1px solid ${T.line}`,
                borderRadius: 10, cursor: "pointer",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", flexShrink: 0,
                }}>
                  <FaWandMagicSparkles style={{ fontSize: 10 }} />
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.txt }}>
                  GPT Image 2.5 Flare
                </span>
                <FaChevronDown style={{ fontSize: 10, color: T.txtFaint }} />
              </div>

              {/* Prompt textarea */}
              <div style={{
                background: T.panel2,
                border: `1px solid ${promptText.trim() ? T.primary + "55" : T.line}`,
                borderRadius: 12,
                padding: 12,
                transition: "border-color 0.18s ease",
              }}>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Optional — describe how you want the cutout refined, or what to keep."
                  rows={3}
                  style={{
                    width: "100%",
                    background: "transparent", border: "none", outline: "none",
                    resize: "none", color: T.txt, caretColor: T.primary,
                    fontSize: 13, fontFamily: "inherit", lineHeight: 1.6,
                    minHeight: 50, boxSizing: "border-box", cursor: "text",
                  }}
                />
              </div>

              {/* Aspect selector */}
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowAspectMenu((v) => !v)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 12px",
                    background: T.panel2,
                    border: `1px solid ${T.line}`,
                    borderRadius: 10,
                    color: T.txt, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  }}
                >
                  <AspectIcon ratio={selectedAspect.ratio} color={T.txtSoft} size={14} />
                  <span style={{ flex: 1, textAlign: "left" }}>{selectedAspect.label}</span>
                  <FaChevronDown style={{ fontSize: 9, color: T.txtFaint }} />
                </button>

                <AnimatePresence>
                  {showAspectMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0, right: 0,
                        background: T.panel3,
                        border: `1px solid ${T.lineStrong}`,
                        borderRadius: 12,
                        padding: 6, zIndex: 30,
                        boxShadow: "0 16px 40px -12px rgba(0,0,0,0.6)",
                      }}
                    >
                      {ASPECTS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => { setAspectId(a.id); setShowAspectMenu(false); }}
                          style={{
                            width: "100%",
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 12px",
                            background: a.id === aspectId ? T.primarySoft : "transparent",
                            border: "none", borderRadius: 8,
                            color: a.id === aspectId ? T.primary : T.txt,
                            fontSize: 13, fontWeight: 600,
                            fontFamily: "inherit", cursor: "pointer", textAlign: "left",
                          }}
                        >
                          <AspectIcon ratio={a.ratio} color={a.id === aspectId ? T.primary : T.txtSoft} size={14} />
                          <span>{a.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quality tiers */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.txtSoft, marginBottom: 8 }}>
                  Quality
                </div>
                <div style={{
                  display: "flex", gap: 4,
                  background: T.panel2, borderRadius: 10, padding: 4,
                }}>
                  {QUALITY_TIERS.map((t) => {
                    const active = qualityTier === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setQualityTier(t.id)}
                        style={{
                          flex: 1, padding: "8px 4px",
                          borderRadius: 7,
                          background: active ? T.panel3 : "transparent",
                          border: "none",
                          color: active ? T.txt : T.txtFaint,
                          fontSize: 11, fontWeight: 700,
                          fontFamily: "inherit", cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Public Visibility */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.txt }}>
                  Public Visibility
                </span>
                <button
                  type="button"
                  onClick={() => setIsPublic((v) => !v)}
                  style={{
                    width: 42, height: 24, borderRadius: 999,
                    background: isPublic
                      ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                      : T.panel3,
                    border: "none", cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <motion.span
                    animate={{ x: isPublic ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      position: "absolute", top: 2,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#fff", display: "block",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {sourceImage && credits < COST_PER_REMOVAL && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171", fontSize: 12, fontWeight: 700,
                }}>
                  <FaCoins style={{ fontSize: 12 }} />
                  <span style={{ flex: 1 }}>
                    Need <strong>{COST_PER_REMOVAL}</strong> credits · you have <strong>{credits}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPremium(true)}
                    style={{
                      background: "transparent", border: "none",
                      color: "#f87171", fontSize: 11.5, fontWeight: 800,
                      fontFamily: "inherit", cursor: "pointer",
                      textDecoration: "underline", textUnderlineOffset: "3px",
                    }}
                  >
                    Top up
                  </button>
                </div>
              )}

              <motion.button
                onClick={sourceImage ? handleRemoveBg : () => fileInputRef.current?.click()}
                disabled={isProcessing || (sourceImage && credits < COST_PER_REMOVAL)}
                whileHover={!isProcessing ? { scale: 1.01 } : {}}
                whileTap={!isProcessing ? { scale: 0.99 } : {}}
                type="button"
                style={{
                  position: "relative", width: "100%",
                  padding: "15px 20px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                  border: "none", color: "#fff",
                  fontSize: 14.5, fontWeight: 800,
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  cursor: isProcessing || (sourceImage && credits < COST_PER_REMOVAL) ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  gap: 10,
                  boxShadow: `0 10px 28px -8px ${T.primaryGlow}`,
                  opacity: isProcessing || (sourceImage && credits < COST_PER_REMOVAL) ? 0.6 : 1,
                }}
              >
                {isProcessing ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      style={{ display: "inline-flex" }}
                    >
                      <FaSpinner style={{ fontSize: 14 }} />
                    </motion.span>
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <FaWandMagicSparkles style={{ fontSize: 14 }} />
                    <span>{sourceImage ? "Removign Background" : "Remove Background"}</span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      marginLeft: 4, padding: "2px 8px", borderRadius: 999,
                      background: "rgba(255,255,255,0.15)",
                      fontSize: 12, fontWeight: 800,
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                      </svg>
                      {sourceImage ? COST_PER_REMOVAL : 3}
                    </span>
                  </>
                )}
              </motion.button>
            </>
          )}

          {hasResult && (
            <>
              <PanelCard
                T={T}
                icon={<FaCrop style={{ fontSize: 12 }} />}
                title="Crop & Transform"
                action={
                  <button
                    onClick={resetEditing}
                    type="button"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 10px", borderRadius: 8,
                      background: "transparent", border: "none",
                      color: T.txtFaint, fontSize: 11, fontWeight: 800,
                      fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    <FaUndo style={{ fontSize: 10 }} />
                    Reset
                  </button>
                }
              >
                <CropPanel />
              </PanelCard>

              <PanelCard T={T} icon={<FaPalette style={{ fontSize: 12 }} />} title="Filters">
                <FiltersPanel />
              </PanelCard>

              <PanelCard T={T} icon={<FaSlidersH style={{ fontSize: 12 }} />} title="Adjust">
                <AdjustPanel />
              </PanelCard>

              <PanelCard
                T={T}
                icon={<AspectIcon ratio={selectedAspect.ratio} color={T.primary} size={12} />}
                title="Aspect Ratio"
              >
                <AspectPanel />
              </PanelCard>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <motion.button
                  whileHover={!isDownloading ? { scale: 1.02 } : {}}
                  whileTap={!isDownloading ? { scale: 0.98 } : {}}
                  onClick={() => handleDownload(resultUrl, sourceImage?.name)}
                  disabled={isDownloading}
                  type="button"
                  style={{
                    flex: 1, padding: "13px 18px", borderRadius: 12,
                    background: isDownloading
                      ? T.panel3
                      : `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                    border: "none", color: "#fff",
                    fontSize: 13.5, fontWeight: 800,
                    fontFamily: "inherit",
                    cursor: isDownloading ? "wait" : "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    gap: 8,
                    boxShadow: isDownloading ? "none" : `0 8px 22px -8px ${T.primaryGlow}`,
                    opacity: isDownloading ? 0.75 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDownloading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-flex" }}
                      >
                        <FaSpinner style={{ fontSize: 13 }} />
                      </motion.span>
                      <span>Downloading…</span>
                    </>
                  ) : (
                    <>
                      <FaDownload style={{ fontSize: 13 }} />
                      <span>Download PNG</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  type="button"
                  title="Start over"
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: T.panel2,
                    border: `1px solid ${T.line}`,
                    color: T.txtFaint,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaSyncAlt style={{ fontSize: 13 }} />
                </motion.button>
              </div>

              {history.length > 0 && (
                <div>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 8, padding: "0 2px",
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 900,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: T.txtFaint,
                    }}>
                      Recent
                    </span>
                    <button
                      onClick={clearHistory}
                      type="button"
                      style={{
                        background: "transparent", border: "none",
                        color: T.txtFaint, fontSize: 10, fontWeight: 800,
                        fontFamily: "inherit", cursor: "pointer",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <div style={{
                    display: "flex", gap: 8, overflowX: "auto",
                    paddingBottom: 4,
                    scrollbarWidth: "none", msOverflowStyle: "none",
                  }}>
                    {history.slice(0, 8).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.06 }}
                        style={{ position: "relative", flexShrink: 0 }}
                      >
                        <button
                          onClick={() => setResultUrl(item.url)}
                          type="button"
                          style={{
                            width: 56, height: 56, borderRadius: 12,
                            overflow: "hidden",
                            border: resultUrl === item.url
                              ? `2px solid ${T.primary}`
                              : `1px solid ${T.line}`,
                            cursor: "pointer", padding: 0,
                            background: T.checker,
                          }}
                        >
                          <img
                            src={item.url}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); removeHistoryItem(item.id); }}
                          type="button"
                          title="Remove"
                          style={{
                            position: "absolute",
                            top: -5, right: -5,
                            width: 18, height: 18, borderRadius: "50%",
                            background: "#ef4444",
                            border: `2px solid ${theme === "light" ? "#fff" : "#161622"}`,
                            color: "#fff", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 2,
                          }}
                        >
                          <FaTimes style={{ fontSize: 7 }} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: 12, fontWeight: 600,
            }}>
              {error}
            </div>
          )}
        </aside>

        {/* ═══ RIGHT PANEL ═══ */}
        <main style={{
          background: T.panel,
          border: `1px solid ${T.line}`,
          borderRadius: 16,
          minHeight: isMobile ? 400 : "calc(100vh - 140px)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          width: "100%", boxSizing: "border-box",
          boxShadow: theme === "light"
            ? "0 20px 50px -30px rgba(20,20,30,0.20)"
            : "0 20px 50px -30px rgba(0,0,0,0.7)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "14px 20px 0",
            borderBottom: `1px solid ${T.line}`,
            overflowX: "auto",
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            {[
              { id: "creations",    label: "Creations" },
              { id: "ideas",        label: "Ideas Hub" },
              { id: "how-it-works", label: "How It Works" },
            ].map((tab, i) => {
              const active = i === 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  style={{
                    position: "relative",
                    padding: "10px 16px 14px",
                    background: "transparent", border: "none",
                    color: active ? T.txt : T.txtFaint,
                    fontSize: 13.5, fontWeight: active ? 700 : 600,
                    fontFamily: "inherit", cursor: "pointer",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {tab.label}
                  {active && (
                    <span style={{
                      position: "absolute", left: 12, right: 12, bottom: 0,
                      height: 2, borderRadius: 999,
                      background: T.primary,
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ padding: isMobile ? "16px 16px 0" : "20px 24px 0" }}>
            <h2 style={{
              fontSize: 17, fontWeight: 800, color: T.txt,
              margin: "0 0 14px", letterSpacing: "-0.02em",
            }}>
              {hasResult ? "Your Result" : "Generate List"}
            </h2>

            {!hasResult && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", borderRadius: 10,
                background: `linear-gradient(90deg, ${T.primary}22 0%, ${T.primary}0a 100%)`,
                border: `1px solid ${T.primary}44`,
                marginBottom: 20, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 12.5, color: T.txtSoft, flex: 1, minWidth: 0 }}>
                  Creations are stored for only 7 days. Assets created after upgrading to a Membership plan will be stored permanently.
                </span>
                <button
                  type="button"
                  onClick={() => setShowPremium(true)}
                  style={{
                    background: "transparent", border: "none",
                    color: T.primary, fontSize: 12.5, fontWeight: 700,
                    fontFamily: "inherit", cursor: "pointer",
                    textDecoration: "underline", flexShrink: 0,
                  }}
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>

          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: isMobile ? "20px 16px" : "40px",
            overflow: "auto",
          }}>
            {!sourceImage ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 24, textAlign: "center", maxWidth: 480,
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 20,
                    background: `linear-gradient(135deg, ${T.primary}22 0%, ${T.primary}0a 100%)`,
                    border: `1px solid ${T.primary}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <div style={{
                      width: 72, height: 60, borderRadius: 12,
                      background: `linear-gradient(135deg, ${T.primary}66 0%, ${T.primary}33 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
                        <circle cx="13" cy="11" r="4" fill="rgba(255,255,255,0.7)" />
                        <path d="M2 32l12-14 8 9 6-8 14 13H2z" fill="rgba(255,255,255,0.85)" />
                      </svg>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      position: "absolute", top: -6, right: -6,
                      fontSize: 16, color: T.primary,
                    }}
                  >
                    ✦
                  </motion.div>
                </div>

                <div style={{
                  fontSize: isMobile ? 13.5 : 14.5,
                  fontStyle: "italic",
                  color: T.txtFaint, lineHeight: 1.55,
                }}>
                  Unlock your creative potential and experience the magic of Media AI right away!
                </div>
              </div>
            ) : (
              <div style={{
                position: "relative",
                width: "100%", maxWidth: 640,
                aspectRatio: `${selectedAspect.ratio}`,
                maxHeight: isMobile ? 380 : 620,
                margin: "0 auto", borderRadius: 20,
                overflow: "hidden",
                background: T.checker,
                border: `1px solid ${T.line}`,
              }}>
                <img
                  src={resultUrl || sourceImage.url}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "contain",
                    transform: buildTransform(),
                    filter: buildFilter(),
                    display: "block",
                  }}
                />

                {isProcessing && (
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    background: "rgba(10,11,13,0.9)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 20, padding: 24,
                  }}>
                    <div style={{ position: "relative", width: 110, height: 110 }}>
                      <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                        <circle
                          cx="55" cy="55" r="48"
                          fill="none"
                          stroke={T.primary}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(100, Math.max(0, progress.pct || 0)) / 100)}
                          style={{ transition: "stroke-dashoffset 0.3s ease" }}
                        />
                      </svg>
                      <div style={{
                        position: "absolute", inset: 18,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff",
                      }}>
                        <FaWandMagicSparkles style={{ fontSize: 20 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "center", maxWidth: 300 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF", marginBottom: 4 }}>
                        {progress.label || "Removing background…"}
                      </div>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: "rgba(255,255,255,0.6)",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {Math.round(progress.pct || 0)}% complete
                      </div>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {showReveal && resultUrl && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: "absolute", inset: 0, zIndex: 12,
                        background: theme === "light" ? "#FFFFFF" : "#0B0B14",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 20, padding: 24,
                      }}
                    >
                      <div style={{ position: "relative", width: 140, height: 140 }}>
                        <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                          <circle cx="70" cy="70" r="62" fill="none"
                            stroke={theme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"}
                            strokeWidth="5"
                          />
                          <circle cx="70" cy="70" r="62" fill="none"
                            stroke={T.primary} strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 62}
                            strokeDashoffset={2 * Math.PI * 62 * (1 - revealProgress / 100)}
                            style={{ transition: "stroke-dashoffset 0.1s linear" }}
                          />
                        </svg>
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.5 }}
                          style={{
                            position: "absolute", inset: 26,
                            borderRadius: "50%",
                            background: theme === "light" ? "#FFFFFF" : "#161622",
                            border: `1px solid ${T.line}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <div style={{
                            width: 48, height: 48, borderRadius: "50%",
                            background: T.green,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#FFFFFF",
                          }}>
                            <FaCheck style={{ fontSize: 22, fontWeight: 900 }} />
                          </div>
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 300 }}
                      >
                        <div style={{
                          fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em",
                          color: theme === "light" ? T.txt : "#FFFFFF",
                          marginBottom: 6,
                        }}>
                          Background Removed
                        </div>
                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          color: theme === "light" ? T.txtSoft : "rgba(255,255,255,0.6)",
                        }}>
                          Your transparent image is ready
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {resultUrl && !isProcessing && !showReveal && (
                  <div style={{
                    position: "absolute", top: 14, left: 14,
                    padding: "7px 13px", borderRadius: 999,
                    background: T.green, color: "#FFFFFF",
                    fontSize: 10, fontWeight: 900,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    zIndex: 5,
                  }}>
                    ✓ BG Removed
                  </div>
                )}

                {resultUrl && !isProcessing && !showReveal && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={!isDownloading ? { scale: 1.08 } : {}}
                    whileTap={!isDownloading ? { scale: 0.92 } : {}}
                    onClick={() => handleDownload(resultUrl, sourceImage?.name)}
                    disabled={isDownloading}
                    type="button"
                    title="Download PNG"
                    style={{
                      position: "absolute", bottom: 16, right: 16,
                      width: 52, height: 52, borderRadius: "50%",
                      background: isDownloading
                        ? T.panel3
                        : `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                      border: "2px solid #fff", color: "#fff",
                      cursor: isDownloading ? "wait" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 6,
                      boxShadow: isDownloading ? "none" : `0 8px 22px -6px ${T.primaryGlow}`,
                      opacity: isDownloading ? 0.75 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isDownloading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-flex" }}
                      >
                        <FaSpinner style={{ fontSize: 16 }} />
                      </motion.span>
                    ) : (
                      <FaDownload style={{ fontSize: 16 }} />
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      {isMobile && sourceImage && !hasResult && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            position: "fixed", left: 0, right: 0, bottom: 0,
            padding: "10px 12px 14px",
            background: T.panel,
            borderTop: `1px solid ${T.line}`,
            zIndex: 50,
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            type="button"
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: T.panel2, border: `1px solid ${T.line}`,
              color: T.txtFaint, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FaSyncAlt style={{ fontSize: 14 }} />
          </motion.button>

          <motion.button
            onClick={handleRemoveBg}
            disabled={isProcessing || credits < COST_PER_REMOVAL}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
            type="button"
            style={{
              flex: 1,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 9,
              padding: "14px 20px", borderRadius: 14,
              background: isProcessing || credits < COST_PER_REMOVAL
                ? T.panel2
                : `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
              color: isProcessing || credits < COST_PER_REMOVAL ? T.txtDim : "#fff",
              border: "none",
              fontSize: 14, fontWeight: 900,
              fontFamily: "inherit",
              cursor: isProcessing || credits < COST_PER_REMOVAL ? "not-allowed" : "pointer",
              boxShadow: isProcessing || credits < COST_PER_REMOVAL ? "none" : `0 8px 22px -8px ${T.primaryGlow}`,
            }}
          >
            {isProcessing ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-flex" }}
                >
                  <FaSpinner style={{ fontSize: 13 }} />
                </motion.span>
                <span>Processing…</span>
              </>
            ) : (
              <>
                <FaWandMagicSparkles style={{ fontSize: 15 }} />
                <span>Remove Background</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      <PremiumCreditsModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        userCredits={credits}
        onSubscribe={async (planId) => {
          console.log("Subscribe to plan:", planId);
        }}
        onBuyCredits={async (packId, creditAmount) => {
          console.log("Buy credit pack:", packId, "amount:", creditAmount);
          const newBal = await addUserCredits(creditAmount);
          if (newBal !== null) setCredits(newBal);
          setShowPremium(false);
        }}
      />

      <style>{`
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${T.lineStrong}; border-radius: 999px; }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: ${T.panel3};
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: ${T.primary};
          cursor: pointer;
          border: 2px solid #fff;
        }
        @media (max-width: 600px) {
          body { -webkit-tap-highlight-color: transparent; }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MENU ITEM (user dropdown)
   ═══════════════════════════════════════════════════════════════ */
const MenuItem = ({ T, icon, label, onClick, accent, danger }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px",
      borderRadius: 8,
      background: "transparent",
      border: "none",
      color: danger ? T.danger : accent ? T.primary : T.txt,
      fontSize: 13, fontWeight: 600,
      fontFamily: "inherit",
      cursor: "pointer",
      textAlign: "left",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = T.panel2; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
  >
    <span style={{ display: "inline-flex", width: 16, justifyContent: "center" }}>
      {icon}
    </span>
    {label}
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   PANEL CARD WRAPPER
   ═══════════════════════════════════════════════════════════════ */
const PanelCard = ({ T, icon, title, action, children }) => (
  <div style={{
    background: T.panel2,
    border: `1px solid ${T.line}`,
    borderRadius: 14,
    padding: 14,
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: T.primarySoft,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.primary,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 900,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: T.txtSoft,
        }}>
          {title}
        </span>
      </div>
      {action}
    </div>
    {children}
  </div>
);

export default RemoveBackground;