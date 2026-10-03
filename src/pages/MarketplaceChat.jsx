// src/pages/MarketplaceChat.jsx
// — Alibaba-style marketplace inbox + single-thread view
//   • Desktop: two-panel layout (chat thread LEFT, conversations RIGHT)
//   • Mobile:  single panel (inbox OR thread) with sticky headers
//   • 🌙 Dark mode driven by EXTERNAL theme (no toggle inside this file)
//        Reads class on <html> / <body> OR prefers-color-scheme
//   • Inline composer with emoji / image / voice / text tools
//   • Product card sits ABOVE composer ("Questions about your selections?")
//   • Safety notice banner inside thread
//   • Buying / Selling tabs, search, unread badges
//   • Realtime, read receipts, deep links, clear chat
import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperPlane, FaImage, FaTimes, FaCheck, FaCheckDouble,
  FaSpinner, FaChevronLeft, FaUserCircle, FaTag,
  FaTrash, FaSearch, FaShoppingBag, FaStore,
  FaMicrophone, FaSmile, FaPlay, FaPause,
  FaEllipsisH, FaExpand, FaRegSmile, FaRegImage,
  FaRegFileAlt, FaPhoneAlt, FaRegCreditCard, FaRegFile,
  FaLanguage, FaShieldAlt, FaRegComments, FaChevronRight,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
/* ═══════════════════════════════════════════════════════════════
   THEME DETECTOR — reads from ANY source your app might use
   • Prop override (highest priority)
   • localStorage (common keys)
   • cookie
   • <html> / <body> class, data-theme, data-mode, data-bs-theme
   • OS prefers-color-scheme (fallback)
   ═══════════════════════════════════════════════════════════════ */
const THEME_KEYS = [
  "theme", "app-theme", "color-theme", "darkMode", "dark-mode",
  "mode", "theme-mode", "mc-theme", "apna-theme", "apnaDealTheme",
];

const readThemeFromStorage = () => {
  try {
    if (typeof window === "undefined") return null;
    for (const k of THEME_KEYS) {
      const v = localStorage.getItem(k);
      if (v) {
        const s = String(v).toLowerCase();
        if (s.includes("dark")) return "dark";
        if (s.includes("light")) return "light";
      }
      const c = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${k}=`));
      if (c) {
        const val = decodeURIComponent(c.split("=")[1]).toLowerCase();
        if (val.includes("dark")) return "dark";
        if (val.includes("light")) return "light";
      }
    }
  } catch {}
  return null;
};

const detectDark = () => {
  if (typeof window === "undefined") return false;
  const html = document.documentElement;
  const body = document.body;

  /* Check every possible dark-mode signal */
  const checkEl = (el) => {
    if (!el) return null;
    if (el.classList.contains("dark")) return "dark";
    if (el.classList.contains("light")) return "light";
    if (el.classList.contains("theme-dark")) return "dark";
    if (el.classList.contains("theme-light")) return "light";
    const attrs = [
      "data-theme", "data-mode", "data-color-scheme",
      "data-bs-theme", "data-mui-color-scheme",
    ];
    for (const a of attrs) {
      const v = el.getAttribute(a);
      if (!v) continue;
      if (v.toLowerCase().includes("dark")) return "dark";
      if (v.toLowerCase().includes("light")) return "light";
    }
    return null;
  };

  const fromHtml = checkEl(html);
  if (fromHtml) return fromHtml === "dark";
  const fromBody = checkEl(body);
  if (fromBody) return fromBody === "dark";

  /* Storage / cookie */
  const stored = readThemeFromStorage();
  if (stored) return stored === "dark";

  /* OS preference */
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
};

const useExternalTheme = (forcedTheme) => {
  const [isDark, setIsDark] = useState(() => {
    if (forcedTheme === "dark") return true;
    if (forcedTheme === "light") return false;
    return detectDark();
  });

  useEffect(() => {
    /* If parent passes explicit theme, trust it */
    if (forcedTheme === "dark") { setIsDark(true); return; }
    if (forcedTheme === "light") { setIsDark(false); return; }

    const update = () => setIsDark(detectDark());
    update();

    /* Watch DOM changes on <html> and <body> */
    const observer = new MutationObserver(update);
    const cfg = {
      attributes: true,
      attributeFilter: [
        "class",
        "data-theme", "data-mode", "data-color-scheme",
        "data-bs-theme", "data-mui-color-scheme",
      ],
    };
    observer.observe(document.documentElement, cfg);
    if (document.body) observer.observe(document.body, cfg);

    /* Watch localStorage changes from other tabs */
    const onStorage = () => update();
    window.addEventListener("storage", onStorage);

    /* Watch OS preference */
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", update);

    /* Poll every 400ms as a last resort (fixes custom event-based themes) */
    const poll = setInterval(update, 400);

    /* Custom event hook — dispatch "themechange" from anywhere */
    const onCustom = () => update();
    window.addEventListener("themechange", onCustom);
    window.addEventListener("theme-changed", onCustom);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
      mq?.removeEventListener?.("change", update);
      clearInterval(poll);
      window.removeEventListener("themechange", onCustom);
      window.removeEventListener("theme-changed", onCustom);
    };
  }, [forcedTheme]);

  return isDark;
};
/* ═══════════════════════════════════════════════════════════════
   STYLES — Alibaba-like, DARK + LIGHT themes, fully responsive
   ═══════════════════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

    .mc-body {
      font-family: 'Inter', 'Manrope', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* ══ THEME TOKENS ══ */
    .mc-root {
      /* LIGHT (default) */
      --mc-bg: #FFFFFF;
      --mc-bg-2: #F9FAFB;
      --mc-bg-3: #F3F4F6;
      --mc-surface: #FFFFFF;
      --mc-surface-2: #F9FAFB;
      --mc-line: #F3F4F6;
      --mc-line-str: #E5E7EB;
      --mc-txt: #111827;
      --mc-txt-soft: #6B7280;
      --mc-txt-faint: #9CA3AF;
      --mc-inverse: #111827;
      --mc-inverse-txt: #FFFFFF;
      --mc-accent: #2563EB;
      --mc-success: #16A34A;
      --mc-success-soft: #DCFCE7;
      --mc-warn-soft: #FEF3C7;
      --mc-warn-txt: #92400E;
      --mc-danger: #DC2626;
      --mc-danger-soft: #FEE2E2;
      --mc-badge: #EF4444;
      --mc-shadow-sm: 0 1px 2px rgba(0,0,0,0.03);
      --mc-shadow-md: 0 12px 32px -8px rgba(0,0,0,0.15);
      --mc-btn-send: #4B5563;
      --mc-btn-send-hover: #1F2937;
      --mc-btn-send-disabled: #D1D5DB;
      --mc-avatar-bg: #E5E7EB;
      --mc-avatar-txt: #6B7280;
      --mc-scroll: #E5E7EB;
      --mc-scroll-hover: #D1D5DB;
      --mc-bubble-them-bg: #F3F4F6;
      --mc-bubble-them-txt: #111827;
      --mc-bubble-me-bg: #111827;
      --mc-bubble-me-txt: #FFFFFF;
      --mc-rec-bar-bg: #FEE2E2;
      --mc-rec-dot: #EF4444;
      --mc-rec-time: #DC2626;
      --mc-audio-btn-them-bg: #E5E7EB;
      --mc-audio-btn-them-txt: #111827;
      --mc-audio-btn-me-bg: rgba(255,255,255,0.22);
      --mc-audio-btn-me-txt: #FFFFFF;
      --mc-track-them: #D1D5DB;
      --mc-track-me: rgba(255,255,255,0.28);
      color-scheme: light;
    }
    .mc-root.mc-dark {
      --mc-bg: #0B0B0F;
      --mc-bg-2: #111118;
      --mc-bg-3: #181820;
      --mc-surface: #111118;
      --mc-surface-2: #181820;
      --mc-line: #1F1F29;
      --mc-line-str: #2A2A36;
      --mc-txt: #F4F4F5;
      --mc-txt-soft: #A1A1AA;
      --mc-txt-faint: #71717A;
      --mc-inverse: #F4F4F5;
      --mc-inverse-txt: #0B0B0F;
      --mc-accent: #60A5FA;
      --mc-success: #34D399;
      --mc-success-soft: rgba(52,211,153,0.15);
      --mc-warn-soft: rgba(245,158,11,0.14);
      --mc-warn-txt: #FBBF24;
      --mc-danger: #F87171;
      --mc-danger-soft: rgba(248,113,113,0.15);
      --mc-badge: #EF4444;
      --mc-shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
      --mc-shadow-md: 0 12px 32px -8px rgba(0,0,0,0.55);
      --mc-btn-send: #3F3F46;
      --mc-btn-send-hover: #52525B;
      --mc-btn-send-disabled: #27272A;
      --mc-avatar-bg: #27272A;
      --mc-avatar-txt: #A1A1AA;
      --mc-scroll: #2A2A36;
      --mc-scroll-hover: #3F3F46;
      --mc-bubble-them-bg: #1F1F29;
      --mc-bubble-them-txt: #F4F4F5;
      --mc-bubble-me-bg: #2563EB;
      --mc-bubble-me-txt: #FFFFFF;
      --mc-rec-bar-bg: rgba(248,113,113,0.15);
      --mc-rec-dot: #F87171;
      --mc-rec-time: #F87171;
      --mc-audio-btn-them-bg: #2A2A36;
      --mc-audio-btn-them-txt: #F4F4F5;
      --mc-audio-btn-me-bg: rgba(255,255,255,0.2);
      --mc-audio-btn-me-txt: #FFFFFF;
      --mc-track-them: #3F3F46;
      --mc-track-me: rgba(255,255,255,0.3);
      color-scheme: dark;
    }

    /* ══ Layout ══ */
    .mc-app {
      height: calc(100vh - 4rem);
      width: 100%;
      overflow: hidden;
      display: flex;
      background: var(--mc-bg);
      color: var(--mc-txt);
      font-family: 'Inter', system-ui, sans-serif;
      transition: background 0.25s ease, color 0.25s ease;
    }
    @media (max-width: 900px) {
      .mc-app { height: calc(100vh - 3.5rem); }
      .mc-panel-right { display: none !important; }
      .mc-panel-right.mc-show-mobile { display: flex !important; width: 100% !important; border-left: none !important; }
      .mc-panel-left.mc-hide-mobile { display: none !important; }
      .mc-panel-left { border-right: none !important; }
    }

    /* ══ Left panel ══ */
    .mc-panel-left {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: var(--mc-bg);
      border-right: 1px solid var(--mc-line);
      min-height: 0;
    }

    /* ══ Right panel ══ */
    .mc-panel-right {
      width: 320px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: var(--mc-bg);
      border-left: 1px solid var(--mc-line);
      min-height: 0;
    }
    @media (min-width: 1200px) { .mc-panel-right { width: 360px; } }
    @media (min-width: 1440px) { .mc-panel-right { width: 400px; } }

    /* ══ Chat header ══ */
    .mc-chat-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--mc-line);
      flex-shrink: 0;
      background: var(--mc-bg);
    }
    @media (min-width: 640px) { .mc-chat-head { padding: 14px 20px; gap: 14px; } }

    .mc-chat-head .mc-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--mc-txt);
      line-height: 1.2;
    }
    @media (min-width: 640px) { .mc-chat-head .mc-name { font-size: 16px; } }

    .mc-chat-head .mc-time {
      font-size: 12px;
      color: var(--mc-txt-faint);
      white-space: nowrap;
      display: none;
    }
    @media (min-width: 640px) { .mc-chat-head .mc-time { display: inline; } }

    .mc-chat-head .mc-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mc-chat-head .mc-actions .mc-i-btn.hide-sm { display: none; }
    @media (min-width: 640px) { .mc-chat-head .mc-actions .mc-i-btn.hide-sm { display: inline-flex; } }

    /* ══ Small icon buttons ══ */
    .mc-i-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--mc-txt-soft);
      border: none;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
      flex-shrink: 0;
      font-size: 15px;
    }
    .mc-i-btn:hover { background: var(--mc-bg-3); color: var(--mc-txt); }
    .mc-i-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .mc-i-btn.danger:hover { background: var(--mc-danger-soft); color: var(--mc-danger); }
    .mc-i-btn.confirm { background: var(--mc-danger-soft); color: var(--mc-danger); }
    .mc-i-btn.cancel { background: var(--mc-success-soft); color: var(--mc-success); }

    /* ══ Trade agent pill ══ */
    .mc-agent-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      background: var(--mc-warn-soft);
      color: var(--mc-warn-txt);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: filter 0.15s ease;
      white-space: nowrap;
    }
    .mc-agent-pill:hover { filter: brightness(1.08); }
    .mc-agent-pill .mc-agent-label { display: none; }
    @media (min-width: 640px) { .mc-agent-pill .mc-agent-label { display: inline; } }

    /* ══ Message stream ══ */
    .mc-stream {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      background: var(--mc-bg);
      min-height: 0;
    }
    @media (min-width: 640px) { .mc-stream { padding: 24px 32px; } }
    @media (min-width: 1024px) { .mc-stream { padding: 24px 40px; } }
    .mc-stream::-webkit-scrollbar { width: 8px; }
    .mc-stream::-webkit-scrollbar-thumb {
      background: var(--mc-scroll); border-radius: 8px;
    }
    .mc-stream::-webkit-scrollbar-thumb:hover { background: var(--mc-scroll-hover); }

    /* ══ Safety notice ══ */
    .mc-safety {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      background: var(--mc-surface);
      border: 1px solid var(--mc-line);
      border-radius: 10px;
      max-width: 640px;
      margin: 0 auto 20px;
      box-shadow: var(--mc-shadow-sm);
    }
    .mc-safety .mc-safety-ic {
      color: var(--mc-success);
      flex-shrink: 0;
      font-size: 16px;
      margin-top: 1px;
    }
    .mc-safety .mc-safety-txt {
      font-size: 12.5px;
      line-height: 1.5;
      color: var(--mc-txt);
    }
    @media (min-width: 640px) { .mc-safety .mc-safety-txt { font-size: 13px; } }
    .mc-safety .mc-safety-txt a {
      color: var(--mc-accent);
      text-decoration: underline;
      cursor: pointer;
    }

    /* ══ Bubbles ══ */
    .mc-row {
      display: flex;
      margin-bottom: 12px;
      align-items: flex-end;
      gap: 8px;
    }
    .mc-row.me { justify-content: flex-end; }
    .mc-row.them { justify-content: flex-start; }

    .mc-bubble {
      max-width: 85%;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    @media (min-width: 640px) { .mc-bubble { max-width: 68%; } }
    .mc-bubble.them {
      background: var(--mc-bubble-them-bg);
      color: var(--mc-bubble-them-txt);
      border-radius: 12px 12px 12px 2px;
    }
    .mc-bubble.me {
      background: var(--mc-bubble-me-bg);
      color: var(--mc-bubble-me-txt);
      border-radius: 12px 12px 2px 12px;
    }
    .mc-bubble-meta {
      font-size: 10px;
      margin-top: 4px;
      opacity: 0.65;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mc-row.me .mc-bubble-meta { justify-content: flex-end; }
    .mc-row.them .mc-bubble-meta { justify-content: flex-start; }

    /* ══ Product strip ══ */
    .mc-product-strip {
      flex-shrink: 0;
      border-top: 1px solid var(--mc-line);
      padding: 12px 16px 8px;
      background: var(--mc-bg);
    }
    @media (min-width: 640px) { .mc-product-strip { padding: 14px 20px 10px; } }

    .mc-product-strip .mc-strip-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .mc-product-strip .mc-strip-title {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--mc-txt);
      flex: 1;
    }
    @media (min-width: 640px) { .mc-product-strip .mc-strip-title { font-size: 13px; } }

    .mc-product-strip .mc-strip-close {
      width: 26px; height: 26px;
      border-radius: 999px;
      border: 1px solid var(--mc-line-str);
      background: var(--mc-surface);
      color: var(--mc-txt-faint);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .mc-product-strip .mc-strip-close:hover {
      background: var(--mc-bg-3);
      color: var(--mc-txt-soft);
    }
    .mc-product-card {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .mc-product-card .mc-pc-img {
      width: 48px; height: 48px;
      border-radius: 8px;
      object-fit: cover;
      background: var(--mc-bg-3);
      flex-shrink: 0;
      border: 1px solid var(--mc-line);
    }
    @media (min-width: 640px) { .mc-product-card .mc-pc-img { width: 56px; height: 56px; } }
    .mc-product-card .mc-pc-info { flex: 1; min-width: 0; }
    .mc-product-card .mc-pc-title {
      font-size: 12.5px;
      color: var(--mc-txt);
      line-height: 1.35;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 3px;
    }
    @media (min-width: 640px) { .mc-product-card .mc-pc-title { font-size: 13px; } }
    .mc-product-card .mc-pc-price {
      font-size: 13px;
      font-weight: 700;
      color: var(--mc-txt);
    }

    /* ══ Toolbar ══ */
    .mc-toolbar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 6px 14px 0;
      background: var(--mc-bg);
      overflow-x: auto;
    }
    @media (min-width: 640px) { .mc-toolbar { padding: 6px 20px 0; } }
    .mc-toolbar::-webkit-scrollbar { display: none; }
    .mc-tool {
      width: 34px; height: 34px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--mc-txt-soft);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 15px;
      transition: background 0.15s ease, color 0.15s ease;
      flex-shrink: 0;
    }
    .mc-tool:hover { background: var(--mc-bg-3); color: var(--mc-txt); }
    .mc-tool:disabled { opacity: 0.35; cursor: not-allowed; }
    .mc-tool.recording { background: var(--mc-rec-bar-bg); color: var(--mc-rec-dot); }
    .mc-tool.mc-hide-xs { display: none; }
    @media (min-width: 480px) { .mc-tool.mc-hide-xs { display: inline-flex; } }

    /* ══ Composer ══ */
    .mc-composer-wrap {
      flex-shrink: 0;
      padding: 6px 14px 14px;
      background: var(--mc-bg);
      position: relative;
    }
    @media (min-width: 640px) { .mc-composer-wrap { padding: 6px 20px 16px; } }

    .mc-composer {
      position: relative;
      background: var(--mc-surface-2);
      border: 1px solid transparent;
      border-radius: 12px;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .mc-composer:focus-within {
      background: var(--mc-surface);
      border-color: var(--mc-line-str);
    }
    .mc-composer textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      padding: 14px 78px 14px 14px;
      font-size: 14px;
      font-family: inherit;
      color: var(--mc-txt);
      line-height: 1.5;
      max-height: 140px;
      min-height: 52px;
    }
    @media (min-width: 480px) {
      .mc-composer textarea { padding: 14px 100px 14px 14px; }
    }
    .mc-composer textarea::placeholder { color: var(--mc-txt-faint); }
    .mc-composer .mc-expand {
      position: absolute;
      top: 10px;
      right: 12px;
      width: 22px; height: 22px;
      color: var(--mc-txt-faint);
      background: transparent;
      border: none;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    @media (min-width: 640px) { .mc-composer .mc-expand { display: inline-flex; } }
    .mc-composer .mc-expand:hover { color: var(--mc-txt-soft); }

    .mc-send-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      padding: 8px 18px;
      border-radius: 999px;
      border: none;
      background: var(--mc-btn-send);
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;
      font-family: inherit;
    }
    @media (min-width: 480px) { .mc-send-btn { padding: 8px 22px; right: 12px; } }
    .mc-send-btn:hover:not(:disabled) { background: var(--mc-btn-send-hover); }
    .mc-send-btn:disabled {
      background: var(--mc-btn-send-disabled);
      color: var(--mc-bg);
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* ══ Right panel — header ══ */
    .mc-right-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 16px 12px;
      flex-shrink: 0;
    }
    @media (min-width: 640px) { .mc-right-head { padding: 18px 20px 14px; } }
    .mc-right-head .mc-rh-icon {
      width: 26px; height: 26px;
      border-radius: 8px;
      background: var(--mc-success);
      color: #FFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .mc-right-head .mc-rh-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--mc-txt);
      flex: 1;
    }
    @media (min-width: 640px) { .mc-right-head .mc-rh-title { font-size: 18px; } }

    .mc-right-search {
      padding: 0 16px 12px;
      flex-shrink: 0;
      position: relative;
    }
    @media (min-width: 640px) { .mc-right-search { padding: 0 20px 12px; } }
    .mc-right-search input {
      width: 100%;
      padding: 9px 12px 9px 34px;
      border-radius: 8px;
      border: 1px solid var(--mc-line-str);
      background: var(--mc-surface-2);
      font-size: 13px;
      font-family: inherit;
      color: var(--mc-txt);
      outline: none;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .mc-right-search input:focus {
      border-color: var(--mc-txt-faint);
      background: var(--mc-surface);
    }
    .mc-right-search input::placeholder { color: var(--mc-txt-faint); }
    .mc-right-search .mc-rs-ic {
      position: absolute;
      left: 28px;
      top: calc(50% - 6px);
      transform: translateY(-50%);
      color: var(--mc-txt-faint);
      font-size: 12px;
      pointer-events: none;
    }
    @media (min-width: 640px) { .mc-right-search .mc-rs-ic { left: 32px; } }

    .mc-right-tabs {
      display: flex;
      gap: 4px;
      padding: 0 16px 12px;
      flex-shrink: 0;
      overflow-x: auto;
    }
    @media (min-width: 640px) { .mc-right-tabs { padding: 0 20px 12px; } }
    .mc-right-tabs::-webkit-scrollbar { display: none; }
    .mc-rtab {
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--mc-txt-soft);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .mc-rtab:hover { background: var(--mc-bg-3); color: var(--mc-txt); }
    .mc-rtab.is-active {
      background: var(--mc-inverse);
      color: var(--mc-inverse-txt);
      border-color: var(--mc-inverse);
    }
    .mc-rtab .mc-rtab-count {
      font-size: 10.5px;
      padding: 1px 6px;
      border-radius: 999px;
      background: var(--mc-bg-3);
      color: var(--mc-txt-soft);
    }
    .mc-rtab.is-active .mc-rtab-count {
      background: rgba(255,255,255,0.18);
      color: inherit;
    }

    .mc-right-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 8px 12px;
      min-height: 0;
    }
    .mc-right-list::-webkit-scrollbar { width: 8px; }
    .mc-right-list::-webkit-scrollbar-thumb {
      background: var(--mc-scroll); border-radius: 8px;
    }
    .mc-right-list::-webkit-scrollbar-thumb:hover { background: var(--mc-scroll-hover); }

    .mc-conv-row {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s ease;
      border: 1px solid transparent;
    }
    .mc-conv-row:hover { background: var(--mc-surface-2); }
    .mc-conv-row.is-active { background: var(--mc-bg-3); }

    .mc-conv-row .mc-cr-img {
      width: 42px; height: 42px;
      border-radius: 999px;
      object-fit: cover;
      flex-shrink: 0;
      background: var(--mc-avatar-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--mc-avatar-txt);
      font-weight: 700;
      font-size: 15px;
    }
    .mc-conv-row .mc-cr-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .mc-conv-row .mc-cr-name {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--mc-txt);
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mc-conv-row .mc-cr-sub {
      font-size: 12px;
      color: var(--mc-txt-soft);
      margin-top: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mc-conv-row .mc-cr-badge {
      min-width: 18px; height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      background: var(--mc-badge);
      color: #FFF;
      font-size: 10px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .mc-right-empty {
      padding: 60px 24px;
      text-align: center;
      color: var(--mc-txt-faint);
      font-size: 13px;
    }
    .mc-right-empty .mc-re-icon {
      font-size: 30px;
      margin-bottom: 8px;
      color: var(--mc-line-str);
    }

    /* ══ Emoji panel ══ */
    .mc-emoji-panel {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 14px;
      width: 320px;
      max-width: calc(100vw - 28px);
      height: 340px;
      background: var(--mc-surface);
      border: 1px solid var(--mc-line-str);
      border-radius: 12px;
      box-shadow: var(--mc-shadow-md);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 50;
    }
    @media (min-width: 640px) {
      .mc-emoji-panel { left: 20px; }
    }
    .mc-emoji-cats {
      display: flex;
      gap: 2px;
      padding: 8px 8px 6px;
      overflow-x: auto;
      border-bottom: 1px solid var(--mc-line);
      flex-shrink: 0;
    }
    .mc-emoji-cats::-webkit-scrollbar { display: none; }
    .mc-emoji-cat {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }
    .mc-emoji-cat:hover { background: var(--mc-bg-3); }
    .mc-emoji-cat.is-active { background: var(--mc-line-str); }
    .mc-emoji-grid {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 2px;
      align-content: start;
    }
    .mc-emoji-grid::-webkit-scrollbar { width: 5px; }
    .mc-emoji-grid::-webkit-scrollbar-thumb {
      background: var(--mc-scroll); border-radius: 5px;
    }
    .mc-emoji-btn {
      width: 100%;
      aspect-ratio: 1;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 19px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.12s ease, transform 0.12s ease;
      padding: 0;
      line-height: 1;
    }
    .mc-emoji-btn:hover { background: var(--mc-bg-3); transform: scale(1.15); }

    /* ══ Recording bar ══ */
    .mc-rec-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px;
    }
    .mc-rec-dot {
      width: 10px; height: 10px; border-radius: 999px;
      background: var(--mc-rec-dot);
      animation: mc-rec-blink 1s infinite;
      flex-shrink: 0;
    }
    @keyframes mc-rec-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.25; }
    }
    .mc-rec-time {
      font-size: 14px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--mc-rec-time);
      flex-shrink: 0;
    }
    .mc-rec-hint {
      font-size: 13px;
      color: var(--mc-txt-faint);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    /* ══ Audio player ══ */
    .mc-audio {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 180px;
      max-width: 240px;
    }
    @media (min-width: 640px) { .mc-audio { min-width: 200px; max-width: 260px; } }
    .mc-audio-play {
      width: 34px; height: 34px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .mc-audio-play:hover { transform: scale(1.06); }
    .mc-audio-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mc-audio-track {
      height: 4px;
      border-radius: 999px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .mc-audio-progress {
      height: 100%;
      border-radius: 999px;
      transition: width 0.08s linear;
    }
    .mc-audio-meta {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      font-variant-numeric: tabular-nums;
      opacity: 0.8;
    }

    /* ══ Bubble image ══ */
    .mc-bubble img.mc-img {
      border-radius: 8px;
      max-width: 220px;
      max-height: 300px;
      object-fit: cover;
      cursor: pointer;
      display: block;
    }
    @media (min-width: 640px) {
      .mc-bubble img.mc-img { max-width: 240px; max-height: 320px; }
    }

    /* ══ Avatar in chat head ══ */
    .mc-head-avatar {
      width: 36px; height: 36px;
      border-radius: 999px;
      object-fit: cover;
      flex-shrink: 0;
      background: var(--mc-avatar-bg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--mc-avatar-txt);
      font-weight: 700;
      font-size: 14px;
    }
    @media (min-width: 640px) { .mc-head-avatar { width: 38px; height: 38px; } }

    /* ══ Mobile back button ══ */
    .mc-mobile-back { display: inline-flex; }
    @media (min-width: 900px) { .mc-mobile-back { display: none; } }

    /* ══ Desktop placeholder when inbox only ══ */
    .mc-desktop-placeholder {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: var(--mc-txt-faint);
      padding: 40px;
      text-align: center;
    }
    @media (min-width: 900px) { .mc-desktop-placeholder { display: flex; } }
    .mc-desktop-placeholder .mc-dp-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--mc-bg-3);
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 28px; color: var(--mc-line-str); margin-bottom: 14px;
    }
    .mc-desktop-placeholder .mc-dp-title {
      font-size: 14px; margin-bottom: 4px; color: var(--mc-txt-soft);
    }
    .mc-desktop-placeholder .mc-dp-sub {
      font-size: 12.5px; color: var(--mc-txt-faint);
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const getInitials = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtClock = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const fmtDuration = (sec) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

/* ═══════════════════════════════════════════════════════════════
   EMOJI DATA
   ═══════════════════════════════════════════════════════════════ */
const EMOJI_CATEGORIES = [
  { key: "smileys", icon: "😀", label: "Smileys", emojis: [
    "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙",
    "🥲","😋","😛","😜","🤪","😝","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥",
    "😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐",
    "😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓",
    "😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","🤡","👻","👽","🤖","😺","😸","😹","😻","😼","😽",
  ]},
  { key: "gestures", icon: "👍", label: "Gestures", emojis: [
    "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤝","🙏",
    "✍️","💪","🦾","🦿","🦵","🦶","👂","👃","🧠","🫀","👀","👁️","👅","👄","💋","🩸","🫂","👐","🙌","👏",
    "🙋","🙆","🙅","🤷","🤦","🙇","💁","💃","🕺","🕴️",
  ]},
  { key: "hearts", icon: "❤️", label: "Hearts", emojis: [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️",
    "💌","🌹","🥀","💐","🌸","🌺","🌻","🌷","🌼","🏵️","✨","⭐","🌟","💫","⚡","🔥","💥","💢","🌈",
  ]},
  { key: "animals", icon: "🐶", label: "Animals", emojis: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒",
    "🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜",
    "🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈",
  ]},
  { key: "food", icon: "🍕", label: "Food", emojis: [
    "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑",
    "🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳",
    "🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕",
    "🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦",
  ]},
  { key: "activity", icon: "⚽", label: "Activity", emojis: [
    "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳",
    "🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️",
    "🤺","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚵","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️",
  ]},
  { key: "travel", icon: "✈️", label: "Travel", emojis: [
    "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🦯","🦽","🦼","🛴","🚲","🛵",
    "🏍️","🛺","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇",
    "🚊","🚉","✈️","🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","⚓","⛽",
  ]},
  { key: "objects", icon: "💡", label: "Objects", emojis: [
    "⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥",
    "📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","⏳","📡","🔋",
    "🔌","💡","🔦","🕯️","🪔","🧯","🛢️","💸","💵","💴","💶","💷","💰","💳","💎","⚖️","🧰","🔧","🔨","⚒️",
    "🛠️","⛏️","🔩","⚙️","🧱","⛓️","🧲","🔫","💣","🧨","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","🪦","⚱️","🏺",
  ]},
  { key: "symbols", icon: "✅", label: "Symbols", emojis: [
    "✅","❌","❎","✔️","☑️","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","🔸","🔹","🔶",
    "🔷","🔳","🔲","▪️","▫️","◾","◽","◼️","◻️","🟥","🟧","🟨","🟩","🟦","🟪","⬛","⬜","🟫","🔈","🔇",
    "🔉","🔊","🔔","🔕","📣","📢","💬","💭","🗯️","♠️","♣️","♥️","♦️","🃏","🎴","🀄","🕐","🕑","🕒",
  ]},
];

/* ═══════════════════════════════════════════════════════════════
   AUDIO BUBBLE
   ═══════════════════════════════════════════════════════════════ */
const AudioBubble = ({ src, fromMe }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const seek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
    setCurrent(el.currentTime);
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="mc-audio">
      <audio
        ref={audioRef} src={src} preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
      />
      <button
        type="button" onClick={toggle} className="mc-audio-play"
        style={{
          background: fromMe ? "var(--mc-audio-btn-me-bg)" : "var(--mc-audio-btn-them-bg)",
          color: fromMe ? "var(--mc-audio-btn-me-txt)" : "var(--mc-audio-btn-them-txt)",
        }}
      >
        {playing ? <FaPause size={12} /> : <FaPlay size={12} style={{ marginLeft: 2 }} />}
      </button>
      <div className="mc-audio-body">
        <div
          className="mc-audio-track" onClick={seek}
          style={{ background: fromMe ? "var(--mc-track-me)" : "var(--mc-track-them)" }}
        >
          <div
            className="mc-audio-progress"
            style={{
              width: `${pct}%`,
              background: fromMe ? "var(--mc-audio-btn-me-txt)" : "var(--mc-bubble-them-txt)",
            }}
          />
        </div>
        <div
          className="mc-audio-meta"
          style={{ color: fromMe ? "var(--mc-audio-btn-me-txt)" : "var(--mc-bubble-them-txt)" }}
        >
          <span>{fmtDuration(current)}</span>
          <span>{fmtDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMOJI PICKER
   ═══════════════════════════════════════════════════════════════ */
const EmojiPicker = ({ onPick, onClose }) => {
  const [cat, setCat] = useState(EMOJI_CATEGORIES[0].key);
  const panelRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  const active = EMOJI_CATEGORIES.find((c) => c.key === cat) || EMOJI_CATEGORIES[0];

  return (
    <div ref={panelRef} className="mc-emoji-panel">
      <div className="mc-emoji-cats">
        {EMOJI_CATEGORIES.map((c) => (
          <button
            key={c.key} type="button" title={c.label}
            onClick={() => setCat(c.key)}
            className={`mc-emoji-cat ${cat === c.key ? "is-active" : ""}`}
          >
            {c.icon}
          </button>
        ))}
      </div>
      <div className="mc-emoji-grid">
        {active.emojis.map((em, i) => (
          <button
            key={`${active.key}-${i}`} type="button"
            className="mc-emoji-btn" onClick={() => onPick(em)}
          >
            {em}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const MarketplaceChat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetUserId = searchParams.get("user");
  const listingId = searchParams.get("listing");
  const prefill = searchParams.get("text");

  const isInbox = !targetUserId;
  /* 🌙 Read dark mode from your EXISTING app theme system */
  const isDark = useExternalTheme();

  /* ── State ── */
  const [seller, setSeller] = useState(null);
  const [sellerListing, setSellerListing] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(!isInbox);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showProductStrip, setShowProductStrip] = useState(true);

  /* Recording */
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const recStreamRef = useRef(null);
  const recCancelledRef = useRef(false);

  /* Emoji */
  const [showEmoji, setShowEmoji] = useState(false);

  /* Clear chat */
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  /* Inbox */
  const [conversations, setConversations] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxTab, setInboxTab] = useState("all");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const confirmTimerRef = useRef(null);

  /* ── Prefill ── */
  useEffect(() => {
    if (prefill && !input) {
      setInput(prefill);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  /* ═══════════════════════════════════════════════════════════════
     INBOX LOAD
     ═══════════════════════════════════════════════════════════════ */
  const loadInbox = useCallback(async () => {
    if (!user?.id) return;
    setLoadingInbox(true);
    try {
      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      const peerMap = new Map();
      const listingIdByPeer = new Map();

      (msgs || []).forEach((m) => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!otherId) return;
        if (!peerMap.has(otherId)) {
          peerMap.set(otherId, {
            peerId: otherId,
            lastMessage: m.content,
            lastMessageType: m.message_type || "text",
            lastAt: m.created_at,
            lastFromMe: m.sender_id === user.id,
            unread: 0,
            iInitiated: m.sender_id === user.id,
            theyInitiated: m.receiver_id === user.id,
          });
        }
        if (m.listing_id && !listingIdByPeer.has(otherId)) {
          listingIdByPeer.set(otherId, m.listing_id);
        }
        if (m.receiver_id === user.id && !m.read) {
          const cur = peerMap.get(otherId);
          cur.unread = (cur.unread || 0) + 1;
        }
        const cur = peerMap.get(otherId);
        if (m.sender_id === user.id) cur.iInitiated = true;
        if (m.receiver_id === user.id) cur.theyInitiated = true;
      });

      const peerIds = [...peerMap.keys()];
      if (peerIds.length === 0) { setConversations([]); return; }

      const knownListingIds = [...listingIdByPeer.values()];
      const listingsById = new Map();
      if (knownListingIds.length > 0) {
        const { data: rows } = await supabase
          .from("listings")
          .select("id, title, cover_image, images, category, price, user_id")
          .in("id", knownListingIds);
        (rows || []).forEach((l) => listingsById.set(l.id, l));
      }

      const peersMissingListing = peerIds.filter((id) => !listingIdByPeer.has(id));
      const fallbackListingsByPeer = new Map();
      if (peersMissingListing.length > 0) {
        const { data: rows } = await supabase
          .from("listings")
          .select("id, user_id, title, cover_image, images, category, price, created_at")
          .in("user_id", peersMissingListing)
          .eq("status", "active")
          .order("created_at", { ascending: false });
        (rows || []).forEach((l) => {
          if (!fallbackListingsByPeer.has(l.user_id)) {
            fallbackListingsByPeer.set(l.user_id, l);
          }
        });
      }

      const { data: profiles } = await supabase
        .from("user_settings")
        .select("user_id, full_name, avatar, email")
        .in("user_id", peerIds);
      const profileByPeer = new Map();
      (profiles || []).forEach((p) => profileByPeer.set(p.user_id, p));

      const { data: myListings } = await supabase
        .from("listings").select("id").eq("user_id", user.id);
      const myListingIds = new Set((myListings || []).map((l) => l.id));

      const list = peerIds.map((id) => {
        const base = peerMap.get(id);
        const knownId = listingIdByPeer.get(id);
        const listing =
          (knownId && listingsById.get(knownId)) ||
          fallbackListingsByPeer.get(id) || null;
        const profile = profileByPeer.get(id) || {};
        const cover =
          listing?.cover_image ||
          (Array.isArray(listing?.images) && listing.images[0]) || null;

        let direction;
        if (listing && myListingIds.has(listing.id)) direction = "selling";
        else if (listing && listing.user_id && listing.user_id !== user.id) direction = "buying";
        else if (base.iInitiated && !base.theyInitiated) direction = "buying";
        else if (base.theyInitiated && !base.iInitiated) direction = "selling";
        else direction = "buying";

        return {
          ...base,
          direction,
          listingId: listing?.id || null,
          listingTitle: listing?.title || null,
          itemCategory: listing?.category || null,
          name: profile.full_name ||
            (profile.email ? profile.email.split("@")[0] : "User"),
          avatar: profile.avatar || cover || null,
          listingCover: cover,
        };
      });

      setConversations(list);
    } catch (err) {
      console.error("Inbox load error:", err);
      setConversations([]);
    } finally {
      setLoadingInbox(false);
    }
  }, [user?.id]);

  useEffect(() => { if (user?.id) loadInbox(); }, [user?.id, loadInbox]);

  /* Realtime inbox */
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`mc-inbox-${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => loadInbox())
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        () => loadInbox())
      .subscribe();
    return () => ch.unsubscribe();
  }, [user?.id, loadInbox]);

  /* ═══════════════════════════════════════════════════════════════
     THREAD LOAD
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (isInbox) return;
    let cancelled = false;
    (async () => {
      if (!user?.id || !targetUserId) return;
      setLoadingSeller(true);
      try {
        const LISTING_FIELDS =
          "id, title, price, cover_image, images, category, subcategory, city, area, condition, specs, description, status, created_at";
        const [profileRes, listingRes] = await Promise.all([
          supabase.from("user_settings")
            .select("user_id, full_name, avatar, email")
            .eq("user_id", targetUserId).maybeSingle(),
          listingId
            ? supabase.from("listings").select(LISTING_FIELDS).eq("id", listingId).maybeSingle()
            : supabase.from("listings").select(LISTING_FIELDS)
                .eq("user_id", targetUserId).eq("status", "active")
                .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (cancelled) return;
        const p = profileRes.data || {};
        setSeller({
          id: targetUserId,
          full_name: p.full_name || (p.email ? p.email.split("@")[0] : "Seller"),
          avatar: p.avatar || null,
          email: p.email || null,
        });
        setSellerListing(listingRes.data || null);
      } catch (err) {
        console.error("Seller fetch error:", err);
      } finally {
        if (!cancelled) setLoadingSeller(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, targetUserId, listingId, isInbox]);

  useEffect(() => { setShowProductStrip(true); }, [targetUserId, listingId]);

  const loadMessages = useCallback(async () => {
    if (isInbox) return;
    if (!user?.id || !targetUserId) return;
    setLoadingMsgs(true);
    try {
      const { data, error } = await supabase
        .from("messages").select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(300);
      if (error) throw error;

      const formatted = (data || []).map((m) => ({
        id: m.id, fromMe: m.sender_id === user.id, text: m.content,
        type: m.message_type || "text", createdAt: m.created_at, read: m.read,
      }));
      setMessages(formatted);

      const unreadIds = (data || [])
        .filter((m) => m.receiver_id === user.id && !m.read).map((m) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ read: true }).in("id", unreadIds);
      }
    } catch (err) {
      console.error("Load messages error:", err);
    } finally { setLoadingMsgs(false); }
  }, [user?.id, targetUserId, isInbox]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (isInbox) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loadingMsgs, sending, isInbox]);

  /* Realtime thread */
  useEffect(() => {
    if (isInbox || !user?.id || !targetUserId) return;
    const channel = supabase
      .channel(`mc-conv-${user.id}-${targetUserId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const m = payload.new;
          if (m.sender_id !== targetUserId) return;
          setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [
            ...prev,
            { id: m.id, fromMe: false, text: m.content,
              type: m.message_type || "text",
              createdAt: m.created_at, read: false },
          ]);
          supabase.from("messages").update({ read: true }).eq("id", m.id).then(() => {});
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          const old = payload.old;
          if (!old?.id) { loadMessages(); return; }
          setMessages((prev) => prev.filter((x) => x.id !== old.id));
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const u = payload.new;
          if (!u?.id) return;
          setMessages((prev) => prev.map((x) => x.id === u.id ? { ...x, read: u.read } : x));
        })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user?.id, targetUserId, loadMessages, isInbox]);

  useEffect(() => {
    setConfirmClear(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, [targetUserId]);

  useEffect(() => {
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (recStreamRef.current) recStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ── Send text ── */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !seller || sending) return;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tempId, fromMe: true, text, type: "text",
      createdAt: new Date().toISOString(), read: false, pending: true,
    }]);
    setInput("");
    setShowEmoji(false);
    try {
      const insertPayload = {
        sender_id: user.id, receiver_id: seller.id,
        content: text, message_type: "text", read: false,
      };
      if (listingId) insertPayload.listing_id = listingId;
      const { data, error } = await supabase.from("messages").insert([insertPayload]).select().single();
      if (error) throw error;
      setMessages((prev) => prev.map((m) =>
        m.id === tempId ? { ...m, id: data.id, pending: false, createdAt: data.created_at } : m
      ));
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
    } finally { setSending(false); }
  };

  /* ── Send image ── */
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !seller) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result;
      if (!base64) return;
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, {
        id: tempId, fromMe: true, text: base64, type: "image",
        createdAt: new Date().toISOString(), read: false, pending: true,
      }]);
      try {
        const insertPayload = {
          sender_id: user.id, receiver_id: seller.id,
          content: base64, message_type: "image", read: false,
        };
        if (listingId) insertPayload.listing_id = listingId;
        const { data, error } = await supabase.from("messages").insert([insertPayload]).select().single();
        if (error) throw error;
        setMessages((prev) => prev.map((m) =>
          m.id === tempId ? { ...m, id: data.id, pending: false } : m
        ));
      } catch (err) {
        console.error("Image send error:", err);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Voice ── */
  const startRecording = async () => {
    if (recording || !seller) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recStreamRef.current = stream;
      audioChunksRef.current = [];
      recCancelledRef.current = false;

      let mime = "";
      const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
      for (const t of preferred) {
        if (window.MediaRecorder?.isTypeSupported?.(t)) { mime = t; break; }
      }

      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        const wasCancelled = recCancelledRef.current;
        recCancelledRef.current = false;
        stream.getTracks().forEach((t) => t.stop());
        recStreamRef.current = null;
        mediaRecorderRef.current = null;
        if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
        setRecording(false);
        setRecSeconds(0);
        if (wasCancelled || chunks.length === 0) return;
        const blob = new Blob(chunks, { type: mime || "audio/webm" });
        if (blob.size > 5 * 1024 * 1024) { alert("Voice message too large (max 5MB)."); return; }
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target?.result;
          if (typeof base64 !== "string") return;
          const tempId = `temp-${Date.now()}`;
          setMessages((prev) => [...prev, {
            id: tempId, fromMe: true, text: base64, type: "voice",
            createdAt: new Date().toISOString(), read: false, pending: true,
          }]);
          try {
            const insertPayload = {
              sender_id: user.id, receiver_id: seller.id,
              content: base64, message_type: "voice", read: false,
            };
            if (listingId) insertPayload.listing_id = listingId;
            const { data, error } = await supabase.from("messages").insert([insertPayload]).select().single();
            if (error) throw error;
            setMessages((prev) => prev.map((m) =>
              m.id === tempId ? { ...m, id: data.id, pending: false } : m
            ));
          } catch (err) {
            console.error("Voice send error:", err);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          if (s + 1 >= 120) {
            try {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
              }
            } catch (e) {}
            return 120;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Could not access microphone. Please allow microphone permission.");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (e) { console.error(e); }
  };

  const cancelRecording = () => {
    recCancelledRef.current = true;
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      } else {
        if (recStreamRef.current) recStreamRef.current.getTracks().forEach((t) => t.stop());
        recStreamRef.current = null;
        if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
        setRecording(false);
        setRecSeconds(0);
      }
    } catch (e) { console.error(e); }
  };

  const insertEmoji = (emoji) => {
    setInput((v) => v + emoji);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  /* ── Clear chat ── */
  const clearChat = async () => {
    if (!user?.id || !targetUserId || clearing) return;
    setClearing(true);
    try {
      const { error } = await supabase
        .from("messages").delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`);
      if (error) throw error;
      setMessages([]);
      setConfirmClear(false);
    } catch (err) {
      console.error("clearChat error:", err);
    } finally { setClearing(false); }
  };

  const handleClearClick = () => {
    if (confirmClear) return;
    setConfirmClear(true);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 4000);
  };

  const openConversation = (conv) => {
    const params = new URLSearchParams();
    params.set("user", conv.peerId);
    if (conv.listingId) params.set("listing", conv.listingId);
    navigate(`/marketplace-chat?${params.toString()}`);
  };

  /* ── Derived ── */
  const { buyingConversations, sellingConversations } = useMemo(() => {
    const buying = [], selling = [];
    conversations.forEach((c) => {
      if (c.direction === "selling") selling.push(c);
      else buying.push(c);
    });
    return { buyingConversations: buying, sellingConversations: selling };
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (inboxTab === "buying") list = buyingConversations;
    else if (inboxTab === "selling") list = sellingConversations;
    if (!inboxSearch.trim()) return list;
    const q = inboxSearch.toLowerCase();
    return list.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      String(c.listingTitle || "").toLowerCase().includes(q) ||
      String(c.lastMessage || "").toLowerCase().includes(q)
    );
  }, [conversations, buyingConversations, sellingConversations, inboxTab, inboxSearch]);

  const previewOf = (c) => {
    if (c.lastMessageType === "image") return "📷 Photo";
    if (c.lastMessageType === "voice") return "🎤 Voice message";
    return (c.lastMessage || "").slice(0, 60);
  };

  /* ── Loading ── */
  if (!isInbox && (authLoading || loadingSeller)) {
    return (
      <div className={`mc-root ${isDark ? "mc-dark" : ""} mc-app`}
        style={{ alignItems: "center", justifyContent: "center" }}>
        <Styles />
        <FaSpinner className="animate-spin" style={{ fontSize: 24, color: "var(--mc-txt-faint)" }} />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RIGHT PANEL
     ═══════════════════════════════════════════════════════════════ */
  const RightPanel = (
    <aside className={`mc-panel-right ${isInbox ? "mc-show-mobile" : ""}`}>
      <div className="mc-right-head">
        <span className="mc-rh-icon"><FaRegComments /></span>
        <span className="mc-rh-title">Messages</span>
        <button className="mc-i-btn" aria-label="Search">
          <FaSearch />
        </button>
      </div>

      <div className="mc-right-search">
        <FaSearch className="mc-rs-ic" />
        <input
          type="text" value={inboxSearch}
          onChange={(e) => setInboxSearch(e.target.value)}
          placeholder="Search"
        />
      </div>

      <div className="mc-right-tabs">
        <button className={`mc-rtab ${inboxTab === "all" ? "is-active" : ""}`}
          onClick={() => setInboxTab("all")}>
          All <span className="mc-rtab-count">{conversations.length}</span>
        </button>
        <button className={`mc-rtab ${inboxTab === "buying" ? "is-active" : ""}`}
          onClick={() => setInboxTab("buying")}>
          Buying <span className="mc-rtab-count">{buyingConversations.length}</span>
        </button>
        <button className={`mc-rtab ${inboxTab === "selling" ? "is-active" : ""}`}
          onClick={() => setInboxTab("selling")}>
          Selling <span className="mc-rtab-count">{sellingConversations.length}</span>
        </button>
      </div>

      <div className="mc-right-list">
        {loadingInbox ? (
          <div className="mc-right-empty"><FaSpinner className="animate-spin" /></div>
        ) : filteredConversations.length === 0 ? (
          <div className="mc-right-empty">
            <div className="mc-re-icon"><FaRegComments /></div>
            {inboxSearch.trim() ? "No matches" : "No conversations yet"}
          </div>
        ) : (
          filteredConversations.map((c) => {
            const active = c.peerId === targetUserId;
            const showAvatar = c.avatar || c.listingCover;
            return (
              <div
                key={c.peerId} onClick={() => openConversation(c)}
                className={`mc-conv-row ${active ? "is-active" : ""}`}
              >
                {showAvatar ? (
                  <img
                    src={showAvatar} alt={c.name} className="mc-cr-img"
                    onError={(e) => {
                      e.currentTarget.replaceWith(
                        Object.assign(document.createElement("div"), {
                          className: "mc-cr-img", textContent: getInitials(c.name),
                        })
                      );
                    }}
                  />
                ) : (
                  <div className="mc-cr-img">{getInitials(c.name)}</div>
                )}
                <div className="mc-cr-body">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="mc-cr-name" style={{ flex: 1 }}>{c.name}</span>
                    {c.unread > 0 && (
                      <span className="mc-cr-badge">{c.unread > 9 ? "9+" : c.unread}</span>
                    )}
                  </div>
                  <span className="mc-cr-sub">
                    {c.lastFromMe && <span style={{ color: "var(--mc-txt-faint)" }}>You: </span>}
                    {c.listingTitle ? `${c.listingTitle} · ` : ""}
                    {previewOf(c)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );

  /* ═══════════════════════════════════════════════════════════════
     INBOX-ONLY VIEW
     ═══════════════════════════════════════════════════════════════ */
  if (isInbox) {
    return (
      <div className={`mc-root ${isDark ? "mc-dark" : ""} mc-app`}>
        <Styles />
        <div className="mc-panel-left mc-hide-mobile mc-desktop-placeholder">
          <div className="mc-dp-icon"><FaRegComments /></div>
          <p className="mc-dp-title">Select a conversation</p>
          <p className="mc-dp-sub">Choose from the list on the right to start chatting</p>
        </div>
        {RightPanel}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     SINGLE THREAD VIEW
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className={`mc-root ${isDark ? "mc-dark" : ""} mc-app`}>
      <Styles />

      {/* ══ LEFT: chat ══ */}
      <section className="mc-panel-left">
        <div className="mc-chat-head">
          <button
            className="mc-i-btn mc-mobile-back"
            onClick={() => navigate("/marketplace-chat")}
            aria-label="Back"
            style={{ marginLeft: -6 }}
          >
            <FaChevronLeft />
          </button>

          {seller?.avatar ? (
            <img src={seller.avatar} alt={seller.full_name} className="mc-head-avatar" />
          ) : sellerListing?.cover_image ? (
            <img src={sellerListing.cover_image} alt={sellerListing.title} className="mc-head-avatar" />
          ) : (
            <div className="mc-head-avatar">{getInitials(seller?.full_name)}</div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="mc-name" style={{
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {seller?.full_name}
            </div>
          </div>

          <div className="mc-actions">
            <span className="mc-time">Local Time: {fmtClock()}</span>
            <button className="mc-i-btn hide-sm" title="More"><FaEllipsisH /></button>
            <button className="mc-i-btn hide-sm" title="Expand"><FaExpand /></button>
            {!confirmClear ? (
              <button
                className="mc-i-btn danger"
                onClick={handleClearClick}
                disabled={clearing || messages.length === 0}
                title="Clear chat"
              >
                <FaTrash />
              </button>
            ) : (
              <>
                <button className="mc-i-btn confirm" onClick={clearChat} disabled={clearing} title="Confirm">
                  {clearing ? <FaSpinner className="animate-spin" size={12} /> : <FaCheck />}
                </button>
                <button className="mc-i-btn cancel" onClick={() => setConfirmClear(false)} disabled={clearing} title="Cancel">
                  <FaTimes />
                </button>
              </>
            )}
            <button className="mc-agent-pill" title="Trade Agent">
              <span style={{ color: "currentColor" }}>◆</span>
              <span className="mc-agent-label">Trade Agent</span>
              <FaChevronRight size={9} />
            </button>
          </div>
        </div>

        <div className="mc-stream">
          <div className="mc-safety">
            <span className="mc-safety-ic"><FaShieldAlt /></span>
            <span className="mc-safety-txt">
              Keep chats and transactions on your marketplace to enjoy order protection.{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>Learn more</a>
            </span>
          </div>

          {loadingMsgs ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--mc-txt-faint)" }}>
              <FaSpinner className="animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0",
              color: "var(--mc-txt-faint)", fontSize: 13 }}>
              No messages yet — say hi to {seller?.full_name?.split(" ")[0]}!
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`mc-row ${m.fromMe ? "me" : "them"}`}>
                <div className={`mc-bubble ${m.fromMe ? "me" : "them"}`}>
                  {m.type === "image" ? (
                    <img src={m.text} alt="Shared" className="mc-img"
                      onClick={() => setImagePreview(m.text)} />
                  ) : m.type === "voice" ? (
                    <AudioBubble src={m.text} fromMe={m.fromMe} />
                  ) : m.text}
                  <div className="mc-bubble-meta">
                    <span>{fmtTime(m.createdAt)}</span>
                    {m.fromMe && (
                      m.pending ? <FaCheck size={9} /> :
                      m.read ? <FaCheckDouble size={10} /> :
                      <FaCheck size={9} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="mc-row me">
              <div className="mc-bubble me" style={{ display: "flex", gap: 3 }}>
                <span className="mc-rec-dot" style={{ width: 6, height: 6 }} />
                <span className="mc-rec-dot" style={{ width: 6, height: 6, animationDelay: "0.15s" }} />
                <span className="mc-rec-dot" style={{ width: 6, height: 6, animationDelay: "0.3s" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={{ background: "var(--mc-bg)", borderTop: "1px solid var(--mc-line)", flexShrink: 0 }}>
          {sellerListing && showProductStrip && (
            <div className="mc-product-strip">
              <div className="mc-strip-top">
                <span className="mc-strip-title">
                  Questions about your selections? Send an inquiry!
                </span>
                <button className="mc-strip-close" onClick={() => setShowProductStrip(false)}>
                  <FaTimes size={10} />
                </button>
              </div>
              <div className="mc-product-card">
                {sellerListing.cover_image ? (
                  <img src={sellerListing.cover_image} alt={sellerListing.title} className="mc-pc-img" />
                ) : (
                  <div className="mc-pc-img" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--mc-txt-faint)",
                  }}>
                    <FaTag />
                  </div>
                )}
                <div className="mc-pc-info">
                  <div className="mc-pc-title">{sellerListing.title}</div>
                  <div className="mc-pc-price">
                    {sellerListing.price != null
                      ? `Rs ${Number(sellerListing.price).toLocaleString("en-US")}` : ""}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!sellerListing && (
            <div className="mc-product-strip">
              <div className="mc-strip-top">
                <span className="mc-strip-title">
                  Questions about your selections? Send an inquiry!
                </span>
              </div>
            </div>
          )}

          <div className="mc-toolbar">
            <button className="mc-tool" title="Emoji"
              onClick={() => setShowEmoji((v) => !v)} disabled={recording}>
              <FaRegSmile />
            </button>
            <button className="mc-tool" title="Image"
              onClick={() => fileInputRef.current?.click()} disabled={recording}>
              <FaRegImage />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={handleImage} style={{ display: "none" }} />
            <button className="mc-tool mc-hide-xs" title="File" disabled>
              <FaRegFileAlt />
            </button>
            <button className="mc-tool mc-hide-xs" title="Call" disabled>
              <FaPhoneAlt />
            </button>
            <button className="mc-tool mc-hide-xs" title="Card" disabled>
              <FaRegCreditCard />
            </button>
            <button className="mc-tool mc-hide-xs" title="Document" disabled>
              <FaRegFile />
            </button>
            <button className="mc-tool mc-hide-xs" title="Translate" disabled>
              <FaLanguage />
            </button>
            <button className="mc-tool" title="Voice"
              onClick={recording ? stopRecording : startRecording}
              disabled={!!input.trim()}
              style={{ marginLeft: "auto" }}>
              <FaMicrophone />
            </button>
          </div>

          <div className="mc-composer-wrap">
            {showEmoji && (
              <EmojiPicker onPick={insertEmoji} onClose={() => setShowEmoji(false)} />
            )}

            <div className="mc-composer">
              {recording ? (
                <div className="mc-rec-bar">
                  <span className="mc-rec-dot" />
                  <span className="mc-rec-time">{fmtDuration(recSeconds)}</span>
                  <span className="mc-rec-hint">Recording…</span>
                  <button className="mc-i-btn cancel" onClick={cancelRecording} title="Cancel">
                    <FaTimes />
                  </button>
                  <button className="mc-i-btn confirm" onClick={stopRecording} title="Send">
                    <FaCheck />
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    ref={inputRef} value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Please enter your message here"
                    rows={1}
                  />
                  <button className="mc-expand" title="Expand" tabIndex={-1}>
                    <FaExpand size={11} />
                  </button>
                  <button className="mc-send-btn"
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}>
                    Send
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {RightPanel}

      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setImagePreview(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16, background: "rgba(0,0,0,0.9)",
            }}
          >
            <button
              onClick={() => setImagePreview(null)}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 40, height: 40, borderRadius: "50%",
                border: "none", color: "#FFF",
                background: "rgba(255,255,255,0.15)", cursor: "pointer",
              }}
            >
              <FaTimes />
            </button>
            <img
              src={imagePreview} alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "85vh",
                objectFit: "contain", borderRadius: 12 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplaceChat;