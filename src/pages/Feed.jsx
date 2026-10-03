// pages/Feed.jsx — Modern e-commerce style marketplace
// ⭐ NEW: Hero search now shows LIVE SUGGESTIONS dropdown while typing
//        + picks item on click + Enter navigates to detail page
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useFilter } from "../contexts/FilterContext";
import { usePlan } from "../contexts/PlanContext";
import { readCart, writeCart } from "../lib/cartStore";
import {
  FaNewspaper, FaMapMarkerAlt, FaHeart, FaRegHeart, FaClock, FaCog,
  FaBolt, FaCheckCircle, FaTag, FaCar, FaMobileAlt, FaHome, FaPlus,
  FaLaptop, FaShoppingCart, FaWhatsapp, FaArrowRight, FaSearch,FaCommentDots,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaCheck,
  FaExclamationCircle, FaUsers, FaChartLine, FaShieldAlt, FaCogs,FaList,
  FaHandshake, FaStar, FaTimes, FaGamepad, FaThLarge, FaTh, FaThList,
  FaExpandAlt, FaMotorcycle, FaBed, FaBath, FaRulerCombined, FaRocket,
  FaSwimmingPool, FaMapPin, FaMoneyBillWave, FaRoad,
  FaCalendarAlt, FaGasPump, FaPalette, FaUserTie, FaEllipsisH,
  FaUndo, FaShippingFast, FaBoxOpen, FaChild, FaGem, FaTools,
FaBatteryFull, FaSlidersH, FaListUl, FaUser, FaHome as FaHomeIcon,
FaChair, FaTv,} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ShopByCategory from "../components/ShopByCategory";
import {
  LuCar, LuBike, LuSmartphone, LuBuilding2, LuLaptop, LuGamepad2,
} from "react-icons/lu";
import { SellerAvatar, PlanLabel } from "../components/SellerAvatar";

const HERO_VIDEOS = [
  "https://cdn.dribbble.com/userupload/44910390/file/3ae6596393a55a8ff27a44500ff75dfa.mp4",
  "https://cdn.dribbble.com/userupload/48863336/file/490b48c12b66b1c8deefcc735dd9d14c.mp4",
  "https://cdn.dribbble.com/userupload/45770786/file/0c40faecdfcdaffc80d81d0f074226f2.mp4",
  "https://cdn.dribbble.com/userupload/47510971/file/5b1096096003ebeaf9156fd7d67183cf.mp4",
];
/* ⭐ HERO CATEGORY PILLS */
const HERO_PILLS = [
  { id: "all",         label: "All",         icon: FaThLarge },
  { id: "vehicles",    label: "Cars",        icon: FaCar },
  { id: "bikes",       label: "Bikes",       icon: FaMotorcycle },
  { id: "property",    label: "Properties",  icon: FaHome },
  { id: "furniture",   label: "Furniture",   icon: FaChair },
  { id: "electronics", label: "Electronics", icon: FaTv },
  { id: "more",        label: "More",        icon: FaEllipsisH },
];
/* ═══════════════════════════════════════════════════════════════
   PREMIUM SHELL — animated golden border wrapper
   ═══════════════════════════════════════════════════════════════ */
const PremiumShell = ({ children, active, className = "" }) => {
  if (!active) return <div className={className}>{children}</div>;
  return (
    <div className={`premium-shell ${className}`} style={{ position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: "inherit",
          padding: 2,
          background:
            "conic-gradient(from 0deg, #F58220, #E26A2C, #D35400, #F58220)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: "premiumSpin 6s linear infinite",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   OCCASION PANELS DATA
   ═══════════════════════════════════════════════════════════════ */
const OCCASION_PANELS = [
  {
    id: "everyday",
    title: "Everyday essentials",
    tiles: [
      { label: "Mobiles",   category: "mobiles",     img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", bg: "#F4F1EA", accent: "#2A6FB8" },
      { label: "Laptops",   category: "electronics", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", bg: "#EFEAF3", accent: "#6B4A8A" },
      { label: "Bikes",     category: "bikes",       img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80", bg: "#EAF2EE", accent: "#164B3B" },
      { label: "Watches",   category: "electronics", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80", bg: "#F4EDE5", accent: "#B23A2E" },
    ],
  },
  {
    id: "home",
    title: "Home & living",
    tiles: [
      { label: "Property",  category: "property",    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80", bg: "#EAF2EE", accent: "#164B3B" },
      { label: "Furniture", category: "property",    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", bg: "#F4EDE5", accent: "#8B5E3C" },
      { label: "TVs",       category: "electronics", img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80", bg: "#E8EEF4", accent: "#2A4A6B" },
      { label: "Kitchen",   category: "property",    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", bg: "#F4F1EA", accent: "#C9A227" },
    ],
  },
  {
    id: "auto",
    title: "Auto & moto",
    tiles: [
      { label: "Cars",      category: "vehicles",    img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80", bg: "#F4EDE5", accent: "#B23A2E" },
      { label: "Bikes",     category: "bikes",       img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80", bg: "#EAF2EE", accent: "#164B3B" },
      { label: "Trucks",    category: "vehicles",    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=80", bg: "#E8EEF4", accent: "#2A4A6B" },
      { label: "Parts",     category: "vehicles",    img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80", bg: "#F4F1EA", accent: "#7A6F5D" },
    ],
  },
  {
    id: "fun",
    title: "Fun & leisure",
    tiles: [
      { label: "Toys",      category: "toys",        img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80", bg: "#F4EDE5", accent: "#D22030" },
      { label: "Gaming",    category: "toys",        img: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=80", bg: "#EFEAF3", accent: "#6B4A8A" },
      { label: "Cameras",   category: "electronics", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80", bg: "#E8EEF4", accent: "#2A6FB8" },
      { label: "Books",     category: "electronics", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80", bg: "#F4F1EA", accent: "#8B5E3C" },
    ],
  },
];
/* ═══════════════════════════════════════════════════════════════
   SHOP BY OCCASION — Amazon-style panels + premium toggle
   ═══════════════════════════════════════════════════════════════ */
const ShopByOccasion = ({ onTagClick, onCardClick, activeCategoryTab }) => {
  const [viewMode, setViewMode] = useState("more");
  const isPremium = viewMode === "premium";

  return (
    <section className="mb-5 sm:mb-6">
      {/* ═══ Header ═══ */}
      <div className="flex items-end justify-between gap-3 sm:gap-4 mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
        <div className="flex items-center gap-3 mb-1">


  {/* Modern heading with gradient underline */}
  <h2
    style={{
      position: "relative",
      color: "var(--fd-txt)",
      fontSize: "clamp(20px, 3.2vw, 30px)",
      fontWeight: 800,
      letterSpacing: "-0.035em",
      lineHeight: 1.1,
      fontFamily: "'Manrope', 'Inter', system-ui, -apple-system, sans-serif",
      margin: 0,
    }}
  >
    Explore{" "}
    <span
      style={{
        background:
          "linear-gradient(135deg, var(--fd-primary) 0%, var(--fd-primary-2) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      Categories
    </span>

    {/* Gradient underline bar */}
    <span
      aria-hidden
      style={{
        display: "block",
        width: 42,
        height: 3,
        marginTop: 8,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, var(--fd-primary) 0%, var(--fd-primary-2) 60%, transparent 100%)",
        opacity: 0.9,
      }}
    />
  </h2>
</div>
            {isPremium && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ticket-body text-[9px] font-black uppercase tracking-widest text-white"
                style={{
                  background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)",
                  boxShadow: "0 6px 16px -6px rgba(242,138,45,0.7)",
                }}
              >
                ✦ Premium
              </span>
            )}
          </div>
          <p
            className="font-ticket-body text-[11px] sm:text-[12px]"
            style={{ color: "var(--fd-txt-soft)" }}
          >
            Tap a category to filter your feed
          </p>
        </div>

        <div
          className="inline-flex items-center gap-0.5 p-0.5 rounded-full flex-shrink-0"
          style={{ background: "var(--fd-surface-2)", border: "1px solid var(--fd-line)" }}
        >
          <button
            type="button"
            onClick={() => setViewMode("more")}
            className="px-2 sm:px-2.5 md:px-3 py-1.5 rounded-full font-ticket-body text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap"
            style={
              viewMode === "more"
                ? { background: "var(--fd-primary)", color: "#fff", boxShadow: "0 6px 14px -6px var(--fd-primary-glow)" }
                : { color: "var(--fd-txt-soft)" }
            }
          >
            <span className="hidden xs:inline">More view</span>
            <span className="xs:hidden">More</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("premium")}
            className="px-2 sm:px-2.5 md:px-3 py-1.5 rounded-full font-ticket-body text-[10px] sm:text-[11px] font-bold transition-all inline-flex items-center gap-1 whitespace-nowrap"
            style={
              viewMode === "premium"
                ? { background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)", color: "#fff", boxShadow: "0 6px 14px -6px rgba(242,138,45,0.7)" }
                : { color: "var(--fd-txt-soft)" }
            }
          >
            ✦ <span className="hidden xs:inline">Premium</span>
          </button>
        </div>
      </div>

      {/* ═══ 4-panel showcase row ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {OCCASION_PANELS.map((panel) => (
          <PremiumShell key={panel.id} active={isPremium} className="rounded-2xl">
            <div
              className="flex flex-col h-full rounded-2xl p-3 sm:p-4"
              style={{
                background: "var(--fd-surface)",
                border: "1px solid var(--fd-line)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
              }}
            >
              {/* Panel header */}
              <button
                type="button"
                onClick={() => onCardClick?.(panel.id)}
                className="flex items-center justify-between w-full mb-3 group"
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
              >
                <h3
                  className="text-left font-black leading-tight"
                  style={{
                    color: "var(--fd-txt)",
                    fontSize: "clamp(15px, 1.5vw, 19px)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {panel.title}
                </h3>
                <span
                  className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--fd-txt)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              </button>

              {/* 2×2 tiles */}
              <div className="grid grid-cols-2 gap-2 flex-1">
                {panel.tiles.map((tile) => {
                  const isActive = activeCategoryTab === tile.category;
                  return (
                    <button
                      key={tile.label}
                      type="button"
                      onClick={() => onCardClick?.(tile.category)}
                      className="flex flex-col text-left group"
                      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-lg transition-all"
                        style={{
                          aspectRatio: "1 / 1",
                          background: tile.bg,
                          boxShadow: isActive
                            ? `0 0 0 2px ${tile.accent || "var(--fd-primary)"}`
                            : "inset 0 0 0 1px rgba(20,20,30,0.04)",
                        }}
                      >
                        <img
                          src={tile.img}
                          alt={tile.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        {isActive && (
                          <span
                            className="absolute top-1.5 right-1.5 z-10 h-5 w-5 rounded-full flex items-center justify-center shadow-md"
                            style={{
                              background: tile.accent || "var(--fd-primary)",
                              color: "#fff",
                            }}
                          >
                            <FaCheck className="text-[9px]" />
                          </span>
                        )}
                      </div>

                      <span
                        className="mt-1.5 text-[11.5px] sm:text-[12.5px] font-medium leading-tight truncate transition-colors"
                        style={{
                          color: isActive ? "var(--fd-primary)" : "var(--fd-txt)",
                          fontWeight: isActive ? 700 : 500,
                        }}
                      >
                        {tile.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </PremiumShell>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const FeedStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800;900&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    html, body { max-width: 100vw; overflow-x: clip; }

    .sidebar-scroll::-webkit-scrollbar { width: 5px; }
    .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: var(--fd-scroll); border-radius: 4px;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: var(--fd-primary); }

    /* ═══════ SIDEBAR COLLAPSE ═══════ */
    .fd-sidebar-wrap {
      transition: width 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                  margin-left 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.22s ease;
      will-change: width, margin-left;
    }
    .fd-sidebar-wrap--collapsed {
      width: 0 !important;
      margin-left: 0 !important;
      opacity: 0;
      pointer-events: none;
    }
    .fd-sidebar-toggle {
      position: absolute;
      top: 22px;
      right: -14px;
      z-index: 20;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--fd-surface);
      border: 1px solid var(--fd-line-str);
      color: var(--fd-txt);
      cursor: pointer;
      transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
    }
    .fd-sidebar-toggle:hover {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: #FFFFFF;
      transform: scale(1.08);
    }
    .fd-sidebar-toggle svg {
      font-size: 10px;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fd-sidebar-reveal {
      position: fixed;
      top: 24px;
      left: 12px;
      z-index: 60;
      height: 40px;
      padding: 0 14px 0 12px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--fd-surface);
      border: 1px solid var(--fd-line-str);
      color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .fd-sidebar-reveal:hover {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: #FFFFFF;
      transform: translateY(-1px);
    }
    .fd-sidebar-reveal svg { font-size: 11px; }

    /* ═══ THEME ═══ */
    .theme-dark {
      --fd-bg-1:#0A0A12; --fd-bg-2:#0F0F1A; --fd-page:#0A0A12;
      --fd-surface:#16161F; --fd-surface-2:#1C1C28;
      --fd-panel:rgba(255,255,255,0.045);
      --fd-line:rgba(255,255,255,0.08); --fd-line-str:rgba(255,255,255,0.15);
      --fd-txt:#FFFFFF; --fd-txt-soft:rgba(255,255,255,0.65); --fd-txt-faint:rgba(255,255,255,0.42);
      --fd-dot:rgba(255,255,255,0.06);
      --fd-primary:#F58220; --fd-primary-2:#E26A2C; --fd-primary-3:#D35400;
      --fd-primary-soft:rgba(242,138,45,0.14); --fd-primary-glow:rgba(242,138,45,0.45);
      --fd-success:#16A34A; --fd-success-soft:rgba(22,163,74,0.12);
      --fd-danger:#EF4444; --fd-danger-soft:rgba(239,68,68,0.12);
      --fd-hot:#F26522; --fd-hot-soft:rgba(242,101,34,0.14);
      --fd-input-bg:#0F0F17; --fd-scroll:rgba(255,255,255,0.12);
      --fd-hover:rgba(255,255,255,0.04); --fd-star:#FFB800;
      --fd-ink:#0A0A12;
    }
    .theme-light {
      --fd-bg-1:#F7F7F9; --fd-bg-2:#F7F7F9; --fd-page:#F7F7F9;
      --fd-surface:#FFFFFF; --fd-surface-2:#F5F5F7;
      --fd-panel:rgba(255,255,255,0.9);
      --fd-line:rgba(20,20,30,0.06); --fd-line-str:rgba(20,20,30,0.12);
      --fd-txt:#0F1419; --fd-txt-soft:rgba(15,20,25,0.62); --fd-txt-faint:rgba(15,20,25,0.42);
      --fd-dot:rgba(20,20,30,0.08);
      --fd-primary:#E26A2C; --fd-primary-2:#F58220; --fd-primary-3:#D35400;
      --fd-primary-soft:rgba(226,106,44,0.14); --fd-primary-glow:rgba(226,106,44,0.40);
      --fd-success:#16A34A; --fd-success-soft:rgba(22,163,74,0.10);
      --fd-danger:#EF4444; --fd-danger-soft:rgba(239,68,68,0.10);
      --fd-hot:#F26522; --fd-hot-soft:rgba(242,101,34,0.12);
      --fd-input-bg:#FFFFFF; --fd-scroll:rgba(0,0,0,0.12);
      --fd-hover:rgba(20,20,30,0.03); --fd-star:#FFB800;
      --fd-ink:#0A0A12;
    }

    /* ⭐ SEARCH SUGGESTION DROPDOWN */
    .fs-suggest-panel {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      right: 0;
      background: #FFFFFF;
      border: 1px solid rgba(20,20,30,0.08);
      border-radius: 18px;
      box-shadow: 0 30px 70px -20px rgba(0,0,0,0.35), 0 10px 24px -10px rgba(0,0,0,0.15);
      overflow: hidden;
      z-index: 60;
      max-height: 440px;
      overflow-y: auto;
    }
    .theme-dark .fs-suggest-panel {
      background: #1A1A24;
      border-color: rgba(255,255,255,0.10);
      box-shadow: 0 30px 70px -20px rgba(0,0,0,0.7);
    }
    .fs-suggest-head {
      padding: 10px 16px 8px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(15,20,25,0.42);
    }
    .theme-dark .fs-suggest-head { color: rgba(255,255,255,0.42); }
    .fs-suggest-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      cursor: pointer;
      transition: background 0.15s ease;
      border: none;
      width: 100%;
      background: transparent;
      text-align: left;
      font-family: 'Manrope', system-ui, sans-serif;
    }
    .fs-suggest-item:hover,
    .fs-suggest-item.is-active {
      background: rgba(245,130,32,0.10);
    }
    .theme-dark .fs-suggest-item:hover,
    .theme-dark .fs-suggest-item.is-active {
      background: rgba(245,130,32,0.14);
    }
    .fs-suggest-thumb {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      background: rgba(20,20,30,0.05);
    }
    .theme-dark .fs-suggest-thumb { background: rgba(255,255,255,0.05); }
    .fs-suggest-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .fs-suggest-title {
      font-size: 13px;
      font-weight: 700;
      color: #0F1419;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }
    .theme-dark .fs-suggest-title { color: #FFFFFF; }
    .fs-suggest-meta {
      font-size: 11px;
      color: rgba(15,20,25,0.55);
      margin: 2px 0 0;
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .theme-dark .fs-suggest-meta { color: rgba(255,255,255,0.55); }
    .fs-suggest-price {
      font-size: 12.5px;
      font-weight: 800;
      color: #E26A2C;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: auto;
    }
    .theme-dark .fs-suggest-price { color: #F58220; }
    .fs-suggest-empty {
      padding: 22px 18px;
      text-align: center;
      font-size: 12px;
      color: rgba(15,20,25,0.55);
    }
    .theme-dark .fs-suggest-empty { color: rgba(255,255,255,0.55); }
    .fs-suggest-footer {
      padding: 10px 14px;
      border-top: 1px solid rgba(20,20,30,0.06);
      font-size: 11.5px;
      font-weight: 700;
      color: #E26A2C;
      cursor: pointer;
      text-align: center;
      background: rgba(245,130,32,0.05);
    }
    .theme-dark .fs-suggest-footer {
      border-top-color: rgba(255,255,255,0.08);
      color: #F58220;
      background: rgba(245,130,32,0.08);
    }
    .fs-suggest-footer:hover { background: rgba(245,130,32,0.12); }

    /* ═══ HERO CATEGORY PILLS ═══ */
    .hz-pills {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 18px 4px 4px;
      margin-top: 8px;
    }
    .hz-pills::-webkit-scrollbar { display: none; }
    @media (min-width: 1024px) {
      .hz-pills { justify-content: center; }
    }
    .hz-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 999px;
      background: #FFFFFF;
      border: 1px solid rgba(20,20,30,0.08);
      color: #3A3026;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.18s ease;
    }
    .theme-dark .hz-pill {
      background: #16161F;
      border-color: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
    }
    .hz-pill:hover {
      transform: translateY(-1px);
      border-color: rgba(242,107,31,0.4);
      color: #F26B1F;
    }
    .hz-pill--active {
      background: linear-gradient(135deg, #F26B1F 0%, #E25813 100%);
      border-color: transparent;
      color: #FFFFFF !important;
      box-shadow: 0 10px 20px -10px rgba(242,107,31,0.55);
    }
    .hz-pill--active:hover { color: #FFFFFF; }
    .hz-pill__icon { font-size: 14px; }
    .fd-bg { background: var(--fd-page); color: var(--fd-txt); transition: background 0.3s ease, color 0.3s ease; }
    .fd-panel-solid { background: var(--fd-surface); border: 1px solid var(--fd-line); }
    .fd-card { background: var(--fd-surface); border: 1px solid var(--fd-line); }
    .fd-input { background: var(--fd-input-bg); color: var(--fd-txt); border: 1px solid var(--fd-line-str); }
    .fd-input::placeholder { color: var(--fd-txt-faint); }
    .fd-input:focus { border-color: var(--fd-primary); }
    .fd-row { transition: background 0.15s ease; }
    .fd-row:hover { background: var(--fd-hover); }

    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    .shimmer { background: linear-gradient(90deg, var(--fd-line) 0%, var(--fd-primary-soft) 50%, var(--fd-line) 100%); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }

    /* ═══════════════════════════════════════════════════════════════
       ⭐ MODERN CARD
       ═══════════════════════════════════════════════════════════════ */
    .mk-card {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--fd-surface);
      border: 1px solid var(--fd-line);
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease, box-shadow 0.25s ease;
      text-align: left;
      width: 100%;
      cursor: pointer;
      color: var(--fd-txt);
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .theme-dark .hz-pill--active {
      background: linear-gradient(135deg, #F26B1F 0%, #E25813 100%);
      border-color: transparent;
      color: #FFFFFF !important;
      box-shadow: 0 10px 20px -10px rgba(242,107,31,0.6);
    }
    .theme-dark .hz-pill--active:hover {
      background: linear-gradient(135deg, #F58220 0%, #E66A1E 100%);
      color: #FFFFFF;
    }
    .mk-card__img-wrap {
      position: relative;
      aspect-ratio: 4 / 3;
      background: var(--fd-surface-2);
      overflow: hidden;
    }
    .theme-light .mk-card__img-wrap { background: #F0F0F3; }

    .mk-card__img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
    }
    .mk-card:hover .mk-card__img { transform: scale(1.05); }

    .mk-card__body {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: var(--fd-surface);
    }

    .mk-card__title {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.3;
      color: var(--fd-txt);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      letter-spacing: -0.01em;
    }

    .mk-card__location {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--fd-txt-soft);
      line-height: 1.2;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mk-card__location svg {
      font-size: 11px;
      color: var(--fd-txt-faint);
      flex-shrink: 0;
    }

    .mk-card__icon-specs {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 0 4px;
      flex-wrap: wrap;
    }
    .mk-card__icon-spec {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: var(--fd-txt-soft);
      white-space: nowrap;
    }
    .mk-card__icon-spec svg {
      font-size: 12px;
      color: var(--fd-txt-faint);
      flex-shrink: 0;
    }

    .mk-card__price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 10px;
      margin-top: 2px;
      border-top: 1px solid var(--fd-line);
      flex-wrap: wrap;
    }
    .mk-card__price {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #E26A2C;
      letter-spacing: -0.01em;
      line-height: 1.1;
    }
    .theme-dark .mk-card__price {
      color: #F58220;
    }
    .mk-card__view-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 12px;
      border-radius: 999px;
      background: #FDF2E9;
      color: #E26A2C;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.18s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .theme-dark .mk-card__view-btn {
      background: rgba(245,130,32,0.14);
      color: #F58220;
    }
    .mk-card__view-btn:hover {
      background: #FCE4CE;
      transform: translateX(2px);
    }
    .theme-dark .mk-card__view-btn:hover {
      background: rgba(245,130,32,0.22);
    }
    .mk-card__view-btn svg {
      font-size: 9px;
      transition: transform 0.2s ease;
    }
    .mk-card__view-btn:hover svg {
      transform: translateX(2px);
    }

    .mk-card__badge {
      position: absolute; top: 12px; left: 12px; z-index: 5;
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 12px;
      border-radius: 8px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.005em;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    .mk-card__badge--sale { background: #E26A2C; }
    .mk-card__badge--rent { background: #2A8FBD; }
    .mk-card__badge--great { background: #FFFFFF; color: #0F1419; border: 1px solid rgba(20,20,30,0.08); }
    .mk-card__badge--good { background: #34D058; color: #FFFFFF; }
    .mk-card__badge--featured {
      background: linear-gradient(135deg, #F58220 0%, #D35400 100%);
      color: #0A0A12;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      font-size: 10px;
      padding: 6px 10px;
      border-radius: 999px;
    }
    .mk-card__badge--sold { background: #B23A2E; color: #FFFFFF; }
    .mk-card__badge--hot { background: linear-gradient(135deg, #F26522 0%, #E53935 100%); color: #FFFFFF; }

    .mk-card__fav {
      position: absolute; top: 12px; right: 12px; z-index: 5;
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: #FFFFFF;
      color: #111111;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      transition: transform 0.2s ease, background 0.3s ease, color 0.3s ease;
      cursor: pointer;
    }
    .theme-dark .mk-card__fav {
      background: rgba(22,22,31,0.9);
      color: #F58220;
    }
    .mk-card__fav:hover { transform: scale(1.1); }
    .mk-heart-filled { color: #E53935 !important; }
    .theme-dark .mk-heart-filled { color: #F58220 !important; }

    .mk-card__verified {
      position: absolute;
      bottom: 10px; left: 10px; z-index: 6;
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 8px;
      border-radius: 999px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: #FFFFFF;
      background: #10B981;
    }
    .mk-card__verified svg { font-size: 9px; }

    .sold-stamp {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      pointer-events: none; z-index: 20;
      background: rgba(0,0,0,0.35);
    }
    .sold-stamp__ring {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 8px 20px; border-radius: 6px;
      border: 2.5px solid #FFFFFF;
      background: rgba(178,58,46,0.85);
      transform: rotate(-14deg);
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
      color: #FFFFFF; font-size: 16px; line-height: 1;
    }
    .sold-stamp__ring--large { padding: 12px 30px; font-size: 22px; letter-spacing: 0.22em; border-width: 3px; }

    /* ═══════════════════════════════════════════════════════════════
       ⭐ NEW SIDEBAR — REFERENCE STYLE
       ═══════════════════════════════════════════════════════════════ */

    /* Header */
    .fd-sb-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      flex-shrink: 0;
    }
    .fd-sb-title {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--fd-txt);
    }
    .fd-sb-header-actions {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .fd-sb-reset {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--fd-txt-soft);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
      transition: color 0.15s ease, background 0.15s ease;
    }
    .fd-sb-reset:hover { color: var(--fd-txt); background: var(--fd-hover); }
    .fd-sb-close {
      width: 28px; height: 28px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--fd-txt-soft);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
      flex-shrink: 0;
    }
    .fd-sb-close:hover { background: var(--fd-hover); color: var(--fd-txt); }
    .fd-sb-close svg { font-size: 12px; }

    /* Section block */
    .fd-sb-section {
      padding: 16px 20px 18px;
      border-top: 1px solid var(--fd-line);
    }
    .fd-sb-section:first-of-type { border-top: none; }

    /* Section heading */
    .fd-sb-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      background: transparent;
      border: none;
      padding: 0;
      cursor: default;
      text-align: left;
    }
    .fd-sb-section-head.clickable { cursor: pointer; }
    .fd-sb-section-title {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--fd-txt-faint);
    }
    .fd-sb-chevron {
      color: var(--fd-txt-faint);
      font-size: 10px;
      transition: transform 0.25s ease;
      flex-shrink: 0;
    }
    .fd-sb-chevron.open { transform: rotate(180deg); }

    /* Option chips row */
    .fd-sb-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .fd-sb-chip {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--fd-line-str);
      background: transparent;
      color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .fd-sb-chip:hover { border-color: var(--fd-txt-faint); }
    .fd-sb-chip.active {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: #FFFFFF;
      box-shadow: 0 4px 10px -4px var(--fd-primary-glow);
    }

    /* Available now toggle row */
    .fd-sb-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 4px;
    }
    .fd-sb-toggle-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--fd-txt-faint);
    }

    /* ═══ PRICE HISTOGRAM ═══ */
    .fd-sb-hist {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 68px;
      width: 100%;
      padding: 0 2px;
      user-select: none;
    }
    .fd-sb-hist-bar {
      flex: 1;
      background: #D1D5DB;
      border-radius: 1px;
      min-height: 6px;
      transition: background 0.15s ease;
    }
    .theme-dark .fd-sb-hist-bar { background: rgba(255,255,255,0.15); }
    .fd-sb-hist-bar.active { background: var(--fd-primary); }

    /* ⭐ INTERACTIVE PRICE SLIDER OVER HISTOGRAM */
    .fd-sb-hist-wrap {
      position: relative;
      padding-bottom: 4px;
    }
    .fd-sb-slider-track {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 4px;
      transform: translateY(-50%);
      border-radius: 999px;
      background: transparent;
      pointer-events: none;
      z-index: 5;
    }
    .fd-sb-slider-fill {
      position: absolute;
      top: 0;
      bottom: 0;
      background: rgba(20, 20, 30, 0.45);
      border-radius: 999px;
      pointer-events: none;
    }
    .theme-dark .fd-sb-slider-fill {
      background: rgba(255, 255, 255, 0.45);
    }
    .fd-sb-slider-thumb {
      position: absolute;
      top: 50%;
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: #FFFFFF;
      border: 2px solid #0F1419;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      transform: translate(-50%, -50%);
      cursor: grab;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      pointer-events: auto;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      padding: 0;
    }
    .theme-dark .fd-sb-slider-thumb {
      background: #0A0A12;
      border-color: #FFFFFF;
      box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
    }
    .fd-sb-slider-thumb:hover {
      transform: translate(-50%, -50%) scale(1.12);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }
    .fd-sb-slider-thumb:active {
      cursor: grabbing;
      transform: translate(-50%, -50%) scale(1.18);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    }

    /* Price inputs */
    .fd-sb-price-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 14px;
    }
    .fd-sb-price-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--fd-txt-faint);
      margin-bottom: 6px;
      display: block;
    }
    .fd-sb-price-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .fd-sb-price-prefix {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--fd-txt-soft);
      pointer-events: none;
    }
    .fd-sb-price-input {
      width: 100%;
      background: var(--fd-surface);
      border: 1px solid var(--fd-line-str);
      border-radius: 10px;
      padding: 12px 14px 12px 34px;
      color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      min-width: 0;
      -moz-appearance: textfield;
    }
    .fd-sb-price-input::-webkit-outer-spin-button,
    .fd-sb-price-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .fd-sb-price-input:focus {
      border-color: var(--fd-primary);
      box-shadow: 0 0 0 3px var(--fd-primary-soft);
    }
    .fd-sb-price-input::placeholder { color: var(--fd-txt-faint); font-weight: 600; }

    /* Body type / Fuel 2-col checkbox grid */
    .fd-sb-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
      margin-top: 12px;
    }
    .fd-sb-check {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      padding: 4px 0;
    }
    .fd-sb-check-box {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1.5px solid var(--fd-line-str);
      background: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .fd-sb-check-box.checked {
      background: var(--fd-txt);
      border-color: var(--fd-txt);
      color: #FFFFFF;
    }
    .theme-dark .fd-sb-check-box.checked {
      background: #FFFFFF;
      border-color: #FFFFFF;
      color: #0A0A12;
    }
    .fd-sb-check-box svg { font-size: 9px; }
    .fd-sb-check-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--fd-txt);
      line-height: 1.2;
    }

    /* ═══ LEGACY — kept so nothing else breaks ═══ */
    .fd-filter-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 18px;
      border-radius: 999px;
      border: 1px solid var(--fd-line);
      background: var(--fd-surface);
      color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .fd-filter-chip:hover { border-color: var(--fd-txt-faint); }
    .fd-filter-chip--active {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: var(--fd-ink);
      font-weight: 700;
    }

    .fd-hist {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 70px;
      width: 100%;
      padding: 0;
      user-select: none;
    }
    .fd-hist__bar {
      flex: 1;
      background: #D1D5DB;
      border-radius: 1px;
      min-height: 6px;
      transition: background 0.2s ease;
    }
    .theme-dark .fd-hist__bar { background: rgba(255,255,255,0.15); }
    .fd-hist__bar--active { background: var(--fd-primary); }
    .theme-dark .fd-hist__bar--active { background: var(--fd-primary); }

    .fd-range-track {
      position: relative;
      height: 3px;
      border-radius: 999px;
      background: #E5E7EB;
      margin: 8px 0 24px;
    }
    .theme-dark .fd-range-track { background: rgba(255,255,255,0.12); }
    .fd-range-fill {
      position: absolute;
      top: 0; bottom: 0;
      background: var(--fd-primary);
      border-radius: 999px;
    }
    .fd-range-thumb {
      position: absolute;
      top: 50%;
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: #FFFFFF;
      border: 2px solid var(--fd-primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      transform: translate(-50%, -50%);
      cursor: grab;
      transition: transform 0.15s ease;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }
    .theme-dark .fd-range-thumb {
      background: #0A0A12;
      border-color: var(--fd-primary);
    }
    .fd-range-thumb:hover { transform: translate(-50%, -50%) scale(1.1); }
    .fd-range-thumb:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.15); }

    .fd-range-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .fd-range-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .fd-range-input-prefix {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--fd-txt-soft);
      pointer-events: none;
    }
    .fd-range-input {
      background: var(--fd-surface);
      border: 1px solid var(--fd-line);
      border-radius: 10px;
      padding: 12px 14px 12px 34px;
      color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      width: 100%;
      min-width: 0;
    }
    .fd-range-input:focus {
      border-color: var(--fd-primary);
      box-shadow: 0 0 0 3px var(--fd-primary-soft);
    }
    .fd-range-input::placeholder { color: var(--fd-txt-faint); font-weight: 600; }
    .fd-range-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--fd-txt-faint);
      margin-bottom: 6px;
      display: block;
    }

    .fd-range-simple-track {
      position: relative;
      height: 4px;
      border-radius: 999px;
      background: #E5E7EB;
      margin: 12px 0 6px;
    }
    .theme-dark .fd-range-simple-track { background: rgba(255,255,255,0.12); }
    .fd-range-simple-fill {
      position: absolute;
      top: 0; bottom: 0; left: 0;
      background: var(--fd-primary);
      border-radius: 999px;
    }
    .fd-range-simple-thumb {
      position: absolute;
      top: 50%;
      width: 20px;
      height: 20px;
      border-radius: 999px;
      background: #FFFFFF;
      border: 2px solid var(--fd-primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      transform: translate(-50%, -50%);
      cursor: grab;
      transition: transform 0.15s ease;
      touch-action: none;
    }
    .theme-dark .fd-range-simple-thumb {
      background: #0A0A12;
      border-color: var(--fd-primary);
    }

    /* ═══ BRAND ROW ═══ */
    .fd-brand-row {
      display: grid;
      grid-template-columns: 32px 1fr auto auto;
      align-items: center;
      gap: 12px;
      padding: 10px 4px;
      border-radius: 10px;
      transition: background 0.15s ease;
      cursor: pointer;
    }
    .fd-brand-row:hover { background: var(--fd-hover); }
    .fd-brand-logo {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 999px;
      overflow: hidden;
      background: var(--fd-surface-2);
      flex-shrink: 0;
    }
    .fd-brand-logo img { width: 100%; height: 100%; object-fit: contain; }
    .fd-brand-name {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--fd-txt);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fd-brand-count {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--fd-txt-faint);
      margin-right: 6px;
    }
    .fd-brand-check {
      width: 22px; height: 22px;
      border-radius: 6px;
      border: 1.5px solid var(--fd-line-str);
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .fd-brand-check--active {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: var(--fd-ink);
    }

    /* ═══ CATEGORY GRID ═══ */
    .fd-cat-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .fd-cat-tile {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 10px 6px;
      border-radius: 12px;
      background: var(--fd-surface-2);
      border: 1px solid var(--fd-line);
      color: var(--fd-txt);
      cursor: pointer;
      transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
      text-align: center;
      min-width: 0;
    }
    .fd-cat-tile:hover {
      border-color: var(--fd-line-str);
      transform: translateY(-1px);
    }
    .fd-cat-tile[data-active="true"] {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: var(--fd-ink);
    }
    .fd-cat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 999px;
      background: var(--fd-surface);
      color: inherit;
      flex-shrink: 0;
    }
    .fd-cat-icon svg { font-size: 13px; }
    .fd-cat-tile[data-active="true"] .fd-cat-icon {
      background: rgba(0, 0, 0, 0.10);
      color: var(--fd-ink);
    }
    .fd-cat-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
    .fd-cat-count {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 9.5px;
      font-weight: 600;
      color: var(--fd-txt-faint);
      line-height: 1;
    }
    .fd-cat-tile[data-active="true"] .fd-cat-count {
      color: rgba(0, 0, 0, 0.55);
    }

    /* ═══ SELLER ROW ═══ */
    .mk-card__seller {
      display: flex;
      align-items: center;
      gap: 7px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--fd-line);
      margin-bottom: 4px;
    }
    .mk-card__seller-name {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--fd-txt-soft);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }
    .mk-card__seller-check { display: none; }

    /* ═══ ACTION ROW ═══ */
    .mk-card__actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--fd-line);
    }
    .mk-card__action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 8px 6px;
      border-radius: 8px;
      border: 1px solid var(--fd-line);
      background: var(--fd-surface-2);
      color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mk-card__action svg { font-size: 11px; flex-shrink: 0; }
    .mk-card__action span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mk-card__action:hover:not(:disabled) { transform: translateY(-1px); }
    .mk-card__action:active:not(:disabled) { transform: translateY(0); }
    .mk-card__action:disabled { opacity: 0.45; cursor: not-allowed; }
    .mk-card__action--save.is-active {
      background: var(--fd-primary-soft);
      border-color: var(--fd-primary);
      color: var(--fd-primary);
    }
    .mk-card__action--save:hover:not(:disabled) {
      border-color: var(--fd-danger);
      color: var(--fd-danger);
    }
    .mk-card__action--chat:hover:not(:disabled) {
      background: rgba(42, 143, 189, 0.10);
      border-color: #2A8FBD;
      color: #2A8FBD;
    }
    .mk-card__action--buy {
      background: linear-gradient(135deg, var(--fd-primary) 0%, var(--fd-primary-3) 100%);
      border-color: var(--fd-primary);
      color: var(--fd-ink);
    }
    .mk-card__action--buy:hover:not(:disabled) {
      filter: brightness(1.05);
      box-shadow: 0 6px 16px -6px var(--fd-primary-glow);
    }
    .mk-card__action--buy:disabled {
      background: var(--fd-surface-2);
      border-color: var(--fd-line);
      color: var(--fd-txt-faint);
    }

    @media (max-width: 480px) {
      .mk-card__action { padding: 9px 6px; gap: 5px; }
      .mk-card__action svg { font-size: 12px; }
      .mk-card__action span { display: inline; font-size: 12px; }
    }

    /* ═══ Responsive category grid ═══ */
    @media (max-width: 1200px) {
      .fd-cat-grid { gap: 7px; }
      .fd-cat-tile { padding: 9px 5px; gap: 4px; border-radius: 11px; }
      .fd-cat-icon { width: 24px; height: 24px; }
      .fd-cat-icon svg { font-size: 12px; }
      .fd-cat-label { font-size: 10px; }
      .fd-cat-count { font-size: 9px; }
    }
    @media (max-width: 1024px) {
      .fd-cat-grid { gap: 6px; }
      .fd-cat-tile { padding: 8px 4px; gap: 3px; }
      .fd-cat-icon { width: 22px; height: 22px; }
      .fd-cat-icon svg { font-size: 11px; }
      .fd-cat-label { font-size: 9.5px; }
    }
    @media (max-width: 900px) {
      .fd-cat-label { font-size: 9px; }
      .fd-cat-tile { padding: 8px 3px; }
    }
    @media (hover: none) and (pointer: coarse) {
      .fd-cat-tile:hover { transform: none; border-color: var(--fd-line); }
    }

    /* ═══ TOGGLE SWITCH ═══ */
    .fd-switch {
      position: relative;
      width: 46px; height: 26px;
      border-radius: 999px;
      background: #D1D5DB;
      transition: background 0.2s ease;
      flex-shrink: 0;
      border: none;
      cursor: pointer;
      padding: 0;
      touch-action: manipulation;
    }
    .theme-dark .fd-switch { background: rgba(255,255,255,0.15); }
    .fd-switch--on { background: var(--fd-primary); }
    .fd-switch__knob {
      position: absolute;
      top: 3px; left: 3px;
      width: 20px; height: 20px;
      border-radius: 999px;
      background: #FFFFFF;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .fd-switch--on .fd-switch__knob { transform: translateX(20px); }

    /* ═══ SECTION LABEL ═══ */
    .fd-section-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--fd-txt-faint);
      margin-bottom: 14px;
    }

    .fd-sidebar-title {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--fd-txt);
    }

    /* ═══ Bottom nav (mobile) ═══ */
    .fd-bottomnav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 250; display: flex; align-items: center; justify-content: space-around; padding: 8px 4px max(8px, env(safe-area-inset-bottom)); background: var(--fd-surface); border-top: 1px solid var(--fd-line); }
    @media (min-width: 768px) { .fd-bottomnav { display: none; } }
    .fd-bottomnav__item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px; font-family: 'Manrope', system-ui, sans-serif; font-size: 10.5px; font-weight: 600; color: var(--fd-txt-faint); text-decoration: none; transition: color 0.15s ease; }
    .fd-bottomnav__item--active { color: var(--fd-primary); }
    .fd-bottomnav__item svg { font-size: 20px; }
    .fd-bottomnav__item--active svg { color: var(--fd-primary); }

    /* ═══ Filter FAB ═══ */
    .fd-fab { position: fixed; right: 16px; bottom: calc(76px + max(8px, env(safe-area-inset-bottom))); z-index: 240; height: 48px; padding: 0 18px; border-radius: 999px; display: inline-flex; align-items: center; gap: 8px; color: var(--fd-ink); font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 800; background: linear-gradient(135deg, var(--fd-primary) 0%, var(--fd-primary-3) 100%); transition: transform 0.2s ease; }
    @media (min-width: 768px) { .fd-fab { display: none; } }
    .fd-fab:active { transform: scale(0.95); }
    .fd-fab__dot { position: absolute; top: 8px; right: 8px; width: 10px; height: 10px; border-radius: 999px; background: #fff; border: 2px solid var(--fd-primary); }

    /* ═══ Mobile sheet ═══ */
    .fd-sheet-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); z-index: 280; }
    @media (min-width: 768px) { .fd-sheet-backdrop { display: none; } }
    .fd-sheet { position: fixed; left: 0; right: 0; bottom: 0; max-height: 92vh; background: var(--fd-surface); border-top-left-radius: 24px; border-top-right-radius: 24px; border-top: 1px solid var(--fd-line); z-index: 290; display: flex; flex-direction: column; overflow: hidden; will-change: transform; }
    @media (min-width: 768px) { .fd-sheet { display: none; } }
    .fd-sheet__handle { width: 44px; height: 4px; border-radius: 999px; background: var(--fd-line-str); margin: 10px auto 4px auto; flex-shrink: 0; }
    .fd-sheet__header { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px 12px 16px; border-bottom: 1px solid var(--fd-line); flex-shrink: 0; }
    .fd-sheet__body { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
    .fd-sheet__footer { padding: 12px 16px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid var(--fd-line); display: flex; align-items: center; gap: 10px; flex-shrink: 0; background: var(--fd-surface); }

    /* ═══ Chip row (filter) ═══ */
    .fd-chip {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 8px 14px; border-radius: 999px;
      border: 1px solid var(--fd-line-str);
      background: transparent; color: var(--fd-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12.5px; font-weight: 600;
      cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
    }
    .fd-chip:hover { border-color: var(--fd-txt-faint); }
    .fd-chip--active {
      background: var(--fd-primary);
      border-color: var(--fd-primary);
      color: var(--fd-ink);
    }

    @media (max-width: 767px) {
      .mk-card__title { font-size: 13.5px; }
      .mk-card__price { font-size: 15px; }
      .mk-card__location { font-size: 11.5px; }
      .mk-card__icon-spec { font-size: 11px; }
      .mk-card__view-btn { font-size: 11px; padding: 6px 10px; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   META + DATA
   ═══════════════════════════════════════════════════════════════ */
const CATEGORY_META = {
  vehicles:    { label: "Vehicles",    icon: FaCar,        accent: "#E26A2C", detailPath: "vehicle" },
  bikes:       { label: "Bikes",       icon: FaMotorcycle, accent: "#E26A2C", detailPath: "bike" },
  mobiles:     { label: "Mobiles",     icon: FaMobileAlt,  accent: "#E26A2C", detailPath: "mobile" },
  property:    { label: "Property",    icon: FaHome,       accent: "#E26A2C", detailPath: "property" },
  electronics: { label: "Electronics", icon: FaLaptop,     accent: "#E26A2C", detailPath: "electronic" },
  toys:        { label: "Toys",        icon: FaGamepad,    accent: "#E26A2C", detailPath: "toy" },
};

const TOP_CATEGORIES = ["Vehicles", "Bikes", "Mobiles", "Property", "Electronics", "Toys"];

const HERO_CATEGORIES = [
  { id: "all",         label: "All",         icon: FaThLarge,  accent: "#E26A2C" },
  { id: "vehicles",    label: "Vehicles",    icon: LuCar,      accent: "#E26A2C" },
  { id: "bikes",       label: "Bikes",       icon: LuBike,     accent: "#E26A2C" },
  { id: "mobiles",     label: "Mobiles",     icon: LuSmartphone, accent: "#E26A2C" },
  { id: "property",    label: "Property",    icon: LuBuilding2, accent: "#E26A2C" },
  { id: "electronics", label: "Electronics", icon: LuLaptop,   accent: "#E26A2C" },
  { id: "toys",        label: "Toys",        icon: LuGamepad2, accent: "#E26A2C" },
];

const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

const VIEW_MODES = [
  { id: "grid-lg", label: "Large", icon: FaExpandAlt },
  { id: "grid-md", label: "Medium", icon: FaThLarge },
  { id: "grid-sm", label: "Small", icon: FaTh },
  { id: "list", label: "List", icon: FaThList },
];

const VIEW_STORAGE_KEY = "apna.feed.view";

/* ═══════════════════════════════════════════════════════════════
   BRAND LOGOS (SVG data-URLs — no external requests)
   ═══════════════════════════════════════════════════════════════ */
const BRAND_LOGOS = {
  /* ─── Cars ─── */
  tesla: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23E31937'/><path d='M8 12h24M10 16h20M14 16l6 12 6-12M20 16v12' stroke='white' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  hyundai: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23002338'/><ellipse cx='20' cy='20' rx='11' ry='7' fill='none' stroke='white' stroke-width='1.4'/><path d='M13 20c2-3 5-4 7-4s5 1 7 4' stroke='white' stroke-width='1.4' fill='none'/><text x='20' y='22' text-anchor='middle' font-family='Arial' font-size='6' font-weight='bold' fill='white'>H</text></svg>",
  kia: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23051735'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='10' font-weight='900' fill='white'>KIA</text></svg>",
  bmw: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23000'/><circle cx='20' cy='20' r='14' fill='white'/><path d='M20 6a14 14 0 0 1 0 28z' fill='%230069D1'/><path d='M6 20a14 14 0 0 1 28 0z' fill='%2300A4E0' opacity='0.5'/></svg>",
  ford: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%230033CE'/><text x='20' y='26' text-anchor='middle' font-family='cursive' font-size='11' font-weight='bold' fill='white'>Ford</text></svg>",
  polestar: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23000'/><path d='M14 8l-4 24M26 8l4 24M14 20h12' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/></svg>",
  toyota: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23EB0A1E'/><ellipse cx='20' cy='20' rx='13' ry='8' fill='none' stroke='white' stroke-width='1.6'/><ellipse cx='20' cy='20' rx='4.5' ry='7' fill='none' stroke='white' stroke-width='1.6'/><ellipse cx='20' cy='14' rx='10' ry='3' fill='none' stroke='white' stroke-width='1.6'/></svg>",
  honda: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23E40521'/><path d='M12 10v20M28 10v20M12 20h16' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/></svg>",
  suzuki: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23003B7D'/><text x='20' y='26' text-anchor='middle' font-family='Arial' font-size='10' font-weight='900' fill='white'>S</text></svg>",
  nissan: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23C3002F'/><circle cx='20' cy='20' r='13' fill='none' stroke='white' stroke-width='1.4'/><path d='M7 20h26' stroke='white' stroke-width='1.4'/><text x='20' y='24' text-anchor='middle' font-family='Arial' font-size='6' font-weight='bold' fill='white'>NISSAN</text></svg>",
  mercedes: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23000'/><circle cx='20' cy='20' r='14' fill='none' stroke='white' stroke-width='1.6'/><path d='M20 6v28M20 20l-9 12M20 20l9 12' stroke='white' stroke-width='1.6' fill='none'/></svg>",
  audi: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23BB0A30'/><circle cx='10' cy='22' r='4.5' fill='none' stroke='white' stroke-width='1.2'/><circle cx='16' cy='22' r='4.5' fill='none' stroke='white' stroke-width='1.2'/><circle cx='22' cy='22' r='4.5' fill='none' stroke='white' stroke-width='1.2'/><circle cx='28' cy='22' r='4.5' fill='none' stroke='white' stroke-width='1.2'/></svg>",
  mg: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23C8102E'/><text x='20' y='26' text-anchor='middle' font-family='Arial' font-size='11' font-weight='900' fill='white'>MG</text></svg>",
  chevrolet: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='8' fill='%23D1A93A'/><path d='M10 15h9l3 3h8v4h-8l-3 3h-9z' fill='white'/></svg>",
  volkswagen: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23001E50'/><circle cx='20' cy='20' r='14' fill='none' stroke='white' stroke-width='1.4'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>VW</text></svg>",
  mazda: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23101010'/><ellipse cx='20' cy='20' rx='12' ry='8' fill='none' stroke='white' stroke-width='1.6'/><path d='M10 20l10 6 10-6' stroke='white' stroke-width='1.6' fill='none' stroke-linejoin='round'/></svg>",
  lexus: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%231A1A1A'/><path d='M20 8v18l-8 6M20 26l8 6' stroke='white' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>",
  porsche: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23000'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='%23C9A227'>P</text></svg>",
  jeep: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%231B3A2E'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>JEEP</text></svg>",

  /* ─── Bikes ─── */
  yamaha: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%230B4D94'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>YAMAHA</text></svg>",
  hondabike: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23E40521'/><path d='M12 10v20M28 10v20M12 20h16' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round'/></svg>",

  /* ─── Mobiles ─── */
  apple: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23111111'/><path d='M26 15c-1.5 0-2.8.7-3.6 1.6-.8-.9-2-1.6-3.4-1.6-2.8 0-5 2.4-5 5.4 0 3.6 3 7 5 8.6 1 .7 2.5.5 3.4-.5.9 1 2.4 1.2 3.4.5 2-1.6 5-5 5-8.6 0-3-2.2-5.4-4.8-5.4z' fill='white'/><path d='M20 10c1-.2 1.7-1.1 1.6-2.2-1.1.1-1.9 1-1.6 2.2z' fill='white'/></svg>",
  samsung: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><ellipse cx='20' cy='20' rx='20' ry='13' fill='%230D47A1'/><text x='20' y='23' text-anchor='middle' font-family='Arial' font-size='7' font-weight='900' fill='white'>SAMSUNG</text></svg>",
  xiaomi: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23FF6900'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='10' font-weight='900' fill='white'>mi</text></svg>",
  oppo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%231C1C1C'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>oppo</text></svg>",
  vivo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%234157E6'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='10' font-weight='900' fill='white'>vivo</text></svg>",
  oneplus: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23E3051B'/><rect x='13' y='13' width='14' height='14' fill='none' stroke='white' stroke-width='1.6'/><text x='20' y='24' text-anchor='middle' font-family='Arial' font-size='7' font-weight='900' fill='white'>1+</text></svg>",
  realme: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23FFC915'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='8' font-weight='900' fill='%23111'>realme</text></svg>",
  infinix: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%231A1A1A'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='7' font-weight='900' fill='%23E30613'>Infinix</text></svg>",

  /* ─── Electronics ─── */
  dell: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%230078CE'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>DELL</text></svg>",
  hp: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23009AD2'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='11' font-weight='900' fill='white'>hp</text></svg>",
  lenovo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='8' fill='%23E2231A'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='7' font-weight='900' fill='white'>Lenovo</text></svg>",
  sony: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23000'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>SONY</text></svg>",
  lg: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23A50034'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='11' font-weight='900' fill='white'>LG</text></svg>",
  asus: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%230053A0'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>ASUS</text></svg>",
  acer: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%2383B81E'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>acer</text></svg>",
  microsoft: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%2300A4EF'/><rect x='10' y='10' width='9' height='9' fill='white'/><rect x='21' y='10' width='9' height='9' fill='white'/><rect x='10' y='21' width='9' height='9' fill='white'/><rect x='21' y='21' width='9' height='9' fill='white'/></svg>",
  canon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23CC0000'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='7' font-weight='900' fill='white'>Canon</text></svg>",
  nintendo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23E60012'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='6' font-weight='900' fill='white'>NINTENDO</text></svg>",
  playstation: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23003791'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='9' font-weight='900' fill='white'>PS</text></svg>",

  /* ─── Toys ─── */
  lego: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='6' fill='%23D01012'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='10' font-weight='900' fill='white'>LEGO</text></svg>",
  funskool: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23F5B400'/><text x='20' y='25' text-anchor='middle' font-family='Arial' font-size='6' font-weight='900' fill='%23111'>Funskool</text></svg>",
  hotwheels: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23D22030'/><text x='20' y='23' text-anchor='middle' font-family='Arial' font-size='6' font-weight='900' fill='white'>HOT</text><text x='20' y='30' text-anchor='middle' font-family='Arial' font-size='6' font-weight='900' fill='white'>WHEELS</text></svg>",
};

/* ═══════════════════════════════════════════════════════════════
   COLOR SWATCHES (filter)
   ═══════════════════════════════════════════════════════════════ */
const COLOR_SWATCHES = [
  { name: "White",  hex: "#F7F1E4" },
  { name: "Black",  hex: "#1B1815" },
  { name: "Silver", hex: "#B3A793" },
  { name: "Grey",   hex: "#7A6F5D" },
  { name: "Red",    hex: "#B23A2E" },
  { name: "Blue",   hex: "#2A4A6B" },
  { name: "Green",  hex: "#164B3B" },
  { name: "Amber",  hex: "#E26A2C" },
  { name: "Brown",  hex: "#8B5E3C" },
  { name: "Beige",  hex: "#D9C9A8" },
  { name: "Gold",   hex: "#C9A227" },
  { name: "Purple", hex: "#6B4A8A" },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const timeAgo = (iso) => {
  if (!iso) return "recently";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const formatPrice = (num) => {
  const n = Number(num) || 0;
  if (n >= 10000000) { const crore = n / 10000000; return `Rs.${(crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2).replace(/\.?0+$/, ""))} Cr`; }
  if (n >= 100000) { const lakh = n / 100000; return `Rs.${(lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, ""))} Lac`; }
  return `Rs.${n.toLocaleString("en-US")}`;
};

const fmt = (n) => Number(n || 0).toLocaleString("en-US");

const hasValue = (v) => v !== undefined && v !== null && String(v).trim() !== "" && !(Array.isArray(v) && v.length === 0);

const normalizeSpecs = (rawSpecs = {}, rawCategory = "") => {
  const s = rawSpecs || {};
  const cat = String(rawCategory || "").toLowerCase().trim();
  if (cat === "property") { const unit = hasValue(s.areaUnit) ? ` ${s.areaUnit}` : ""; const area = hasValue(s.area) ? `${s.area}${unit}`.trim() : null; return { purpose: hasValue(s.purpose) ? s.purpose : null, type: hasValue(s.type) ? s.type : null, bedrooms: hasValue(s.beds) ? String(s.beds) : null, bathrooms: hasValue(s.baths) ? String(s.baths) : null, area, floors: hasValue(s.floors) ? s.floors : null, facing: hasValue(s.facing) ? s.facing : null, parking: hasValue(s.parking) ? s.parking : null, furnished: hasValue(s.furnished) ? s.furnished : null, society: hasValue(s.society) ? s.society : null }; }
  if (cat === "vehicles") { return { make: hasValue(s.make) ? s.make : null, model: hasValue(s.model) ? s.model : null, year: hasValue(s.year) ? String(s.year) : null, bodyType: hasValue(s.bodyType) ? s.bodyType : null, color: hasValue(s.color) ? s.color : null, engine: hasValue(s.engine) ? s.engine : null, transmission: hasValue(s.transmission) ? s.transmission : null, fuel: hasValue(s.fuel) ? s.fuel : null, mileage: hasValue(s.mileage) ? s.mileage : null, range: hasValue(s.range) ? s.range : null, battery: hasValue(s.battery) ? s.battery : null, acceleration: hasValue(s.acceleration) ? s.acceleration : null }; }
  if (cat === "bikes") { return { make: hasValue(s.make) ? s.make : null, model: hasValue(s.model) ? s.model : null, year: hasValue(s.year) ? String(s.year) : null, color: hasValue(s.color) ? s.color : null, engine: hasValue(s.engine) ? s.engine : null, mileage: hasValue(s.mileage) ? s.mileage : null }; }
  if (cat === "mobiles") { return { brand: hasValue(s.brand) ? s.brand : null, model: hasValue(s.model) ? s.model : null, storage: hasValue(s.storage) ? s.storage : null, ram: hasValue(s.ram) ? s.ram : null, network: hasValue(s.network) ? s.network : null, color: hasValue(s.color) ? s.color : null, battery: hasValue(s.battery) ? s.battery : null, pta: hasValue(s.pta) ? s.pta : null }; }
  if (cat === "electronics") { return { brand: hasValue(s.brand) ? s.brand : null, model: hasValue(s.model) ? s.model : null, type: hasValue(s.type) ? s.type : null, processor: hasValue(s.processor) ? s.processor : null, ram: hasValue(s.ram) ? s.ram : null, storage: hasValue(s.storage) ? s.storage : null, warranty: hasValue(s.warranty) ? s.warranty : null }; }
  if (cat === "toys") { return { brand: hasValue(s.brand) ? s.brand : null, model: hasValue(s.model) ? s.model : null, material: hasValue(s.material) ? s.material : null, color: hasValue(s.color) ? s.color : null, age: hasValue(s.age) ? s.age : null }; }
  return {};
};

/* ═══════════════════════════════════════════════════════════════
   CHECK ROW (for filter checkboxes)
   ═══════════════════════════════════════════════════════════════ */
const CheckRow = ({ label, count, checked, onChange }) => (
  <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group rounded-md fd-row px-1 -mx-1">
    <span
      className="relative flex items-center justify-center h-[18px] w-[18px] rounded-[5px] border-[1.5px] transition-colors flex-shrink-0"
      style={{
        borderColor: checked ? "var(--fd-primary)" : "var(--fd-line-str)",
        background: checked ? "var(--fd-primary)" : "transparent",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {checked && <FaCheck className="text-white text-[9px]" />}
    </span>
    <span
      className="flex-1 min-w-0 font-ticket-body text-[13px] truncate"
      style={{ color: "var(--fd-txt)" }}
    >
      {label}
    </span>
    {count != null && count > 0 && (
      <span
        className="font-ticket-body text-[11px] tabular-nums"
        style={{ color: "var(--fd-txt-faint)" }}
      >
        {fmt(count)}
      </span>
    )}
  </label>
);

/* ═══════════════════════════════════════════════════════════════
   CHIP ROW (single-select filter chips)
   ═══════════════════════════════════════════════════════════════ */
const ChipRow = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`fd-chip ${value === opt ? "fd-chip--active" : ""}`}
      >
        {opt}
      </button>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   IMAGE FALLBACK
   ═══════════════════════════════════════════════════════════════ */
const ImageFallback = ({ category, size = "small" }) => {
  const Icon = category === "Vehicles" ? FaCar : category === "Bikes" ? FaMotorcycle : category === "Mobiles" ? FaMobileAlt : category === "Property" ? FaHome : category === "Electronics" ? FaLaptop : category === "Toys" ? FaGamepad : FaNewspaper;
  const iconSize = size === "large" ? "text-5xl" : "text-3xl";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: "var(--fd-surface-2)" }}>
      <Icon className={iconSize} style={{ color: "var(--fd-txt-faint)" }} />
      <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--fd-txt-faint)" }}>No photo</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ MODERN CARD — Reference-style (Featured Properties / Cars)
   ═══════════════════════════════════════════════════════════════ */
const PropertyCardSmall = ({
  item,
  onClick,
  isFav,
  onToggleFavorite,
  viewMode = "grid-md",
  onChat,
  onBuy,
}) => {
  const hasImage = item.image && item.image !== "/car1.png" && item.image !== "";
  const isSold = item.sold || (item.status || "").toLowerCase() === "sold";

  const isFeatured =
    !!item.featured &&
    (!item.featured_until || new Date(item.featured_until) > new Date());

  const dealQuality = useMemo(() => {
    if (!item?.id) return "great";
    const seed = String(item.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return seed % 3 === 0 ? "good" : "great";
  }, [item?.id]);

  const sellerName = useMemo(() => {
    if (!item?.seller) return "Seller";
    const s = item.seller;
    return (
      s.full_name ||
      s.name ||
      s.username ||
      (s.email ? s.email.split("@")[0] : null) ||
      "Seller"
    );
  }, [item?.seller]);

  const sellerAvatar = useMemo(() => {
    if (!item?.seller) return null;
    const s = item.seller;
    return s.avatar_url || s.avatar || s.picture || null;
  }, [item?.seller]);

  const purposeBadge = useMemo(() => {
    const rc = (item.rawCategory || "").toLowerCase();
    const s = item.normalizedSpecs || {};
    const purpose = String(s.purpose || "").toLowerCase();
    if (rc === "property") {
      if (purpose.includes("rent")) return { label: "For Rent", cls: "mk-card__badge--rent" };
      return { label: "For Sale", cls: "mk-card__badge--sale" };
    }
    return { label: "For Sale", cls: "mk-card__badge--sale" };
  }, [item.rawCategory, item.normalizedSpecs]);

  const iconSpecs = useMemo(() => {
    const s = item.normalizedSpecs || {};
    const rc = (item.rawCategory || "").toLowerCase();

    if (rc === "property") {
      return [
        { icon: FaBed,            value: s.bedrooms || "—",  label: "Beds" },
        { icon: FaBath,           value: s.bathrooms || "—", label: "Baths" },
        { icon: FaRulerCombined,  value: s.area || "—",      label: "sqft" },
      ];
    }
    if (rc === "vehicles") {
      return [
        { icon: FaCalendarAlt, value: s.year || "—",    label: "Year" },
        { icon: FaRoad,        value: s.engine || "—",  label: "Engine" },
        { icon: FaGasPump,     value: s.fuel || "—",    label: "Fuel" },
      ];
    }
    if (rc === "bikes") {
      return [
        { icon: FaCalendarAlt, value: s.year || "—",     label: "Year" },
        { icon: FaRoad,        value: s.engine || "—",   label: "Engine" },
        { icon: FaRoad,        value: s.mileage || "—",  label: "Mileage" },
      ];
    }
    if (rc === "mobiles") {
      return [
        { icon: FaMobileAlt,   value: s.storage || "—",  label: "Storage" },
        { icon: FaCog,         value: s.ram || "—",      label: "RAM" },
        { icon: FaBatteryFull, value: s.battery || "—",  label: "Battery" },
      ];
    }
    if (rc === "electronics") {
      return [
        { icon: FaTag,    value: s.brand || "—",      label: "Brand" },
        { icon: FaCog,    value: s.storage || "—",    label: "Storage" },
        { icon: FaShieldAlt, value: s.warranty || "—", label: "Warranty" },
      ];
    }
    if (rc === "toys") {
      return [
        { icon: FaTag,   value: s.brand || "—",     label: "Brand" },
        { icon: FaChild, value: s.age || "—",       label: "Age" },
        { icon: FaGem,   value: s.material || "—",  label: "Material" },
      ];
    }
    return [
      { icon: FaCheckCircle, value: item.condition || "—", label: "Condition" },
      { icon: FaTag,         value: item.category || "—",  label: "Category" },
      { icon: FaClock,       value: item.postedAgo || "—", label: "Posted" },
    ];
  }, [item]);

  const stop = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleChat = (e) => {
    stop(e);
    if (isSold) return;
    if (onChat) onChat(item);
  };

  const handleBuy = (e) => {
    stop(e);
    if (isSold) return;
    if (onBuy) onBuy(item);
  };

  const handleFavorite = (e) => {
    stop(e);
    onToggleFavorite?.(e);
  };

  const handleViewDetails = (e) => {
    stop(e);
    onClick?.();
  };

  return (
    <div
      onClick={onClick}
      className="mk-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={item.title}
    >
      <div className="mk-card__img-wrap">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.title}
            className={`mk-card__img ${isSold ? "opacity-60 grayscale" : ""}`}
            loading="lazy"
          />
        ) : (
          <ImageFallback category={item.category} size="small" />
        )}

        {isSold && (
          <div className="sold-stamp">
            <span className="sold-stamp__ring">Sold</span>
          </div>
        )}

        {!isSold && (
          isFeatured ? (
            <span className="mk-card__badge mk-card__badge--featured">
              <FaBolt style={{ fontSize: 9 }} /> Featured
            </span>
          ) : (
            <span className={`mk-card__badge ${purposeBadge.cls}`}>
              {purposeBadge.label}
            </span>
          )
        )}

        {isSold && (
          <span className="mk-card__badge mk-card__badge--sold">Sold</span>
        )}

        {item.verified && !isSold && (
          <span className="mk-card__verified">
            <FaCheckCircle />
            Verified
          </span>
        )}

        <span
          role="button"
          tabIndex={0}
          onClick={handleFavorite}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleFavorite(e);
          }}
          className="mk-card__fav"
          aria-label="Toggle favorite"
        >
          {isFav ? (
            <FaHeart className="text-[14px] mk-heart-filled" />
          ) : (
            <FaRegHeart className="text-[14px]" />
          )}
        </span>
      </div>

      <div className="mk-card__body">
        <div className="mk-card__seller">
          <SellerAvatar
            avatar={sellerAvatar}
            name={sellerName}
            planId={item.seller?.planId || "free"}
            verified={item.seller?.verified || item.verified}
            size={22}
          />
          <span className="mk-card__seller-name">{sellerName}</span>
          <PlanLabel planId={item.seller?.planId || "free"} />
        </div>

        <p className="mk-card__title">{item.title || "Untitled"}</p>

        <p className="mk-card__location">
          <FaMapMarkerAlt />
          {item.location || "—"}
        </p>

        <div className="mk-card__icon-specs">
          {iconSpecs.map((sp, i) => {
            const Icon = sp.icon;
            return (
              <span key={i} className="mk-card__icon-spec">
                <Icon />
                <span>{sp.value}</span>
              </span>
            );
          })}
        </div>

        <div className="mk-card__price-row">
          <span className={`mk-card__price ${isSold ? "line-through opacity-70" : ""}`}>
            {formatPrice(item.price)}
          </span>
          <button
            type="button"
            className="mk-card__view-btn"
            onClick={handleViewDetails}
            aria-label="View details"
          >
            View Details
            <FaArrowRight />
          </button>
        </div>

        <div className="mk-card__actions" onClick={stop}>
          <button
            type="button"
            onClick={handleChat}
            disabled={isSold}
            className="mk-card__action mk-card__action--chat"
            aria-label="Chat with seller"
            title="Chat"
          >
            <FaCommentDots />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={handleBuy}
            disabled={isSold}
            className="mk-card__action mk-card__action--buy"
            aria-label="Buy now"
            title="Buy Now"
          >
            <FaBolt />
            <span>{isSold ? "Sold" : "Buy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ SIDEBAR — Reference-style · FULLY INTERACTIVE
   Filter by · Rental Type · Available · Price Range (draggable) ·
   Car Brand · Car Model & Year · Body Type · Transmission · Fuel
   ═══════════════════════════════════════════════════════════════ */
const SidebarFilters = ({
  filter,
  categoryCounts,
  conditionCounts,
  topCities,
  topBrands,
  brandSearch,
  setBrandSearch,
  toggleCond,
  toggleFuel,
  toggleTrans,
  toggleBody,
  toggleAssembly,
  toggleColor,
  pickCategory,
  pickLocation,
  pickBrand,
  activeCategory,
  showVehicleSections,
  showPropertySections,
  showMobileSections,
  showElectronicsSections,
  showToySections,
  isMobile = false,          // ⭐ NEW
  onClose,   
}) => {
  /* Collapsible sections state */
  const [openSections, setOpenSections] = useState({
    rental: true,
    available: true,
    price: true,
    brand: true,
    model: false,
    body: true,
    trans: true,
    fuel: true,
    year: false,
    km: false,
    color: false,
    condition: false,
    category: false,
    sellerType: false,
    other: false,
  });
  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /* Rental Type */
  const RENTAL_TYPES = ["Any", "Per day", "Per hour"];
  const [rentalType, setRentalType] = useState("Per hour");

  /* Available toggle */
  const [availableNow, setAvailableNow] = useState(false);

/* ── Interactive price slider (dual-thumb) — PKR ── */
const PRICE_MIN = 0;
const PRICE_MAX = 500000;       // Rs. 5 Lac max
const PRICE_STEP = 1000;         // Rs. 1k step
const [priceLo, setPriceLo] = useState(50000);   // Rs. 50,000
const [priceHi, setPriceHi] = useState(300000);  // Rs. 3 Lac

/* Sync to global filter (in raw rupees) */
useEffect(() => {
  if (filter.setPriceMin) filter.setPriceMin(String(priceLo));
}, [priceLo]); // eslint-disable-line
useEffect(() => {
  if (filter.setPriceMax) filter.setPriceMax(String(priceHi));
}, [priceHi]); // eslint-disable-line
  const sliderRef = useRef(null);
  const [dragging, setDragging] = useState(null); // "lo" | "hi" | null

  /* Sync to global filter */
  useEffect(() => {
    if (filter.setPriceMin) filter.setPriceMin(String(Math.round(priceLo * 1000)));
  }, [priceLo]); // eslint-disable-line
  useEffect(() => {
    if (filter.setPriceMax) filter.setPriceMax(String(Math.round(priceHi * 1000)));
  }, [priceHi]); // eslint-disable-line

  /* Histogram — reference bell curve */
  const histogram = useMemo(() => {
    const N = 40;
    return Array.from({ length: N }, (_, i) => {
      const center = N * 0.4;
      const dist = Math.abs(i - center);
      const h = Math.max(10, 92 - (dist * dist) / 3.5 - Math.abs(i - N / 2) * 0.8);
      return Math.round(h);
    });
  }, []);

  /* Percent positions */
  const loPct = ((priceLo - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const hiPct = ((priceHi - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  /* Drag handlers */
  const pctFromEvent = (clientX) => {
    const el = sliderRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };
  const valueFromPct = (pct) =>
    Math.round((PRICE_MIN + (pct / 100) * (PRICE_MAX - PRICE_MIN)) * 100) / 100;

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = pctFromEvent(clientX);
      const val = valueFromPct(pct);
      if (dragging === "lo") setPriceLo(Math.min(val, priceHi - 1));
      else setPriceHi(Math.max(val, priceLo + 1));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, priceLo, priceHi]);

  /* Transmission */
  const TRANSMISSIONS = ["Any", "Automatic", "Manual"];

  /* Fuel */
  const FUEL_OPTIONS = [
    "Gasoline",
    "Flex Fuel (E85)",
    "Diesel",
    "Hybrid",
    "Electric",
    "Hydrogen",
    "Other",
  ];

  /* Body types */
  const BODY_TYPES_LIST = [
    "Sedan",
    "Wagon",
    "Coupe",
    "Hatchback",
    "Pickup",
    "Sport coupe",
    "Crossover",
    "Van",
  ];

  const isVehicleCtx =
    showVehicleSections ||
    activeCategory?.toLowerCase() === "vehicles" ||
    activeCategory?.toLowerCase() === "bikes";

  return (
    <div className="flex flex-col">
{/* ═══ Header — "Filter by" + Reset + Collapse ═══ */}
<div className="fd-sb-header">
  <h2 className="fd-sb-title">Filter by</h2>
  <div className="fd-sb-header-actions">
    <button
      type="button"
      className="fd-sb-reset"
      onClick={filter.resetAll}
    >
      Reset all
    </button>

    {/* ⭐ Collapse / close button — works on desktop AND mobile */}
    <button
      type="button"
      title={isMobile ? "Close filters" : "Collapse"}
      onClick={() => {
        if (isMobile) {
          onClose?.();
        } else {
          onClose?.();
        }
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--fd-txt-soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--fd-surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M2 3a1 1 0 0 1 1-1h2v12H3a1 1 0 0 1-1-1V3Zm5-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7V2Z"
          opacity="0.85"
        />
      </svg>
    </button>
  </div>
</div>

      {/* ═══ Rental Type ═══ */}
      {isVehicleCtx && (
        <div className="fd-sb-section">
          <div className="fd-sb-section-head">
            <span className="fd-sb-section-title">Rental Type</span>
          </div>
          <div className="fd-sb-chips">
            {RENTAL_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`fd-sb-chip ${rentalType === t ? "active" : ""}`}
                onClick={() => setRentalType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Available now only ═══ */}
      <div className="fd-sb-section">
        <div className="fd-sb-toggle-row">
          <span className="fd-sb-toggle-label">Available now only</span>
          <button
            type="button"
            role="switch"
            aria-checked={availableNow}
            onClick={() => setAvailableNow((v) => !v)}
            className={`fd-switch ${availableNow ? "fd-switch--on" : ""}`}
          >
            <span className="fd-switch__knob" />
          </button>
        </div>
      </div>

      {/* ═══ Price Range / Hour — INTERACTIVE ═══ */}
      {isVehicleCtx && (
        <div className="fd-sb-section">
          <button
            type="button"
            className="fd-sb-section-head clickable"
            onClick={() => toggleSection("price")}
          >
            <span className="fd-sb-section-title">Price Range / Hour</span>
            <FaChevronDown className={`fd-sb-chevron ${openSections.price ? "open" : ""}`} />
          </button>

          {openSections.price && (
            <>
              {/* Histogram + dual-thumb slider overlay */}
              <div
                ref={sliderRef}
                className="fd-sb-hist-wrap"
                style={{ position: "relative", marginTop: 14 }}
              >
                {/* Histogram bars */}
                <div className="fd-sb-hist" style={{ marginTop: 0 }}>
                  {histogram.map((h, i) => {
                    const barPct = (i / (histogram.length - 1)) * 100;
                    const inRange = barPct >= loPct && barPct <= hiPct;
                    return (
                      <span
                        key={i}
                        className={`fd-sb-hist-bar ${inRange ? "active" : ""}`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>

                {/* Dual-thumb slider OVER the histogram */}
                <div className="fd-sb-slider-track">
                  {/* Active range fill */}
                  <div
                    className="fd-sb-slider-fill"
                    style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
                  />
                  {/* Lo thumb */}
                  <button
                    type="button"
                    aria-label="Minimum price"
                    className="fd-sb-slider-thumb"
                    style={{ left: `${loPct}%` }}
                    onMouseDown={(e) => { e.preventDefault(); setDragging("lo"); }}
                    onTouchStart={(e) => { e.preventDefault(); setDragging("lo"); }}
                  />
                  {/* Hi thumb */}
                  <button
                    type="button"
                    aria-label="Maximum price"
                    className="fd-sb-slider-thumb"
                    style={{ left: `${hiPct}%` }}
                    onMouseDown={(e) => { e.preventDefault(); setDragging("hi"); }}
                    onTouchStart={(e) => { e.preventDefault(); setDragging("hi"); }}
                  />
                </div>
              </div>

              {/* Price inputs — editable */}
              <div className="fd-sb-price-inputs">
                <div>
                  <span className="fd-sb-price-label">From</span>
                  <div className="fd-sb-price-input-wrap">
                    <span className="fd-sb-price-prefix">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min={PRICE_MIN}
                      max={priceHi - 1}
                      className="fd-sb-price-input"
                      value={priceLo}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setPriceLo(Math.max(PRICE_MIN, Math.min(v, priceHi - 1)));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="fd-sb-price-label">To</span>
                  <div className="fd-sb-price-input-wrap">
                    <span className="fd-sb-price-prefix">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min={priceLo + 1}
                      max={PRICE_MAX}
                      className="fd-sb-price-input"
                      value={priceHi}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setPriceHi(Math.min(PRICE_MAX, Math.max(v, priceLo + 1)));
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ Car Brand ═══ */}
      {isVehicleCtx && topBrands.length > 0 && (
        <div className="fd-sb-section">
          <button
            type="button"
            className="fd-sb-section-head clickable"
            onClick={() => toggleSection("brand")}
          >
            <span className="fd-sb-section-title">Car Brand</span>
            <FaChevronDown className={`fd-sb-chevron ${openSections.brand ? "open" : ""}`} />
          </button>

          {openSections.brand && (
            <div className="mt-3">
              <div className="relative mb-3">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ fontSize: 11, color: "var(--fd-txt-faint)" }}
                />
                <input
                  type="text"
                  placeholder="Search brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="fd-input w-full rounded-lg"
                  style={{ padding: "10px 12px 10px 32px", fontSize: 13, fontWeight: 500 }}
                />
              </div>

              <div className="flex flex-col">
                {topBrands.slice(0, 10).map(([name, count]) => {
                  const logoKey = name.toLowerCase().replace(/\s+/g, "");
                  const logo = BRAND_LOGOS[logoKey];
                  const active = filter.brand === name;
                  return (
                    <div
                      key={name}
                      className="fd-brand-row"
                      onClick={() => pickBrand(name)}
                    >
                      <div className="fd-brand-logo">
                        {logo ? (
                          <img src={logo} alt={name} />
                        ) : (
                          <span
                            className="font-ticket-body text-[12px] font-extrabold"
                            style={{ color: "var(--fd-primary)" }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="fd-brand-name">{name}</span>
                      <span className="fd-brand-count">{count}</span>
                      <span className={`fd-brand-check ${active ? "fd-brand-check--active" : ""}`}>
                        {active && <FaCheck style={{ fontSize: 10 }} />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Car Model & Year ═══ */}
      {isVehicleCtx && (
        <div className="fd-sb-section">
          <button
            type="button"
            className="fd-sb-section-head clickable"
            onClick={() => toggleSection("model")}
          >
            <span className="fd-sb-section-title">Car Model & Year</span>
            <FaChevronDown className={`fd-sb-chevron ${openSections.model ? "open" : ""}`} />
          </button>

          {openSections.model && (
            <div className="mt-3 space-y-4">
              <div className="fd-range-inputs">
                <div>
                  <span className="fd-range-label">Year from</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="fd-range-input"
                    value={filter.yearMin || ""}
                    onChange={(e) =>
                      filter.setYearMin?.(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="2010"
                  />
                </div>
                <div>
                  <span className="fd-range-label">To</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="fd-range-input"
                    value={filter.yearMax || ""}
                    onChange={(e) =>
                      filter.setYearMax?.(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="2024"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Body Type ═══ */}
      {isVehicleCtx && (
        <div className="fd-sb-section">
          <button
            type="button"
            className="fd-sb-section-head clickable"
            onClick={() => toggleSection("body")}
          >
            <span className="fd-sb-section-title">Body Type</span>
            <FaChevronDown className={`fd-sb-chevron ${openSections.body ? "open" : ""}`} />
          </button>

          {openSections.body && (
            <div className="fd-sb-grid-2">
              {BODY_TYPES_LIST.map((bt) => {
                const checked = (filter.bodyTypes || []).includes(bt);
                return (
                  <label
                    key={bt}
                    className="fd-sb-check"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleBody(bt);
                    }}
                  >
                    <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                      {checked && <FaCheck />}
                    </span>
                    <span className="fd-sb-check-label">{bt}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ Transmission ═══ */}
      {isVehicleCtx && (
        <div className="fd-sb-section">
          <button
            type="button"
            className="fd-sb-section-head clickable"
            onClick={() => toggleSection("trans")}
          >
            <span className="fd-sb-section-title">Transmission</span>
            <FaChevronDown className={`fd-sb-chevron ${openSections.trans ? "open" : ""}`} />
          </button>

          {openSections.trans && (
            <div className="fd-sb-chips">
              {TRANSMISSIONS.map((t) => {
                const active =
                  t === "Any"
                    ? !(filter.transmissions?.length > 0)
                    : filter.transmissions?.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    className={`fd-sb-chip ${active ? "active" : ""}`}
                    onClick={() => {
                      if (t === "Any") filter.setTransmissions?.([]);
                      else filter.setTransmissions?.([t]);
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ Fuel Type ═══ */}
      {isVehicleCtx && (
        <div className="fd-sb-section">
          <button
            type="button"
            className="fd-sb-section-head clickable"
            onClick={() => toggleSection("fuel")}
          >
            <span className="fd-sb-section-title">Fuel Type</span>
            <FaChevronDown className={`fd-sb-chevron ${openSections.fuel ? "open" : ""}`} />
          </button>

          {openSections.fuel && (
            <div className="fd-sb-grid-2">
              {FUEL_OPTIONS.map((f) => {
                const checked = (filter.fuelTypes || []).includes(f);
                return (
                  <label
                    key={f}
                    className="fd-sb-check"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFuel(f);
                    }}
                  >
                    <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                      {checked && <FaCheck />}
                    </span>
                    <span className="fd-sb-check-label">{f}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ Category (non-vehicle ctx) ═══ */}
      {!isVehicleCtx && (
        <div className="fd-sb-section">
          <div className="fd-sb-section-head">
            <span className="fd-sb-section-title">Category</span>
            {filter.category && (
              <button
                type="button"
                className="fd-sb-reset"
                onClick={() => filter.setCategory(null)}
              >
                Clear
              </button>
            )}
          </div>

          <div className="fd-cat-grid mt-3">
            <button
              type="button"
              onClick={() => filter.setCategory(null)}
              className="fd-cat-tile"
              data-active={!filter.category ? "true" : "false"}
            >
              <span className="fd-cat-icon">
                <FaThLarge />
              </span>
              <span className="fd-cat-label">All</span>
            </button>

            {TOP_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat.toLowerCase()] || {};
              const Icon = meta.icon || FaTag;
              const active = filter.category === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => pickCategory(cat)}
                  className="fd-cat-tile"
                  data-active={active ? "true" : "false"}
                >
                  <span className="fd-cat-icon">
                    <Icon />
                  </span>
                  <span className="fd-cat-label">{cat}</span>
                  {count > 0 && <span className="fd-cat-count">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Condition ═══ */}
      <div className="fd-sb-section">
        <button
          type="button"
          className="fd-sb-section-head clickable"
          onClick={() => toggleSection("condition")}
        >
          <span className="fd-sb-section-title">Condition</span>
          <FaChevronDown className={`fd-sb-chevron ${openSections.condition ? "open" : ""}`} />
        </button>

        {openSections.condition && (
          <div className="mt-3 space-y-0.5">
            {["Used", "New", "Like New", "Needs Repair"].map((c) => (
              <CheckRow
                key={c}
                label={c}
                count={conditionCounts[c] || 0}
                checked={filter.conditions.includes(c)}
                onChange={() => toggleCond(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══ Colors ═══ */}
      <div className="fd-sb-section">
        <button
          type="button"
          className="fd-sb-section-head clickable"
          onClick={() => toggleSection("color")}
        >
          <span className="fd-sb-section-title">Color</span>
          <FaChevronDown className={`fd-sb-chevron ${openSections.color ? "open" : ""}`} />
        </button>

        {openSections.color && (
          <div className="flex flex-wrap gap-2 mt-3">
            {COLOR_SWATCHES.map((c) => {
              const isLight = ["White", "Silver", "Beige", "Gold"].includes(c.name);
              const active = filter.colors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => toggleColor(c.name)}
                  className="relative h-8 w-8 rounded-full border-2 transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: active ? "var(--fd-primary)" : "var(--fd-line-str)",
                    boxShadow: active ? "0 0 0 2px var(--fd-primary-soft)" : "none",
                  }}
                >
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <FaCheck
                        className="text-[9px]"
                        style={{ color: isLight ? "#000" : "#fff" }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ Property ═══ */}
      {showPropertySections && (
        <>
          <div className="fd-sb-section">
            <div className="fd-sb-section-head">
              <span className="fd-sb-section-title">Purpose</span>
            </div>
            <div className="mt-3">
              <ChipRow
                options={["Any", "For Sale", "For Rent"]}
                value={filter.propertyPurpose?.[0] || "Any"}
                onChange={(v) =>
                  filter.setPropertyPurpose(v === "Any" ? [] : [v])
                }
              />
            </div>
          </div>

          <div className="fd-sb-section">
            <div className="fd-sb-section-head">
              <span className="fd-sb-section-title">Bedrooms</span>
            </div>
            <div className="fd-sb-grid-2 mt-3">
              {["1", "2", "3", "4", "5", "6+"].map((b) => {
                const checked = (filter.bedrooms || []).includes(b);
                return (
                  <label
                    key={b}
                    className="fd-sb-check"
                    onClick={(e) => {
                      e.preventDefault();
                      filter.toggleInArray(filter.setBedrooms, b);
                    }}
                  >
                    <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                      {checked && <FaCheck />}
                    </span>
                    <span className="fd-sb-check-label">{b} Bed</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="fd-sb-section">
            <div className="fd-sb-section-head">
              <span className="fd-sb-section-title">Bathrooms</span>
            </div>
            <div className="fd-sb-grid-2 mt-3">
              {["1", "2", "3", "4", "5+"].map((b) => {
                const checked = (filter.bathrooms || []).includes(b);
                return (
                  <label
                    key={b}
                    className="fd-sb-check"
                    onClick={(e) => {
                      e.preventDefault();
                      filter.toggleInArray(filter.setBathrooms, b);
                    }}
                  >
                    <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                      {checked && <FaCheck />}
                    </span>
                    <span className="fd-sb-check-label">{b} Bath</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══ Mobiles ═══ */}
      {showMobileSections && (
        <div className="fd-sb-section">
          <div className="fd-sb-section-head">
            <span className="fd-sb-section-title">Storage</span>
          </div>
          <div className="fd-sb-grid-2 mt-3">
            {["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"].map((s) => {
              const checked = (filter.storage || []).includes(s);
              return (
                <label
                  key={s}
                  className="fd-sb-check"
                  onClick={(e) => {
                    e.preventDefault();
                    filter.toggleInArray(filter.setStorage, s);
                  }}
                >
                  <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                    {checked && <FaCheck />}
                  </span>
                  <span className="fd-sb-check-label">{s}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Electronics ═══ */}
      {showElectronicsSections && (
        <div className="fd-sb-section">
          <div className="fd-sb-section-head">
            <span className="fd-sb-section-title">Device Type</span>
          </div>
          <div className="fd-sb-grid-2 mt-3">
            {["Laptop", "Desktop", "TV", "Camera", "Audio", "Gaming", "Monitor", "Printer"].map((d) => {
              const checked = (filter.deviceType || []).includes(d);
              return (
                <label
                  key={d}
                  className="fd-sb-check"
                  onClick={(e) => {
                    e.preventDefault();
                    filter.toggleInArray(filter.setDeviceType, d);
                  }}
                >
                  <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                    {checked && <FaCheck />}
                  </span>
                  <span className="fd-sb-check-label">{d}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Toys ═══ */}
      {showToySections && (
        <>
          <div className="fd-sb-section">
            <div className="fd-sb-section-head">
              <span className="fd-sb-section-title">Suitable For</span>
            </div>
            <div className="fd-sb-grid-2 mt-3">
              {["Unisex", "Boys", "Girls"].map((g) => {
                const checked = (filter.toyAudience || []).includes(g);
                return (
                  <label
                    key={g}
                    className="fd-sb-check"
                    onClick={(e) => {
                      e.preventDefault();
                      filter.toggleInArray(filter.setToyAudience, g);
                    }}
                  >
                    <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                      {checked && <FaCheck />}
                    </span>
                    <span className="fd-sb-check-label">{g}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="fd-sb-section">
            <div className="fd-sb-section-head">
              <span className="fd-sb-section-title">Material</span>
            </div>
            <div className="fd-sb-grid-2 mt-3">
              {["Plastic", "Wood", "Metal", "Fabric", "Rubber", "Mixed"].map((m) => {
                const checked = (filter.toyMaterial || []).includes(m);
                return (
                  <label
                    key={m}
                    className="fd-sb-check"
                    onClick={(e) => {
                      e.preventDefault();
                      filter.toggleInArray(filter.setToyMaterial, m);
                    }}
                  >
                    <span className={`fd-sb-check-box ${checked ? "checked" : ""}`}>
                      {checked && <FaCheck />}
                    </span>
                    <span className="fd-sb-check-label">{m}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="h-4" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRICE SLIDER (unchanged)
   ═══════════════════════════════════════════════════════════════ */
const PriceSlider = ({ filter }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const MIN = 0, MAX = 100000;
  const toNum = (v) => { if (v === "" || v == null) return null; const n = Number(String(v).replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : null; };
  const rawMin = toNum(filter.priceMin); const rawMax = toNum(filter.priceMax);
  const lo = rawMin != null ? Math.max(MIN, Math.min(MAX, rawMin)) : MIN + MAX * 0.2;
  const hi = rawMax != null ? Math.max(MIN, Math.min(MAX, rawMax)) : MAX;
  const range = MAX - MIN;
  const loPct = ((lo - MIN) / range) * 100;
  const hiPct = ((hi - MIN) / range) * 100;

  const pctFromEvent = (clientX) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };
  const valueFromPct = (pct) => {
    const raw = MIN + (pct / 100) * range;
    return Math.round(raw / 1000) * 1000;
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = pctFromEvent(clientX);
      const value = valueFromPct(pct);
      if (dragging === "lo") filter.setPriceMin(String(Math.min(value, hi)));
      else filter.setPriceMax(String(Math.max(value, lo)));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, lo, hi, filter]);

  return (
    <div ref={trackRef} className="fd-range-track select-none" style={{ touchAction: "none" }}>
      <div className="fd-range-fill" style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }} />
      <div
        className="fd-range-thumb"
        style={{ left: `${loPct}%` }}
        onMouseDown={(e) => { e.preventDefault(); setDragging("lo"); }}
        onTouchStart={(e) => { e.preventDefault(); setDragging("lo"); }}
      />
      <div
        className="fd-range-thumb"
        style={{ left: `${hiPct}%` }}
        onMouseDown={(e) => { e.preventDefault(); setDragging("hi"); }}
        onTouchStart={(e) => { e.preventDefault(); setDragging("hi"); }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ HERO SEARCH — UPDATED with LIVE SUGGESTIONS dropdown
   - as you type → shows matching items with image + title + price
   - click a suggestion → opens that item's detail page
   - Enter or Search button → navigates to /search?q=…
   ═══════════════════════════════════════════════════════════════ */
const HeroSearch = ({
  searchQuery,
  setSearchQuery,
  activeCategoryTab,
  setActiveCategoryTab,
  onSearchSubmit,
  suggestions = [],
  onSuggestionClick,
}) => {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [videoIndex, setVideoIndex] = useState(() => Math.floor(Math.random() * HERO_VIDEOS.length));
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const handleVideoEnd = () => setVideoIndex((i) => (i + 1) % HERO_VIDEOS.length);
  useEffect(() => { const t = setTimeout(() => { setVideoIndex((i) => (i + 1) % HERO_VIDEOS.length); }, 12000); return () => clearTimeout(t); }, [videoIndex]);
  useEffect(() => { const v = videoRef.current; if (!v) return; v.load(); const p = v.play(); if (p && typeof p.catch === "function") p.catch(() => {}); }, [videoIndex]);

  /* Close suggestion dropdown on outside click */
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const currentVideo = HERO_VIDEOS[videoIndex];
  const showSuggestions = searchFocused && searchQuery.trim().length >= 2;

  /* Keyboard navigation inside suggestions */
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        onSuggestionClick?.(suggestions[activeIdx]);
        setSearchFocused(false);
      } else {
        onSearchSubmit?.(searchQuery);
        setSearchFocused(false);
      }
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };
  return (
    <div
      className="relative w-full mb-4 sm:mb-5"
      style={{
        minHeight: 320,
        borderRadius: 24,
        // ⭐ NO overflow:hidden here so dropdown can escape
        // ⭐ NO isolation:isolate so z-index works relative to page
      }}
    >

         {/* ⭐ Clipping layer — ONLY the video + gradients are clipped */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: 24, overflow: "hidden", zIndex: 0 }}
        aria-hidden="true"
      >
        <AnimatePresence mode="wait">
          <motion.video
            key={currentVideo}
            ref={videoRef}
            src={currentVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

           {/* ⭐ NEW — Dark overlay for text contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* Bottom fade to white */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "75%",
            background:
              "linear-gradient(0deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 22%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Soft radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 30%, transparent 35%, rgba(255,255,255,0.35) 100%)",
          }}
        />
      </div>
      {/* ⭐ Content layer — z-index 10, NO clipping so dropdown can overflow */}
      <div
        className="relative h-full w-full flex flex-col items-center justify-end px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10"
        style={{ minHeight: 320, zIndex: 10 }}
      >
        <div className="w-full flex flex-col items-center gap-4 sm:gap-6">

          {/* ⭐ Search bar with suggestions dropdown — z-index 50 */}
          <motion.div
            ref={wrapRef}
            className="w-full px-1 sm:px-0"
            style={{
              margin: "0 auto",
              zIndex: 50,
              position: "relative",
            }}
            animate={{ maxWidth: searchFocused ? 820 : 680 }}
            initial={false}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Search shell */}
            <div
              className="flex items-center gap-2 sm:gap-3 bg-white rounded-full pl-4 sm:pl-5 pr-2 py-2 w-full"
              style={{
                boxShadow: searchFocused
                  ? "0 28px 70px -20px rgba(242,138,45,0.45), 0 10px 28px -8px rgba(0,0,0,0.20), 0 0 0 2px rgba(242,138,45,0.35)"
                  : "0 24px 60px -20px rgba(0,0,0,0.35), 0 8px 24px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(20,20,30,0.06)",
                transition: "box-shadow 0.3s ease",
              }}
            >
              <FaSearch
                className="text-[14px] sm:text-[15px] flex-shrink-0"
                style={{ color: "rgba(15,20,25,0.45)" }}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search cars, bikes, mobiles, property…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIdx(-1);
                }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-0 bg-transparent outline-none text-[13px] sm:text-[15px] font-medium py-2 sm:py-2.5"
                style={{ color: "#0F1419" }}
              />
              <button
                onClick={() => {
                  onSearchSubmit?.(searchQuery);
                  setSearchFocused(false);
                }}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #F58220 0%, #E26A2C 100%)",
                  color: "#FFFFFF",
                }}
                aria-label="Search"
              >
                <FaSearch className="text-[12px] sm:text-[13px]" />
              </button>
            </div>

            {/* ⭐ LIVE SUGGESTIONS DROPDOWN — escapes the hero */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.985 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="fs-suggest-panel"
                  style={{ zIndex: 100 }}
                >
                  {suggestions.length === 0 ? (
                    <div className="fs-suggest-empty">
                      No matches for{" "}
                      <strong style={{ color: "#E26A2C" }}>
                        "{searchQuery}"
                      </strong>
                      <br />
                      <span style={{ fontSize: 11, opacity: 0.7 }}>
                        Try a different keyword
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="fs-suggest-head">
                        Suggestions · {suggestions.length}
                      </div>
                      <div>
                        {suggestions.map((s, i) => (
                          <button
                            key={s.id}
                            type="button"
                            className={`fs-suggest-item ${i === activeIdx ? "is-active" : ""}`}
                            onMouseEnter={() => setActiveIdx(i)}
                            onClick={() => {
                              onSuggestionClick?.(s);
                              setSearchFocused(false);
                            }}
                          >
                            <span className="fs-suggest-thumb">
                              {s.image ? (
                                <img
                                  src={s.image}
                                  alt={s.title}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    fontSize: 18,
                                    opacity: 0.4,
                                  }}
                                >
                                  <FaSearch />
                                </span>
                              )}
                            </span>
                            <span style={{ minWidth: 0, flex: 1 }}>
                              <p className="fs-suggest-title">{s.title}</p>
                              <p className="fs-suggest-meta">
                                {s.category && <span>{s.category}</span>}
                                {s.location && s.location !== "—" && (
                                  <>
                                    <span>·</span>
                                    <span>{s.location}</span>
                                  </>
                                )}
                              </p>
                            </span>
                            <span className="fs-suggest-price">
                              {formatPrice(s.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div
                        className="fs-suggest-footer"
                        onClick={() => {
                          onSearchSubmit?.(searchQuery);
                          setSearchFocused(false);
                        }}
                      >
                        See all results for "{searchQuery}" →
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Category pills */}
          <div className="hz-pills scrollbar-hide w-full">
            {HERO_PILLS.map((pill) => {
              const Icon = pill.icon;
              const active = activeCategoryTab === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  className={`hz-pill ${active ? "hz-pill--active" : ""}`}
                  onClick={() =>
                    setActiveCategoryTab(
                      active && pill.id !== "all" ? "all" : pill.id
                    )
                  }
                >
                  <Icon className="hz-pill__icon" />
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV — Home · Add (+) Post · Chat · Profile
   ═══════════════════════════════════════════════════════════════ */
const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ⭐ unread messages count (wire to real data later) */
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  /* ⭐ NEW — controls the "Post Ad" dialog */
  const [showPostDialog, setShowPostDialog] = useState(false);

  const items = [
    {
      id: "home",
      label: "Home",
      icon: FaHome,
      path: "/feed",
    },
    {
      id: "chat",
      label: "Chat",
      icon: FaCommentDots,
      path: "/marketplace-chat",
      badge: unreadMsgs,
    },
    {
      id: "post",
      label: "Add",
      icon: FaPlus,
      special: true,
      path: "/post-ad",
    },
    {
      id: "listings",
      label: "My Ads",
      icon: FaList,
      path: "/my-listings",
    },
    {
      id: "profile",
      label: "Profile",
      icon: FaUser,
      path: "/settings",
    },
  ];

  /* active state matches current path */
  const isActive = (path) =>
    path && (location.pathname === path || location.pathname.startsWith(path + "/"));

  return (
    <>
      <nav
        className="fd-bottomnav"
        style={{
          alignItems: "flex-end",
          paddingTop: 8,
        }}
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = !it.special && isActive(it.path);

          /* ⭐ CENTERED + ADD BUTTON — elevated orange circle */
          if (it.special) {
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setShowPostDialog(true)}   /* 👈 open dialog, don't navigate */
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                }}
                aria-label="Post an Ad"
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #F58220 0%, #D35400 100%)",
                    color: "#FFFFFF",
                    boxShadow:
                      "0 10px 24px -8px rgba(242,138,45,0.7), 0 0 0 4px var(--fd-surface)",
                    transform: "translateY(-14px)",
                    transition: "transform 0.18s ease",
                  }}
                >
                  <FaPlus style={{ fontSize: 18, strokeWidth: 3 }} />
                </span>
                <span
                  className="font-ticket-body"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "var(--fd-primary)",
                    marginTop: -10,
                  }}
                >
                  {it.label}
                </span>
              </button>
            );
          }

          /* ⭐ Regular tab */
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => navigate(it.path)}
              className={`fd-bottomnav__item ${active ? "fd-bottomnav__item--active" : ""}`}
              style={{ position: "relative" }}
            >
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon />
                {it.badge > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -8,
                      minWidth: 16,
                      height: 16,
                      padding: "0 4px",
                      borderRadius: 999,
                      background: "#EF4444",
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    }}
                  >
                    {it.badge > 99 ? "99+" : it.badge}
                  </span>
                )}
              </span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ⭐ NEW — Post Ad dialog */}
      <AnimatePresence>
        {showPostDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              key="post-dialog-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowPostDialog(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                zIndex: 300,
              }}
            />
{/* Dialog card */}
<motion.div
  key="post-dialog"
  initial={{ opacity: 0, y: 40, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 40, scale: 0.96 }}
  transition={{ type: "spring", stiffness: 320, damping: 28 }}
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "fixed",
    left: 16,
    right: 16,
    bottom: 96,
    zIndex: 310,
    background: "var(--fd-surface)",
    border: "1px solid var(--fd-line)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 32px 64px -24px rgba(0,0,0,0.55), 0 8px 24px -12px rgba(0,0,0,0.25)",
    fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
    overflow: "hidden",
  }}
>
  {/* Top accent bar */}
  <div
    aria-hidden
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: "linear-gradient(90deg, #F58220 0%, #E26A2C 60%, transparent 100%)",
      opacity: 0.9,
    }}
  />

  {/* Drag handle */}
  <div
    aria-hidden
    style={{
      width: 44,
      height: 4,
      borderRadius: 999,
      background: "var(--fd-line-str)",
      margin: "0 auto 16px auto",
      opacity: 0.6,
    }}
  />

  {/* Header */}
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)",
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 10px 22px -10px rgba(242,138,45,0.65)",
      }}
    >
      <FaPlus style={{ fontSize: 17 }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "-0.015em",
          color: "var(--fd-txt)",
          lineHeight: 1.2,
        }}
      >
        Sell something
      </p>
      <p
        style={{
          margin: "3px 0 0",
          fontSize: 12.5,
          color: "var(--fd-txt-soft)",
          lineHeight: 1.3,
        }}
      >
        Choose how you'd like to start
      </p>
    </div>
  </div>

  {/* Option 1 — Post new ad (WHITE button) */}
  <button
    type="button"
    onClick={() => {
      setShowPostDialog(false);
      navigate("/post-ad?new=1");
    }}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 14,
      border: "1px solid #E5E7EB",
      background: "#FFFFFF",
      color: "#0F1419",
      fontSize: 13.5,
      fontWeight: 700,
      cursor: "pointer",
      marginBottom: 10,
      fontFamily: "inherit",
      boxShadow: "0 4px 14px -6px rgba(0,0,0,0.12)",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.boxShadow = "0 8px 20px -8px rgba(0,0,0,0.18)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 14px -6px rgba(0,0,0,0.12)";
    }}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
  >
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(245,130,32,0.12)",
        color: "#F58220",
        flexShrink: 0,
      }}
    >
      <FaPlus style={{ fontSize: 12 }} />
    </span>
    <span style={{ flex: 1, textAlign: "left" }}>Post a new ad</span>
    <FaArrowRight style={{ fontSize: 10, color: "#9CA3AF" }} />
  </button>

  {/* Option 2 — My listings (BLACK button) */}
  <button
    type="button"
    onClick={() => {
      setShowPostDialog(false);
      navigate("/my-listings");
    }}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 14,
      border: "1px solid #0F1419",
      background: "#0F1419",
      color: "#FFFFFF",
      fontSize: 13.5,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      boxShadow: "0 4px 14px -6px rgba(0,0,0,0.35)",
      transition: "transform 0.15s ease, filter 0.15s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.filter = "brightness(1.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.filter = "brightness(1)";
    }}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
  >
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.14)",
        color: "#FFFFFF",
        flexShrink: 0,
      }}
    >
      <FaList style={{ fontSize: 12 }} />
    </span>
    <span style={{ flex: 1, textAlign: "left" }}>My listings</span>
    <FaArrowRight style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }} />
  </button>

  {/* Cancel */}
  <button
    type="button"
    onClick={() => setShowPostDialog(false)}
    style={{
      width: "100%",
      marginTop: 14,
      padding: "12px",
      borderRadius: 12,
      border: "none",
      background: "transparent",
      color: "var(--fd-txt-soft)",
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "color 0.15s ease, background 0.15s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "var(--fd-txt)";
      e.currentTarget.style.background = "var(--fd-surface-2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "var(--fd-txt-soft)";
      e.currentTarget.style.background = "transparent";
    }}
  >
    Cancel
  </button>
</motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
/* ═══════════════════════════════════════════════════════════════
   TOAST + LOADING — unchanged
   ═══════════════════════════════════════════════════════════════ */
const Toast = ({ toast, onDismiss }) => {
  const isError = toast?.type === "error";
  return (
    <AnimatePresence>
      {toast && (
        <motion.div key={toast.id} initial={{ opacity: 0, x: 28, scale: 0.94 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.94 }} transition={{ type: "spring", stiffness: 340, damping: 26 }} onClick={onDismiss} className="fixed top-20 right-4 z-[200] cursor-pointer max-w-[calc(100vw-2rem)]">
          <div className="rounded-xl border shadow-lg w-[280px] p-2.5 flex items-center gap-2.5" style={{ background: "var(--fd-surface)", borderColor: isError ? "var(--fd-danger)" : "var(--fd-success)" }}>
            <div className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: isError ? "var(--fd-danger-soft)" : "var(--fd-success-soft)" }}>
              {isError ? <FaExclamationCircle className="text-[10px]" style={{ color: "var(--fd-danger)" }} /> : <FaCheck className="text-[10px]" style={{ color: "var(--fd-success)" }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold truncate" style={{ color: "var(--fd-txt)" }}>{toast.title}</p>
              {toast.message && <p className="text-[9.5px] truncate mt-0.5" style={{ color: "var(--fd-txt-soft)" }}>{toast.message}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoadingScreen = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[500] flex flex-col items-center justify-center gap-5" style={{ background: "var(--fd-page)" }}>
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)" }}>A</div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--fd-primary)", borderRightColor: "var(--fd-primary)" }} />
          <span className="font-ticket-body text-[13px] font-bold" style={{ color: "var(--fd-txt-soft)" }}>Loading marketplace…</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════
   RANDOM LOADER — unchanged
   ═══════════════════════════════════════════════════════════════ */
const FeedLoader = () => {
  const loaderRef = useRef(null);
  if (loaderRef.current === null) {
    loaderRef.current = Math.floor(Math.random() * 6);
  }
  const which = loaderRef.current;

  const messages = [
    "Loading marketplace…",
    "Warming up…",
    "Getting things ready…",
    "Almost there…",
    "Fetching fresh deals…",
    "Just a moment…",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center px-4"
      style={{ background: "var(--fd-page)" }}
    >
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-[0.14]"
        style={{ background: `radial-gradient(circle, var(--fd-primary), transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center justify-center">

        {which === 0 && (
          <div className="relative w-32 h-32 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid var(--fd-primary)` }}
                animate={{ scale: [0.6, 1.3, 1.6], opacity: [0.9, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
              />
            ))}
            <motion.div
              className="absolute inset-8 rounded-full flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, var(--fd-primary), var(--fd-primary-2))` }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaNewspaper className="text-2xl" />
            </motion.div>
          </div>
        )}

        {which === 1 && (
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, var(--fd-primary), var(--fd-primary-2))` }}
              >
                <FaShoppingCart className="text-lg" />
              </div>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.15 }}
              >
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 block w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--fd-primary)", opacity: 1 - i * 0.18 }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {which === 2 && (
          <div className="flex items-end gap-3 h-24 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-5 h-5 rounded-full"
                style={{
                  background: i === 1
                    ? `linear-gradient(135deg, var(--fd-primary), var(--fd-primary-2))`
                    : "var(--fd-primary)",
                  opacity: i === 1 ? 1 : 0.55,
                }}
                animate={{ y: [0, -28, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        {which === 3 && (
          <div className="w-full max-w-sm mb-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden h-16"
                style={{ background: "var(--fd-surface)", border: "1px solid var(--fd-line)" }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  style={{ background: "linear-gradient(90deg, transparent, var(--fd-primary-soft), transparent)" }}
                />
              </div>
            ))}
          </div>
        )}

        {which === 4 && (
          <div className="relative w-24 h-24 mb-8">
            <motion.div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, var(--fd-primary), var(--fd-primary-2))` }}
              animate={{
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["24%", "50%", "24%", "50%", "24%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <FaRocket className="text-2xl" />
            </div>
          </div>
        )}

        {which === 5 && (
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-2xl"
                style={{ border: `2px solid var(--fd-primary)`, width: 40, height: 40 }}
                animate={{ scale: [1, 3.2], opacity: [0.9, 0], rotate: [0, 90] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
              />
            ))}
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white z-10"
              style={{ background: `linear-gradient(135deg, var(--fd-primary), var(--fd-primary-2))` }}
            >
              <FaBolt className="text-sm" />
            </div>
          </div>
        )}

        <motion.p
          key={`text-${which}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-ticket-body text-[14px] font-bold tracking-wide"
          style={{ color: "var(--fd-txt-soft)" }}
        >
          {messages[which]}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--fd-primary)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ⭐ MessageAlertBanner — unchanged */
const MessageAlertBanner = ({ alert, onOpen, onDismiss }) => {
  if (!alert) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="w-full mb-4 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--fd-primary-soft) 0%, transparent 70%)",
        border: "1px solid var(--fd-primary)",
      }}
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--fd-primary)", color: "#fff" }}
        >
          <FaCommentDots className="text-base" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-ticket-body text-[12.5px] font-extrabold truncate" style={{ color: "var(--fd-txt)" }}>
            New message from {alert.senderName || "a seller"}
          </p>
          <p className="font-ticket-body text-[11px] truncate mt-0.5" style={{ color: "var(--fd-txt-soft)" }}>
            {alert.listingTitle ? `About: ${alert.listingTitle}` : alert.preview}
          </p>
        </div>

        <button
          onClick={onOpen}
          className="font-ticket-body text-[11.5px] font-bold px-3.5 py-2 rounded-xl text-white flex-shrink-0"
          style={{ background: "var(--fd-primary)" }}
        >
          Open
        </button>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ color: "var(--fd-txt-faint)" }}
          aria-label="Dismiss"
        >
          <FaTimes className="text-[11px]" />
        </button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN FEED
   ═══════════════════════════════════════════════════════════════ */
const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const filter = useFilter();
  const [messageAlert, setMessageAlert] = useState(null);
  const [messageAlertMeta, setMessageAlertMeta] = useState({});
  const planCtx = usePlan();
  const currentUserPlan = planCtx?.planId || "free";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [favorites, setFavorites] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [cityCounts, setCityCounts] = useState({});
  const [brandCounts, setBrandCounts] = useState({});
  const [conditionCounts, setConditionCounts] = useState({});
  const [viewMode, setViewMode] = useState(() => {
    try { const s = localStorage.getItem(VIEW_STORAGE_KEY); if (s && VIEW_MODES.some((v) => v.id === s)) return s; } catch {}
    return "grid-md";
  });
  useEffect(() => { try { localStorage.setItem(VIEW_STORAGE_KEY, viewMode); } catch {} }, [viewMode]);
  const [toast, setToast] = useState(null);
  const SIDEBAR_STORAGE_KEY = "apna.feed.sidebar.hidden";
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarHidden)); } catch {}
  }, [sidebarHidden]);

  /* ⭐ LIVE SUGGESTIONS — computed from listings as user types */
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const MAX = 8;

    return listings
      .filter((l) => {
        const haystack = [
          l.title,
          l.description,
          l.location,
          l.category,
          l.condition,
          l.rawSpecs?.brand,
          l.rawSpecs?.make,
          l.rawSpecs?.model,
          l.rawSpecs?.year,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, MAX)
      .map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        image: l.image,
        category: l.category,
        location: l.location,
        detailPath: l.detailPath,
      }));
  }, [searchQuery, listings]);

  /* ⭐ Suggestion click → go straight to that item's detail page */
  const handleSuggestionClick = (s) => {
    if (!s?.id) return;
    const path = s.detailPath || "listing";
    navigate(`/${path}/${s.id}`);
  };

  /* ⭐ Message subscription — unchanged */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`feed-msg-alert-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          const m = payload.new;
          const senderId = m.sender_id;

          const seller = listings.find((l) => l.user_id === senderId);

          let sellerName = "Seller";
          if (seller?.seller?.full_name) sellerName = seller.seller.full_name;
          else if (seller?.seller?.email) sellerName = seller.seller.email.split("@")[0];
          else {
            try {
              const { data: prof } = await supabase
                .from("user_settings")
                .select("full_name, email")
                .eq("user_id", senderId)
                .maybeSingle();
              if (prof?.full_name) sellerName = prof.full_name;
              else if (prof?.email) sellerName = prof.email.split("@")[0];
            } catch (err) {
              console.warn("Could not resolve sender name:", err);
            }
          }

          const listingTitle = seller?.title || "";
          const preview = m.message_type === "image" ? "📷 Photo" : (m.content || "").slice(0, 80);

          setMessageAlert({
            id: m.id,
            senderId,
            senderName: sellerName,
            listingTitle,
            preview,
            isImage: m.message_type === "image",
          });

          setTimeout(() => {
            setMessageAlert((cur) => (cur && cur.id === m.id ? null : cur));
          }, 12000);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user?.id, listings]);

  useEffect(() => {
    if (mobileFiltersOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileFiltersOpen]);

  useEffect(() => { const t = setTimeout(() => setSearchDebounced(searchQuery), 180); return () => clearTimeout(t); }, [searchQuery]);

  const pushToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToast({ id, type, title, message });
    setTimeout(() => setToast(null), 2600);
  };

  /* Fetch feed — unchanged */
  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .in("status", ["active", "sold"])
          .order("posted_at", { ascending: false })
          .limit(200);
        if (error) throw error;

        const visible = (data || []).filter((item) => {
          const status = String(item.status || "").toLowerCase().trim();
          return status === "active" || status === "sold";
        });

        const sellerIds = [...new Set(visible.map((r) => r.user_id).filter(Boolean))];
        let sellerMap = {};
        if (sellerIds.length > 0) {
          const { data: profiles, error: profErr } = await supabase
            .from("user_settings")
            .select("user_id, full_name, avatar, email, plan_id, verified")
            .in("user_id", sellerIds);

          if (profErr) console.warn("⚠️ user_settings fetch:", profErr);

          (profiles || []).forEach((p) => {
            sellerMap[p.user_id] = {
              full_name: p.full_name || null,
              avatar: p.avatar || null,
              email: p.email || null,
              planId: String(p.plan_id || "free").toLowerCase(),
              verified: !!p.verified,
            };
          });
        }

        const catCounts = {}; const cCityCounts = {}; const cBrandCounts = {}; const cCondCounts = {};
        visible.forEach((row) => {
          const cat = (row.category || "").trim();
          const sub = (row.subcategory || "").trim();
          const city = (row.city || "").trim();
          const specs = row.specs || {};
          const brand = specs.brand || specs.make || "";
          const cond = row.condition || "";
          if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
          if (sub) catCounts[sub] = (catCounts[sub] || 0) + 1;
          if (city) cCityCounts[city] = (cCityCounts[city] || 0) + 1;
          if (brand) cBrandCounts[brand] = (cBrandCounts[brand] || 0) + 1;
          if (cond) cCondCounts[cond] = (cCondCounts[cond] || 0) + 1;
        });
        setCategoryCounts(catCounts); setCityCounts(cCityCounts); setBrandCounts(cBrandCounts); setConditionCounts(cCondCounts);

        const mapped = visible.map((item) => {
          const cat = (item.category || "").toLowerCase().trim();
          const meta = CATEGORY_META[cat] || { label: item.category || "Other", icon: FaTag, accent: "#E26A2C", detailPath: "listing" };
          const normalizedSpecs = normalizeSpecs(item.specs || {}, item.category || "");
          const seller = sellerMap[item.user_id] || null;
          return {
            id: item.id, category: meta.label, icon: meta.icon, accent: meta.accent, detailPath: meta.detailPath,
            title: item.title || "Untitled", description: item.description || "",
            condition: item.condition || null,
            location: item.area ? `${item.area}, ${item.city}` : item.city || "—",
            price: Number(item.price) || 0,
            image: item.cover_image || item.images?.[0] || null,
            rawImages: Array.isArray(item.images) ? item.images : [],
            verified: item.verified || seller?.verified || false,
            featured: item.featured || false, featured_until: item.featured_until || null,
            status: item.status, sold: (item.status || "").toLowerCase() === "sold",
            postedAgo: timeAgo(item.posted_at),
            contact_number: item.contact_number || null, user_id: item.user_id || null,
            rawCategory: item.category || "", rawSubcategory: item.subcategory || "",
            rawCity: item.city || "", rawArea: item.area || "",
            rawSpecs: item.specs || {}, normalizedSpecs,
            rawCondition: item.condition || "",
            seller,
          };
        });
        setListings(mapped);
      } catch (err) {
        console.error("❌ Feed fetch error:", err);
        setListings([]);
      } finally { setIsLoading(false); }
    };
    fetchFeed();
  }, [user]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) { setFavorites([]); return; }
      try {
        const { data, error } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
        if (error) throw error;
        setFavorites((data || []).map((f) => f.listing_id));
      } catch (err) { console.error("Fetch favorites error:", err); }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (e, id) => {
    e.stopPropagation();
    if (!user) { pushToast("error", "Sign in required", "Please sign in to save favorites."); return; }
    const isFav = favorites.includes(id);
    setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
    try {
      if (isFav) { await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id); }
      else { await supabase.from("favorites").insert({ user_id: user.id, listing_id: id }); }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
    }
  };

  const handleCardClick = (item) => {
    if (item.sold) { pushToast("error", "This item is sold", "No longer available."); return; }
    navigate(`/${item.detailPath}/${item.id}`);
  };
  const handleCardChat = (item) => {
    if (!item?.user_id) {
      pushToast("error", "Seller unavailable", "This listing has no seller info.");
      return;
    }
    if (user && item.user_id === user.id) {
      pushToast("info", "This is your listing", "You can't chat with yourself 🙂");
      return;
    }

    const msg = "Hi! Is this still available?";

    try {
      window.dispatchEvent(
        new CustomEvent("open-chat-dock", {
          detail: {
            peerId:    item.user_id,
            listingId: item.id,
            prefill:   msg,
          },
        })
      );
    } catch (err) {
      console.warn("open-chat-dock dispatch failed:", err);
      const params = new URLSearchParams();
      params.set("user", item.user_id);
      params.set("listing", item.id);
      params.set("text", msg);
      navigate(`/marketplace-chat?${params.toString()}`);
    }
  };
  const pickCategory = (val) => filter.setCategory(filter.category === val ? null : val);
  const pickLocation = (val) => filter.setLocation(filter.location === val ? null : val);
  const pickBrand = (val) => filter.setBrand(filter.brand === val ? null : val);
  const toggleCond = (val) => filter.toggleInArray(filter.setConditions, val);
  const toggleColor = (val) => filter.toggleInArray(filter.setColors, val);

  const toggleFuel = (val) => filter.toggleInArray(filter.setFuelTypes, val);
  const toggleTrans = (val) => filter.toggleInArray(filter.setTransmissions, val);
  const toggleBody = (val) => filter.toggleInArray(filter.setBodyTypes, val);
  const toggleAssembly = (val) => filter.toggleInArray(filter.setToyAssembly, val);

  const activeCategoryLower = String(filter.category || activeCategoryTab || "").toLowerCase();
  const showVehicleSections =
    activeCategoryLower === "vehicles" ||
    activeCategoryLower === "bikes" ||
    activeCategoryLower === "" ||
    activeCategoryLower === "all";
  const showPropertySections = activeCategoryLower === "property";
  const showMobileSections = activeCategoryLower === "mobiles";
  const showElectronicsSections = activeCategoryLower === "electronics";
  const showToySections = activeCategoryLower === "toys";

  const topBrands = useMemo(() => {
    const list = Object.entries(brandCounts).sort(([, a], [, b]) => b - a).slice(0, 12);
    if (!brandSearch.trim()) return list;
    const q = brandSearch.toLowerCase();
    return list.filter(([name]) => name.toLowerCase().includes(q));
  }, [brandCounts, brandSearch]);

  const topCities = useMemo(() => Object.entries(cityCounts).sort(([, a], [, b]) => b - a).slice(0, 8), [cityCounts]);
  const activeCategory = String(filter.category || "").trim();

  const totalActiveFilters =
    (filter.category ? 1 : 0) +
    (filter.location ? 1 : 0) +
    (filter.brand ? 1 : 0) +
    (filter.priceMin ? 1 : 0) +
    (filter.priceMax ? 1 : 0) +
    (filter.conditions?.length || 0) +
    (filter.colors?.length || 0) +
    (filter.sellerType?.length || 0) +
    (filter.fuelTypes?.length || 0) +
    (filter.transmissions?.length || 0) +
    (filter.bodyTypes?.length || 0) +
    (filter.yearMin ? 1 : 0) +
    (filter.yearMax ? 1 : 0) +
    (filter.kmMin ? 1 : 0) +
    (filter.kmMax ? 1 : 0) +
    (filter.bedrooms?.length || 0) +
    (filter.bathrooms?.length || 0) +
    (filter.propertyPurpose?.length || 0) +
    (filter.areaMin ? 1 : 0) +
    (filter.areaMax ? 1 : 0) +
    (filter.storage?.length || 0) +
    (filter.ptaApproved?.length || 0) +
    (filter.network?.length || 0) +
    (filter.deviceType?.length || 0) +
    (filter.warranty?.length || 0) +
    (filter.electronicsBrands?.length || 0) +
    (filter.toyAudience?.length || 0) +
    (filter.toyMaterial?.length || 0) +
    (filter.toyAge?.length || 0) +
    (filter.toyBattery?.length || 0) +
    (filter.featuredOnly ? 1 : 0) +
    (filter.withPhotos ? 1 : 0);

  const listingsWithLivePlan = useMemo(() => {
    if (!user) return listings;
    return listings.map((l) =>
      l.user_id === user.id
        ? {
            ...l,
            seller: l.seller
              ? { ...l.seller, planId: currentUserPlan }
              : { planId: currentUserPlan, verified: false },
          }
        : l
    );
  }, [listings, user, currentUserPlan]);

  const filteredFeed = useMemo(() => {
    let result = [...listingsWithLivePlan];

    if (activeCategoryTab && activeCategoryTab !== "all") {
      const target = activeCategoryTab.toLowerCase();
      result = result.filter((f) => {
        const rc = (f.rawCategory || "").toLowerCase();
        const rs = (f.rawSubcategory || "").toLowerCase();
        return rc === target || rs === target || rc.includes(target) || rs.includes(target);
      });
    }

    if (filter.category) {
      const target = filter.category.toLowerCase();
      result = result.filter((f) => {
        const rc = (f.rawCategory || "").toLowerCase();
        const rs = (f.rawSubcategory || "").toLowerCase();
        return rc === target || rs === target;
      });
    }

    if (filter.location) {
      const target = filter.location.toLowerCase();
      result = result.filter((f) => {
        const city = (f.rawCity || "").toLowerCase();
        const area = (f.rawArea || "").toLowerCase();
        return city === target || area === target;
      });
    }

    const pMin = Number(filter.priceMin) || 0;
    const pMax = Number(filter.priceMax) || Infinity;
    if (pMin > 0 || pMax < Infinity) result = result.filter((f) => f.price >= pMin && f.price <= pMax);

    if (filter.brand) {
      const brand = filter.brand.toLowerCase();
      result = result.filter((f) =>
        (f.rawSpecs?.brand || f.rawSpecs?.make || "").toLowerCase() === brand
      );
    }

    if (filter.conditions?.length > 0) {
      result = result.filter((f) => filter.conditions.includes(f.condition));
    }

    if (filter.colors?.length > 0) {
      result = result.filter((f) =>
        filter.colors.includes(String(f.rawSpecs?.color || "").trim())
      );
    }

    if (filter.fuelTypes?.length > 0) {
      result = result.filter((f) =>
        filter.fuelTypes.includes(String(f.rawSpecs?.fuel || "").trim())
      );
    }

    if (filter.transmissions?.length > 0) {
      result = result.filter((f) =>
        filter.transmissions.includes(String(f.rawSpecs?.transmission || "").trim())
      );
    }

    if (filter.bodyTypes?.length > 0) {
      result = result.filter((f) =>
        filter.bodyTypes.includes(String(f.rawSpecs?.bodyType || "").trim())
      );
    }

    const yMin = Number(filter.yearMin) || 0;
    const yMax = Number(filter.yearMax) || Infinity;
    if (yMin > 0 || yMax < Infinity) {
      result = result.filter((f) => {
        const y = Number(f.rawSpecs?.year) || 0;
        return y >= yMin && y <= yMax;
      });
    }

    const kMin = Number(filter.kmMin) || 0;
    const kMax = Number(filter.kmMax) || Infinity;
    if (kMin > 0 || kMax < Infinity) {
      result = result.filter((f) => {
        const km = Number(String(f.rawSpecs?.mileage || "").replace(/[^0-9]/g, "")) || 0;
        return km >= kMin && km <= kMax;
      });
    }

    if (filter.bedrooms?.length > 0) {
      result = result.filter((f) =>
        filter.bedrooms.includes(String(f.rawSpecs?.beds || "").trim())
      );
    }

    if (filter.bathrooms?.length > 0) {
      result = result.filter((f) =>
        filter.bathrooms.includes(String(f.rawSpecs?.baths || "").trim())
      );
    }

    if (filter.propertyPurpose?.length > 0) {
      result = result.filter((f) =>
        filter.propertyPurpose.includes(String(f.rawSpecs?.purpose || "").trim())
      );
    }

    const aMin = Number(filter.areaMin) || 0;
    const aMax = Number(filter.areaMax) || Infinity;
    if (aMin > 0 || aMax < Infinity) {
      result = result.filter((f) => {
        const a = Number(f.rawSpecs?.area) || 0;
        return a >= aMin && a <= aMax;
      });
    }

    if (filter.storage?.length > 0) {
      result = result.filter((f) =>
        filter.storage.includes(String(f.rawSpecs?.storage || "").trim())
      );
    }

    if (filter.ptaApproved?.length > 0) {
      result = result.filter((f) =>
        filter.ptaApproved.includes(String(f.rawSpecs?.pta || "").trim())
      );
    }

    if (filter.network?.length > 0) {
      result = result.filter((f) =>
        filter.network.includes(String(f.rawSpecs?.network || "").trim())
      );
    }

    if (filter.deviceType?.length > 0) {
      result = result.filter((f) =>
        filter.deviceType.includes(String(f.rawSpecs?.type || "").trim())
      );
    }

    if (filter.warranty?.length > 0) {
      result = result.filter((f) =>
        filter.warranty.includes(String(f.rawSpecs?.warranty || "").trim())
      );
    }

    if (filter.electronicsBrands?.length > 0) {
      result = result.filter((f) =>
        filter.electronicsBrands.includes(String(f.rawSpecs?.brand || "").trim())
      );
    }

    if (filter.toyAudience?.length > 0) {
      result = result.filter((f) =>
        filter.toyAudience.includes(String(f.rawSpecs?.audience || "").trim())
      );
    }
    if (filter.toyMaterial?.length > 0) {
      result = result.filter((f) =>
        filter.toyMaterial.includes(String(f.rawSpecs?.material || "").trim())
      );
    }
    if (filter.toyAge?.length > 0) {
      result = result.filter((f) =>
        filter.toyAge.includes(String(f.rawSpecs?.age || "").trim())
      );
    }
    if (filter.toyBattery?.length > 0) {
      result = result.filter((f) =>
        filter.toyBattery.includes(String(f.rawSpecs?.battery || "").trim())
      );
    }

    if (filter.featuredOnly) result = result.filter((f) => f.featured);
    if (filter.withPhotos) result = result.filter((f) => f.image && f.image !== "/car1.png");

    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase().trim();
      result = result.filter((f) => {
        const haystack = [
          f.title, f.description, f.location, f.category, f.condition,
          ...Object.values(f.rawSpecs || {}).map(String),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);

    return result;
  }, [listingsWithLivePlan, searchDebounced, sortBy, filter, activeCategoryTab]);

  const gridClass = useMemo(() => {
    switch (viewMode) {
      case "grid-lg": return "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5";
      case "grid-sm": return "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5";
      case "list":    return "grid grid-cols-1 gap-4";
      default:        return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4";
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen w-full max-w-[100vw] fd-bg">
      <FeedStyles />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <AnimatePresence>
        {isLoading && <FeedLoader />}
      </AnimatePresence>
      <div className="w-full py-3 sm:py-4 px-0 pb-24 md:pb-4">
        <div className="flex items-start" style={{ gap: 24 }}>
          {/* ═══ DESKTOP SIDEBAR ═══ */}
          <aside
            style={{
              width: sidebarHidden ? 0 : 320,
              marginLeft: sidebarHidden ? 0 : 20,
              transition: "width 0.32s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease",
              opacity: sidebarHidden ? 0 : 1,
              overflow: "visible",
              pointerEvents: sidebarHidden ? "none" : "auto",
            }}
            className="hidden md:flex flex-col sticky top-4 h-[calc(100vh-2rem)] flex-shrink-0"
          >
            <div
              className="relative flex-1 flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "var(--fd-surface)",
                border: "1px solid var(--fd-line)",
              }}
            >

              <div style={{ height: 1, background: "var(--fd-line)" }} />
              <div className="sidebar-scroll flex-1 overflow-y-auto">
                <SidebarFilters
                  filter={filter}
                  categoryCounts={categoryCounts}
                  conditionCounts={conditionCounts}
                  topCities={topCities}
                  topBrands={topBrands}
                  brandSearch={brandSearch}
                  setBrandSearch={setBrandSearch}
                  toggleCond={toggleCond}
                  toggleFuel={toggleFuel}
                  toggleTrans={toggleTrans}
                  toggleBody={toggleBody}
                  toggleAssembly={toggleAssembly}
                  toggleColor={toggleColor}
                  pickCategory={pickCategory}
                  pickLocation={pickLocation}
                  pickBrand={pickBrand}
                  activeCategory={activeCategory}
                  showVehicleSections={showVehicleSections}
                  showPropertySections={showPropertySections}
                  showMobileSections={showMobileSections}
                  showElectronicsSections={showElectronicsSections}
                  showToySections={showToySections}
                  sMobile={false}                                       /* ⭐ ADD */
  onClose={() => setSidebarHidden(true)}    
                />
              </div>
            </div>
          </aside>

      {sidebarHidden && (
  <button
    type="button"
    onClick={() => setSidebarHidden(false)}
    aria-label="Show filters"
    className="hidden md:inline-flex items-center gap-2 self-start mt-1 ml-2 px-3 py-2 rounded-full transition-all"
    style={{
      background: "var(--fd-surface)",
      border: "1px solid var(--fd-line-str)",
      color: "var(--fd-txt)",
      fontFamily: "'Manrope', system-ui, sans-serif",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "var(--fd-primary)";
      e.currentTarget.style.color = "#0A0A12";
      e.currentTarget.style.borderColor = "var(--fd-primary)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "var(--fd-surface)";
      e.currentTarget.style.color = "var(--fd-txt)";
      e.currentTarget.style.borderColor = "var(--fd-line-str)";
    }}
  >
    {/* ⭐ Same SVG icon as the collapse button */}
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path
        d="M2 3a1 1 0 0 1 1-1h2v12H3a1 1 0 0 1-1-1V3Zm5-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7V2Z"
        opacity="0.85"
      />
    </svg>
  </button>
)}
          <main className="flex-1 min-w-0 px-3 sm:px-0" style={{ paddingRight: 20 }}>
            <div>
              {/* ⭐ HERO SEARCH — now with live suggestions */}
              <HeroSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeCategoryTab={activeCategoryTab}
                setActiveCategoryTab={setActiveCategoryTab}
                onSearchSubmit={(q) => setSearchQuery(q)}
                suggestions={searchSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />

              <ShopByCategory
                onCategoryClick={(id, item) => {
                  setSearchQuery(item.label);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSeeAll={() => {}}
              />

              <ShopByOccasion
                activeCategoryTab={activeCategoryTab}
                onTagClick={(id) => {
                  setActiveCategoryTab(id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onCardClick={(category) => {
                  setActiveCategoryTab(category);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />

              <AnimatePresence>
                {messageAlert && (
                  <MessageAlertBanner
                    alert={messageAlert}
                    onOpen={() => {
                      const sellerListing = listings.find(
                        (l) => l.user_id === messageAlert.senderId
                      );

                      try {
                        window.dispatchEvent(
                          new CustomEvent("open-chat-dock", {
                            detail: {
                              peerId: messageAlert.senderId,
                              autoSend: true,
                              listingId: sellerListing?.id || null,
                              prefill: "",
                            },
                          })
                        );
                      } catch (_) {}

                      setMessageAlert(null);
                    }}
                    onDismiss={() => setMessageAlert(null)}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      margin: 0,
                      color: "var(--fd-txt)",
                      fontSize: "clamp(20px, 2.8vw, 26px)",
                      fontWeight: 800,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.1,
                      fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 40,
                        padding: "4px 12px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(135deg, var(--fd-primary) 0%, var(--fd-primary-2) 100%)",
                        color: "#FFFFFF",
                        fontSize: "clamp(16px, 2.2vw, 20px)",
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        boxShadow: "0 8px 20px -10px var(--fd-primary-glow)",
                      }}
                    >
                      {filteredFeed.length}
                    </span>

                    <span style={{ fontWeight: 800 }}>
                      listing{filteredFeed.length === 1 ? "" : "s"}
                    </span>

                    {activeCategoryTab !== "all" && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          marginLeft: 4,
                          borderRadius: 999,
                          background: "var(--fd-primary-soft)",
                          color: "var(--fd-primary)",
                          fontSize: "clamp(11px, 1.4vw, 13px)",
                          fontWeight: 700,
                          letterSpacing: "-0.005em",
                          border: "1px solid var(--fd-primary-soft)",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: "var(--fd-primary)",
                          }}
                        />
                        {HERO_CATEGORIES.find((c) => c.id === activeCategoryTab)?.label}
                      </span>
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    aria-label="Open filters"
                    className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg fd-input relative"
                    style={{ cursor: "pointer" }}
                  >
                    <FaSlidersH className="text-[13px]" style={{ color: "var(--fd-txt)" }} />
                    {totalActiveFilters > 0 && (
                      <span
                        className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                        style={{ background: "var(--fd-primary)", lineHeight: 1 }}
                      >
                        {totalActiveFilters}
                      </span>
                    )}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer outline-none fd-input"
                  >
                    {sortOptions.map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mb-4 w-full">
                <div className="inline-flex items-center gap-0.5 p-1 rounded-lg fd-panel-solid flex-shrink-0">
                  {VIEW_MODES.map((v) => {
                    const Icon = v.icon; const active = viewMode === v.id;
                    return (
                      <button key={v.id} type="button" onClick={() => setViewMode(v.id)} title={v.label} className="relative inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded" style={{ color: active ? "#fff" : "var(--fd-txt-faint)" }}>
                        {active && (<motion.div layoutId="view-mode-active" className="absolute inset-0 rounded" style={{ background: "var(--fd-primary)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />)}
                        <Icon className="text-[10px] sm:text-[11px] relative z-10" />
                      </button>
                    );
                  })}
                </div>
                {searchDebounced.trim() && (
                  <span className="text-[11.5px] sm:text-[12.5px] font-medium flex-shrink-0 truncate max-w-[60%]" style={{ color: "var(--fd-txt-soft)" }}>
                    {filteredFeed.length} result{filteredFeed.length === 1 ? "" : "s"} for "{searchDebounced}"
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className={gridClass}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="fd-card rounded-2xl overflow-hidden">
                      <div className="aspect-square shimmer" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-full rounded shimmer" />
                        <div className="h-3 w-2/3 rounded shimmer" />
                        <div className="h-4 w-20 rounded shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFeed.length === 0 ? (
                <div className="fd-card rounded-2xl py-20 text-center px-4">
                  <FaNewspaper className="text-4xl mx-auto mb-3" style={{ color: "var(--fd-txt-faint)" }} />
                  <p className="text-[15px] font-bold mb-1" style={{ color: "var(--fd-txt)" }}>No listings found</p>
                  <p className="text-[12px]" style={{ color: "var(--fd-txt-soft)" }}>
                    {searchDebounced.trim() ? `Nothing matches "${searchDebounced}". Try a different search.` : "Try different filters"}
                  </p>
                  <Link to="/post-ad" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[12.5px] font-bold" style={{ background: "var(--fd-primary)" }}>
                    <FaPlus className="text-xs" /> Post an Ad
                  </Link>
                </div>
              ) : (
                <div className={`${gridClass}`}>
                  <AnimatePresence mode="popLayout">
                    {filteredFeed.map((item, i) => (
                      <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}>
                        <PropertyCardSmall
                          item={item}
                          onClick={() => handleCardClick(item)}
                          isFav={favorites.includes(item.id)}
                          onToggleFavorite={(e) => toggleFavorite(e, item.id)}
                          onBuy={() => handleCardClick(item)}
                          onChat={() => handleCardChat(item)}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav
        activeCategoryTab={activeCategoryTab}
        onSelectCategory={(id) => { setActiveCategoryTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      />

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              key="sheet-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fd-sheet-backdrop"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(e, info) => { if (info.offset.y > 120) setMobileFiltersOpen(false); }}
              className="fd-sheet"
            >
              <div className="fd-sheet__handle" />
              <div className="fd-sheet__header">
                <div>
                  <p className="font-ticket-display text-[16px] font-bold" style={{ color: "var(--fd-txt)" }}>Filters</p>
                  <p className="font-ticket-body text-[11px]" style={{ color: "var(--fd-txt-soft)" }}>
                    {totalActiveFilters > 0 ? `${totalActiveFilters} active` : "Refine your search"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={filter.resetAll} disabled={totalActiveFilters === 0} className="font-ticket-body text-[11.5px] font-bold disabled:opacity-40" style={{ color: "var(--fd-primary)" }}>Reset</button>
                  <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "var(--fd-surface-2)", border: "1px solid var(--fd-line)", color: "var(--fd-txt)" }}>
                    <FaTimes className="text-[12px]" />
                  </button>
                </div>
              </div>
              <div className="fd-sheet__body">
                <SidebarFilters
                  filter={filter}
                  categoryCounts={categoryCounts}
                  conditionCounts={conditionCounts}
                  topCities={topCities}
                  topBrands={topBrands}
                  brandSearch={brandSearch}
                  setBrandSearch={setBrandSearch}
                  toggleCond={toggleCond}
                  toggleFuel={toggleFuel}
                  toggleTrans={toggleTrans}
                  toggleBody={toggleBody}
                  toggleAssembly={toggleAssembly}
                  toggleColor={toggleColor}
                  pickCategory={pickCategory}
                  pickLocation={pickLocation}
                  pickBrand={pickBrand}
                  activeCategory={activeCategory}
                  showVehicleSections={showVehicleSections}
                  showPropertySections={showPropertySections}
                  showMobileSections={showMobileSections}
                  showElectronicsSections={showElectronicsSections}
                  showToySections={showToySections}
                    isMobile={true}                                        /* ⭐ ADD */
  onClose={() => setMobileFiltersOpen(false)}   
                />
              </div>
              <div className="fd-sheet__footer">
                <button type="button" onClick={filter.resetAll} disabled={totalActiveFilters === 0} className="flex-shrink-0 px-4 py-3 rounded-xl font-ticket-body text-[12.5px] font-bold disabled:opacity-40" style={{ border: "1px solid var(--fd-danger)", color: "var(--fd-danger)", background: "var(--fd-danger-soft)" }}>Clear</button>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} className="flex-1 py-3 rounded-xl font-ticket-body text-[12.5px] font-bold text-white" style={{ background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)" }}>
                  Show {filteredFeed.length} result{filteredFeed.length === 1 ? "" : "s"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;