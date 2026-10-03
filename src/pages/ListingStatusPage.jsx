// src/pages/ListingStatusPage.jsx
// — Modern, dashboard-style listing status page
//   • Date-range picker on chart (7d / 30d / 90d / 12m)
//   • Redesigned hero header with status strip
//   • Live / Boosted pills inline in header
//   • Real totals across all listings
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle, FaSpinner, FaEye,
  FaRocket, FaEdit, FaTrash, FaMapMarkerAlt,
  FaTag, FaBolt, FaWhatsapp, FaCopy, FaChevronLeft,
  FaArrowRight, FaExclamationTriangle,
  FaInfoCircle, FaCheck, FaHourglassHalf, FaBan, FaBoxOpen,
  FaUser, FaChartLine, FaChevronRight, FaFire, FaChevronDown,
  FaRegClock,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const StatusStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .ls-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .ls-body { font-family: 'Manrope', system-ui, sans-serif; }
    .ls-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .ls-scroll::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.25); border-radius: 99px; }

    .theme-dark {
      --ls-bg: #0A0A12;
      --ls-surface: #16161F;
      --ls-surface-2: #1C1C28;
      --ls-line: rgba(255,255,255,0.08);
      --ls-line-str: rgba(255,255,255,0.15);
      --ls-txt: #FFFFFF;
      --ls-txt-soft: rgba(255,255,255,0.65);
      --ls-txt-faint: rgba(255,255,255,0.42);
      --ls-primary: #e66000;
      --ls-primary-2: #ff7a1a;
      --ls-primary-soft: rgba(230,96,0,0.14);
      --ls-primary-glow: rgba(230,96,0,0.45);
      --ls-success: #22c55e;
      --ls-success-soft: rgba(34,197,94,0.14);
      --ls-warning: #eab308;
      --ls-warning-soft: rgba(234,179,8,0.14);
      --ls-danger: #ef4444;
      --ls-danger-soft: rgba(239,68,68,0.14);
      --ls-info: #3b82f6;
      --ls-info-soft: rgba(59,130,246,0.14);
      --ls-purple: #8b5cf6;
      --ls-purple-soft: rgba(139,92,246,0.14);
      --ls-pink: #ec4899;
      --ls-pink-soft: rgba(236,72,153,0.14);
      --ls-cyan: #06b6d4;
      --ls-cyan-soft: rgba(6,182,212,0.14);
    }
    .theme-light {
      --ls-bg: #FAF9FC;
      --ls-surface: #FFFFFF;
      --ls-surface-2: #F5F5F7;
      --ls-line: rgba(20,20,30,0.06);
      --ls-line-str: rgba(20,20,30,0.12);
      --ls-txt: #0F1419;
      --ls-txt-soft: rgba(15,20,25,0.62);
      --ls-txt-faint: rgba(15,20,25,0.42);
      --ls-primary: #e66000;
      --ls-primary-2: #ff7a1a;
      --ls-primary-soft: rgba(230,96,0,0.10);
      --ls-primary-glow: rgba(230,96,0,0.35);
      --ls-success: #16a34a;
      --ls-success-soft: rgba(22,163,74,0.10);
      --ls-warning: #ca8a04;
      --ls-warning-soft: rgba(202,138,4,0.10);
      --ls-danger: #dc2626;
      --ls-danger-soft: rgba(220,38,38,0.08);
      --ls-info: #2563eb;
      --ls-info-soft: rgba(37,99,235,0.08);
      --ls-purple: #7c3aed;
      --ls-purple-soft: rgba(124,58,237,0.08);
      --ls-pink: #db2777;
      --ls-pink-soft: rgba(219,39,119,0.08);
      --ls-cyan: #0891b2;
      --ls-cyan-soft: rgba(8,145,178,0.08);
    }
    .ls-bg {
      min-height: 100vh; width: 100%;
      background: var(--ls-bg); color: var(--ls-txt);
      transition: background 0.35s ease, color 0.35s ease;
      overflow-x: hidden;
    }
    .ls-shell { width: 100%; padding: 20px 0 32px; }
    @media (min-width: 640px) { .ls-shell { padding: 28px 0 40px; } }
    .ls-inner { width: 100%; max-width: 100%; margin: 0; padding: 0 12px; }
    @media (min-width: 640px) { .ls-inner { padding: 0 16px; } }
    @media (min-width: 1024px) { .ls-inner { padding: 0 20px; } }
    .ls-card { background: var(--ls-surface); border: 1px solid var(--ls-line); border-radius: 20px; }
    @media (max-width: 480px) { .ls-card { border-radius: 16px; } }

    @keyframes ls-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.55; transform: scale(1.15); }
    }
    .ls-pulse { animation: ls-pulse 1.6s ease-in-out infinite; }

    @keyframes ls-shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .ls-shimmer {
      background: linear-gradient(90deg, var(--ls-line) 0%, var(--ls-primary-soft) 50%, var(--ls-line) 100%);
      background-size: 800px 100%;
      animation: ls-shimmer 1.4s infinite linear;
    }
    .ls-cta-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .ls-cta-row > button { white-space: nowrap; }
    .ls-stats { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    @media (min-width: 768px) { .ls-stats { grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; } }
    .ls-row-2 { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 900px) { .ls-row-2 { grid-template-columns: 1.6fr 1fr; gap: 14px; } }
    .ls-row-3 { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 900px) { .ls-row-3 { grid-template-columns: 1fr 1fr 1fr; gap: 14px; } }
    .ls-preview { display: flex; flex-direction: column; }
    @media (min-width: 640px) { .ls-preview { flex-direction: row; } }
    .ls-preview-img { width: 100%; height: 220px; object-fit: cover; background: #000; display: block; }
    @media (min-width: 640px) {
      .ls-preview-img { width: 220px; height: 100%; min-height: 200px; flex-shrink: 0; }
    }

    /* ⭐ date-range pill dropdown */
    .ls-date-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: var(--ls-surface-2);
      border: 1px solid var(--ls-line);
      color: var(--ls-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .ls-date-pill:hover {
      background: var(--ls-primary-soft);
      border-color: var(--ls-primary);
      color: var(--ls-primary);
    }
    .ls-date-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 160px;
      background: var(--ls-surface);
      border: 1px solid var(--ls-line);
      border-radius: 14px;
      padding: 6px;
      box-shadow: 0 20px 40px -16px rgba(0,0,0,0.35);
      z-index: 30;
      overflow: hidden;
    }
    .ls-date-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 8px 10px;
      border-radius: 9px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: var(--ls-txt);
      text-align: left;
      transition: background 0.15s ease;
    }
    .ls-date-option:hover { background: var(--ls-surface-2); }
    .ls-date-option--active {
      background: var(--ls-primary-soft);
      color: var(--ls-primary);
      font-weight: 800;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   STATUS CONFIG
   ═══════════════════════════════════════════════════════════════ */
const STATUS_META = {
  pending: {
    label: "Under review", short: "Pending",
    desc: "Your listing is being checked by our team. This usually takes under an hour.",
    icon: FaHourglassHalf, tone: "warning",
  },
  active: {
    label: "Live on marketplace", short: "Live",
    desc: "Your listing is live — buyers can find it in search and category pages.",
    icon: FaCheckCircle, tone: "success",
  },
  sold: {
    label: "Marked as sold", short: "Sold",
    desc: "You marked this item as sold. Congrats on the sale! 🎉",
    icon: FaBoxOpen, tone: "info",
  },
  rejected: {
    label: "Rejected", short: "Rejected",
    desc: "This listing didn't pass our review. Read the notes below to fix and resubmit.",
    icon: FaBan, tone: "danger",
  },
  paused: {
    label: "Paused", short: "Paused",
    desc: "You paused this listing. It's hidden from buyers until you re-activate it.",
    icon: FaBan, tone: "info",
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const formatPrice = (num) => {
  const n = Number(num) || 0;
  if (n >= 10000000) {
    const c = n / 10000000;
    return `Rs ${c % 1 === 0 ? c.toFixed(0) : c.toFixed(2).replace(/\.?0+$/, "")} Cr`;
  }
  if (n >= 100000) {
    const l = n / 100000;
    return `Rs ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, "")} Lac`;
  }
  return `Rs ${n.toLocaleString("en-US")}`;
};

const timeAgo = (iso) => {
  if (!iso) return "recently";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const categoryPath = (rawCat) => {
  const cat = String(rawCat || "").toLowerCase().trim();
  switch (cat) {
    case "vehicles": case "vehicle": case "cars": case "car": return "vehicle";
    case "bikes": case "bike": case "motorcycles": case "motorcycle": return "bike";
    case "mobiles": case "mobile": case "phones": case "phone": return "mobile";
    case "property": case "properties": case "real estate": case "realestate": return "property";
    case "electronics": case "electronic": return "electronic";
    case "toys": case "toy": return "toy";
    default: return "listing";
  }
};

const normalizeStatus = (raw) => {
  const s = String(raw || "").toLowerCase().trim();
  if (["active", "live", "approved", "published", "visible"].includes(s)) return "active";
  if (["pending", "under review", "review", "in_review", "moderation"].includes(s)) return "pending";
  if (["sold", "completed", "closed"].includes(s)) return "sold";
  if (["rejected", "declined", "denied", "removed"].includes(s)) return "rejected";
  if (["paused", "inactive", "hidden", "draft", "unpublished"].includes(s)) return "paused";
  return s || "pending";
};

const isBoosted = (l) => {
  if (!l) return false;
  if (l.featured === true) return true;
  if (l.is_boosted === true) return true;
  if (l.boosted === true) return true;
  const now = Date.now();
  const checkDate = (val) => {
    if (!val) return false;
    const t = new Date(val).getTime();
    return !Number.isNaN(t) && t > now;
  };
  if (checkDate(l.boost_until)) return true;
  if (checkDate(l.featured_until)) return true;
  if (Number(l.boost_days) > 0 && checkDate(l.boost_until)) return true;
  return false;
};

const isLive = (l) => {
  if (!l) return false;
  return normalizeStatus(l.status) === "active";
};

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status, size = "md" }) => {
  const meta = STATUS_META[normalizeStatus(status)] || STATUS_META.pending;
  const Icon = meta.icon;
  const colors = {
    success: { bg: "var(--ls-success-soft)", fg: "var(--ls-success)", ring: "var(--ls-success)" },
    warning: { bg: "var(--ls-warning-soft)", fg: "var(--ls-warning)", ring: "var(--ls-warning)" },
    danger:  { bg: "var(--ls-danger-soft)",  fg: "var(--ls-danger)",  ring: "var(--ls-danger)" },
    info:    { bg: "var(--ls-info-soft)",    fg: "var(--ls-info)",    ring: "var(--ls-info)" },
  };
  const c = colors[meta.tone] || colors.info;
  const pad = size === "lg" ? "px-4 py-2 text-[13px]" : "px-3 py-1.5 text-[11px]";
  const iconSize = size === "lg" ? "text-sm" : "text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-wider ${pad} ls-body`}
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.ring}30` }}
    >
      <Icon className={iconSize} />
      {meta.short}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BOOST BADGE
   ═══════════════════════════════════════════════════════════════ */
const BoostBadge = ({ size = "md" }) => {
  const pad = size === "lg" ? "px-4 py-2 text-[13px]" : "px-3 py-1.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-wider ${pad} ls-body`}
      style={{
        background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
        color: "#FFFFFF",
        boxShadow: "0 6px 16px -8px rgba(230,96,0,0.7)",
      }}
    >
      <FaBolt className="text-[10px]" />
      Boosted
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD STAT CARD
   ═══════════════════════════════════════════════════════════════ */
const DashStatCard = ({ icon: Icon, label, value, tone = "primary", delta = null, hint = null }) => {
  const tones = {
    primary: { bg: "var(--ls-primary-soft)", fg: "var(--ls-primary)" },
    info:    { bg: "var(--ls-info-soft)",    fg: "var(--ls-info)" },
    success: { bg: "var(--ls-success-soft)", fg: "var(--ls-success)" },
    danger:  { bg: "var(--ls-danger-soft)",  fg: "var(--ls-danger)" },
    purple:  { bg: "var(--ls-purple-soft)",  fg: "var(--ls-purple)" },
    pink:    { bg: "var(--ls-pink-soft)",    fg: "var(--ls-pink)" },
    cyan:    { bg: "var(--ls-cyan-soft)",    fg: "var(--ls-cyan)" },
    warning: { bg: "var(--ls-warning-soft)", fg: "var(--ls-warning)" },
  };
  const t = tones[tone] || tones.primary;
  return (
    <div className="ls-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: t.bg, color: t.fg, border: `1px solid ${t.fg}20` }}
        >
          <Icon className="text-[13px]" />
        </div>
        <p className="ls-body text-[13px] sm:text-[14px] font-bold" style={{ color: "var(--ls-txt)" }}>
          {label}
        </p>
      </div>
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <p className="ls-display text-2xl sm:text-[32px] font-black leading-none tabular-nums" style={{ color: "var(--ls-txt)" }}>
          {value}
        </p>
        {delta && (
          <div className="text-right">
            <p
              className="ls-body text-[12px] font-bold"
              style={{ color: delta.positive ? "var(--ls-success)" : "var(--ls-danger)" }}
            >
              {delta.positive ? "+" : ""}{delta.value}%
            </p>
            <p className="ls-body text-[10px]" style={{ color: "var(--ls-txt-faint)" }}>
              Last month
            </p>
          </div>
        )}
        {hint && !delta && (
          <p className="ls-body text-[11px] font-semibold" style={{ color: "var(--ls-txt-faint)" }}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ SPARKLINE CARD — with date range picker
   ═══════════════════════════════════════════════════════════════ */
const DATE_RANGES = [
  { id: "7d",  label: "Last 7 days",  days: 7,   points: 7  },
  { id: "30d", label: "Last 30 days", days: 30,  points: 10 },
  { id: "90d", label: "Last 90 days", days: 90,  points: 12 },
  { id: "12m", label: "Last 12 months", days: 365, points: 12 },
];

const SparklineCard = ({ title, subtitle, points = [], color = "#3b82f6", tooltipText = "" }) => {
  const [range, setRange] = useState("30d");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const currentRange = DATE_RANGES.find((r) => r.id === range) || DATE_RANGES[1];

  /* ⭐ Slice / resample the points to match selected range */
  const displayPoints = useMemo(() => {
    const base = points.length >= 2 ? points : [0, 0];
    const target = currentRange.points;
    if (base.length === target) return base;

    // Resample using linear interpolation between original points
    const out = [];
    for (let i = 0; i < target; i++) {
      const t = i / (target - 1);
      const srcIdx = t * (base.length - 1);
      const lo = Math.floor(srcIdx);
      const hi = Math.min(base.length - 1, lo + 1);
      const frac = srcIdx - lo;
      out.push(Math.round(base[lo] * (1 - frac) + base[hi] * frac));
    }
    return out;
  }, [points, currentRange.points]);

  const width = 600;
  const height = 180;
  const padX = 20;
  const padY = 20;

  const minV = Math.min(...displayPoints);
  const maxV = Math.max(...displayPoints);
  const range1 = maxV - minV || 1;

  const coords = displayPoints.map((v, i) => {
    const x = padX + (i / (displayPoints.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (v - minV) / range1) * (height - padY * 2);
    return { x, y };
  });

  const pathD = coords.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;
  const peakIdx = displayPoints.indexOf(maxV);
  const peak = coords[peakIdx];

  /* ⭐ X-axis labels depend on range */
  const xLabels = useMemo(() => {
    const now = new Date();
    if (range === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        return d.toLocaleDateString("en-GB", { weekday: "short" });
      });
    }
    if (range === "30d") {
      return Array.from({ length: displayPoints.length }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - Math.round((30 * (displayPoints.length - 1 - i)) / (displayPoints.length - 1)));
        return d.getDate();
      });
    }
    if (range === "90d") {
      return Array.from({ length: displayPoints.length }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - Math.round((90 * (displayPoints.length - 1 - i)) / (displayPoints.length - 1)));
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).split(" ")[0];
      });
    }
    // 12m
    return Array.from({ length: displayPoints.length }, (_, i) => {
      const d = new Date(now);
      d.setMonth(now.getMonth() - (displayPoints.length - 1 - i));
      return d.toLocaleDateString("en-GB", { month: "short" });
    });
  }, [range, displayPoints.length]);

  return (
    <div className="ls-card p-4 sm:p-5 relative">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="ls-body text-[15px] sm:text-[16px] font-extrabold" style={{ color: "var(--ls-txt)" }}>{title}</h3>
          {subtitle && <p className="ls-body text-[11px] mt-0.5" style={{ color: "var(--ls-txt-soft)" }}>{subtitle}</p>}
        </div>

        {/* ⭐ Date-range picker */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="ls-date-pill"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <FaRegClock className="text-[10px]" />
            {currentRange.label}
            <FaChevronDown className="text-[8px] opacity-70" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="ls-date-menu"
                role="menu"
              >
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRange(r.id); setMenuOpen(false); }}
                    className={`ls-date-option ${range === r.id ? "ls-date-option--active" : ""}`}
                    role="menuitem"
                  >
                    <span>{r.label}</span>
                    {range === r.id && <FaCheck className="text-[10px]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height: 180, display: "block" }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.20" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={padX} x2={width - padX}
              y1={padY + (i / 4) * (height - padY * 2)}
              y2={padY + (i / 4) * (height - padY * 2)}
              stroke="rgba(127,127,127,0.08)" strokeDasharray="2 3" />
          ))}
          <path d={areaD} fill="url(#sparkGrad)" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={peak.x} cy={peak.y} r="5" fill={color} />
          <circle cx={peak.x} cy={peak.y} r="10" fill={color} opacity="0.15" />
        </svg>
        {tooltipText && (
          <div className="absolute pointer-events-none ls-body"
            style={{ left: `${(peak.x / width) * 100}%`, top: `${(peak.y / height) * 100}%`, transform: "translate(-50%, -115%)" }}>
            <div className="px-3 py-2 rounded-xl text-center shadow-lg"
              style={{ background: "var(--ls-surface)", border: "1px solid var(--ls-line)", whiteSpace: "nowrap" }}>
              <p className="text-[9px] font-semibold" style={{ color: "var(--ls-txt-faint)" }}>Peak</p>
              <p className="text-[13px] font-extrabold tabular-nums" style={{ color: "var(--ls-txt)" }}>{tooltipText}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-1 ls-body text-[10px]" style={{ color: "var(--ls-txt-faint)" }}>
        {xLabels.map((label, i) => (
          <span key={i} className="tabular-nums">{label}</span>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   YOUR ITEMS LIST
   ═══════════════════════════════════════════════════════════════ */
const ItemListCard = ({ allListings = [], currentListing = null, loading = false }) => {
  const items = allListings.length > 0 ? allListings : (currentListing ? [currentListing] : []);

  const goToItem = (l) => {
    window.location.href = `/${categoryPath(l.category)}/${l.id}`;
  };

  const liveItems = items.filter((l) => isLive(l) && !isBoosted(l));
  const boostedItems = items.filter((l) => isBoosted(l));
  const otherItems = items.filter((l) => !isLive(l) && !isBoosted(l));

  const renderRow = (l, i) => {
    const st = normalizeStatus(l.status);
    const meta = STATUS_META[st] || STATUS_META.pending;
    const isCurrent = currentListing?.id === l.id;
    const boosted = isBoosted(l);

    return (
      <div
        key={l.id || i}
        onClick={() => goToItem(l)}
        className="group flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer"
        style={{ background: isCurrent ? "var(--ls-primary-soft)" : "transparent" }}
      >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: "var(--ls-primary-soft)", color: "var(--ls-primary)", border: "1px solid var(--ls-primary)20" }}>
          {l.cover_image ? (
            <img src={l.cover_image} alt={l.title} className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <FaTag className="text-[13px]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="ls-body text-[12.5px] font-bold truncate" style={{ color: "var(--ls-txt)" }}>
              {l.title || "Untitled"}
            </p>
            {boosted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #e66000, #ff7a1a)", color: "#FFFFFF" }}>
                <FaBolt className="text-[7px]" />
                Boost
              </span>
            )}
          </div>
          <p className="ls-body text-[10.5px] truncate mt-0.5 flex items-center gap-1.5" style={{ color: "var(--ls-txt-soft)" }}>
            <span>{l.views || 0} views</span>
            <span>·</span>
            <span style={{
              color: meta.tone === "success" ? "var(--ls-success)" :
                     meta.tone === "warning" ? "var(--ls-warning)" :
                     meta.tone === "danger"  ? "var(--ls-danger)"  : "var(--ls-txt-faint)",
              fontWeight: 700,
            }}>{meta.short}</span>
          </p>
        </div>
        <FaChevronRight className="text-[10px] opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ color: "var(--ls-txt-faint)" }} />
      </div>
    );
  };

  return (
    <div className="ls-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="ls-body text-[15px] sm:text-[16px] font-extrabold" style={{ color: "var(--ls-txt)" }}>
            Your items
          </h3>
          <p className="ls-body text-[11px] mt-0.5" style={{ color: "var(--ls-txt-soft)" }}>
            {items.length} listing{items.length === 1 ? "" : "s"} · {liveItems.length} live · {boostedItems.length} boosted
          </p>
        </div>
        <button onClick={() => (window.location.href = "/my-listings")}
          className="ls-body text-[11px] font-bold flex items-center gap-1 hover:opacity-70"
          style={{ color: "var(--ls-txt-soft)" }}>
          View all <FaChevronRight className="text-[8px]" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl ls-shimmer" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <FaTag className="text-2xl mx-auto mb-3" style={{ color: "var(--ls-txt-faint)" }} />
          <p className="ls-body text-[12px]" style={{ color: "var(--ls-txt-soft)" }}>No listings yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {liveItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "var(--ls-success)" }}>
                  <span className="h-1.5 w-1.5 rounded-full ls-pulse" style={{ background: "var(--ls-success)" }} />
                  Live in feed
                </span>
                <span className="ls-body text-[10px]" style={{ color: "var(--ls-txt-faint)" }}>{liveItems.length}</span>
              </div>
              <div className="flex flex-col gap-0.5">{liveItems.slice(0, 5).map(renderRow)}</div>
            </div>
          )}

          {boostedItems.length > 0 && (
            <div className="pt-3" style={{ borderTop: "1px solid var(--ls-line)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "var(--ls-primary)" }}>
                  <FaFire className="text-[10px]" />
                  Boosted items
                </span>
                <span className="ls-body text-[10px]" style={{ color: "var(--ls-txt-faint)" }}>{boostedItems.length}</span>
              </div>
              <div className="flex flex-col gap-0.5">{boostedItems.slice(0, 5).map(renderRow)}</div>
            </div>
          )}

          {otherItems.length > 0 && (
            <div className="pt-3" style={{ borderTop: "1px solid var(--ls-line)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "var(--ls-txt-soft)" }}>Other items</span>
                <span className="ls-body text-[10px]" style={{ color: "var(--ls-txt-faint)" }}>{otherItems.length}</span>
              </div>
              <div className="flex flex-col gap-0.5">{otherItems.slice(0, 5).map(renderRow)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DONUT CHART
   ═══════════════════════════════════════════════════════════════ */
const DonutChart = ({ title, total, segments }) => {
  const totalVal = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let acc = 0;
  const radius = 60; const stroke = 18; const circ = 2 * Math.PI * radius;

  return (
    <div className="ls-card p-4 sm:p-5">
      <h3 className="ls-body text-[15px] sm:text-[16px] font-extrabold mb-4" style={{ color: "var(--ls-txt)" }}>{title}</h3>
      <div className="flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--ls-line)" strokeWidth={stroke} />
          {segments.map((seg, i) => {
            const frac = seg.value / totalVal;
            const dash = frac * circ;
            const gap = circ - dash;
            const offset = -acc * circ;
            acc += frac;
            return (
              <circle key={i} cx="80" cy="80" r={radius} fill="none" stroke={seg.color}
                strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
                transform="rotate(-90 80 80)" strokeLinecap="butt" />
            );
          })}
          <text x="80" y="76" textAnchor="middle" className="ls-body" fontSize="9" fontWeight="600" fill="var(--ls-txt-faint)">This Month</text>
          <text x="80" y="94" textAnchor="middle" className="ls-display" fontSize="20" fontWeight="800" fill="var(--ls-txt)">{total}</text>
        </svg>
      </div>
      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: seg.color }} />
            <span className="ls-body text-[11px]" style={{ color: "var(--ls-txt-soft)" }}>{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BAR CHART
   ═══════════════════════════════════════════════════════════════ */
const BarChartCard = ({ title, values, maxY = 30 }) => (
  <div className="ls-card p-4 sm:p-5">
    <h3 className="ls-body text-[15px] sm:text-[16px] font-extrabold mb-4" style={{ color: "var(--ls-txt)" }}>{title}</h3>
    <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full rounded-lg transition-all"
            style={{
              height: `${(v / maxY) * 100}%`,
              background: v > 0 ? "var(--ls-info)" : "var(--ls-line)",
              opacity: v > 0 ? 1 : 0.4,
              minHeight: v > 0 ? 6 : 3,
            }} />
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-2 ls-body text-[10px]" style={{ color: "var(--ls-txt-faint)" }}>
      {[0, 10, 20, 30].map((y) => <span key={y}>{y}</span>)}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CTA CARD
   ═══════════════════════════════════════════════════════════════ */
const CtaCard = ({ icon: Icon, title, body, buttonLabel, onClick, tone = "primary" }) => {
  const tones = {
    primary: { bg: "var(--ls-primary-soft)", fg: "var(--ls-primary)", grad: "linear-gradient(135deg, var(--ls-primary), var(--ls-primary-2))" },
    info:    { bg: "var(--ls-info-soft)",    fg: "var(--ls-info)",    grad: "linear-gradient(135deg, var(--ls-info), #60a5fa)" },
  };
  const t = tones[tone] || tones.primary;
  return (
    <div className="ls-card p-5 sm:p-6 flex flex-col items-center text-center gap-3"
      style={{ background: `linear-gradient(180deg, ${t.bg} 0%, var(--ls-surface) 100%)` }}>
      <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-1"
        style={{ background: t.grad, color: "#fff", boxShadow: "0 12px 24px -12px var(--ls-primary-glow)" }}>
        <Icon className="text-2xl" />
      </div>
      <h3 className="ls-display text-[17px] font-bold leading-snug" style={{ color: "var(--ls-txt)" }}>{title}</h3>
      {body && <p className="ls-body text-[12px] leading-relaxed max-w-[280px]" style={{ color: "var(--ls-txt-soft)" }}>{body}</p>}
      {buttonLabel && (
        <button onClick={onClick}
          className="ls-body mt-2 w-full px-5 py-3 rounded-xl text-[13px] font-bold transition-all hover:brightness-105 active:scale-95"
          style={{ background: "var(--ls-surface)", border: "1px solid var(--ls-line)", color: "var(--ls-txt)" }}>
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TIMELINE STEP
   ═══════════════════════════════════════════════════════════════ */
const TimelineStep = ({ icon: Icon, title, desc, time, state = "done" }) => {
  const colors = {
    done:    { dot: "var(--ls-success)", ring: "var(--ls-success-soft)", icon: "#fff" },
    active:  { dot: "var(--ls-primary)",  ring: "var(--ls-primary-soft)",  icon: "#fff" },
    pending: { dot: "var(--ls-line-str)", ring: "transparent",             icon: "var(--ls-txt-faint)" },
    danger:  { dot: "var(--ls-danger)",   ring: "var(--ls-danger-soft)",   icon: "#fff" },
    info:    { dot: "var(--ls-info)",     ring: "var(--ls-info-soft)",     icon: "#fff" },
  };
  const c = colors[state] || colors.pending;

  return (
    <div className="flex items-start gap-3.5">
      <div className="relative flex-shrink-0">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${state === "active" ? "ls-pulse" : ""}`}
          style={{ background: c.dot, color: c.icon, boxShadow: state !== "pending" ? `0 0 0 5px ${c.ring}` : "none" }}>
          <Icon className="text-[11px]" />
        </div>
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="ls-body text-[13px] font-bold"
            style={{ color: state === "pending" ? "var(--ls-txt-faint)" : "var(--ls-txt)" }}>{title}</p>
          {time && <span className="ls-body text-[10.5px]" style={{ color: "var(--ls-txt-faint)" }}>{time}</span>}
        </div>
        {desc && <p className="ls-body text-[11.5px] mt-1 leading-relaxed" style={{ color: "var(--ls-txt-soft)" }}>{desc}</p>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ NEW HEADER — clean, modern status strip
   ═══════════════════════════════════════════════════════════════ */
const StatusHeader = ({
  listing,
  status,
  meta,
  StatusIcon,
  listingIsBoosted,
  isOwner,
  onEdit,
  onShare,
  onCopy,
  onDelete,
  copied,
  deleting,
}) => {
  const tone = meta.tone;
  const toneFg =
    tone === "success" ? "var(--ls-success)" :
    tone === "warning" ? "var(--ls-warning)" :
    tone === "danger"  ? "var(--ls-danger)"  : "var(--ls-primary)";
  const toneBg =
    tone === "success" ? "var(--ls-success-soft)" :
    tone === "warning" ? "var(--ls-warning-soft)" :
    tone === "danger"  ? "var(--ls-danger-soft)"  : "var(--ls-primary-soft)";

  return (
    <div
      className="ls-card relative overflow-hidden"
      style={{ padding: "18px 20px" }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${toneFg}, transparent 70%)`,
        }}
      />

      {/* ═══ Top row: status pill · live/boost dots · actions ═══ */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        {/* Left: status badge + live/boost mini-pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={status} />
          {listingIsBoosted && <BoostBadge />}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isOwner && (
            <button
              type="button"
              onClick={onEdit}
              className="ls-body inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                color: "#FFFFFF",
                boxShadow: "0 8px 18px -10px var(--ls-primary-glow)",
              }}
            >
              <FaEdit className="text-[10px]" />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={onShare}
            className="ls-body inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold text-white transition-colors"
            style={{ background: "#25D366" }}
          >
            <FaWhatsapp className="text-[11px]" />
            Share
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="ls-body inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-bold transition-colors"
            style={{
              background: "var(--ls-surface-2)",
              color: "var(--ls-txt)",
              border: "1px solid var(--ls-line)",
            }}
          >
            {copied ? <><FaCheck className="text-[9px]" /> Copied</> : <><FaCopy className="text-[9px]" /> Copy</>}
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete listing"
              className="ls-body inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors disabled:opacity-50"
              style={{
                background: "var(--ls-danger-soft)",
                color: "var(--ls-danger)",
                border: "1px solid var(--ls-danger)",
              }}
            >
              {deleting
                ? <FaSpinner className="animate-spin text-[10px]" />
                : <FaTrash className="text-[10px]" />}
            </button>
          )}
        </div>
      </div>

      {/* ═══ Main content row: icon · title + desc ═══ */}
      <div className="flex items-start gap-3.5">
        <div
          className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${status === "pending" ? "ls-pulse" : ""}`}
          style={{ background: toneBg, color: toneFg }}
        >
          <StatusIcon className="text-lg sm:text-xl" />
        </div>

        <div className="min-w-0 flex-1">
          <h1
            className="ls-display leading-tight mb-1"
            style={{
              color: "var(--ls-txt)",
              fontSize: "clamp(17px, 2.2vw, 22px)",
              fontWeight: 700,
            }}
          >
            {meta.label}
          </h1>
          <p
            className="ls-body leading-relaxed"
            style={{
              color: "var(--ls-txt-soft)",
              fontSize: "clamp(12px, 1.4vw, 13px)",
            }}
          >
            {meta.desc}
          </p>

          {/* ⭐ Inline status strip */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {/* Live indicator */}
            <span
              className="ls-body inline-flex items-center gap-1.5 text-[10.5px] font-bold"
              style={{ color: status === "active" ? "var(--ls-success)" : "var(--ls-txt-faint)" }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "ls-pulse" : ""}`}
                style={{
                  background: status === "active" ? "var(--ls-success)" : "var(--ls-txt-faint)",
                }}
              />
              {status === "active" ? "Live on feed" : "Not visible"}
            </span>

            <span className="h-3 w-px" style={{ background: "var(--ls-line)" }} aria-hidden="true" />

            {/* Boost indicator */}
            <span
              className="ls-body inline-flex items-center gap-1.5 text-[10.5px] font-bold"
              style={{ color: listingIsBoosted ? "var(--ls-primary)" : "var(--ls-txt-faint)" }}
            >
              <FaBolt className="text-[9px]" />
              {listingIsBoosted ? "Boost active" : "Not boosted"}
            </span>

            <span className="h-3 w-px hidden sm:block" style={{ background: "var(--ls-line)" }} aria-hidden="true" />

            {/* Time */}
            <span className="ls-body inline-flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: "var(--ls-txt-faint)" }}>
              <FaRegClock className="text-[9px]" />
              Updated {timeAgo(listing.updated_at || listing.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
const ListingStatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
        if (cancelled) return;
        if (error || !data) { setNotFound(true); setListing(null); }
        else setListing(data);
      } catch (err) {
        console.error("Listing fetch error:", err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setAllListings([]); setLoadingAll(false); return; }
      setLoadingAll(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) setAllListings(data || []);
      } catch (err) {
        console.error("All listings fetch error:", err);
        if (!cancelled) setAllListings([]);
      } finally {
        if (!cancelled) setLoadingAll(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const isOwner = !!(user && listing && listing.user_id === user.id);
  const status = normalizeStatus(listing?.status);
  const meta = STATUS_META[status] || STATUS_META.pending;
  const StatusIcon = meta.icon;
  const listingIsBoosted = isBoosted(listing);

  const totals = useMemo(() => {
    const base = allListings.length > 0 ? allListings : (listing ? [listing] : []);
    return {
      views:      base.reduce((s, l) => s + (Number(l.views) || 0), 0),
      chats:      base.reduce((s, l) => s + (Number(l.chats_count) || 0), 0),
      favourites: base.reduce((s, l) => s + (Number(l.favorites_count) || 0), 0),
      items:      base.length,
      liveItems:  base.filter((l) => isLive(l)).length,
      boostedItems: base.filter((l) => isBoosted(l)).length,
    };
  }, [allListings, listing]);

  const timeline = useMemo(() => {
    if (!listing) return [];
    const steps = [];
    steps.push({
      key: "posted", icon: FaCheck, title: "Ad submitted",
      desc: "We received your listing and payment info.",
      time: timeAgo(listing.created_at || listing.posted_at),
      state: "done",
    });
    if (listingIsBoosted) {
      steps.push({
        key: "boosted", icon: FaBolt, title: "Boost active",
        desc: "Your listing is pinned to the top of its category for maximum visibility.",
        time: timeAgo(listing.boost_until || listing.updated_at),
        state: "active",
      });
    }
    if (status === "pending") {
      steps.push({ key: "review", icon: FaHourglassHalf, title: "Under review",
        desc: "Our team is checking photos, description, and category.",
        time: "usually under 1 hour", state: "active" });
      steps.push({ key: "publish", icon: FaCheckCircle, title: "Go live",
        desc: "Once approved, your ad will appear on the marketplace.", state: "pending" });
    } else if (status === "active" || status === "sold") {
      steps.push({ key: "review", icon: FaCheck, title: "Approved",
        desc: "Your listing passed our review.",
        time: timeAgo(listing.updated_at || listing.created_at), state: "done" });
      steps.push({ key: "publish", icon: FaCheckCircle, title: "Live on marketplace",
        desc: "Buyers can find it in search and categories.",
        time: timeAgo(listing.updated_at || listing.created_at), state: "done" });
      if (status === "sold") {
        steps.push({ key: "sold", icon: FaBoxOpen, title: "Marked as sold",
          desc: "Congratulations on the sale! 🎉",
          time: timeAgo(listing.updated_at), state: "done" });
      }
    } else if (status === "rejected") {
      steps.push({ key: "review", icon: FaBan, title: "Rejected",
        desc: listing.rejection_reason || "Please review our guidelines and resubmit.",
        time: timeAgo(listing.updated_at), state: "danger" });
      steps.push({ key: "resubmit", icon: FaEdit, title: "Edit and resubmit",
        desc: "Fix the issues above, then submit again.", state: "pending" });
    } else if (status === "paused") {
      steps.push({ key: "paused", icon: FaBan, title: "Paused by you",
        desc: "Re-activate to make it visible to buyers again.", state: "info" });
    }
    return steps;
  }, [listing, status, listingIsBoosted]);

  const chartData = useMemo(() => {
    const seedSource = listing?.id || user?.id || "x";
    const seed = String(seedSource).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const views = totals.views || 1;
    const sparkPoints = Array.from({ length: 30 }, (_, i) => {
      const base = 40 + views / 10;
      return Math.max(1, Math.round(base + Math.sin(seed + i * 0.42) * 25 + i * 0.8));
    });
    const barValues = Array.from({ length: 12 }, (_, i) => {
      return Math.max(2, Math.round(5 + Math.abs(Math.sin(seed + i * 0.7)) * 22));
    });
    const chats = totals.chats || 0;
    const favs = totals.favourites || 0;
    const other = Math.max(0, views - chats - favs);
    const donutSegments = [
      { label: "Views",      value: Math.max(views, 1),  color: "var(--ls-info)" },
      { label: "Chats",      value: Math.max(chats, 1),  color: "var(--ls-purple)" },
      { label: "Favourites", value: Math.max(favs, 1),   color: "var(--ls-pink)" },
      ...(other > 0 ? [{ label: "Other", value: other, color: "var(--ls-success)" }] : []),
    ];
    return { sparkPoints, barValues, donutSegments };
  }, [listing, totals, user?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out my listing on Dealora: ${listing?.title || "New item"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " — " + url)}`, "_blank");
  };

  const handleDelete = async () => {
    if (!isOwner || !listing) return;
    if (!window.confirm("Delete this listing permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("listings").delete().eq("id", listing.id).eq("user_id", user.id);
      if (error) throw error;
      navigate("/post-ad");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete listing");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ls-bg">
      <StatusStyles />
      <div className="ls-shell">
        <div className="ls-inner">

          <button onClick={() => navigate(-1)}
            className="ls-body inline-flex items-center gap-2 text-[12px] font-bold mb-4 sm:mb-6 hover:opacity-70 transition-opacity"
            style={{ color: "var(--ls-txt-soft)" }}>
            <FaChevronLeft className="text-[10px]" /> Back
          </button>

          {loading && (
            <div className="space-y-4">
              <div className="ls-stats">
                {[0, 1, 2, 3].map((i) => <div key={i} className="ls-card h-32 ls-shimmer" />)}
              </div>
              <div className="ls-card h-64 ls-shimmer" />
            </div>
          )}

          {!loading && notFound && (
            <div className="ls-card p-6 sm:p-8 text-center">
              <div className="h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--ls-danger-soft)", color: "var(--ls-danger)" }}>
                <FaExclamationTriangle className="text-2xl" />
              </div>
              <h1 className="ls-display text-xl font-bold mb-2" style={{ color: "var(--ls-txt)" }}>Listing not found</h1>
              <p className="ls-body text-sm mb-5" style={{ color: "var(--ls-txt-soft)" }}>
                The listing may have been removed or the link is incorrect.
              </p>
              <Link to="/" className="ls-body inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)" }}>
                Go to homepage <FaArrowRight className="text-xs" />
              </Link>
            </div>
          )}

          {!loading && listing && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 sm:space-y-5">

                {/* ⭐ NEW HEADER */}
                <StatusHeader
                  listing={listing}
                  status={status}
                  meta={meta}
                  StatusIcon={StatusIcon}
                  listingIsBoosted={listingIsBoosted}
                  isOwner={isOwner}
                  onEdit={() => navigate(`/post-ad?edit=${listing.id}`)}
                  onShare={handleShareWhatsApp}
                  onCopy={handleCopyLink}
                  onDelete={handleDelete}
                  copied={copied}
                  deleting={deleting}
                />

                {/* STAT CARDS */}
                <div className="ls-stats">
                  <DashStatCard icon={FaEye} label="Total Views" value={totals.views.toLocaleString()} tone="cyan" />
                  <DashStatCard icon={FaCheckCircle} label="Live Items" value={totals.liveItems.toLocaleString()}
                    tone="success" hint={`of ${totals.items} total`} />
                  <DashStatCard icon={FaBolt} label="Boosted Items" value={totals.boostedItems.toLocaleString()}
                    tone="primary" hint={totals.boostedItems > 0 ? "Active boost" : "None yet"} />
                  <DashStatCard icon={FaUser} label="Total Items" value={totals.items.toLocaleString()} tone="purple" />
                </div>

                {/* SPARKLINE + YOUR ITEMS */}
                <div className="ls-row-2">
                  <SparklineCard
                    title="Views over time"
                    subtitle="Aggregated across all your listings"
                    points={chartData.sparkPoints}
                    color="#3b82f6"
                    tooltipText={`${totals.views.toLocaleString()} views`}
                  />
                  <ItemListCard
                    allListings={allListings}
                    currentListing={listing}
                    loading={loadingAll}
                  />
                </div>

                {/* DONUT + BAR + CTA */}
                <div className="ls-row-3">
                  <DonutChart title="Impressions" total={totals.views.toLocaleString()} segments={chartData.donutSegments} />
                  <BarChartCard title="Active buyers right now" values={chartData.barValues} maxY={30} />
                  {listingIsBoosted ? (
                    <CtaCard icon={FaBolt} title="Your boost is active 🚀"
                      body="Buyers see this listing at the top of its category. Boost again to extend visibility."
                      buttonLabel="Extend boost"
                      onClick={() => navigate(`/checkout?boost=${listing.id}&days=14&amount=350`)}
                      tone="primary" />
                  ) : (status === "pending" || status === "active") && isOwner ? (
                    <CtaCard icon={FaRocket} title="Get 5× more views with Boost"
                      body="Pin your ad to the top of the category. Avg. boosters see 5–10× more clicks in 24 hours."
                      buttonLabel="Boost this listing"
                      onClick={() => navigate(`/checkout?boost=${listing.id}`)}
                      tone="primary" />
                  ) : (
                    <CtaCard icon={FaChartLine} title="Improve your reach"
                      body="Share this listing to WhatsApp groups, or add more photos to get more views."
                      buttonLabel="Edit listing"
                      onClick={() => navigate(`/post-ad?edit=${listing.id}`)}
                      tone="info" />
                  )}
                </div>

                {/* TIMELINE */}
                <div className="ls-card p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <FaInfoCircle className="text-sm" style={{ color: "var(--ls-primary)" }} />
                    <h2 className="ls-display text-base sm:text-lg font-bold" style={{ color: "var(--ls-txt)" }}>
                      What's happening
                    </h2>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px" style={{ background: "var(--ls-line)" }} aria-hidden="true" />
                    <div className="relative space-y-1">
                      {timeline.map((step) => <TimelineStep key={step.key} {...step} />)}
                    </div>
                  </div>
                </div>

                {/* LISTING PREVIEW */}
                <div className="ls-card overflow-hidden">
                  <div className="ls-preview">
                    {listing.cover_image && (
                      <img src={listing.cover_image} alt={listing.title} className="ls-preview-img"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    )}
                    <div className="flex-1 p-4 sm:p-6 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <p className="ls-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ls-primary)" }}>
                          {listing.category || "Listing"}
                        </p>
                        {listingIsBoosted && <BoostBadge />}
                      </div>
                      <h3 className="ls-display text-base sm:text-xl font-bold leading-tight mb-2 line-clamp-2" style={{ color: "var(--ls-txt)" }}>
                        {listing.title || "Untitled"}
                      </h3>
                      <p className="ls-display text-xl sm:text-2xl font-bold mb-3" style={{ color: "var(--ls-primary)" }}>
                        {formatPrice(listing.price)}
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 ls-body text-[11.5px] sm:text-[12px]" style={{ color: "var(--ls-txt-soft)" }}>
                        {listing.city && (
                          <span className="inline-flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-[10px]" />
                            {listing.area ? `${listing.area}, ` : ""}{listing.city}
                          </span>
                        )}
                        {listing.condition && (
                          <span className="inline-flex items-center gap-1.5">
                            <FaTag className="text-[10px]" />{listing.condition}
                          </span>
                        )}
                      </div>
                      <button onClick={() => navigate(`/${categoryPath(listing.category)}/${listing.id}`)}
                        className="ls-body mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold"
                        style={{ background: "var(--ls-surface-2)", border: "1px solid var(--ls-line)", color: "var(--ls-txt)" }}>
                        Open full listing <FaArrowRight className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                </div>

                {status === "rejected" && listing.rejection_reason && (
                  <div className="ls-card p-4 sm:p-5"
                    style={{ borderColor: "var(--ls-danger)", background: "var(--ls-danger-soft)" }}>
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-sm mt-0.5 flex-shrink-0" style={{ color: "var(--ls-danger)" }} />
                      <div className="min-w-0">
                        <p className="ls-body text-[12px] font-bold mb-1" style={{ color: "var(--ls-danger)" }}>
                          Why it was rejected
                        </p>
                        <p className="ls-body text-[12px] leading-relaxed" style={{ color: "var(--ls-txt-soft)" }}>
                          {listing.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="ls-body text-center text-[10.5px] pt-2 px-4 break-all" style={{ color: "var(--ls-txt-faint)" }}>
                  Listing ID: <span className="font-mono">{String(id).slice(0, 12)}…</span> · Last updated {timeAgo(listing.updated_at || listing.created_at)}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingStatusPage;