// pages/Premium.jsx — Modern pricing + Active Plan dashboard (fully responsive + upgrade path)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePlan } from "../contexts/PlanContext";        // ⭐ NEW
import {
  FaArrowRight, FaSpinner, FaCheckCircle, FaCrown, FaBolt,
  FaShieldAlt, FaClock, FaStar, FaRocket, FaTimes,
  FaReceipt, FaEye, FaTimesCircle, FaDownload, FaSyncAlt,
  FaSearch, FaChevronLeft, FaChevronRight,
  FaCreditCard, FaUniversity, FaMobileAlt, FaWallet, FaFileInvoice,
  FaArrowUp, FaGem,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import ManualPaymentModal from "../components/ManualPaymentModal";
import { fetchMyManualPayments } from "../lib/manualPayments";

/* ═══════════════════════════════════════════════════════════════
   THEME HOOK
   ═══════════════════════════════════════════════════════════════ */
const useTheme = () => {
  const getTheme = () => {
    if (typeof document === "undefined") return "dark";
    const html = document.documentElement;
    if (html.classList.contains("theme-light")) return "light";
    if (html.classList.contains("theme-dark")) return "dark";
    if (html.classList.contains("dark")) return "dark";
    try {
      const saved = localStorage.getItem("theme") || localStorage.getItem("app-theme");
      if (saved === "light") return "light";
      if (saved === "dark") return "dark";
    } catch {}
    return "dark";
  };
  const [theme, setTheme] = useState(getTheme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onStorage = () => setTheme(getTheme());
    window.addEventListener("storage", onStorage);
    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return theme;
};

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
    .pricing-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; letter-spacing: -0.01em; }
    .pricing-display { font-family: 'Inter', system-ui, sans-serif; letter-spacing: -0.04em; font-weight: 800; }
    .mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; letter-spacing: -0.02em; }

    /* ══ GLOBAL SAFETY: prevent horizontal overflow ══ */
    html, body { overflow-x: hidden; max-width: 100vw; }
    .pricing-bg {
      overflow-x: hidden;
      max-width: 100vw;
      width: 100%;
    }
    .pricing-bg * { box-sizing: border-box; }

    /* ══ LIGHT THEME ══ */
    .theme-light, .pricing-light-default {
      --p-page-bg:       #FAFAFA;
      --p-card-bg:       #FAFAFA;
      --p-card-inner:    #FFFFFF;
      --p-txt:           #0A0A0A;
      --p-txt-soft:      #5A5854;
      --p-txt-faint:     #8B8983;
      --p-primary:       #D35400;
      --p-primary-2:     #F58220;
      --p-primary-soft:  rgba(211,84,0,0.10);
      --p-primary-glow:  rgba(211,84,0,0.35);
      --p-orange:        #E26A2C;
      --p-line:          rgba(20,20,20,0.06);
      --p-line-str:      rgba(20,20,20,0.12);
      --p-check-icon:    #F58220;
      --p-check-bg:      #FFF1E6;
      --p-btn-white:     #FFFFFF;
      --p-btn-white-txt: #0A0A0A;
      --p-badge-icon-bg: #FFFFFF;
      --p-badge-icon-fg: #F58220;
      --p-success-bg:    #ECFDF5;
      --p-success-txt:   #059669;
      --p-success-line:  #A7F3D0;
      --p-danger-bg:     #FEF2F2;
      --p-danger-txt:    #DC2626;
      --p-danger-line:   #FECACA;
      --p-warning-bg:    #FFFBEB;
      --p-warning-txt:   #D97706;
      --p-warning-line:  #FDE68A;
      --p-info-bg:       #EFF6FF;
      --p-info-txt:      #2563EB;
      --p-active-ring:   rgba(242,138,45,0.55);
      --p-row-hover:     rgba(211,84,0,0.04);
    }

    /* ══ DARK THEME ══ */
    .theme-dark {
      --p-page-bg:       #0A0A12;
      --p-card-bg:       #14141C;
      --p-card-inner:    #1B1B25;
      --p-txt:           #FFFFFF;
      --p-txt-soft:      rgba(255,255,255,0.65);
      --p-txt-faint:     rgba(255,255,255,0.42);
      --p-primary:       #F58220;
      --p-primary-2:     #E26A2C;
      --p-primary-soft:  rgba(242,138,45,0.14);
      --p-primary-glow:  rgba(242,138,45,0.45);
      --p-orange:        #F58220;
      --p-line:          rgba(255,255,255,0.06);
      --p-line-str:      rgba(255,255,255,0.12);
      --p-check-icon:    #E26A2C;
      --p-check-bg:      rgba(226,106,44,0.12);
      --p-btn-white:     #22222E;
      --p-btn-white-txt: #FFFFFF;
      --p-badge-icon-bg: #22222E;
      --p-badge-icon-fg: #E26A2C;
      --p-success-bg:    rgba(16,185,129,0.12);
      --p-success-txt:   #34D399;
      --p-success-line:  rgba(16,185,129,0.35);
      --p-danger-bg:     rgba(239,68,68,0.12);
      --p-danger-txt:    #F87171;
      --p-danger-line:   rgba(239,68,68,0.35);
      --p-warning-bg:    rgba(245,158,11,0.12);
      --p-warning-txt:   #FBBF24;
      --p-warning-line:  rgba(245,158,11,0.35);
      --p-info-bg:       rgba(59,130,246,0.12);
      --p-info-txt:      #60A5FA;
      --p-active-ring:   rgba(242,138,45,0.65);
      --p-row-hover:     rgba(242,138,45,0.06);
    }

    .pricing-bg {
      background: var(--p-page-bg);
      color: var(--p-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }

    /* ── PRICING CARDS ── */
    .pricing-card {
      background: var(--p-card-bg);
      border: 1px solid var(--p-line);
      border-radius: 24px;
      transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
                  box-shadow 0.35s ease,
                  border-color 0.35s ease,
                  background 0.35s ease;
      position: relative;
      min-width: 0;
      overflow: hidden;
    }
    @media (min-width: 640px) {
      .pricing-card { border-radius: 28px; }
    }
    .pricing-card--clickable { cursor: pointer; }
    .pricing-card--clickable:hover {
      transform: translateY(-6px);
      border-color: var(--p-primary);
      box-shadow:
        0 24px 60px -22px var(--p-primary-glow),
        0 0 0 1px var(--p-primary);
    }
    .pricing-card--active {
      border-color: var(--p-primary) !important;
      box-shadow:
        0 24px 60px -20px var(--p-primary-glow),
        0 0 0 2px var(--p-active-ring);
    }
    .pricing-card--current {
      border-color: var(--p-success-txt) !important;
      box-shadow: 0 24px 60px -20px rgba(16,185,129,0.35);
    }
    .pricing-inner {
      background: var(--p-card-inner);
      border-radius: 20px;
    }
    .pricing-card__header::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, var(--p-line-str) 1px, transparent 1px);
      background-size: 8px 8px;
      opacity: 0.4;
      pointer-events: none;
      border-top-left-radius: 28px;
      border-top-right-radius: 28px;
    }
    .designed-highlight {
      position: relative;
      display: inline-block;
      color: var(--p-orange);
      font-weight: 800;
      font-style: italic;
      padding: 0 8px;
    }
    .designed-highlight::before {
      content: '';
      position: absolute;
      inset: -4px -6px -6px -6px;
      background: var(--p-primary-soft);
      border-radius: 12px;
      transform: skew(-4deg) rotate(-1deg);
      z-index: -1;
      border: 1px solid var(--p-primary);
      opacity: 0.9;
    }
    .feature-row { position: relative; padding-left: 22px; }
    .feature-row::before {
      content: '';
      position: absolute;
      left: 0; top: 6px; bottom: 6px;
      width: 3px;
      border-radius: 3px;
      background: var(--p-line);
    }
    .feature-row__dot {
      position: absolute;
      left: -8px; top: 12px;
      width: 14px; height: 14px;
      border-radius: 50%;
      background: var(--p-check-bg);
      border: 1px solid var(--p-check-icon);
      display: flex; align-items: center; justify-content: center;
    }
    .feature-row__dot-inner {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--p-check-icon);
    }
    .feature-row--muted .feature-row__dot {
      background: transparent;
      border-color: var(--p-line-str);
    }
    .feature-row--muted .feature-row__dot-inner { background: var(--p-txt-faint); }

    .pricing-discount-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
      background: var(--p-success-bg);
      color: var(--p-success-txt);
      border: 1px solid var(--p-success-line);
      text-transform: uppercase;
    }
    .billing-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background: var(--p-card-bg);
      border: 1px solid var(--p-line);
    }
    .billing-toggle__btn {
      position: relative;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 700;
      transition: all 0.25s ease;
      color: var(--p-txt-soft);
      background: transparent;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }
    @media (min-width: 640px) {
      .billing-toggle__btn { padding: 8px 18px; font-size: 13px; }
    }
    .billing-toggle__btn--active {
      background: linear-gradient(135deg, var(--p-primary) 0%, var(--p-primary-2) 100%);
      color: #FFFFFF;
      box-shadow: 0 8px 20px -10px var(--p-primary-glow);
    }
    .popular-badge {
      position: absolute;
      top: 14px; right: 14px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(135deg, var(--p-primary) 0%, var(--p-primary-2) 100%);
      color: #FFFFFF;
      box-shadow: 0 8px 20px -8px var(--p-primary-glow);
      z-index: 5;
    }
    @media (min-width: 640px) {
      .popular-badge { top: 18px; right: 18px; padding: 5px 12px; font-size: 10.5px; }
    }
    .current-badge {
      position: absolute;
      top: 14px; left: 14px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: var(--p-success-bg);
      color: var(--p-success-txt);
      border: 1px solid var(--p-success-line);
      z-index: 5;
    }
    @media (min-width: 640px) {
      .current-badge { top: 18px; left: 18px; padding: 5px 12px; font-size: 10.5px; }
    }

    /* ══ DASHBOARD ══ */
    .dash-card {
      background: var(--p-card-inner);
      border: 1px solid var(--p-line);
      border-radius: 20px;
      transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
      min-width: 0;
      overflow: hidden;
    }
    .dash-stat {
      background: var(--p-card-inner);
      border: 1px solid var(--p-line);
      border-radius: 18px;
      padding: 14px 16px;
      transition: border-color 0.25s ease, transform 0.25s ease;
      min-width: 0;
    }
    @media (min-width: 640px) {
      .dash-stat { border-radius: 20px; padding: 18px 20px; }
    }
    .dash-stat:hover { transform: translateY(-2px); border-color: var(--p-line-str); }
    .dash-stat__icon {
      width: 32px; height: 32px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }
    @media (min-width: 640px) {
      .dash-stat__icon { width: 42px; height: 42px; border-radius: 12px; font-size: 16px; }
    }

    .dash-tabs {
      display: flex;
      align-items: center;
      gap: 0;
      border-bottom: 1px solid var(--p-line);
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      width: 100%;
      min-width: 0;
    }
    .dash-tabs::-webkit-scrollbar { display: none; }
    .dash-tab {
      position: relative;
      padding: 10px 2px;
      margin-right: 18px;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--p-txt-soft);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    @media (min-width: 640px) {
      .dash-tab { margin-right: 22px; padding: 10px 4px; font-size: 13px; }
    }
    .dash-tab:hover { color: var(--p-txt); }
    .dash-tab--active { color: var(--p-txt); }
    .dash-tab--active::after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: -1px;
      height: 2px;
      background: var(--p-primary);
      border-radius: 2px;
    }
    .dash-tab__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      background: var(--p-line);
      color: var(--p-txt-soft);
    }
    @media (min-width: 640px) {
      .dash-tab__count { min-width: 20px; height: 20px; padding: 0 6px; font-size: 10.5px; }
    }
    .dash-tab--active .dash-tab__count {
      background: var(--p-primary-soft);
      color: var(--p-primary);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .status-pill--pending  { background: var(--p-warning-bg); color: var(--p-warning-txt); border: 1px solid var(--p-warning-line); }
    .status-pill--approved { background: var(--p-success-bg); color: var(--p-success-txt); border: 1px solid var(--p-success-line); }
    .status-pill--rejected { background: var(--p-danger-bg);  color: var(--p-danger-txt);  border: 1px solid var(--p-danger-line); }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--p-line);
      background: transparent;
      color: var(--p-txt-soft);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .icon-btn:hover {
      border-color: var(--p-primary);
      color: var(--p-primary);
      background: var(--p-primary-soft);
    }

    .dash-search {
      position: relative;
      flex: 1;
      min-width: 0;
      width: 100%;
    }
    .dash-search input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border-radius: 12px;
      border: 1px solid var(--p-line);
      background: var(--p-card-inner);
      color: var(--p-txt);
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .dash-search input:focus {
      border-color: var(--p-primary);
      box-shadow: 0 0 0 3px var(--p-primary-soft);
    }
    .dash-search svg {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--p-txt-faint);
      font-size: 12px;
    }

    .page-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      height: 34px;
      padding: 0 10px;
      border-radius: 10px;
      border: 1px solid var(--p-line);
      background: transparent;
      color: var(--p-txt-soft);
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .page-btn:hover:not(:disabled) {
      border-color: var(--p-primary);
      color: var(--p-primary);
    }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-btn--active {
      background: var(--p-primary);
      border-color: var(--p-primary);
      color: #FFFFFF;
    }

    /* ══ MOBILE PAYMENT CARDS ══ */
    .pay-row {
      display: block;
      padding: 14px 16px;
      border-bottom: 1px solid var(--p-line);
      transition: background 0.15s ease;
      min-width: 0;
    }
    .pay-row:hover { background: var(--p-row-hover); }
    .pay-row:last-child { border-bottom: none; }

    .pay-row__top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
      min-width: 0;
    }
    .pay-row__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 14px;
      margin-bottom: 10px;
      min-width: 0;
    }
    .pay-row__label {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--p-txt-faint);
      margin-bottom: 3px;
    }
    .pay-row__value {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--p-txt);
      word-break: break-word;
    }
    .pay-row__actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 10px;
      border-top: 1px dashed var(--p-line);
    }

    /* Table visible only ≥1024px, cards below */
    .pay-table-desktop { display: none; overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch; }
    .pay-cards-mobile { display: block; }
    @media (min-width: 1024px) {
      .pay-table-desktop { display: block; }
      .pay-cards-mobile { display: none; }
    }

    .dash-table {
      width: 100%;
      min-width: 720px;
      border-collapse: separate;
      border-spacing: 0;
    }
    .dash-table thead th {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--p-txt-faint);
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--p-line);
      background: var(--p-card-inner);
      white-space: nowrap;
    }
    .dash-table tbody td {
      padding: 16px;
      font-size: 12.5px;
      color: var(--p-txt);
      border-bottom: 1px solid var(--p-line);
      vertical-align: middle;
    }
    .dash-table tbody tr { transition: background 0.15s ease; }
    .dash-table tbody tr:hover { background: var(--p-row-hover); }
    .dash-table tbody tr:last-child td { border-bottom: none; }

    /* ══ UPGRADE BANNER ══ */
    .upgrade-banner {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      padding: 20px 22px;
      background: linear-gradient(135deg, var(--p-primary) 0%, var(--p-primary-2) 100%);
      box-shadow: 0 20px 50px -20px var(--p-primary-glow);
      color: #FFFFFF;
    }
    @media (min-width: 640px) {
      .upgrade-banner { padding: 26px 30px; border-radius: 24px; }
    }
    .upgrade-banner__glow {
      position: absolute;
      top: -60%; right: -20%;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%);
      pointer-events: none;
    }
    .upgrade-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 12.5px;
      font-weight: 800;
      background: #FFFFFF;
      color: var(--p-primary);
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 8px 20px -8px rgba(0,0,0,0.35);
      white-space: nowrap;
    }
    .upgrade-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -8px rgba(0,0,0,0.4); }
    .upgrade-cta:active { transform: translateY(0); }

    /* ⭐ Inline upgrade link inside active-plan banner */
    .upgrade-link-inline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 800;
      color: #FFFFFF;
      background: linear-gradient(135deg, var(--p-primary) 0%, var(--p-primary-2) 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 20px -10px var(--p-primary-glow);
      transition: transform 0.2s ease;
    }
    .upgrade-link-inline:hover { transform: translateY(-1px); }
    .upgrade-link-inline:active { transform: translateY(0); }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const PLAN_META = {
  starter: { name: "Starter",    icon: FaRocket, color: "var(--p-txt-soft)" },
  free:    { name: "Starter",    icon: FaRocket, color: "var(--p-txt-soft)" },
  seller:  { name: "Seller",     icon: FaBolt,   color: "var(--p-primary)" },
  pro:     { name: "Pro Seller", icon: FaCrown,  color: "var(--p-primary)" },
};
const getPlanMeta = (planId) =>
  PLAN_META[String(planId || "").toLowerCase()] || PLAN_META.starter;

const PLAN_RANK = { starter: 0, free: 0, seller: 1, pro: 2 };

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString("en-US")}`;
const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};
const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};
const shortId = (id) =>
  `PAY-${String(id || "").replace(/[^0-9A-Za-z]/g, "").slice(0, 8).toUpperCase() || "000000"}`;

const METHOD_ICON = {
  easypaisa: FaMobileAlt,
  jazzcash:  FaWallet,
  bank:      FaUniversity,
  card:      FaCreditCard,
  cod:       FaWallet,
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const Premium = () => {
  const { user, refreshUser } = useAuth();
  const { planId: contextPlanId, subscription, refresh: refreshPlan } = usePlan();  // ⭐ PlanContext
  const navigate = useNavigate();
  const theme = useTheme();

  const [selectedPlan, setSelectedPlan] = useState("seller");
  const [activeCard, setActiveCard] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [showManualPay, setShowManualPay] = useState(false);
  const [pendingPack, setPendingPack] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lightbox, setLightbox] = useState(null);

  /* ⭐ "Show plans" toggle for premium users who want to change plan */
  const [showPlans, setShowPlans] = useState(false);

  /* ⭐⭐⭐ SINGLE SOURCE OF TRUTH: PlanContext's planId (from subscriptions.plan) */
  const activePlanId = useMemo(() => {
    const raw = String(contextPlanId || "free").toLowerCase();
    if (raw === "free" || raw === "starter") return "starter";
    if (raw === "seller") return "seller";
    if (raw === "pro") return "pro";
    return "starter";
  }, [contextPlanId]);

  const isPremium = activePlanId !== "starter";  // ⭐ derived from context, not useAuth
  const activeMeta = getPlanMeta(activePlanId);
  const ActiveIcon = activeMeta.icon;

  /* ⭐ Next plan up (for upgrade path) */
  const nextPlan =
    activePlanId === "seller" ? "pro" :
    activePlanId === "pro"    ? null  :
    "seller";

  const canUpgradeToPro = isPremium && activePlanId === "seller";

  /* ⭐ Subscription summary from PlanContext (real subscription row) */
  const activeSubscription = useMemo(() => {
    if (!subscription) return null;
    return {
      plan: activeMeta.name,
      planId: activePlanId,
      start: subscription.start_date,
      end: subscription.end_date,
      method: subscription.payment_method,
      billingCycle: subscription.billing_cycle || "monthly",
    };
  }, [subscription, activePlanId, activeMeta.name]);

  /* ⭐ Payment history — for the table only, NOT for plan derivation */
  const loadPayments = useCallback(async () => {
    if (!user?.id) return;
    setPaymentsLoading(true);
    try {
      const list = await fetchMyManualPayments(user.id);
      setPayments(list || []);
    } catch (err) {
      console.error("[Premium] load payments failed:", err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  useEffect(() => {
    const onFocus = () => { loadPayments(); refreshPlan(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("plan-updated", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("plan-updated", onFocus);
    };
  }, [loadPayments, refreshPlan]);

  const stats = useMemo(() => {
    const total = payments.length;
    const pending  = payments.filter((p) => p.status === "pending").length;
    const approved = payments.filter((p) => p.status === "approved").length;
    const rejected = payments.filter((p) => p.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [payments]);

  const filtered = useMemo(() => {
    let list = payments;
    if (tab !== "all") list = list.filter((p) => p.status === tab);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        String(p.id).toLowerCase().includes(q) ||
        String(p.pack_name || "").toLowerCase().includes(q) ||
        String(p.method || "").toLowerCase().includes(q) ||
        String(p.activation_code || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [payments, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  useEffect(() => { setPage(1); }, [tab, query, pageSize]);

  /* ── Plans ── */
  const plans = [
    {
      id: "starter", name: "Starter", badgeIcon: FaRocket,
      tagline: "Perfect to explore the marketplace",
      priceMonthly: 0, priceYearly: 0, icon: FaRocket, badge: null,
      cta: "Start Free", credits: 0, popular: false, isFree: true,
      features: [
        { title: "1 Active Listing",    desc: "Post one item at a time. Sold it? Post the next." },
        { title: "3 AI Images / month", desc: "Try NanoBanana image generation." },
        { title: "Live Seller Chat",    desc: "Message buyers and sellers in real time." },
        { title: "Social Feed",         desc: "Post, like, comment and share." },
        { title: "Escrow Checkout",     desc: "Safe payments until both sides confirm." },
        { title: "Buy Any Item",        desc: "Browse and purchase without limits." },
      ],
    },
    {
      id: "seller", name: "Seller", badgeIcon: FaBolt,
      tagline: "For serious sellers who want more reach",
      priceMonthly: 500, priceYearly: 5000, icon: FaBolt, badge: "Most Popular",
      cta: "Upgrade to Seller", credits: 1, popular: true, isFree: false,
      features: [
        { title: "30 Active Listings",      desc: "6× more than the free plan." },
        { title: "30 AI Images / month",    desc: "Clean product photos without effort." },
        { title: "1 Featured Boost / month", desc: "Top of category for 7 days." },
        { title: "Verified Seller Badge",   desc: "Build trust with every buyer." },
        { title: "Background Remover",      desc: "One-click cut-outs for any item." },
        { title: "Priority in Search",      desc: "Your listings rank above free sellers." },
      ],
      mutedFeatures: [{ title: "Listing Analytics", desc: "Pro Seller only." }],
    },
    {
      id: "pro", name: "Pro Seller", badgeIcon: FaCrown,
      tagline: "For power sellers and dealers",
      priceMonthly: 1500, priceYearly: 15000, icon: FaCrown, badge: null,
      cta: "Upgrade to Pro", credits: 3, popular: false, isFree: false,
      features: [
        { title: "Unlimited Listings",      desc: "No caps — list your whole inventory." },
        { title: "200 AI Images / month",   desc: "Full AI Studio access for your store." },
        { title: "4 Featured Boosts / month", desc: "Stay at the top of your category." },
        { title: "Listing Analytics",       desc: "See views, clicks, chats and conversions." },
        { title: "Priority Support",        desc: "Chat with a human within minutes." },
        { title: "Gold Business Badge",     desc: "Stand out as a verified dealer." },
      ],
      mutedFeatures: [],
    },
  ];

  const ensureUserExists = async () => {
    if (!user) return false;
    try {
      const { data: userData, error: userError } = await supabase
        .from("users").select("id").eq("id", user.id);
      if (userError) return false;
      if (!userData || userData.length === 0) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
          is_premium: false,
          created_at: new Date().toISOString(),
        });
        if (insertError) return false;
        return true;
      }
      return true;
    } catch { return false; }
  };

  const handlePlanClick = (planId) => {
    if (!user) { navigate("/signup"); return; }
    if (loadingPlanId) return;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    if (plan.isFree) { navigate("/dashboard"); return; }

    setActiveCard(planId);
    setSelectedPlan(planId);
    setLoadingPlanId(planId);

    const numericPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
    const packShape = {
      id: plan.id,
        plan: plan.id,                          // ⭐ ADD THIS
      name: `${plan.name} · ${billingCycle === "monthly" ? "Monthly" : "Yearly"}`,
      credits: plan.credits,
      price: `Rs ${numericPrice.toLocaleString()}`,
      pricePKR: numericPrice,
      currency: "PKR",
      billingCycle,
      features: plan.features.map((f) => `${f.title} — ${f.desc}`),
    };

    setTimeout(() => {
      setLoadingPlanId(null);
      setPendingPack(packShape);
      setShowManualPay(true);
    }, 900);
  };
/* ⭐ Upgrade handler — switches to pricing view + opens payment modal */
const handleUpgrade = (targetPlanId) => {
  // ⭐ Must show the pricing view — the modal is mounted there
  setShowPlans(true);

  setActiveCard(targetPlanId);
  setSelectedPlan(targetPlanId);
  setBillingCycle("monthly");

  const plan = plans.find((p) => p.id === targetPlanId);
  if (!plan) return;

  const numericPrice = plan.priceMonthly;
  const packShape = {
    id: plan.id,
      plan: plan.id,                          // ⭐ ADD THIS
    name: `${plan.name} · Monthly`,
    credits: plan.credits,
    price: `Rs ${numericPrice.toLocaleString()}`,
    pricePKR: numericPrice,
    currency: "PKR",
    billingCycle: "monthly",
    features: plan.features.map((f) => `${f.title} — ${f.desc}`),
  };

  // Scroll to top so the pricing grid + modal are visible
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setTimeout(() => {
    setPendingPack(packShape);
    setShowManualPay(true);
  }, 400);
};
  /* ⭐ Called after successful payment (pending or instant) */
  const handlePaymentSuccess = async () => {
    try {
      await ensureUserExists();

      /* For instant redemptions, immediately refresh PlanContext */
      await refreshPlan();
      await refreshUser?.();
      await loadPayments();
    } catch (err) { console.error("post-payment:", err); }
  };

  /* ═══════════════════════════════════════════════════════════
     VIEW: PRICING (shared by non-premium AND premium-in-upgrade-mode)
     ═══════════════════════════════════════════════════════════ */
  const renderPricing = () => (
    <div className={`min-h-screen pricing-bg pricing-font theme-${theme} relative overflow-hidden`}>
      <FontStyles />

      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[500px] rounded-full blur-[120px] sm:blur-[140px]"
        style={{ background: `radial-gradient(circle, var(--p-primary-glow) 0%, transparent 70%)`, opacity: 0.35 }}
        aria-hidden="true"
      />

      <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 pt-10 sm:pt-20 pb-16 sm:pb-24 relative z-10">

        {/* ⭐ Back to dashboard when upgrading */}
        {isPremium && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowPlans(false)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-[12px] sm:text-[12.5px] font-bold transition-all hover:scale-[1.02]"
              style={{ background: "var(--p-btn-white)", color: "var(--p-btn-white-txt)", border: "1px solid var(--p-line)" }}
            >
              <FaChevronLeft className="text-[10px]" />
              Back to my plan
            </button>
          </div>
        )}

        {stats.pending > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 flex items-start sm:items-center gap-3 px-4 py-3 rounded-2xl max-w-[640px] mx-auto"
            style={{ background: "var(--p-warning-bg)", border: "1px solid var(--p-warning-line)" }}
          >
            <FaClock className="text-[14px] flex-shrink-0 mt-0.5 sm:mt-0" style={{ color: "var(--p-warning-txt)" }} />
            <p className="text-[12px] sm:text-[12.5px] font-semibold" style={{ color: "var(--p-warning-txt)" }}>
              You have <strong>{stats.pending}</strong> payment{stats.pending > 1 ? "s" : ""} awaiting approval. We'll activate your plan within 2 hours.
            </p>
          </motion.div>
        )}

        <div className="text-center mb-3 sm:mb-4">
          <h1 className="pricing-display text-[26px] sm:text-[46px] md:text-[56px] leading-[1.1] sm:leading-[1.05] mb-3 sm:mb-4 px-1">
            <span style={{ color: "var(--p-txt)" }}>
              {isPremium ? "Upgrade your plan " : "Plans that grow "}
            </span>
            <span className="designed-highlight">
              {isPremium ? "further" : "with you"}
            </span>
          </h1>
        </div>

        <p
          className="text-center text-[13px] sm:text-[15px] max-w-[560px] mx-auto mb-6 sm:mb-8 leading-relaxed px-2"
          style={{ color: "var(--p-txt-soft)" }}
        >
          {isPremium
            ? `You're on ${activeMeta.name}. Move up to unlock more.`
            : "Sell more, faster. Start free — upgrade only when it pays off."}
        </p>

        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="billing-toggle">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`billing-toggle__btn ${billingCycle === "monthly" ? "billing-toggle__btn--active" : ""}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`billing-toggle__btn ${billingCycle === "yearly" ? "billing-toggle__btn--active" : ""}`}
            >
              Yearly
              <span className="ml-1.5 sm:ml-2 pricing-discount-pill" style={{ fontSize: "9px", padding: "2px 6px" }}>
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-7 items-stretch">
          {plans.map((plan, idx) => {
            const isLoading = loadingPlanId === plan.id;
            const isActive = activeCard === plan.id;
            const isCurrent = isPremium && activePlanId === plan.id;
            const BadgeIcon = plan.badgeIcon;
            const priceValue = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const period = billingCycle === "monthly" ? "month" : "year";
            const clickable = !plan.isFree && !isCurrent;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => clickable && handlePlanClick(plan.id)}
                className={`pricing-card relative flex flex-col ${isActive ? "pricing-card--active" : ""} ${isCurrent ? "pricing-card--current" : ""} ${clickable ? "pricing-card--clickable" : ""}`}
              >
                {plan.badge && !isCurrent && <div className="popular-badge">{plan.badge}</div>}
                {isCurrent && <div className="current-badge"><FaCheckCircle className="text-[9px] inline mr-1" />Current</div>}

                <div className="pricing-card__header relative p-4 sm:p-7 pb-2">
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="pricing-display text-[20px] sm:text-[26px] leading-tight mb-1" style={{ color: "var(--p-primary)" }}>
                        {plan.name}
                      </h3>
                      <p className="text-[11.5px] sm:text-[12.5px] leading-snug" style={{ color: "var(--p-txt-soft)" }}>
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <div
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: "var(--p-badge-icon-bg)",
                          boxShadow: "0 6px 18px -8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
                          border: "1px solid var(--p-line)",
                          color: "var(--p-badge-icon-fg)",
                        }}
                      >
                        <BadgeIcon className="text-[16px] sm:text-[20px]" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 mb-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="pricing-display text-[34px] sm:text-[52px] leading-none font-black"
                        style={{ color: "var(--p-txt)", letterSpacing: "-0.045em" }}
                      >
                        Rs {priceValue.toLocaleString()}
                      </span>
                      <span className="text-[12px] sm:text-[13px] font-semibold" style={{ color: "var(--p-txt-soft)" }}>
                        /{period}
                      </span>
                    </div>
                    {plan.isFree ? (
                      <p className="text-[11px] sm:text-[11.5px] mt-2 font-semibold" style={{ color: "var(--p-txt-faint)" }}>
                        No card required · Forever free
                      </p>
                    ) : billingCycle === "yearly" ? (
                      <p className="text-[11px] sm:text-[11.5px] mt-2 font-semibold" style={{ color: "var(--p-success-txt)" }}>
                        ≈ Rs {Math.round(plan.priceYearly / 12).toLocaleString()}/month
                      </p>
                    ) : (
                      <p className="text-[11px] sm:text-[11.5px] mt-2 font-semibold" style={{ color: "var(--p-txt-faint)" }}>
                        Cancel anytime
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-3 sm:px-5 pb-4 flex-1 flex flex-col min-w-0">
                  <div className="pricing-inner p-3.5 sm:p-5 flex-1 flex flex-col min-w-0" style={{ boxShadow: "0 8px 24px -18px rgba(0,0,0,0.15)" }}>
                    <ul className="space-y-4 sm:space-y-5 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="feature-row relative">
                          <span className="feature-row__dot">
                            <span className="feature-row__dot-inner" />
                          </span>
                          <div className="text-[12px] sm:text-[13px] font-bold leading-snug mb-0.5" style={{ color: "var(--p-txt)" }}>
                            {f.title}
                          </div>
                          <div className="text-[11px] sm:text-[12px] leading-snug" style={{ color: "var(--p-txt-soft)" }}>
                            {f.desc}
                          </div>
                        </li>
                      ))}
                      {plan.mutedFeatures?.map((f, i) => (
                        <li key={`m-${i}`} className="feature-row feature-row--muted relative">
                          <span className="feature-row__dot">
                            <span className="feature-row__dot-inner" />
                          </span>
                          <div
                            className="text-[12px] sm:text-[13px] font-bold leading-snug mb-0.5 inline-flex items-center gap-1.5"
                            style={{ color: "var(--p-txt-faint)" }}
                          >
                            <FaTimes className="text-[9px]" />
                            {f.title}
                          </div>
                          <div className="text-[11px] sm:text-[12px] leading-snug" style={{ color: "var(--p-txt-faint)" }}>
                            {f.desc}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-3 sm:px-5 pb-4 sm:pb-5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clickable && handlePlanClick(plan.id); }}
                    disabled={!!loadingPlanId || isCurrent}
                    className="w-full py-3 sm:py-3.5 rounded-2xl text-[13px] sm:text-[13.5px] font-bold transition-all hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2"
                    style={
                      isCurrent
                        ? {
                            background: "var(--p-success-bg)",
                            color: "var(--p-success-txt)",
                            border: "1px solid var(--p-success-line)",
                          }
                        : plan.popular || isActive
                        ? {
                            background: "linear-gradient(135deg, var(--p-primary) 0%, var(--p-primary-2) 100%)",
                            color: "#FFFFFF",
                            boxShadow: "0 14px 30px -12px var(--p-primary-glow)",
                          }
                        : {
                            background: "var(--p-btn-white)",
                            color: "var(--p-btn-white-txt)",
                            border: "1px solid var(--p-line)",
                          }
                    }
                  >
                    {isLoading ? (
                      <><FaSpinner className="animate-spin text-xs" /> Processing…</>
                    ) : isCurrent ? (
                      <><FaCheckCircle className="text-[11px]" /> Your current plan</>
                    ) : (
                      <>{plan.cta}<FaArrowRight className="text-[10px]" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-3 px-2">
          {[
            { icon: FaShieldAlt,   label: "Escrow-protected payments" },
            { icon: FaCheckCircle, label: "Cancel anytime" },
            { icon: FaClock,       label: "Activated within 2 hours" },
            { icon: FaStar,        label: "7-day money-back guarantee" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-2 text-[11.5px] sm:text-[12.5px] font-semibold text-center" style={{ color: "var(--p-txt-soft)" }}>
              <Icon className="text-[11px]" style={{ color: "var(--p-primary)" }} />
              {label}
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] sm:text-[11.5px] mt-6 sm:mt-8 max-w-[520px] mx-auto leading-relaxed px-4" style={{ color: "var(--p-txt-faint)" }}>
          Prices in PKR. Yearly plans include 2 months free. Need a custom dealer plan?{" "}
          <button
            type="button"
            onClick={() => navigate("/support")}
            className="font-bold underline"
            style={{ color: "var(--p-primary)" }}
          >
            Talk to us
          </button>
        </p>
      </div>

      <ManualPaymentModal
        isOpen={showManualPay}
        onClose={() => {
          setShowManualPay(false);
          setPendingPack(null);
          setActiveCard(null);
        }}
        pack={pendingPack}
        onSuccess={async (credits, meta) => {
          if (meta?.mode === "pending") {
            setShowManualPay(false);
            setPendingPack(null);
            setActiveCard(null);
            await loadPayments();
            return;
          }
          if (meta?.mode === "instant") {
            window.dispatchEvent(new Event("plan-updated"));
            window.dispatchEvent(new Event("user-profile-updated"));
            await refreshUser?.();
            await refreshPlan();
          }
          await handlePaymentSuccess(credits, meta);
        }}
      />
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: PRICING PAGE (user chose to browse/upgrade)
     ═══════════════════════════════════════════════════════════ */
  if (isPremium && showPlans) {
    return renderPricing();
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW: ACTIVE PLAN DASHBOARD
     ═══════════════════════════════════════════════════════════ */
  if (isPremium) {
    return (
      <div className={`min-h-screen pricing-bg pricing-font theme-${theme} relative`}>
        <FontStyles />

        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[320px] sm:h-[420px] rounded-full blur-[120px] sm:blur-[140px]"
          style={{ background: `radial-gradient(circle, var(--p-primary-glow) 0%, transparent 70%)`, opacity: 0.22 }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-14 pb-16 sm:pb-20 z-10">

          {/* ═══ Header ═══ */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-[0.18em] mb-1.5 sm:mb-2" style={{ color: "var(--p-primary)" }}>
                Active Plan
              </p>
              <h3 className="pricing-display text-[24px] sm:text-[34px] md:text-[20px] leading-[1.1] mb-1.5 sm:mb-2">
                Your <span className="designed-highlight">{activeMeta.name}</span>
              </h3>
              <p className="text-[12.5px] sm:text-[14px] max-w-[560px] leading-relaxed" style={{ color: "var(--p-txt-soft)" }}>
                Manage your subscription, review payments, and download receipts.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => { loadPayments(); refreshPlan(); }}
                disabled={paymentsLoading}
                className="icon-btn"
                title="Refresh"
              >
                <FaSyncAlt className={paymentsLoading ? "animate-spin" : ""} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-[12px] sm:text-[12.5px] font-bold transition-all hover:scale-[1.02] flex-1 sm:flex-initial justify-center"
                style={{ background: "var(--p-btn-white)", color: "var(--p-btn-white-txt)", border: "1px solid var(--p-line)" }}
              >
                Dashboard
              </button>
              {nextPlan && (
                <button
                  type="button"
                  onClick={() => handleUpgrade(nextPlan)}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-[12px] sm:text-[12.5px] font-bold text-white transition-all hover:scale-[1.02] flex-1 sm:flex-initial justify-center"
                  style={{ background: "linear-gradient(135deg, var(--p-primary) 0%, var(--p-primary-2) 100%)", boxShadow: "0 14px 30px -12px var(--p-primary-glow)" }}
                >
                  <FaArrowUp className="text-[10px]" />
                  Upgrade to {nextPlan === "pro" ? "Pro" : "Seller"}
                </button>
              )}
            </div>
          </div>

          {/* ═══ Active Plan Banner ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pricing-card p-4 sm:p-6 md:p-7 mb-5 sm:mb-6 min-w-0"
            style={{ borderColor: "var(--p-primary)" }}
          >
            <div className="flex items-start gap-3 sm:gap-5 flex-col sm:flex-row min-w-0">
              <div
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--p-primary)", color: "#fff", boxShadow: "0 16px 34px -14px var(--p-primary-glow)" }}
              >
                <ActiveIcon className="text-xl sm:text-2xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="pricing-display text-[18px] sm:text-[22px] leading-none">{activeMeta.name}</p>
                  <span className="status-pill status-pill--approved">
                    <FaCheckCircle className="text-[9px]" /> Active
                  </span>
                </div>
                <p className="text-[12px] sm:text-[12.5px]" style={{ color: "var(--p-txt-soft)" }}>
                  {activeSubscription
                    ? `${activeSubscription.billingCycle === "yearly" ? "Yearly" : "Monthly"} subscription · started ${formatDate(activeSubscription.start)}`
                    : "Your premium features are unlocked."}
                </p>

                {/* ⭐ INLINE UPGRADE LINK — Seller → Pro */}
                {canUpgradeToPro && (
                  <button
                    type="button"
                    onClick={() => handleUpgrade("pro")}
                    className="upgrade-link-inline"
                  >
                    <FaArrowUp className="text-[10px]" />
                    Upgrade to Pro Seller
                    <FaArrowRight className="text-[9px]" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto sm:flex-shrink-0">
                <div className="rounded-xl p-2 sm:p-3 min-w-0" style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)" }}>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1" style={{ color: "var(--p-txt-faint)" }}>Renews</p>
                  <p className="text-[11px] sm:text-[12.5px] font-bold truncate">{activeSubscription ? formatDate(activeSubscription.end) : "—"}</p>
                </div>
                <div className="rounded-xl p-2 sm:p-3 min-w-0" style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)" }}>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1" style={{ color: "var(--p-txt-faint)" }}>Method</p>
                  <p className="text-[11px] sm:text-[12.5px] font-bold capitalize truncate">{activeSubscription?.method || "Manual"}</p>
                </div>
                <div className="rounded-xl p-2 sm:p-3 min-w-0" style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)" }}>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1" style={{ color: "var(--p-txt-faint)" }}>Status</p>
                  <p className="text-[11px] sm:text-[12.5px] font-bold truncate capitalize" style={{ color: "var(--p-primary)" }}>
                    {subscription?.status || "Active"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ⭐ UPGRADE BANNER — shows if user has a higher tier available */}
          {nextPlan && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="upgrade-banner mb-5 sm:mb-6 min-w-0"
            >
              <div className="upgrade-banner__glow" aria-hidden="true" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
                <div className="min-w-0">
                  <p className="text-[10.5px] sm:text-[11.5px] font-bold uppercase tracking-[0.18em] mb-1.5 sm:mb-2 opacity-90">
                    Recommended upgrade
                  </p>
                  <h3 className="pricing-display text-[20px] sm:text-[26px] leading-tight mb-1 sm:mb-1.5">
                    Unlock {nextPlan === "pro" ? "Pro Seller" : "Seller"} features
                  </h3>
                  <p className="text-[12.5px] sm:text-[13.5px] opacity-90 leading-snug max-w-[520px]">
                    {nextPlan === "pro"
                      ? "Unlimited listings, 200 AI images, 4 featured boosts, listing analytics and priority support."
                      : "30 active listings, 30 AI images, featured boost and verified badge."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpgrade(nextPlan)}
                  className="upgrade-cta flex-shrink-0 self-start sm:self-auto"
                >
                  <FaGem className="text-[11px]" />
                  Upgrade now
                  <FaArrowRight className="text-[10px]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ Stat cards ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6 min-w-0">
            {[
              { key: "total",    label: "Total Payments", value: stats.total,    color: "var(--p-info-txt)",    bg: "var(--p-info-bg)" },
              { key: "approved", label: "Approved",       value: stats.approved, color: "var(--p-success-txt)", bg: "var(--p-success-bg)" },
              { key: "pending",  label: "Pending",        value: stats.pending,  color: "var(--p-warning-txt)", bg: "var(--p-warning-bg)" },
              { key: "rejected", label: "Rejected",       value: stats.rejected, color: "var(--p-danger-txt)",  bg: "var(--p-danger-bg)" },
            ].map((s) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="dash-stat"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <p className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-widest leading-tight" style={{ color: "var(--p-txt-faint)" }}>
                    {s.label}
                  </p>
                  <span className="dash-stat__icon" style={{ background: s.bg, color: s.color }}>
                    {s.key === "total"    ? <FaFileInvoice /> :
                     s.key === "approved" ? <FaCheckCircle /> :
                     s.key === "pending"  ? <FaClock /> :
                                            <FaTimesCircle />}
                  </span>
                </div>
                <p className="pricing-display text-[22px] sm:text-[26px] leading-none font-black tabular-nums" style={{ color: s.color }}>
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ═══ Payments card ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="dash-card min-w-0"
          >
            {/* Tabs + search */}
            <div className="px-3 sm:px-6 pt-4 sm:pt-5">
              <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4 min-w-0">
                <div className="dash-tabs">
                  {[
                    { id: "all",      label: "All",      count: stats.total },
                    { id: "pending",  label: "Pending",  count: stats.pending },
                    { id: "approved", label: "Approved", count: stats.approved },
                    { id: "rejected", label: "Rejected", count: stats.rejected },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`dash-tab ${tab === t.id ? "dash-tab--active" : ""}`}
                    >
                      {t.label}
                      <span className="dash-tab__count">{t.count}</span>
                    </button>
                  ))}
                </div>

                <div className="dash-search">
                  <FaSearch />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search invoice, plan, method…"
                  />
                </div>
              </div>
            </div>

            {/* Rows */}
            {paymentsLoading ? (
              <div className="py-16 sm:py-20 text-center">
                <FaSpinner className="text-2xl animate-spin mx-auto mb-3" style={{ color: "var(--p-primary)" }} />
                <p className="text-[12.5px]" style={{ color: "var(--p-txt-soft)" }}>Loading payments…</p>
              </div>
            ) : pageRows.length === 0 ? (
              <div className="py-16 sm:py-20 text-center px-6">
                <FaReceipt className="text-3xl mx-auto mb-3" style={{ color: "var(--p-txt-faint)" }} />
                <p className="text-[14px] font-bold mb-1">
                  {payments.length === 0 ? "No payments yet" : "No matching payments"}
                </p>
                <p className="text-[12px]" style={{ color: "var(--p-txt-soft)" }}>
                  {payments.length === 0
                    ? "Your payment history will appear here after your first checkout."
                    : "Try a different filter or search term."}
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE: stacked cards */}
                <div className="pay-cards-mobile">
                  {pageRows.map((p) => {
                    const meta = getPlanMeta(p.plan);
                    const MIcon = METHOD_ICON[String(p.method || "").toLowerCase()] || FaWallet;
                    return (
                      <div key={p.id} className="pay-row">
                        <div className="pay-row__top">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)", color: "var(--p-txt-soft)" }}
                            >
                              <FaFileInvoice className="text-[12px]" />
                            </div>
                            <div className="min-w-0">
                              <p className="mono text-[11.5px] font-bold truncate" style={{ color: "var(--p-txt)" }}>
                                {shortId(p.id)}
                              </p>
                              <p className="text-[10.5px] truncate" style={{ color: "var(--p-txt-faint)" }}>
                                {p.pack_name || "—"}
                              </p>
                            </div>
                          </div>
                          <span className={`status-pill status-pill--${p.status} flex-shrink-0`}>
                            {p.status === "approved" && <FaCheckCircle className="text-[9px]" />}
                            {p.status === "pending"  && <FaClock className="text-[9px]" />}
                            {p.status === "rejected" && <FaTimesCircle className="text-[9px]" />}
                            {p.status}
                          </span>
                        </div>

                        <div className="pay-row__grid">
                          <div className="min-w-0">
                            <p className="pay-row__label">Plan</p>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <meta.icon className="text-[10px] flex-shrink-0" style={{ color: meta.color }} />
                              <p className="pay-row__value truncate">{meta.name}</p>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="pay-row__label">Amount</p>
                            <p className="pay-row__value" style={{ color: "var(--p-primary)" }}>
                              {formatRs(p.final_amount_pkr)}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="pay-row__label">Method</p>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MIcon className="text-[10px] flex-shrink-0" style={{ color: "var(--p-txt-soft)" }} />
                              <p className="pay-row__value capitalize truncate">{p.method || "—"}</p>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="pay-row__label">Date</p>
                            <p className="pay-row__value">{formatDateTime(p.reviewed_at || p.updated_at || p.created_at)}</p>
                          </div>
                          {p.activation_code && (
                            <div className="col-span-2 min-w-0">
                              <p className="pay-row__label">Activation</p>
                              <p className="mono text-[11.5px] font-bold px-2 py-1 rounded-md inline-block max-w-full truncate"
                                style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)", color: "var(--p-txt)" }}>
                                {p.activation_code}
                              </p>
                            </div>
                          )}
                        </div>

                        {p.receipt_url && (
                          <div className="pay-row__actions">
                            <button className="icon-btn" onClick={() => setLightbox(p.receipt_url)} title="View receipt">
                              <FaEye />
                            </button>
                            <a className="icon-btn" href={p.receipt_url} download title="Download receipt">
                              <FaDownload />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP: table */}
                <div className="pay-table-desktop">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th style={{ width: 140 }}>Requested ID</th>
                        <th>Plan</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Activation</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style={{ width: 90, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((p) => {
                        const meta = getPlanMeta(p.plan);
                        const MIcon = METHOD_ICON[String(p.method || "").toLowerCase()] || FaWallet;
                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)", color: "var(--p-txt-soft)" }}
                                >
                                  <FaFileInvoice className="text-[12px]" />
                                </div>
                                <span className="mono text-[11.5px] font-bold" style={{ color: "var(--p-txt)" }}>
                                  {shortId(p.id)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <meta.icon className="text-[11px]" style={{ color: meta.color }} />
                                <div className="min-w-0">
                                  <p className="text-[12.5px] font-bold truncate" style={{ color: "var(--p-txt)" }}>
                                    {meta.name}
                                  </p>
                                  <p className="text-[10.5px] truncate" style={{ color: "var(--p-txt-faint)" }}>
                                    {p.pack_name || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold capitalize">
                                <MIcon className="text-[11px]" style={{ color: "var(--p-txt-soft)" }} />
                                {p.method || "—"}
                              </span>
                            </td>
                            <td>
                              <span className="pricing-display text-[13.5px] font-black tabular-nums" style={{ color: "var(--p-primary)" }}>
                                {formatRs(p.final_amount_pkr)}
                              </span>
                            </td>
                            <td>
                              {p.activation_code ? (
                                <span className="mono text-[11px] font-bold px-2 py-1 rounded-md"
                                  style={{ background: "var(--p-card-bg)", border: "1px solid var(--p-line)", color: "var(--p-txt)" }}>
                                  {p.activation_code}
                                </span>
                              ) : (
                                <span className="text-[11.5px]" style={{ color: "var(--p-txt-faint)" }}>—</span>
                              )}
                            </td>
                            <td>
                              <span className={`status-pill status-pill--${p.status}`}>
                                {p.status === "approved" && <FaCheckCircle className="text-[9px]" />}
                                {p.status === "pending"  && <FaClock className="text-[9px]" />}
                                {p.status === "rejected" && <FaTimesCircle className="text-[9px]" />}
                                {p.status}
                              </span>
                            </td>
                            <td>
                              <span className="text-[11.5px] font-semibold" style={{ color: "var(--p-txt-soft)" }}>
                                {formatDateTime(p.reviewed_at || p.updated_at || p.created_at)}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div className="inline-flex items-center gap-1.5">
                                {p.receipt_url && (
                                  <button className="icon-btn" onClick={() => setLightbox(p.receipt_url)} title="View receipt">
                                    <FaEye />
                                  </button>
                                )}
                                {p.receipt_url && (
                                  <a className="icon-btn" href={p.receipt_url} download title="Download receipt">
                                    <FaDownload />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4" style={{ borderTop: "1px solid var(--p-line)" }}>
                <p className="text-[11px] sm:text-[11.5px] font-semibold text-center sm:text-left" style={{ color: "var(--p-txt-soft)" }}>
                  <strong style={{ color: "var(--p-txt)" }}>{(safePage - 1) * pageSize + 1}</strong>–
                  <strong style={{ color: "var(--p-txt)" }}>{Math.min(safePage * pageSize, filtered.length)}</strong> of{" "}
                  <strong style={{ color: "var(--p-txt)" }}>{filtered.length}</strong>
                </p>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Previous page"
                  >
                    <FaChevronLeft className="text-[10px]" />
                  </button>

                  {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        className={`page-btn ${p === safePage ? "page-btn--active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span style={{ color: "var(--p-txt-faint)" }}>…</span>}

                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    aria-label="Next page"
                  >
                    <FaChevronRight className="text-[10px]" />
                  </button>

                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="ml-1 px-2 py-2 rounded-lg text-[11.5px] font-semibold outline-none"
                    style={{
                      background: "var(--p-card-inner)",
                      border: "1px solid var(--p-line)",
                      color: "var(--p-txt)",
                    }}
                    aria-label="Page size"
                  >
                    <option value={10}>10/page</option>
                    <option value={25}>25/page</option>
                    <option value={50}>50/page</option>
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Receipt lightbox */}
        <AnimatePresence>
          {lightbox && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setLightbox(null)}
                className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-2 sm:inset-4 z-[10000] flex items-center justify-center pointer-events-none"
              >
                <img
                  src={lightbox}
                  alt="Receipt"
                  className="max-w-full max-h-full object-contain rounded-2xl pointer-events-auto"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-auto">
                  <a href={lightbox} download className="icon-btn !text-white" style={{ background: "rgba(255,255,255,0.15)" }} title="Download">
                    <FaDownload />
                  </a>
                  <button onClick={() => setLightbox(null)} className="icon-btn !text-white" style={{ background: "rgba(255,255,255,0.15)" }} title="Close">
                    <FaTimes />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW: PRICING (non-premium user)
     ═══════════════════════════════════════════════════════════ */
  return renderPricing();
};

export default Premium;