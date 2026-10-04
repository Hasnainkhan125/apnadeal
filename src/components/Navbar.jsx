import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FaSearch, FaUser, FaTimes, FaMoon, FaSun, FaSignOutAlt, FaCrown,
  FaCommentDots, FaNewspaper, FaChevronDown, FaCog, FaSignInAlt, FaChevronRight,
  FaUserPlus, FaHome, FaWallet, FaStar, FaFire, FaBolt, FaSpinner,
  FaShieldAlt, FaCar, FaRegPaperPlane, FaMobileAlt, FaLaptop, FaList,
  FaChartBar, FaPlus, FaArrowRight, FaShoppingCart, FaTrash, FaHeadset,
  FaEdit, FaImage, FaChartLine, FaMagic, FaGem, FaBars,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { readCart, writeCart } from "../lib/cartStore";
import { useTheme } from "../hooks/useTheme";
import { usePlan } from "../contexts/PlanContext";
import { FaGlobe, FaGlobeAmericas, FaLanguage, FaMoneyBillWave, FaChevronUp } from "react-icons/fa";
import { useLocale } from "../contexts/LocaleContext";

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
      --nav-primary:      #E26A2C;
      --nav-primary-2:    #F58220;
      --nav-primary-3:    #D35400;
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
      --nav-primary:      #D35400;
      --nav-primary-2:    #F58220;
      --nav-primary-3:    #E26A2C;
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
      top: 0; left: 0; right: 0;
      z-index: 50;
      transition: padding 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    .nav-advanced-inner {
      margin: 0 auto;
      max-width: 1320px;
      padding: 0 12px;
      transition: padding 0.5s cubic-bezier(0.16,1,0.3,1);
    }

    /* ⭐ MODERN CENTERED SEARCH */
    .nav-search-wrap {
      position: relative;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }

    .nav-search-form {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      height: 40px;
      border-radius: 999px;
      background: var(--nav-surface);
      border: 1px solid var(--nav-line);
      padding: 3px 3px 3px 16px;
      transition:
        border-color 0.25s ease,
        box-shadow 0.25s ease,
        background 0.25s ease;
    }
    .theme-dark .nav-search-form { background: rgba(255,255,255,0.05); }
    .theme-light .nav-search-form { background: rgba(0,0,0,0.035); }

    .nav-search-form:hover { border-color: var(--nav-line-str); }
    .nav-search-form.is-focused {
      border-color: var(--nav-primary-2);
      box-shadow:
        0 0 0 4px var(--nav-primary-soft),
        0 6px 22px -10px var(--nav-primary-glow);
      background: var(--nav-panel);
    }

    .nav-search-icon-left {
      color: var(--nav-txt-faint);
      flex-shrink: 0;
      margin-right: 8px;
      transition: color 0.2s ease;
    }
    .nav-search-form.is-focused .nav-search-icon-left {
      color: var(--nav-primary-2);
    }

    .nav-search-input {
      flex: 1;
      min-width: 0;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--nav-txt);
      padding: 0;
    }
    .nav-search-input::placeholder {
      color: var(--nav-txt-faint);
      font-weight: 500;
    }

    /* ⭐ Search submit — SUBTLE background, no strong contrast */
    .nav-search-submit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      width: 34px;
      border-radius: 999px;
      flex-shrink: 0;
      background: var(--nav-surface);
      color: var(--nav-txt-soft);
      border: 1px solid var(--nav-line);
      cursor: pointer;
      transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.15s ease;
    }
    .nav-search-submit:hover {
      background: var(--nav-surface-2);
      color: var(--nav-primary-2);
      border-color: var(--nav-primary-2);
    }
    .nav-search-submit:active { transform: scale(0.94); }

    /* keyboard hint chip */
    .nav-search-kbd {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 9.5px;
      font-weight: 700;
      color: var(--nav-txt-faint);
      border: 1px solid var(--nav-line);
      background: var(--nav-surface);
      padding: 2px 6px;
      border-radius: 6px;
      flex-shrink: 0;
      margin-right: 6px;
      line-height: 1;
      letter-spacing: 0.02em;
    }

    @media (max-width: 1023px) {
      .nav-search-kbd { display: none; }
      .nav-search-wrap { max-width: none; }
      .nav-search-form { height: 38px; padding-left: 12px; }
      .nav-search-input { font-size: 12.5px; }
      .nav-search-submit { height: 30px; width: 30px; }
    }
    @media (max-width: 640px) {
      .nav-search-form { height: 36px; padding: 2px 2px 2px 10px; }
      .nav-search-icon-left { font-size: 10px !important; margin-right: 6px; }
      .nav-search-input { font-size: 12px; }
      .nav-search-submit { height: 28px; width: 28px; }
    }

    /* ⭐ SEARCH SUGGESTIONS DROPDOWN */
    .nav-search-suggest {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      right: 0;
      background: var(--nav-panel);
      border: 1px solid var(--nav-line);
      border-radius: 18px;
      box-shadow: 0 24px 60px -20px rgba(0,0,0,0.45);
      padding: 12px;
      z-index: 90;
      overflow: hidden;
    }
    .nav-search-suggest-title {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--nav-primary-2);
      margin: 6px 6px 8px;
    }
    .nav-search-suggest-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 10px;
      cursor: pointer;
      color: var(--nav-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .nav-search-suggest-item:hover {
      background: var(--nav-surface);
      color: var(--nav-primary-2);
      transform: translateX(2px);
    }
    .nav-search-suggest-item svg {
      color: var(--nav-txt-faint);
      flex-shrink: 0;
      font-size: 11px;
    }
    .nav-search-suggest-item:hover svg { color: var(--nav-primary-2); }

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

    /* ═══ ICON BUTTONS ═══ */
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

    /* ⭐ NO-BACKGROUND icon button */
    .nav-plain-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--nav-txt);
      cursor: pointer;
      padding: 4px;
      border-radius: 999px;
      transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-plain-btn:hover svg { color: var(--nav-primary-2); }

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
    .nav-cta-pill { animation: ctaPulse 3.2s ease-in-out infinite; }

    /* ═══════════════════════════════════════════════════════════
       ⭐ FULL-WIDTH MEGA DROPDOWN — BIG image cards
       ═══════════════════════════════════════════════════════════ */
    .nav-mega-full {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      padding-top: 12px;
      z-index: 70;
      pointer-events: none;
    }
    .nav-mega-full-inner {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 12px;
      pointer-events: auto;
    }
    .nav-mega-card {
      background: var(--nav-panel);
      border: 1px solid var(--nav-line);
      border-radius: 24px;
      box-shadow: 0 30px 70px -24px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .nav-mega-topbar {
      height: 3px;
      width: 100%;
      background: linear-gradient(90deg, transparent, var(--nav-primary-2), transparent);
    }
    .nav-mega-header {
      padding: 18px 26px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--nav-line);
    }
    .nav-mega-header-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 17px;
      font-weight: 700;
      color: var(--nav-txt);
      letter-spacing: -0.01em;
    }
    .nav-mega-header-count {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--nav-primary-2);
    }

    /* ⭐ BIGGER 4-COLUMN GRID */
    .nav-mega-body {
      padding: 18px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    @media (min-width: 768px) {
      .nav-mega-body { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1100px) {
      .nav-mega-body { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }

    /* ⭐ BIGGER CARD */
    .nav-mega-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 16px;
      text-decoration: none;
      color: var(--nav-txt);
      transition:
        background 0.16s ease,
        color 0.16s ease,
        transform 0.16s ease,
        border-color 0.16s ease;
      border: 1px solid transparent;
      min-width: 0;
      min-height: 76px;
    }
    .nav-mega-item:hover {
      background: var(--nav-surface);
      color: var(--nav-primary-2);
      transform: translateY(-1px);
      border-color: var(--nav-line);
    }
    .nav-mega-item.is-active {
      background: var(--nav-primary-soft);
      color: var(--nav-primary-2);
      border-color: var(--nav-primary);
    }

    /* ⭐ BIGGER IMAGE THUMBNAIL */
    .nav-mega-thumb {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 56px;
      width: 56px;
      border-radius: 14px;
      flex-shrink: 0;
      overflow: hidden;
      background: var(--nav-surface);
      border: 1px solid var(--nav-line);
      transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-mega-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .nav-mega-item:hover .nav-mega-thumb { transform: scale(1.06); }

    /* Fallback icon shown if the image fails to load */
    .nav-mega-thumb-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 56px;
      width: 56px;
      border-radius: 14px;
      flex-shrink: 0;
      font-size: 20px;
    }

    /* Legacy icon rule (still used elsewhere) */
    .nav-mega-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      width: 34px;
      border-radius: 10px;
      flex-shrink: 0;
      font-size: 14px;
      transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-mega-item:hover .nav-mega-icon { transform: scale(1.08); }

    /* ⭐ BIGGER TEXT */
    .nav-mega-text { min-width: 0; flex: 1; }
    .nav-mega-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-mega-desc {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--nav-txt-faint);
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-mega-badge {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 9px;
      font-weight: 800;
      background: var(--nav-primary-2);
      color: #0B0B12;
      padding: 3px 7px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }

    /* ⭐ RESPONSIVE — smaller on narrow desktops */
    @media (max-width: 1279px) {
      .nav-mega-thumb { height: 48px; width: 48px; border-radius: 12px; }
      .nav-mega-thumb-fallback { height: 48px; width: 48px; border-radius: 12px; }
      .nav-mega-label { font-size: 13.5px; }
      .nav-mega-desc { font-size: 11.5px; }
      .nav-mega-item { min-height: 68px; padding: 12px 14px; }
    }

    /* ⭐ Hamburger button — plain (DESKTOP ONLY) */
    .nav-burger-plain {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--nav-txt);
      cursor: pointer;
      padding: 6px;
      border-radius: 10px;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .nav-burger-plain:hover { color: var(--nav-primary-2); }
    .nav-burger-plain.is-open { color: var(--nav-primary-2); }

    /* ⭐ MOBILE BOTTOM SHEET SCROLL */
    .nav-sheet-scroll {
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }
    .nav-sheet-scroll::-webkit-scrollbar { width: 5px; }
    .nav-sheet-scroll::-webkit-scrollbar-thumb {
      background: var(--nav-line-str);
      border-radius: 4px;
    }

    /* ⭐ RESPONSIVE — hide hamburger on mobile */
    @media (max-width: 1023px) {
      .nav-burger-wrapper { display: none !important; }
    }
  `}</style>
);

const LogoImage = ({ className = "" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  // Fallback: modern gradient monogram
  if (failed) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${className}`}
        style={{
          background: "linear-gradient(135deg, #FF6A00 0%, #E85D04 60%, #C8531B 100%)",
          borderRadius: "inherit",
        }}
      >
        {/* Soft radial glow */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 60%)",
          }}
        />
        <span
          className="relative font-ticket-display font-black text-white select-none"
          style={{
            fontSize: "42%",
            letterSpacing: "-0.04em",
            textShadow: "0 1px 2px rgba(0,0,0,0.18)",
          }}
        >
          AD
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: "var(--nav-panel)",
        border: "1px solid var(--nav-line)",
        borderRadius: "inherit",
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* Subtle top highlight for depth (light + dark both) */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <img
        src={sources[idx]}
        alt="ApnaDeal"
        className="relative h-full w-full object-contain p-[12%]"
        onError={() => {
          if (idx < sources.length - 1) setIdx(idx + 1);
          else setFailed(true);
        }}
        draggable={false}
      />
    </div>
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
  "/momento":         { fg: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
};

const getIconColor = (path) =>
  ICON_COLORS[path] || { fg: "#D35400", bg: "rgba(211,84,0,0.12)" };

const panelVariants = {
  hidden: { opacity: 0, y: -16, scale: 0.985, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } },
};
const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
};
const drawerItemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.035, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

const formatRs = (num) => `Rs ${Number(num || 0).toLocaleString("en-US")}`;

/* ═══════════════════════════════════════════════════════════════
   SEARCH SUGGESTIONS
   ═══════════════════════════════════════════════════════════════ */
const SEARCH_SUGGESTIONS = [
  { label: "Cars & Bikes",      path: "/vehicles",    icon: FaCar },
  { label: "Mobiles & Tablets", path: "/mobiles",     icon: FaMobileAlt },
  { label: "Laptops & TVs",     path: "/electronics", icon: FaLaptop },
  { label: "Homes & Property",  path: "/property",    icon: FaHome },
  { label: "Marketplace Feed",  path: "/feed",        icon: FaNewspaper },
  { label: "AI Studio",         path: "/ai-image",    icon: FaMagic },
];


/* ═══════════════════════════════════════════════════════════════
   ⭐ LOCALE SWITCHER — language + currency dropdown
   ═══════════════════════════════════════════════════════════════ */
const LocaleSwitcher = ({ isMobile = false }) => {
  const { currency, language, setCurrency, setLanguage, CURRENCIES, LANGUAGES } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const langLabel = LANGUAGES.find((l) => l.code === language)?.label || "English";

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="nav-plain-btn"
        aria-label="Language and currency"
        aria-expanded={open}
        title="Language & currency"
      >
        <FaGlobe
          className="text-[14px] sm:text-[15px]"
          style={{
            color: open ? "var(--nav-primary-2)" : "var(--nav-txt)",
            transition: "color 0.25s ease",
          }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={[
              "z-[200] nav-panel rounded-2xl overflow-hidden",
              isMobile
                ? "fixed left-3 right-3 top-[calc(env(safe-area-inset-top,0px)+4.5rem)]"
                : "absolute right-0 mt-3 w-[320px] max-w-[calc(100vw-1rem)]",
            ].join(" ")}
            role="dialog"
            aria-label="Language & currency"
          >
            {/* Top accent */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--nav-primary-2), transparent)" }}
            />

            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  background: "var(--nav-primary-soft)",
                  color: "var(--nav-primary-2)",
                }}
              >
                <FaGlobeAmericas className="text-[13px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-ticket-display text-[15px] font-bold text-[var(--nav-txt)] leading-tight">
                  Set language and currency
                </p>
                <p className="font-ticket-body text-[11px] text-[var(--nav-txt-soft)] mt-0.5 leading-snug">
                  Select your preferred language and currency. You can update the settings at any time.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ color: "var(--nav-txt-faint)" }}
                aria-label="Close"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </div>

            {/* Language */}
            <div className="px-4 pb-3">
              <label className="flex items-center gap-1.5 mb-1.5">
                <FaLanguage className="text-[11px]" style={{ color: "var(--nav-txt-faint)" }} />
                <span className="font-ticket-body text-[10.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
                  Language
                </span>
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-xl font-ticket-body text-[13px] font-medium outline-none cursor-pointer"
                  style={{
                    background: "var(--nav-surface)",
                    border: "1px solid var(--nav-line)",
                    color: "var(--nav-txt)",
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                  style={{ color: "var(--nav-txt-faint)" }}
                />
              </div>
            </div>

            {/* Currency */}
            <div className="px-4 pb-3">
              <label className="flex items-center gap-1.5 mb-1.5">
                <FaMoneyBillWave className="text-[11px]" style={{ color: "var(--nav-txt-faint)" }} />
                <span className="font-ticket-body text-[10.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
                  Currency
                </span>
              </label>
              <div className="relative">
                <select
                  value={currency.code}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-xl font-ticket-body text-[13px] font-medium outline-none cursor-pointer"
                  style={{
                    background: "var(--nav-surface)",
                    border: "1px solid var(--nav-line)",
                    color: "var(--nav-txt)",
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                  style={{ color: "var(--nav-txt-faint)" }}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 pt-1">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-[12.5px] font-extrabold tracking-wide transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--nav-primary-2), var(--nav-primary-3))",
                  color: "#FFFFFF",
                  boxShadow: "0 10px 24px -8px var(--nav-primary-glow)",
                }}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
   PLAN BADGE
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
   PROFILE DROPDOWN  — includes THEME TOGGLE + REAL RATING
   ═══════════════════════════════════════════════════════════════ */
const ProfileDropdown = ({
  user, onClose, onLogout, navigate,
  planId = "free", planName = "Starter", isVerified,
  theme, onToggleTheme,
  rating = 0,          // ⭐ real rating
  ratingCount = 0,     // ⭐ real review count
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

  /* ⭐ Star row helpers */
  const rounded = Math.round(rating);
  const hasRating = ratingCount > 0 && rating > 0;

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

      {/* ⭐ Stats row — now with REAL rating */}
      <div className="mx-5 mt-4 mb-3 flex items-center rounded-2xl overflow-hidden" style={{ border: "1px solid var(--nav-line)", background: "var(--nav-surface)" }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3" style={{ borderRight: "1px solid var(--nav-line)" }}>
          <div className="flex items-center gap-1.5">
            <FaStar className="text-[var(--nav-primary-2)] text-[11px]" />
            <span className="font-ticket-body text-[13px] font-bold text-[var(--nav-txt)] tabular-nums">
              {hasRating ? rating.toFixed(1) : "—"}
            </span>
          </div>
          <span className="font-ticket-body text-[8.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
            {hasRating ? `${ratingCount} review${ratingCount === 1 ? "" : "s"}` : "No reviews"}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3">
          <div className="flex items-center gap-1.5">
            <FaCrown className="text-[var(--nav-primary-2)] text-[11px]" />
            <span className="font-ticket-body text-[13px] font-bold text-[var(--nav-txt)]">
              {planId === "pro" ? "PRO" : planId === "seller" ? "SELLER" : "FREE"}
            </span>
          </div>
          <span className="font-ticket-body text-[8.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
            Current plan
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

        {/* ⭐ THEME TOGGLE */}
        <div className="mt-1 pt-1" style={{ borderTop: "1px solid var(--nav-line)" }}>
          <button
            onClick={() => { if (onToggleTheme) onToggleTheme(); }}
            className="group flex w-full items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--nav-surface)]"
          >
            <span className="text-[15px] flex-shrink-0 transition-colors"
              style={{ color: theme === "light" ? "var(--nav-primary-2)" : "var(--nav-txt-soft)" }}>
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </span>
            <span className="font-ticket-body text-[13px] font-medium text-[var(--nav-txt)] transition-colors group-hover:text-[var(--nav-primary-2)] flex-1 text-left">
              {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </span>
            <span
              className="inline-flex items-center justify-center flex-shrink-0"
              style={{
                width: 34,
                height: 18,
                borderRadius: 999,
                background: theme === "light" ? "var(--nav-line-str)" : "var(--nav-primary-2)",
                transition: "background 0.25s ease",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: theme === "light" ? 2 : 18,
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "#FFFFFF",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  transition: "left 0.25s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </span>
          </button>
        </div>
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
   SECTION HEADER — mobile sheet
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

  const planCtx = usePlan();
  const planId = planCtx?.planId || "free";
  const planName = planCtx?.plan?.name || "Starter";
  const isPremium = planId !== "free";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [cart, setCart] = useState(() => readCart(user?.id));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);

  // ⭐ Left menu hover dropdown
  const [isMenuDropOpen, setIsMenuDropOpen] = useState(false);
  const menuDropRef = useRef(null);
  const menuDropTimer = useRef(null);

  const [userAvatar, setUserAvatar] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  /* ⭐ NEW — real user rating from listings */
  const [userRating, setUserRating] = useState(0);
  const [userRatingCount, setUserRatingCount] = useState(0);

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

  /* ⭐ MEGA MENU LINKS — with web image URLs */
  const menuSimpleLinks = [
    { path: "/vehicles",         img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=60", label: "Vehicles",    desc: "Cars, bikes, trucks" },
    { path: "/mobiles",          img: "https://images.unsplash.com/photo-1758186477159-99418b83a42f?w=800&auto=format&fit=crop&q=60", label: "Mobiles",     desc: "Phones & tablets" },
    { path: "/electronics",      img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=60", label: "Electronics", desc: "Laptops, TVs, audio" },
    { path: "/property",         img: "https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?w=800&auto=format&fit=crop&q=60", label: "Property",    desc: "Homes, plots, commercial" },
    { path: "/feed",             img: "https://plus.unsplash.com/premium_photo-1681488262364-8aeb1b6aac56?w=800&auto=format&fit=crop&q=60", label: "Marketplace", desc: "All live listings", badge: "New" },
    { path: "/marketplace-chat", img: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&auto=format&fit=crop&q=60", label: "Messenger",    desc: "Buyer & seller chat" },
    { path: "/momento",          img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop", label: "Momento",     desc: "Stories & reels", badge: "New" },
    { path: "/ai-image",         img: "https://images.unsplash.com/photo-1770170389700-eb0f9b910ed8?w=800&auto=format&fit=crop&q=60", label: "AI Studio",   desc: "Generate & edit images", badge: "Pro" },
    { path: "/post-ad",          img: "https://images.unsplash.com/photo-1663124178703-d2d6a333e6c2?w=800&auto=format&fit=crop&q=60", label: "Post an Ad",  desc: "List a new item" },
    { path: "/my-listings",      img: "/mylisting.png", label: "My Listings", desc: "Manage your ads" },
    { path: "/wallet",           img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop", label: "Live Sales",  desc: "Sales & wallet" },
    { path: "/premium",          img: "https://plus.unsplash.com/premium_photo-1682309553075-c84ea8d9d49a?w=800&auto=format&fit=crop&q=60", label: "Premium",     desc: "Upgrade & manage plan" },
  ];

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

  const openMenuDrop = () => {
    if (menuDropTimer.current) clearTimeout(menuDropTimer.current);
    setIsMenuDropOpen(true);
  };
  const closeMenuDrop = () => {
    if (menuDropTimer.current) clearTimeout(menuDropTimer.current);
    menuDropTimer.current = setTimeout(() => setIsMenuDropOpen(false), 220);
  };
  const handleMenuLinkClick = () => {
    if (menuDropTimer.current) clearTimeout(menuDropTimer.current);
    setIsMenuDropOpen(false);
  };

  /* ═══════════════════════════════════════════════════════════════
     ⭐ LOAD USER DATA + REAL RATING
     ═══════════════════════════════════════════════════════════════ */
  const loadUserData = async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      /* --- 1. user_settings --- */
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

      /* --- 2. user_stats --- */
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

     /* --- 3. ⭐ REAL RATING from seller_ratings (keyed by seller_id) --- */
try {
  const { data: ratings, error: rErr } = await supabase
    .from("seller_ratings")
    .select("rating")
    .eq("seller_id", user.id);

  if (rErr) throw rErr;

  const valid = (ratings || []).filter(
    (r) => typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5
  );

  if (valid.length > 0) {
    const sum = valid.reduce((s, r) => s + r.rating, 0);
    const avg = sum / valid.length;
    setUserRating(Number(avg.toFixed(1)));
    setUserRatingCount(valid.length);
  } else {
    setUserRating(0);
    setUserRatingCount(0);
  }
} catch (ratingErr) {
  console.warn("Rating load failed, falling back:", ratingErr);
  if (statsData) {
    setUserRating(Number(statsData.avg_rating || 0));
    setUserRatingCount(Number(statsData.rating_count || 0));
  } else {
    setUserRating(0);
    setUserRatingCount(0);
  }
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
        setIsVisible(false); setIsMenuDropOpen(false); setIsCartOpen(false);
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
      if (menuDropRef.current && !menuDropRef.current.contains(event.target)) setIsMenuDropOpen(false);
      if (cartRef.current && !cartRef.current.contains(event.target)) setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false); setIsProfileOpen(false);
    setIsNotificationOpen(false); setIsMenuDropOpen(false); setIsCartOpen(false);
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
    if (e?.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      setIsMenuOpen(false);
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
            <Link to="/feed" className="group flex items-center flex-shrink-0">
              <div className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center overflow-hidden">
                <div
                  className="logo-inner"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <LogoImage />
                </div>
              </div>
              <div className="ml-2 sm:ml-2.5 leading-none flex flex-col justify-center">
                <span
                  className="font-ticket-display text-[15px] sm:text-[18px] font-bold tracking-[-0.03em]"
                  style={{
                    color: "var(--nav-txt)",
                    lineHeight: 1,
                    background:
                      "linear-gradient(135deg, var(--nav-txt) 0%, var(--nav-txt) 60%, var(--nav-primary-2) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ApexDeal
                </span>
                <span
                  className="font-ticket-body text-[8px] sm:text-[9px] font-bold tracking-[0.28em] mt-[2px]"
                  style={{ color: "var(--nav-primary-2)", lineHeight: 1 }}
                >
                  STORE
                </span>
              </div>
              <style>{`
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
            <div className="flex items-center justify-between h-[52px] sm:h-[56px] gap-2 sm:gap-3">

              {/* ═══ LEFT: MENU + LOGO ═══ */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div
                  className="relative nav-burger-wrapper"
                  ref={menuDropRef}
                  onMouseEnter={openMenuDrop}
                  onMouseLeave={closeMenuDrop}
                >
                  <button
                    type="button"
                    onClick={() => setIsMenuDropOpen((v) => !v)}
                    className={`nav-burger-plain ${isMenuDropOpen ? "is-open" : ""}`}
                    aria-label="Menu"
                  >
                    <FaBars style={{ fontSize: 16 }} />
                  </button>
                </div>

                <Link to="/feed" className="group flex items-center flex-shrink-0">
                  <div className="h-10 w-10 sm:h-10 sm:w-10 flex items-center justify-center overflow-hidden">
                    <div
                      className="logo-inner"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    >
                      <LogoImage />
                    </div>
                  </div>
                </Link>
              </div>

              {/* ═══ CENTER — SEARCH ═══ */}
              <div className="flex-1 flex justify-center items-center min-w-0 px-1 sm:px-3 lg:px-6">
                <div className="nav-search-wrap" ref={searchRef}>
                  <form
                    onSubmit={handleSearch}
                    className={`nav-search-form ${isSearchFocused ? "is-focused" : ""}`}
                  >
                    <FaSearch className="nav-search-icon-left" style={{ fontSize: 12 }} />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      placeholder="Search items.."
                      className="nav-search-input"
                      aria-label="Search"
                    />

                    <span className="nav-search-kbd">⌘ K</span>

                    <button type="submit" className="nav-search-submit" aria-label="Search">
                      <FaSearch style={{ fontSize: 12 }} />
                    </button>
                  </form>

                  <AnimatePresence>
                    {isSearchFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="nav-search-suggest"
                      >
                        <p className="nav-search-suggest-title">
                          {searchQuery.trim() ? "Search for" : "Popular categories"}
                        </p>

                        {SEARCH_SUGGESTIONS.filter((s) =>
                          searchQuery.trim()
                            ? s.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
                            : true
                        ).slice(0, 6).map((s) => {
                          const Icon = s.icon;
                          return (
                            <div
                              key={s.label}
                              className="nav-search-suggest-item"
                              onClick={() => {
                                setIsSearchFocused(false);
                                setSearchQuery("");
                                navigate(s.path);
                              }}
                            >
                              <Icon />
                              <span>{s.label}</span>
                              <FaChevronRight style={{ marginLeft: "auto", fontSize: 9 }} />
                            </div>
                          );
                        })}

                        {searchQuery.trim() && (
                          <div
                            className="nav-search-suggest-item"
                            style={{ marginTop: 4, borderTop: "1px solid var(--nav-line)", borderRadius: 0 }}
                            onClick={(e) => handleSearch(e)}
                          >
                            <FaSearch style={{ fontSize: 10 }} />
                            <span>Search for "<b>{searchQuery}</b>"</span>
                            <FaArrowRight style={{ marginLeft: "auto", fontSize: 10 }} />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ═══ RIGHT SIDE — cart + profile ═══ */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <LocaleSwitcher />
                {user && (
                  <div ref={cartRef} className="relative">
                    <motion.button
                      onClick={() => setIsCartOpen((v) => !v)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="nav-plain-btn"
                      aria-label="Cart"
                      aria-expanded={isCartOpen}
                    >
                      <motion.span
                        animate={
                          cartCount > 0
                            ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.06, 1] }
                            : { rotate: 0, scale: 1 }
                        }
                        transition={
                          cartCount > 0
                            ? {
                                duration: 1.8,
                                repeat: Infinity,
                                repeatDelay: 3.2,
                                ease: [0.42, 0, 0.58, 1],
                                times: [0, 0.15, 0.4, 0.65, 1],
                              }
                            : { duration: 0.2, ease: "easeOut" }
                        }
                        className="relative z-10 flex items-center justify-center"
                        style={{
                          color: cartCount > 0 ? "var(--nav-primary-2)" : "var(--nav-txt)",
                          transition: "color 0.35s ease",
                          filter:
                            cartCount > 0
                              ? "drop-shadow(0 0 6px var(--nav-primary-glow))"
                              : "none",
                        }}
                      >
                        <FaShoppingCart
                          className="text-[13px] sm:text-[15px]"
                          style={{ transition: "color 0.35s ease, filter 0.35s ease" }}
                        />
                      </motion.span>

                      {cartCount > 0 && (
                        <motion.span
                          key={cartCount}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 520, damping: 18 }}
                          className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] px-1 rounded-full font-ticket-body text-[7.5px] sm:text-[8px] font-bold text-[#0B0B12] flex items-center justify-center z-20"
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

                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="lg:hidden flex items-center gap-0.5 p-0.5 rounded-full"
                      aria-label="Open menu"
                    >
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ border: "1px solid var(--nav-primary-2)" }}
                      >
                        {userAvatar ? (
                          <img src={userAvatar} alt={getUserName()} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center" style={{ background: "var(--nav-primary-2)" }}>
                            <span className="text-[#0B0B12] font-ticket-body font-bold text-[11px]">{getUserInitial()}</span>
                          </div>
                        )}
                      </div>
                      <FaChevronDown className={`text-[var(--nav-txt)] text-[8px] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="hidden lg:flex items-center gap-1.5 p-0.5 rounded-full"
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
                          theme={theme}
                          onToggleTheme={toggleTheme}
                          rating={userRating}                 /* ⭐ */
                          ratingCount={userRatingCount}       /* ⭐ */
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}>
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

                    <motion.div whileHover={{ y: -1, scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
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

        {/* ⭐ FULL-WIDTH MEGA DROPDOWN */}
        <AnimatePresence>
          {isMenuDropOpen && (
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onMouseEnter={openMenuDrop}
              onMouseLeave={closeMenuDrop}
              className="nav-mega-full hidden lg:block"
            >
              <div className="nav-mega-full-inner">
                <div className="nav-mega-card">
                  <div className="nav-mega-topbar" />
                  <div className="nav-mega-header">
                    <span className="nav-mega-header-title">Browse all categories</span>
                    <span className="nav-mega-header-count">
                      {menuSimpleLinks.length} links
                    </span>
                  </div>

                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="nav-mega-body"
                  >
                    {menuSimpleLinks.map((item) => {
                      const active = isActive(item.path);
                      const colors = getIconColor(item.path);

                      return (
                        <motion.div key={item.label} variants={itemVariants}>
                          <Link
                            to={item.path}
                            onClick={handleMenuLinkClick}
                            className={`nav-mega-item ${active ? "is-active" : ""}`}
                          >
                            <span className="nav-mega-thumb">
                              <img
                                src={item.img}
                                alt={item.label}
                                loading="lazy"
                                onError={(e) => {
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.outerHTML = `
                                      <span class="nav-mega-thumb-fallback"
                                        style="background:${colors.bg};color:${colors.fg}">
                                      </span>
                                    `;
                                  }
                                }}
                              />
                            </span>

                            <span className="nav-mega-text">
                              <span className="nav-mega-label">
                                {item.label}
                                {item.badge && <span className="nav-mega-badge">{item.badge}</span>}
                              </span>
                              {item.desc && <span className="nav-mega-desc">{item.desc}</span>}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          ⭐ MOBILE BOTTOM SHEET
         ═══════════════════════════════════════════════════════════════ */}
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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120) setIsMenuOpen(false);
              }}
              className="absolute left-0 right-0 bottom-0 flex flex-col overflow-hidden"
              style={{
                maxHeight: "92vh",
                background: "var(--nav-bg)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTop: "1px solid var(--nav-line)",
                boxShadow: "0 -24px 60px -20px rgba(0,0,0,0.55)",
              }}
            >
              <div
                aria-hidden
                className="h-[2px] w-full flex-shrink-0"
                style={{ background: "linear-gradient(90deg, transparent, var(--nav-primary-2), transparent)" }}
              />

              <div className="pt-2.5 pb-1 flex justify-center flex-shrink-0">
                <div
                  aria-hidden
                  style={{
                    width: 44,
                    height: 4,
                    borderRadius: 999,
                    background: "var(--nav-line-str)",
                    opacity: 0.7,
                  }}
                />
              </div>

              <div
                className="relative flex items-center justify-between px-4 pb-3 flex-shrink-0 z-20"
                style={{ borderBottom: "1px solid var(--nav-line)" }}
              >
                <span
                  className="font-ticket-display text-[16px] font-bold"
                  style={{ color: "var(--nav-txt)", letterSpacing: "-0.015em" }}
                >
                  Menu
                </span>

                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--nav-surface)", border: "1px solid var(--nav-line)" }}
                  aria-label="Close menu"
                >
                  <FaTimes style={{ fontSize: 13, color: "var(--nav-txt)" }} />
                </motion.button>
              </div>

              <div
                className="nav-sheet-scroll flex-1 overflow-y-auto px-4 py-4"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              >
                {/* ⭐ USER CARD with REAL RATING */}
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

                    {/* ⭐ 4-cell stat row: Rating · Level · XP · Plan */}
                    <div
                      className="relative mt-3 grid grid-cols-4 rounded-xl overflow-hidden"
                      style={{ border: "1px solid var(--nav-line)", background: "var(--nav-surface)" }}
                    >
                      <div className="flex flex-col items-center justify-center gap-0.5 py-2.5" style={{ borderRight: "1px solid var(--nav-line)" }}>
                        <FaStar className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
                        <span className="font-ticket-body text-[11px] font-bold text-[var(--nav-txt)] tabular-nums">
                          {userRatingCount > 0 ? userRating.toFixed(1) : "—"}
                        </span>
                        <span className="font-ticket-body text-[7.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
                          Rating
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-0.5 py-2.5" style={{ borderRight: "1px solid var(--nav-line)" }}>
                        <FaBolt className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
                        <span className="font-ticket-body text-[11px] font-bold text-[var(--nav-txt)]">
                          {userLevel}
                        </span>
                        <span className="font-ticket-body text-[7.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
                          Level
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-0.5 py-2.5" style={{ borderRight: "1px solid var(--nav-line)" }}>
                        <FaFire className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
                        <span className="font-ticket-body text-[11px] font-bold text-[var(--nav-txt)]">
                          {userXp}
                        </span>
                        <span className="font-ticket-body text-[7.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
                          XP
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-0.5 py-2.5">
                        <FaCrown className="text-[10px]" style={{ color: "var(--nav-primary-2)" }} />
                        <span className="font-ticket-body text-[10px] font-bold text-[var(--nav-txt)]">
                          {planId === "pro" ? "PRO" : planId === "seller" ? "SELL" : "FREE"}
                        </span>
                        <span className="font-ticket-body text-[7.5px] font-bold uppercase tracking-widest text-[var(--nav-txt-faint)]">
                          Plan
                        </span>
                      </div>
                    </div>

                    {/* ⭐ Star breakdown row */}
                    {userRatingCount > 0 && (
                      <div className="relative mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <FaStar
                              key={i}
                              className="text-[11px]"
                              style={{
                                color: i <= Math.round(userRating)
                                  ? "var(--nav-primary-2)"
                                  : "var(--nav-line-str)",
                              }}
                            />
                          ))}
                        </div>
                        <span className="font-ticket-body text-[11.5px] font-bold text-[var(--nav-txt)] tabular-nums">
                          {userRating.toFixed(1)}
                        </span>
                        <span className="font-ticket-body text-[11px] text-[var(--nav-txt-faint)]">
                          ({userRatingCount})
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ⭐ THEME TOGGLE */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                  className="mb-5"
                >
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 px-3 py-3 rounded-2xl transition-colors"
                    style={{ background: "var(--nav-panel-2)", border: "1px solid var(--nav-line)" }}
                  >
                    <span
                      className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0"
                      style={{ background: "var(--nav-primary-soft)", color: "var(--nav-primary-2)" }}
                    >
                      {theme === "light" ? <FaMoon className="text-[13px]" /> : <FaSun className="text-[13px]" />}
                    </span>
                    <span className="flex-1 text-left font-ticket-body text-[13px] font-semibold text-[var(--nav-txt)]">
                      {theme === "light" ? "Switch to Dark" : "Switch to Light"}
                    </span>
                    <span
                      className="inline-flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 999,
                        background: theme === "light" ? "var(--nav-line-str)" : "var(--nav-primary-2)",
                        transition: "background 0.25s ease",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: theme === "light" ? 2 : 20,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          background: "#FFFFFF",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                          transition: "left 0.25s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                    </span>
                  </button>
                </motion.div>

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
                      ApexDeal v2.0
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