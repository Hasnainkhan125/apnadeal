// components/Navbar.jsx — Advanced Modern Navbar (brand #fc9d03 · dark + light)
// Floating glass capsule · animated gradient border · premium micro-interactions
// ⭐ Plan-aware: reads free / seller / pro from PlanContext
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch, FaUser, FaTimes, FaMoon, FaSun, FaSignOutAlt, FaCrown,
  FaCommentDots, FaNewspaper, FaChevronDown, FaCog, FaSignInAlt, FaChevronRight,
  FaUserPlus, FaHome, FaWallet, FaStar, FaFire, FaBolt, FaSpinner,
  FaShieldAlt, FaCar, FaRegPaperPlane, FaMobileAlt, FaLaptop, FaList,
  FaChartBar, FaPlus, FaArrowRight, FaShoppingCart, FaTrash, FaHeadset,
  FaEdit, FaImage, FaChartLine, FaMagic, FaGem,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { readCart, writeCart } from "../lib/cartStore";
import { useTheme } from "../hooks/useTheme";
import { usePlan } from "../contexts/PlanContext"; // ⭐ NEW

/* ═══════════════════════════════════════════════════════════════
   ADMIN EMAILS
   ═══════════════════════════════════════════════════════════════ */
const ADMIN_EMAILS = ["hasnainwebdeveloper1122@gmail.com"];
const isAdminEmail = (email) =>
  ADMIN_EMAILS.map((e) => e.toLowerCase()).includes((email || "").toLowerCase());

/* ═══════════════════════════════════════════════════════════════
   GUEST NAV LINKS
   ═══════════════════════════════════════════════════════════════ */
const GUEST_NAV_LINKS = [
  { label: "Features",   id: "features" },
  { label: "Assets",     id: "assets" },
  { label: "Pricing",    id: "pricing" },
  { label: "FAQ",        id: "faq" },
  { label: "Protection", id: "protection" },
];

/* ═══════════════════════════════════════════════════════════════
   FONTS + THEME TOKENS
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    html { scroll-behavior: smooth; }
    section[id] { scroll-margin-top: 96px; }

    /* ── DARK THEME ── */
    .theme-dark {
      --nav-bg:           #0A0A12;
      --nav-bg-2:         #0F0F1A;
      --nav-panel:        #14141D;
      --nav-panel-2:      #1A1A24;
      --nav-surface:      rgba(255,255,255,0.05);
      --nav-surface-2:    rgba(255,255,255,0.08);
      --nav-line:         rgba(255,255,255,0.08);
      --nav-line-str:     rgba(255,255,255,0.14);
      --nav-txt:          #FFFFFF;
      --nav-txt-soft:     rgba(255,255,255,0.68);
      --nav-txt-faint:    rgba(255,255,255,0.42);
      --nav-primary:      #E26A2C; /* Dark orange from logo */
      --nav-primary-2:    #F58220; /* Light orange from logo */
      --nav-primary-3:    #D35400; /* Deep burnt orange from logo */
      --nav-primary-soft: rgba(242,138,45,0.14);
      --nav-primary-glow: rgba(242,138,45,0.45);
      --nav-shadow:       0 8px 32px -12px rgba(0,0,0,0.7);
      --nav-pill-bg:      rgba(20,20,30,0.55);
      --nav-pill-border:  rgba(255,255,255,0.08);
      --nav-glass-bg:     rgba(14,14,24,0.72);
      --nav-glass-border: rgba(255,255,255,0.10);
    }

    /* ── LIGHT THEME ── */
    .theme-light {
      --nav-bg:           #FFFFFF;
      --nav-bg-2:         #FAF7F3;
      --nav-panel:        #FFFFFF;
      --nav-panel-2:      #F8F7FB;
      --nav-surface:      rgba(0,0,0,0.04);
      --nav-surface-2:    rgba(0,0,0,0.06);
      --nav-line:         rgba(20,20,30,0.08);
      --nav-line-str:     rgba(20,20,30,0.15);
      --nav-txt:          #1A1613;
      --nav-txt-soft:     rgba(26,22,19,0.62);
      --nav-txt-faint:    rgba(26,22,19,0.42);
      --nav-primary:      #D35400; /* Deep burnt orange for light mode */
      --nav-primary-2:    #F58220; /* Light orange for light mode */
      --nav-primary-3:    #E26A2C; /* Mid orange for light mode */
      --nav-primary-soft: rgba(211,84,0,0.10);
      --nav-primary-glow: rgba(211,84,0,0.35);
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.12);
      --nav-pill-bg:      rgba(255,255,255,0.72);
      --nav-pill-border:  rgba(20,20,30,0.08);
      --nav-glass-bg:     rgba(255,255,255,0.78);
      --nav-glass-border: rgba(20,20,30,0.08);
    }

    /* ═══════ ADVANCED FLOATING GLASS NAV ═══════ */
    .nav-advanced-shell {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      transition: padding 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .nav-advanced-inner {
      margin: 0 auto;
      max-width: 1320px;
      padding: 0 12px;
      transition: padding 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .nav-advanced-glass {
      position: relative;
      border-radius: 22px;
      backdrop-filter: blur(24px) saturate(180%);
    }
    .theme-dark .nav-advanced-glass {
      box-shadow:
        0 12px 48px -16px rgba(0,0,0,0.8),
        0 0 0 1px rgba(255,255,255,0.02),
        inset 0 1px 0 rgba(255,255,255,0.05);
    }

    .nav-advanced-glass.is-scrolled {
      box-shadow:
        0 16px 56px -20px rgba(0,0,0,0.45),
        0 0 0 1px var(--nav-line),
        inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .theme-dark .nav-advanced-glass.is-scrolled {
      box-shadow:
        0 20px 60px -22px rgba(0,0,0,0.9),
        0 0 0 1px rgba(242,138,45,0.12),
        inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .nav-advanced-glass::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--nav-line-str), transparent);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }
    .nav-advanced-glass.is-scrolled::after { opacity: 1; }

    .nav-guest-pill {
      background: var(--nav-pill-bg);
      border: 1px solid var(--nav-pill-border);
      backdrop-filter: blur(24px) saturate(160%);
      -webkit-backdrop-filter: blur(24px) saturate(160%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .nav-guest-pill-link {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--nav-txt-soft);
      padding: 8px 16px;
      border-radius: 999px;
      transition: color 0.18s ease, background 0.18s ease;
      white-space: nowrap;
      cursor: pointer;
      background: transparent;
      border: none;
      position: relative;
    }
    .nav-guest-pill-link:hover { color: var(--nav-txt); background: var(--nav-surface); }

    .nav-icon-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      width: 36px;
      border-radius: 999px;
      background: var(--nav-surface);
      border: 1px solid var(--nav-line);
      color: var(--nav-txt);
      transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
      overflow: hidden;
    }
    .nav-icon-btn::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: radial-gradient(circle at center, var(--nav-primary-glow), transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
      filter: blur(8px);
    }
    .nav-icon-btn:hover { border-color: var(--nav-line-str); transform: translateY(-1px); }
    .nav-icon-btn:hover::before { opacity: 1; }
    .nav-icon-btn:hover svg { color: var(--nav-primary-2); }

    @keyframes navEditShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes navEditPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(242,138,45,0.55), 0 4px 14px -6px rgba(242,138,45,0.6); }
      50%      { box-shadow: 0 0 0 6px rgba(242,138,45,0), 0 6px 20px -6px rgba(242,138,45,0.7); }
    }
    @keyframes navEditSparkle {
      0%, 100% { opacity: 0.55; transform: scale(0.9) rotate(0deg); }
      50%      { opacity: 1;   transform: scale(1.15) rotate(20deg); }
    }
    .nav-edit-entry {
      position: relative;
      background: linear-gradient(135deg, rgba(242,138,45,0.14) 0%, rgba(226,106,44,0.10) 50%, rgba(211,84,0,0.14) 100%);
      border: 1px solid rgba(242,138,45,0.35);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-edit-entry::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.22) 55%, transparent 100%);
      background-size: 200% 100%;
      animation: navEditShimmer 3.6s linear infinite;
      pointer-events: none;
    }
    .nav-edit-entry:hover {
      border-color: rgba(242,138,45,0.75);
      transform: translateY(-1px);
      box-shadow: 0 8px 26px -10px rgba(242,138,45,0.55);
    }
    .nav-edit-entry:hover .nav-edit-icon { transform: scale(1.12) rotate(-6deg); }
    .nav-edit-icon { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
    .nav-edit-sparkle { animation: navEditSparkle 1.8s ease-in-out infinite; }
    .nav-edit-badge {
      background: linear-gradient(135deg, #F58220 0%, #E26A2C 100%);
      box-shadow: 0 2px 8px -2px rgba(242,138,45,0.7), inset 0 1px 0 rgba(255,255,255,0.35);
      animation: navEditPulse 2.2s ease-in-out infinite;
    }
    .theme-light .nav-edit-entry {
      background: linear-gradient(135deg, rgba(211,84,0,0.10) 0%, rgba(226,106,44,0.08) 50%, rgba(211,84,0,0.12) 100%);
      border-color: rgba(211,84,0,0.35);
    }
    .theme-light .nav-edit-entry:hover {
      border-color: rgba(211,84,0,0.75);
      box-shadow: 0 8px 26px -10px rgba(211,84,0,0.45);
    }

    .nav-panel {
      background: var(--nav-panel);
      border: 1px solid var(--nav-line);
      box-shadow: 0 24px 60px -20px rgba(0,0,0,0.4);
    }

    @keyframes ctaPulse {
      0%, 100% { box-shadow: 0 8px 22px -8px var(--nav-primary-glow), inset 0 1px 0 rgba(255,255,255,0.3); }
      50%      { box-shadow: 0 12px 32px -8px var(--nav-primary-glow), 0 0 0 8px rgba(242,138,45,0), inset 0 1px 0 rgba(255,255,255,0.35); }
    }
    .nav-cta-pill {
      animation: ctaPulse 3.2s ease-in-out infinite;
    }

    @keyframes logoOrbit {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .nav-logo-orbit {
      animation: logoOrbit 12s linear infinite;
    }
  `}</style>
);
const LogoImage = ({ className = "h-full w-full object-contain p-1" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className="h-full w-full flex items-center justify-center font-bold text-lg"
        style={{ color: "var(--nav-primary-2)" }}
      >
        D
      </div>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt="Dealora"
      className={className}
      onError={() => {
        if (idx < sources.length - 1) setIdx(idx + 1);
        else setFailed(true);
      }}
    />
  );
};

const ICON_COLORS = {
  "/mobiles":         { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "/vehicles":        { fg: "#164B3B", bg: "rgba(22,75,59,0.12)" },
  "/electronics":     { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "/property":        { fg: "#B23A2E", bg: "rgba(178,58,46,0.12)" },
  "/feed":            { fg: "#F58220", bg: "rgba(242,138,45,0.14)" },
  "/trending":        { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "/chat":            { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "/saved":           { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "/post-ad":         { fg: "#D35400", bg: "rgba(211,84,0,0.14)" },
  "/my-listings":     { fg: "#164B3B", bg: "rgba(22,75,59,0.12)" },
  "/dashboard":       { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "/settings":        { fg: "#7A6F5D", bg: "rgba(122,111,93,0.12)" },
  "/study-posts":     { fg: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  "/wallet":          { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "/premium":         { fg: "#D35400", bg: "rgba(211,84,0,0.14)" },
  "/help":            { fg: "#3D7BB8", bg: "rgba(61,123,184,0.12)" },
  "/contact":         { fg: "#3D7BB8", bg: "rgba(61,123,184,0.12)" },
  "/admin":           { fg: "#7C3AED", bg: "rgba(124,58,237,0.12)" },
  "/edit-image":      { fg: "#F58220", bg: "rgba(242,138,45,0.18)" },
  "/image-generator": { fg: "#F58220", bg: "rgba(242,138,45,0.18)" },
  "/ai-image":        { fg: "#F58220", bg: "rgba(242,138,45,0.18)" },
    "/marketplace-chat": { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
};

const getIconColor = (path) =>
  ICON_COLORS[path] || { fg: "#D35400", bg: "rgba(211,84,0,0.12)" };

const panelVariants = {
  hidden: { opacity: 0, y: -16, scale: 0.985, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } },
};
const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.035, delayChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } },
};
const drawerItemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.035, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

const formatRs = (num) => `Rs ${Number(num || 0).toLocaleString("en-US")}`;

/* ═══════════════════════════════════════════════════════════════
   MINI CART
   ═══════════════════════════════════════════════════════════════ */
const MiniCart = ({ open, onClose, cart, onRemove, onOpenFull }) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!open) { setIsOpening(false); return; }
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const subtotal = cart.reduce((s, c) => s + (Number(c.price) || 0) * (c.qty || 1), 0);
  const count = cart.reduce((s, c) => s + (c.qty || 1), 0);

  const handleViewFullCart = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => onOpenFull(), 420);
  };

  const goToItemDetail = (item, e) => {
    if (e) e.stopPropagation();
    onClose();
    const base = item.detailPath || ({
      Vehicles: "vehicle", Cars: "vehicle", Bikes: "vehicle", Trucks: "vehicle",
      Mobiles: "mobile", Phones: "mobile", Tablets: "mobile", Laptops: "mobile",
      Property: "property", House: "property", Apartment: "property", Plot: "property",
      Commercial: "property", "Farm House": "property",
      Electronics: "electronic", TVs: "electronic", Cameras: "electronic",
      Audio: "electronic", Gaming: "electronic",
    }[item.category]);
    if (base && item.id) navigate(`/${base}/${item.id}`);
    else navigate("/orders");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={isOpening ? undefined : onClose}
            className="sm:hidden fixed inset-0 z-[140] bg-black/60"
            aria-hidden="true"
          />

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={[
              "z-[150] nav-panel rounded-2xl overflow-hidden",
              "fixed left-3 right-3 top-[calc(env(safe-area-inset-top,0px)+5rem)]",
              "sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+14px)] sm:w-[340px]",
            ].join(" ")}
            role="dialog"
            aria-label="Mini cart"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--nav-primary-2), transparent)" }} />

            <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b" style={{ borderColor: "var(--nav-line)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <FaShoppingCart className="text-[var(--nav-primary-2)] text-[12px] flex-shrink-0" />
                <span className="font-ticket-display text-sm font-bold text-[var(--nav-txt)] truncate">Your Cart</span>
                <span className="font-ticket-body text-[10px] font-bold text-[var(--nav-txt-faint)] truncate">· {count} {count === 1 ? "item" : "items"}</span>
              </div>
              <button
                onClick={onClose} disabled={isOpening}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--nav-txt-faint)] hover:bg-[var(--nav-surface)] flex-shrink-0 disabled:opacity-40 transition-colors"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FaShoppingCart className="text-2xl text-[var(--nav-txt-faint)]/40 mx-auto mb-2" />
                <p className="font-ticket-body text-xs text-[var(--nav-txt-faint)]">Your cart is empty</p>
              </div>
            ) : (
              <div className="max-h-[50vh] sm:max-h-[280px] overflow-y-auto py-2">
                {cart.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-[var(--nav-surface)] transition-colors">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--nav-surface)" }}>
                      <img src={item.image || "/car1.png"} alt={item.title} className="w-full h-full object-contain p-1" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-ticket-body text-[11px] font-bold text-[var(--nav-txt)] truncate leading-tight">{item.title}</p>
                      <p className="font-ticket-body text-[9px] text-[var(--nav-txt-faint)] truncate mt-0.5">
                        {item.location || item.category} · Qty {item.qty || 1}
                      </p>
                      <button
                        onClick={(e) => goToItemDetail(item, e)}
                        disabled={isOpening}
                        className="mt-1 inline-flex items-center gap-1 font-ticket-body text-[9.5px] font-bold text-[var(--nav-primary-2)] underline decoration-[var(--nav-primary-2)]/40 underline-offset-2 hover:decoration-[var(--nav-primary-2)] disabled:opacity-40 transition-colors"
                      >
                        Learn more
                        <FaArrowRight className="text-[7px]" />
                      </button>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="font-ticket-display text-[11px] font-bold text-[var(--nav-txt)] tabular-nums whitespace-nowrap">
                        {formatRs((item.price || 0) * (item.qty || 1))}
                      </p>
                      <button
                        onClick={() => onRemove(item.id)}
                        disabled={isOpening}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-[#B23A2E] hover:bg-[#B23A2E]/10 transition-colors disabled:opacity-40"
                        title="Remove"
                      >
                        <FaTrash className="text-[9px]" />
                      </button>
                    </div>
                  </div>
                ))}
                {cart.length > 5 && (
                  <p className="px-4 py-2 font-ticket-body text-[10px] text-[var(--nav-txt-faint)] text-center">
                    +{cart.length - 5} more items
                  </p>
                )}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t px-4 py-3" style={{ borderColor: "var(--nav-line)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">Subtotal</span>
                  <span className="font-ticket-display text-base font-bold text-[var(--nav-primary-2)] tabular-nums">{formatRs(subtotal)}</span>
                </div>

                <motion.button
                  whileHover={isOpening ? {} : { y: -1 }}
                  whileTap={isOpening ? {} : { scale: 0.97 }}
                  onClick={handleViewFullCart}
                  disabled={isOpening}
                  className="relative w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-ticket-body text-[11px] font-extrabold tracking-wide overflow-hidden disabled:cursor-wait transition-all"
                  style={{
                    background: "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))",
                    color: "#0B0B12",
                    boxShadow: "0 8px 24px -6px var(--nav-primary-glow)",
                  }}
                >
                  {isOpening && (
                    <motion.span
                      initial={{ x: "-120%" }} animate={{ x: "120%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-y-0 w-1/2 pointer-events-none"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
                    />
                  )}
                  {isOpening ? (
                    <>
                      <FaSpinner className="text-[11px] relative z-10 animate-spin" />
                      <span className="relative z-10">Opening cart…</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">View full cart</span>
                      <FaArrowRight className="text-[9px] relative z-10" />
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PLAN BADGE — reads free / seller / pro
   ═══════════════════════════════════════════════════════════════ */
const PlanBadge = ({ planId = "free", isVerified = false, size = "md" }) => {
  const textSize = size === "sm" ? "text-[8.5px]" : "text-[9px]";
  const padSize = "px-2 py-0.5";
  const iconSize = size === "sm" ? "text-[6.5px]" : "text-[7px]";

  if (planId === "pro") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-ticket-body ${textSize} font-bold ${padSize} rounded-full border`}
        style={{
          borderColor: "var(--nav-primary)",
          color: "var(--nav-primary-2)",
          background: "var(--nav-primary-soft)",
        }}
      >
        <FaCrown className={iconSize} />
        Pro Seller
      </span>
    );
  }

  if (planId === "seller") {
    return (
      <span
        className={`inline-flex items-center gap-1 font-ticket-body ${textSize} font-bold ${padSize} rounded-full border`}
        style={{ borderColor: "var(--nav-primary)", color: "var(--nav-primary-2)" }}
      >
        <FaBolt className={iconSize} />
        Seller
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-ticket-body ${textSize} font-bold ${padSize} rounded-full border`}
      style={{ borderColor: "var(--nav-line-str)", color: "var(--nav-txt-faint)" }}
    >
      <FaStar className={iconSize} />
      Starter
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AVATAR WITH PLAN
   ═══════════════════════════════════════════════════════════════ */
const AvatarWithPlan = ({
  avatar, initial, displayName,
  planId = "free", isVerified,
  size = "lg", onNavigate,
}) => {
  const dims = size === "sm" ? "h-14 w-14" : "h-16 w-16";
  const textSize = size === "sm" ? "text-[7px]" : "text-[8px]";
  const innerPad = size === "sm" ? "inset-[2.5px]" : "inset-[3px]";

  const isPremium = planId !== "free";
  const ringColor = isPremium ? "var(--nav-primary-2)" : "var(--nav-line-str)";

  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-label={isPremium ? "Manage subscription" : "Upgrade to premium"}
      className="relative flex-shrink-0 group/avatar focus:outline-none"
    >
      <div className={`relative ${dims}`}>
        <div
          className="absolute inset-0 rounded-full p-[2.5px] transition-colors duration-500"
          style={{ background: `conic-gradient(${ringColor} 0deg, ${ringColor} 360deg)` }}
        />

        <div
          className={`absolute ${innerPad} rounded-full overflow-hidden flex items-center justify-center`}
          style={{ background: "var(--nav-primary-2)", border: "2px solid var(--nav-bg)" }}
        >
          {avatar ? (
            <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className={`text-[#0B0B12] font-ticket-display font-bold ${size === "sm" ? "text-lg" : "text-xl"}`}>
              {initial}
            </span>
          )}
        </div>

        {!isPremium && (
          <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover/avatar:ring-[var(--nav-primary-2)]/60 transition-all duration-300" />
        )}
      </div>

      {planId === "pro" ? (
        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 ${textSize} font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap bg-[#164B3B] text-white shadow-[0_2px_8px_-2px_rgba(22,75,59,0.5)]`}>
          <FaCrown className="text-[6px]" />
          PRO
        </span>
      ) : planId === "seller" ? (
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 ${textSize} font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap text-[#0B0B12]`}
          style={{
            background: "linear-gradient(90deg, var(--nav-primary-2), var(--nav-primary-3))",
            boxShadow: "0 2px 8px -2px var(--nav-primary-glow)",
          }}
        >
          <FaBolt className="text-[6px]" />
          SELLER
        </span>
      ) : (
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 ${textSize} font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap text-[var(--nav-txt-faint)]`}
          style={{ background: "var(--nav-surface)", border: "1px solid var(--nav-line)" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-current animate-ping opacity-40" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
          </span>
          FREE
        </span>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE DROPDOWN
   ═══════════════════════════════════════════════════════════════ */
const ProfileDropdown = ({
  user, onClose, onLogout, navigate,
  planId = "free", planName = "Starter", isVerified,
}) => {
  const ref = useRef(null);
  const isPremium = planId !== "free";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const showAdminLink = isAdminEmail(user?.email);
  const menuItems = [
    { icon: FaList,    label: "My Listings",  path: "/my-listings" },
    { icon: FaWallet,  label: "Live Sales",   path: "/wallet" },
    { icon: FaImage,   label: "AI Studio",    path: "/ai-image" },
    { icon: FaCrown,   label: isPremium ? "Manage Plan" : "Upgrade Plan", path: "/premium" },
    ...(showAdminLink ? [{ icon: FaChartLine, label: "Admin Dashboard", path: "/admin" }] : []),
    { icon: FaCog,     label: "Settings",     path: "/settings" },
    { icon: FaHeadset, label: "Contact Us",   path: "/contact" },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const avatar = user?.user_metadata?.avatar_url || null;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-1rem)] nav-panel rounded-[24px] overflow-hidden"
    >
      <div className="relative px-5 pt-5 pb-2">
        <div className="flex items-start gap-4">
          <AvatarWithPlan
            avatar={avatar}
            initial={initial}
            displayName={displayName}
            planId={planId}
            isVerified={isVerified}
            size="lg"
            onNavigate={() => { navigate("/premium"); onClose(); }}
          />
          <div className="flex-1 min-w-0 pt-1">
            <button
              onClick={() => { navigate("/settings"); onClose(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-ticket-body font-semibold text-[var(--nav-txt)] hover:bg-[var(--nav-surface)] transition-colors"
              style={{ border: "1px solid var(--nav-line)" }}
            >
              Edit Profile
              <FaChevronDown className="text-[8px] -rotate-90" />
            </button>
          </div>
        </div>

        <h3 className="font-ticket-display text-[20px] font-bold text-[var(--nav-txt)] mt-3 leading-tight">{displayName}</h3>
        <p className="font-ticket-body text-[12px] text-[var(--nav-txt-faint)] mt-0.5 truncate">{email}</p>

        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <PlanBadge planId={planId} isVerified={isVerified} />
        </div>
      </div>

      <div className="mx-5 mt-4 mb-4 flex items-center rounded-2xl overflow-hidden" style={{ border: "1px solid var(--nav-line)", background: "var(--nav-surface)" }}>
        <div className="flex-1 flex items-center justify-center gap-1.5 py-3" style={{ borderRight: "1px solid var(--nav-line)" }}>
          <FaStar className="text-[var(--nav-primary-2)] text-[11px]" />
          <span className="font-ticket-body text-[12px] font-bold text-[var(--nav-txt)]">0</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5 py-3">
          <FaCrown className="text-[var(--nav-primary-2)] text-[11px]" />
          <span className="font-ticket-body text-[12px] font-bold text-[var(--nav-txt)]">
            {planId === "pro" ? "PRO" : planId === "seller" ? "SELLER" : "FREE"}
          </span>
        </div>
      </div>

      <div className="py-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isAdminItem = item.path === "/admin";
          const colors = getIconColor(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className="group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--nav-surface)]"
            >
              <Icon
                className="text-[15px] transition-colors flex-shrink-0"
                style={{ color: isAdminItem ? colors.fg : "var(--nav-txt-soft)" }}
              />
              <span className="font-ticket-body text-[13px] font-medium text-[var(--nav-txt)] transition-colors group-hover:text-[var(--nav-primary-2)]">
                {item.label}
              </span>
              {isAdminItem && (
                <span className="ml-auto inline-flex items-center gap-1 font-ticket-body text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-[#7C3AED]/15 text-[#7C3AED] uppercase tracking-wider">
                  <FaShieldAlt className="text-[6px]" />
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="px-2 pb-3 pt-1">
        <div className="h-px mx-2 mb-2" style={{ background: "var(--nav-line)" }} />
        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:bg-[#B23A2E]/[0.06]"
        >
          <FaSignOutAlt className="text-[15px] text-[#B23A2E] flex-shrink-0" />
          <span className="font-ticket-body text-[13px] font-semibold text-[#B23A2E]">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER — mobile drawer
   ═══════════════════════════════════════════════════════════════ */
const SectionHeader = ({ label, delay = 0.25 }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center gap-3 px-2 mb-3"
  >
    <span className="font-ticket-body text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nav-primary-2)]">
      {label}
    </span>
    <div
      className="h-px flex-1"
      style={{ background: `linear-gradient(90deg, var(--nav-primary-2) 30%, transparent)` }}
    />
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN NAVBAR
   ═══════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // ⭐ Plan state — single source of truth
  const planCtx = usePlan();
  const planId = planCtx?.planId || "free";
  const planName = planCtx?.plan?.name || "Starter";
  const isPremium = planId !== "free";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [cart, setCart] = useState(() => readCart(user?.id));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);

  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const megaRef = useRef(null);
  const megaCloseTimer = useRef(null);

  const [userAvatar, setUserAvatar] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const cartRef = useRef(null);

  /* ═══ SMOOTH SCROLL TO HOME SECTION ═══ */
  const handleSectionNav = (e, id) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const HEADER_OFFSET = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const id = location.hash.replace("#", "");
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const HEADER_OFFSET = 96;
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  const browseGroups = [
    {
      title: "Buy & Sell",
      links: [
        { path: "/mobiles",     icon: FaMobileAlt, label: "Mobiles & Tablets", description: "iPhone, Samsung, Xiaomi & more" },
        { path: "/vehicles",    icon: FaCar,       label: "Cars & Bikes",      description: "Sedans, SUVs, motorcycles" },
        { path: "/electronics", icon: FaLaptop,    label: "Electronics",       description: "Laptops, TVs, cameras" },
        { path: "/property",    icon: FaHome,      label: "Property",          description: "Homes, plots, commercial" },
      ],
    },
{
  title: "Discover",
  links: [
    { path: "/feed",                icon: FaNewspaper,     label: "Marketplace Feed", description: "All live listings", badge: "New" },
    { path: "/marketplace-chat",    icon: FaCommentDots,   label: "Messages",         description: "Chat with buyers & sellers" },
    { path: "/momento",             icon: FaRegPaperPlane, label: "Momento",          description: "Share your moments & stories", badge: "New" },
    { path: "/ai-image",            icon: FaMagic,         label: "AI Studio",        description: "Generate images & remove BG", badge: "Pro", isSpecial: true },
  ],
},
  ];

  const accountGroups = [
    {
      title: "Selling",
      links: [
        { path: "/post-ad",     icon: FaPlus,     label: "Post an Ad",  description: "List a new item" },
        { path: "/my-listings", icon: FaList,     label: "My Listings", description: "Manage your ads" },
        { path: "/dashboard",   icon: FaChartBar, label: "Analytics",   description: "Views & performance" },
        { path: "/settings",    icon: FaCog,      label: "Settings",    description: "Profile & preferences" },
      ],
    },
    {
      title: "Account",
      links: [
        { path: "/wallet",  icon: FaWallet, label: "Live Sales", description: "Sales & Value Sold" },
        { path: "/premium", icon: FaCrown,  label: "Premium",    description: "Upgrade or manage" },
      ],
    },
  ];

  useEffect(() => {
    const updateCart = () => setCart(readCart(user?.id));
    updateCart();
    window.addEventListener("cart:update", updateCart);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart:update", updateCart);
      window.removeEventListener("storage", updateCart);
    };
  }, [user?.id]);

  const handleRemoveFromCart = (id) => {
    const next = cart.filter((c) => c.id !== id);
    setCart(next);
    writeCart(next, user?.id);
  };

  const handleOpenFullCart = () => {
    setIsCartOpen(false);
    navigate("/cart");
  };

  const openMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setIsMegaOpen(true);
  };
  const closeMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = setTimeout(() => setIsMegaOpen(false), 260);
  };
  const handleMegaLinkClick = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setIsMegaOpen(false);
  };

  const loadUserData = async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsData) {
        if (settingsData.avatar) setUserAvatar(settingsData.avatar);
        if (settingsData.full_name) setUserFullName(settingsData.full_name);
        if (settingsData.email) setUserEmail(settingsData.email);
      }
      if (!userEmail && user?.email) setUserEmail(user.email);
      if (!userFullName && user?.user_metadata?.full_name) setUserFullName(user.user_metadata.full_name);

      // ⭐ Plan is now sourced from PlanContext — no DB read needed here.

      const { data: statsData } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsData) {
        setUserLevel(statsData.level || 1);
        setUserXp(statsData.xp || 0);
        setUserStreak(statsData.streak || 0);
        setIsVerified(statsData.verified || false);
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUserData(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const settingsSubscription = supabase
      .channel("user-settings-changes")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "user_settings",
        filter: `user_id=eq.${user.id}`,
      }, () => loadUserData())
      .subscribe();
    return () => settingsSubscription.unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); setIsMegaOpen(false); setIsCartOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchFocused(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
      if (megaRef.current && !megaRef.current.contains(event.target)) setIsMegaOpen(false);
      if (cartRef.current && !cartRef.current.contains(event.target)) setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false); setIsSearchOpen(false); setIsProfileOpen(false);
    setIsNotificationOpen(false); setIsMegaOpen(false); setIsCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsSearchFocused(false);
      setSearchQuery("");
    }
  };

  const isActive = (path) => location.pathname === path;

  const getUserInitial = () => {
    if (userFullName) return userFullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return <FaUser />;
  };
  const getUserName = () => userFullName || user?.email?.split("@")[0] || "User";

  const mobileProfileItems = [
    { icon: FaList,  label: "My Listings", path: "/my-listings", color: getIconColor("/my-listings") },
    { icon: FaWallet, label: "Live Sales", path: "/wallet",      color: getIconColor("/wallet") },
    { icon: FaCrown, label: isPremium ? "Manage Plan" : "Upgrade Plan", path: "/premium", color: getIconColor("/premium") },
    ...(isAdminEmail(user?.email)
      ? [{ icon: FaChartLine, label: "Admin Dashboard", path: "/admin", color: getIconColor("/admin") }]
      : []),
    { icon: FaCog,      label: "Settings",   path: "/settings", color: getIconColor("/settings") },
    { icon: FaHeadset,  label: "Contact Us", path: "/contact",  color: getIconColor("/contact") },
  ];

  if (isLoading) {
    return (
      <nav className={`nav-advanced-shell theme-${theme}`}>
        <FontStyles />
        <div className="nav-advanced-inner">
          <div className="nav-advanced-glass px-4" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
 {/* ═══ LOGO — Loading state ═══ */}
<Link
  to="/feed"
  className="group flex items-center flex-shrink-0"
>
  <div className="h-24 w-24 sm:h-24 sm:w-24 flex items-center justify-center overflow-hidden">
    <div
      className="logo-inner"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <LogoImage />
    </div>
  </div>

  <div className="ml-2 sm:ml-2.5 leading-none">
    <span
      className="font-ticket-display text-base sm:text-[20px] font-bold tracking-[-0.03em]"
      style={{ color: "var(--nav-txt)" }}
    >
      Dealora
    </span>
  </div>

  <style>{`
    /* ═══ Force the logo to look IDENTICAL in dark mode ═══ */
    .theme-dark .logo-inner,
    html.dark .logo-inner,
    body.theme-dark .logo-inner,
    body.dark .logo-inner {
      filter: invert(1) hue-rotate(180deg) brightness(1.1);
    }
  `}</style>
</Link>
            <FaSpinner className="animate-spin text-[var(--nav-primary-2)] text-sm" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <FontStyles />
      <nav
        className={`nav-advanced-shell theme-${theme} ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
        style={{
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          paddingTop: isScrolled ? 8 : 12,
          paddingBottom: isScrolled ? 8 : 12,
        }}
      >
        <div className="nav-advanced-inner">
          <div className={`nav-advanced-glass ${isScrolled ? "is-scrolled" : ""}`} style={{ padding: "0 12px" }}>
            <div className="flex items-center justify-between h-[52px] sm:h-[56px] gap-2">

  <Link
  to="/feed"
  className="group flex items-center flex-shrink-0"
>
  <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center overflow-hidden">
    <div
      className="logo-inner"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <LogoImage />
    </div>
  </div>


  <style>{`
    /* ═══ Force the logo to look IDENTICAL in dark mode ═══ */
    .theme-dark .logo-inner,
    html.dark .logo-inner {
      filter: invert(1) hue-rotate(180deg) brightness(1.1);
    }
  `}</style>
</Link>

              {/* ═══ DESKTOP CENTER ═══ */}
              <div className="hidden lg:flex flex-1 justify-center items-center gap-3">
                {!user && (
                  <div className="nav-guest-pill inline-flex items-center gap-0.5 rounded-full px-1.5 py-1.5">
                    {GUEST_NAV_LINKS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={(e) => handleSectionNav(e, item.id)}
                        className="nav-guest-pill-link"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {user && (
                  <button
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                    className="group/explore relative inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full font-ticket-body text-xs font-bold transition-all duration-500 overflow-hidden"
                    style={
                      isMegaOpen
                        ? { color: "#0B0B12", boxShadow: "0 8px 24px -6px var(--nav-primary-glow)" }
                        : { color: "var(--nav-txt)", boxShadow: "0 4px 16px -6px rgba(0,0,0,0.2)" }
                    }
                  >
                    <span
                      className="absolute inset-0 rounded-full transition-all duration-500"
                      style={{
                        background: isMegaOpen
                          ? "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))"
                          : "var(--nav-surface)",
                      }}
                    />
                    <span
                      className="absolute inset-0 rounded-full border transition-all duration-500"
                      style={{ borderColor: isMegaOpen ? "transparent" : "var(--nav-line)" }}
                    />
                    <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/explore:translate-x-full transition-transform duration-1000 ease-out" />
                    </span>
                    <span
                      className="relative flex items-center justify-center h-7 w-7 rounded-full z-10 transition-all duration-500"
                      style={{ background: isMegaOpen ? "#0B0B12" : "var(--nav-primary-2)" }}
                    >
                      {!isMegaOpen && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: "var(--nav-primary-2)" }} />
                      )}
                      <span className="relative grid grid-cols-2 gap-[3px]">
                        <span className="h-1 w-1 rounded-full transition-colors duration-500" style={{ background: isMegaOpen ? "var(--nav-primary-2)" : "#0B0B12" }} />
                        <span className="h-1 w-1 rounded-full transition-colors duration-500" style={{ background: isMegaOpen ? "var(--nav-primary-2)" : "#0B0B12" }} />
                        <span className="h-1 w-1 rounded-full transition-colors duration-500" style={{ background: isMegaOpen ? "var(--nav-primary-2)" : "#0B0B12" }} />
                        <span className="h-1 w-1 rounded-full transition-colors duration-500" style={{ background: isMegaOpen ? "var(--nav-primary-2)" : "#0B0B12" }} />
                      </span>
                    </span>
                    <span className="relative z-10 whitespace-nowrap">Browse All</span>
                    <span
                      className="relative z-10 flex items-center justify-center h-5 w-5 rounded-full transition-colors duration-500"
                      style={{ background: "var(--nav-surface-2)" }}
                    >
                      <FaChevronDown className={`text-[9px] transition-transform duration-500 ${isMegaOpen ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                )}
              </div>

              {/* ═══ RIGHT SIDE ═══ */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

                {/* Cart */}
                {user && (
                  <div ref={cartRef} className="relative">
                    <motion.button
                      onClick={() => setIsCartOpen((v) => !v)}
                      whileHover={{ scale: 1.06, y: -1 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="nav-icon-btn"
                      aria-label="Cart"
                      aria-expanded={isCartOpen}
                    >
                      {cartCount > 0 && (
                        <motion.span
                          aria-hidden
                          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.15, 0.35] }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            background: "radial-gradient(circle, var(--nav-primary-glow) 0%, transparent 70%)",
                            filter: "blur(6px)",
                          }}
                        />
                      )}

                      <motion.span
                        animate={cartCount > 0 ? { rotate: [0, -8, 8, -8, 0] } : { rotate: 0 }}
                        transition={cartCount > 0 ? { duration: 1.6, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" } : { duration: 0.2 }}
                        className="relative z-10 flex items-center justify-center"
                      >
                        <FaShoppingCart className="text-[13px] transition-colors duration-300" />
                      </motion.span>

                      {cartCount > 0 && (
                        <motion.span
                          key={cartCount}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 520, damping: 18 }}
                          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full font-ticket-body text-[8px] font-bold text-[#0B0B12] flex items-center justify-center z-20"
                          style={{
                            background: "linear-gradient(135deg, var(--nav-primary-2) 0%, var(--nav-primary) 100%)",
                            border: "2px solid var(--nav-bg)",
                            boxShadow: "0 4px 10px -2px var(--nav-primary-glow)",
                          }}
                        >
                          <motion.span
                            aria-hidden
                            animate={{ scale: [1, 1.6, 1], opacity: [0.55, 0, 0.55] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{ background: "var(--nav-primary-2)" }}
                          />
                          <span className="relative z-10">
                            {cartCount > 99 ? "99+" : cartCount}
                          </span>
                        </motion.span>
                      )}
                    </motion.button>

                    <MiniCart
                      open={isCartOpen}
                      onClose={() => setIsCartOpen(false)}
                      cart={cart}
                      onRemove={handleRemoveFromCart}
                      onOpenFull={handleOpenFullCart}
                    />
                  </div>
                )}

                {/* Theme toggle */}
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="nav-icon-btn group"
                  aria-label="Toggle theme"
                  title={theme === "light" ? "Switch to dark" : "Switch to light"}
                >
                  <motion.span
                    animate={{ rotate: theme === "light" ? 0 : 360 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <motion.span
                      animate={{
                        opacity: theme === "light" ? 1 : 0,
                        scale: theme === "light" ? 1 : 0.4,
                        rotate: theme === "light" ? 0 : -90,
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute flex items-center justify-center"
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                        className="flex items-center justify-center"
                      >
                        <FaSun
                          className="text-[13px]"
                          style={{
                            color: "var(--nav-primary-2)",
                            filter: "drop-shadow(0 0 4px var(--nav-primary-glow))",
                          }}
                        />
                      </motion.span>
                    </motion.span>

                    <motion.span
                      animate={{
                        opacity: theme === "light" ? 0 : 1,
                        scale: theme === "light" ? 0.4 : 1,
                        rotate: theme === "light" ? 90 : 0,
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute flex items-center justify-center"
                    >
                      <motion.span
                        animate={{ y: [0, -1.2, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex items-center justify-center"
                      >
                        <FaMoon
                          className="text-[13px]"
                          style={{
                            color: "var(--nav-txt)",
                            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.35))",
                          }}
                        />
                      </motion.span>
                    </motion.span>
                  </motion.span>
                </motion.button>

                {/* Profile / guest */}
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="lg:hidden flex items-center gap-0.5 p-0.5 rounded-full hover:bg-[var(--nav-surface)] transition-all group"
                      aria-label="Open menu"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ border: "1px solid var(--nav-primary-2)" }}
                      >
                        {userAvatar ? (
                          <img src={userAvatar} alt={getUserName()} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center" style={{ background: "var(--nav-primary-2)" }}>
                            <span className="text-[#0B0B12] font-ticket-body font-bold text-[10px]">{getUserInitial()}</span>
                          </div>
                        )}
                      </div>
                      <FaChevronDown className={`text-[var(--nav-txt)] text-[8px] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="hidden lg:flex items-center gap-1.5 p-0.5 pl-1 rounded-full hover:bg-[var(--nav-surface)] transition-all group"
                      aria-label="Open profile"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ border: "1px solid var(--nav-primary-2)" }}
                      >
                        {userAvatar ? (
                          <img src={userAvatar} alt={getUserName()} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center" style={{ background: "var(--nav-primary-2)" }}>
                            <span className="text-[#0B0B12] font-ticket-body font-bold text-[10px]">{getUserInitial()}</span>
                          </div>
                        )}
                      </div>
                      <FaChevronDown className={`text-[var(--nav-txt)] text-[8px] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <ProfileDropdown
                          user={{ ...user, user_metadata: { ...user?.user_metadata, full_name: userFullName, avatar_url: userAvatar } }}
                          onClose={() => setIsProfileOpen(false)}
                          onLogout={handleLogout}
                          navigate={navigate}
                          planId={planId}
                          planName={planName}
                          isVerified={isVerified}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <motion.div
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    >
                      <Link
                        to="/signin"
                        className="group/login relative inline-flex items-center gap-1.5 rounded-full overflow-hidden font-ticket-body font-semibold transition-colors duration-300"
                        style={{
                          padding: "7px 12px",
                          fontSize: "12px",
                          background: "var(--nav-surface)",
                          border: "1px solid var(--nav-line)",
                          color: "var(--nav-txt)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/login:translate-x-full transition-transform duration-1000 ease-out" />
                        </span>
                        <FaSignInAlt className="relative z-10 flex-shrink-0" style={{ fontSize: 10, color: "var(--nav-primary-2)" }} />
                        <span className="relative z-10 whitespace-nowrap hidden xs:inline">Log In</span>
                        <span className="relative z-10 whitespace-nowrap xs:hidden">In</span>
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -1, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      <Link
                        to="/signup"
                        className="nav-cta-pill group/signup relative inline-flex items-center gap-1.5 rounded-full overflow-hidden font-ticket-body font-bold transition-all duration-300 flex-shrink-0"
                        style={{
                          padding: "8px 14px",
                          fontSize: "12px",
                          background: "linear-gradient(120deg, var(--nav-primary-2) 0%, var(--nav-primary-3) 100%)",
                          color: "#0B0B12",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/signup:translate-x-full transition-transform duration-1000 ease-out" />
                        </span>
                        <FaUserPlus className="relative z-10 flex-shrink-0 transition-transform duration-300 group-hover/signup:rotate-12" style={{ fontSize: 10 }} />
                        <span className="relative z-10 whitespace-nowrap hidden xs:inline">Sign Up</span>
                        <span className="relative z-10 whitespace-nowrap xs:hidden">Join</span>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MEGA PANEL ═══ */}
        <AnimatePresence>
          {user && isMegaOpen && (
            <motion.div
              ref={megaRef}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              className="hidden lg:block absolute top-full left-0 right-0 pt-3 px-3 sm:px-5 lg:px-6"
            >
              <div className="max-w-7xl mx-auto">
                <div className="nav-panel rounded-3xl overflow-hidden">
                  <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent, var(--nav-primary-2), transparent)" }} />
                  <div className="px-6 py-7">
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-7">
                        {browseGroups.map((group, gi) => (
                          <div key={group.title} className={gi > 0 ? "mt-6" : ""}>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="font-ticket-body text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nav-primary-2)]">{group.title}</span>
                              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, var(--nav-primary-2) 30%, transparent)` }} />
                            </div>
                            <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2.5">
                              {group.links.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                if (item.isSpecial) {
                                  return (
                                    <motion.div key={item.label} variants={itemVariants}>
                                      <Link to={item.path} onClick={handleMegaLinkClick} className="nav-edit-entry group flex items-start gap-3.5 p-3.5 rounded-2xl">
                                        <span
                                          className="relative flex items-center justify-center h-11 w-11 rounded-xl flex-shrink-0"
                                          style={{
                                            background: "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))",
                                            color: "#0B0B12",
                                            boxShadow: "0 8px 22px -8px var(--nav-primary-glow), inset 0 1px 0 rgba(255,255,255,0.3)",
                                          }}
                                        >
                                          <Icon className="text-lg nav-edit-icon relative z-10" />
                                          <FaMagic className="nav-edit-sparkle absolute -top-1 -right-1 text-[9px] text-white drop-shadow" />
                                        </span>
                                        <div className="min-w-0 flex-1 relative z-10">
                                          <div className="flex items-center gap-2">
                                            <p className="font-ticket-display text-sm font-bold text-[var(--nav-txt)]">{item.label}</p>
                                            <span className="nav-edit-badge inline-flex items-center gap-1 font-ticket-body text-[8px] font-extrabold text-[#0B0B12] px-1.5 py-[3px] rounded-md uppercase tracking-wider">
                                              <FaGem className="text-[7px]" />
                                              Pro
                                            </span>
                                          </div>
                                          <p className="font-ticket-body text-[11px] text-[var(--nav-txt-soft)] mt-0.5">{item.description}</p>
                                        </div>
                                        <FaArrowRight className="relative z-10 text-[10px] self-center text-[var(--nav-primary-2)] transition-transform group-hover:translate-x-0.5" />
                                      </Link>
                                    </motion.div>
                                  );
                                }

                                return (
                                  <motion.div key={item.label} variants={itemVariants}>
                                    <Link
                                      to={item.path}
                                      onClick={handleMegaLinkClick}
                                      className="group flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-200"
                                      style={{
                                        background: active ? "var(--nav-primary-soft)" : "var(--nav-surface)",
                                        border: active ? "1px solid var(--nav-primary)" : "1px solid transparent",
                                      }}
                                    >
                                      <span
                                        className="flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                                        style={{ backgroundColor: getIconColor(item.path).bg, color: getIconColor(item.path).fg }}
                                      >
                                        <Icon className="text-lg" />
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-ticket-display text-sm font-bold text-[var(--nav-txt)]">{item.label}</p>
                                          {item.badge && (
                                            <span className="font-ticket-body text-[8px] font-bold text-[#0B0B12] px-1.5 py-0.5 rounded-md uppercase" style={{ background: "var(--nav-primary-2)" }}>
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-ticket-body text-[11px] text-[var(--nav-txt-faint)] mt-0.5">{item.description}</p>
                                      </div>
                                      <FaArrowRight
                                        className={`text-[10px] self-center transition-all duration-300 ${active ? "opacity-100 translate-x-0.5" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5"}`}
                                        style={{ color: getIconColor(item.path).fg }}
                                      />
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          </div>
                        ))}
                      </div>

                      <div className="col-span-5">
                        {accountGroups.map((group, gi) => (
                          <div key={group.title} className={gi > 0 ? "mt-6" : ""}>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="font-ticket-body text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nav-primary-2)]">{group.title}</span>
                              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, var(--nav-primary-2) 30%, transparent)` }} />
                            </div>
                            <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2.5">
                              {group.links.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                  <motion.div key={item.label} variants={itemVariants}>
                                    <Link
                                      to={item.path}
                                      onClick={handleMegaLinkClick}
                                      className="group flex flex-col items-center text-center gap-2 p-3.5 rounded-2xl transition-all duration-200 h-full"
                                      style={{
                                        background: active ? "var(--nav-primary-soft)" : "var(--nav-surface)",
                                        border: active ? "1px solid var(--nav-primary)" : "1px solid transparent",
                                      }}
                                    >
                                      <span
                                        className="flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-300 group-hover:scale-110"
                                        style={{ backgroundColor: getIconColor(item.path).bg, color: getIconColor(item.path).fg }}
                                      >
                                        <Icon className="text-lg" />
                                      </span>
                                      <div className="min-w-0">
                                        <p className="font-ticket-display text-xs font-bold text-[var(--nav-txt)]">{item.label}</p>
                                        <p className="font-ticket-body text-[10px] text-[var(--nav-txt-faint)] mt-0.5">{item.description}</p>
                                      </div>
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ MOBILE DRAWER ═══ */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`fixed inset-0 z-[9999] lg:hidden theme-${theme}`}
          >
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-[92vw] xs:w-[88vw] sm:w-[80vw] max-w-md flex flex-col overflow-hidden"
              style={{
                background: "var(--nav-bg)",
                borderLeft: "1px solid var(--nav-line)",
                boxShadow: "-24px 0 60px -20px rgba(0,0,0,0.5)",
              }}
            >
              <div
                aria-hidden
                className="h-[2px] w-full flex-shrink-0"
                style={{ background: "linear-gradient(90deg, transparent, var(--nav-primary-2), transparent)" }}
              />

              <div
                className="relative flex items-center justify-between px-5 py-4 flex-shrink-0 z-20"
                style={{
                  background: "var(--nav-bg)",
                  borderBottom: "1px solid var(--nav-line)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
  <Link
  to="/feed"
  onClick={() => setIsMenuOpen(false)}
  className="group flex items-center gap-2"
>
  <div className="h-14 w-14 flex items-center justify-center overflow-hidden flex-shrink-0">
    <div
      className="logo-inner"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <LogoImage />
    </div>
  </div>

  <style>{`
    /* ═══ Force the logo to look IDENTICAL in dark mode ═══ */
    .theme-dark .logo-inner,
    html.dark .logo-inner {
      filter: invert(1) hue-rotate(180deg) brightness(1.1);
    }
  `}</style>
</Link>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="relative h-9 w-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "var(--nav-surface)", border: "1px solid var(--nav-line)" }}
                  aria-label="Close menu"
                >
                  <FaTimes className="text-[13px]" style={{ color: "var(--nav-txt)" }} />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}>
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden mb-5 rounded-[22px] p-4"
                    style={{
                      background: "var(--nav-panel-2)",
                      border: "1px solid var(--nav-line)",
                      boxShadow: "0 12px 32px -20px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full"
                      style={{
                        background: "radial-gradient(circle, var(--nav-primary-glow) 0%, transparent 70%)",
                        filter: "blur(30px)",
                        opacity: 0.4,
                      }}
                    />

                    <div className="relative flex items-start gap-3.5">
                      <AvatarWithPlan
                        avatar={userAvatar}
                        initial={getUserInitial()}
                        displayName={getUserName()}
                        planId={planId}
                        isVerified={isVerified}
                        size="sm"
                        onNavigate={() => { navigate("/premium"); setIsMenuOpen(false); }}
                      />
                      <div className="flex-1 min-w-0 pt-1">
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => { navigate("/settings"); setIsMenuOpen(false); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-ticket-body font-bold transition-colors"
                          style={{
                            border: "1px solid var(--nav-line)",
                            color: "var(--nav-txt)",
                            background: "var(--nav-surface)",
                          }}
                        >
                          Edit Profile
                          <FaChevronDown className="text-[7px] -rotate-90" />
                        </motion.button>
                      </div>
                    </div>

                    <h3 className="relative font-ticket-display text-[18px] font-bold text-[var(--nav-txt)] mt-3 leading-tight">
                      {getUserName()}
                    </h3>
                    <p className="relative font-ticket-body text-[11px] text-[var(--nav-txt-faint)] mt-0.5 truncate">
                      {userEmail}
                    </p>

                    <div
                      className="relative mt-3 flex items-center rounded-xl overflow-hidden"
                      style={{ border: "1px solid var(--nav-line)", background: "var(--nav-surface)" }}
                    >
                      {[
                        { icon: FaStar, label: "Level", value: userLevel },
                        { icon: FaBolt, label: "XP",    value: userXp },
                        { icon: FaCrown, label: "Plan", value: planId === "pro" ? "PRO" : planId === "seller" ? "SELLER" : "FREE" },
                      ].map((s, idx, arr) => {
                        const Icon = s.icon;
                        return (
                          <div
                            key={s.label}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5"
                            style={{ borderRight: idx < arr.length - 1 ? "1px solid var(--nav-line)" : "none" }}
                          >
                            <Icon className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
                            <span className="font-ticket-body text-[11px] font-bold text-[var(--nav-txt)]">{s.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {user && (
                  <motion.nav
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="mb-5"
                  >
                    <SectionHeader label="My Account" />

                    <div className="space-y-1">
                      {mobileProfileItems.map((item, i) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const isAdminItem = item.path === "/admin";
                        return (
                          <motion.div
                            key={item.label}
                            custom={i}
                            variants={drawerItemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <Link
                              to={item.path}
                              onClick={() => setIsMenuOpen(false)}
                              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                              style={{ background: active ? "var(--nav-primary-soft)" : "transparent" }}
                            >
                              <div
                                className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                                style={{ backgroundColor: item.color.bg, color: item.color.fg }}
                              >
                                <Icon className="text-[13px]" />
                              </div>
                              <span
                                className="flex-1 min-w-0 font-ticket-body text-[13px] font-semibold truncate"
                                style={{ color: active ? "var(--nav-primary-2)" : "var(--nav-txt)" }}
                              >
                                {item.label}
                              </span>
                              {isAdminItem && (
                                <span className="inline-flex items-center gap-1 font-ticket-body text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-[#7C3AED]/15 text-[#7C3AED] uppercase">
                                  <FaShieldAlt className="text-[6px]" /> Admin
                                </span>
                              )}
                              <FaChevronRight
                                className="text-[9px] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                                style={{ color: active ? "var(--nav-primary-2)" : "var(--nav-txt-faint)" }}
                              />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.nav>
                )}

                {browseGroups.map((group, gi) => (
                  <nav key={group.title} className={gi > 0 ? "mb-5 mt-5" : "mb-5"}>
                    <SectionHeader label={group.title} delay={0.25 + gi * 0.08} />

                    <div className="space-y-1">
                      {group.links.map((item, i) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const colors = getIconColor(item.path);

                        if (item.isSpecial) {
                          return (
                            <motion.div
                              key={item.label}
                              custom={i + gi * 4}
                              variants={drawerItemVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <Link
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="group relative flex items-center gap-3 px-3 py-3 my-1.5 rounded-2xl overflow-hidden"
                                style={{
                                  background: "linear-gradient(135deg, var(--nav-primary-soft), transparent)",
                                  border: "1px solid var(--nav-primary)",
                                }}
                              >
                                <div
                                  className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0"
                                  style={{
                                    background: "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))",
                                    color: "#0B0B12",
                                  }}
                                >
                                  <Icon className="text-[13px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-ticket-body text-[13px] font-bold text-[var(--nav-txt)]">
                                      {item.label}
                                    </p>
                                    <span
                                      className="inline-flex items-center gap-1 font-ticket-body text-[8px] font-extrabold px-1.5 py-[3px] rounded-md uppercase tracking-wider"
                                      style={{ background: "var(--nav-primary-2)", color: "#0B0B12" }}
                                    >
                                      <FaGem className="text-[7px]" /> Pro
                                    </span>
                                  </div>
                                  <p className="font-ticket-body text-[10px] text-[var(--nav-txt-soft)] truncate mt-0.5">
                                    {item.description}
                                  </p>
                                </div>
                                <FaChevronRight
                                  className="text-[9px] group-hover:translate-x-0.5 transition-transform"
                                  style={{ color: "var(--nav-primary-2)" }}
                                />
                              </Link>
                            </motion.div>
                          );
                        }

                        return (
                          <motion.div
                            key={item.label}
                            custom={i + gi * 4}
                            variants={drawerItemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <Link
                              to={item.path}
                              onClick={() => setIsMenuOpen(false)}
                              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                              style={{ background: active ? "var(--nav-primary-soft)" : "transparent" }}
                            >
                              {active && (
                                <motion.span
                                  layoutId="drawer-active-browse"
                                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                                  style={{ background: "var(--nav-primary-2)" }}
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}
                              <div
                                className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                                style={{ backgroundColor: colors.bg, color: colors.fg }}
                              >
                                <Icon className="text-[13px]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-ticket-body text-[13px] font-semibold truncate"
                                  style={{ color: active ? "var(--nav-primary-2)" : "var(--nav-txt)" }}
                                >
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="font-ticket-body text-[10px] text-[var(--nav-txt-faint)] truncate mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.badge && (
                                <span
                                  className="font-ticket-body text-[9px] font-bold text-[#0B0B12] px-2 py-0.5 rounded-full"
                                  style={{ background: "var(--nav-primary-2)" }}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <FaChevronRight
                                className="text-[9px] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                                style={{ color: active ? "var(--nav-primary-2)" : "var(--nav-txt-faint)" }}
                              />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </nav>
                ))}

                {user &&
                  accountGroups.map((group, gi) => (
                    <nav key={group.title} className="mb-5">
                      <SectionHeader label={group.title} delay={0.35 + gi * 0.08} />

                      <div className="space-y-1">
                        {group.links.map((item, i) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          const colors = getIconColor(item.path);
                          return (
                            <motion.div
                              key={item.label}
                              custom={i + 8 + gi * 3}
                              variants={drawerItemVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <Link
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                                style={{ background: active ? "var(--nav-primary-soft)" : "transparent" }}
                              >
                                {active && (
                                  <motion.span
                                    layoutId="drawer-active-account"
                                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                                    style={{ background: "var(--nav-primary-2)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                  />
                                )}
                                <div
                                  className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                                  style={{ backgroundColor: colors.bg, color: colors.fg }}
                                >
                                  <Icon className="text-[13px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-ticket-body text-[13px] font-semibold truncate"
                                    style={{ color: active ? "var(--nav-primary-2)" : "var(--nav-txt)" }}
                                  >
                                    {item.label}
                                  </p>
                                </div>
                                <FaChevronRight
                                  className="text-[9px] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                                  style={{ color: active ? "var(--nav-primary-2)" : "var(--nav-txt-faint)" }}
                                />
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </nav>
                  ))}

                {user && !isPremium && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.35 }}
                  >
                    <Link
                      to="/premium"
                      onClick={() => setIsMenuOpen(false)}
                      className="group relative block mb-5 p-4 rounded-[20px] overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, var(--nav-primary-soft), transparent)",
                        border: "1px solid var(--nav-primary)",
                      }}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full"
                        style={{
                          background: "radial-gradient(circle, var(--nav-primary-glow) 0%, transparent 70%)",
                          filter: "blur(24px)",
                          opacity: 0.5,
                        }}
                      />
                      <div className="relative flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0"
                          style={{
                            background: "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))",
                            color: "#0B0B12",
                          }}
                        >
                          <FaCrown className="text-base" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-ticket-display text-sm font-bold text-[var(--nav-txt)]">
                            Upgrade to Seller
                          </p>
                          <p className="font-ticket-body text-[10px] text-[var(--nav-txt-faint)] mt-0.5">
                            30 listings, AI Studio & 1 boost
                          </p>
                        </div>
                        <FaChevronRight
                          className="text-[11px] group-hover:translate-x-0.5 transition-transform"
                          style={{ color: "var(--nav-primary-2)" }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                )}

                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="space-y-2.5 mb-5"
                  >
                    <SectionHeader label="Get Started" />
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-ticket-body font-bold text-sm text-[#0B0B12] transition-all hover:scale-[1.02] active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))",
                        boxShadow: "0 8px 20px -8px var(--nav-primary-glow)",
                      }}
                    >
                      <FaUserPlus className="text-xs group-hover:rotate-12 transition-transform" />
                      Create Free Account
                    </Link>
                    <Link
                      to="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-ticket-body text-sm font-bold text-[var(--nav-txt)] hover:bg-[var(--nav-surface)] transition-colors"
                      style={{ border: "1px solid var(--nav-line-str)" }}
                    >
                      <FaSignInAlt className="text-xs" />
                      Sign In
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.78, duration: 0.35 }}
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl font-ticket-body text-[13px] font-semibold transition-all duration-200"
                    style={{ color: "#B23A2E" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(178,58,46,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B23A2E]/10 text-[#B23A2E] flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <FaSignOutAlt className="text-[13px]" />
                    </div>
                    <span className="flex-1 text-left">Sign Out</span>
                    <FaChevronRight className="text-[9px] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>
                )}

                <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--nav-line)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <FaBolt className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
              <p className="font-ticket-body text-[10px] font-bold text-[var(--nav-txt-faint)] tracking-wide">
  APNaDeal v2.0
</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;