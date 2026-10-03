// pages/PostAd.jsx — Modern + Streamlined Vehicle/Bike/Toy specs + AI bg remover
// + Content moderation + Phone validation + Edit mode + Price suggestions + Boost upsell
// ✨ MODERN REDESIGN — glassy cards, gradient accents, elevated fields
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import AIAdAssistant from "../components/AIAdAssistant";
import { generateWithChat } from "../lib/pollinations";


import {
  FaCamera, FaTimes, FaCheck, FaCheckCircle, FaSpinner,
  FaArrowRight, FaArrowLeft, FaCar, FaMobileAlt, FaHome,
  FaLaptop, FaMotorcycle, FaMoneyBillWave, FaCloudUploadAlt,
  FaTrash, FaBolt, FaShieldAlt, FaPlus, FaCalendarAlt,
  FaTachometerAlt, FaGasPump, FaCog, FaBatteryFull, FaHdd,
  FaBed, FaBath, FaRulerCombined, FaFileContract,
  FaCity, FaKey, FaPalette, FaStar,FaEye,FaCopy,FaBox,
  FaCompass, FaParking, FaUtensils, FaWifi,
  FaUndo,FaArchive,
  FaSun, FaUniversity,
  FaTint, FaFire, FaUserTie, FaBuilding,
  FaLayerGroup, FaPhone, FaMapMarkerAlt,
  FaMemory, FaMicrochip, FaCameraRetro, FaFingerprint, FaBoxOpen,
  FaWrench, FaChair,
  FaRulerVertical, FaRegBuilding, FaTools, FaGem,
  FaGamepad, FaPuzzlePiece, FaBaby, FaChild, FaShapes,
  FaLocationArrow, FaCrosshairs, FaEdit,
  FaTruck, FaShippingFast, FaHandshake, FaCube, FaTags, FaMagic,
  FaPaintBrush, FaSave, FaSearchPlus,
  FaThLarge, FaList, FaFilter, FaCog as FaCogIcon, FaFileExport, FaChevronRight,
  FaChevronLeft, FaEllipsisH,
  FaWhatsapp, FaShare, FaRocket, FaLightbulb, FaExclamationTriangle,
  FaClock, FaChartLine,
    FaCropAlt, FaSlidersH, FaAdjust, FaArrowsAltH,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { removeBackground, uploadCleanedImage } from "../lib/removeBg";
import { usePlanLimits } from "../hooks/usePlanLimits";

/* ═══════════════════════════════════════════════════════════════
   POST AD — MODERN THEME + ELEVATED FIELD STYLES
   ═══════════════════════════════════════════════════════════════ */
const PostAdStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* ── DARK THEME ─────────────────────────────────────────── */
    .theme-dark {
      --pa-bg-1:           #0A0A12;
      --pa-bg-2:           #0F0F1A;
      --pa-panel:          rgba(255,255,255,0.045);
      --pa-panel-2:        rgba(255,255,255,0.02);
      --pa-line:           rgba(255,255,255,0.08);
      --pa-line-str:       rgba(255,255,255,0.15);
      --pa-txt:            #FFFFFF;
      --pa-txt-soft:       rgba(255,255,255,0.65);
      --pa-txt-faint:      rgba(255,255,255,0.45);
      --pa-dot:            rgba(255,255,255,0.06);
      --pa-primary:        #fc9d03;
      --pa-primary-2:      #f59e0b;
      --pa-primary-3:      #c8631f;
      --pa-primary-soft:   rgba(252,157,3,0.14);
      --pa-primary-glow:   rgba(252,157,3,0.45);
      --pa-primary-2-soft: rgba(252,157,3,0.08);
      --pa-danger:         #B23A2E;
      --pa-danger-soft:    rgba(178,58,46,0.15);
      --pa-success:        #3fa77f;
      --pa-success-soft:   rgba(63,167,127,0.10);
      --pa-ai:             #E8A33D;
      --pa-ai-ink:         #1B1815;
      --pa-warning:        #EAB308;
      --pa-warning-soft:   rgba(234,179,8,0.12);

      --cat-bg:            #0A0A12;
      --cat-surface:       #0F0F1A;
      --cat-border:        rgba(255,255,255,0.08);
      --cat-header-bg:     rgba(255,255,255,0.03);
      --cat-txt:           #FFFFFF;
      --cat-txt-muted:     rgba(255,255,255,0.55);
      --cat-hover:         rgba(255,255,255,0.03);
    }

    /* ── LIGHT THEME ────────────────────────────────────────── */
    .theme-light {
      --pa-bg-1:           #FFFFFF;
      --pa-bg-2:           #FAF7F3;
      --pa-panel:          rgba(255,255,255,0.85);
      --pa-panel-2:        rgba(255,255,255,0.95);
      --pa-line:           rgba(20,20,30,0.08);
      --pa-line-str:       rgba(20,20,30,0.15);
      --pa-txt:            #1A1613;
      --pa-txt-soft:       rgba(26,22,19,0.62);
      --pa-txt-faint:      rgba(26,22,19,0.42);
      --pa-dot:            rgba(20,20,30,0.08);
      --pa-primary:        #c8631f;
      --pa-primary-2:      #fc9d03;
      --pa-primary-3:      #f59e0b;
      --pa-primary-soft:   rgba(200,99,31,0.10);
      --pa-primary-glow:   rgba(200,99,31,0.35);
      --pa-primary-2-soft: rgba(200,99,31,0.06);
      --pa-danger:         #B23A2E;
      --pa-danger-soft:    rgba(178,58,46,0.10);
      --pa-success:        #164B3B;
      --pa-success-soft:   rgba(22,75,59,0.08);
      --pa-ai:             #B9791E;
      --pa-ai-ink:         #1B1815;
      --pa-warning:        #CA8A04;
      --pa-warning-soft:   rgba(202,138,4,0.10);

      --cat-bg:            #ffffff;
      --cat-surface:       #ffffff;
      --cat-border:        #e5e7eb;
      --cat-header-bg:     #f9fafb;
      --cat-txt:           #1f2937;
      --cat-txt-muted:     #6b7280;
      --cat-hover:         #fafbfc;
    }

    .pa-bg {
      background: var(--cat-bg);
      color: var(--cat-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .pa-panel { background: var(--pa-panel); border: 1px solid var(--pa-line); }
    .pa-panel-solid {
      background: var(--pa-bg-1);
      border: 1px solid var(--pa-line);
      box-shadow: 0 8px 32px -24px rgba(0,0,0,0.35);
    }

    /* ⭐ MODERN INPUT */
    .pa-input {
      background: var(--pa-panel-2);
      color: var(--cat-txt);
      border: 1.5px solid var(--pa-line);
      transition: border-color 0.2s ease, box-shadow 0.25s ease, background 0.2s ease;
    }
    .pa-input:hover { border-color: var(--pa-line-str); }
    .pa-input:focus {
      border-color: var(--pa-primary);
      outline: none;
      background: var(--pa-bg-1);
      box-shadow: 0 0 0 4px var(--pa-primary-soft),
                  0 8px 24px -12px var(--pa-primary-glow);
    }

    /* ⭐ SPEC GROUP CARD */
    .pa-spec-card {
      position: relative;
      border-radius: 20px;
      border: 1px solid var(--pa-line);
      background: linear-gradient(180deg,
        var(--pa-primary-2-soft) 0%,
        transparent 55%);
      overflow: hidden;
      transition: border-color 0.25s ease;
    }
    .pa-spec-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg,
        var(--pa-primary) 0%,
        var(--pa-primary-2) 50%,
        transparent 100%);
      opacity: 0.7;
    }
    .pa-spec-card:hover { border-color: var(--pa-line-str); }

    /* ⭐ CATEGORY CARD */
    .pa-cat-card {
      position: relative;
      border-radius: 20px;
      border: 1.5px solid var(--pa-line);
      background: var(--pa-panel-2);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .pa-cat-card::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 0%,
        var(--pa-primary-soft) 0%,
        transparent 60%);
      opacity: 0;
      transition: opacity 0.35s ease;
      pointer-events: none;
    }
    .pa-cat-card:hover {
      transform: translateY(-3px);
      border-color: var(--pa-primary);
      box-shadow: 0 16px 32px -16px var(--pa-primary-glow);
    }
    .pa-cat-card:hover::after { opacity: 1; }
    .pa-cat-card[data-active="true"] {
      border-color: var(--pa-primary);
      background: var(--pa-primary-soft);
      box-shadow: 0 16px 32px -16px var(--pa-primary-glow);
    }
    .pa-cat-card[data-active="true"]::after { opacity: 1; }

    /* ⭐ CONDITION PILL */
    .pa-cond-pill {
      position: relative;
      overflow: hidden;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .pa-cond-pill:hover:not([data-active="true"]) {
      transform: translateY(-1px);
      border-color: var(--pa-primary);
      color: var(--pa-primary-2);
    }
    .pa-cond-pill[data-active="true"] {
      box-shadow: 0 10px 22px -10px var(--pa-primary-glow);
    }

    /* ⭐ STEPPER DOT */
    .pa-step-dot {
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .pa-step-dot[data-state="active"] {
      box-shadow: 0 0 0 5px var(--pa-primary-soft),
                  0 6px 16px -6px var(--pa-primary-glow);
      transform: scale(1.06);
    }
    .pa-step-dot[data-state="done"] {
      box-shadow: 0 6px 16px -8px var(--pa-primary-glow);
    }

    /* ⭐ MODERN BUTTONS */
    .pa-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 12px;
      font-weight: 700;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      white-space: nowrap;
      line-height: 1;
    }
    .pa-btn-primary {
      background: linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 10px 24px -10px var(--pa-primary-glow),
                  inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .pa-btn-primary:hover:not(:disabled) {
      filter: brightness(1.06);
      transform: translateY(-1px);
      box-shadow: 0 14px 32px -12px var(--pa-primary-glow),
                  inset 0 1px 0 rgba(255,255,255,0.25);
    }
    .pa-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .pa-btn-primary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: grayscale(0.3);
    }
    .pa-btn-ghost {
      background: var(--pa-panel-2);
      color: var(--cat-txt);
      border: 1.5px solid var(--pa-line-str);
    }
    .pa-btn-ghost:hover:not(:disabled) {
      border-color: var(--pa-primary);
      color: var(--pa-primary-2);
    }
    .pa-btn-ghost:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    @keyframes ai-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(232,163,61,0.55); }
      50%      { box-shadow: 0 0 0 6px rgba(232,163,61,0); }
    }
    .ai-pulse { animation: ai-pulse 2s ease-in-out infinite; }

    @keyframes success-pop {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .success-pop { animation: success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }

    /* ── CATALOG TABLE ── */
    .cat-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .cat-table thead { background-color: var(--cat-header-bg); }
    .cat-table thead th {
      text-align: left; padding: 12px 16px;
      font-weight: 500; font-size: 12px;
      color: var(--cat-txt-muted);
      letter-spacing: 0.02em; text-transform: uppercase;
      border-bottom: 1px solid var(--cat-border);
      white-space: nowrap; user-select: none;
    }
    .cat-table thead th:first-child { width: 40px; padding-left: 20px; }
    .cat-table tbody tr {
      border-bottom: 1px solid var(--cat-border);
      transition: background-color 0.1s ease;
    }
    .cat-table tbody tr:last-child { border-bottom: none; }
    .cat-table tbody tr:hover { background-color: var(--cat-hover); }
    .cat-table tbody td {
      padding: 14px 16px; color: var(--cat-txt);
      vertical-align: middle; white-space: nowrap;
    }
    .cat-table tbody td:first-child { padding-left: 20px; }

    .cat-desktop-only { display: block; }
    .cat-mobile-only  { display: none; }
    @media (max-width: 767px) {
      .cat-desktop-only { display: none; }
      .cat-mobile-only  { display: block; }
    }

    .cat-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px; font-size: 13px; font-weight: 500;
      padding: 8px 16px; border-radius: 10px;
      border: 1px solid var(--cat-border);
      background: var(--cat-surface); color: var(--cat-txt);
      cursor: pointer; transition: all 0.15s ease;
      white-space: nowrap; line-height: 1;
    }
    .cat-btn:hover { background-color: var(--cat-hover); border-color: #d1d5db; }
    .cat-btn-primary {
      background-color: #1a9e4b; border-color: #1a9e4b;
      color: #ffffff; padding: 8px 20px;
    }
    .cat-btn-primary:hover { background-color: #15803d; border-color: #15803d; }

    .cat-toggle {
      display: inline-flex; background: var(--pa-panel-2);
      border-radius: 10px; padding: 3px; gap: 2px;
      border: 1px solid var(--pa-line);
    }
    .cat-toggle button {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 500;
      padding: 6px 16px; border-radius: 8px;
      border: none; background: transparent;
      color: var(--cat-txt-muted); cursor: pointer;
      transition: all 0.15s ease; line-height: 1;
    }
    .cat-toggle button.active {
      background: var(--cat-surface);
      color: var(--cat-txt);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .cat-toggle button:hover:not(.active) { color: var(--cat-txt); }
    @media (max-width: 480px) {
      .cat-toggle button { padding: 6px 10px; font-size: 12px; }
      .cat-toggle button span { display: none; }
      .cat-toggle button i { font-size: 13px; }
    }

    .cat-pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; padding: 24px 0; flex-wrap: wrap;
    }
    .cat-pagination button {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; font-size: 13px; font-weight: 500;
      min-width: 34px; height: 34px; padding: 0 10px;
      border-radius: 10px; border: 1px solid var(--cat-border);
      background: var(--cat-surface); color: var(--cat-txt);
      cursor: pointer; transition: all 0.15s ease;
    }
    .cat-pagination button:hover:not(:disabled) { background: var(--cat-hover); }
    .cat-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .cat-pagination button.active {
      background: var(--pa-primary); border-color: var(--pa-primary);
      color: #ffffff; box-shadow: 0 8px 20px -10px var(--pa-primary-glow);
    }
    .cat-pagination button .cat-page-label { display: inline; }
    @media (max-width: 640px) {
      .cat-pagination { gap: 6px; padding: 16px 0; }
      .cat-pagination button { min-width: 30px; height: 30px; padding: 0 8px; font-size: 12px; }
      .cat-pagination button .cat-page-label { display: none; }
      .cat-pagination .cat-total { width: 100%; text-align: center; margin-left: 0 !important; margin-top: 6px; }
    }

    .cat-chip {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 8px;
      font-size: 12px; font-weight: 500; line-height: 1.4;
      white-space: nowrap;
    }

    .cat-card {
      border: 1px solid var(--cat-border);
      border-radius: 14px; padding: 14px;
      background: var(--cat-surface);
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .cat-card:active { background: var(--cat-hover); border-color: var(--pa-primary); }
    .cat-card + .cat-card { margin-top: 10px; }

    /* ⭐ MODERN LABEL (with dot) */
    .pa-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cat-txt-muted);
      margin-bottom: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .pa-label::before {
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 999px;
      background: var(--pa-primary);
      box-shadow: 0 0 8px var(--pa-primary-glow);
      flex-shrink: 0;
    }
  `}</style>
);

const DRAFT_KEY = "apnadeal_postad_draft";
const IMAGES_KEY = "apnadeal_postad_images";
const STEP_KEY = "apnadeal_postad_step";
const LAST_CITY_KEY = "apnadeal_last_city";

const EMPTY_FORM = {
  category: "",
  title: "",
  description: "",
  price: "",
  condition: "",
  city: "",
  area: "",
  contactNumber: "",
  images: [],
  specs: {},
};

const clearDraftStorage = () => {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
  try { sessionStorage.removeItem(IMAGES_KEY); } catch {}
  try { sessionStorage.removeItem(STEP_KEY); } catch {}
};

/* ═══ Phone validation (Pakistan) ═══ */
const validatePakistaniPhone = (raw) => {
  if (!raw) return { ok: false, reason: "Phone number is required" };
  const cleaned = String(raw).replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+?92|0)?(3\d{9})$/);
  if (!match) return { ok: false, reason: "Enter a valid Pakistani number (e.g., 0300 1234567)" };
  return { ok: true, normalized: "0" + match[1] };
};

/* ═══ Moderation ═══ */
const BANNED_KEYWORDS = [
  "gun", "pistol", "rifle", "ammo", "ammunition", "weapon", "bomb", "explosive",
  "drugs", "cocaine", "heroin", "meth", "weed", "hashish", "charas",
  "fake cnic", "fake id", "fake passport", "forged", "stolen",
  "sex", "escort", "adult", "porn", "xxx",
  "kidney", "organ sale", "blood sale",
];

const detectBannedContent = (title, description) => {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  return BANNED_KEYWORDS.filter((kw) => text.includes(kw));
};

/* ═══ Duplicate detection ═══ */
const checkDuplicateListing = async (userId, title, category) => {
  if (!userId || !title) return [];
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("listings")
      .select("id, title, price, created_at, status")
      .eq("user_id", userId)
      .eq("category", category)
      .gte("created_at", since)
      .ilike("title", `%${title.slice(0, 30)}%`)
      .limit(3);
    return data || [];
  } catch { return []; }
};

/* ═══ Trust check ═══ */
const checkSellerTrust = async (userId) => {
  if (!userId) return { isTrusted: false, approvedCount: 0, rejectedCount: 0 };
  try {
    const [approvedRes, rejectedRes] = await Promise.all([
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "rejected"),
    ]);
    const approvedCount = approvedRes.count || 0;
    const rejectedCount = rejectedRes.count || 0;
    return {
      isTrusted: approvedCount >= 5 && rejectedCount < 2,
      approvedCount,
      rejectedCount,
    };
  } catch { return { isTrusted: false, approvedCount: 0, rejectedCount: 0 }; }
};

/* ═══ Price suggestion ═══ */
const fetchPriceSuggestions = async (category, make, model, year) => {
  if (!category) return null;
  try {
    let query = supabase
      .from("listings").select("price")
      .eq("category", category).eq("status", "active")
      .not("price", "is", null).limit(50);
    if (make) query = query.filter("specs->>make", "eq", make);
    if (model) query = query.filter("specs->>model", "eq", model);
    if (year) query = query.filter("specs->>year", "eq", String(year));
    const { data } = await query;
    if (!data || data.length < 3) return null;
    const prices = data.map((d) => Number(d.price)).filter((n) => n > 0).sort((a, b) => a - b);
    if (prices.length === 0) return null;
    return {
      min: prices[0],
      max: prices[prices.length - 1],
      median: prices[Math.floor(prices.length / 2)],
      count: prices.length,
    };
  } catch { return null; }
};

async function aiFillListing(messages, images, onProgress) {
  const userText = messages?.[0]?.content || "";
  const hasPhotos = images?.length > 0;

  onProgress?.(8,  "Reading your prompt…");
  await new Promise((r) => setTimeout(r, 120));
  onProgress?.(24, hasPhotos ? "Analyzing photos…" : "Preparing request…");
  await new Promise((r) => setTimeout(r, 120));
  onProgress?.(44, "Detecting category & specs…");
  await new Promise((r) => setTimeout(r, 120));
const system = `
You are a listing assistant for APNa Deal (Pakistani marketplace).

The user will describe what they're selling. You MUST then ask them EVERY question
needed to fill the listing form. Do NOT skip questions even if the user already
answered them. Ask them all — one by one.

ALWAYS set "needsAnswers": true. Never fill the listing directly.

Return ONLY a JSON object — no other text. First character MUST be {.

Shape:
{
  "needsAnswers": true,
  "questions": [
    { "id": "category", "text": "What category is your item?", "type": "select",
      "options": ["Vehicles", "Bikes", "Mobiles", "Property", "Electronics", "Toys"] },
    ...
  ]
}

DECIDE THE QUESTIONS BASED ON THE CATEGORY YOU DETECT.

══════════════════════════════════════════
IF CATEGORY = "Vehicles" → ask these (in order):
══════════════════════════════════════════
1.  category        (select) "What category is your item?" — options: Vehicles, Bikes, Mobiles, Property, Electronics, Toys
2.  title           (text)   "Give your ad a short, clear title" — placeholder "e.g. Toyota Corolla 2020 – Well Maintained"
3.  price           (text)   "What's your asking price (PKR)?" — placeholder "e.g. 62 lac or 6200000"
4.  condition       (select) "What's the condition?" — options: New, Like New, Used, Needs Repair
5.  make            (text)   "Make of the vehicle?" — placeholder "e.g. Toyota"
6.  model           (text)   "Model of the vehicle?" — placeholder "e.g. Corolla"
7.  year            (text)   "Year of the vehicle?" — placeholder "e.g. 2020"
8.  bodyType        (select) "Body type?" — options: Sedan, Hatchback, SUV, Crossover, MPV, Van, Coupe, Convertible, Pickup, Truck, Wagon, Other
9.  transmission    (select) "Transmission?" — options: Automatic, Manual, CVT, DCT, Tiptronic, Other
10. fuel           (select) "Fuel type?" — options: Petrol, Diesel, CNG, Electric, Hybrid, LPG, Other
11. engine         (text)   "Engine (cc)?" — placeholder "e.g. 1800cc"
12. mileage        (text)   "Mileage (km)?" — placeholder "e.g. 45,000"
13. registeredIn   (text)   "Registered city?" — placeholder "e.g. Lahore"
14. ownersCount    (select) "Number of previous owners?" — options: 1st, 2nd, 3rd, 4th+
15. accidentFree   (select) "Accident history?" — options: Yes, No, Minor
16. color          (text)   "Exterior color?" — placeholder "e.g. White"
17. city           (text)   "Which city is the vehicle in?" — placeholder "e.g. Lahore"
18. area           (text)   "Area / Locality?" — placeholder "e.g. DHA Phase 5"
19. description    (text)   "Any other details?" — placeholder "e.g. 1st owner, full service history"

══════════════════════════════════════════
IF CATEGORY = "Bikes" → ask these (in order):
══════════════════════════════════════════
1.  category        (select) "What category is your item?" — options: Vehicles, Bikes, Mobiles, Property, Electronics, Toys
2.  title           (text)   "Give your ad a short, clear title" — placeholder "e.g. Honda CD 70 2023 – 4,200 km"
3.  price           (text)   "What's your asking price (PKR)?" — placeholder "e.g. 1.2 lac"
4.  condition       (select) "What's the condition?" — options: New, Like New, Used, Needs Repair
5.  make            (text)   "Make?" — placeholder "e.g. Honda"
6.  model           (text)   "Model?" — placeholder "e.g. CD 70"
7.  year            (text)   "Year?" — placeholder "e.g. 2023"
8.  engine          (select) "Engine (cc)?" — options: 70cc, 100cc, 110cc, 125cc, 150cc, 200cc, 250cc+, Electric, Other
9.  mileage         (text)   "Mileage (km)?" — placeholder "e.g. 4,200"
10. registeredIn    (text)   "Registered city?" — placeholder "e.g. Lahore"
11. ownersCount     (select) "Number of owners?" — options: 1st, 2nd, 3rd, 4th+
12. color           (text)   "Color?" — placeholder "e.g. Red"
13. city            (text)   "Which city is it in?" — placeholder "e.g. Lahore"
14. area            (text)   "Area / Locality?" — placeholder "e.g. Johar Town"
15. description     (text)   "Any other details?" — placeholder "Optional"

══════════════════════════════════════════
IF CATEGORY = "Mobiles" → ask these (in order):
══════════════════════════════════════════
1.  category        (select) "What category is your item?" — options: Vehicles, Bikes, Mobiles, Property, Electronics, Toys
2.  title           (text)   "Give your ad a short, clear title" — placeholder "e.g. iPhone 14 Pro 256GB – PTA Approved"
3.  price           (text)   "What's your asking price (PKR)?" — placeholder "e.g. 3 lac"
4.  condition       (select) "What's the condition?" — options: New, Like New, Used, Needs Repair
5.  brand           (text)   "Brand?" — placeholder "e.g. Apple"
6.  model           (text)   "Model?" — placeholder "e.g. iPhone 14 Pro"
7.  storage         (select) "Storage?" — options: 32GB, 64GB, 128GB, 256GB, 512GB, 1TB
8.  ram             (select) "RAM?" — options: 2GB, 3GB, 4GB, 6GB, 8GB, 12GB, 16GB
9.  network         (select) "Network?" — options: 5G, 4G LTE, 3G, WiFi Only
10. color           (text)   "Color?" — placeholder "e.g. Black"
11. battery         (text)   "Battery health?" — placeholder "e.g. 98%"
12. warranty        (text)   "Warranty remaining?" — placeholder "e.g. 6 months"
13. pta             (select) "PTA approved?" — options: Yes, No
14. boxAvailable    (select) "Box & accessories included?" — options: Yes, No
15. fingerprint     (select) "Face/Fingerprint working?" — options: Yes, No
16. screenCondition (select) "Screen condition?" — options: Perfect, Minor scratches, Cracked
17. bodyCondition   (select) "Body condition?" — options: Perfect, Minor dents, Damaged
18. repaired        (select) "Any repairs?" — options: Never opened, Screen replaced, Battery replaced, Other
19. city            (text)   "Which city is it in?" — placeholder "e.g. Lahore"
20. area            (text)   "Area / Locality?" — placeholder "e.g. DHA Phase 5"
21. description     (text)   "Any other details?" — placeholder "Optional"

══════════════════════════════════════════
IF CATEGORY = "Property" → ask these (in order):
══════════════════════════════════════════
1.  category        (select) "What category is your item?" — options: Vehicles, Bikes, Mobiles, Property, Electronics, Toys
2.  title           (text)   "Give your ad a short, clear title" — placeholder "e.g. 10 Marla House in DHA Phase 5"
3.  price           (text)   "What's your asking price (PKR)?" — placeholder "e.g. 3.5 crore"
4.  condition       (select) "What's the condition?" — options: New, Like New, Used, Needs Repair
5.  type            (select) "Property type?" — options: House, Apartment, Flat, Plot, Commercial, Farm House, Shop, Office, Warehouse, Building, Other
6.  purpose         (select) "Purpose?" — options: For Sale, For Rent, For Lease
7.  subType         (select) "Sub-Type?" — options: Residential, Commercial, Industrial, Agricultural, Other
8.  title_type      (select) "Title type?" — options: Freehold, Leasehold, Registry, Fard, Allotment, Other
9.  society         (text)   "Society / Authority?" — placeholder "e.g. DHA, Bahria"
10. area            (text)   "Area (size)?" — placeholder "e.g. 10"
11. areaUnit        (select) "Area unit?" — options: Marla, Kanal, Sq. Ft., Sq. Yards, Acre
12. beds            (select) "Bedrooms?" — options: 1, 2, 3, 4, 5, 6, 7, 8+
13. baths           (select) "Bathrooms?" — options: 1, 2, 3, 4, 5, 6+
14. floors          (select) "Floors?" — options: Ground only, Ground + 1, Ground + 2, Ground + 3+
15. facing          (select) "Facing?" — options: North, South, East, West, North-East, North-West, South-East, South-West, Corner, Main Road, Other
16. parking         (select) "Parking spaces?" — options: None, 1, 2, 3, 4+
17. furnished       (select) "Furnishing?" — options: Unfurnished, Semi-Furnished, Fully Furnished
18. loanFree        (select) "Loan / Mortgage free?" — options: Yes, No
19. disputeFree     (select) "Dispute free?" — options: Yes, No
20. possession      (select) "Possession?" — options: Immediate, On Payment, 1 Month, 3 Months+
21. documents       (text)   "Documents available?" — placeholder "e.g. Registry, Fard, NOC"
22. city            (text)   "Which city is it in?" — placeholder "e.g. Lahore"
23. area2           (text)   "Area / Locality?" — placeholder "e.g. DHA Phase 5"
24. description     (text)   "Any other details?" — placeholder "Optional"

══════════════════════════════════════════
IF CATEGORY = "Electronics" → ask these (in order):
══════════════════════════════════════════
1.  category        (select) "What category is your item?" — options: Vehicles, Bikes, Mobiles, Property, Electronics, Toys
2.  title           (text)   "Give your ad a short, clear title" — placeholder "e.g. MacBook Pro 14 M3 Pro 512GB"
3.  price           (text)   "What's your asking price (PKR)?" — placeholder "e.g. 5 lac"
4.  condition       (select) "What's the condition?" — options: New, Like New, Used, Needs Repair
5.  brand           (text)   "Brand?" — placeholder "e.g. Apple, Dell"
6.  model           (text)   "Model?" — placeholder "e.g. MacBook Pro 14"
7.  type            (select) "Device type?" — options: Laptop, Desktop, TV, Camera, Audio, Gaming Console, Monitor, Printer, Router, Tablet, Wearable, Other
8.  processor       (text)   "Processor?" — placeholder "e.g. M3 Pro"
9.  ram             (select) "RAM?" — options: 4GB, 8GB, 16GB, 32GB, 64GB+
10. storage         (text)   "Storage?" — placeholder "e.g. 512GB SSD"
11. screen          (text)   "Screen size?" — placeholder "e.g. 14 inch"
12. color           (text)   "Color?" — placeholder "e.g. Space Grey"
13. warranty        (text)   "Warranty?" — placeholder "e.g. 1 year"
14. boxAvailable    (select) "Box & accessories included?" — options: Yes, No
15. repaired        (select) "Any repairs?" — options: Never opened, Minor repair, Major repair
16. year            (text)   "Year?" — placeholder "e.g. 2023"
17. city            (text)   "Which city is it in?" — placeholder "e.g. Karachi"
18. area            (text)   "Area / Locality?" — placeholder "e.g. Clifton"
19. description     (text)   "Any other details?" — placeholder "Optional"

══════════════════════════════════════════
IF CATEGORY = "Toys" → ask these (in order):
══════════════════════════════════════════
1.  category        (select) "What category is your item?" — options: Vehicles, Bikes, Mobiles, Property, Electronics, Toys
2.  title           (text)   "Give your ad a short, clear title" — placeholder "e.g. LEGO Technic – Complete Set"
3.  price           (text)   "What's your asking price (PKR)?" — placeholder "e.g. 25,000"
4.  condition       (select) "What's the condition?" — options: New, Like New, Used, Needs Repair
5.  brand           (text)   "Brand?" — placeholder "e.g. LEGO"
6.  model           (text)   "Model / Set name?" — placeholder "e.g. Technic"
7.  gender          (select) "Suitable for?" — options: Unisex, Boys, Girls
8.  material        (select) "Material?" — options: Plastic, Wood, Metal, Fabric / Plush, Rubber, Foam, Paper / Cardboard, Mixed, Other
9.  color           (text)   "Color?" — placeholder "e.g. Multi"
10. battery         (select) "Battery required?" — options: Yes, No, Included
11. assembly        (select) "Assembly required?" — options: Yes, No
12. packaging       (select) "Packaging?" — options: Original Box, No Box, Damaged Box
13. accessories     (text)   "Included items?" — placeholder "e.g. Original Box, Manual"
14. warranty        (text)   "Warranty?" — placeholder "e.g. 3 months"
15. quantity        (text)   "Quantity available?" — placeholder "e.g. 1"
16. delivery        (select) "Delivery available?" — options: Yes, No, Pickup Only
17. returnPolicy    (select) "Return policy?" — options: No Returns, 7 Days, 14 Days, Other
18. city            (text)   "Which city is it in?" — placeholder "e.g. Lahore"
19. area            (text)   "Area / Locality?" — placeholder "Optional"
20. description     (text)   "Any other details?" — placeholder "Optional"

══════════════════════════════════════════
RULES
══════════════════════════════════════════
- Detect the category from the user's prompt FIRST.
- Then output the FULL question list for that category, in the order shown.
- Do NOT skip any questions — even if the user already answered them.
- Every question must include: id, text, type, and (for select) options / (for text) placeholder.
- Return JSON now. Start with {.
`.trim();
  onProgress?.(64, "Writing a compelling title…");
  await new Promise((r) => setTimeout(r, 120));

  const composedMessage = [
    userText || "(no description given)",
    hasPhotos ? `\n\n[User attached ${images.length} photo(s) of the item.]` : "",
  ].join("");

  let raw;
  try {
    raw = await generateWithChat({ message: composedMessage, system });
    console.log("🤖 RAW AI RESPONSE:", raw);
  } catch (err) {
    console.error("❌ AI fill failed:", err);
    throw new Error(err?.message || "AI service unavailable");
  }

  onProgress?.(86, "Suggesting a fair price…");
  await new Promise((r) => setTimeout(r, 120));

  /* ═══ BULLETPROOF JSON EXTRACTION ═══ */
  let parsed = null;

  if (raw && typeof raw === "object") {
    parsed = raw;
  } else if (typeof raw === "string") {
    // Strip markdown fences
    let s = raw.trim()
      .replace(/^```(?:json|JSON)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    // Direct parse
    try {
      parsed = JSON.parse(s);
    } catch {
      // Find first { and last }
      const firstBrace = s.indexOf("{");
      const lastBrace  = s.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const candidate = s.slice(firstBrace, lastBrace + 1);
        try {
          parsed = JSON.parse(candidate);
        } catch {
          // Fix trailing commas + single quotes
          try {
            const fixed = candidate
              .replace(/,\s*([}\]])/g, "$1")
              .replace(/'/g, '"');
            parsed = JSON.parse(fixed);
          } catch (e3) {
            console.error("❌ All parse attempts failed. Raw:", raw);
          }
        }
      }
    }
  }

  if (!parsed || typeof parsed !== "object") {
    console.error("❌ No JSON found. Raw was:", raw);
    throw new Error("AI returned an unreadable response. Try again.");
  }

  /* Clamp price to number */
  if (parsed.price != null && typeof parsed.price === "string") {
    const n = Number(String(parsed.price).replace(/[^0-9.]/g, ""));
    parsed.price = Number.isFinite(n) ? n : 0;
  }

  /* Ensure specs exists */
  if (!parsed.specs || typeof parsed.specs !== "object") {
    parsed.specs = {};
  }

  onProgress?.(100, "Finalizing…");
  await new Promise((r) => setTimeout(r, 200));

  console.log("✅ Parsed AI result:", parsed);
  return parsed;
}

/* ── Bulletproof JSON extraction ── */
function extractJSON(raw) {
  if (raw == null) return null;

  /* 1. Already an object? */
  if (typeof raw === "object") return raw;

  if (typeof raw !== "string") {
    try { return JSON.parse(String(raw)); } catch { return null; }
  }

  let s = raw.trim();

  /* 2. Strip markdown fences */
  s = s.replace(/^```(?:json|JSON)?\s*/i, "");
  s = s.replace(/\s*```\s*$/i, "");
  s = s.trim();

  /* 3. Direct parse */
  try {
    return JSON.parse(s);
  } catch {}

  /* 4. Find the JSON object between first { and last } */
  const firstBrace = s.indexOf("{");
  const lastBrace  = s.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const candidate = s.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(candidate);
  } catch {}

  /* 5. Fix common issues: trailing commas, single quotes */
  try {
    const fixed = candidate
      .replace(/,\s*([}\]])/g, "$1")          // remove trailing commas
      .replace(/'/g, '"')                      // single → double quotes
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":'); // unquoted keys
    return JSON.parse(fixed);
  } catch (err) {
    console.error("❌ All parsing attempts failed:", err);
    console.error("❌ Input was:", candidate.slice(0, 500));
    return null;
  }
}
/* ═══ TOAST ═══ */
const Toast = ({ toast, onDismiss, duration = 2600 }) => {
  if (!toast) return null;
  const variants = {
    success:  { accent: "var(--pa-success)",  ring: "var(--pa-success-soft)" },
    error:    { accent: "var(--pa-danger)",   ring: "var(--pa-danger-soft)" },
    info:     { accent: "var(--pa-primary-3)",ring: "var(--pa-primary-soft)" },
    location: { accent: "var(--pa-primary)",  ring: "var(--pa-primary-soft)" },
    warning:  { accent: "var(--pa-warning)",  ring: "var(--pa-warning-soft)" },
  };
  const v = variants[toast.type] || variants.info;

  const iconFor = () => {
    if (toast.type === "error") return <FaTimes className="text-[10px]" />;
    if (toast.type === "location") return <FaLocationArrow className="text-[10px]" />;
    if (toast.type === "warning") return <FaExclamationTriangle className="text-[10px]" />;
    return <FaCheck className="text-[10px]" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, x: 28, scale: 0.94, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: 20, scale: 0.94, filter: "blur(4px)" }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        onClick={onDismiss}
        role="status"
        className="fixed top-20 right-4 left-4 sm:left-auto z-[200] cursor-pointer select-none max-w-[calc(100vw-2rem)]"
      >
        <div
          className="relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-[0_12px_36px_-12px_rgba(0,0,0,0.28)] w-full sm:w-[300px] ml-auto"
          style={{ background: "var(--cat-surface)", borderColor: v.accent }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)` }} />
          <div className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-2">
            <div className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center relative"
              style={{ background: v.ring, boxShadow: `0 0 0 1px ${v.accent} inset`, color: v.accent }}>
              {iconFor()}
              <motion.span
                initial={{ opacity: 0.55, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.9 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-lg"
                style={{ boxShadow: `0 0 0 2px ${v.accent}` }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-ticket-body text-[11px] font-extrabold truncate leading-tight"
                style={{ color: "var(--cat-txt)" }}>{toast.title}</p>
              {toast.message && (
                <p className="font-ticket-body text-[9.5px] truncate leading-tight mt-0.5"
                  style={{ color: "var(--cat-txt-muted)" }}>{toast.message}</p>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} aria-label="Dismiss"
              className="flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center transition-colors"
              style={{ color: "var(--cat-txt-muted)" }}>
              <FaTimes className="text-[9px]" />
            </button>
          </div>
          <motion.div key={toast.id + "-bar"} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            style={{ transformOrigin: "left", height: 2, background: v.accent }} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ═══ DATA DICTIONARIES ═══ */
const categories = [
  { id: "Vehicles",    label: "Vehicles",    icon: FaCar,        sub: "Cars, SUVs & vans" },
  { id: "Bikes",       label: "Bikes",       icon: FaMotorcycle, sub: "Motorcycles & scooters" },
  { id: "Mobiles",     label: "Mobiles",     icon: FaMobileAlt,  sub: "Phones & tablets" },
  { id: "Property",    label: "Property",    icon: FaHome,       sub: "Homes, plots & commercial" },
  { id: "Electronics", label: "Electronics", icon: FaLaptop,     sub: "Laptops & gadgets" },
  { id: "Toys",        label: "Toys",        icon: FaGamepad,    sub: "Kids toys, games & puzzles" },
];

const conditions = ["New", "Like New", "Used", "Needs Repair"];

const COLORS = [
  { name: "White",  hex: "#F7F1E4" },
  { name: "Black",  hex: "#1B1815" },
  { name: "Silver", hex: "#B3A793" },
  { name: "Grey",   hex: "#7A6F5D" },
  { name: "Red",    hex: "#B23A2E" },
  { name: "Blue",   hex: "#2A4A6B" },
  { name: "Green",  hex: "#164B3B" },
  { name: "Amber",  hex: "#fc9d03" },
  { name: "Brown",  hex: "#8B5E3C" },
  { name: "Beige",  hex: "#D9C9A8" },
  { name: "Gold",   hex: "#C9A227" },
  { name: "Purple", hex: "#6B4A8A" },
];

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot",
  "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Larkana",
  "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan",
  "Gujrat", "Sahiwal", "Wah Cantonment", "Mardan", "Kasur",
  "Okara", "Mingora", "Nawabshah", "Chiniot", "Kamoke",
  "Swabi", "Abbottabad", "Mansehra", "Nowshera", "Charsadda",
  "Kohat", "Bannu", "Dera Ismail Khan", "Swat", "Gilgit",
  "Skardu", "Muzaffarabad", "Mirpur", "Attock", "Jhelum",
  "Chakwal", "Mianwali", "Bhakkar", "Layyah", "Vehari",
];

const AREA_SUGGESTIONS = {
  Lahore: [
    "DHA Phase 1","DHA Phase 2","DHA Phase 3","DHA Phase 4","DHA Phase 5",
    "DHA Phase 6","DHA Phase 7","DHA Phase 8","Gulberg I","Gulberg II","Gulberg III",
    "Model Town","Johar Town","Bahria Town","Bahria Orchard","Askari 10","Askari 11",
    "Cantt","Township","Iqbal Town","Faisal Town","Wapda Town","Green Town","Sabzazar",
    "Shadman","Garden Town","Cavalry Ground","Harbanspura",
  ],
  Karachi: [
    "Clifton Block 1","Clifton Block 2","Clifton Block 5","DHA Phase 1","DHA Phase 5",
    "DHA Phase 6","DHA Phase 8","Gulshan-e-Iqbal Block 13","Gulshan-e-Johar",
    "Bahadurabad","PECHS Block 2","PECHS Block 6","Saddar","North Nazimabad",
    "Nazimabad","Malir Cantt","Korangi","Scheme 33","Federal B Area","Tariq Road",
  ],
  Islamabad: [
    "F-5","F-6","F-7","F-8","F-10","F-11","G-5","G-6","G-7","G-8","G-9","G-10","G-11",
    "E-7","E-8","E-11","H-8","H-9","H-11","I-8","I-9","I-10","DHA Phase 1","DHA Phase 2",
    "DHA Phase 5","Bahria Enclave","Gulberg Greens","Gulberg Residencia","Blue Area",
  ],
  Rawalpindi: [
    "Bahria Town Phase 1","Bahria Town Phase 2","Bahria Town Phase 3","Bahria Town Phase 4",
    "Bahria Town Phase 5","Bahria Town Phase 7","Bahria Town Phase 8","Chaklala Scheme 1",
    "Chaklala Scheme 2","Chaklala Scheme 3","Satellite Town","Saddar","Adiala Road",
    "Gulraiz Housing","Peshawar Road","Airport Housing",
  ],
};

const GENERIC_AREAS = [
  "Cantt","Civil Lines","Model Town","Satellite Town","Gulberg","DHA","Bahria Town",
  "Peoples Colony","Wapda Town","Gulshan Colony","Block A","Block B","Main Bazaar",
  "City Area","Old City","New Colony",
];

const VEHICLE_MAKES = [
  "Toyota","Honda","Suzuki","Kia","Hyundai","MG","Changan","Proton",
  "Nissan","Mitsubishi","Mazda","BMW","Mercedes-Benz","Audi","Lexus",
  "Land Rover","Jeep","Ford","Chevrolet","Daihatsu","FAW","Haval","Peugeot",
  "Renault","United","Prince","Daehan","DFSK","Chery","Oshan","Other",
];

const VEHICLE_MODELS_BY_MAKE = {
  Toyota: ["Corolla","Yaris","Camry","Prius","Vitz","Aqua","Passo","Land Cruiser","Prado","Fortuner","Hilux","Hiace","Coaster","Rush","C-HR","Raize","Other"],
  Honda: ["Civic","City","Accord","BR-V","HR-V","CR-V","Vezel","Fit","N-WGN","N-Box","Odyssey","Other"],
  Suzuki: ["Alto","Cultus","Wagon R","Swift","Bolan","Ravi","Every","Mehran","Khyber","Liana","Margalla","Vitara","Jimny","Other"],
  Kia: ["Sportage","Sorento","Picanto","Stonic","Carnival","Grand Carnival","Other"],
  Hyundai: ["Tucson","Elantra","Sonata","Santa Fe","i10","i20","Porter","Other"],
  MG: ["HS","ZS","ZS EV","5","RX8","GT","Other"],
  Changan: ["Alsvin","Karvaan","Oshan X7","CX70","M9","Other"],
  Proton: ["Saga","Persona","Iriz","Exora","Other"],
  Nissan: ["Dayz","Note","Juke","X-Trail","Sunny","Other"],
  Mitsubishi: ["Pajero","Lancer","Mirage","Outlander","Other"],
  Mazda: ["Demio","Axela","CX-5","CX-8","Other"],
  BMW: ["3 Series","5 Series","7 Series","X1","X3","X5","X6","Other"],
  "Mercedes-Benz": ["C-Class","E-Class","S-Class","GLA","GLC","GLE","Other"],
  Audi: ["A3","A4","A6","Q3","Q5","Q7","Other"],
  Lexus: ["ES","IS","LS","NX","RX","LX","Other"],
  "Land Rover": ["Range Rover","Range Rover Sport","Evoque","Discovery","Defender","Other"],
  Jeep: ["Wrangler","Cherokee","Grand Cherokee","Compass","Other"],
  Ford: ["Ranger","Mustang","Explorer","F-150","Other"],
  Haval: ["H6","Jolion","H9","Other"],
  Other: ["Other"],
};

const VEHICLE_TRANSMISSIONS = ["Automatic","Manual","CVT","DCT","Tiptronic","Other"];
const VEHICLE_FUELS = ["Petrol","Diesel","CNG","Electric","Hybrid","LPG","Other"];
const VEHICLE_BODY_TYPES = ["Sedan","Hatchback","SUV","Crossover","MPV","Van","Coupe","Convertible","Pickup","Truck","Wagon","Other"];
const VEHICLE_REGISTERED_IN = CITIES;
const VEHICLE_OWNERS = ["1st","2nd","3rd","4th+"];

const BIKE_MAKES = ["Honda","Yamaha","Suzuki","United","Road Prince","Ravi","Super Power","Ravi Piaggio","Crown","Unique","Roma","Metro","Sohrab","Hero","Other"];

const BIKE_MODELS_BY_MAKE = {
  Honda: ["CD 70","CD 100","CD 125","CG 125","Pridor","CB 150F","CB 125F","CB 250F","Benly","Other"],
  Yamaha: ["YBR 125","YBR 125G","YBR 125Z","YB 125Z","YBR 150","XTZ 125","Other"],
  Suzuki: ["GD 110","GS 150","GR 150","Other"],
  United: ["US 70","US 100","US 125","US 150","Other"],
  "Road Prince": ["RP 70","RP 100","RP 125","Other"],
  Ravi: ["Ravi 70","Ravi 100","Other"],
  "Super Power": ["SP 70","SP 100","SP 125","Other"],
  "Ravi Piaggio": ["Piaggio 70","Piaggio 100","Other"],
  Crown: ["Crown 70","Crown 100","Other"],
  Unique: ["Unique 70","Unique 100","Other"],
  Roma: ["Roma 70","Roma 100","Other"],
  Metro: ["Metro 70","Metro 100","Other"],
  Sohrab: ["Sohrab 70","Sohrab 100","Other"],
  Hero: ["Hero 70","Hero 100","Other"],
  Other: ["Other"],
};

const BIKE_ENGINE = ["70cc","100cc","110cc","125cc","150cc","200cc","250cc+","Electric","Other"];

const MOBILE_BRANDS = ["Apple","Samsung","Xiaomi","Oppo","Vivo","Realme","OnePlus","Huawei","Honor","Google","Infinix","Tecno","Itel","Nokia","Sony","Motorola","Asus","Nothing","Lenovo","QMobile","Other"];

const MOBILE_MODELS_BY_BRAND = {
  Apple: ["iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15 Plus","iPhone 15","iPhone 14 Pro Max","iPhone 14 Pro","iPhone 14 Plus","iPhone 14","iPhone 13 Pro Max","iPhone 13 Pro","iPhone 13","iPhone 12 Pro Max","iPhone 12","iPhone 11 Pro Max","iPhone 11","iPhone XS Max","iPhone XR","iPhone X","iPhone SE 2022","iPhone SE 2020","iPad Pro","iPad Air","iPad Mini","iPad","Other"],
  Samsung: ["Galaxy S24 Ultra","Galaxy S24+","Galaxy S24","Galaxy S23 Ultra","Galaxy S22 Ultra","Galaxy S21","Galaxy Z Fold 5","Galaxy Z Flip 5","Galaxy A54","Galaxy A34","Galaxy A14","Galaxy M34","Galaxy Tab S9","Galaxy Tab S8","Other"],
  Xiaomi: ["14 Pro","14","13 Pro","13","12 Pro","12","11T Pro","Redmi Note 13 Pro","Redmi Note 13","Redmi Note 12","Redmi 13C","Redmi 12","Poco X6 Pro","Poco F5","Other"],
  Oppo: ["Find X7","Reno 11 Pro","Reno 10","Reno 8","A78","A58","A17","A16","A5s","Other"],
  Vivo: ["X100 Pro","X90","V29 Pro","V29","Y36","Y27","Y22","Y17s","Y02","Other"],
  Realme: ["GT 5 Pro","GT Neo 5","12 Pro+","11 Pro","C67","C55","C53","Narzo 60","Other"],
  OnePlus: ["12","11","10 Pro","9 Pro","Nord 3","Nord CE 3","Other"],
  Google: ["Pixel 8 Pro","Pixel 8","Pixel 7 Pro","Pixel 7","Pixel 6a","Other"],
  Infinix: ["Zero 30","Note 40","Note 30","Hot 40","Hot 30","Smart 8","Other"],
  Tecno: ["Camon 30","Camon 20","Spark 20","Spark 10","Pova 5","Other"],
  Other: ["Other"],
};

const MOBILE_STORAGE = ["32GB","64GB","128GB","256GB","512GB","1TB"];
const MOBILE_RAM = ["2GB","3GB","4GB","6GB","8GB","12GB","16GB"];
const MOBILE_NETWORK = ["5G","4G LTE","3G","WiFi Only"];

const PROPERTY_TYPES = ["House","Apartment","Flat","Plot","Commercial","Farm House","Shop","Office","Warehouse","Building","Other"];
const PROPERTY_PURPOSE = ["For Sale","For Rent","For Lease"];
const PROPERTY_SUB_TYPES = ["Residential","Commercial","Industrial","Agricultural","Other"];
const PROPERTY_TITLE_TYPE = ["Freehold","Leasehold","Registry","Fard","Allotment","Other"];
const PROPERTY_SOCIETIES = ["DHA","Bahria Town","LDA","CDA","RDA","Askari","Gulberg Greens","Model Town Society","Other"];
const PROPERTY_AREA_UNITS = ["Marla","Kanal","Sq. Ft.","Sq. Yards","Acre"];
const PROPERTY_FACING = ["North","South","East","West","North-East","North-West","South-East","South-West","Corner","Main Road","Other"];
const PROPERTY_DOCUMENTS = ["Registry","Fard","NOC","Allotment Letter","Transfer Letter","Sale Deed","Other"];

const ELECTRONICS_BRANDS = ["Apple","Samsung","Dell","HP","Lenovo","Asus","Acer","MSI","Sony","LG","JBL","Bose","Beats","Canon","Nikon","Fujifilm","Logitech","Razer","Other"];
const ELECTRONICS_TYPES = ["Laptop","Desktop","TV","Camera","Audio","Gaming Console","Monitor","Printer","Router","Tablet","Wearable","Other"];

const TOYS_BRANDS = ["LEGO","Fisher-Price","Hasbro","Mattel","Hot Wheels","Barbie","Nerf","Playmobil","Melissa & Doug","VTech","Chicco","Bright Starts","Funskool","Hamleys","Toyzone","Bandai","Spin Master","Ravensburger","Crayola","Play-Doh","Other"];

const TOYS_MODELS_BY_BRAND = {
  LEGO: ["City","Technic","Star Wars","Harry Potter","Friends","Creator","DUPLO","Ideas","Other"],
  "Fisher-Price": ["Laugh & Learn","Little People","Rainforest","Kick & Play","Other"],
  Hasbro: ["Play-Doh","Monopoly","Nerf","Transformers","My Little Pony","Peppa Pig","Other"],
  Mattel: ["Barbie","Hot Wheels","Fisher-Price","UNO","Matchbox","Other"],
  "Hot Wheels": ["Basic Car","Track Set","Monster Trucks","Ultimate Garage","Other"],
  Barbie: ["Dreamhouse","Fashion Doll","Career Doll","Playset","Other"],
  Nerf: ["Elite","N-Strike","Fortnite","Rival","Other"],
  Playmobil: ["City","Farm","Castle","Space","Other"],
  "Melissa & Doug": ["Wooden Puzzles","Pretend Play","Arts & Crafts","Other"],
  VTech: ["Baby Monitor","Learning Tablet","KidiZoom","Other"],
  Chicco: ["Baby Rattle","Activity Gym","First Bike","Other"],
  Other: ["Other"],
};

const TOYS_GENDER = ["Unisex","Boys","Girls"];
const TOYS_MATERIALS = ["Plastic","Wood","Metal","Fabric / Plush","Rubber","Foam","Paper / Cardboard","Mixed","Other"];
const TOYS_ACCESSORIES = ["Original Box","Manual / Instructions","Charger / Cable","Batteries","Extra Pieces","Storage Bag","Other"];

const specGroupsByCategory = {
  Vehicles: [
    {
      title: "Vehicle Basics",
      icon: FaCar,
      fields: [
        { key: "make",     label: "Make",          icon: FaCar,          kind: "suggest", suggestions: VEHICLE_MAKES, placeholder: "e.g., Toyota", required: true },
        { key: "model",    label: "Model",         icon: FaCar,          kind: "suggest", suggestionsKey: "models", placeholder: "e.g., Corolla", required: true },
        { key: "year",     label: "Year",          icon: FaCalendarAlt,  kind: "number",  placeholder: "e.g., 2022", required: true },
        { key: "bodyType", label: "Body Type",     icon: FaCar,          kind: "select",  options: VEHICLE_BODY_TYPES },
        { key: "color",    label: "Exterior Color",icon: FaPalette,      kind: "color" },
      ],
    },
    {
      title: "Engine & Performance",
      icon: FaCog,
      fields: [
        { key: "engine",       label: "Engine (cc)",   icon: FaCog,           kind: "text",   placeholder: "e.g., 1800cc" },
        { key: "transmission", label: "Transmission",  icon: FaCog,           kind: "select", options: VEHICLE_TRANSMISSIONS, required: true },
        { key: "fuel",         label: "Fuel Type",     icon: FaGasPump,       kind: "select", options: VEHICLE_FUELS, required: true },
        { key: "mileage",      label: "Mileage (km)",  icon: FaTachometerAlt, kind: "text",   placeholder: "e.g., 45,000" },
      ],
    },
    {
      title: "Registration & History",
      icon: FaShieldAlt,
      fields: [
        { key: "registeredIn",  label: "Registered City",   icon: FaCity,       kind: "suggest", suggestions: VEHICLE_REGISTERED_IN, placeholder: "e.g., Lahore" },
        { key: "ownersCount",   label: "Number of Owners",  icon: FaUserTie,    kind: "select",  options: VEHICLE_OWNERS },
        { key: "accidentFree",  label: "Accident Free",     icon: FaShieldAlt,  kind: "select",  options: ["Yes","No","Minor"] },
      ],
    },
  ],

  Bikes: [
    {
      title: "Bike Information",
      icon: FaMotorcycle,
      fields: [
        { key: "make",  label: "Make",  icon: FaMotorcycle,  kind: "suggest", suggestions: BIKE_MAKES, placeholder: "e.g., Honda", required: true },
        { key: "model", label: "Model", icon: FaMotorcycle,  kind: "suggest", suggestionsKey: "models", placeholder: "e.g., CD 70", required: true },
        { key: "year",  label: "Year",  icon: FaCalendarAlt, kind: "number",  placeholder: "e.g., 2023", required: true },
        { key: "color", label: "Color", icon: FaPalette,     kind: "color" },
      ],
    },
    {
      title: "Condition & Registration",
      icon: FaShieldAlt,
      fields: [
        { key: "engine",       label: "Engine (cc)",       icon: FaCog,           kind: "select", options: BIKE_ENGINE },
        { key: "mileage",      label: "Mileage (km)",      icon: FaTachometerAlt, kind: "text",   placeholder: "e.g., 4,200" },
        { key: "registeredIn", label: "Registered City",   icon: FaCity,          kind: "suggest", suggestions: VEHICLE_REGISTERED_IN, placeholder: "e.g., Lahore" },
        { key: "ownersCount",  label: "Number of Owners",  icon: FaUserTie,       kind: "select", options: VEHICLE_OWNERS },
      ],
    },
  ],

  Mobiles: [
    {
      title: "Device Information",
      icon: FaMobileAlt,
      fields: [
        { key: "brand",   label: "Brand",   icon: FaMobileAlt, kind: "suggest", suggestions: MOBILE_BRANDS, placeholder: "e.g., Apple", required: true },
        { key: "model",   label: "Model",   icon: FaMobileAlt, kind: "suggest", suggestionsKey: "models", placeholder: "e.g., iPhone 15 Pro Max", required: true },
        { key: "storage", label: "Storage", icon: FaHdd,       kind: "select", options: MOBILE_STORAGE, required: true },
        { key: "ram",     label: "RAM",     icon: FaMemory,    kind: "select", options: MOBILE_RAM },
        { key: "network", label: "Network", icon: FaWifi,      kind: "select", options: MOBILE_NETWORK },
        { key: "color",   label: "Color",   icon: FaPalette,   kind: "color" },
      ],
    },
    {
      title: "Battery & Warranty",
      icon: FaBatteryFull,
      fields: [
        { key: "battery",      label: "Battery Health",             icon: FaBatteryFull,  kind: "text",   placeholder: "e.g., 98%" },
        { key: "warranty",     label: "Warranty",                   icon: FaFileContract, kind: "text",   placeholder: "e.g., 6 months" },
        { key: "pta",          label: "PTA Approved",               icon: FaCheckCircle,  kind: "select", options: ["Yes","No"], required: true },
        { key: "boxAvailable", label: "Box & Accessories",          icon: FaBoxOpen,      kind: "select", options: ["Yes","No"] },
        { key: "fingerprint",  label: "Face/Fingerprint Working",   icon: FaFingerprint,  kind: "select", options: ["Yes","No"] },
      ],
    },
    {
      title: "Condition Details",
      icon: FaShieldAlt,
      fields: [
        { key: "screenCondition", label: "Screen Condition", icon: FaMobileAlt, kind: "select", options: ["Perfect","Minor scratches","Cracked"] },
        { key: "bodyCondition",   label: "Body Condition",   icon: FaMobileAlt, kind: "select", options: ["Perfect","Minor dents","Damaged"] },
        { key: "repaired",        label: "Any Repairs?",     icon: FaWrench,    kind: "select", options: ["Never opened","Screen replaced","Battery replaced","Other"] },
      ],
    },
  ],

  Property: [
    {
      title: "Property Type & Basic",
      icon: FaHome,
      fields: [
        { key: "type",       label: "Property Type",       icon: FaHome,          kind: "select",  options: PROPERTY_TYPES, required: true },
        { key: "purpose",    label: "Purpose",             icon: FaKey,           kind: "select",  options: PROPERTY_PURPOSE, required: true },
        { key: "subType",    label: "Sub-Type",            icon: FaBuilding,      kind: "select",  options: PROPERTY_SUB_TYPES },
        { key: "title_type", label: "Title Type",          icon: FaFileContract,  kind: "select",  options: PROPERTY_TITLE_TYPE },
        { key: "society",    label: "Society / Authority", icon: FaRegBuilding,   kind: "suggest", suggestions: PROPERTY_SOCIETIES, placeholder: "e.g., DHA, Bahria" },
      ],
    },
    {
      title: "Area & Layout",
      icon: FaRulerCombined,
      fields: [
        { key: "area",            label: "Area",              icon: FaRulerCombined, kind: "text",   placeholder: "e.g., 10", required: true },
        { key: "areaUnit",        label: "Area Unit",         icon: FaRulerVertical, kind: "select", options: PROPERTY_AREA_UNITS, required: true },
        { key: "beds",            label: "Bedrooms",          icon: FaBed,           kind: "select", options: ["1","2","3","4","5","6","7","8+"] },
        { key: "baths",           label: "Bathrooms",         icon: FaBath,          kind: "select", options: ["1","2","3","4","5","6+"] },
        { key: "floors",          label: "Floors",            icon: FaLayerGroup,    kind: "select", options: ["Ground only","Ground + 1","Ground + 2","Ground + 3+"] },
        { key: "kitchens",        label: "Kitchens",          icon: FaUtensils,      kind: "select", options: ["1","2","3+"] },
        { key: "servantQuarters", label: "Servant Quarters",  icon: FaHome,          kind: "select", options: ["Yes","No"] },
      ],
    },
    {
      title: "Features & Amenities",
      icon: FaStar,
      fields: [
        { key: "facing",    label: "Facing",         icon: FaCompass, kind: "select", options: PROPERTY_FACING },
        { key: "parking",   label: "Parking Spaces", icon: FaParking, kind: "select", options: ["None","1","2","3","4+"] },
        { key: "furnished", label: "Furnishing",     icon: FaChair,   kind: "select", options: ["Unfurnished","Semi-Furnished","Fully Furnished"] },
      ],
    },
    {
      title: "Legal & Documents",
      icon: FaFileContract,
      fields: [
        { key: "documents",   label: "Documents Available",  icon: FaFileContract, kind: "multi",  options: PROPERTY_DOCUMENTS },
        { key: "loanFree",    label: "Loan / Mortgage Free", icon: FaUniversity,   kind: "select", options: ["Yes","No"], required: true },
        { key: "disputeFree", label: "Dispute Free",         icon: FaShieldAlt,    kind: "select", options: ["Yes","No"], required: true },
        { key: "possession",  label: "Possession",           icon: FaKey,          kind: "select", options: ["Immediate","On Payment","1 Month","3 Months+"] },
        { key: "plotNumber",  label: "Plot / House No.",     icon: FaHome,         kind: "text",   placeholder: "Optional" },
      ],
    },
    {
      title: "Pricing & Availability",
      icon: FaMoneyBillWave,
      fields: [
        { key: "priceNegotiable",    label: "Price Negotiable",       icon: FaMoneyBillWave, kind: "select", options: ["Yes","No","Slightly"] },
        { key: "installments",       label: "Installments Available", icon: FaMoneyBillWave, kind: "select", options: ["Yes","No"] },
        { key: "taxPaid",            label: "Taxes Paid",             icon: FaFileContract,  kind: "select", options: ["Yes","No"] },
        { key: "maintenanceCharges", label: "Monthly Maintenance",    icon: FaMoneyBillWave, kind: "text",   placeholder: "e.g., Rs 5,000" },
      ],
    },
  ],

  Electronics: [
    {
      title: "Device Information",
      icon: FaLaptop,
      fields: [
        { key: "brand",     label: "Brand",       icon: FaLaptop,      kind: "suggest", suggestions: ELECTRONICS_BRANDS, placeholder: "e.g., Apple, Dell", required: true },
        { key: "model",     label: "Model",       icon: FaLaptop,      kind: "text",    placeholder: "e.g., MacBook Pro 14", required: true },
        { key: "type",      label: "Type",        icon: FaLaptop,      kind: "select",  options: ELECTRONICS_TYPES },
        { key: "processor", label: "Processor",   icon: FaMicrochip,   kind: "text",    placeholder: "e.g., M3 Pro, i7-13700H" },
        { key: "ram",       label: "RAM",         icon: FaMemory,      kind: "select",  options: ["4GB","8GB","16GB","32GB","64GB+"] },
        { key: "storage",   label: "Storage",     icon: FaHdd,         kind: "text",    placeholder: "e.g., 512GB SSD" },
        { key: "screen",    label: "Screen Size", icon: FaLaptop,      kind: "text",    placeholder: "e.g., 14 inch" },
        { key: "camera",    label: "Camera",      icon: FaCameraRetro, kind: "text",    placeholder: "e.g., 4K Webcam" },
        { key: "color",     label: "Color",       icon: FaPalette,     kind: "color" },
      ],
    },
    {
      title: "Condition & Warranty",
      icon: FaShieldAlt,
      fields: [
        { key: "warranty",     label: "Warranty",          icon: FaFileContract, kind: "text",   placeholder: "e.g., 1 year" },
        { key: "boxAvailable", label: "Box & Accessories", icon: FaBoxOpen,      kind: "select", options: ["Yes","No"] },
        { key: "repaired",     label: "Any Repairs?",      icon: FaWrench,       kind: "select", options: ["Never opened","Minor repair","Major repair"] },
        { key: "year",         label: "Year",              icon: FaCalendarAlt,  kind: "number", placeholder: "e.g., 2023" },
      ],
    },
  ],

  Toys: [
    {
      title: "Toy Basics",
      icon: FaGamepad,
      fields: [
        { key: "gender",   label: "Suitable For", icon: FaChild,   kind: "select", options: TOYS_GENDER },
        { key: "material", label: "Material",     icon: FaGem,     kind: "select", options: TOYS_MATERIALS },
        { key: "color",    label: "Color",        icon: FaPalette, kind: "color" },
      ],
    },
    {
      title: "Features & Packaging",
      icon: FaBoxOpen,
      fields: [
        { key: "battery",     label: "Battery Required",  icon: FaBatteryFull,  kind: "select", options: ["Yes","No","Included"] },
        { key: "assembly",    label: "Assembly Required", icon: FaTools,        kind: "select", options: ["Yes","No"] },
        { key: "packaging",   label: "Packaging",         icon: FaBoxOpen,      kind: "select", options: ["Original Box","No Box","Damaged Box"] },
        { key: "accessories", label: "Included Items",    icon: FaPlus,         kind: "multi",  options: TOYS_ACCESSORIES },
        { key: "warranty",    label: "Warranty",          icon: FaFileContract, kind: "text",   placeholder: "e.g., 3 months" },
      ],
    },
    {
      title: "Pricing & Delivery",
      icon: FaMoneyBillWave,
      fields: [
        { key: "quantity",     label: "Quantity Available", icon: FaCube,         kind: "text",   placeholder: "e.g., 1" },
        { key: "delivery",     label: "Delivery Available", icon: FaShippingFast, kind: "select", options: ["Yes","No","Pickup Only"] },
        { key: "returnPolicy", label: "Return Policy",      icon: FaUndo,         kind: "select", options: ["No Returns","7 Days","14 Days","Other"] },
      ],
    },
  ],
};

const getModelSuggestions = (category, make) => {
  if (category === "Vehicles") return VEHICLE_MODELS_BY_MAKE[make] || [];
  if (category === "Bikes")    return BIKE_MODELS_BY_MAKE[make] || [];
  if (category === "Mobiles")  return MOBILE_MODELS_BY_BRAND[make] || [];
  if (category === "Toys")     return TOYS_MODELS_BY_BRAND[make] || [];
  return [];
};

/* ═══ SuggestInput — Modern ═══ */
const SuggestInput = ({
  label, value, onChange, placeholder, icon: Icon, suggestions = [],
  error, maxSuggestions = 8, required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = String(value || "").trim().toLowerCase();
    if (!q) return suggestions.slice(0, maxSuggestions);
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, maxSuggestions);
  }, [value, suggestions, maxSuggestions]);

  const pick = (s) => { onChange(s); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % filtered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Enter") { e.preventDefault(); pick(filtered[highlight]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="pa-label">
        {label}
        {required && <span style={{ color: "var(--pa-danger)" }}>*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: "var(--pa-primary)" }} />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`font-ticket-body w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3.5 rounded-xl text-sm pa-input`}
          style={error ? { borderColor: "var(--pa-danger)" } : undefined}
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] overflow-hidden max-h-56 overflow-y-auto scrollbar-hide"
            style={{ background: "var(--pa-bg-1)", border: "1px solid var(--pa-line)" }}
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                className="px-3.5 py-2.5 font-ticket-body text-xs cursor-pointer"
                style={
                  i === highlight
                    ? { background: "var(--pa-primary-soft)", color: "var(--pa-primary-2)", fontWeight: 700 }
                    : { color: "var(--pa-txt)" }
                }
              >
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {error && <p className="font-ticket-body text-[11px] mt-1.5" style={{ color: "var(--pa-danger)" }}>{error}</p>}
    </div>
  );
};

/* ═══ MultiSelect — Modern ═══ */
const MultiSelect = ({ label, values = [], onChange, options = [], icon: Icon, error, required = false }) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const toggle = (opt) => {
    const has = values.includes(opt);
    onChange(has ? values.filter((v) => v !== opt) : [...values, opt]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return showAll || q ? base : base.slice(0, 12);
  }, [search, options, showAll]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label className="pa-label" style={{ marginBottom: 0 }}>
          {Icon && <Icon className="text-[10px]" style={{ color: "var(--pa-primary)" }} />}
          {label}
          {required && <span style={{ color: "var(--pa-danger)" }}>*</span>}
        </label>
        {values.length > 0 && (
          <span className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: "var(--pa-primary-2)", background: "var(--pa-primary-soft)", borderColor: "var(--pa-primary)" }}>
            {values.length} selected
          </span>
        )}
      </div>

      {options.length > 12 && (
        <div className="relative mb-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..." className="font-ticket-body w-full pl-8 pr-3 py-2.5 rounded-lg text-xs pa-input" />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3"
            style={{ color: "var(--pa-primary)" }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filtered.map((opt) => {
          const isOn = values.includes(opt);
          return (
            <motion.button key={opt} type="button" whileTap={{ scale: 0.95 }} onClick={() => toggle(opt)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border font-ticket-body text-[11px] font-bold transition-all"
              style={isOn
                ? {
                    borderColor: "var(--pa-primary)",
                    background: "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)",
                    color: "#fff",
                    boxShadow: "0 8px 18px -10px var(--pa-primary-glow)",
                  }
                : {
                    borderColor: "var(--pa-line-str)",
                    color: "var(--pa-txt)",
                    background: "var(--pa-panel-2)",
                  }}>
              {isOn ? <FaCheck className="text-[9px]" /> : <FaPlus className="text-[8px] opacity-60" />}
              <span>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {options.length > 12 && !search && (
        <button type="button" onClick={() => setShowAll((v) => !v)}
          className="mt-2.5 font-ticket-body text-[10px] font-bold underline decoration-dotted underline-offset-2 hover:opacity-80"
          style={{ color: "var(--pa-primary-2)" }}>
          {showAll ? "Show fewer" : `Show all ${options.length} options`}
        </button>
      )}

      {error && <p className="font-ticket-body text-[11px] mt-2" style={{ color: "var(--pa-danger)" }}>{error}</p>}
    </div>
  );
};

/* ═══ ColorPicker — Modern ═══ */
const ColorPicker = ({ label, value, onChange, icon: Icon, error, required }) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <label className="pa-label" style={{ marginBottom: 0 }}>
          {Icon && <Icon className="text-[10px]" style={{ color: "var(--pa-primary)" }} />}
          {label}
          {required && <span style={{ color: "var(--pa-danger)" }}>*</span>}
        </label>
        {value && (
          <span className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: "var(--pa-primary-2)", background: "var(--pa-primary-soft)", borderColor: "var(--pa-primary)" }}>
            {value}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {COLORS.map((c) => {
          const active = value === c.name;
          return (
            <button key={c.name} type="button" title={c.name}
              onClick={() => onChange(active ? "" : c.name)}
              className={`relative h-9 w-9 rounded-full border-2 transition-all flex-shrink-0 ${active ? "scale-115" : "hover:scale-110"}`}
              style={{
                backgroundColor: c.hex,
                borderColor: active ? "var(--pa-primary)" : "var(--pa-line-str)",
                boxShadow: active ? "0 0 0 4px var(--pa-primary-soft), 0 10px 20px -10px var(--pa-primary-glow)" : undefined,
              }}>
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <FaCheck className="text-[10px]"
                    style={{
                      color: c.name === "White" || c.name === "Beige" || c.name === "Silver" || c.name === "Gold" ? "#000" : "#fff",
                    }} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="font-ticket-body text-[11px] mt-2" style={{ color: "var(--pa-danger)" }}>{error}</p>}
    </div>
  );
};

/* Location helpers */
const matchCity = (raw) => {
  if (!raw) return null;
  const target = String(raw).trim().toLowerCase();
  const exact = CITIES.find((c) => c.toLowerCase() === target);
  if (exact) return exact;
  const partial = CITIES.find(
    (c) => target.includes(c.toLowerCase()) || c.toLowerCase().includes(target)
  );
  return partial || null;
};

const detectLocation = () =>
  new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) throw new Error("Reverse geocode failed");
    const data = await res.json();
    return {
      city: data.city || data.locality || data.principalSubdivision || "",
      area: data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name || data.locality || "",
      country: data.countryName || "",
      raw: data,
    };
  } catch {
    return { city: "", area: "", country: "", raw: null };
  }
};


/* ═══ MODERN IMAGE EDITOR MODAL — crop, rotate, filters, adjust ═══ */
const ImageEditorModal = ({ image, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  /* Filters & adjustments */
  const FILTERS = [
    { id: "original", label: "Original",   css: "none" },
    { id: "warm",     label: "Warm",       css: "sepia(0.35) saturate(1.4) hue-rotate(-10deg) brightness(1.03)" },
    { id: "cool",     label: "Cool",       css: "saturate(1.2) hue-rotate(15deg) brightness(1.02)" },
    { id: "bw",       label: "B&W",        css: "grayscale(1) contrast(1.05)" },
    { id: "sepia",    label: "Sepia",      css: "sepia(0.85) saturate(1.1)" },
    { id: "vivid",    label: "Vivid",      css: "saturate(1.7) contrast(1.08)" },
    { id: "fade",     label: "Fade",       css: "saturate(0.7) brightness(1.08) contrast(0.9)" },
    { id: "noir",     label: "Noir",       css: "grayscale(1) contrast(1.35) brightness(0.95)" },
  ];

  const CROPS = [
    { id: "free", label: "Free",  ratio: null },
    { id: "1-1",  label: "1:1",   ratio: 1 },
    { id: "4-3",  label: "4:3",   ratio: 4 / 3 },
    { id: "16-9", label: "16:9",  ratio: 16 / 9 },
    { id: "3-4",  label: "3:4",   ratio: 3 / 4 },
    { id: "9-16", label: "9:16",  ratio: 9 / 16 },
  ];

  const [activeTab, setActiveTab] = useState("crop"); // crop | filters | adjust
  const [filter, setFilter] = useState("original");
  const [cropRatio, setCropRatio] = useState("free");
  const [rotation, setRotation] = useState(0);       // degrees, multiples of 90
  const [flipH, setFlipH] = useState(false);

  /* Adjustment sliders */
  const [brightness, setBrightness] = useState(100); // %
  const [contrast,   setContrast]   = useState(100); // %
  const [saturate,   setSaturate]   = useState(100); // %
  const [blur,       setBlur]       = useState(0);   // px

  const [busy, setBusy] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  /* Reset */
  const handleReset = () => {
    setFilter("original");
    setCropRatio("free");
    setRotation(0);
    setFlipH(false);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setBlur(0);
  };

  /* Load image */
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () => {
      setLoaded(true);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    if (img.complete && img.naturalWidth) onLoad();
    else img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [image?.url]);

  /* Build filter string */
  const currentFilterCss = useMemo(() => {
    const base = FILTERS.find((f) => f.id === filter)?.css || "none";
    const extra = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px)`;
    return base === "none" ? extra : `${base} ${extra}`;
  }, [filter, brightness, contrast, saturate, blur]);

  /* Apply to canvas & save */
  const handleSave = async () => {
    setBusy(true);
    try {
      const img = imgRef.current;
      if (!img) throw new Error("Image not ready");

      // Compute crop based on ratio
      const targetRatio = CROPS.find((c) => c.id === cropRatio)?.ratio;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

      if (targetRatio) {
        const currentRatio = sw / sh;
        if (currentRatio > targetRatio) {
          // Too wide → crop sides
          const newW = sh * targetRatio;
          sx = (sw - newW) / 2;
          sw = newW;
        } else {
          // Too tall → crop top/bottom
          const newH = sw / targetRatio;
          sy = (sh - newH) / 2;
          sh = newH;
        }
      }

      // Handle 90° rotation in canvas
      const rad = (rotation * Math.PI) / 180;
      const rotSwap = rotation % 180 !== 0;
      const outW = rotSwap ? sh : sw;
      const outH = rotSwap ? sw : sh;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");

      ctx.filter = currentFilterCss.replace(/blur\([^)]+\)/, ""); // skip blur for stability
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(rad);
      if (flipH) ctx.scale(-1, 1);

      const drawW = rotSwap ? sh : sw;
      const drawH = rotSwap ? sw : sh;
      ctx.drawImage(img, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH);

      // Export
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!blob) throw new Error("Could not export image");

      const url = URL.createObjectURL(blob);
      const file = new File([blob], (image.name || "edited").replace(/\.[^.]+$/, "") + "-edited.jpg", { type: "image/jpeg" });

      onSave({ id: image.id, url, file, name: file.name, edited: true });
    } catch (err) {
      console.error("Edit save error:", err);
    } finally {
      setBusy(false);
    }
  };

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100000] flex flex-col"
      style={{
        background: "rgba(6, 6, 10, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #fc9d03 0%, #f59e0b 100%)", boxShadow: "0 8px 20px -8px rgba(252,157,3,0.6)" }}>
            <FaPaintBrush className="text-white text-sm" />
          </div>
          <div className="min-w-0">
            <p className="font-ticket-display text-sm sm:text-base font-bold text-white truncate">
              Edit Photo
            </p>
            <p className="font-ticket-body text-[10px] text-white/50 truncate">
              Crop, rotate, filter, and fine-tune
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white/80 hover:text-white border border-white/10 hover:border-white/25 transition-colors"
          >
            <FaUndo className="text-[10px]" />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Preview */}
        <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 min-h-0 bg-[#0a0a10]">
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              ref={imgRef}
              src={image.url}
              alt={image.name || "Edit"}
              draggable={false}
              className="block max-w-full max-h-[42vh] lg:max-h-[75vh] rounded-2xl shadow-2xl select-none transition-transform"
              style={{
                filter: currentFilterCss,
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
              }}
            />
          </div>

          {/* quick rotate/flip buttons overlay */}
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-2 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}>
            <button
              type="button"
              onClick={() => setRotation((r) => r - 90)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition"
              title="Rotate left"
            >
              <FaUndo className="text-xs" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => r + 90)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition"
              title="Rotate right"
            >
              <FaUndo className="text-xs -scale-x-100" />
            </button>
            <div className="w-px h-4 bg-white/15" />
            <button
              type="button"
              onClick={() => setFlipH((f) => !f)}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition ${flipH ? "bg-[#fc9d03] text-white" : "text-white/85 hover:text-white hover:bg-white/10"}`}
              title="Flip horizontally"
            >
              <FaArrowsAltH className="text-xs" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 lg:w-[340px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col"
          style={{ background: "rgba(15,15,22,0.85)" }}>
          {/* Tabs */}
          <div className="flex-shrink-0 flex items-center gap-1 p-2 border-b border-white/10">
            {[
              { id: "crop",    label: "Crop",    icon: FaCropAlt },
              { id: "filters", label: "Filters", icon: FaMagic },
              { id: "adjust",  label: "Adjust",  icon: FaSlidersH },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold transition-colors"
                  style={
                    active
                      ? { background: "linear-gradient(135deg, #fc9d03 0%, #f59e0b 100%)", color: "#fff" }
                      : { color: "rgba(255,255,255,0.7)" }
                  }
                >
                  <Icon className="text-[10px]" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-hide">
            {/* CROP */}
            {activeTab === "crop" && (
              <div className="space-y-3">
                <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Aspect Ratio
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {CROPS.map((c) => {
                    const active = cropRatio === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCropRatio(c.id)}
                        className="py-3 rounded-xl text-[11px] font-bold border transition-all"
                        style={
                          active
                            ? { background: "var(--pa-primary, #fc9d03)", borderColor: "transparent", color: "#fff", boxShadow: "0 8px 20px -10px rgba(252,157,3,0.6)" }
                            : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }
                        }
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2">
                  <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                    Rotate & Flip
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => r - 90)}
                      className="py-3 rounded-xl text-[11px] font-bold border border-white/12 text-white/80 hover:bg-white/5 transition"
                    >
                      ↺ 90° Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => r + 90)}
                      className="py-3 rounded-xl text-[11px] font-bold border border-white/12 text-white/80 hover:bg-white/5 transition"
                    >
                      ↻ 90° Right
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipH((f) => !f)}
                      className="py-3 rounded-xl text-[11px] font-bold border transition"
                      style={flipH
                        ? { background: "#fc9d03", borderColor: "transparent", color: "#fff" }
                        : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
                    >
                      ⇋ Flip
                    </button>
                  </div>
                </div>
                {naturalSize.w > 0 && (
                  <p className="font-ticket-body text-[10px] text-white/40 pt-1">
                    Original: {naturalSize.w} × {naturalSize.h}px
                  </p>
                )}
              </div>
            )}

            {/* FILTERS */}
            {activeTab === "filters" && (
              <div className="space-y-3">
                <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Choose a filter
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FILTERS.map((f) => {
                    const active = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className="relative rounded-xl overflow-hidden border-2 transition-all group"
                        style={{
                          borderColor: active ? "#fc9d03" : "rgba(255,255,255,0.1)",
                          boxShadow: active ? "0 0 0 3px rgba(252,157,3,0.25)" : "none",
                        }}
                      >
                        <div className="aspect-square overflow-hidden bg-black">
                          <img
                            src={image.url}
                            alt={f.label}
                            className="w-full h-full object-cover"
                            style={{ filter: f.css }}
                          />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-black/60 backdrop-blur-sm">
                          <p className="font-ticket-body text-[9.5px] font-bold text-white text-center">
                            {f.label}
                          </p>
                        </div>
                        {active && (
                          <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-[#fc9d03] flex items-center justify-center shadow-md">
                            <FaCheck className="text-[9px] text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ADJUST */}
            {activeTab === "adjust" && (
              <div className="space-y-4">
                {[
                  { label: "Brightness", value: brightness, set: setBrightness, min: 40, max: 160, icon: FaSun },
                  { label: "Contrast",   value: contrast,   set: setContrast,   min: 40, max: 180, icon: FaAdjust },
                  { label: "Saturation", value: saturate,   set: setSaturate,   min: 0,  max: 200, icon: FaTint },
                  { label: "Blur",       value: blur,       set: setBlur,       min: 0,  max: 8,   icon: FaMagic },
                ].map((row) => {
                  const Icon = row.icon;
                  const pct = ((row.value - row.min) / (row.max - row.min)) * 100;
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="text-[10px]" style={{ color: "#fc9d03" }} />
                          <span className="font-ticket-body text-[11px] font-bold text-white/85">
                            {row.label}
                          </span>
                        </div>
                        <span className="font-ticket-body text-[10px] font-bold text-white/60 tabular-nums">
                          {row.value}{row.label === "Blur" ? "px" : "%"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={row.min}
                        max={row.max}
                        value={row.value}
                        onChange={(e) => row.set(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer edit-slider"
                        style={{
                          background: `linear-gradient(90deg, #fc9d03 0%, #fc9d03 ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`,
                        }}
                      />
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full mt-2 py-2.5 rounded-xl text-[11px] font-bold text-white/75 hover:text-white border border-white/12 hover:bg-white/5 transition flex items-center justify-center gap-2"
                >
                  <FaUndo className="text-[10px]" />
                  Reset all adjustments
                </button>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/10 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex-1 py-3 rounded-xl text-[12px] font-bold text-white/80 hover:text-white border border-white/12 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy || !loaded}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #fc9d03 0%, #f59e0b 100%)",
                boxShadow: "0 12px 24px -12px rgba(252,157,3,0.7)",
              }}
            >
              {busy ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  Saving…
                </>
              ) : (
                <>
                  <FaCheck className="text-xs" />
                  Apply
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* slider thumb styling */}
      <style>{`
        .edit-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #fc9d03;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        }
        .edit-slider::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #fc9d03;
          cursor: pointer;
        }
      `}</style>
    </motion.div>,
    document.body
  );
};

/* ═══ Preview Modal — unchanged ═══ */
const PreviewModal = ({
  images, index, onIndexChange, onClose, onDelete, onClean, onEdit,
  cleaningImageId, cleanProgress,
}) => {
  const img = images[index];
  const hasMultiple = images.length > 1;
  const isCleaning = cleaningImageId === img?.id;
  const isCleaned = !!img?.cleanedUrl;

  useEffect(() => {
    if (!img) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasMultiple) onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowLeft" && hasMultiple) onIndexChange((index - 1 + images.length) % images.length);
    };

    const onWindowClick = (e) => {
      if (e.target && e.target.dataset && e.target.dataset.previewBackdrop === "true") onClose();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onWindowClick);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onWindowClick);
      document.body.style.overflow = prevOverflow;
    };
  }, [img, index, images.length, hasMultiple, onClose, onIndexChange]);

  if (!img) return null;

  const modalContent = (
    <motion.div
      data-preview-backdrop="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex flex-col"
      style={{
        zIndex: 99999,
        background: "rgba(8, 8, 8, 0.85)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close preview"
        className="absolute top-3 right-3 sm:top-6 sm:right-6 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-2xl hover:bg-[#B23A2E] hover:border-[#B23A2E] transition-colors"
        style={{ zIndex: 100000 }}
      >
        <FaTimes className="text-base" />
      </button>

      <div
        className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 pr-16 sm:pr-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/5 border border-white/10 text-white font-ticket-body text-[11px] sm:text-xs font-extrabold flex-shrink-0">
            {index + 1}/{images.length}
          </span>
          <div className="min-w-0">
            <p className="font-ticket-body text-xs font-bold text-white truncate max-w-[160px] sm:max-w-md">
              {img.name || `Photo ${index + 1}`}
            </p>
            <p className="font-ticket-body text-[10px] text-white/50 truncate">
              {isCleaned ? (img.edited ? "Edited" : "Background removed") : "Original"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex-1 relative flex items-center justify-center px-2 sm:px-16 py-2 sm:py-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onIndexChange((index - 1 + images.length) % images.length); }}
            className="absolute left-1 sm:left-6 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#fc9d03] hover:border-[#c8631f] transition-all z-10"
            aria-label="Previous"
          >
            <FaArrowLeft className="text-xs sm:text-sm" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={img.url}
              alt={img.name}
              draggable={false}
              className="block max-w-[92vw] max-h-[60vh] sm:max-w-[88vw] sm:max-h-[70vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()}
              animate={isCleaning ? { scale: [1, 1.015, 1], opacity: 0.6 } : { scale: 1, opacity: 1 }}
              transition={isCleaning ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            />

            <AnimatePresence>
              {isCleaning && (
                <motion.div
                  key="ai-overlay"
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[20px]"
                  style={{ background: "radial-gradient(circle at center, rgba(20,14,8,0.5) 0%, rgba(8,8,8,0.85) 70%)" }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[200px] h-[200px] sm:w-[340px] sm:h-[340px] pointer-events-none"
                    style={{
                      background: "conic-gradient(from 0deg, transparent 0deg, rgba(232,163,61,0.35) 90deg, transparent 180deg, rgba(232,163,61,0.2) 270deg, transparent 360deg)",
                      filter: "blur(40px)",
                    }}
                  />
                  <motion.div
                    animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.6, 0.35] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(232,163,61,0.55) 0%, rgba(232,163,61,0) 70%)", filter: "blur(24px)" }}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 px-4">
                    <div className="relative flex items-center justify-center h-[72px] w-[72px] sm:h-[92px] sm:w-[92px]">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "conic-gradient(from 0deg, transparent 0deg, #E8A33D 60deg, transparent 140deg, #E8A33D 220deg, transparent 300deg, #E8A33D 360deg)",
                          WebkitMaskImage: "radial-gradient(circle, transparent 44%, black 46%)",
                          maskImage: "radial-gradient(circle, transparent 44%, black 46%)",
                          opacity: 0.95,
                        }}
                      />
                      <svg width="72" height="72" viewBox="0 0 92 92" className="absolute inset-0 -rotate-90 sm:hidden">
                        <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                        <motion.circle
                          cx="46" cy="46" r="40" fill="none" stroke="#E8A33D" strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - (cleanProgress || 0) / 100) }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </svg>
                      <svg width="92" height="92" viewBox="0 0 92 92" className="absolute inset-0 -rotate-90 hidden sm:block">
                        <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                        <motion.circle
                          cx="46" cy="46" r="40" fill="none" stroke="#E8A33D" strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - (cleanProgress || 0) / 100) }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </svg>
                      <motion.div
                        animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(145deg, rgba(232,163,61,0.3), rgba(200,99,31,0.4))",
                          border: "1px solid rgba(232,163,61,0.6)",
                          boxShadow: "0 0 20px rgba(232,163,61,0.5), 0 0 0 1px rgba(232,163,61,0.15) inset",
                        }}
                      >
                        <FaMagic className="text-[#F7E5C7] text-base sm:text-lg" />
                      </motion.div>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-center">
                      <p className="font-ticket-display text-sm sm:text-base font-bold text-[#F7E5C7] tracking-wide">
                        AI at work
                      </p>
                      <p className="font-ticket-body text-[10px] sm:text-[11px] text-white/60">
                        {cleanProgress > 0 ? "Isolating subject…" : "Warming up…"}
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(232,163,61,0.35)", backdropFilter: "blur(8px)" }}
                    >
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]"
                      />
                      <span className="font-ticket-body text-[10px] font-extrabold text-[#E8A33D] tabular-nums tracking-wider">
                        {cleanProgress > 0 ? `${cleanProgress}%` : "STARTING"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isCleaned && !isCleaning && (
                <motion.span
                  initial={{ opacity: 0, y: -6, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#E8A33D] text-[#1B1815] font-ticket-body text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-lg"
                >
                  {img.edited ? (
                    <><FaPaintBrush className="text-[9px]" /> Edited</>
                  ) : (
                    <><FaMagic className="text-[9px]" /> Cleaned</>
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onIndexChange((index + 1) % images.length); }}
            className="absolute right-1 sm:right-6 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#fc9d03] hover:border-[#c8631f] transition-all z-10"
            aria-label="Next"
          >
            <FaArrowRight className="text-xs sm:text-sm" />
          </button>
        )}
      </div>

      <div
        className="flex-shrink-0 border-t border-white/10 bg-black/30 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto px-2 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => { e.stopPropagation(); onEdit(img); }}
            title="Edit & Adjust"
            aria-label="Edit & Adjust"
            className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-[#fc9d03] hover:border-[#c8631f] transition-colors shadow-lg"
          >
            <FaPaintBrush className="text-sm sm:text-lg" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: isCleaning ? 1 : 1.08, y: isCleaning ? 0 : -2 }}
            whileTap={{ scale: isCleaning ? 1 : 0.94 }}
            onClick={(e) => { e.stopPropagation(); onClean(img); }}
            disabled={isCleaning}
            title={isCleaning ? "Removing background…" : isCleaned ? "Remove background again" : "Remove background"}
            aria-label="Remove background"
            className={`relative h-10 w-10 sm:h-14 sm:w-14 rounded-full border flex items-center justify-center shadow-lg transition-colors ${
              isCleaning
                ? "bg-[#E8A33D] border-[#B9791E] text-[#1B1815] cursor-wait ai-pulse"
                : "bg-[#E8A33D] border-[#B9791E] text-[#1B1815] hover:brightness-110"
            }`}
          >
            {isCleaning ? (
              <FaSpinner className="text-sm sm:text-lg animate-spin" />
            ) : (
              <FaMagic className="text-sm sm:text-lg" />
            )}
            {isCleaning && cleanProgress > 0 && (
              <span className="absolute -bottom-1 -right-1 min-w-[24px] h-[16px] px-1 rounded-full bg-[#1B1815] text-[#E8A33D] text-[8px] font-extrabold flex items-center justify-center border border-[#E8A33D]/40">
                {cleanProgress}%
              </span>
            )}
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            href={img.url}
            download={img.name || `photo-${index + 1}.jpg`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Download"
            aria-label="Download"
            className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg"
          >
            <FaSave className="text-sm sm:text-lg" />
          </motion.a>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
            title="Delete"
            aria-label="Delete"
            className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-[#B23A2E]/90 border border-[#B23A2E] text-white flex items-center justify-center hover:bg-[#B23A2E] transition-colors shadow-lg"
          >
            <FaTrash className="text-sm sm:text-lg" />
          </motion.button>
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-center gap-1.5 pb-3 sm:pb-4">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); onIndexChange(i); }}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-[#fc9d03]" : "w-1.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

/* ═══ SUCCESS SCREEN ═══ */
const SuccessScreen = ({ listing, onPostAnother, onViewStats, onClose }) => {
  const [boostLoading, setBoostLoading] = useState(false);

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/listing/${listing?.id}`;
    const text = `Check out my listing on APNa Deal: ${listing?.title || "New item"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " — " + url)}`, "_blank");
  };

  const copyLink = () => {
    const url = `${window.location.origin}/listing/${listing?.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleBoost = async (days, price) => {
    setBoostLoading(true);
    try {
      window.location.href = `/checkout?boost=${listing?.id}&days=${days}&amount=${price}`;
    } finally {
      setBoostLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ background: "rgba(8,8,12,0.65)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="max-w-lg w-full rounded-[26px] pa-panel-solid p-5 sm:p-7 shadow-2xl my-auto"
      >
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 success-pop"
            style={{
              border: "2px solid var(--pa-primary)",
              background: "var(--pa-primary-soft)",
              boxShadow: "0 0 0 8px var(--pa-primary-2-soft)",
            }}
          >
            <FaCheckCircle className="text-3xl sm:text-4xl" style={{ color: "var(--pa-primary-2)" }} />
          </motion.div>
          <h2 className="font-ticket-display text-xl sm:text-2xl font-bold mb-1" style={{ color: "var(--cat-txt)" }}>
            Your ad is live! 🎉
          </h2>
          <p className="font-ticket-body text-xs sm:text-sm" style={{ color: "var(--cat-txt-muted)" }}>
            {listing?.status === "pending"
              ? "It will appear after a quick review (usually under 1 hour)."
              : "Buyers can now see your listing on APNa Deal."}
          </p>
        </div>

        {listing?.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-5 border" style={{ borderColor: "var(--pa-line)" }}>
            <img src={listing.cover_image} alt={listing.title} className="w-full h-40 object-cover" />
            <div className="p-3">
              <p className="font-ticket-display text-sm font-bold line-clamp-1" style={{ color: "var(--cat-txt)" }}>
                {listing.title}
              </p>
              <p className="font-ticket-body text-base font-bold mt-0.5" style={{ color: "var(--pa-primary-2)" }}>
                Rs {Number(listing.price || 0).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border p-4 mb-5"
          style={{ borderColor: "var(--pa-primary)", background: "var(--pa-primary-2-soft)" }}>
          <div className="flex items-center gap-2 mb-3">
            <FaRocket className="text-sm" style={{ color: "var(--pa-primary-2)" }} />
            <p className="font-ticket-display text-sm font-bold" style={{ color: "var(--cat-txt)" }}>
              Boost your ad for more views
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { days: 7, price: 200, popular: false },
              { days: 14, price: 350, popular: true },
              { days: 30, price: 600, popular: false },
            ].map((pkg) => (
              <button
                key={pkg.days}
                type="button"
                onClick={() => handleBoost(pkg.days, pkg.price)}
                disabled={boostLoading}
                className="relative rounded-xl border p-3 text-center transition-all hover:scale-[1.03] active:scale-95"
                style={
                  pkg.popular
                    ? { borderColor: "var(--pa-primary)", background: "var(--cat-surface)" }
                    : { borderColor: "var(--pa-line-str)", background: "var(--cat-surface)" }
                }
              >
                {pkg.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full font-ticket-body text-[8px] font-extrabold uppercase tracking-wider text-white"
                    style={{ background: "var(--pa-primary)" }}>
                    Popular
                  </span>
                )}
                <p className="font-ticket-body text-xs font-bold" style={{ color: "var(--cat-txt)" }}>
                  {pkg.days} days
                </p>
                <p className="font-ticket-display text-sm font-bold mt-1" style={{ color: "var(--pa-primary-2)" }}>
                  Rs {pkg.price}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-ticket-body text-xs font-bold transition-colors"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <FaWhatsapp className="text-sm" />
            Share
          </button>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border font-ticket-body text-xs font-bold transition-colors"
            style={{ borderColor: "var(--pa-line-str)", color: "var(--cat-txt)" }}
          >
            <FaShare className="text-sm" />
            Copy Link
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onPostAnother}
            className="flex-1 px-4 py-3 rounded-xl border font-ticket-body text-xs font-bold transition-colors"
            style={{ borderColor: "var(--pa-line-str)", color: "var(--cat-txt)" }}
          >
            Post Another
          </button>
          <button
            onClick={onViewStats}
            className="flex-1 px-4 py-3 rounded-xl text-white font-ticket-body text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)",
              boxShadow: "0 10px 24px -10px var(--pa-primary-glow)",
            }}
          >
            View Stats
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══ Catalog Table — with images + edit/delete actions ═══ */
const CatalogTable = ({
  listings, loading, onAddProduct, onRowClick,
  currentPage, totalPages, totalRows, onPageChange,
  planLimits, listingUsage, onUpgrade,
  onEdit,     // ⭐ NEW — callback to edit a listing
  onDelete,   // ⭐ NEW — callback to delete a listing
}) => {
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // all | active | draft | archived

  /* Close kebab menu on outside click */
  useEffect(() => {
    if (!openMenu) return;
    const close = (e) => {
      if (!e.target.closest("[data-catalog-menu]")) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  /* ═══ Helpers (unchanged logic) ═══ */
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

  const formatListingId = (id) => {
    if (!id) return "—";
    return `SKU ${String(id).replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  };

  const shortAddress = (row) => {
    const parts = [];
    if (row.area && !/^\d+$/.test(String(row.area).trim())) parts.push(row.area);
    if (row.city && row.city !== row.area) parts.push(row.city);
    return parts.length > 0 ? parts.join(", ") : "—";
  };

  const statusColor = (status) => {
    const map = {
      active:   { bg: "rgba(22,163,74,0.12)",   color: "#16A34A", dot: "#16A34A", label: "Active"   },
      pending:  { bg: "rgba(234,179,8,0.14)",   color: "#A16207", dot: "#EAB308", label: "Pending"  },
      sold:     { bg: "rgba(107,114,128,0.14)", color: "#4B5563", dot: "#9CA3AF", label: "Sold"     },
      rejected: { bg: "rgba(220,38,38,0.12)",   color: "#DC2626", dot: "#DC2626", label: "Rejected" },
      draft:    { bg: "rgba(148,163,184,0.14)", color: "#64748B", dot: "#94A3B8", label: "Draft"    },
      archived: { bg: "rgba(107,114,128,0.14)", color: "#4B5563", dot: "#9CA3AF", label: "Archived" },
    };
    return map[status] || map.active;
  };

  const formatDate = (row) =>
    row.posted_at || row.created_at
      ? new Date(row.posted_at || row.created_at).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : "—";

  /* ⭐ Stock indicator (deterministic per listing id) */
  const stockMeta = (row) => {
    if (row.status === "sold") return { level: 0, label: "Out of stock", color: "#DC2626" };
    const seed = String(row.id || "x")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const stock = 10 + (seed % 340);
    if (stock < 30) return { level: stock / 340, label: `${stock} stock · Low`, color: "#DC2626" };
    if (stock < 100) return { level: stock / 340, label: `${stock} stock · Medium`, color: "#F59E0B" };
    return { level: stock / 340, label: `${stock} stock · High`, color: "#16A34A" };
  };

  /* ⭐ Category chips (from specs) */
  const categoryChips = (row) => {
    const chips = [];
    if (row.category) chips.push(row.category);
    const specs = row.specs || {};
    if (specs.type) chips.push(specs.type);
    if (specs.brand) chips.push(specs.brand);
    if (specs.make) chips.push(specs.make);
    if (specs.transmission) chips.push(specs.transmission);
    return chips.slice(0, 3);
  };

  const pageNumbers = useMemo(() => {
    const max = Math.min(4, totalPages);
    const arr = [];
    for (let i = 1; i <= max; i++) arr.push(i);
    return arr;
  }, [totalPages]);

  /* ⭐ Filtered listings (tab + category + search) */
  const filtered = useMemo(() => {
    let f = [...listings];
    if (activeTab === "active") f = f.filter((r) => r.status === "active");
    else if (activeTab === "draft") f = f.filter((r) => r.status === "draft" || r.status === "pending");
    else if (activeTab === "archived") f = f.filter((r) => r.status === "sold" || r.status === "archived");

    if (filterCategory !== "all") f = f.filter((r) => r.category === filterCategory);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      f = f.filter(
        (r) =>
          (r.title || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q) ||
          (r.city || "").toLowerCase().includes(q)
      );
    }
    return f;
  }, [listings, activeTab, filterCategory, search]);

  const allCategories = useMemo(
    () => [...new Set(listings.map((l) => l.category).filter(Boolean))],
    [listings]
  );

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((r) => r.status === "active").length,
      draft: listings.filter((r) => r.status === "draft" || r.status === "pending").length,
      archived: listings.filter((r) => r.status === "sold" || r.status === "archived").length,
    }),
    [listings]
  );

  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((l) => l.id));
  const toggleOne = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /* ═══════════════════════════════════════════════════════════
     Shared sub-components
     ═══════════════════════════════════════════════════════════ */
  const ListingThumb = ({ row, size = 44, rounded = "rounded-lg" }) => {
    const src = row.cover_image || (row.images && row.images[0]);
    return (
      <div
        className={`flex-shrink-0 overflow-hidden ${rounded}`}
        style={{
          width: size,
          height: size,
          background: "var(--cat-hover)",
          border: "1px solid var(--cat-border)",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={row.title || "listing"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: "var(--cat-txt-muted)" }}
          >
            <FaCamera className="text-xs" />
          </div>
        )}
      </div>
    );
  };

  /* Kebab menu — used in both grid and list views */
  const KebabMenu = ({ row }) => {
    const isOpen = openMenu === row.id;
    return (
      <div
        className="relative flex-shrink-0"
        data-catalog-menu
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpenMenu(isOpen ? null : row.id)}
          className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--cat-txt-muted)" }}
        >
          <FaEllipsisH className="text-[11px]" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-30 min-w-[160px] rounded-xl overflow-hidden shadow-xl"
              style={{
                background: "var(--cat-surface)",
                border: "1px solid var(--cat-border)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onRowClick(row);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-ticket-body text-[12px] font-semibold hover:bg-[var(--cat-hover)]"
                style={{ color: "var(--cat-txt)" }}
              >
                <FaEye className="text-[10px]" />
                View
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onEdit?.(row);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-ticket-body text-[12px] font-semibold hover:bg-[var(--cat-hover)]"
                style={{ color: "var(--cat-txt)" }}
              >
                <FaEdit
                  className="text-[10px]"
                  style={{ color: "var(--pa-primary-2)" }}
                />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  const url = `${window.location.origin}/listing/${row.id}`;
                  try {
                    navigator.clipboard.writeText(url);
                  } catch {}
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-ticket-body text-[12px] font-semibold hover:bg-[var(--cat-hover)]"
                style={{ color: "var(--cat-txt)" }}
              >
                <FaCopy className="text-[10px]" />
                Copy link
              </button>
              <div style={{ height: 1, background: "var(--cat-border)" }} />
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  setConfirmDelete(row);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-ticket-body text-[12px] font-semibold hover:bg-[var(--pa-danger-soft)]"
                style={{ color: "var(--pa-danger)" }}
              >
                <FaTrash className="text-[10px]" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* Row actions — used in list view */
  const RowActions = ({ row }) => (
    <div
      className="flex items-center gap-1.5 flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(row);
        }}
        title="Edit"
        aria-label="Edit listing"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors"
        style={{
          border: "1px solid var(--pa-line-str)",
          color: "var(--pa-primary-2)",
          background: "var(--cat-surface)",
        }}
      >
        <FaEdit className="text-[11px]" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmDelete(row);
        }}
        title="Delete"
        aria-label="Delete listing"
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors"
        style={{
          border: "1px solid var(--pa-line-str)",
          color: "var(--pa-danger)",
          background: "var(--cat-surface)",
        }}
      >
        <FaTrash className="text-[11px]" />
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ═══ Page header ═══ */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1
              className="font-ticket-display text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "var(--cat-txt)" }}
            >
              Products
            </h1>
            <button
              type="button"
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ color: "var(--cat-txt-muted)" }}
              title="More options"
            >
              <FaEllipsisH className="text-sm" />
            </button>
          </div>

          {planLimits && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className="cat-chip"
                style={{
                  background: planLimits.isFree ? "var(--pa-primary-soft)" : "var(--pa-success-soft)",
                  color: planLimits.isFree ? "var(--pa-primary-2)" : "var(--pa-success)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {planLimits.plan.name} Plan
              </span>
              <span
                className="font-ticket-body text-[11px]"
                style={{ color: "var(--cat-txt-muted)" }}
              >
                {listingUsage?.max === Infinity
                  ? `${listingUsage?.used || 0} listings · Unlimited`
                  : `${listingUsage?.used || 0} / ${listingUsage?.max || 0} listings used`}
              </span>
              {planLimits.isFree && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="font-ticket-body text-[11px] font-bold underline decoration-dotted underline-offset-2"
                  style={{ color: "var(--pa-primary-2)" }}
                >
                  Upgrade
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!planLimits || planLimits.loading) return;
            const max = planLimits.limitListings;
            if (max === undefined || max === null || Number.isNaN(max)) {
              onAddProduct();
              return;
            }
            if (max === Infinity) {
              onAddProduct();
              return;
            }
            const check = await planLimits.canPostListing();
            if (!check.ok) {
              onUpgrade();
              return;
            }
            onAddProduct();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-ticket-body text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            boxShadow: "0 6px 16px -6px rgba(249,115,22,0.5)",
          }}
        >
          <FaPlus className="text-xs" />
          Add Product
        </button>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide mb-4">
        {[
          { id: "all", label: "All", count: counts.all, icon: FaBox },
          { id: "active", label: "Active", count: counts.active, icon: FaCheckCircle },
          { id: "draft", label: "Draft", count: counts.draft, icon: FaEdit },
          { id: "archived", label: "Archived", count: counts.archived, icon: FaArchive },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className="relative flex-shrink-0 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg font-ticket-body text-[13px] font-semibold transition-colors whitespace-nowrap"
              style={{ color: active ? "var(--cat-txt)" : "var(--cat-txt-muted)" }}
            >
              <Icon className="text-[13px]" />
              {t.label}
              {t.count > 0 && (
                <span
                  className="text-[11px] font-bold tabular-nums opacity-70"
                  style={{ color: active ? "var(--pa-primary-2)" : "var(--cat-txt-muted)" }}
                >
                  {t.count}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="catalog-tab-underline"
                  className="absolute left-2 right-2 bottom-0 h-[2px] rounded-full"
                  style={{ background: "#EA580C" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ Toolbar ═══ */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-[280px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: "var(--cat-txt-muted)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 rounded-lg font-ticket-body text-[13px] outline-none"
            style={{
              background: "var(--cat-surface)",
              border: "1px solid var(--cat-border)",
              color: "var(--cat-txt)",
            }}
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg font-ticket-body text-[13px] font-medium outline-none cursor-pointer"
          style={{
            background: "var(--cat-surface)",
            border: "1px solid var(--cat-border)",
            color: "var(--cat-txt)",
          }}
        >
          <option value="all">Category</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Type filter (hidden on mobile) */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="hidden sm:block px-3 py-2 rounded-lg font-ticket-body text-[13px] font-medium outline-none cursor-pointer"
          style={{
            background: "var(--cat-surface)",
            border: "1px solid var(--cat-border)",
            color: "var(--cat-txt)",
          }}
        >
          <option value="all">Type</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
          <option value="service">Service</option>
        </select>

        {/* Advanced filter */}
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg font-ticket-body text-[13px] font-semibold"
          style={{
            background: "var(--cat-surface)",
            border: "1px solid var(--cat-border)",
            color: "var(--cat-txt)",
          }}
        >
          <FaFilter className="text-[11px]" />
          Advance Filter
          <FaChevronRight className="text-[9px] rotate-90" />
        </button>

        {/* Right: bulk selection + view toggle */}
        <div className="ml-auto flex items-center gap-2">
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "var(--pa-primary-soft)",
                border: "1px solid var(--pa-primary)",
              }}
            >
              <span
                className="font-ticket-body text-[12px] font-bold"
                style={{ color: "var(--pa-primary-2)" }}
              >
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="h-5 w-5 rounded flex items-center justify-center"
                style={{ color: "var(--pa-primary-2)" }}
              >
                <FaTimes className="text-[9px]" />
              </button>
            </motion.div>
          )}

          <div className="cat-toggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid"
            >
              <FaThLarge />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List"
            >
              <FaList />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Loading ═══ */}
      {loading && (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "var(--cat-surface)",
            border: "1px solid var(--cat-border)",
          }}
        >
          <FaSpinner
            className="animate-spin inline-block mb-3"
            style={{ color: "var(--pa-primary)", fontSize: 24 }}
          />
          <p
            className="font-ticket-body text-sm"
            style={{ color: "var(--cat-txt-muted)" }}
          >
            Loading products…
          </p>
        </div>
      )}

      {/* ═══ Empty ═══ */}
      {!loading && filtered.length === 0 && (
        <div
          className="text-center py-20 px-6 rounded-2xl"
          style={{
            background: "var(--cat-surface)",
            border: "1px solid var(--cat-border)",
          }}
        >
          <div
            className="h-16 w-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--pa-primary-soft)" }}
          >
            <FaBox className="text-2xl" style={{ color: "var(--pa-primary)" }} />
          </div>
          <h3
            className="font-ticket-display text-lg font-bold mb-1.5"
            style={{ color: "var(--cat-txt)" }}
          >
            {activeTab === "all" ? "No products yet" : `No ${activeTab} products`}
          </h3>
          <p
            className="font-ticket-body text-sm mb-5 max-w-md mx-auto"
            style={{ color: "var(--cat-txt-muted)" }}
          >
            {search
              ? `No products match "${search}". Try a different search.`
              : "Add your first product to start selling on APNa Deal."}
          </p>
          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-ticket-body text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              boxShadow: "0 6px 16px -6px rgba(249,115,22,0.5)",
            }}
          >
            <FaPlus className="text-xs" />
            Add Product
          </button>
        </div>
      )}

      {/* ═══════════════════ GRID VIEW ═══════════════════ */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((row, idx) => {
            const sc = statusColor(row.status);
            const stock = stockMeta(row);
            const chips = categoryChips(row);
            const isSelected = selected.includes(row.id);

            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                onClick={() => onRowClick(row)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                style={{
                  background: "var(--cat-surface)",
                  border: `1px solid ${
                    isSelected ? "var(--pa-primary)" : "var(--cat-border)"
                  }`,
                  boxShadow: isSelected
                    ? "0 0 0 3px var(--pa-primary-soft)"
                    : undefined,
                }}
              >
                {/* Top: thumb + info */}
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-3 mb-3">
                    <ListingThumb row={row} size={56} rounded="rounded-xl" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-ticket-body text-[13.5px] font-bold truncate leading-snug"
                            style={{ color: "var(--cat-txt)" }}
                            title={row.title}
                          >
                            {row.title || "Untitled"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className="font-ticket-body text-[11px] font-medium"
                              style={{ color: "var(--cat-txt-muted)" }}
                            >
                              {formatListingId(row.id)}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              <span
                                className="h-1 w-1 rounded-full"
                                style={{ background: sc.dot }}
                              />
                              {sc.label}
                            </span>
                          </div>
                        </div>

                        <KebabMenu row={row} />
                      </div>
                    </div>
                  </div>

                  {/* Category chips */}
                  {chips.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      {chips.map((chip, i) => (
                        <span
                          key={i}
                          className="font-ticket-body text-[10.5px] font-medium px-1.5 py-0.5 rounded"
                          style={{
                            color: "var(--cat-txt-muted)",
                            background: "var(--cat-hover)",
                          }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Retail / Wholesale */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className="font-ticket-body text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                        style={{ color: "var(--cat-txt-muted)" }}
                      >
                        Retail
                      </p>
                      <p
                        className="font-ticket-body text-[15px] font-bold tabular-nums"
                        style={{ color: "var(--cat-txt)" }}
                      >
                        {formatPrice(row.price)}
                      </p>
                    </div>
                    <div>
                      <p
                        className="font-ticket-body text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                        style={{ color: "var(--cat-txt-muted)" }}
                      >
                        Wholesale
                      </p>
                      <p
                        className="font-ticket-body text-[15px] font-bold tabular-nums"
                        style={{ color: "var(--cat-txt)" }}
                      >
                        {formatPrice(Number(row.price) * 0.85)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom: stock bar + action */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{
                    borderTop: "1px solid var(--cat-border)",
                    background: "var(--cat-hover)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-ticket-body text-[10.5px] font-bold tabular-nums"
                        style={{ color: stock.color }}
                      >
                        {stock.label}
                      </span>
                    </div>
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: "var(--cat-border)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, stock.level * 100)}%`,
                          background: stock.color,
                        }}
                      />
                    </div>
                  </div>

                  {row.status === "sold" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(row);
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[11px] font-bold text-white transition-all hover:scale-[1.03] active:scale-95"
                      style={{ background: "#0F172A" }}
                    >
                      Reorder
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(row);
                      }}
                      className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        border: "1px solid var(--cat-border)",
                        color: "var(--cat-txt-muted)",
                      }}
                      title="View details"
                    >
                      <FaChevronRight className="text-[10px]" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════ LIST VIEW ═══════════════════ */}
      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--cat-surface)",
            border: "1px solid var(--cat-border)",
          }}
        >
          {filtered.map((row, idx) => {
            const sc = statusColor(row.status);
            const stock = stockMeta(row);
            const chips = categoryChips(row);
            const isSelected = selected.includes(row.id);

            return (
              <div
                key={row.id}
                onClick={() => onRowClick(row)}
                className="flex items-center gap-4 p-3.5 cursor-pointer transition-colors"
                style={{
                  borderBottom:
                    idx < filtered.length - 1
                      ? "1px solid var(--cat-border)"
                      : "none",
                  background: isSelected ? "var(--pa-primary-soft)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--cat-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(row.id)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                </div>

                <ListingThumb row={row} size={48} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p
                      className="font-ticket-body text-[13.5px] font-bold truncate"
                      style={{ color: "var(--cat-txt)" }}
                    >
                      {row.title || "—"}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: sc.dot }}
                      />
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="font-ticket-body text-[11px] font-medium"
                      style={{ color: "var(--cat-txt-muted)" }}
                    >
                      {formatListingId(row.id)}
                    </span>
                    {chips.slice(0, 2).map((chip, i) => (
                      <span
                        key={i}
                        className="font-ticket-body text-[10.5px]"
                        style={{ color: "var(--cat-txt-muted)" }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hidden md:block flex-shrink-0 text-right">
                  <p
                    className="font-ticket-body text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                    style={{ color: "var(--cat-txt-muted)" }}
                  >
                    Retail
                  </p>
                  <p
                    className="font-ticket-body text-[14px] font-bold tabular-nums"
                    style={{ color: "var(--cat-txt)" }}
                  >
                    {formatPrice(row.price)}
                  </p>
                </div>

                <div className="hidden lg:block flex-shrink-0 w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-ticket-body text-[10.5px] font-bold tabular-nums"
                      style={{ color: stock.color }}
                    >
                      {stock.label}
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--cat-border)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(4, stock.level * 100)}%`,
                        background: stock.color,
                      }}
                    />
                  </div>
                </div>

                <KebabMenu row={row} />
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════ MOBILE LIST ═══════════════════ */}
      {!loading && filtered.length > 0 && (
        <div className="cat-mobile-only mt-2">
          <div className="space-y-2.5">
            {filtered.map((row) => {
              const sc = statusColor(row.status);
              const stock = stockMeta(row);
              const isSelected = selected.includes(row.id);

              return (
                <div
                  key={row.id}
                  className="cat-card"
                  onClick={() => onRowClick(row)}
                  style={
                    isSelected
                      ? {
                          borderColor: "var(--pa-primary)",
                          boxShadow: "0 0 0 3px var(--pa-primary-soft)",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <ListingThumb row={row} size={68} rounded="rounded-xl" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className="font-ticket-body text-[11px] font-medium truncate"
                          style={{ color: "var(--cat-txt-muted)" }}
                        >
                          {formatListingId(row.id)}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ background: sc.dot }}
                          />
                          {sc.label}
                        </span>
                      </div>

                      <p
                        className="font-ticket-display text-sm font-bold leading-tight mb-1.5 line-clamp-2"
                        style={{ color: "var(--cat-txt)" }}
                      >
                        {row.title || "—"}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                        <span
                          className="font-ticket-body text-sm font-bold"
                          style={{ color: "var(--pa-primary-2)" }}
                        >
                          {formatPrice(row.price)}
                        </span>
                        <span
                          className="cat-chip"
                          style={{
                            background: "var(--pa-primary-soft)",
                            color: "var(--pa-primary-2)",
                          }}
                        >
                          {row.category || "—"}
                        </span>
                      </div>

                      {/* Stock bar */}
                      <div className="mb-2">
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: "var(--cat-border)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(4, stock.level * 100)}%`,
                              background: stock.color,
                            }}
                          />
                        </div>
                        <p
                          className="font-ticket-body text-[10px] font-bold tabular-nums mt-1"
                          style={{ color: stock.color }}
                        >
                          {stock.label}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="font-ticket-body text-[11px] truncate"
                          style={{ color: "var(--cat-txt-muted)" }}
                        >
                          <FaMapMarkerAlt className="inline mr-1 text-[9px]" />
                          {shortAddress(row)}
                        </p>
                        <p
                          className="font-ticket-body text-[11px] flex-shrink-0"
                          style={{ color: "var(--cat-txt-muted)" }}
                        >
                          {formatDate(row)}
                        </p>
                      </div>

                      {/* Mobile action row */}
                      <div
                        className="flex items-center gap-2 mt-3 pt-3 border-t"
                        style={{ borderColor: "var(--cat-border)" }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(row);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border font-ticket-body text-[11.5px] font-bold"
                          style={{
                            borderColor: "var(--pa-line-str)",
                            color: "var(--pa-primary-2)",
                            background: "var(--cat-surface)",
                          }}
                        >
                          <FaEdit className="text-[10px]" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(row);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border font-ticket-body text-[11.5px] font-bold"
                          style={{
                            borderColor: "var(--pa-line-str)",
                            color: "var(--pa-danger)",
                            background: "var(--cat-surface)",
                          }}
                        >
                          <FaTrash className="text-[10px]" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Pagination ═══ */}
      {totalRows > 0 && (
        <div className="cat-pagination">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft /> <span className="cat-page-label">Previous</span>
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              className={currentPage === n ? "active" : ""}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ))}

          {totalPages > 4 && (
            <button disabled style={{ border: "none", background: "transparent" }}>
              <FaEllipsisH />
            </button>
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <span className="cat-page-label">Next</span> <FaChevronRight />
          </button>

          <span
            className="cat-total ml-4 text-sm"
            style={{ color: "var(--cat-txt-muted)" }}
          >
            Total Rows: {totalRows.toLocaleString()}
          </span>
        </div>
      )}

      {/* ═══ Confirm Delete ═══ */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{
              background: "rgba(8,8,12,0.7)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="rounded-[22px] pa-panel-solid p-5 sm:p-7 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center mb-5">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: "var(--pa-danger-soft)",
                    border: "1px solid var(--pa-danger)",
                  }}
                >
                  <FaTrash
                    className="text-lg"
                    style={{ color: "var(--pa-danger)" }}
                  />
                </div>
                <h3
                  className="font-ticket-display text-lg font-bold mb-1"
                  style={{ color: "var(--cat-txt)" }}
                >
                  Delete this listing?
                </h3>
                <p
                  className="font-ticket-body text-xs"
                  style={{ color: "var(--cat-txt-muted)" }}
                >
                  "{confirmDelete.title}" will be permanently removed. This
                  can't be undone.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl border font-ticket-body text-xs font-bold"
                  style={{
                    borderColor: "var(--pa-line-str)",
                    color: "var(--cat-txt)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.(confirmDelete);
                    setConfirmDelete(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-ticket-body text-xs font-bold"
                  style={{ background: "var(--pa-danger)" }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
/* ═══════════════════════════════════════════════════════════════
   PostAd — main component
   ═══════════════════════════════════════════════════════════════ */
const PostAd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const fileInputRef = useRef(null);
  const titleInputRef = useRef(null);

  const planLimits = usePlanLimits();
  const [listingUsage, setListingUsage] = useState({ used: 0, max: 0 });

  const editingId = searchParams.get("edit");
  const isEditing = !!editingId;
const isNewListing = searchParams.get("new") === "1";

  const [step, setStep] = useState(() => {
    if (isEditing) return 2;
    try {
      const saved = sessionStorage.getItem(STEP_KEY);
      return saved ? Number(saved) : 1;
    } catch { return 1; }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdListing, setCreatedListing] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [autoAdvancing, setAutoAdvancing] = useState(false);

  const [moderationWarning, setModerationWarning] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [sellerTrust, setSellerTrust] = useState({ isTrusted: false, approvedCount: 0, rejectedCount: 0 });

  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [priceSuggestionLoading, setPriceSuggestionLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    let base = { ...EMPTY_FORM };
    if (!isEditing) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) base = { ...base, ...JSON.parse(saved) };
      } catch {}
      try {
        const remembered = localStorage.getItem(LAST_CITY_KEY);
        if (remembered && !base.city) base.city = remembered;
      } catch {}
      try {
        const savedImgs = sessionStorage.getItem(IMAGES_KEY);
        if (savedImgs) {
          const parsed = JSON.parse(savedImgs);
          if (Array.isArray(parsed) && parsed.length > 0) base.images = parsed;
        }
      } catch {}
    }
    return base;
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationSource, setLocationSource] = useState(null);

  const [cleaningImageId, setCleaningImageId] = useState(null);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(null);
const [editImage, setEditImage] = useState(null);

const handleSaveEditedImage = ({ id, url, file, name, edited }) => {
  setFormData((prev) => ({
    ...prev,
    images: prev.images.map((im) =>
      im.id === id ? { ...im, url, file, name, edited: true } : im
    ),
  }));
  setEditImage(null);
  setPreviewIndex(null);
  pushToast("success", "Photo edited", "Changes applied");
};
const [showForm, setShowForm] = useState(isEditing || isNewListing);
const [booting, setBooting] = useState(isNewListing && !isEditing);
const [aiOpen, setAiOpen] = useState(false);

const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const perPage = 14;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

  const pushToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToast({ id, type, title, message });
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 2800);
  }, []);

useEffect(() => {
  let cancelled = false;

if (booting) {
  const t = setTimeout(() => {
    if (!cancelled) {
      setBooting(false);
      // ⭐ Show welcome dialog after the loader (unless editing)
      if (!isEditing) setShowWelcomeDialog(true);
    }
  }, 3000);
  return () => { cancelled = true; clearTimeout(t); };
}



  // Otherwise, normal background hydration (no forced delay)
  (async () => {
    if (!user?.id) return;
    try {
      const count = await planLimits.getActiveListingsCount();
      if (!cancelled) setListingUsage({ used: count, max: planLimits.limitListings });
      const trust = await checkSellerTrust(user.id);
      if (!cancelled) setSellerTrust(trust);
    } catch {}
  })();

  return () => { cancelled = true; };
}, [user?.id, planLimits.planId, booting]);

  useEffect(() => {
    if (!isEditing && profile?.phone && !formData.contactNumber) {
      setFormData((prev) => ({ ...prev, contactNumber: profile.phone }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.phone, isEditing]);

  useEffect(() => {
    if (!isEditing || !user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("listings").select("*")
          .eq("id", editingId).eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;
        if (error || !data) {
          pushToast("error", "Listing not found", "You can only edit your own listings");
          setShowForm(false);
          setSearchParams({}, { replace: true });
          return;
        }

        const images = (data.images || []).map((url, i) => ({
          id: `${data.id}-img-${i}`,
          url,
          name: `Photo ${i + 1}`,
          cleanedUrl: null,
          edited: false,
        }));

        setFormData({
          category: data.category || "",
          title: data.title || "",
          description: data.description || "",
          price: data.price != null ? String(data.price) : "",
          condition: data.condition || "",
          city: data.city || "",
          area: data.area || "",
          contactNumber: data.contact_number || "",
          images,
          specs: data.specs || {},
        });
        if (data.city) {
          setLocationDetected(true);
          setLocationSource("auto");
        }
      } catch (err) {
        console.error("Edit load error:", err);
        pushToast("error", "Couldn't load listing", err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [editingId, isEditing, user?.id, pushToast, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    const fetchListings = async () => {
      if (!user?.id) {
        setListings([]); setTotalRows(0); setListingsLoading(false);
        return;
      }
      setListingsLoading(true);
      try {
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        const { data, error, count } = await supabase
          .from("listings").select("*", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (cancelled) return;
        if (error) throw error;
        setListings(data || []);
        setTotalRows(count || 0);
      } catch (err) {
        console.error("Listings fetch error:", err);
        if (!cancelled) pushToast("error", "Couldn't load listings", err.message);
      } finally {
        if (!cancelled) setListingsLoading(false);
      }
    };
    fetchListings();
    return () => { cancelled = true; };
  }, [page, pushToast, user?.id]);

  useEffect(() => {
    const editedUrl = location.state?.editedImageUrl;
    const originalUrl = location.state?.originalImageUrl;
    if (editedUrl && originalUrl) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.url === originalUrl
            ? { ...img, url: editedUrl, cleanedUrl: editedUrl, edited: true }
            : img
        ),
      }));
      pushToast("success", "Photo edited", "Your changes were saved");
      window.history.replaceState({}, document.title);
    }
  }, [location.state, pushToast]);

  useEffect(() => {
    if (isSuccess || isEditing) return;
    try {
      const toSave = { ...formData, images: [] };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      const imgs = formData.images.map((img) => ({
        id: img.id, url: img.url, name: img.name,
        cleanedUrl: img.cleanedUrl || null, edited: img.edited || false,
      }));
      sessionStorage.setItem(IMAGES_KEY, JSON.stringify(imgs));
    } catch {}
  }, [formData, isSuccess, isEditing]);

  useEffect(() => {
    if (isSuccess || isEditing) return;
    try { sessionStorage.setItem(STEP_KEY, String(step)); } catch {}
  }, [step, isSuccess, isEditing]);

  useEffect(() => {
    if (formData.city && CITIES.includes(formData.city)) {
      try { localStorage.setItem(LAST_CITY_KEY, formData.city); } catch {}
    }
  }, [formData.city]);

  const runLocationDetection = useCallback(async ({ silentIfRemembered = false } = {}) => {
    let remembered = "";
    try { remembered = localStorage.getItem(LAST_CITY_KEY) || ""; } catch {}

    if (silentIfRemembered && remembered && !formData.city) {
      setFormData((prev) => ({ ...prev, city: remembered }));
      setLocationDetected(true);
      setLocationSource("remembered");
      return;
    }

    setLocating(true);
    try {
      const coords = await detectLocation();
      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      const matchedCity = matchCity(geo.city) || matchCity(geo.area);

      if (matchedCity) {
        setFormData((prev) => ({ ...prev, city: matchedCity, area: prev.area || geo.area || "" }));
        setLocationDetected(true);
        setLocationSource("auto");
        pushToast("location", "Location detected", `${matchedCity}${geo.area ? ` • ${geo.area}` : ""}`);
      } else if (geo.city) {
        setFormData((prev) => ({ ...prev, city: prev.city || geo.city, area: prev.area || geo.area || "" }));
        setLocationDetected(true);
        setLocationSource("auto");
        pushToast("location", "Location detected", `${geo.city}${geo.area ? ` • ${geo.area}` : ""}`);
      } else {
        pushToast("info", "Location not matched", "Please enter your city manually");
      }
    } catch (err) {
      if (err && err.code === 1) pushToast("error", "Location permission denied", "Please allow location or enter city manually");
      else if (err && err.code === 2) pushToast("error", "Location unavailable", "Enter your city manually");
      else if (err && err.code === 3) pushToast("error", "Location timed out", "Enter your city manually");
      else pushToast("info", "Couldn't detect location", "Please enter your city manually");
    } finally {
      setLocating(false);
    }
  }, [formData.city, pushToast]);

  useEffect(() => {
    if (isEditing) return;
    let cancelled = false;
    const run = async () => {
      if (formData.city && formData.area) {
        setLocationDetected(true);
        setLocationSource("auto");
        return;
      }
      let remembered = "";
      try { remembered = localStorage.getItem(LAST_CITY_KEY) || ""; } catch {}
      if (remembered && !formData.city && CITIES.includes(remembered)) {
        setFormData((prev) => ({ ...prev, city: remembered }));
        setLocationDetected(true);
        setLocationSource("remembered");
        return;
      }
      if (cancelled) return;
      await runLocationDetection();
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const steps = [
    { id: 1, label: "Category", hint: "What are you selling?" },
    { id: 2, label: "Details", hint: "Tell us about the item" },
    { id: 3, label: "Photos", hint: "Add up to 5 images" },
    { id: 4, label: "Review", hint: "Confirm and post" },
  ];

  const TITLE_PLACEHOLDERS = {
    Vehicles:    "e.g., Toyota Corolla Altis 2022 – Like New",
    Bikes:       "e.g., Honda CD 70 2023 – 4,200 km only",
    Mobiles:     "e.g., iPhone 15 Pro Max 256GB – PTA Approved",
    Property:    "e.g., 10 Marla House in DHA Phase 5",
    Electronics: "e.g., MacBook Pro 14 M3 Pro 512GB",
    Toys:        "e.g., Remote Helicoptor – Toys",
  };

  const DESCRIPTION_PLACEHOLDERS = {
    Vehicles: "Mention: 1st owner, full service history, tyres condition, any accident history, features (sunroof, alloy rims, etc.)",
    Bikes: "Mention: ownership, documents complete, engine condition, tyres, any recent service or repairs",
    Mobiles: "Mention: PTA approved, battery health, box & original charger, any scratches or dents, warranty remaining",
    Property: "Mention: size, bedrooms, bathrooms, floors, society, possession date, nearby amenities, and any features (corner plot, park facing, etc.)",
    Electronics: "Mention: warranty, box & accessories, condition of screen/keyboard, battery cycle count, any repairs",
    Toys: "Mention: complete pieces, original box included, safety certifications, suitable age, any missing parts",
  };

  const descriptionPlaceholder = DESCRIPTION_PLACEHOLDERS[formData.category] || "Add details about condition, features, extras...";
  const titlePlaceholder = TITLE_PLACEHOLDERS[formData.category] || "e.g., Give your ad a clear title";

  const activeSpecGroups = formData.category ? specGroupsByCategory[formData.category] || [] : [];

  const areaSuggestions = useMemo(() => {
    const city = String(formData.city || "").trim();
    if (city && AREA_SUGGESTIONS[city]) return AREA_SUGGESTIONS[city];
    const key = Object.keys(AREA_SUGGESTIONS).find((c) => c.toLowerCase() === city.toLowerCase());
    if (key) return AREA_SUGGESTIONS[key];
    return GENERIC_AREAS;
  }, [formData.city]);

  const updateSpec = (key, value) => {
    setFormData((prev) => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const getFieldSuggestions = (field) => {
    if (field.suggestionsKey === "models") {
      const make = formData.specs?.make;
      return getModelSuggestions(formData.category, make);
    }
    return field.suggestions || [];
  };

  useEffect(() => {
    if (!formData.category) { setPriceSuggestion(null); return; }
    const make = formData.specs?.make;
    const model = formData.specs?.model;
    const year = formData.specs?.year;
    if (!make && !model && !year) { setPriceSuggestion(null); return; }

    let cancelled = false;
    setPriceSuggestionLoading(true);
    const timer = setTimeout(async () => {
      const result = await fetchPriceSuggestions(formData.category, make, model, year);
      if (!cancelled) {
        setPriceSuggestion(result);
        setPriceSuggestionLoading(false);
      }
    }, 700);

    return () => { cancelled = true; clearTimeout(timer); setPriceSuggestionLoading(false); };
  }, [formData.category, formData.specs?.make, formData.specs?.model, formData.specs?.year]);

  useEffect(() => {
    if (!formData.title && !formData.description) {
      setModerationWarning(null);
      return;
    }
    const found = detectBannedContent(formData.title, formData.description);
    setModerationWarning(found.length > 0 ? found : null);
  }, [formData.title, formData.description]);

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!formData.category) newErrors.category = "Please select a category";
    }
    if (s === 2) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Enter a valid price";
      if (!formData.condition) newErrors.condition = "Select condition";
      if (!formData.city) newErrors.city = "Select a city";

      const phoneCheck = validatePakistaniPhone(formData.contactNumber);
      if (!phoneCheck.ok) newErrors.contactNumber = phoneCheck.reason;

      if (moderationWarning && moderationWarning.length > 0) {
        newErrors.title = `Your title/description contains prohibited words: ${moderationWarning.join(", ")}`;
      }

      activeSpecGroups.forEach((group) => {
        group.fields.forEach((f) => {
          if (f.required) {
            const v = formData.specs[f.key];
            const isEmpty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
            if (isEmpty) newErrors[`spec_${f.key}`] = `${f.label} is required`;
          }
        });
      });
    }
    if (s === 3) {
      if (formData.images.length === 0) newErrors.images = "Add at least one photo";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (!validateStep(step) && step < 4) return; if (step < 4) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const advanceAfter = (delay = 350) => {
    setAutoAdvancing(true);
    setTimeout(() => {
      setAutoAdvancing(false);
      setStep((s) => (s < 4 ? s + 1 : s));
    }, delay);
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, category: categoryId, specs: {} });
    setErrors({ ...errors, category: null });
    advanceAfter(400);
  };

  const handleConditionSelect = (condition) => {
    setFormData({ ...formData, condition });
    setErrors({ ...errors, condition: null });
    setTimeout(() => titleInputRef.current?.focus(), 150);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 5) { alert("You can upload up to 5 images."); return; }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} is larger than 5MB.`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, { id: Date.now() + Math.random(), url: ev.target.result, file, name: file.name }],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (id) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== id) }));
  };

  const handleCleanImage = async (img) => {
    if (!img?.url) return;
    setCleaningImageId(img.id);
    setCleanProgress(0);

    try {
      const blob = await removeBackground(img.url, (key, current, total) => {
        if (total > 0) setCleanProgress(Math.round((current / total) * 100));
      });
      const publicUrl = await uploadCleanedImage(blob);

      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((im) =>
          im.id === img.id ? { ...im, url: publicUrl, cleanedUrl: publicUrl } : im
        ),
      }));

      pushToast("success", "Background removed", "Your product image is now clean");
    } catch (err) {
      console.error("Clean bg error:", err);
      pushToast("error", "Background removal failed", err?.message?.slice(0, 60) || "Try again");
    } finally {
      setCleaningImageId(null);
      setCleanProgress(0);
    }
  };

  const uploadImage = async (img) => {
    if (typeof img.url === "string" && img.url.startsWith("http")) return img.url;
    const file = img.file;
    if (!file) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { data, error } = await supabase.storage.from("listing-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

const handleAIFill = (patch) => {
  if (!patch) return;

  // ⭐ Merge AI-uploaded photos into the form's image list
  const aiImages = Array.isArray(patch.images) ? patch.images : [];
  const newImages = aiImages
    .slice(0, 5)                       // cap at 5 total
    .map((url, i) => ({
      id: `ai-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      url,
      name: `AI Photo ${i + 1}`,
      cleanedUrl: null,
      edited: false,
    }));

  setFormData((prev) => {
    // Keep existing images, then add AI ones (up to 5 total)
    const combined = [...prev.images, ...newImages].slice(0, 5);

    return {
      ...prev,
      category:    patch.category    || prev.category,
      title:       patch.title       || prev.title,
      description: patch.description || prev.description,
      price:
        patch.price != null && patch.price !== ""
          ? String(patch.price)
          : prev.price,
      condition: patch.condition || prev.condition,
      city:      patch.city      || prev.city,
      area:      patch.area      || prev.area,
      specs: { ...prev.specs, ...(patch.specs || {}) },
      images: combined,             // ⭐ now includes AI photos
    };
  });

  setAiOpen(false);

  // ⭐ If AI gave photos, jump to Step 3 (Photos) so user sees them
  //    Otherwise jump to Step 2 (Details)
  setStep(newImages.length > 0 ? 3 : 2);

  pushToast(
    "success",
    "AI filled the form",
    newImages.length > 0
      ? `${newImages.length} photo${newImages.length > 1 ? "s" : ""} added`
      : "Review and adjust as needed"
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
};
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    if (!user) { setSubmitError("Please sign in to post an ad."); return; }

    const max = planLimits.limitListings;
    if (max !== undefined && max !== null && !Number.isNaN(max) && max !== Infinity && !isEditing) {
      const planCheck = await planLimits.canPostListing();
      if (!planCheck.ok) {
        setSubmitError(planCheck.reason);
        return;
      }
    }

    if (!isEditing) {
      const dupes = await checkDuplicateListing(user.id, formData.title, formData.category);
      if (dupes.length > 0) {
        setDuplicateWarning(dupes);
        if (!window.confirm(`You already posted a similar listing recently. Post anyway?`)) {
          return;
        }
        setDuplicateWarning(null);
      }
    }

    setIsSubmitting(true);
    setSubmitError("");
    setUploadProgress("Uploading photos...");

    try {
      const imageUrls = [];
      for (let i = 0; i < formData.images.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${formData.images.length}...`);
        const url = await uploadImage(formData.images[i]);
        if (url) imageUrls.push(url);
      }

      const isPending = !sellerTrust.isTrusted;

      setUploadProgress(isEditing ? "Saving changes..." : "Saving your ad...");

      const payload = {
        user_id: user.id,
        category: formData.category,
        subcategory: formData.specs?.type || null,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: Number(formData.price),
        condition: formData.condition,
        city: formData.city,
        area: formData.area.trim() || null,
        contact_number: validatePakistaniPhone(formData.contactNumber).normalized || formData.contactNumber.trim(),
        specs: formData.specs || {},
        images: imageUrls,
        cover_image: imageUrls[0] || null,
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from("listings")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingId).eq("user_id", user.id)
          .select().single();
      } else {
        result = await supabase
          .from("listings")
          .insert({
            ...payload,
            status: isPending ? "pending" : "active",
            featured: false,
            verified: false,
            views: 0,
            payment_status: "unpaid",
          })
          .select().single();
      }

      if (result.error) throw result.error;

      const savedListing = result.data;

      if (isEditing) {
        pushToast("success", "Listing updated", "Your changes are live");
        setTimeout(() => navigate(`/listing/${editingId}`), 600);
        return;
      }

      const keptCity = formData.city || "";
      clearDraftStorage();
      try { if (keptCity) localStorage.setItem(LAST_CITY_KEY, keptCity); } catch {}

      setFormData({ ...EMPTY_FORM, city: keptCity });
      setStep(1);
      setErrors({});
      setPreviewIndex(null);

      setCreatedListing(savedListing);
      setIsSuccess(true);
    } catch (err) {
      console.error("Post error:", err);
      setSubmitError(err.message || "Failed to post your ad. Please try again.");
      pushToast("error", "Post failed", err.message || "Please try again");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const handleRowClick = (row) => {
    navigate(`/listing/${row.id}`);
  };

  const handlePostAnother = () => {
    setIsSuccess(false);
    setCreatedListing(null);
    setShowForm(true);
    setPage(1);
    (async () => {
      const { data, count } = await supabase
        .from("listings").select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, perPage - 1);
      setListings(data || []);
      setTotalRows(count || 0);
    })();
  };

  const handleViewStats = () => {
    if (createdListing?.id) navigate(`/listing/${createdListing.id}`);
  };

  return (
    <div className="min-h-screen pa-bg relative">
      <PostAdStyles />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
{/* ⭐ WELCOME CHOICE DIALOG — modern redesign */}
<AnimatePresence>
  {showWelcomeDialog && (
    <motion.div
      key="welcome-dialog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center sm:p-6"
      style={{
        background: "rgba(8,8,12,0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      onClick={() => setShowWelcomeDialog(false)}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        initial={{ opacity: 0, y: 48, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative w-full sm:max-w-[480px] max-h-[92dvh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] px-5 pt-3 sm:px-7 sm:pt-7"
        style={{
          background: "var(--pa-bg-1)",
          border: "1px solid var(--pa-line)",
          boxShadow:
            "0 30px 80px -30px rgba(0,0,0,0.45), 0 12px 32px -18px var(--pa-primary-glow)",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* mobile drag handle */}
        <div
          className="mx-auto mb-5 h-1 w-10 rounded-full sm:hidden"
          style={{ background: "var(--pa-line-str)" }}
        />

        {/* close */}
        <button
          type="button"
          onClick={() => setShowWelcomeDialog(false)}
          aria-label="Close"
          className="absolute right-4 top-4 hidden h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90 sm:flex"
          style={{
            background: "var(--pa-panel-2)",
            border: "1px solid var(--pa-line)",
            color: "var(--cat-txt-muted)",
          }}
        >
          <FaTimes className="text-[11px]" />
        </button>

        {/* heading */}
        <h2
          id="welcome-title"
          className="font-ticket-display text-[24px] sm:text-[28px] font-bold leading-[1.15]"
          style={{ color: "var(--cat-txt)", letterSpacing: "-0.03em" }}
        >
          How do you want to post?
        </h2>
        <p
          className="font-ticket-body mt-2 mb-6 text-[13px] sm:text-[13.5px] leading-relaxed"
          style={{ color: "var(--cat-txt-muted)" }}
        >
          Pick the way that feels right. You can switch anytime.
        </p>

        {/* choices */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* AI */}
          <motion.button
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowWelcomeDialog(false);
              setAiOpen(true);
            }}
            className="group relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all focus:outline-none focus-visible:ring-2 sm:flex-col sm:items-start sm:gap-4 sm:p-5"
            style={{
              background:
                "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)",
              boxShadow:
                "0 22px 44px -20px var(--pa-primary-glow), inset 0 1px 0 rgba(255,255,255,0.25)",
              color: "#fff",
              overflow: "hidden",
            }}
          >
            {/* soft glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40 transition-opacity group-hover:opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            <span
              className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <FaMagic className="text-[18px]" />
            </span>

            <span className="relative min-w-0 flex-1">
              <span className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-ticket-display text-[16px] sm:text-[17px] font-bold"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  AI assistant
                </span>
                <span
                  className="rounded-full px-2 py-0.5 font-ticket-body text-[9.5px] font-extrabold uppercase tracking-wider"
                  style={{
                    background: "rgba(255,255,255,0.28)",
                    color: "#fff",
                  }}
                >
                  Recommended
                </span>
              </span>
              <span className="font-ticket-body mt-1.5 block text-[12.5px] leading-snug opacity-90">
                Answer a few quick questions. Speak or type.
              </span>
            </span>

            <FaChevronRight className="relative flex-shrink-0 text-[12px] opacity-80 sm:hidden" />
          </motion.button>

          {/* Manual */}
          <motion.button
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWelcomeDialog(false)}
            className="group flex items-center gap-4 rounded-2xl p-4 text-left transition-all focus:outline-none focus-visible:ring-2 sm:flex-col sm:items-start sm:gap-4 sm:p-5"
            style={{
              background: "var(--pa-panel-2)",
              border: "1px solid var(--pa-line-str)",
            }}
          >
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{
                background: "var(--pa-primary-2-soft)",
                border: "1px solid var(--pa-primary)",
              }}
            >
              <FaEdit
                className="text-[18px]"
                style={{ color: "var(--pa-primary)" }}
              />
            </span>

            <span className="min-w-0 flex-1">
              <span
                className="font-ticket-display block text-[16px] sm:text-[17px] font-bold"
                style={{
                  color: "var(--cat-txt)",
                  letterSpacing: "-0.02em",
                }}
              >
                Fill in manually
              </span>
              <span
                className="font-ticket-body mt-1.5 block text-[12.5px] leading-snug"
                style={{ color: "var(--cat-txt-muted)" }}
              >
                Type all the details yourself.
              </span>
            </span>

            <FaChevronRight
              className="flex-shrink-0 text-[12px] sm:hidden"
              style={{ color: "var(--cat-txt-muted)" }}
            />
          </motion.button>
        </div>

        {/* footer hint */}
        <p
          className="font-ticket-body mt-6 text-center text-[11px]"
          style={{ color: "var(--cat-txt-muted)" }}
        >
          Tip: You can switch to{" "}
          <span
            className="font-bold"
            style={{ color: "var(--pa-primary)" }}
          >
            Fill with AI
          </span>{" "}
          anytime from the top of the page.
        </p>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {booting && (
    <motion.div
      key="postad-boot"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center"
      style={{ background: "var(--cat-bg)" }}
    >
      {/* soft glow behind logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, var(--pa-primary), transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* pulsing concentric rings + brand mark */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid var(--pa-primary)" }}
              animate={{ scale: [0.6, 1.3, 1.6], opacity: [0.9, 0.3, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.4,
              }}
            />
          ))}

          <motion.div
            className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)",
              boxShadow: "0 12px 32px -10px var(--pa-primary-glow)",
            }}
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaBolt className="text-lg" />
          </motion.div>
        </div>

        {/* text */}
        <div className="flex flex-col items-center gap-1 text-center px-4">
          <p
            className="font-ticket-display text-base sm:text-lg font-bold"
            style={{ color: "var(--cat-txt)" }}
          >
            Preparing your ad
          </p>
          <p
            className="font-ticket-body text-[11px] sm:text-xs"
            style={{ color: "var(--cat-txt-muted)" }}
          >
            Loading seller info &amp; preferences…
          </p>
        </div>

        {/* animated dots */}
        <div className="flex items-center gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--pa-primary)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )}

</AnimatePresence>
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {!showForm ? (
    <CatalogTable
  listings={listings}
  loading={listingsLoading}
onAddProduct={() => {
  setShowForm(true);
  setShowWelcomeDialog(true);
}}  onRowClick={handleRowClick}

  currentPage={page}
  totalPages={totalPages}
  totalRows={totalRows}
  onPageChange={setPage}
  planLimits={planLimits}
  listingUsage={listingUsage}
  onUpgrade={() => planLimits.promptUpgrade("seller")}
  onEdit={(row) => {
    // ⭐ Load that listing in edit mode
    setSearchParams({ edit: row.id });
    setShowForm(true);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  onDelete={async (row) => {
    // ⭐ Delete from Supabase + update UI
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", row.id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Optimistic UI update
      setListings((prev) => prev.filter((l) => l.id !== row.id));
      setTotalRows((n) => Math.max(0, n - 1));
      pushToast("success", "Listing deleted", `"${row.title}" was removed`);
    } catch (err) {
      console.error("Delete error:", err);
      pushToast("error", "Couldn't delete", err.message || "Please try again");
    }
  }}
/>
        ) : (
          <>
<div className="flex items-center gap-2 mb-4 sm:mb-6">
  <button
    className="pa-btn pa-btn-ghost text-xs px-3 py-2"
    onClick={() => {
      if (isEditing) {
        navigate("/post-ad", { replace: true });
      } else {
        setShowForm(false);
        setStep(1);
      }
    }}
    aria-label={isEditing ? "Back" : "Back to catalog"}
  >
    <FaArrowLeft className="text-xs" />
  </button>

  <span className="text-xs sm:text-sm" style={{ color: "var(--cat-txt-muted)" }}>
    {isEditing ? "Editing listing" : step === 1 ? "New listing" : `Step ${step} of 4`}
  </span>
{/* ⭐ AI FILL BUTTON — new listings only */}
{!isEditing && (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setAiOpen(true);
    }}
    className="
      group ml-auto inline-flex items-center gap-1.5 px-2 py-1
      font-ticket-body text-[11.5px] sm:text-xs font-semibold
      text-[var(--pa-primary)]
      bg-transparent border-none
      transition-all duration-300
      hover:text-[var(--pa-primary-2)]
      active:scale-95
      cursor-pointer ai-link-shimmer
    "
    style={{
      pointerEvents: "auto",
      position: "relative",
      zIndex: 10,
    }}
    aria-label="Fill form with AI"
  >
    <FaMagic className="text-[10px] transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110" />

    <span className="hidden sm:inline relative">
      Fill with AI
      {/* animated underline */}
      <span
        className="
          absolute left-0 -bottom-0.5 h-[1.5px] w-full
          bg-gradient-to-r from-[var(--pa-primary)] via-[var(--pa-primary-2)] to-[var(--pa-primary)]
          bg-[length:200%_100%]
          animate-underline-flow
          opacity-60 group-hover:opacity-100
        "
      />
    </span>
    <span className="sm:hidden">AI Fill</span>

  </button>
)}
</div>

            <div className="max-w-5xl mx-auto">
              <div className="min-w-0">
                <h1 className="font-ticket-display text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
                  style={{ color: "var(--cat-txt)" }}>
                  {isEditing ? "Edit Your Ad" : "Post Your Ad"}
                </h1>
                <p className="font-ticket-body text-[11px] sm:text-sm" style={{ color: "var(--cat-txt-muted)" }}>
                  {isEditing ? "Update the details and save your changes" : "Reach thousands of buyers in under 60 seconds"}
                </p>

                {!isEditing && (
                  <p className="font-ticket-body text-[10px] sm:text-[11px] mt-1.5" style={{ color: "var(--cat-txt-muted)" }}>
                    <span style={{ color: "var(--pa-primary-2)", fontWeight: 700 }}>
                      {planLimits.plan.name}
                    </span>{" "}
                    ·{" "}
                    {listingUsage?.max === Infinity
                      ? "Unlimited listings"
                      : `${listingUsage?.used || 0} of ${listingUsage?.max || 0} listings used`}
                    {" · "}
                    {sellerTrust.isTrusted ? (
                      <span style={{ color: "var(--pa-success)", fontWeight: 700 }}>
                        ✓ Trusted seller — instant publish
                      </span>
                    ) : (
                      <span style={{ color: "var(--pa-primary-2)", fontWeight: 700 }}>
                        Reviewed before going live ({sellerTrust.approvedCount}/5)
                      </span>
                    )}
                    {planLimits.isFree && (
                      <>
                        {" · "}
                        <button type="button" onClick={() => planLimits.promptUpgrade("seller")}
                          className="font-bold underline decoration-dotted underline-offset-2"
                          style={{ color: "var(--pa-primary-2)" }}>
                          Upgrade
                        </button>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Modern Stepper */}
              <div className="rounded-[18px] sm:rounded-[22px] pa-panel-solid p-3.5 sm:p-5 mb-4 sm:mb-6 mt-4">
                <div className="flex items-center justify-between gap-1 sm:gap-2">
                  {steps.map((s, idx) => {
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                      <div key={s.id} className="flex items-center flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <motion.div
                            animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                            transition={{ duration: 0.4 }}
                            data-state={isDone ? "done" : isActive ? "active" : "idle"}
                            className="pa-step-dot flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-ticket-body text-[10px] sm:text-[11px] font-bold"
                            style={
                              isDone
                                ? { background: "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)", color: "#fff" }
                                : isActive
                                ? { background: "var(--pa-primary-3)", color: "#fff", border: `2px solid var(--pa-primary-3)` }
                                : { background: "var(--pa-panel-2)", border: `1.5px solid var(--pa-line-str)`, color: "var(--cat-txt-muted)" }
                            }
                          >
                            {isDone ? <FaCheck className="text-[9px] sm:text-[10px]" /> : s.id}
                          </motion.div>
                          <div className="hidden lg:block min-w-0">
                            <p className="font-ticket-body text-[10px] font-bold uppercase tracking-wider truncate"
                              style={{ color: isActive || isDone ? "var(--cat-txt)" : "var(--cat-txt-muted)" }}>
                              {s.label}
                            </p>
                          </div>
                        </div>
                        {idx < steps.length - 1 && (
                          <div className="flex-1 h-[3px] mx-1.5 sm:mx-2.5 rounded-full transition-all duration-500"
                            style={{
                              background: step > s.id
                                ? "linear-gradient(90deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)"
                                : "var(--pa-line)",
                            }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[18px] sm:rounded-[26px] pa-panel-solid overflow-hidden">
                {/* Modern Step header */}
                <div
                  className="relative px-4 sm:px-7 py-4 sm:py-6 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, var(--pa-primary-2-soft) 0%, transparent 60%)",
                    borderBottom: "1px solid var(--pa-line)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: "linear-gradient(90deg, var(--pa-primary) 0%, var(--pa-primary-2) 50%, transparent 100%)" }} />
                  <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2"
                    style={{ color: "var(--pa-primary-2)" }}>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white"
                      style={{ background: "var(--pa-primary)" }}>
                      {step}
                    </span>
                    Step {step} of 4
                  </p>
                  <h2 className="font-ticket-display text-base sm:text-xl lg:text-2xl font-bold leading-tight"
                    style={{ color: "var(--cat-txt)" }}>
                    {steps[step - 1].hint}
                  </h2>
                </div>

                <div className="p-4 sm:p-7 lg:p-8">
                  <AnimatePresence mode="wait">
                    {/* STEP 1 — CATEGORY */}
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                        <p className="pa-label mb-4">Select category</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {categories.map((c) => {
                            const Icon = c.icon;
                            const isSelected = formData.category === c.id;
                            return (
                              <motion.button
                                key={c.id}
                                type="button"
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleCategorySelect(c.id)}
                                data-active={isSelected ? "true" : "false"}
                                className="pa-cat-card group relative flex flex-col items-center gap-2.5 sm:gap-3.5 p-4 sm:p-7 text-center z-0"
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center z-10"
                                    style={{
                                      background: "var(--pa-primary)",
                                      boxShadow: "0 6px 16px -6px var(--pa-primary-glow)",
                                    }}
                                  >
                                    <FaCheck className="text-white text-[8px] sm:text-[10px]" />
                                  </motion.div>
                                )}

                                <div
                                  className="relative flex-shrink-0 h-11 w-11 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
                                  style={{
                                    background: isSelected
                                      ? "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)"
                                      : "var(--pa-primary-soft)",
                                    color: isSelected ? "#FFFFFF" : "var(--pa-primary-2)",
                                    border: isSelected ? "none" : "1px solid var(--pa-primary)",
                                    boxShadow: isSelected
                                      ? "0 12px 24px -10px var(--pa-primary-glow)"
                                      : "none",
                                  }}
                                >
                                  <Icon className="text-lg sm:text-2xl" />
                                </div>

                                <div className="min-w-0 w-full relative z-10">
                                  <p className="font-ticket-display text-[13px] sm:text-base font-bold truncate"
                                    style={{ color: "var(--cat-txt)" }}>
                                    {c.label}
                                  </p>
                                  <p className="font-ticket-body text-[9.5px] sm:text-[11px] mt-1 truncate opacity-80"
                                    style={{ color: "var(--cat-txt-muted)" }}>
                                    {c.sub}
                                  </p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                        {errors.category && <p className="font-ticket-body text-[11px] mt-3" style={{ color: "var(--pa-danger)" }}>{errors.category}</p>}
                        {autoAdvancing && (
                          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            className="font-ticket-body text-[11px] mt-3 flex items-center gap-1.5"
                            style={{ color: "var(--pa-primary-2)" }}>
                            <FaSpinner className="animate-spin text-[10px]" /> Moving to details...
                          </motion.p>
                        )}
                      </motion.div>
                    )}

                    {/* STEP 2 — DETAILS */}
                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5 sm:space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="pa-label">Title *</label>
                            <input ref={titleInputRef} type="text" placeholder={titlePlaceholder}
                              value={formData.title}
                              onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setErrors({ ...errors, title: null }); }}
                              className="font-ticket-body w-full px-4 py-3.5 rounded-xl text-sm pa-input" />
                            {errors.title && <p className="font-ticket-body text-[11px] mt-1.5" style={{ color: "var(--pa-danger)" }}>{errors.title}</p>}
                          </div>

                          <div>
                            <label className="pa-label">Price (Rs) *</label>
                            <div className="relative">
                              <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                                style={{ color: "var(--pa-primary)" }} />
                              <input type="number" placeholder="0"
                                value={formData.price}
                                onChange={(e) => { setFormData({ ...formData, price: e.target.value }); setErrors({ ...errors, price: null }); }}
                                className="font-ticket-body w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-bold tabular-nums pa-input" />
                            </div>
                            {errors.price && <p className="font-ticket-body text-[11px] mt-1.5" style={{ color: "var(--pa-danger)" }}>{errors.price}</p>}

                            {priceSuggestionLoading && (
                              <p className="font-ticket-body text-[10px] mt-1.5 flex items-center gap-1.5"
                                style={{ color: "var(--cat-txt-muted)" }}>
                                <FaSpinner className="animate-spin text-[9px]" /> Finding similar listings…
                              </p>
                            )}
                            {!priceSuggestionLoading && priceSuggestion && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 p-2.5 rounded-lg flex items-start gap-2"
                                style={{ background: "var(--pa-primary-2-soft)", border: "1px solid var(--pa-primary)" }}>
                                <FaLightbulb className="text-[11px] mt-0.5 flex-shrink-0" style={{ color: "var(--pa-primary-2)" }} />
                                <div className="min-w-0 flex-1">
                                  <p className="font-ticket-body text-[10px] font-bold" style={{ color: "var(--pa-primary-2)" }}>
                                    Suggested range: Rs {priceSuggestion.min.toLocaleString()} – {priceSuggestion.max.toLocaleString()}
                                  </p>
                                  <p className="font-ticket-body text-[9.5px] mt-0.5" style={{ color: "var(--cat-txt-muted)" }}>
                                    Based on {priceSuggestion.count} similar listings. Median: Rs {priceSuggestion.median.toLocaleString()}
                                    {" · "}
                                    <button type="button" onClick={() => setFormData((prev) => ({ ...prev, price: String(priceSuggestion.median) }))}
                                      className="font-bold underline decoration-dotted underline-offset-2"
                                      style={{ color: "var(--pa-primary-2)" }}>
                                      Use median
                                    </button>
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="pa-label">Description</label>
                          <textarea rows={4} placeholder={descriptionPlaceholder}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="font-ticket-body w-full px-4 py-3.5 rounded-xl text-sm pa-input resize-none" />
                        </div>

                        {moderationWarning && moderationWarning.length > 0 && (
                          <div className="flex items-start gap-2 p-3 rounded-xl"
                            style={{ background: "var(--pa-warning-soft)", border: "1px solid var(--pa-warning)" }}>
                            <FaExclamationTriangle className="text-xs mt-0.5 flex-shrink-0" style={{ color: "var(--pa-warning)" }} />
                            <div className="min-w-0">
                              <p className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--pa-warning)" }}>
                                Prohibited words detected: {moderationWarning.join(", ")}
                              </p>
                              <p className="font-ticket-body text-[10px] mt-0.5" style={{ color: "var(--cat-txt-muted)" }}>
                                Please remove them before continuing.
                              </p>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="pa-label">Condition *</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                            {conditions.map((c) => {
                              const isSelected = formData.condition === c;
                              return (
                                <motion.button
                                  key={c}
                                  type="button"
                                  whileTap={{ scale: 0.96 }}
                                  data-active={isSelected ? "true" : "false"}
                                  onClick={() => handleConditionSelect(c)}
                                  className="pa-cond-pill px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border font-ticket-body text-[11.5px] sm:text-xs font-bold transition-colors"
                                  style={
                                    isSelected
                                      ? {
                                          borderColor: "var(--pa-primary)",
                                          background: "linear-gradient(135deg, var(--pa-primary) 0%, var(--pa-primary-2) 100%)",
                                          color: "#FFFFFF",
                                        }
                                      : {
                                          borderColor: "var(--pa-line-str)",
                                          color: "var(--cat-txt)",
                                          background: "var(--pa-panel-2)",
                                        }
                                  }
                                >
                                  {c}
                                </motion.button>
                              );
                            })}
                          </div>
                          {errors.condition && <p className="font-ticket-body text-[11px] mt-2" style={{ color: "var(--pa-danger)" }}>{errors.condition}</p>}
                        </div>

                        {activeSpecGroups.length > 0 && (
                          <div className="space-y-4 sm:space-y-5 pt-2">
                            {activeSpecGroups.map((group) => {
                              const GroupIcon = group.icon;
                              const isMultiGroup = group.fields.some((f) => f.kind === "multi");
                              const isColorOnly = group.fields.length === 1 && group.fields[0].kind === "color";

                              return (
                                <motion.div
                                  key={group.title}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.35, ease: "easeOut" }}
                                  className="pa-spec-card p-4 sm:p-6"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b"
                                    style={{ borderColor: "var(--pa-line)" }}>
                                    <div
                                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                      style={{
                                        background: "linear-gradient(135deg, var(--pa-primary-soft) 0%, var(--pa-primary-2-soft) 100%)",
                                        border: "1px solid var(--pa-primary)",
                                      }}
                                    >
                                      <GroupIcon className="text-sm sm:text-base" style={{ color: "var(--pa-primary-2)" }} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest"
                                        style={{ color: "var(--pa-primary-2)" }}>
                                        Section
                                      </p>
                                      <p className="font-ticket-display text-sm sm:text-base font-bold truncate"
                                        style={{ color: "var(--cat-txt)" }}>
                                        {group.title}
                                      </p>
                                    </div>
                                  </div>

                                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                                    isMultiGroup || isColorOnly ? "lg:grid-cols-1" : "lg:grid-cols-3"
                                  } gap-4 sm:gap-5`}>
                                    {group.fields.map((field) => {
                                      const err = errors[`spec_${field.key}`];
                                      const value = formData.specs[field.key];

                                      if (field.kind === "color") {
                                        return (
                                          <div key={field.key} className={isColorOnly ? "" : "sm:col-span-2 lg:col-span-3"}>
                                            <ColorPicker label={field.label} icon={field.icon}
                                              value={value || ""}
                                              onChange={(v) => { updateSpec(field.key, v); setErrors({ ...errors, [`spec_${field.key}`]: null }); }}
                                              error={err} required={field.required} />
                                          </div>
                                        );
                                      }

                                      if (field.kind === "multi") {
                                        return (
                                          <div key={field.key} className="sm:col-span-2 lg:col-span-1">
                                            <MultiSelect label={field.label} icon={field.icon}
                                              options={field.options}
                                              values={Array.isArray(value) ? value : []}
                                              onChange={(vals) => updateSpec(field.key, vals)}
                                              error={err} required={field.required} />
                                          </div>
                                        );
                                      }

                                      if (field.kind === "suggest") {
                                        const sugg = getFieldSuggestions(field);
                                        return (
                                          <SuggestInput key={field.key}
                                            label={field.label} value={value || ""}
                                            onChange={(v) => {
                                              updateSpec(field.key, v);
                                              if (field.key === "make") {
                                                setFormData((prev) => ({ ...prev, specs: { ...prev.specs, model: "" } }));
                                              }
                                              setErrors({ ...errors, [`spec_${field.key}`]: null });
                                            }}
                                            placeholder={field.placeholder} icon={field.icon}
                                            suggestions={sugg} error={err}
                                            required={field.required} maxSuggestions={10} />
                                        );
                                      }

                                      if (field.kind === "select") {
                                        return (
                                          <div key={field.key}>
                                            <label className="pa-label">
                                              {field.label}
                                              {field.required && <span style={{ color: "var(--pa-danger)" }}>*</span>}
                                            </label>
                                            <div className="relative">
                                              <select value={value || ""}
                                                onChange={(e) => { updateSpec(field.key, e.target.value); setErrors({ ...errors, [`spec_${field.key}`]: null }); }}
                                                className="font-ticket-body appearance-none w-full pl-10 pr-10 py-3.5 rounded-xl text-sm font-semibold outline-none cursor-pointer pa-input"
                                                style={{ background: "var(--pa-panel-2)" }}>
                                                <option value="">Select {field.label}</option>
                                                {field.options.map((opt) => (
                                                  <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                              </select>
                                              <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                                                style={{ color: "var(--pa-primary)" }} />
                                              <FaChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] rotate-90 pointer-events-none"
                                                style={{ color: "var(--cat-txt-muted)" }} />
                                            </div>
                                            {err && <p className="font-ticket-body text-[10px] mt-1.5" style={{ color: "var(--pa-danger)" }}>{err}</p>}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={field.key}>
                                          <label className="pa-label">
                                            {field.label}
                                            {field.required && <span style={{ color: "var(--pa-danger)" }}>*</span>}
                                          </label>
                                          <div className="relative">
                                            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                                              style={{ color: "var(--pa-primary)" }} />
                                            <input type={field.kind === "number" ? "number" : "text"}
                                              placeholder={field.placeholder}
                                              value={value || ""}
                                              onChange={(e) => { updateSpec(field.key, e.target.value); setErrors({ ...errors, [`spec_${field.key}`]: null }); }}
                                              className="font-ticket-body w-full pl-10 pr-4 py-3.5 rounded-xl text-sm pa-input" />
                                          </div>
                                          {err && <p className="font-ticket-body text-[10px] mt-1.5" style={{ color: "var(--pa-danger)" }}>{err}</p>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                          <div className="relative">
                            <SuggestInput label="City" required value={formData.city}
                              onChange={(v) => {
                                setFormData({ ...formData, city: v });
                                setErrors({ ...errors, city: null });
                                setLocationSource(null);
                              }}
                              placeholder={locating ? "Detecting location..." : "e.g., Lahore"}
                              icon={locating ? FaCrosshairs : FaCity}
                              suggestions={CITIES} error={errors.city} maxSuggestions={8} />
                            {locating && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 flex items-center gap-1.5">
                                <FaSpinner className="animate-spin text-[9px]" style={{ color: "var(--pa-primary)" }} />
                                <span className="font-ticket-body text-[9px] font-bold" style={{ color: "var(--pa-primary-2)" }}>Detecting your location...</span>
                              </motion.div>
                            )}
                            {!locating && locationDetected && formData.city && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 flex items-center gap-2">
                                {locationSource === "remembered" ? (
                                  <span className="flex items-center gap-1.5">
                                    <FaCheck className="text-[8px]" style={{ color: "var(--pa-success)" }} />
                                    <span className="font-ticket-body text-[9px] font-bold" style={{ color: "var(--pa-success)" }}>From last ad</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <FaLocationArrow className="text-[9px]" style={{ color: "var(--pa-success)" }} />
                                    <span className="font-ticket-body text-[9px] font-bold" style={{ color: "var(--pa-success)" }}>Auto-detected</span>
                                  </span>
                                )}
                                <button type="button"
                                  onClick={() => {
                                    try { localStorage.removeItem(LAST_CITY_KEY); } catch {}
                                    setLocationDetected(false);
                                    setLocationSource(null);
                                    runLocationDetection();
                                  }}
                                  className="font-ticket-body text-[9px] font-bold underline decoration-dotted underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5"
                                  style={{ color: "var(--pa-primary-2)" }}>
                                  <FaEdit className="text-[8px]" /> Change
                                </button>
                              </motion.div>
                            )}
                          </div>
                          <SuggestInput label="Area / Locality" value={formData.area}
                            onChange={(v) => setFormData({ ...formData, area: v })}
                            placeholder="e.g., DHA Phase 5" icon={FaMapMarkerAlt}
                            suggestions={areaSuggestions} maxSuggestions={8} />
                          <div>
                            <label className="pa-label">WhatsApp Number *</label>
                            <div className="relative">
                              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                                style={{ color: "var(--pa-primary)" }} />
                              <input type="tel" placeholder="0300 1234567"
                                value={formData.contactNumber}
                                onChange={(e) => { setFormData({ ...formData, contactNumber: e.target.value }); setErrors({ ...errors, contactNumber: null }); }}
                                className="font-ticket-body w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-mono tracking-wider pa-input" />
                            </div>
                            {errors.contactNumber && <p className="font-ticket-body text-[11px] mt-1.5" style={{ color: "var(--pa-danger)" }}>{errors.contactNumber}</p>}
                            {profile?.phone && formData.contactNumber !== profile.phone && (
                              <button type="button"
                                onClick={() => setFormData({ ...formData, contactNumber: profile.phone })}
                                className="font-ticket-body text-[10px] mt-1.5 font-bold underline decoration-dotted underline-offset-2"
                                style={{ color: "var(--pa-primary-2)" }}>
                                Use saved number: {profile.phone}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3 — PHOTOS */}
                    {step === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

                        {formData.images.length === 0 ? (
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="group/drop w-full flex flex-col items-center justify-center gap-3 sm:gap-4 py-12 sm:py-20 px-4 border-2 border-dashed rounded-[18px] sm:rounded-[22px] transition-all"
                            style={{ borderColor: "var(--pa-line-str)", background: "var(--pa-panel-2)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "var(--pa-primary)";
                              e.currentTarget.style.background = "var(--pa-primary-2-soft)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "var(--pa-line-str)";
                              e.currentTarget.style.background = "var(--pa-panel-2)";
                            }}>
                            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center transition-transform group-hover/drop:scale-110"
                              style={{
                                background: "linear-gradient(135deg, var(--pa-primary-soft) 0%, var(--pa-primary-2-soft) 100%)",
                                border: "1px solid var(--pa-primary)",
                                boxShadow: "0 12px 24px -12px var(--pa-primary-glow)",
                              }}>
                              <FaCloudUploadAlt className="text-2xl sm:text-3xl" style={{ color: "var(--pa-primary-2)" }} />
                            </div>
                            <div className="text-center">
                              <p className="font-ticket-display text-sm sm:text-lg font-bold mb-1.5"
                                style={{ color: "var(--cat-txt)" }}>
                                Click to upload photos
                              </p>
                              <p className="font-ticket-body text-[11px] sm:text-sm" style={{ color: "var(--cat-txt-muted)" }}>
                                Up to 5 images · JPG or PNG · Max 5MB each
                              </p>
                            </div>
                          </button>
                        ) : (
                          <>
                            <div className="flex items-start gap-2.5 px-3 sm:px-3.5 py-2.5 rounded-xl mb-4"
                              style={{ background: "var(--pa-primary-2-soft)", border: "1px solid var(--pa-primary)" }}>
                              <FaMagic className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: "var(--pa-primary-2)" }} />
                              <p className="font-ticket-body text-[10px] sm:text-[11px] leading-snug" style={{ color: "var(--cat-txt-muted)" }}>
                                Tap any photo to <span className="font-bold" style={{ color: "var(--pa-primary-2)" }}>preview</span>, then use ✨ Remove BG or 🖌 Edit from the full view.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-4 sm:mb-5">
                              {formData.images.map((img, index) => {
                                const isCleaning = cleaningImageId === img.id;
                                const isCleaned = !!img.cleanedUrl;

                                return (
                                  <motion.div key={img.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ y: -3 }}
                                    className="group/img relative aspect-square rounded-2xl overflow-hidden border cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                                    style={{ borderColor: "var(--pa-line)" }}
                                    onClick={() => setPreviewIndex(index)}>
                                    <img src={img.url} alt={img.name}
                                      className={`w-full h-full ${isCleaned ? "object-contain p-2" : "object-cover"}`} />

                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                                      <span className="opacity-0 group-hover/img:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/95 text-black font-ticket-body text-[10px] font-bold shadow-lg">
                                        <FaSearchPlus className="text-[9px]" /> Preview
                                      </span>
                                    </div>

                                    <span className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white font-ticket-body text-[10px] font-extrabold shadow-md">
                                      {index + 1}
                                    </span>

                                    {isCleaned && (
                                      <span className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#E8A33D] text-[#1B1815] font-ticket-body text-[7px] sm:text-[8px] font-extrabold uppercase tracking-wider shadow-md">
                                        {img.edited ? (
                                          <><FaPaintBrush className="text-[7px]" /> Edited</>
                                        ) : (
                                          <><FaMagic className="text-[7px]" /> Cleaned</>
                                        )}
                                      </span>
                                    )}

                                    {isCleaning && (
                                      <div className="absolute inset-0 bg-[#1B1815]/70 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5">
                                        <FaSpinner className="text-[#E8A33D] text-lg animate-spin" />
                                        <span className="font-ticket-body text-[9px] font-bold text-[#F7F1E4]">
                                          {cleanProgress > 0 ? `${cleanProgress}%` : "Starting…"}
                                        </span>
                                      </div>
                                    )}

                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                      className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 rounded-full text-white flex items-center justify-center shadow-md transition-colors sm:opacity-0 sm:group-hover/img:opacity-100"
                                      style={{ background: "var(--pa-danger)" }}>
                                      <FaTrash className="text-[9px] sm:text-[10px]" />
                                    </button>
                                  </motion.div>
                                );
                              })}

                              {formData.images.length < 5 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                  className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all"
                                  style={{ borderColor: "var(--pa-line-str)", background: "var(--pa-panel-2)" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--pa-primary)"; e.currentTarget.style.background = "var(--pa-primary-2-soft)"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--pa-line-str)"; e.currentTarget.style.background = "var(--pa-panel-2)"; }}>
                                  <FaPlus className="text-lg sm:text-xl" style={{ color: "var(--pa-primary-2)" }} />
                                  <span className="font-ticket-body text-[9px] sm:text-[10px] font-bold" style={{ color: "var(--cat-txt-muted)" }}>Add more</span>
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border"
                              style={{ borderColor: "var(--pa-line)", background: "var(--pa-panel-2)" }}>
                              <span className="font-ticket-body text-xs font-bold" style={{ color: "var(--cat-txt)" }}>
                                {formData.images.length} / 5 photos
                              </span>
                              <span className="font-ticket-body text-[10px] inline-flex items-center gap-1" style={{ color: "var(--cat-txt-muted)" }}>
                                <FaSearchPlus className="text-[9px]" style={{ color: "var(--pa-ai)" }} />
                                Tap a photo to preview
                              </span>
                            </div>
                          </>
                        )}

                        {errors.images && <p className="font-ticket-body text-[11px] mt-3" style={{ color: "var(--pa-danger)" }}>{errors.images}</p>}

                <AnimatePresence>
  {previewIndex !== null && formData.images[previewIndex] && (
    <PreviewModal
      images={formData.images}
      index={previewIndex}
      onIndexChange={setPreviewIndex}
      onClose={() => setPreviewIndex(null)}
      onDelete={(id) => { removeImage(id); setPreviewIndex(null); }}
      onClean={(img) => handleCleanImage(img)}
      onEdit={(img) => setEditImage(img)}     // 👈 new
      cleaningImageId={cleaningImageId}
      cleanProgress={cleanProgress}
    />
  )}
</AnimatePresence>
{/* ⭐ AI Smart Fill Modal — GLOBAL, always available */}
<AnimatePresence>
  {aiOpen && (
    <AIAdAssistant
      open={aiOpen}
      onClose={() => setAiOpen(false)}
      onSubmit={handleAIFill}
      categories={categories}
      callAI={aiFillListing}
    />
  )}
</AnimatePresence>
{/* ⭐ NEW — in-place image editor */}
<AnimatePresence>
  {editImage && (
    <ImageEditorModal
      image={editImage}
      onClose={() => setEditImage(null)}
      onSave={handleSaveEditedImage}
    />
  )}
</AnimatePresence>
                      </motion.div>
                    )}

                    {/* STEP 4 — REVIEW */}
                    {step === 4 && (
                      <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                          <div className="rounded-2xl border p-4 sm:p-5 space-y-3 sm:space-y-4"
                            style={{ borderColor: "var(--pa-line)", background: "var(--pa-panel-2)" }}>
                            <p className="pa-label">Basic Information</p>
                            {[
                              { label: "Category", value: formData.category },
                              { label: "Title", value: formData.title },
                              { label: "Price", value: `Rs ${Number(formData.price).toLocaleString("en-US")}` },
                              { label: "Condition", value: formData.condition },
                              { label: "Location", value: formData.area ? `${formData.area}, ${formData.city}` : formData.city },
                              { label: "Contact", value: formData.contactNumber },
                              { label: "Photos", value: `${formData.images.length} uploaded` },
                            ].map((row) => (
                              <div key={row.label} className="flex items-start justify-between gap-3 pb-2.5 sm:pb-3 border-b last:border-0 last:pb-0"
                                style={{ borderColor: "var(--pa-line)" }}>
                                <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
                                  style={{ color: "var(--cat-txt-muted)" }}>{row.label}</span>
                                <span className="font-ticket-body text-xs font-bold text-right min-w-0 break-words"
                                  style={{ color: "var(--cat-txt)" }}>{row.value || "—"}</span>
                              </div>
                            ))}
                          </div>

                          {activeSpecGroups.length > 0 && (
                            <div className="rounded-2xl border p-4 sm:p-5 space-y-3 sm:space-y-4"
                              style={{ borderColor: "var(--pa-primary)", background: "var(--pa-primary-2-soft)" }}>
                              <p className="pa-label" style={{ color: "var(--pa-primary-2)" }}>
                                {formData.category} Details
                              </p>
                              {activeSpecGroups.map((group) => {
                                const groupItems = group.fields
                                  .map((f) => {
                                    const raw = formData.specs[f.key];
                                    if (raw === undefined || raw === null || raw === "" || (Array.isArray(raw) && raw.length === 0)) return null;
                                    return { label: f.label, value: Array.isArray(raw) ? raw.join(", ") : raw };
                                  })
                                  .filter(Boolean);
                                if (groupItems.length === 0) return null;
                                return (
                                  <div key={group.title} className="mb-3 sm:mb-4 last:mb-0">
                                    <p className="font-ticket-display text-xs font-bold mb-2" style={{ color: "var(--cat-txt)" }}>{group.title}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {groupItems.map((item) => (
                                        <div key={item.label} className="flex items-start justify-between gap-2 pb-2 border-b last:border-0"
                                          style={{ borderColor: "var(--pa-line)" }}>
                                          <span className="font-ticket-body text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                                            style={{ color: "var(--cat-txt-muted)" }}>{item.label}</span>
                                          <span className="font-ticket-body text-xs font-bold text-right break-words"
                                            style={{ color: "var(--cat-txt)" }}>{item.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {formData.description && (
                          <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--pa-line)", background: "var(--pa-panel-2)" }}>
                            <p className="pa-label">Description</p>
                            <p className="font-ticket-body text-xs leading-relaxed whitespace-pre-wrap break-words"
                              style={{ color: "var(--cat-txt)" }}>{formData.description}</p>
                          </div>
                        )}

                        {formData.images.length > 0 && (
                          <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--pa-line)", background: "var(--pa-panel-2)" }}>
                            <p className="pa-label">Photos</p>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
                              {formData.images.map((img) => {
                                const isCleaned = !!img.cleanedUrl;
                                return (
                                  <div key={img.id}
                                    className="relative aspect-square rounded-xl overflow-hidden border"
                                    style={{
                                      borderColor: "var(--pa-line)",
                                      background: isCleaned
                                        ? "linear-gradient(135deg, #F7F1E4 0%, #EFE6D3 100%)"
                                        : "#000",
                                    }}>
                                    <img src={img.url} alt={img.name}
                                      className={`w-full h-full ${isCleaned ? "object-contain p-1.5" : "object-cover"}`} />
                                    {isCleaned && (
                                      <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#E8A33D] flex items-center justify-center shadow-md">
                                        {img.edited ? (
                                          <FaPaintBrush className="text-[7px] text-[#1B1815]" />
                                        ) : (
                                          <FaMagic className="text-[7px] text-[#1B1815]" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {submitError && (
                          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl"
                            style={{ border: "1px solid var(--pa-danger)", background: "var(--pa-danger-soft)" }}>
                            <FaTimes className="text-sm mt-0.5 flex-shrink-0" style={{ color: "var(--pa-danger)" }} />
                            <p className="font-ticket-body text-[11px] leading-relaxed break-words" style={{ color: "var(--pa-danger)" }}>{submitError}</p>
                          </div>
                        )}

                        {sellerTrust.isTrusted ? (
                          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl"
                            style={{ border: "1px solid var(--pa-success)", background: "var(--pa-success-soft)" }}>
                            <FaCheckCircle className="text-sm mt-0.5 flex-shrink-0" style={{ color: "var(--pa-success)" }} />
                            <p className="font-ticket-body text-[11px] leading-relaxed" style={{ color: "var(--pa-success)" }}>
                              As a trusted seller, your listing goes live immediately.
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl"
                            style={{ border: "1px solid var(--pa-primary)", background: "var(--pa-primary-2-soft)" }}>
                            <FaShieldAlt className="text-sm mt-0.5 flex-shrink-0" style={{ color: "var(--pa-primary-2)" }} />
                            <div>
                              <p className="font-ticket-body text-[11px] font-bold leading-relaxed" style={{ color: "var(--pa-primary-2)" }}>
                                Your first few listings are reviewed before going live.
                              </p>
                              <p className="font-ticket-body text-[10px] mt-0.5" style={{ color: "var(--cat-txt-muted)" }}>
                                After {Math.max(0, 5 - sellerTrust.approvedCount)} more approved listings, you'll publish instantly.
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="px-4 sm:px-7 py-4 sm:py-5 border-t flex items-center justify-between gap-2 sm:gap-3"
                  style={{ borderColor: "var(--pa-line)", background: "var(--pa-panel-2)" }}>
                  <button type="button" onClick={isEditing ? () => navigate(`/listing/${editingId}`) : prevStep}
                    disabled={(step === 1 && !isEditing) || isSubmitting}
                    className="pa-btn pa-btn-ghost text-xs px-3.5 py-3 sm:px-5">
                    <FaArrowLeft className="text-[10px]" />
                    <span>{isEditing && step === 2 ? "Cancel" : "Back"}</span>
                  </button>

                  {step < 4 ? (
                    <button type="button" onClick={nextStep} disabled={autoAdvancing}
                      className="pa-btn pa-btn-primary px-4 sm:px-8 py-3 text-xs">
                      <span>Continue</span>
                      <FaArrowRight className="text-[10px]" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                      className="pa-btn pa-btn-primary px-4 sm:px-8 py-3 text-xs">
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {uploadProgress || "Saving..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <FaBolt className="text-xs" />
                          <span>{isEditing ? "Save Changes" : "Post Ad"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}


        {/* ⭐ AI Smart Fill Modal — GLOBAL, always available */}
        <AnimatePresence>
          {aiOpen && (
            <AIAdAssistant
              open={aiOpen}
              onClose={() => setAiOpen(false)}
              onSubmit={handleAIFill}
              categories={categories}
              callAI={aiFillListing}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSuccess && createdListing && (
            <SuccessScreen
              listing={createdListing}
              onPostAnother={handlePostAnother}
              onViewStats={handleViewStats}
              onClose={() => {
                setIsSuccess(false);
                setCreatedListing(null);
                setShowForm(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostAd;