// pages/VehicleDetail.jsx — Alibaba-style property detail (full)
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  FaArrowLeft, FaMapMarkerAlt, FaHeart, FaRegHeart, FaShare,
  FaCheckCircle, FaWhatsapp, FaSpinner, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight, FaExpand, FaTimes, FaFlag,
  FaCheck, FaTag, FaCity, FaStar, FaRegStar, FaFileContract,
  FaExclamationCircle, FaUserShield, FaEdit, FaEllipsisH,
  FaUndo, FaStore, FaMapPin, FaMagic, FaComment, FaUserPlus,
  FaUserCheck, FaInfoCircle, FaLock,
  FaHome, FaBuilding, FaBed, FaBath, FaRulerCombined, FaCouch,FaShieldAlt,
  FaFileSignature, FaHandshake, FaKey, FaClipboardCheck, FaPercentage,
  FaGavel, FaMoneyCheckAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { SellerAvatar, PlanLabel } from "../components/SellerAvatar";

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .font-ticket-display { font-family: 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; font-weight: 700; }
    .font-ticket-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    html, body { overflow-x: hidden; max-width: 100vw; }

    .theme-light {
      --nav-bg: #FFFFFF; --nav-panel: #FFFFFF; --nav-panel-2: #F7F7F8;
      --nav-surface: #FAFAFB; --nav-surface-2: #F5F5F7;
      --nav-line: #EEEEF1; --nav-line-str: #E3E3E8;
      --nav-txt: #1A1A1A; --nav-txt-soft: #666666; --nav-txt-faint: #999999;
      --nav-primary: #C8531B; --nav-primary-2: #E86A22; --nav-primary-3: #C8531B;
      --nav-primary-soft: #FFF2EA; --nav-primary-glow: rgba(232,106,34,0.35);
      --nav-orange: #E86A22; --nav-orange-2: #D44A00;
      --nav-star: #FF8800;
      --nav-danger: #B23A2E; --nav-danger-soft: #FDECEA;
      --nav-green: #16A34A; --nav-green-soft: #ECFDF5;
      --nav-green-border: #BBF7D0; --nav-green-bg: #F0FDF4;
    }
    .theme-dark {
      --nav-bg: #0A0A12; --nav-panel: #16161F; --nav-panel-2: #1C1C28;
      --nav-surface: #1F1F2A; --nav-surface-2: #262633;
      --nav-line: rgba(255,255,255,0.08); --nav-line-str: rgba(255,255,255,0.15);
      --nav-txt: #FFFFFF; --nav-txt-soft: rgba(255,255,255,0.65); --nav-txt-faint: rgba(255,255,255,0.45);
      --nav-primary: #eb7d34; --nav-primary-2: #f59e0b; --nav-primary-3: #c8631f;
      --nav-primary-soft: rgba(235,125,52,0.14); --nav-primary-glow: rgba(235,125,52,0.45);
      --nav-orange: #eb7d34; --nav-orange-2: #d76a20;
      --nav-star: #FFB800;
      --nav-danger: #EF4444; --nav-danger-soft: rgba(239,68,68,0.14);
      --nav-green: #34D399; --nav-green-soft: rgba(52,211,153,0.14);
      --nav-green-border: rgba(52,211,153,0.3); --nav-green-bg: rgba(52,211,153,0.08);
    }

    .pd-page { background: var(--nav-bg); color: var(--nav-txt); transition: background 0.35s ease, color 0.35s ease; }
    .pd-surface { background: var(--nav-panel); border: 1px solid var(--nav-line); }
    .pd-surface-2 { background: var(--nav-panel-2); border: 1px solid var(--nav-line); }
    .pd-txt { color: var(--nav-txt); }
    .pd-txt-soft { color: var(--nav-txt-soft); }
    .pd-txt-faint { color: var(--nav-txt-faint); }

    .pd-btn-orange {
      background: linear-gradient(135deg, #FF6A00 0%, #E85D04 100%);
      color: #FFFFFF; font-weight: 700; transition: all 0.2s ease;
    }
    .pd-btn-orange:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 10px 24px -8px rgba(232,93,4,0.5); }

    .pd-btn-outline {
      border: 1.5px solid var(--nav-line-str); color: var(--nav-txt);
      background: transparent; transition: all 0.2s ease;
    }
    .pd-btn-outline:hover { border-color: var(--nav-orange); color: var(--nav-orange); }

    .pd-btn-danger-outline {
      border: 1px solid var(--nav-danger); color: var(--nav-danger); background: var(--nav-danger-soft);
    }

    .pd-attr-chip {
      display: inline-flex; align-items: center; padding: 7px 16px;
      border-radius: 6px; border: 1px solid var(--nav-line-str);
      background: var(--nav-panel); color: var(--nav-txt);
      font-size: 13px; font-weight: 500;
    }
    .theme-light .pd-attr-chip { background: #F5F5F7; }

    /* ⭐ SPEC TABLE — matches screenshot */
    .pd-spec-table { width: 100%; border-collapse: collapse; }
    .pd-spec-table tr { border-bottom: 1px solid var(--nav-line); }
    .pd-spec-table tr:last-child { border-bottom: none; }
    .pd-spec-table tr:nth-child(odd)  { background: var(--nav-surface); }
    .pd-spec-table tr:nth-child(even) { background: var(--nav-panel); }
    .pd-spec-table td {
      padding: 16px 20px; font-family: 'Inter', system-ui, sans-serif;
      font-size: 13.5px; vertical-align: middle; line-height: 1.5;
    }
    .pd-spec-table td.pd-spec-key {
      width: 40%; color: var(--nav-txt-soft); font-weight: 400;
    }
    .pd-spec-table td.pd-spec-val {
      width: 60%; color: var(--nav-txt); font-weight: 500;
    }

    /* Yes pill (green outline) — matches screenshot */
    .pd-yes-pill {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 10px; border-radius: 999px;
      border: 1px solid #16A34A; background: transparent;
      color: #16A34A; font-size: 12px; font-weight: 600; line-height: 1.4;
    }

    /* ── Property Images gallery (matches screenshot 3-col grid) ── */
    .pd-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 640px) { .pd-gallery { grid-template-columns: 1fr; } }
    .pd-gallery__item {
      aspect-ratio: 4 / 3; overflow: hidden;
      border-radius: 12px; border: 1px solid var(--nav-line);
      background: var(--nav-surface); cursor: zoom-in;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .pd-gallery__item:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -14px rgba(0,0,0,0.25); }
    .pd-gallery__item img { width: 100%; height: 100%; object-fit: cover; }

    /* ── Property Policies cards ── */
    .pp-card {
      background: var(--nav-panel-2);
      border: 1px solid var(--nav-line);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex; gap: 12px; align-items: flex-start;
    }
    .pp-icon {
      width: 34px; height: 34px; flex-shrink: 0;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 8px;
      background: #FFF1E6; color: #E86A22; font-size: 14px;
    }
    .theme-dark .pp-icon { background: rgba(235,125,52,0.14); }

    /* ── Quick Safety Tips ── */
    .qs-wrap {
      background: var(--nav-green-bg);
      border: 1px solid var(--nav-green-border);
      border-radius: 16px;
      padding: 20px 22px;
    }
    .qs-pill {
      background: var(--nav-panel);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex; align-items: center; gap: 12px;
    }
    .qs-check {
      width: 22px; height: 22px; flex-shrink: 0;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 999px;
      background: #DCFCE7; color: #16A34A; font-size: 10px;
    }
    .theme-dark .qs-check { background: rgba(52,211,153,0.15); color: #34D399; }

    /* Markdown-rendered description */
    .pd-md h3.md-h { font-size: 15px; font-weight: 700; margin: 18px 0 8px; color: var(--nav-txt); }
    .pd-md p.md-p { font-size: 13.5px; line-height: 1.75; color: var(--nav-txt-soft); margin: 0 0 12px; }
    .pd-md ul.md-ul { margin: 0 0 14px; padding-left: 4px; list-style: none; }
    .pd-md ul.md-ul li {
      font-size: 13.5px; line-height: 1.9; color: var(--nav-txt-soft);
      position: relative; padding-left: 14px;
    }
    .pd-md ul.md-ul li::before {
      content: "*"; position: absolute; left: 0; color: var(--nav-txt-soft);
    }
    .pd-md strong { color: var(--nav-txt); font-weight: 700; }

    @keyframes pdShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .pd-shimmer {
      background: linear-gradient(90deg, var(--nav-surface-2) 0%, var(--nav-surface) 50%, var(--nav-surface-2) 100%);
      background-size: 200% 100%; animation: pdShimmer 1.6s ease-in-out infinite;
      border-radius: 6px;
    }

    @keyframes navEditShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .nav-edit-entry {
      position: relative; background: #FFF2EA;
      border: 1px solid rgba(235,125,52,0.35);
      overflow: hidden; transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .theme-dark .nav-edit-entry { background: rgba(235,125,52,0.14); }
    .nav-edit-entry::before {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.22) 55%, transparent 100%);
      background-size: 200% 100%;
      animation: navEditShimmer 3.6s linear infinite; pointer-events: none;
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
  const LAKH = 100000, CRORE = 10000000, ARAB = 1000000000, KHARAB = 100000000000;
  const fmt = (value, unit) => {
    const rounded = Math.round(value * 100) / 100;
    const str = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, "");
    return { short: str, unit };
  };
  if (n >= KHARAB) return { ...fmt(n / KHARAB, "Kharab"), long: n.toLocaleString("en-US") };
  if (n >= ARAB)   return { ...fmt(n / ARAB,   "Arab"),   long: n.toLocaleString("en-US") };
  if (n >= CRORE)  return { ...fmt(n / CRORE,  "Crore"),  long: n.toLocaleString("en-US") };
  if (n >= LAKH)   return { ...fmt(n / LAKH,   "Lakh"),   long: n.toLocaleString("en-US") };
  return { short: n.toLocaleString("en-US"), long: n.toLocaleString("en-US"), unit: "" };
};

/* ── Edit-image entry ── */
const EditImageEntry = ({ onClick, imageUrl, returnTo, label = "Edit image with AI", navigate }) => {
  const handleClick = () => {
    if (typeof onClick === "function") { onClick(); return; }
    if (typeof navigate === "function") {
      navigate("/ai-image", { state: { imageUrl, originalImageUrl: imageUrl, returnTo: returnTo || "/", source: "vehicle-detail" } });
    } else { window.location.href = "/ai-image"; }
  };
  return (
    <button type="button" onClick={handleClick}
      className="nav-edit-entry group inline-flex items-center justify-center gap-2 rounded-lg font-ticket-body font-semibold px-4 py-2.5 text-[12.5px] w-full"
      style={{ color: "var(--nav-primary)" }}>
      <FaMagic className="text-[12px] relative z-10" />
      <span className="relative z-10 whitespace-nowrap">{label}</span>
      <span className="nav-edit-badge flex-shrink-0 inline-flex items-center justify-center h-4 px-1.5 rounded text-[8px] font-black text-white relative z-10">AI</span>
    </button>
  );
};

/* ─── Default fallback (properties) ─── */
const DEFAULT_VEHICLES = [
  { id: "default-1", category: "House", title: "3 Marla Brand New House", location: "Al Kabir Town Phase 2, Lahore", price: 13999982, image: "/vichale/car1.png", verified: true, featured: true, status: "active", postedAgo: "2d ago", description: "Brand new 3 Marla house for sale in Al Kabir Town Phase 2 Lahore." },
  { id: "default-2", category: "House", title: "5 Marla Modern House", location: "DHA Phase 6, Lahore", price: 21500000, image: "/vichale/car2.png", verified: true, featured: false, status: "active", postedAgo: "5 hours ago", description: "Elegant 5 Marla house in prime location." },
  { id: "default-3", category: "Flat", title: "2 Bed Luxury Flat", location: "Gulshan-e-Iqbal, Karachi", price: 12500000, image: "/vichale/car3.png", verified: true, featured: true, status: "active", postedAgo: "1 day ago", description: "Luxurious 2 bed flat with modern amenities." },
  { id: "default-4", category: "Plot", title: "10 Marla Residential Plot", location: "F-10, Islamabad", price: 35000000, image: "/vichale/car4.png", verified: false, featured: false, status: "active", postedAgo: "2 days ago", description: "Prime location residential plot ready for construction." },
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
   SPEC DISPLAY — exact order from screenshot
   ═══════════════════════════════════════════════════════════════ */
const SPEC_ROWS = [
  { key: "propertyType",    label: "Property Type" },
  { key: "purpose",         label: "Purpose" },
  { key: "subType",         label: "Sub-Type" },
  { key: "titleType",       label: "Title Type" },
  { key: "society",         label: "Society / Authority" },
  { key: "plotNo",          label: "Plot / House No." },
  { key: "area",            label: "Area" },
  { key: "areaUnit",        label: "Area Unit" },
  { key: "bedrooms",        label: "Bedrooms" },
  { key: "floors",          label: "Floors" },
  { key: "kitchens",        label: "Kitchens" },
  { key: "servantQuarters", label: "Servant Quarters", isBool: true },
  { key: "facing",          label: "Facing" },
  { key: "parkingSpaces",   label: "Parking Spaces" },
  { key: "furnishing",      label: "Furnishing" },
  { key: "documentsAvailable", label: "Documents Available" },
  { key: "loanFree",        label: "Loan / Mortgage Free", isBool: true },
  { key: "disputeFree",     label: "Dispute Free", isBool: true },
  { key: "possession",      label: "Possession" },
  { key: "priceNegotiable", label: "Price Negotiable", isBool: true },
];

const YesPill = () => (
  <span className="pd-yes-pill">
    <FaCheck className="text-[9px]" /> Yes
  </span>
);

/* Render a markdown-ish string (## headings, ** bold, * bullets) */
const MarkdownBlock = ({ text }) => {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/);
  const out = [];
  let i = 0;
  let listBuf = [];

  const flushList = () => {
    if (listBuf.length) {
      out.push(
        <ul key={`ul-${i}-${out.length}`} className="md-ul">
          {listBuf.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: boldify(item) }} />
          ))}
        </ul>
      );
      listBuf = [];
    }
  };

  const boldify = (s) => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); return; }
    if (line.startsWith("## ")) {
      flushList();
      out.push(<h3 key={`h-${idx}`} className="md-h">{line.slice(3)}</h3>);
    } else if (line.startsWith("* ")) {
      listBuf.push(line.slice(2));
    } else {
      flushList();
      out.push(<p key={`p-${idx}`} className="md-p" dangerouslySetInnerHTML={{ __html: boldify(line) }} />);
    }
  });
  flushList();
  return <div className="pd-md">{out}</div>;
};

/* ═══════════════════════════════════════════════════════════════
   PROPERTY POLICIES DATA (6 cards, 2 rows × 3 cols)
   ═══════════════════════════════════════════════════════════════ */
const PROPERTY_POLICIES = [
  { icon: FaFileContract,     title: "Ownership Verification", desc: "Ask for original Registry / Fard / Allotment letter. Verify with the housing authority." },
  { icon: FaGavel,            title: "Legal Due Diligence",    desc: "Hire an independent lawyer to check disputes, stays, loans, and mortgages." },
  { icon: FaMoneyCheckAlt,    title: "Payment Terms",          desc: "Pay only via bank draft / pay order / verified transfer. Never hand cash to a middleman." },
  { icon: FaFileSignature,    title: "Sale Agreement",         desc: "Get a written sale agreement signed before 2 witnesses with all key clauses." },
  { icon: FaClipboardCheck,   title: "Possession & NOC",       desc: "Confirm vacant possession on the agreed date. Obtain NOC before transfer." },
  { icon: FaPercentage,       title: "Taxes & Transfer Fees",  desc: "Budget 3–7% for stamp duty, CVT, registration, and society transfer fees." },
];

/* ═══════════════════════════════════════════════════════════════
   QUICK SAFETY TIPS DATA
   ═══════════════════════════════════════════════════════════════ */
const QUICK_SAFETY_TIPS = [
  "Visit the property in person before any payment",
  "Verify ownership documents (Registry, Fard, NOC)",
  "Confirm the property is free of disputes and loans",
  "Involve a trusted lawyer before signing anything",
];

/* ═══════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════ */
const Toast = ({ toast, onDismiss, duration = 2600 }) => {
  const isError = toast?.type === "error";
  const isInfo = toast?.type === "info";
  return (
    <AnimatePresence>
      {toast && (
        <motion.div key={toast.id}
          initial={{ opacity: 0, x: 28, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          onClick={onDismiss}
          className="fixed top-20 right-4 z-[200] cursor-pointer select-none max-w-[calc(100vw-2rem)]">
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
              style={{ transformOrigin: "left", height: 2, background: isError ? "var(--nav-danger)" : "linear-gradient(90deg, var(--nav-primary), var(--nav-primary-3))" }} />
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
            {star <= fullStars ? <FaStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />
              : star === fullStars + 1 && hasHalf ? (
                <span className="relative">
                  <FaRegStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />
                  <span className="absolute inset-0 overflow-hidden w-1/2">
                    <FaStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />
                  </span>
                </span>
              ) : <FaRegStar className={sizes[size]} style={{ color: "var(--nav-star)" }} />}
          </span>
        ))}
      </div>
      {showValue && (
        <span className="font-ticket-body text-[11.5px] font-semibold ml-1 pd-txt">
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
    const el = document.documentElement, body = document.body;
    if (el.classList.contains("theme-light") || body.classList.contains("theme-light")) setThemeClass("theme-light");
    else if (el.classList.contains("theme-dark") || body.classList.contains("theme-dark")) setThemeClass("theme-dark");
    else setThemeClass(window.matchMedia?.("(prefers-color-scheme: light)").matches ? "theme-light" : "theme-dark");
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
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} />
          <motion.div key="rating-panel" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }} onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", zIndex: 1, width: "min(420px, calc(100vw - 2rem))", maxHeight: "90vh", overflowY: "auto",
              background: "var(--nav-panel)", border: "1px solid var(--nav-line)", borderRadius: "16px", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--nav-primary-soft)" }}>
                    <FaStar className="text-sm" style={{ color: "var(--nav-primary-2)" }} />
                  </div>
                  <div>
                    <h3 className="font-ticket-display text-lg font-bold pd-txt">Rate Seller</h3>
                    <p className="font-ticket-body text-[11px] pd-txt-soft">{sellerName}</p>
                  </div>
                </div>
                <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center pd-txt-soft">
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
              <p className="text-center font-ticket-body text-xs mb-5 pd-txt-soft">
                {rating === 0 ? "Tap to rate" : rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent!"}
              </p>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience (optional)" rows={3}
                className="font-ticket-body w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4 pd-surface-2 pd-txt" />
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
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const VehicleDetail = () => {
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [sellerStats, setSellerStats] = useState({
    listings: 0, followers: 0, rating: 0, ratingCount: 0, isFollowing: false, userRating: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const pushToast = (type, title, message) => {
    const toastId = Date.now() + Math.random();
    setToast({ id: toastId, type, title, message });
    setTimeout(() => setToast(null), 2600);
  };

  const isSold = (listing?.status || "").toLowerCase() === "sold";
  const isOwner = useMemo(() => {
    if (!user || !listing) return false;
    return !!listing.user_id && listing.user_id === user.id;
  }, [user, listing]);

  useEffect(() => {
    const editedUrl = location.state?.editedImageUrl;
    const originalUrl = location.state?.originalImageUrl;
    if (editedUrl && listing) {
      setListing((prev) => {
        if (!prev) return prev;
        const currentIdx = originalUrl ? prev.images.findIndex((img) => img === originalUrl) : -1;
        const nextImages = [...prev.images];
        if (currentIdx >= 0) { nextImages[currentIdx] = editedUrl; setActiveImage(currentIdx); }
        else { nextImages[activeImage] = editedUrl; }
        return { ...prev, images: nextImages };
      });
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true); setError(null);
      if (String(id).startsWith("default-")) {
        const local = DEFAULT_VEHICLES.find((v) => v.id === id);
        if (local) {
          setListing({
            ...local, images: [local.image, local.image, local.image],
            specs: {
              propertyType: "House", purpose: "For Sale", subType: "Residential",
              titleType: "Leasehold", society: "DHA", plotNo: "8", area: "3", areaUnit: "Marla",
              bedrooms: "5", floors: "Ground + 2", kitchens: "3+", servantQuarters: "Yes",
              facing: "South", parkingSpaces: "2", furnishing: "Unfurnished",
              documentsAvailable: "Registry, Allotment Letter, Transfer Letter",
              loanFree: "Yes", disputeFree: "Yes", possession: "Immediate", priceNegotiable: "Yes",
            },
            user_id: null, posted_at: null,
          });
          setIsLoading(false); return;
        }
      }
      try {
        const { data, error: fetchErr } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!data) { setError("Listing not found"); return; }
        let images = [];
        if (data.images && Array.isArray(data.images) && data.images.length > 0) images = data.images;
        else if (data.cover_image) images = [data.cover_image];
        else images = ["/vichale/car1.png"];
        setListing({
          ...data, images,
          image: data.cover_image || images[0],
          category: data.subcategory || "House",
          location: data.area ? `${data.area}, ${data.city}` : data.city || "—",
          postedAgo: timeAgo(data.posted_at),
          specs: data.specs || {},
        });
        if (data.user_id) {
          const { data: settings } = await supabase.from("user_settings")
            .select("full_name, avatar, email, phone, plan_id, verified").eq("user_id", data.user_id).maybeSingle();
          const { data: userRow } = await supabase.from("users")
            .select("id, name, email, avatar_url, phone").eq("id", data.user_id).maybeSingle();
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
      } finally { setIsLoading(false); }
    };
    if (id) fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!listing?.user_id) return;
      setStatsLoading(true);
      try {
        const { count: listingsCount } = await supabase.from("listings").select("*", { count: "exact", head: true })
          .eq("user_id", listing.user_id).eq("status", "active");
        const { count: followersCount } = await supabase.from("seller_followers").select("*", { count: "exact", head: true })
          .eq("seller_id", listing.user_id);
        const { data: ratings } = await supabase.from("seller_ratings").select("rating").eq("seller_id", listing.user_id);
        const ratingCount = ratings?.length || 0;
        const avgRating = ratingCount > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;
        let isFollowing = false, userRating = 0;
        if (user?.id) {
          const { data: followData } = await supabase.from("seller_followers").select("id")
            .eq("seller_id", listing.user_id).eq("follower_id", user.id).maybeSingle();
          isFollowing = !!followData;
          const { data: ratingData } = await supabase.from("seller_ratings").select("rating")
            .eq("seller_id", listing.user_id).eq("rater_id", user.id).maybeSingle();
          userRating = ratingData?.rating || 0;
        }
        setSellerStats({ listings: listingsCount || 0, followers: followersCount || 0, rating: avgRating, ratingCount, isFollowing, userRating });
      } catch (err) { console.error("Seller stats error:", err); }
      finally { setStatsLoading(false); }
    };
    fetchSellerStats();
  }, [listing?.user_id, user?.id]);

  useEffect(() => {
    if (!listing?.user_id) return;
    const channel = supabase.channel(`seller-sync-${listing.user_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${listing.user_id}` },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          setSeller((prev) => prev ? {
            ...prev, name: row.full_name ?? prev.name, avatar_url: row.avatar ?? prev.avatar_url,
            email: row.email ?? prev.email, phone: row.phone ?? prev.phone,
            planId: row.plan_id != null ? String(row.plan_id).toLowerCase() : prev.planId,
            verified: row.verified != null ? !!row.verified : prev.verified,
          } : prev);
        }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [listing?.user_id]);

  const toggleFavorite = async () => {
    if (!user) { pushToast("info", "Sign in required", "Please sign in to save favorites"); return; }
    const next = !isFav;
    setIsFav(next);
    if (String(id).startsWith("default-")) return;
    try {
      if (next) await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
      else await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
    } catch (err) { console.error("Toggle favorite:", err); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      pushToast("success", "Link copied", "Share this listing");
      setTimeout(() => setCopied(false), 2000);
    } catch { pushToast("info", "Link", window.location.href); }
  };

  const rawPhone = listing?.contact_number || listing?.phone || listing?.whatsapp || seller?.phone || "+920000000000";
  const whatsappNumber = String(rawPhone).replace(/[^0-9]/g, "");

  const handleSendInquiry = () => {
    if (isOwner) return;
    if (isSold) { pushToast("error", "This listing is sold", "No longer available."); return; }
    const priceObj = formatPakistaniPrice(listing?.price);
    const priceText = priceObj.unit ? `PKR ${priceObj.short} ${priceObj.unit} (${priceObj.long})` : `PKR ${priceObj.long}`;
    const text = encodeURIComponent(
      `Hi, I'm interested in your property on APNa Deal:\n\n*${listing?.title}*\n${listing?.location}\n${priceText}\n\nIs it still available?`
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
    } catch (err) { console.error("Follow error:", err); pushToast("error", "Action failed", "Please try again"); }
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
    } catch (err) { console.error("Rating error:", err); pushToast("error", "Rating failed", "Please try again"); }
  };

  const formattedPrice = useMemo(() => formatPakistaniPrice(listing?.price), [listing?.price]);

  /* Attr chips (middle column) */
  const attributeChips = useMemo(() => {
    const out = [];
    const s = listing?.specs || {};
    out.push({ label: "Type", value: s.propertyType || listing?.category || "House" });
    if (s.purpose) out.push({ label: "Purpose", value: s.purpose });
    if (s.area) out.push({ label: "Area", value: s.area });
    if (s.bedrooms || s.beds) out.push({ label: "Beds", value: s.bedrooms || s.beds });
    if (s.furnishing) out.push({ label: "Furnished", value: s.furnishing });
    return out;
  }, [listing]);

  /* Spec rows to render (skip empties) */
  const specRows = useMemo(() => {
    const s = listing?.specs || {};
    return SPEC_ROWS.filter((r) => {
      const v = s[r.key];
      return v !== null && v !== undefined && v !== "" && v !== "—";
    });
  }, [listing]);

  if (isLoading) {
    return (
      <div className="min-h-screen pd-page theme-light flex items-center justify-center px-4">
        <FontStyles />
        <div className="text-center">
          <FaSpinner className="text-3xl mx-auto mb-4 animate-spin" style={{ color: "var(--nav-orange)" }} />
          <p className="font-ticket-body text-sm pd-txt-soft">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen pd-page theme-light flex items-center justify-center px-4">
        <FontStyles />
        <div className="text-center max-w-md mx-auto p-8 pd-surface rounded-2xl">
          <FaExclamationTriangle className="text-5xl mx-auto mb-4" style={{ color: "var(--nav-orange)" }} />
          <h2 className="font-ticket-display text-xl font-bold pd-txt mb-2">{error || "Listing not found"}</h2>
          <p className="font-ticket-body text-sm pd-txt-soft mb-5">The listing you're looking for doesn't exist or has been removed.</p>
          <Link to="/vehicles" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ticket-body font-bold text-sm pd-btn-orange">
            <FaArrowLeft className="text-xs" /> Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pd-page theme-light">
      <FontStyles />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] pd-txt-soft mb-5 flex-wrap">
          <Link to="/feed" className="hover:opacity-80 inline-flex items-center gap-1" style={{ color: "inherit" }}>
            <FaStore className="text-[11px]" /> Shop
          </Link>
          <span className="opacity-40">›</span>
          <Link to="/vehicles" className="hover:opacity-80" style={{ color: "inherit" }}>Property</Link>
          <span className="opacity-40">›</span>
          <Link to={`/vehicles?category=${listing.category}`} className="hover:opacity-80" style={{ color: "inherit" }}>
            {listing.category}
          </Link>
          <span className="opacity-40">›</span>
          <span className="pd-txt font-medium truncate max-w-[280px]">{listing.title}</span>
        </nav>

        {/* ═══ 3-COLUMN GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* COLUMN 1: Left */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex gap-3">
              {listing.images.length > 1 && (
                <div className="flex flex-col gap-2 flex-shrink-0 max-h-[440px] overflow-y-auto scrollbar-hide">
                  {listing.images.slice(0, 4).map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-[68px] h-[68px] rounded-lg overflow-hidden border-2 transition-all relative flex-shrink-0 ${activeImage === i ? "" : "opacity-70 hover:opacity-100"}`}
                      style={{ borderColor: activeImage === i ? "var(--nav-orange)" : "var(--nav-line)" }}>
                      <img src={img} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative flex-1 min-w-0 pd-surface rounded-2xl overflow-hidden group aspect-square">
                <img src={listing.images[activeImage]} alt={listing.title} className="w-full h-full object-contain p-3" />
                <button onClick={() => setFullscreen(true)}
                  className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md backdrop-blur-md text-[11px] font-semibold z-30"
                  style={{ background: "rgba(255,255,255,0.85)", color: "var(--nav-txt)", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <FaExpand className="text-[9px]" /> View
                </button>
                {listing.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md z-30"
                    style={{ background: "rgba(40,40,40,0.65)", color: "#FFFFFF" }}>
                    {activeImage + 1} / {listing.images.length}
                  </div>
                )}
                {listing.images.length > 1 && (
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
              </motion.div>
            </div>

            <EditImageEntry navigate={navigate} imageUrl={listing.images[activeImage]} returnTo={`/vehicle/${id}`} />

            {/* Seller card */}
            <div className="rounded-2xl pd-surface p-5">
              <div className="flex items-center gap-3 mb-4">
                <SellerAvatar avatar={seller?.avatar_url} name={seller?.name || "U"} planId={seller?.planId || "free"} verified={seller?.verified || listing.verified} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-ticket-body text-[15px] font-bold pd-txt truncate">
                      {isOwner ? "You" : (seller?.name || "APNa Deal Seller")}
                    </p>
                    {!isOwner && <PlanLabel planId={seller?.planId || "free"} compact={false} />}
                  </div>
                  <p className="font-ticket-body text-[11px] pd-txt-soft inline-flex items-center gap-1 mt-0.5">
                    <FaMapPin className="text-[9px]" style={{ color: "var(--nav-orange)" }} />
                    {listing.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 pb-4" style={{ borderBottom: "1px solid var(--nav-line)" }}>
                {[
                  { label: "Rating", value: statsLoading ? "…" : sellerStats.ratingCount > 0 ? sellerStats.rating.toFixed(1) : "3.0" },
                  { label: "Followers", value: statsLoading ? "…" : sellerStats.followers },
                  { label: "Listings", value: statsLoading ? "…" : sellerStats.listings },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    {statsLoading ? <div className="h-5 w-8 mx-auto mb-1 pd-shimmer" />
                      : <p className="font-ticket-body text-[15px] font-bold pd-txt tabular-nums">{s.value}</p>}
                    <p className="font-ticket-body text-[9.5px] font-bold pd-txt-soft uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                {statsLoading ? <div className="h-3 w-24 pd-shimmer" />
                  : <StarDisplay rating={sellerStats.rating || 3.0} size="sm" showValue count={sellerStats.ratingCount || 1} />}
              </div>

              {!isOwner && (
                <button onClick={handleRateSeller} disabled={isSold}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-ticket-body font-bold text-[13px] transition-all pd-btn-orange mb-2">
                  <FaStar className="text-[12px]" />
                  {sellerStats.userRating > 0 ? `Your Rating: ${sellerStats.userRating} ★` : "Rate Seller"}
                </button>
              )}

              {!isOwner && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleChatWithSeller}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-ticket-body font-bold text-[12px] transition-all pd-btn-outline">
                    <FaComment className="text-[10px]" /> Chat
                  </button>
                  <button onClick={handleFollowToggle}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-ticket-body font-bold text-[12px] transition-all pd-btn-outline"
                    style={sellerStats.isFollowing ? { background: "var(--nav-primary-soft)", border: "1.5px solid var(--nav-orange)", color: "var(--nav-orange)" } : undefined}>
                    {sellerStats.isFollowing ? (<><FaUserCheck className="text-[10px]" /> Following</>) : (<><FaUserPlus className="text-[10px]" /> Follow</>)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: Middle */}
          <div className="lg:col-span-5">
            <h1 className="font-ticket-body text-[26px] sm:text-[30px] font-bold leading-tight mb-3 pd-txt">
              {listing.title}
            </h1>

            <div className="flex items-center gap-3 flex-wrap mb-3 text-[13px]">
              <StarDisplay rating={sellerStats.rating || 3.0} size="md" showValue count={sellerStats.ratingCount || 1} />
              <span className="pd-txt-soft">·</span>
              <span className="inline-flex items-center gap-1 font-ticket-body text-[12px] pd-txt-soft">
                <FaTag className="text-[10px]" style={{ color: "var(--nav-orange)" }} />
                <span className="font-semibold" style={{ color: "var(--nav-orange)" }}>#6</span>
                {" "}most popular in {listing.category}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-5 pb-4" style={{ borderBottom: "1px solid var(--nav-line)" }}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium pd-txt-soft" style={{ border: "1px solid var(--nav-line-str)" }}>
                <FaCheckCircle className="text-[10px]" style={{ color: "var(--nav-green)" }} /> Document verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium pd-txt-soft" style={{ border: "1px solid var(--nav-line-str)" }}>
                <FaCheckCircle className="text-[10px]" style={{ color: "var(--nav-green)" }} /> Dispute free
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium pd-txt-soft" style={{ border: "1px solid var(--nav-line-str)" }}>
                <FaCheckCircle className="text-[10px]" style={{ color: "var(--nav-green)" }} /> Possession ready
              </span>
            </div>

            {/* Price */}
            <div className="mb-4">
              {formattedPrice.unit ? (
                <p className="font-ticket-body text-[32px] sm:text-[38px] font-bold leading-none pd-txt">
                  <span className="text-[18px] sm:text-[20px] font-semibold mr-1.5">PKR</span>
                  {formattedPrice.short}
                  <span className="text-[22px] sm:text-[26px] font-semibold ml-2">{formattedPrice.unit}</span>
                </p>
              ) : (
                <p className="font-ticket-body text-[32px] sm:text-[38px] font-bold leading-none pd-txt">
                  <span className="text-[18px] sm:text-[20px] font-semibold mr-1.5">PKR</span>
                  {formattedPrice.long}
                </p>
              )}
              <p className="font-ticket-body text-[12px] font-medium mt-1.5 tabular-nums pd-txt-soft">
                PKR {formattedPrice.long}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-5 pb-5" style={{ borderBottom: "1px solid var(--nav-line)" }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold"
                style={{ background: "var(--nav-primary-soft)", color: "var(--nav-orange)", border: "1px solid var(--nav-orange)" }}>
                <FaCheck className="text-[9px]" /> Price Negotiable
              </span>
              <span className="font-ticket-body text-[11.5px] pd-txt-soft">Posted {listing.postedAgo}</span>
            </div>

            {/* Attr chips */}
            <div className="space-y-3 mb-5">
              {attributeChips.map((chip) => (
                <div key={chip.label} className="flex items-center gap-3">
                  <span className="font-ticket-body text-[13px] font-medium pd-txt w-[110px] flex-shrink-0">{chip.label}</span>
                  <span className="pd-attr-chip">{chip.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: Right */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4 h-fit">
            <div className="rounded-xl pd-surface p-5">
              <h3 className="font-ticket-body text-[16px] font-bold pd-txt mb-2">Site Visit</h3>
              <p className="font-ticket-body text-[12.5px] pd-txt-soft leading-relaxed mb-3">
                Schedule a visit to view this property. Chat with the seller for availability and timing.
              </p>
              <button onClick={handleChatWithSeller}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-ticket-body font-bold text-[12.5px] transition-all pd-btn-outline">
                <FaComment className="text-[11px]" /> Chat with seller
              </button>
            </div>

            <div className="rounded-xl pd-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-ticket-body text-[16px] font-bold pd-txt">APNa Deal order protection</h3>
                <FaChevronRight className="text-[10px] pd-txt-soft" />
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <FaShieldAlt className="text-[13px] flex-shrink-0 mt-0.5" style={{ color: "var(--nav-orange)" }} />
                  <div>
                    <p className="font-ticket-body text-[12.5px] font-bold pd-txt mb-0.5">Secure payments</p>
                    <p className="font-ticket-body text-[11.5px] pd-txt-soft leading-relaxed">
                      Every payment is secured with strict SSL encryption and PCI DSS.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FaUndo className="text-[12px] flex-shrink-0 mt-0.5" style={{ color: "var(--nav-orange)" }} />
                  <div>
                    <p className="font-ticket-body text-[12.5px] font-bold pd-txt mb-0.5">Refund policy</p>
                    <p className="font-ticket-body text-[11.5px] pd-txt-soft leading-relaxed">
                      Claim a refund if the property doesn't match the listing description.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-4 pt-4" style={{ borderTop: "1px solid var(--nav-line)" }}>
                <span className="inline-flex items-center justify-center h-5 w-8 rounded text-[8px] font-black text-white" style={{ background: "#1A1F71" }}>VISA</span>
                <span className="inline-flex items-center justify-center h-5 w-8 rounded text-[8px] font-black text-white" style={{ background: "#EB001B" }}>MC</span>
                <span className="inline-flex items-center justify-center h-5 w-8 rounded text-[8px] font-black text-white" style={{ background: "#003087" }}>PP</span>
                <span className="inline-flex items-center justify-center h-5 w-8 rounded text-[8px] font-black text-white" style={{ background: "#006FCF" }}>AMEX</span>
                <span className="font-ticket-body text-[10.5px] font-semibold pd-txt-soft ml-1">T/T</span>
              </div>
            </div>

            {!isOwner && !isSold ? (
              <div className="space-y-2.5">
                <button onClick={handleSendInquiry}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full font-ticket-body text-[14.5px] font-bold text-white transition-all pd-btn-orange">
                  <FaWhatsapp className="text-[16px]" /> Send Inquiry
                </button>
                <button onClick={handleChatWithSeller}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full font-ticket-body text-[14.5px] font-bold transition-all"
                  style={{ border: "1.5px solid var(--nav-orange)", color: "var(--nav-orange)", background: "transparent" }}>
                  Chat now
                </button>
                <p className="font-ticket-body text-[10.5px] pd-txt-soft leading-relaxed text-center pt-1">
                  Only properties visited and verified through APNa Deal can enjoy free protection by{" "}
                  <span className="font-bold" style={{ color: "var(--nav-orange)" }}>APNa Deal Assurance</span>
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Link to="/my-listings" className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-ticket-body text-[14px] font-bold transition-all pd-btn-outline">
                  <FaEdit /> Manage Listing
                </Link>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              <button onClick={toggleFavorite}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11.5px] font-semibold transition-all"
                style={{
                  background: "transparent",
                  border: `1px solid ${isFav ? "var(--nav-danger)" : "var(--nav-line-str)"}`,
                  color: isFav ? "var(--nav-danger)" : "var(--nav-txt-soft)",
                }}>
                {isFav ? <FaHeart className="text-[10px]" /> : <FaRegHeart className="text-[10px]" />}
                {isFav ? "Saved" : "Save"}
              </button>
              <button onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11.5px] font-semibold pd-surface pd-txt-soft">
                <FaShare className="text-[10px]" /> {copied ? "Copied" : "Share"}
              </button>
              <button onClick={() => setMoreOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11.5px] font-semibold pd-surface pd-txt-soft">
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

        {/* ═══════════════════════════════════════════════════════════════
            FULL-WIDTH SECTIONS BELOW
           ═══════════════════════════════════════════════════════════════ */}

        {/* ─── SPECIFICATION (exact row order from screenshot) ─── */}
        {specRows.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h2 className="font-ticket-body text-[26px] sm:text-[30px] font-bold pd-txt">Specification</h2>
              <button type="button"
                onClick={() => pushToast("success", "Reported", "Thank you for your feedback")}
                className="inline-flex items-center gap-1.5 font-ticket-body text-[12.5px] font-medium hover:opacity-70 transition-opacity pd-txt-soft">
                <FaFlag className="text-[10px]" /> Report abuse
              </button>
            </div>
            <div style={{ height: 1, background: "var(--nav-line-str)", marginBottom: 4 }} />

            <table className="pd-spec-table mt-3">
              <tbody>
                {specRows.map((row) => {
                  const value = listing.specs[row.key];
                  return (
                    <tr key={row.key}>
                      <td className="pd-spec-key">{row.label}</td>
                      <td className="pd-spec-val">
                        {row.isBool && String(value).toLowerCase() === "yes" ? <YesPill /> : value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* ─── PROPERTY DESCRIPTION ─── */}
        {listing.description && (
          <section className="mt-14">
            <h2 className="font-ticket-body text-[26px] sm:text-[30px] font-bold mb-3 pd-txt">Property Description</h2>
            <div style={{ height: 1, background: "var(--nav-line-str)", marginBottom: 16 }} />
            <MarkdownBlock text={listing.description} />
          </section>
        )}

        {/* ─── PROPERTY IMAGES (N) ─── */}
        {listing.images && listing.images.length > 0 && (
          <section className="mt-14">
            <h2 className="font-ticket-body text-[26px] sm:text-[30px] font-bold mb-3 pd-txt">
              Property Images ({listing.images.length})
            </h2>
            <div style={{ height: 1, background: "var(--nav-line-str)", marginBottom: 20 }} />

            <div className="pd-gallery">
              {listing.images.map((img, i) => (
                <button key={i} type="button" onClick={() => { setActiveImage(i); setFullscreen(true); }}
                  className="pd-gallery__item" aria-label={`Open image ${i + 1}`}>
                  <img src={img} alt={`${listing.title} ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─── PROPERTY POLICIES ─── */}
        <section className="mt-14">
          <div className="rounded-2xl pd-surface p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "#16A34A" }}>
                <FaFileContract className="text-[18px]" />
              </div>
              <div>
                <h2 className="font-ticket-body text-[20px] sm:text-[22px] font-bold pd-txt">Property Policies</h2>
                <p className="font-ticket-body text-[13px] pd-txt-soft mt-0.5">Follow these to protect yourself before buying</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROPERTY_POLICIES.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="pp-card">
                    <span className="pp-icon"><Icon /></span>
                    <div className="min-w-0">
                      <p className="font-ticket-body text-[13.5px] font-bold pd-txt mb-1">{p.title}</p>
                      <p className="font-ticket-body text-[12.5px] pd-txt-soft leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── QUICK SAFETY TIPS ─── */}
        <section className="mt-6 mb-12">
          <div className="qs-wrap">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "#16A34A" }}>
                <FaShieldAlt className="text-[18px]" />
              </div>
              <div>
                <h2 className="font-ticket-body text-[20px] sm:text-[22px] font-bold pd-txt">Quick Safety Tips</h2>
                <p className="font-ticket-body text-[13px] pd-txt-soft mt-0.5">Protect yourself when buying property</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_SAFETY_TIPS.map((tip, i) => (
                <div key={i} className="qs-pill">
                  <span className="qs-check"><FaCheck /></span>
                  <span className="font-ticket-body text-[13.5px] pd-txt">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

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

export default VehicleDetail;