// pages/ElectronicsDetail.jsx — Alibaba-style marketplace layout
// + Real seller stats + Rating modal + Follow toggle + Chat + Toast
// + Pakistani price formatter (Lakh / Crore / Arab / Kharab)
// (electronics logic preserved, UI restructured to 3-column marketplace)
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  FaLaptop, FaTv, FaCamera, FaHeadphones, FaBolt, FaArrowLeft, FaMapMarkerAlt,
  FaHeart, FaRegHeart, FaShare, FaClock, FaCheckCircle,
  FaEye, FaWhatsapp, FaMicrochip, FaHdd, FaShieldAlt, FaSpinner,
  FaExclamationTriangle, FaChevronLeft, FaChevronRight,
  FaExpand, FaTimes, FaFlag, FaCheck, FaMemory, FaBatteryFull,
  FaPalette, FaBoxOpen, FaTag, FaShoppingCart, FaShoppingBag, FaChevronDown,
  FaWifi, FaCameraRetro, FaVolumeUp, FaDesktop, FaGamepad,
  FaKeyboard, FaPlug, FaBatteryThreeQuarters, FaStar, FaRegStar, FaLock,
  FaUserShield, FaEdit, FaEllipsisH, FaTruck, FaUndo,
  FaLink, FaMinus, FaPlus, FaStore, FaMapPin, FaMagic, FaComment,
  FaUserPlus, FaUserCheck, FaInfoCircle, FaExclamationCircle,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex, FaCcApplePay,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { readCart, writeCart } from "../lib/cartStore";
import { SellerAvatar, PlanLabel } from "../components/SellerAvatar";

/* ═══════════════════════════════════════════════════════════════
   STYLES — Alibaba-style light + dark
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; font-weight: 700; }
    .font-ticket-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    html, body { overflow-x: hidden; max-width: 100vw; }

    /* ── LIGHT THEME (default — Alibaba style) ── */
    .theme-light {
      --nav-bg:           #FFFFFF;
      --nav-bg-2:         #FFFFFF;
      --nav-panel:        #FFFFFF;
      --nav-panel-2:      #F7F7F8;
      --nav-surface:      #FAFAFB;
      --nav-surface-2:    #F5F5F7;
      --nav-line:         #EEEEF1;
      --nav-line-str:     #E3E3E8;
      --nav-txt:          #1A1A1A;
      --nav-txt-soft:     #666666;
      --nav-txt-faint:    #999999;
      --nav-primary:      #C8531B;
      --nav-primary-2:    #E86A22;
      --nav-primary-3:    #C8531B;
      --nav-primary-soft: #FFF2EA;
      --nav-primary-glow: rgba(232,106,34,0.35);
      --nav-orange:       #E86A22;
      --nav-orange-2:     #D44A00;
      --nav-shadow:       0 2px 8px rgba(0,0,0,0.06);
      --nav-star:         #FF8800;
      --nav-danger:       #B23A2E;
      --nav-danger-soft:  #FDECEA;
      --nav-blue:         #2563EB;
      --nav-blue-soft:    #EEF2FF;
      --nav-green:        #16A34A;
      --nav-green-soft:   #ECFDF5;
      --nav-gold:         #B45309;
      --nav-pill-bg:      rgba(255,255,255,0.72);
      --nav-pill-border:  rgba(20,20,30,0.08);
    }

    /* ── DARK THEME ── */
    .theme-dark {
      --nav-bg:           #0A0A12;
      --nav-bg-2:         #0F0F1A;
      --nav-panel:        #16161F;
      --nav-panel-2:      #1C1C28;
      --nav-surface:      #1F1F2A;
      --nav-surface-2:    #262633;
      --nav-line:         rgba(255,255,255,0.08);
      --nav-line-str:     rgba(255,255,255,0.15);
      --nav-txt:          #FFFFFF;
      --nav-txt-soft:     rgba(255,255,255,0.65);
      --nav-txt-faint:    rgba(255,255,255,0.45);
      --nav-primary:      #eb7d34;
      --nav-primary-2:    #f59e0b;
      --nav-primary-3:    #c8631f;
      --nav-primary-soft: rgba(235,125,52,0.14);
      --nav-primary-glow: rgba(235,125,52,0.45);
      --nav-orange:       #eb7d34;
      --nav-orange-2:     #d76a20;
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.6);
      --nav-star:         #FFB800;
      --nav-danger:       #EF4444;
      --nav-danger-soft:  rgba(239,68,68,0.14);
      --nav-blue:         #60A5FA;
      --nav-blue-soft:    rgba(96,165,250,0.14);
      --nav-green:        #34D399;
      --nav-green-soft:   rgba(52,211,153,0.14);
      --nav-gold:         #FBBF24;
      --nav-pill-bg:      rgba(20,20,30,0.55);
      --nav-pill-border:  rgba(255,255,255,0.08);
    }

    .pd-page { background: var(--nav-bg); color: var(--nav-txt); transition: background 0.35s ease, color 0.35s ease; }
    .pd-surface { background: var(--nav-panel); border: 1px solid var(--nav-line); transition: background 0.35s ease, border-color 0.35s ease; }
    .pd-surface-2 { background: var(--nav-panel-2); border: 1px solid var(--nav-line); transition: background 0.35s ease, border-color 0.35s ease; }
    .pd-txt      { color: var(--nav-txt); }
    .pd-txt-soft { color: var(--nav-txt-soft); }
    .pd-txt-faint{ color: var(--nav-txt-faint); }

    .pd-btn-orange {
      background: linear-gradient(135deg, #FF6A00 0%, #E85D04 100%);
      color: #FFFFFF;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .pd-btn-orange:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 10px 24px -8px rgba(232,93,4,0.5); }

    .pd-btn-primary {
      background: linear-gradient(135deg, var(--nav-primary-2) 0%, var(--nav-primary-3) 100%);
      color: #FFFFFF;
      box-shadow: 0 10px 24px -10px var(--nav-primary-glow);
    }
    .pd-btn-primary:hover { filter: brightness(1.05); }

    .pd-btn-outline {
      border: 1.5px solid var(--nav-line-str);
      color: var(--nav-txt);
      background: transparent;
      transition: all 0.2s ease;
    }
    .pd-btn-outline:hover { border-color: var(--nav-orange); color: var(--nav-orange); }

    .pd-btn-buy {
      background: linear-gradient(135deg, #FF6A00 0%, #E85D04 100%);
      color: #FFFFFF;
      box-shadow: 0 10px 24px -8px rgba(232,93,4,0.5);
    }
    .pd-btn-buy:hover { filter: brightness(1.05); }

    .pd-btn-success { background: #16A34A; color: #FFFFFF; }
    .pd-btn-success:hover { filter: brightness(1.08); }

    .pd-info-emerald {
      background: var(--nav-green-soft);
      border: 1px solid var(--nav-green);
    }

    .pd-btn-danger-outline {
      border: 1px solid var(--nav-danger);
      color: var(--nav-danger);
      background: var(--nav-danger-soft);
    }

    .pd-owner-banner {
      background: var(--nav-primary-soft);
      border: 1px solid var(--nav-orange);
    }

    /* Alibaba-like attribute chip */
    .pd-attr-chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid var(--nav-line-str);
      background: transparent;
      color: var(--nav-txt);
      font-size: 13px;
      font-weight: 500;
      cursor: default;
    }
    .theme-light .pd-attr-chip { background: #FFFFFF; }

    /* SOLD STAMP */
    .sold-stamp {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 20;
    }
    .sold-stamp__ring {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 26px;
      border-radius: 8px;
      border: 3px solid #B23A2E;
      background: rgba(178,58,46,0.10);
      backdrop-filter: blur(2px);
      transform: rotate(-14deg);
      box-shadow: 0 0 0 3px rgba(178,58,46,0.15), 0 12px 32px -10px rgba(178,58,46,0.5);
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #B23A2E;
      font-size: 20px;
      line-height: 1;
    }
    .theme-dark .sold-stamp__ring {
      border-color: #EF4444;
      color: #FCA5A5;
      background: rgba(239,68,68,0.18);
    }
    .sold-stamp__ring--large {
      padding: 14px 38px;
      font-size: 26px;
      letter-spacing: 0.22em;
      border-width: 4px;
    }

    @keyframes pdShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    .pd-shimmer {
      background: linear-gradient(90deg, var(--nav-surface-2) 0%, var(--nav-surface) 50%, var(--nav-surface-2) 100%);
      background-size: 200% 100%;
      animation: pdShimmer 1.6s ease-in-out infinite;
      border-radius: 6px;
    }

    /* Edit image shimmer */
    @keyframes navEditShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes navEditPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(235,125,52,0.55), 0 4px 14px -6px rgba(235,125,52,0.6); }
      50%      { box-shadow: 0 0 0 6px rgba(235,125,52,0), 0 6px 20px -6px rgba(235,125,52,0.7); }
    }
    .nav-edit-entry {
      position: relative;
      background: linear-gradient(135deg, rgba(235,125,52,0.14) 0%, rgba(245,158,11,0.10) 50%, rgba(200,99,31,0.14) 100%);
      border: 1px solid rgba(235,125,52,0.35);
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
    .nav-edit-entry:hover { border-color: rgba(235,125,52,0.75); transform: translateY(-1px); }
    .nav-edit-badge {
      background: linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%);
      box-shadow: 0 2px 8px -2px rgba(235,125,52,0.7);
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   PAKISTANI PRICE FORMATTER
   ═══════════════════════════════════════════════════════════════ */
const formatPakistaniPrice = (num) => {
  const n = Number(num || 0);
  if (!isFinite(n) || n <= 0) return { short: "0", long: "0", unit: "" };

  const LAKH = 100000;
  const CRORE = 10000000;
  const ARAB = 1000000000;
  const KHARAB = 100000000000;

  const fmt = (value, unit) => {
    const rounded = Math.round(value * 100) / 100;
    const str = rounded % 1 === 0
      ? rounded.toString()
      : rounded.toFixed(2).replace(/\.?0+$/, "");
    return { short: str, unit };
  };

  if (n >= KHARAB) return { ...fmt(n / KHARAB, "Kharab"), long: n.toLocaleString("en-US") };
  if (n >= ARAB)   return { ...fmt(n / ARAB,   "Arab"),   long: n.toLocaleString("en-US") };
  if (n >= CRORE)  return { ...fmt(n / CRORE,  "Crore"),  long: n.toLocaleString("en-US") };
  if (n >= LAKH)   return { ...fmt(n / LAKH,   "Lakh"),   long: n.toLocaleString("en-US") };
  return { short: n.toLocaleString("en-US"), long: n.toLocaleString("en-US"), unit: "" };
};

/* ═══════════════════════════════════════════════════════════════
   SOLD STAMP
   ═══════════════════════════════════════════════════════════════ */
const SoldStamp = ({ size = "small" }) => (
  <div className="sold-stamp">
    <span className={`sold-stamp__ring ${size === "large" ? "sold-stamp__ring--large" : ""}`}>
      Sold
    </span>
  </div>
);

const SoldOverlay = ({ size = "large" }) => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <SoldStamp size={size} />
    </div>
  </div>
);

/* ── Edit-image entry ── */
const EditImageEntry = ({ onClick, imageUrl, returnTo, label = "Edit image with AI", compact = false, navigate }) => {
  const handleClick = () => {
    if (typeof onClick === "function") { onClick(); return; }
    if (typeof navigate === "function") {
      navigate("/ai-image", {
        state: { imageUrl, originalImageUrl: imageUrl, returnTo: returnTo || "/", source: "electronics-detail" },
      });
    } else {
      window.location.href = "/ai-image";
    }
  };

  return (
    <button
      type="button" onClick={handleClick}
      className={`nav-edit-entry group inline-flex items-center gap-2 rounded-xl font-ticket-body font-bold transition-all ${
        compact ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-[12px]"
      }`}
      style={{ color: "var(--nav-primary)" }}
    >
      <span className="nav-edit-icon relative flex items-center justify-center">
        <FaMagic className={compact ? "text-[11px]" : "text-[13px]"} />
      </span>
      <span className="relative z-10 whitespace-nowrap">{label}</span>
      <span className="nav-edit-badge flex-shrink-0 inline-flex items-center justify-center h-4 px-1.5 rounded-full text-[8px] font-black text-white relative z-10">
        AI
      </span>
    </button>
  );
};

/* ─── Default fallback ─── */
const DEFAULT_ELECTRONICS = [
  { id: "default-elec-1", category: "Laptops", title: "MacBook Pro 14 M3 Pro 512GB", storage: "512 GB", condition: "Like New", warranty: "6 months", location: "Gulshan-e-Iqbal, Karachi", price: 585000, image: "/car5.png", verified: true, featured: true, status: "active", postedAgo: "2 days ago", description: "Apple MacBook Pro 14 with M3 Pro chip. 18GB unified memory, 512GB SSD. Battery cycle count under 50." },
  { id: "default-elec-2", category: "Laptops", title: "Dell XPS 15 i7 13th Gen", storage: "1 TB", condition: "New", warranty: "1 year", location: "Blue Area, Islamabad", price: 425000, image: "/car6.png", verified: true, featured: false, status: "active", postedAgo: "3 days ago", description: "Sealed Dell XPS 15, i7-13700H, 16GB RAM, 1TB NVMe, RTX 4050, OLED 3.5K." },
  { id: "default-elec-3", category: "TVs", title: "Samsung 55\" QLED 4K Smart TV", storage: "55 inch", condition: "Like New", warranty: "3 months", location: "DHA Phase 5, Lahore", price: 185000, image: "/car3.png", verified: true, featured: true, status: "active", postedAgo: "4 days ago", description: "Samsung Q60C QLED 4K TV, 55 inches, 120Hz, Tizen Smart OS." },
  { id: "default-elec-4", category: "Cameras", title: "Canon EOS R6 Mark II Body", storage: "Mirrorless", condition: "Used", warranty: "Expired", location: "F-7 Markaz, Islamabad", price: 475000, image: "/car1.png", verified: true, featured: false, status: "active", postedAgo: "5 days ago", description: "Canon EOS R6 Mark II body only. 24MP full-frame, 40fps burst, 6K video." },
  { id: "default-elec-5", category: "Audio", title: "Sony WH-1000XM5 Headphones", storage: "Wireless", condition: "Like New", warranty: "2 months", location: "Bahria Town, Rawalpindi", price: 95000, image: "/car2.png", verified: true, featured: false, status: "active", postedAgo: "6 days ago", description: "Sony WH-1000XM5 noise-cancelling headphones. Barely used, all accessories." },
  { id: "default-elec-6", category: "Gaming", title: "PlayStation 5 Slim + 2 Controllers", storage: "1 TB", condition: "Like New", warranty: "1 month", location: "Johar Town, Lahore", price: 175000, image: "/car4.png", verified: false, featured: true, status: "active", postedAgo: "1 week ago", description: "PS5 Slim disc edition, 1TB. Two DualSense controllers." },
];

const timeAgo = (iso) => {
  if (!iso) return "recently";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
};

/* ═══════════════════════════════════════════════════════════════
   SPEC DISPLAY
   ═══════════════════════════════════════════════════════════════ */
const SPEC_DISPLAY = {
  brand: { label: "Brand", icon: FaTag, section: "basic" },
  model: { label: "Model", icon: FaTag, section: "basic" },
  condition: { label: "Condition", icon: FaBoxOpen, section: "basic" },
  color: { label: "Color", icon: FaPalette, section: "basic" },
  storage: { label: "Storage", icon: FaHdd, section: "specs" },
  ram: { label: "RAM", icon: FaMemory, section: "specs" },
  processor: { label: "Processor", icon: FaMicrochip, section: "specs" },
  screen: { label: "Screen Size", icon: FaDesktop, section: "specs" },
  resolution: { label: "Resolution", icon: FaDesktop, section: "specs" },
  gpu: { label: "Graphics", icon: FaMicrochip, section: "specs" },
  battery: { label: "Battery", icon: FaBatteryFull, section: "specs" },
  batteryHealth: { label: "Battery Health", icon: FaBatteryThreeQuarters, section: "specs" },
  network: { label: "Network", icon: FaWifi, section: "features" },
  camera: { label: "Camera", icon: FaCameraRetro, section: "features" },
  speakers: { label: "Speakers", icon: FaVolumeUp, section: "features" },
  ports: { label: "Ports", icon: FaPlug, section: "features" },
  gaming: { label: "Gaming Features", icon: FaGamepad, section: "features" },
  keyboard: { label: "Keyboard", icon: FaKeyboard, section: "features" },
  warranty: { label: "Warranty", icon: FaShieldAlt, section: "warranty" },
  boxAvailable: { label: "Box & Accessories", icon: FaBoxOpen, section: "warranty" },
  billAvailable: { label: "Original Bill", icon: FaTag, section: "warranty" },
  repaired: { label: "Any Repairs?", icon: FaShieldAlt, section: "warranty" },
};

const SECTION_META = {
  basic: { title: "Basic Information", icon: FaTag },
  specs: { title: "Technical Specs", icon: FaMicrochip },
  features: { title: "Features", icon: FaStar },
  warranty: { title: "Warranty & Box", icon: FaShieldAlt },
};

const SECTION_ORDER = ["basic", "specs", "features", "warranty"];

const renderSpecValue = (value) => {
  const v = String(value).trim().toLowerCase();
  if (v === "yes" || v === "perfect") {
    return (
      <span className="inline-flex items-center gap-1 font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ color: "var(--nav-green)", background: "var(--nav-green-soft)", border: `1px solid var(--nav-green)` }}>
        <FaCheck className="text-[8px]" /> {v === "yes" ? "Yes" : "Perfect"}
      </span>
    );
  }
  if (v === "no") {
    return (
      <span className="inline-flex items-center gap-1 font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ color: "var(--nav-danger)", background: "var(--nav-danger-soft)", border: `1px solid var(--nav-danger)` }}>
        <FaTimes className="text-[8px]" /> No
      </span>
    );
  }
  return value;
};

/* ═══════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════ */
const Toast = ({ toast, onDismiss, duration = 2600 }) => {
  const isError = toast?.type === "error";
  const isInfo = toast?.type === "info";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 28, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          onClick={onDismiss}
          className="fixed top-20 right-4 z-[200] cursor-pointer select-none max-w-[calc(100vw-2rem)]"
        >
          <div className="relative overflow-hidden rounded-xl border shadow-[0_12px_36px_-12px_rgba(0,0,0,0.28)] w-[280px]"
            style={{ background: "var(--nav-panel)", borderColor: isError ? "var(--nav-danger)" : "var(--nav-primary)" }}>
            <div className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-2">
              <div className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center"
                style={{ background: isError ? "var(--nav-danger-soft)" : "var(--nav-primary-soft)" }}>
                {isError ? <FaExclamationCircle className="text-[10px]" style={{ color: "var(--nav-danger)" }} />
                  : isInfo ? <FaInfoCircle className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
                  : <FaCheck className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-ticket-body text-[11px] font-extrabold truncate leading-tight pd-txt">{toast.title}</p>
                {toast.message && <p className="font-ticket-body text-[9.5px] truncate leading-tight mt-0.5 pd-txt-soft">{toast.message}</p>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center pd-txt-soft">
                <FaTimes className="text-[9px]" />
              </button>
            </div>
            <motion.div key={toast.id + "-bar"} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{ transformOrigin: "left", height: 2,
                background: isError ? "var(--nav-danger)" : "linear-gradient(90deg, var(--nav-primary), var(--nav-primary-3))" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STAR DISPLAY
   ═══════════════════════════════════════════════════════════════ */
const StarDisplay = ({ rating, size = "sm", showValue = false, count = 0 }) => {
  const sizes = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= fullStars ? (
              <FaStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />
            ) : star === fullStars + 1 && hasHalf ? (
              <span className="relative">
                <FaRegStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />
                <span className="absolute inset-0 overflow-hidden w-1/2">
                  <FaStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />
                </span>
              </span>
            ) : (
              <FaRegStar className={sizes[size]} style={{ color: "var(--nav-txt-faint)" }} />
            )}
          </span>
        ))}
      </div>
      {showValue && (
        <span className="font-ticket-body text-[11px] font-bold ml-1 pd-txt">
          {rating.toFixed(1)}
          {count > 0 && <span className="font-normal ml-1 pd-txt-soft">({count})</span>}
        </span>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   RATING MODAL
   ═══════════════════════════════════════════════════════════════ */
const RatingModal = ({ open, onClose, sellerName, onSubmit, existingRating }) => {
  const [rating, setRating] = useState(existingRating || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [themeClass, setThemeClass] = useState("theme-dark");

  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const body = document.body;
    if (el.classList.contains("theme-light") || body.classList.contains("theme-light")) setThemeClass("theme-light");
    else if (el.classList.contains("theme-dark") || body.classList.contains("theme-dark")) setThemeClass("theme-dark");
    else {
      const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
      setThemeClass(prefersLight ? "theme-light" : "theme-dark");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setRating(existingRating || 0);
      setComment("");
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open, existingRating]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onSubmit(rating, comment);
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={themeClass} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <motion.div key="rating-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
          <motion.div key="rating-panel" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }} onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", zIndex: 1, width: "min(420px, calc(100vw - 2rem))", maxHeight: "90vh", overflowY: "auto",
              background: "var(--nav-panel)", border: "1px solid var(--nav-line)", borderRadius: "16px", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)" }}>
            <div className="p-6" style={{ color: "var(--nav-txt)" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--nav-primary-soft)" }}>
                    <FaStar className="text-sm" style={{ color: "var(--nav-primary-2)" }} />
                  </div>
                  <div>
                    <h3 className="font-ticket-display text-lg font-bold" style={{ color: "var(--nav-txt)" }}>Rate Seller</h3>
                    <p className="font-ticket-body text-[11px]" style={{ color: "var(--nav-txt-soft)" }}>{sellerName}</p>
                  </div>
                </div>
                <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ color: "var(--nav-txt-soft)" }}>
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hovered || rating);
                  return (
                    <button key={star} type="button" onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110 active:scale-95">
                      {active ? <FaStar className="text-3xl" style={{ color: "var(--nav-star)" }} /> : <FaRegStar className="text-3xl" style={{ color: "var(--nav-txt-faint)" }} />}
                    </button>
                  );
                })}
              </div>

              <p className="text-center font-ticket-body text-xs mb-5" style={{ color: "var(--nav-txt-soft)" }}>
                {rating === 0 ? "Tap to rate" : rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent!"}
              </p>

              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience (optional)" rows={3}
                className="font-ticket-body w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                style={{ background: "var(--nav-panel-2)", color: "var(--nav-txt)", border: "1px solid var(--nav-line)" }} />

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full py-3 rounded-xl font-ticket-body text-sm font-extrabold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #FF6A00 0%, #E85D04 100%)" }}>
                {submitting ? <span className="inline-flex items-center gap-2"><FaSpinner className="animate-spin text-xs" /> Submitting...</span> : "Submit Rating"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ELECTRONICS DETAIL
   ═══════════════════════════════════════════════════════════════ */
const ElectronicsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");
  const [qty, setQty] = useState(1);

  const [sellerStats, setSellerStats] = useState({
    listings: 0, followers: 0, rating: 0, ratingCount: 0, isFollowing: false, userRating: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [cart, setCart] = useState(() => readCart());
  const [showCartModal, setShowCartModal] = useState(false);

  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * (c.qty || 1), 0);

  const isSold = (listing?.status || "").toLowerCase() === "sold";

  const pushToast = (type, title, message) => {
    const toastId = Date.now() + Math.random();
    setToast({ id: toastId, type, title, message });
    setTimeout(() => setToast(null), 2600);
  };

  const isOwner = useMemo(() => {
    if (!user || !listing) return false;
    return !!listing.user_id && listing.user_id === user.id;
  }, [user, listing]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const role = user?.user_metadata?.role || user?.user_metadata?.user_type || user?.role;
    return role === "admin" || role === "super_admin" || user?.user_metadata?.is_admin === true || user?.is_admin === true;
  }, [user]);

  /* ── Apply edited image on return from /ai-image ── */
  useEffect(() => {
    const editedUrl = location.state?.editedImageUrl;
    const originalUrl = location.state?.originalImageUrl;
    if (editedUrl && listing) {
      setListing((prev) => {
        if (!prev) return prev;
        const currentIdx = originalUrl ? prev.images.findIndex((img) => img === originalUrl) : -1;
        const nextImages = [...prev.images];
        if (currentIdx >= 0) {
          nextImages[currentIdx] = editedUrl;
          setActiveImage(currentIdx);
        } else {
          nextImages[activeImage] = editedUrl;
        }
        return { ...prev, images: nextImages };
      });
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    const onUpdate = () => setCart(readCart());
    window.addEventListener("cart:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cart:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  /* ── Fetch listing ── */
  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      if (String(id).startsWith("default-")) {
        const local = DEFAULT_ELECTRONICS.find((v) => v.id === id);
        if (local) {
          setListing({
            ...local, images: [local.image], description: local.description,
            specs: { storage: local.storage, warranty: local.warranty, condition: local.condition },
            user_id: null, posted_at: null,
          });
          setIsLoading(false);
          return;
        }
      }

      try {
        const { data, error: fetchErr } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!data) { setError("Listing not found"); return; }

        let images = [];
        if (Array.isArray(data.images) && data.images.length > 0) images = data.images;
        else if (data.cover_image) images = [data.cover_image];
        else images = ["/car5.png"];

        setListing({
          ...data, images,
          image: data.cover_image || images[0],
          category: data.subcategory || "Electronics",
          location: data.area ? `${data.area}, ${data.city}` : data.city || "—",
          postedAgo: timeAgo(data.posted_at),
          specs: data.specs || {},
        });

        if (data.user_id) {
          const { data: settings } = await supabase
            .from("user_settings").select("full_name, avatar, email, phone, location, plan_id, verified")
            .eq("user_id", data.user_id).maybeSingle();

          const { data: userRow } = await supabase
            .from("users").select("id, name, email, avatar_url, phone")
            .eq("id", data.user_id).maybeSingle();

          setSeller({
            id: data.user_id,
            name: settings?.full_name || userRow?.name || userRow?.email?.split("@")[0] || "Anonymous",
            email: settings?.email || userRow?.email || "",
            avatar_url: settings?.avatar || userRow?.avatar_url || userRow?.avatar || null,
            phone: settings?.phone || userRow?.phone || null,
            planId: String(settings?.plan_id || "free").toLowerCase(),
            verified: !!(settings?.verified || data.verified),
          });
        }
        supabase.from("listings").update({ views: (data.views || 0) + 1 }).eq("id", id).then(() => {});
      } catch (err) {
        console.error("Fetch listing error:", err);
        setError("Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  /* ── Seller stats ── */
  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!listing?.user_id) return;
      setStatsLoading(true);
      try {
        const { count: listingsCount } = await supabase
          .from("listings").select("*", { count: "exact", head: true })
          .eq("user_id", listing.user_id).eq("status", "active");

        const { count: followersCount } = await supabase
          .from("seller_followers").select("*", { count: "exact", head: true })
          .eq("seller_id", listing.user_id);

        const { data: ratings } = await supabase
          .from("seller_ratings").select("rating").eq("seller_id", listing.user_id);

        const ratingCount = ratings?.length || 0;
        const avgRating = ratingCount > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;

        let isFollowing = false;
        let userRating = 0;

        if (user?.id) {
          const { data: followData } = await supabase
            .from("seller_followers").select("id")
            .eq("seller_id", listing.user_id).eq("follower_id", user.id).maybeSingle();
          isFollowing = !!followData;

          const { data: ratingData } = await supabase
            .from("seller_ratings").select("rating")
            .eq("seller_id", listing.user_id).eq("rater_id", user.id).maybeSingle();
          userRating = ratingData?.rating || 0;
        }

        setSellerStats({ listings: listingsCount || 0, followers: followersCount || 0, rating: avgRating, ratingCount, isFollowing, userRating });
      } catch (err) {
        console.error("Seller stats error:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchSellerStats();
  }, [listing?.user_id, user?.id]);

  /* ── Realtime seller ── */
  useEffect(() => {
    if (!listing?.user_id) return;
    const channel = supabase
      .channel(`seller-sync-${listing.user_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${listing.user_id}` },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          setSeller((prev) => prev ? {
            ...prev,
            name: row.full_name ?? prev.name,
            avatar_url: row.avatar ?? prev.avatar_url,
            email: row.email ?? prev.email,
            phone: row.phone ?? prev.phone,
            planId: row.plan_id != null ? String(row.plan_id).toLowerCase() : prev.planId,
            verified: row.verified != null ? !!row.verified : prev.verified,
          } : prev);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [listing?.user_id]);

  /* ── Realtime status ── */
  useEffect(() => {
    if (!listing?.id || String(listing.id).startsWith("default-")) return;
    const channel = supabase
      .channel(`listing-status-${listing.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "listings", filter: `id=eq.${listing.id}` },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          setListing((prev) => (prev ? { ...prev, status: row.status ?? prev.status } : prev));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [listing?.id]);

  useEffect(() => {
    const checkFav = async () => {
      if (!user) return;
      try {
        const { data } = await supabase.from("favorites").select("listing_id")
          .eq("user_id", user.id).eq("listing_id", id).maybeSingle();
        setIsFav(!!data);
      } catch (err) { console.error("Check fav:", err); }
    };
    checkFav();
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) { pushToast("info", "Sign in required", "Please sign in to save favorites"); return; }
    const next = !isFav;
    setIsFav(next);
    if (String(id).startsWith("default-")) return;
    try {
      if (next) await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
      else await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
    } catch (err) { console.error("Toggle fav:", err); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      pushToast("success", "Link copied", "Share this listing");
      setTimeout(() => setCopied(false), 2000);
    } catch { pushToast("info", "Link", window.location.href); }
  };

  const handleAddToCart = () => {
    if (isSold) { pushToast("error", "This item is sold", "No longer available."); return; }
    if (isOwner) { pushToast("error", "Can't buy own item", "You can't buy your own listing."); return; }
    if (!user) { pushToast("info", "Sign in required", "Please sign in to add to cart"); return; }
    if (!listing) return;

    const exists = cart.find((c) => c.id === listing.id);
    const next = exists
      ? cart.map((c) => c.id === listing.id ? { ...c, qty: (c.qty || 1) + qty } : c)
      : [...cart, {
          id: listing.id, title: listing.title,
          price: Number(listing.price) || 0,
          image: listing.image, location: listing.location,
          category: listing.category, detailPath: "electronic", qty,
        }];
    setCart(next);
    writeCart(next);
    setShowCartModal(true);
  };

  const handleBuyNow = () => {
    if (isSold) { pushToast("error", "This item is sold", "No longer available."); return; }
    if (isOwner) { pushToast("error", "Can't buy own item", "You can't buy your own listing."); return; }
    if (!user) { pushToast("info", "Sign in required", "Please sign in to purchase"); return; }
    handleAddToCart();
    setTimeout(() => navigate("/checkout"), 300);
  };

  const removeFromCart = (cartId) => {
    const next = cart.filter((c) => c.id !== cartId);
    setCart(next);
    writeCart(next);
  };

  const openPayment = () => { setShowCartModal(false); navigate("/checkout"); };

  const rawPhone = listing?.contact_number || listing?.phone || listing?.whatsapp || seller?.phone || "+920000000000";
  const whatsappNumber = String(rawPhone).replace(/[^0-9]/g, "");

  const handleWhatsApp = () => {
    if (isOwner) return;
    if (isSold) { pushToast("error", "This item is sold", "No longer available."); return; }
    const priceObj = formatPakistaniPrice(listing?.price);
    const priceText = priceObj.unit
      ? `PKR ${priceObj.short} ${priceObj.unit} (${priceObj.long})`
      : `PKR ${priceObj.long}`;
    const text = encodeURIComponent(
      `Hi, I'm interested in your electronics on APNa Deal:\n\n*${listing?.title}*\n${listing?.location}\n${priceText}\n\nIs it still available?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  const handleChatWithSeller = () => {
    if (isOwner) return;
    if (!user) { pushToast("info", "Sign in required", "Please sign in to chat with seller"); navigate("/login"); return; }
    if (!listing?.user_id) { pushToast("error", "Chat unavailable", "Seller info not available"); return; }
    const params = new URLSearchParams();
    params.set("user", listing.user_id);
    if (listing.id) params.set("listing", listing.id);
    params.set("text", "Hi! Is this still available?");
    navigate(`/marketplace-chat?${params.toString()}`);
  };

  const handleFollowToggle = async () => {
    if (isOwner) { pushToast("error", "Can't follow yourself", "You can't follow your own shop"); return; }
    if (!user) { pushToast("info", "Sign in required", "Please sign in to follow sellers"); navigate("/login"); return; }
    if (!listing?.user_id) return;

    try {
      if (sellerStats.isFollowing) {
        await supabase.from("seller_followers").delete().eq("seller_id", listing.user_id).eq("follower_id", user.id);
        setSellerStats((prev) => ({ ...prev, isFollowing: false, followers: Math.max(0, prev.followers - 1) }));
        pushToast("success", "Unfollowed", `You unfollowed ${seller?.name || "this seller"}`);
      } else {
        await supabase.from("seller_followers").insert({ seller_id: listing.user_id, follower_id: user.id });
        setSellerStats((prev) => ({ ...prev, isFollowing: true, followers: prev.followers + 1 }));
        pushToast("success", "Following!", `You now follow ${seller?.name || "this seller"}`);
      }
    } catch (err) {
      console.error("Follow error:", err);
      pushToast("error", "Action failed", "Please try again");
    }
  };

  const handleRateSeller = () => {
    if (isOwner) { pushToast("error", "Can't rate yourself", "You can't rate your own shop"); return; }
    if (!user) { pushToast("info", "Sign in required", "Please sign in to rate sellers"); navigate("/login"); return; }
    setRatingModalOpen(true);
  };

  const submitRating = async (rating, comment) => {
    if (!listing?.user_id || !user?.id) return;
    try {
      const { error } = await supabase.from("seller_ratings").upsert(
        { seller_id: listing.user_id, rater_id: user.id, rating, comment: comment || null, updated_at: new Date().toISOString() },
        { onConflict: "seller_id,rater_id" }
      );
      if (error) throw error;

      const { data: ratings } = await supabase.from("seller_ratings").select("rating").eq("seller_id", listing.user_id);
      const ratingCount = ratings?.length || 0;
      const avgRating = ratingCount > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;

      setSellerStats((prev) => ({ ...prev, rating: avgRating, ratingCount, userRating: rating }));
      pushToast("success", "Rating submitted", `You rated ${seller?.name || "this seller"} ${rating} star${rating > 1 ? "s" : ""}`);
    } catch (err) {
      console.error("Rating error:", err);
      pushToast("error", "Rating failed", "Please try again");
    }
  };

  const formatRs = (num) => `PKR ${Number(num || 0).toLocaleString("en-US")}`;

  const groupedSpecs = useMemo(() => {
    if (!listing) return {};
    const specs = listing.specs || {};
    const groups = {};

    Object.entries(SPEC_DISPLAY).forEach(([key, meta]) => {
      const value = key === "condition" ? listing.condition : specs[key];
      if (value !== null && value !== undefined && value !== "" && value !== "—" && value !== 0) {
        if (!groups[meta.section]) groups[meta.section] = [];
        groups[meta.section].push({ key, label: meta.label, icon: meta.icon, value: String(value) });
      }
    });

    return groups;
  }, [listing]);

  const totalSpecFields = useMemo(
    () => Object.values(groupedSpecs).reduce((sum, arr) => sum + arr.length, 0),
    [groupedSpecs]
  );

  /* Formatted price */
  const formattedPrice = useMemo(
    () => formatPakistaniPrice(listing?.price),
    [listing?.price]
  );

  /* Attribute chips */
  const attributeChips = useMemo(() => {
    const out = [];
    const s = listing?.specs || {};
    if (s.brand) out.push({ label: "Brand", value: s.brand });
    if (s.model) out.push({ label: "Model", value: s.model });
    if (s.storage || listing?.storage) out.push({ label: "Storage", value: s.storage || listing?.storage });
    if (s.ram) out.push({ label: "RAM", value: s.ram });
    if (s.processor) out.push({ label: "Processor", value: s.processor });
    if (s.screen) out.push({ label: "Screen", value: s.screen });
    if (s.color) out.push({ label: "Color", value: s.color });
    if (listing?.condition) out.push({ label: "Condition", value: listing.condition });
    return out;
  }, [listing]);

  if (isLoading) {
    return (
      <div className="min-h-screen pd-page flex items-center justify-center px-4">
        <FontStyles />
        <div className="text-center">
          <FaSpinner className="text-3xl mx-auto mb-4 animate-spin" style={{ color: "var(--nav-orange)" }} />
          <p className="font-ticket-body text-sm pd-txt-soft">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen pd-page flex items-center justify-center px-4">
        <FontStyles />
        <div className="text-center max-w-md mx-auto p-8 pd-surface rounded-2xl">
          <FaExclamationTriangle className="text-5xl mx-auto mb-4" style={{ color: "var(--nav-orange)" }} />
          <h2 className="font-ticket-display text-xl font-bold pd-txt mb-2">{error || "Listing not found"}</h2>
          <p className="font-ticket-body text-sm pd-txt-soft mb-5">This electronics listing doesn't exist or has been removed.</p>
          <Link to="/electronics" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ticket-body font-bold text-sm pd-btn-orange">
            <FaArrowLeft className="text-xs" /> Back to Electronics
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon =
    listing.category === "TVs" ? FaTv
    : listing.category === "Cameras" ? FaCamera
    : listing.category === "Audio" ? FaHeadphones
    : listing.category === "Gaming" ? FaBolt
    : FaLaptop;

  const warrantyAvailable = String(listing.specs?.warranty || listing.warranty || "").toLowerCase();
  const hasWarranty = warrantyAvailable && warrantyAvailable !== "no" && warrantyAvailable !== "expired";

  return (
    <div className="min-h-screen pd-page">
      <FontStyles />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] pd-txt-soft mb-5 flex-wrap">
          <Link to="/feed" className="hover:opacity-80 inline-flex items-center gap-1" style={{ color: "inherit" }}>
            <FaStore className="text-[10px]" /> Shop
          </Link>
          <span className="opacity-40">›</span>
          <Link to="/electronics" className="hover:opacity-80" style={{ color: "inherit" }}>Electronics</Link>
          <span className="opacity-40">›</span>
          <Link to={`/electronics?category=${listing.category}`} className="hover:opacity-80" style={{ color: "inherit" }}>{listing.category}</Link>
          <span className="opacity-40">›</span>
          <span className="pd-txt font-medium truncate max-w-[280px]">{listing.title}</span>
        </nav>

        {/* Sold banner */}
        {isSold && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl pd-btn-danger-outline">
            <span className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 text-white" style={{ background: "var(--nav-danger)" }}>
              <FaLock className="text-sm" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-ticket-body text-sm font-bold pd-txt">This item has been sold</p>
              <p className="font-ticket-body text-[11px] pd-txt-soft">It's no longer available for purchase.</p>
            </div>
          </motion.div>
        )}

        {/* Owner banner */}
        {isOwner && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 rounded-xl pd-owner-banner p-3.5">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--nav-orange)" }}>
              <FaUserShield className="text-xs text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-ticket-body text-xs font-bold pd-txt">This is your listing</p>
              <p className="font-ticket-body text-[10px] pd-txt-soft">You're viewing as the owner. Buyers will see contact options.</p>
            </div>
            <Link to="/my-listings" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold flex-shrink-0"
              style={{ border: "1px solid var(--nav-orange)", color: "var(--nav-orange)" }}>
              <FaEdit className="text-[9px]" /> Manage
            </Link>
          </motion.div>
        )}

        {/* ═══ ALIBABA-STYLE 3-COLUMN GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ─────── COLUMN 1: Left — Image + Seller card ─────── */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex gap-3">
              {listing.images.length > 1 && (
                <div className="flex flex-col gap-2 flex-shrink-0 max-h-[460px] overflow-y-auto scrollbar-hide">
                  {listing.images.slice(0, 6).map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all relative flex-shrink-0 ${activeImage === i ? "" : "opacity-60 hover:opacity-100"}`}
                      style={{ borderColor: activeImage === i ? "var(--nav-orange)" : "var(--nav-line)" }}>
                      <img src={img} alt={`${listing.title} ${i + 1}`} className={`w-full h-full object-cover ${isSold ? "opacity-60 grayscale" : ""}`} />
                      {isSold && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="font-ticket-display text-[7px] font-black px-1 py-0.5 rounded rotate-[-12deg] tracking-[0.15em]"
                            style={{ color: "#B23A2E", background: "rgba(247,241,228,0.95)" }}>
                            SOLD
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative flex-1 min-w-0 pd-surface rounded-2xl overflow-hidden group aspect-square">
                <img src={listing.images[activeImage]} alt={listing.title}
                  className={`w-full h-full object-contain p-4 transition-all duration-500 ${isSold ? "opacity-60 grayscale" : ""}`} />

                {isSold && <SoldOverlay size="large" />}

                {!isSold && (
                  <button onClick={() => setFullscreen(true)}
                    className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md backdrop-blur-md text-[11px] font-bold z-30 pd-surface"
                    style={{ color: "var(--nav-txt)" }}>
                    <FaExpand className="text-[9px]" /> View
                  </button>
                )}

                {listing.featured && !isSold && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md z-30 pd-btn-orange">
                    <FaBolt className="text-[9px]" />
                    <span className="font-ticket-body text-[10px] font-bold uppercase tracking-wider">Featured</span>
                  </div>
                )}

                {listing.images.length > 1 && !isSold && (
                  <>
                    <button onClick={() => setActiveImage((activeImage - 1 + listing.images.length) % listing.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 pd-surface"
                      style={{ color: "var(--nav-txt)" }}>
                      <FaChevronLeft className="text-[10px]" />
                    </button>
                    <button onClick={() => setActiveImage((activeImage + 1) % listing.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 pd-surface"
                      style={{ color: "var(--nav-txt)" }}>
                      <FaChevronRight className="text-[10px]" />
                    </button>
                  </>
                )}

                {listing.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md z-30"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#FFFFFF" }}>
                    {activeImage + 1} / {listing.images.length}
                  </div>
                )}
              </motion.div>
            </div>

    

            {/* Edit image */}
            <div className="flex justify-end">
              <EditImageEntry navigate={navigate} imageUrl={listing.images[activeImage]} returnTo={`/electronic/${id}`} compact />
            </div>

            {/* Seller card */}
            <div className="rounded-2xl pd-surface p-4">
              <div className="flex items-center gap-3 mb-4">
                <SellerAvatar avatar={seller?.avatar_url} name={seller?.name || "U"} planId={seller?.planId || "free"} verified={seller?.verified || listing.verified} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-ticket-body text-[14px] font-bold pd-txt truncate">
                      {isOwner ? "You" : (seller?.name || "APNa Deal Seller")}
                    </p>
                    {!isOwner && <PlanLabel planId={seller?.planId || "free"} compact={false} />}
                  </div>
                  <p className="font-ticket-body text-[10px] pd-txt-soft inline-flex items-center gap-1 mt-0.5">
                    <FaMapPin className="text-[9px]" style={{ color: "var(--nav-orange)" }} />
                    {listing.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 pb-4" style={{ borderBottom: "1px solid var(--nav-line)" }}>
                {[
                  { label: "Rating", value: statsLoading ? "…" : sellerStats.ratingCount > 0 ? sellerStats.rating.toFixed(1) : "0.0" },
                  { label: "Followers", value: statsLoading ? "…" : sellerStats.followers },
                  { label: "Listings", value: statsLoading ? "…" : sellerStats.listings },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    {statsLoading ? <div className="h-5 w-8 mx-auto mb-1 pd-shimmer" />
                      : <p className="font-ticket-body text-[14px] font-bold pd-txt tabular-nums">{s.value}</p>}
                    <p className="font-ticket-body text-[9.5px] font-semibold pd-txt-soft uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                {statsLoading ? <div className="h-3 w-24 pd-shimmer" />
                  : <StarDisplay rating={sellerStats.rating} size="sm" showValue count={sellerStats.ratingCount} />}
              </div>

              {!isOwner ? (
                <div className="space-y-2">
                  <button onClick={handleRateSeller} disabled={isSold}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-ticket-body font-bold text-[11.5px] transition-all pd-btn-orange"
                    style={isSold ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
                    <FaStar className="text-[11px]" />
                    {sellerStats.userRating > 0 ? `Your Rating: ${sellerStats.userRating} ★` : "Rate Seller"}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleChatWithSeller} disabled={isSold}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-ticket-body font-bold text-[11.5px] transition-all pd-btn-outline"
                      style={isSold ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
                      <FaComment className="text-[10px]" /> Chat
                    </button>
                    <button onClick={handleFollowToggle} disabled={isSold}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-ticket-body font-bold text-[11.5px] transition-all"
                      style={isSold
                        ? { opacity: 0.4, cursor: "not-allowed", border: "1.5px solid var(--nav-line-str)", color: "var(--nav-txt)" }
                        : sellerStats.isFollowing
                          ? { background: "var(--nav-primary-soft)", border: "1.5px solid var(--nav-orange)", color: "var(--nav-orange)" }
                          : { border: "1.5px solid var(--nav-line-str)", color: "var(--nav-txt)", background: "transparent" }}>
                      {sellerStats.isFollowing ? (<><FaUserCheck className="text-[10px]" /> Following</>) : (<><FaUserPlus className="text-[10px]" /> Follow</>)}
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/my-listings" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-ticket-body font-bold text-[11.5px] transition-all pd-btn-outline">
                  <FaEdit className="text-[10px]" /> Manage listing
                </Link>
              )}
            </div>
          </div>

          {/* ─────── COLUMN 2: Middle ─────── */}
          <div className="lg:col-span-5">
            <h1 className={`font-ticket-body text-[22px] sm:text-[26px] font-bold leading-tight mb-3 ${isSold ? "opacity-60" : ""}`} style={{ color: "var(--nav-txt)" }}>
              {listing.title}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap mb-3 text-[12.5px]">
              <StarDisplay rating={sellerStats.rating || 4.9} size="md" showValue count={sellerStats.ratingCount || 0} />
              <span className="pd-txt-soft">·</span>
              <span className="font-ticket-body font-semibold" style={{ color: "var(--nav-orange)" }}>
                {Math.floor(Math.random() * 50) + 20} sold
              </span>
              <span className="pd-txt-soft">·</span>
              <span className="inline-flex items-center gap-1 font-ticket-body text-[11.5px] pd-txt-soft">
                <FaTag className="text-[10px]" style={{ color: "var(--nav-orange)" }} />
                <span className="font-semibold" style={{ color: "var(--nav-orange)" }}>
                  #{Math.floor(Math.random() * 15) + 1}
                </span>
                {" "}most popular in {listing.category}
              </span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-5 pb-4" style={{ borderBottom: "1px solid var(--nav-line)" }}>
              {listing.verified && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold pd-txt-soft" style={{ border: "1px solid var(--nav-line-str)" }}>
                  <FaCheckCircle className="text-[9px]" style={{ color: "var(--nav-green)" }} /> APNa verified seller
                </span>
              )}
              {hasWarranty && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold pd-txt-soft" style={{ border: "1px solid var(--nav-line-str)" }}>
                  <FaCheckCircle className="text-[9px]" style={{ color: "var(--nav-green)" }} /> Warranty available
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold pd-txt-soft" style={{ border: "1px solid var(--nav-line-str)" }}>
                <FaCheckCircle className="text-[9px]" style={{ color: "var(--nav-green)" }} /> 7-day returns
              </span>
            </div>

            {/* ═══ SINGLE PRICE with Lakh/Crore formatting ═══ */}
            <div className="mb-5 pb-5" style={{ borderBottom: "1px solid var(--nav-line)" }}>
              {formattedPrice.unit ? (
                <>
                  <p className={`font-ticket-body text-[28px] sm:text-[34px] font-bold leading-none ${isSold ? "line-through opacity-60" : ""}`} style={{ color: "var(--nav-txt)" }}>
                    <span className="text-[16px] sm:text-[18px] font-semibold mr-1.5">PKR</span>
                    {formattedPrice.short}
                    <span className="text-[18px] sm:text-[22px] font-semibold ml-2">{formattedPrice.unit}</span>
                  </p>
                  <p className="font-ticket-body text-[12.5px] sm:text-[13px] font-medium mt-1.5 tabular-nums" style={{ color: "var(--nav-txt-soft)" }}>
                    PKR {formattedPrice.long}
                  </p>
                </>
              ) : (
                <p className={`font-ticket-body text-[28px] sm:text-[34px] font-bold leading-none ${isSold ? "line-through opacity-60" : ""}`} style={{ color: "var(--nav-txt)" }}>
                  <span className="text-[16px] sm:text-[18px] font-semibold mr-1.5">PKR</span>
                  {formattedPrice.long}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap mt-3">
                {!isSold && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold"
                    style={{ background: "var(--nav-green-soft)", color: "var(--nav-green)", border: "1px solid var(--nav-green)" }}>
                    <FaCheck className="text-[8px]" /> 1.20k+ in stock
                  </span>
                )}
                <span className="font-ticket-body text-[11px] pd-txt-soft">Posted {listing.postedAgo}</span>
              </div>
            </div>

            {/* ═══ ATTRIBUTE CHIPS ═══ */}
            {attributeChips.length > 0 && (
              <div className="space-y-3 mb-5">
                {attributeChips.map((chip) => (
                  <div key={chip.label} className="flex items-baseline gap-3">
                    <span className="font-ticket-body text-[13px] font-semibold pd-txt w-[80px] flex-shrink-0">{chip.label}</span>
                    <span className="pd-attr-chip">{chip.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity selector */}
            {!isSold && !isOwner && (
              <div className="mb-5">
                <p className="font-ticket-body text-[13px] font-bold pd-txt mb-2">Quantity</p>
                <div className="inline-flex items-center rounded-full pd-surface overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 flex items-center justify-center pd-txt-soft hover:opacity-70 transition-opacity">
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="min-w-[44px] text-center font-ticket-body text-[14px] font-bold pd-txt">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}
                    className="h-10 w-10 flex items-center justify-center pd-txt-soft hover:opacity-70 transition-opacity">
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart / Buy Now */}
            {isOwner ? (
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg pd-owner-banner font-ticket-body font-bold text-sm"
                  style={{ color: "var(--nav-orange)" }}>
                  <FaLock className="text-sm" /> This is your listing
                </div>
                <Link to="/my-listings" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-ticket-body font-bold text-sm transition-all pd-btn-outline">
                  <FaEdit className="text-sm" /> Manage Listing
                </Link>
              </div>
            ) : isSold ? (
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-ticket-body font-bold text-sm pd-btn-danger-outline">
                  <FaLock className="text-sm" /> Sold · No longer available
                </div>
                <Link to="/electronics" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-ticket-body font-bold text-sm transition-all pd-btn-orange">
                  Browse similar {listing.category}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg font-ticket-body font-bold text-[13px] sm:text-[14px] transition-all pd-btn-outline">
                  <FaShoppingCart className="text-sm" /> Add to bag
                </button>
                <button onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg font-ticket-body font-bold text-[13px] sm:text-[14px] transition-all pd-btn-orange">
                  <FaShoppingBag className="text-sm" /> Buy now
                </button>
              </div>
            )}

            {/* Full details */}
            {Object.keys(groupedSpecs).length > 0 && (
              <div className="rounded-xl pd-surface overflow-hidden mb-5">
                <button type="button" onClick={() => setDetailsOpen((o) => !o)}
                  className="w-full flex items-center gap-3 p-4 text-left" aria-expanded={detailsOpen}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--nav-primary-soft)", border: "1px solid var(--nav-orange)" }}>
                    <CategoryIcon className="text-xs" style={{ color: "var(--nav-orange)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-ticket-body text-[14px] font-bold pd-txt">Full {listing.category} Details</h3>
                    <p className="font-ticket-body text-[11px] pd-txt-soft">
                      {detailsOpen ? "Everything the seller provided" : `${totalSpecFields} details available · tap to view`}
                    </p>
                  </div>
                  <motion.div animate={{ rotate: detailsOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                    className="h-8 w-8 rounded-full pd-surface-2 flex items-center justify-center flex-shrink-0">
                    <FaChevronDown className="text-xs" style={{ color: "var(--nav-orange)" }} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {detailsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: "easeInOut" }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 space-y-4" style={{ borderTop: "1px solid var(--nav-line)" }}>
                        {SECTION_ORDER.map((sectionKey) => {
                          const items = groupedSpecs[sectionKey];
                          if (!items || items.length === 0) return null;
                          const meta = SECTION_META[sectionKey];
                          const SectionIcon = meta.icon;
                          return (
                            <div key={sectionKey} className="pt-3">
                              <div className="flex items-center gap-2 mb-2.5">
                                <SectionIcon className="text-[11px]" style={{ color: "var(--nav-orange)" }} />
                                <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest pd-txt-soft">{meta.title}</p>
                                <div className="flex-1 h-px" style={{ background: "var(--nav-line)" }} />
                              </div>
                              <div className="rounded-xl pd-surface-2 overflow-hidden">
                                {items.map((item, idx) => {
                                  const ItemIcon = item.icon;
                                  return (
                                    <div key={item.key} className="flex items-center gap-3 px-4 py-2.5"
                                      style={{ borderBottom: idx !== items.length - 1 ? "1px solid var(--nav-line)" : "none" }}>
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <ItemIcon className="text-[11px] flex-shrink-0" style={{ color: "var(--nav-orange)" }} />
                                        <span className="font-ticket-body text-[11px] sm:text-xs font-semibold pd-txt-soft truncate">{item.label}</span>
                                      </div>
                                      <span className="font-ticket-body text-xs sm:text-sm font-bold pd-txt text-right">{renderSpecValue(item.value)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="mb-5">
                <h3 className="font-ticket-body text-[14px] font-bold pd-txt mb-2">Description</h3>
                <p className="font-ticket-body text-[13px] leading-relaxed pd-txt-soft whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}
          </div>

          {/* ─────── COLUMN 3: Right ─────── */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 h-fit">

            {/* Delivery card */}
            <div className="rounded-xl pd-info-emerald p-4">
              <div className="flex items-start gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--nav-green-soft)" }}>
                  <FaTruck className="text-xs" style={{ color: "var(--nav-green)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ticket-body text-[12.5px] font-bold pd-txt leading-snug">Delivery in 3–5 days</p>
                  <p className="font-ticket-body text-[11px] pd-txt-soft mt-0.5">Free on PostEx & EasyShip</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: "PostEx", price: "Free" },
                  { name: "EasyShip", price: "Free" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 pd-surface">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold pd-txt">
                      <span className="inline-flex items-center justify-center h-4 px-1.5 rounded text-[8px] font-black"
                        style={{ background: "var(--nav-txt)", color: "var(--nav-panel)" }}>
                        {s.name.slice(0, 2).toUpperCase()}
                      </span>
                      {s.name}
                    </span>
                    <span className="text-[11px] font-bold pd-txt tabular-nums">{s.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return card */}
            <div className="rounded-xl pd-info-emerald p-4">
              <div className="flex items-start gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--nav-green-soft)" }}>
                  <FaUndo className="text-xs" style={{ color: "var(--nav-green)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-ticket-body text-[12.5px] font-bold pd-txt leading-snug">7-day easy returns</p>
                  <p className="font-ticket-body text-[11px] pd-txt-soft mt-0.5">Order ghalat ya na-mukammal ho to 7 din mein return.</p>
                </div>
              </div>
            </div>

            {/* Order protection card */}
            <div className="rounded-xl pd-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-ticket-body text-[15px] font-bold pd-txt">APNa Deal order protection</h3>
                <FaChevronRight className="text-[10px] pd-txt-soft" />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <FaShieldAlt className="text-[12px] flex-shrink-0 mt-0.5" style={{ color: "var(--nav-orange)" }} />
                  <div>
                    <p className="font-ticket-body text-[12px] font-bold pd-txt mb-0.5">Secure payments</p>
                    <p className="font-ticket-body text-[11px] pd-txt-soft leading-relaxed">
                      Every payment is secured with strict SSL encryption and PCI DSS.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FaUndo className="text-[12px] flex-shrink-0 mt-0.5" style={{ color: "var(--nav-orange)" }} />
                  <div>
                    <p className="font-ticket-body text-[12px] font-bold pd-txt mb-0.5">Refund policy</p>
                    <p className="font-ticket-body text-[11px] pd-txt-soft leading-relaxed">
                      Claim a refund if the item doesn't match the listing description.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--nav-line)" }}>
                <FaCcVisa className="text-base" style={{ color: "#1A1F71" }} />
                <FaCcMastercard className="text-base" style={{ color: "#EB001B" }} />
                <FaCcPaypal className="text-base" style={{ color: "#003087" }} />
                <FaCcAmex className="text-base" style={{ color: "#006FCF" }} />
                <FaCcApplePay className="text-base pd-txt" />
                <span className="font-ticket-body text-[10px] font-semibold pd-txt-soft ml-1">COD</span>
              </div>
            </div>

            {/* Primary CTAs */}
            {!isOwner && !isSold ? (
              <div className="space-y-2.5">
                <button onClick={handleWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold text-white transition-all pd-btn-orange">
                  <FaWhatsapp className="text-[15px]" /> Send Inquiry
                </button>
                <button onClick={handleChatWithSeller}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold transition-all"
                  style={{ border: "1.5px solid var(--nav-orange)", color: "var(--nav-orange)", background: "transparent" }}>
                  Chat now
                </button>
                <p className="font-ticket-body text-[10.5px] pd-txt-soft leading-relaxed text-center pt-1">
                  Only items checked & verified through APNa Deal can enjoy free protection by{" "}
                  <span className="font-bold" style={{ color: "var(--nav-orange)" }}>APNa Deal Assurance</span>
                </p>
              </div>
            ) : isSold ? (
              <div className="space-y-2.5">
                <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold pd-btn-danger-outline">
                  <FaLock /> Sold · No longer available
                </div>
                <Link to="/electronics" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold transition-all pd-btn-orange">
                  Browse similar {listing.category}
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold pd-owner-banner"
                  style={{ color: "var(--nav-orange)" }}>
                  <FaUserShield /> This is your listing
                </div>
                <Link to="/my-listings" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold transition-all pd-btn-outline">
                  <FaEdit /> Manage Listing
                </Link>
              </div>
            )}

            {/* Utility row */}
            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              <button onClick={toggleFavorite} disabled={isSold}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: isFav ? "var(--nav-danger-soft)" : "transparent",
                  border: `1px solid ${isFav ? "var(--nav-danger)" : "var(--nav-line-str)"}`,
                  color: isFav ? "var(--nav-danger)" : "var(--nav-txt-soft)",
                  opacity: isSold ? 0.4 : 1,
                }}>
                {isFav ? <FaHeart className="text-[10px]" /> : <FaRegHeart className="text-[10px]" />}
                {isFav ? "Saved" : "Save"}
              </button>
              <button onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold pd-surface"
                style={{ color: "var(--nav-txt-soft)" }}>
                <FaShare className="text-[10px]" /> {copied ? "Copied" : "Share"}
              </button>
              <button onClick={() => setMoreOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold pd-surface"
                style={{ color: "var(--nav-txt-soft)" }}>
                <FaEllipsisH className="text-[10px]" /> More
              </button>
            </div>

            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -4, height: 0 }} className="overflow-hidden">
                  <button onClick={() => { pushToast("success", "Reported", "Thank you for your feedback"); setMoreOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-ticket-body text-xs font-bold transition-all pd-btn-danger-outline">
                    <FaFlag className="text-[11px]" /> Report this listing
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Safety Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-8 relative overflow-hidden rounded-xl p-5"
          style={{ background: "var(--nav-green-soft)", border: "1px solid var(--nav-green)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-full text-white" style={{ background: "#16A34A" }}>
              <FaShieldAlt className="text-[14px]" />
            </div>
            <div>
              <span className="font-ticket-body text-[15px] font-bold pd-txt">Safety Tips</span>
              <p className="font-ticket-body text-[11px] pd-txt-soft">Stay protected when trading</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Test the device thoroughly before buying",
              "Check warranty card and original bill",
              "Meet at a public place during daylight",
              "Never pay in advance without inspecting",
            ].map((tip, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 pd-surface">
                <div className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0" style={{ background: "var(--nav-green-soft)" }}>
                  <FaCheck className="text-[8px]" style={{ color: "var(--nav-green)" }} />
                </div>
                <span className="font-ticket-body text-[13px] leading-snug pd-txt">{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cart modal */}
      <AnimatePresence>
        {showCartModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowCartModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto pd-surface rounded-2xl">
              <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--nav-line)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ background: "#16A34A" }}>
                    <FaCheck className="text-sm" />
                  </div>
                  <div>
                    <h3 className="font-ticket-body text-[15px] font-bold pd-txt">Added to Cart</h3>
                    <p className="font-ticket-body text-xs pd-txt-soft">{cartCount} item{cartCount > 1 ? "s" : ""} in cart</p>
                  </div>
                </div>
                <button onClick={() => setShowCartModal(false)} className="h-9 w-9 rounded-full pd-surface-2 flex items-center justify-center pd-txt-soft">
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pd-surface-2 rounded-xl p-3">
                      <div className="h-14 w-14 rounded-lg pd-surface flex-shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-ticket-body text-sm font-bold pd-txt truncate">{item.title}</p>
                        <p className="font-ticket-body text-[10px] pd-txt-soft">Qty: {item.qty || 1} · {formatRs(item.price)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center pd-btn-danger-outline">
                        <FaTimes className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--nav-line)" }}>
                  <span className="font-ticket-body text-sm font-bold pd-txt">Total</span>
                  <span className="font-ticket-body text-xl font-bold tabular-nums" style={{ color: "var(--nav-orange)" }}>
                    {formatRs(cartTotal)}
                  </span>
                </div>

                <button onClick={openPayment} className="w-full py-3 rounded-xl font-ticket-body font-bold text-sm pd-btn-orange">
                  Proceed to Payment
                </button>
                <button onClick={() => setShowCartModal(false)} className="w-full py-3 rounded-xl font-ticket-body font-bold text-sm pd-btn-outline">
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen image */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.95)" }} onClick={() => setFullscreen(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img src={listing.images[activeImage]} alt={listing.title} className="w-full h-full object-contain max-h-[90vh] rounded-2xl" />
              <button onClick={() => setFullscreen(false)}
                className="absolute top-3 right-3 h-11 w-11 rounded-full backdrop-blur-md flex items-center justify-center text-white"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)" }}>
                <FaTimes className="text-base" />
              </button>
              {listing.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((activeImage - 1 + listing.images.length) % listing.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center text-white"
                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <FaChevronLeft className="text-base" />
                  </button>
                  <button onClick={() => setActiveImage((activeImage + 1) % listing.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full backdrop-blur-md flex items-center justify-center text-white"
                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <FaChevronRight className="text-base" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RatingModal
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        sellerName={seller?.name || "Seller"}
        onSubmit={submitRating}
        existingRating={sellerStats.userRating}
      />
    </div>
  );
};

export default ElectronicsDetail;