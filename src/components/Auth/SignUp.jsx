// pages/auth/SignUp.jsx
// ⭐ Brand: signature logo gradient (#F7941D → #ED6E1F → #D4521A)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGithub,
  FaGift,
  FaCloud,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaRobot,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaUserCheck,
  FaFingerprint,
  FaKey,
  FaLockOpen,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   3 VIDEO URLS + FEATURE LABELS
   ═══════════════════════════════════════════════════════════════ */
const BRAND_VIDEOS = [
  {
    src: "https://cdn.dribbble.com/userupload/47478501/file/6a538eccbf2ae8c66a020e9e6b613271.mp4",
    tag: "4K Resolution",
    title: "SEEDANCE 2.0 4K",
    desc: "The world's most capable video model at full 4K",
  },
  {
    src: "https://cdn.dribbble.com/userupload/45770786/file/0c40faecdfcdaffc80d81d0f074226f2.mp4",
    tag: "Nano Banana Pro",
    title: "NANO BANANA PRO",
    desc: "Smart AI photo generation and editing",
  },
  {
    src: "https://cdn.dribbble.com/userupload/48389236/file/2a2f6dc334fbf581ba7f5b5d9253f88f.mp4",
    tag: "Higgsfield Soul",
    title: "HIGGSFIELD SOUL",
    desc: "Create lifelike portraits in seconds",
  },
];

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
   FONTS + THEME TOKENS — Logo gradient (#F7941D → #ED6E1F → #D4521A)
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
 <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .auth-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    /* ══════════════════════════════════════════════════════════
       LOGO GRADIENT — signature diagonal (135deg)
       light amber (top-left) → mid orange → deep burnt (bottom-right)
       ══════════════════════════════════════════════════════════ */
    :root {
      --brand-grad-start: #F7941D;
      --brand-grad-mid:   #ED6E1F;
      --brand-grad-end:   #D4521A;
      --brand-grad:       linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%);
    }

    /* ── DARK THEME ── */
    html.theme-dark, .theme-dark {
      --hf-backdrop:      rgba(0,0,0,0.65);
      --hf-shell:         #1A1A1E;
      --hf-shell-2:       #212127;
      --hf-panel:         #23232A;
      --hf-panel-soft:    #26262E;
      --hf-line:          rgba(255,255,255,0.06);
      --hf-line-str:      rgba(255,255,255,0.10);
      --hf-txt:           #FFFFFF;
      --hf-txt-soft:      rgba(255,255,255,0.65);
      --hf-txt-faint:     rgba(255,255,255,0.42);
      --hf-btn-bg:        transparent;
      --hf-btn-bg-hover:  rgba(255,255,255,0.04);
      --hf-btn-border:    rgba(255,255,255,0.14);
      --hf-btn-border-hover: rgba(255,255,255,0.32);

      --hf-amber:         #ED6E1F;
      --hf-amber-soft:    rgba(237,110,31,0.14);
      --hf-amber-border:  rgba(237,110,31,0.42);
      --hf-amber-txt:     #ED6E1F;
      --hf-amber-glow:    rgba(237,110,31,0.42);
      --hf-amber-dark:    #0A0A12;

      --hf-danger:        #FF6B6B;
      --hf-danger-soft:   rgba(255,107,107,0.10);
      --hf-success:       #4ADE80;
      --hf-success-soft:  rgba(74,222,128,0.10);
      --hf-logo-bg:       #ED6E1F;
      --hf-logo-txt:      #FFFFFF;
      --hf-close-bg:      rgba(255,255,255,0.08);
      --hf-close-bg-hov:  rgba(255,255,255,0.16);
    }

    /* ── LIGHT THEME ── */
    html.theme-light, .theme-light {
      --hf-backdrop:      rgba(0,0,0,0.45);
      --hf-shell:         #FFFFFF;
      --hf-shell-2:       #FAFAFB;
      --hf-panel:         #FFFFFF;
      --hf-panel-soft:    #F6F7F9;
      --hf-line:          rgba(20,20,30,0.08);
      --hf-line-str:      rgba(20,20,30,0.14);
      --hf-txt:           #0F1115;
      --hf-txt-soft:      rgba(15,17,21,0.65);
      --hf-txt-faint:     rgba(15,17,21,0.42);
      --hf-btn-bg:        #FFFFFF;
      --hf-btn-bg-hover:  #F6F7F9;
      --hf-btn-border:    rgba(20,20,30,0.12);
      --hf-btn-border-hover: rgba(20,20,30,0.24);

      --hf-amber:         #D4521A;
      --hf-amber-soft:    rgba(212,82,26,0.12);
      --hf-amber-border:  rgba(212,82,26,0.42);
      --hf-amber-txt:     #B24712;
      --hf-amber-glow:    rgba(212,82,26,0.35);
      --hf-amber-dark:    #0A0A12;

      --hf-danger:        #DC2626;
      --hf-danger-soft:   rgba(220,38,38,0.08);
      --hf-success:       #16A34A;
      --hf-success-soft:  rgba(22,163,74,0.10);
      --hf-logo-bg:       #D4521A;
      --hf-logo-txt:      #FFFFFF;
      --hf-close-bg:      rgba(20,20,30,0.06);
      --hf-close-bg-hov:  rgba(20,20,30,0.12);
    }

    .hf-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      background: var(--hf-btn-bg);
      color: var(--hf-txt);
      border: 1px solid var(--hf-btn-border);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: -0.005em;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
      line-height: 1.25;
      text-align: center;
      white-space: normal;
      word-break: break-word;
      height: auto;
      min-height: 40px;
    }
    .hf-btn:hover:not(:disabled) {
      background: var(--hf-btn-bg-hover);
      border-color: var(--hf-btn-border-hover);
    }
    .hf-btn:active:not(:disabled) { transform: scale(0.99); }
    .hf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .hf-btn svg { flex-shrink: 0; }

    /* ⭐ Business email button — full logo gradient fill */
    .hf-btn--amber {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      border-color: transparent !important;
      color: #FFFFFF !important;
      font-weight: 700;
      box-shadow: 0 6px 20px -8px rgba(237,110,31,0.45);
    }
    .hf-btn--amber:hover:not(:disabled) {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
      border-color: transparent !important;
      filter: brightness(1.06);
      box-shadow: 0 8px 26px -8px rgba(237,110,31,0.55);
    }
    .hf-btn--amber:focus,
    .hf-btn--amber:focus-visible {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
      border-color: transparent !important;
    }

    /* ⭐ Primary submit — full logo gradient */
    .hf-btn--primary {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      border-color: transparent !important;
      color: #FFFFFF !important;
      font-weight: 800;
      box-shadow: 0 6px 20px -8px rgba(237,110,31,0.45);
    }
    .hf-btn--primary:hover:not(:disabled) {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
      border-color: transparent !important;
      filter: brightness(1.06);
      box-shadow: 0 8px 26px -8px rgba(237,110,31,0.55);
    }
    .hf-btn--primary:focus,
    .hf-btn--primary:focus-visible {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
      border-color: transparent !important;
    }

    /* ═══════ MOBILE PILL BUTTONS ═══════ */
    .hf-mob-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 999px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: -0.005em;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform 0.12s ease, filter 0.15s ease, background 0.15s ease;
      line-height: 1.25;
      text-align: center;
      white-space: normal;
      word-break: break-word;
      height: auto;
      min-height: 44px;
    }
    .hf-mob-btn:active:not(:disabled) { transform: scale(0.98); }
    .hf-mob-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .hf-mob-btn svg { flex-shrink: 0; }

    .hf-mob-btn--white {
      background: #FFFFFF;
      color: #0A0A12;
      box-shadow: 0 6px 20px -10px rgba(0,0,0,0.45);
    }
    .hf-mob-btn--white:hover:not(:disabled) {
      filter: brightness(0.97);
    }

    .hf-mob-btn--ghost {
      background: rgba(20,20,22,0.55);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.14);
      backdrop-filter: blur(12px) saturate(120%);
      -webkit-backdrop-filter: blur(12px) saturate(120%);
      font-weight: 600;
      box-shadow: 0 6px 20px -10px rgba(0,0,0,0.4);
    }
    .hf-mob-btn--ghost:hover:not(:disabled) {
      background: rgba(20,20,22,0.7);
    }

    /* ⭐ Mobile amber CTA — full logo gradient */
    .hf-mob-btn--amber {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
      font-weight: 800;
      box-shadow: 0 8px 22px -10px rgba(237,110,31,0.55);
    }
    .hf-mob-btn--amber:hover:not(:disabled) {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
      filter: brightness(1.06);
    }
    .hf-mob-btn--amber:focus,
    .hf-mob-btn--amber:focus-visible {
      background: var(--brand-grad) !important;
      background-image: var(--brand-grad) !important;
      color: #FFFFFF !important;
    }

    .hf-input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border-radius: 8px;
      background: var(--hf-panel-soft);
      color: var(--hf-txt);
      border: 1px solid var(--hf-line);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12.5px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .hf-input::placeholder { color: var(--hf-txt-faint); }
    .hf-input:focus {
      border-color: #ED6E1F;
      box-shadow: 0 0 0 3px rgba(237,110,31,0.18);
    }

    .hf-input-mob {
      width: 100%;
      padding: 12px 14px 12px 40px;
      border-radius: 12px;
      background: rgba(20,20,22,0.55);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.16);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 16px; /* ⭐ 16px prevents iOS Safari auto-zoom on focus */
      outline: none;
      backdrop-filter: blur(12px) saturate(120%);
      -webkit-backdrop-filter: blur(12px) saturate(120%);
      transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
      line-height: 1.3;
    }
    .hf-input-mob::placeholder { color: rgba(255,255,255,0.5); }
    .hf-input-mob:focus {
      border-color: #ED6E1F;
      background: rgba(20,20,22,0.7);
      box-shadow: 0 0 0 3px rgba(237,110,31,0.28);
    }

    .hf-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1.5px solid var(--hf-line-str);
      background: rgba(255,255,255,0.06);
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
      flex-shrink: 0;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .hf-checkbox:checked {
      background: var(--brand-grad);
      border-color: transparent;
    }
    .hf-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 1.5px;
      width: 5px;
      height: 9px;
      border: solid #FFFFFF;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .hf-scroll::-webkit-scrollbar { width: 6px; }
    .hf-scroll::-webkit-scrollbar-track { background: transparent; }
    .hf-scroll::-webkit-scrollbar-thumb {
      background: var(--hf-line-str); border-radius: 3px;
    }

    .hf-noscroll::-webkit-scrollbar { display: none; }
    .hf-noscroll { -ms-overflow-style: none; scrollbar-width: none; }

    @keyframes hf-shimmer {
      0% { transform: translateX(-150%) skewX(-16deg); }
      100% { transform: translateX(450%) skewX(-16deg); }
    }

    /* ═══════ BLACK BACKDROP BLUR OVERLAY (mobile) ═══════ */
    .hf-mob-backdrop {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(0,0,0,0.55) 0%,
        rgba(0,0,0,0.65) 30%,
        rgba(0,0,0,0.78) 60%,
        rgba(0,0,0,0.92) 100%
      );
      backdrop-filter: blur(14px) saturate(115%);
      -webkit-backdrop-filter: blur(14px) saturate(115%);
      z-index: 8;
      pointer-events: none;
    }

    /* ⭐ PASSKEY SETUP ANIMATIONS */
    @keyframes pk-pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes pk-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pk-orbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pk-scan {
      0% { transform: translateY(-100%); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(100%); opacity: 0; }
    }
    @keyframes pk-ring-glow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    .pk-pulse-1 { animation: pk-pulse 2.4s ease-out infinite; }
    .pk-pulse-2 { animation: pk-pulse 2.4s ease-out infinite; animation-delay: 0.6s; }
    .pk-pulse-3 { animation: pk-pulse 2.4s ease-out infinite; animation-delay: 1.2s; }
    .pk-float { animation: pk-float 3.5s ease-in-out infinite; }
    .pk-orbit-slow { animation: pk-orbit 12s linear infinite; }
    .pk-orbit-med { animation: pk-orbit 9s linear infinite reverse; }
    .pk-scan { animation: pk-scan 2.4s ease-in-out infinite; }
    .pk-ring-glow { animation: pk-ring-glow 2.4s ease-in-out infinite; }

    /* ⭐ MOBILE SAFE-AREA + SCROLL ENHANCEMENTS */
    @media (max-width: 1023px) {
      .hf-mob-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
      }
      .hf-mob-close {
        top: max(12px, env(safe-area-inset-top, 0px)) !important;
        right: max(12px, env(safe-area-inset-right, 0px)) !important;
      }
      .hf-mob-content {
        padding-top: calc(env(safe-area-inset-top, 0px) + 60px) !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 70px) !important;
        padding-left: max(16px, env(safe-area-inset-left, 0px)) !important;
        padding-right: max(16px, env(safe-area-inset-right, 0px)) !important;
      }
    }

    /* Tiny phones (Galaxy Fold, iPhone SE 1st gen) */
    @media (max-width: 360px) {
      .hf-mob-btn {
        padding: 10px 14px;
        font-size: 12.5px;
        min-height: 40px;
      }
      .hf-mob-btn svg { flex-shrink: 0; }
      .hf-input-mob {
        padding: 10px 12px 10px 36px;
        font-size: 16px;
      }
      .hf-btn {
        padding: 9px 12px;
        font-size: 12px;
        min-height: 38px;
      }
    }

    /* Landscape phones — reduce vertical spacing */
    @media (max-height: 500px) and (max-width: 1023px) {
      .hf-mob-content {
        padding-top: calc(env(safe-area-inset-top, 0px) + 44px) !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px) !important;
      }
    }
  `}</style>
);

// ═══ BULLETPROOF LOGO ═══
const LogoImage = ({ className = "h-full w-full object-contain p-1" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="h-full w-full flex items-center justify-center font-black text-base rounded-lg"
        style={{ background: "var(--brand-grad)", color: "#FFFFFF" }}>
        A
      </div>
    );
  }
  return (
    <img
      src={sources[idx]}
      alt="APNa Deal"
      className={className}
      onError={() => {
        if (idx < sources.length - 1) setIdx(idx + 1);
        else setFailed(true);
      }}
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ PASSKEY SETUP SCREEN — animated, shown after signup
   ═══════════════════════════════════════════════════════════════ */
const PasskeySetupScreen = ({ onRegister, onSkip, isLoading, error }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[380px] mx-auto flex flex-col items-center"
    >
      {/* Animated fingerprint scanner */}
      <div className="relative mb-6 flex items-center justify-center flex-shrink-0" style={{ width: 160, height: 160 }}>
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full pk-pulse-1"
          style={{ border: "2px solid var(--hf-amber)" }} />
        <span className="absolute inset-0 rounded-full pk-pulse-2"
          style={{ border: "2px solid var(--hf-amber)" }} />
        <span className="absolute inset-0 rounded-full pk-pulse-3"
          style={{ border: "2px solid var(--hf-amber)" }} />

        {/* Outer orbit ring */}
        <svg className="absolute inset-0 pk-orbit-slow" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--hf-amber)"
            strokeWidth="1" strokeDasharray="3 8" opacity="0.5" />
          <circle cx="80" cy="8" r="2.5" fill="var(--hf-amber)" />
        </svg>

        {/* Middle orbit ring */}
        <svg className="absolute inset-0 pk-orbit-med" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="58" fill="none" stroke="var(--hf-amber)"
            strokeWidth="1" strokeDasharray="2 6" opacity="0.35" />
          <circle cx="80" cy="22" r="2" fill="var(--hf-amber)" />
        </svg>

        {/* Center circle — floating */}
        <div className="relative h-24 w-24 rounded-full pk-float flex items-center justify-center"
          style={{
            background: "var(--brand-grad)",
            boxShadow: "0 16px 40px -12px rgba(237,110,31,0.55), 0 0 0 6px rgba(237,110,31,0.14)",
          }}>
          <FaFingerprint className="text-white" style={{ fontSize: 42 }} />

          {/* Scan line */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-1 pk-scan"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }} />
          </div>
        </div>

        {/* Corner accents */}
        <span className="absolute top-2 left-2 h-3.5 w-3.5 border-t-2 border-l-2 rounded-tl-lg pk-ring-glow"
          style={{ borderColor: "var(--hf-amber)" }} />
        <span className="absolute top-2 right-2 h-3.5 w-3.5 border-t-2 border-r-2 rounded-tr-lg pk-ring-glow"
          style={{ borderColor: "var(--hf-amber)" }} />
        <span className="absolute bottom-2 left-2 h-3.5 w-3.5 border-b-2 border-l-2 rounded-bl-lg pk-ring-glow"
          style={{ borderColor: "var(--hf-amber)" }} />
        <span className="absolute bottom-2 right-2 h-3.5 w-3.5 border-b-2 border-r-2 rounded-br-lg pk-ring-glow"
          style={{ borderColor: "var(--hf-amber)" }} />
      </div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="font-black tracking-tight text-center mb-2"
        style={{ color: "var(--hf-txt)", fontSize: "clamp(20px, 3.5vw, 26px)", letterSpacing: "-0.02em" }}
      >
        Set up your passkey
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-[12.5px] leading-relaxed mb-6 max-w-[300px]"
        style={{ color: "var(--hf-txt-soft)" }}
      >
        Sign in next time with just your <strong style={{ color: "var(--hf-txt)" }}>Face ID, fingerprint, or PIN</strong> — no password needed. Safer and faster.
      </motion.p>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full space-y-2 mb-6 max-w-[300px]"
      >
        {[
          { icon: FaShieldAlt, text: "Phishing-proof security" },
          { icon: FaKey, text: "No passwords to remember" },
          { icon: FaLockOpen, text: "1-tap sign-in on all your devices" },
        ].map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg"
              style={{ background: "var(--hf-panel-soft)", border: "1px solid var(--hf-line)" }}
            >
              <div className="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--hf-amber-soft)" }}>
                <Icon className="text-[11px]" style={{ color: "var(--hf-amber)" }} />
              </div>
              <span className="text-[12px] font-semibold" style={{ color: "var(--hf-txt)" }}>{b.text}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="w-full max-w-[300px] mb-3 p-2.5 rounded-lg flex items-start gap-2 text-[11.5px] font-semibold overflow-hidden"
            style={{
              background: "var(--hf-danger-soft)",
              color: "var(--hf-danger)",
            }}
          >
            <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
            <span className="flex-1 break-words">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-[300px] flex flex-col gap-2.5"
      >
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          type="button"
          onClick={onRegister}
          disabled={isLoading}
          className="hf-btn hf-btn--primary"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin text-[12px]" />
              Setting up passkey...
            </>
          ) : (
            <>
              <FaFingerprint className="text-[14px]" />
              Create Passkey
            </>
          )}
        </motion.button>

        <button
          type="button"
          onClick={onSkip}
          disabled={isLoading}
          className="text-[12px] font-semibold transition-opacity hover:opacity-70 py-1.5"
          style={{ color: "var(--hf-txt-soft)" }}
        >
          Skip for now
        </button>
      </motion.div>

      {/* Footer */}
      <p className="mt-5 text-[10px] text-center max-w-[280px]"
        style={{ color: "var(--hf-txt-faint)" }}>
        You can always set up a passkey later from <strong>Settings → Security</strong>
      </p>
    </motion.div>
  );
};

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showForm, setShowForm] = useState(false);

  /* ⭐ NEW — passkey setup phase after successful signup */
  const [phase, setPhase] = useState('form'); // 'form' | 'passkey' | 'done'
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
const { user, loading: authLoading, signUp, signInWithGoogle, signInWithGitHub, registerPasskey, isPasskeySupported } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const videoRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  // ⭐ If user is already signed in (and hasn't just signed up), redirect away
  useEffect(() => {
    if (authLoading) return;
    if (user && phase === 'form') {
      navigate('/feed', { replace: true });
    }
  }, [user, authLoading, phase, navigate]);

  useEffect(() => { setVideoError(false); }, [currentVideoIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleVideoEnd = () => goToNextVideo();
  const handleVideoError = () => {
    setVideoError(true);
    setTimeout(() => goToNextVideo(), 1000);
  };

  const navigateVideo = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setVideoError(false);
    const newIndex = direction === 'next'
      ? (currentVideoIndex + 1) % BRAND_VIDEOS.length
      : (currentVideoIndex - 1 + BRAND_VIDEOS.length) % BRAND_VIDEOS.length;
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentVideoIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 250);
  };
  const goToNextVideo = () => navigateVideo('next');
  const goToPrevVideo = () => navigateVideo('prev');

  const checkPasswordStrength = (pass) => {
    let score = 0;
    let feedback = [];
    if (!pass) {
      return { score: 0, strength: 'Empty', color: 'var(--hf-panel-soft)', textColor: 'var(--hf-txt-soft)', feedback: [], percent: 0 };
    }
    if (pass.length >= 8) score++; else feedback.push('At least 8 characters');
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++; else feedback.push('Mix of uppercase and lowercase');
    if (/\d/.test(pass)) score++; else feedback.push('At least one number');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++; else feedback.push('At least one special character');

    const strengths = [
      { label: 'Weak',   color: 'var(--hf-danger)',  textColor: 'var(--hf-danger)',  icon: FaTimesCircle,         iconColor: 'var(--hf-danger)' },
      { label: 'Fair',   color: 'var(--hf-danger)',  textColor: 'var(--hf-danger)',  icon: FaExclamationTriangle, iconColor: 'var(--hf-danger)' },
      { label: 'Good',   color: 'var(--hf-amber)',   textColor: 'var(--hf-amber-txt)', icon: FaCheckCircle,       iconColor: 'var(--hf-amber)' },
      { label: 'Strong', color: 'var(--hf-success)', textColor: 'var(--hf-success)', icon: FaCheckCircle,         iconColor: 'var(--hf-success)' },
    ];
    let strengthIndex = 0;
    if (score >= 4) strengthIndex = 3;
    else if (score >= 3) strengthIndex = 2;
    else if (score >= 2) strengthIndex = 1;
    else if (score >= 1) strengthIndex = 0;
    return {
      score,
      strength: strengths[strengthIndex].label,
      color: strengths[strengthIndex].color,
      textColor: strengths[strengthIndex].textColor,
      icon: strengths[strengthIndex].icon,
      iconColor: strengths[strengthIndex].iconColor,
      feedback,
      percent: (score / 4) * 100,
    };
  };
  const passwordStrength = checkPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    setError(''); setErrorType(''); setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) { setError(error); setErrorType('auth_error'); }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally { setLoading(false); }
  };

  const handleGitHubSignIn = async () => {
    setError(''); setErrorType(''); setLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) { setError(error); setErrorType('auth_error'); }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setErrorType(''); setSuccess('');

    if (!fullName.trim()) { setError('Please enter your full name.'); setErrorType('name_required'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); setErrorType('email_required'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError('Please enter a valid email address.'); setErrorType('email_invalid'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setErrorType('password_short'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); setErrorType('password_mismatch'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service.'); setErrorType('terms_required'); return; }

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, fullName);
      if (error) { setError(error); setErrorType('auth_error'); }
      else {
        setSuccess('Account created! Now let\'s secure it with a passkey.');

        /* ⭐ Move to passkey setup phase */
        setTimeout(() => {
          setPhase('passkey');
        }, 600);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    }
    setLoading(false);
  };

  /* ⭐ Register passkey (called from PasskeySetupScreen) */
  const handleRegisterPasskey = async () => {
    setPasskeyError('');
    setPasskeyLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPasskeyError('Session not ready yet. Please try again in a moment.');
        setPasskeyLoading(false);
        return;
      }

      const result = await registerPasskey();
      if (result?.error) {
        setPasskeyError(result.error);
      } else {
        setPhase('done');
        setTimeout(() => navigate('/feed'), 1800);
      }
    } catch (err) {
      setPasskeyError(err?.message || 'Failed to register passkey. Please try again.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSkipPasskey = () => {
    setPhase('done');
    setTimeout(() => navigate('/signin'), 800);
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'name_required': return <FaUser className="flex-shrink-0" />;
      case 'email_required':
      case 'email_invalid': return <FaEnvelope className="flex-shrink-0" />;
      case 'password_required':
      case 'password_short':
      case 'password_mismatch': return <FaLock className="flex-shrink-0" />;
      case 'verification_required': return <FaShieldAlt className="flex-shrink-0" />;
      case 'auth_error': return <FaExclamationTriangle className="flex-shrink-0" />;
      default: return <FaInfoCircle className="flex-shrink-0" />;
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 24 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 26, stiffness: 260 } },
    exit: { opacity: 0, scale: 0.94, y: 24, transition: { duration: 0.2 } },
  };
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  const currentVideo = BRAND_VIDEOS[currentVideoIndex];
// ⭐ Guard — spinner while checking auth OR redirect signed-in users on the form phase
if (authLoading || (user && phase === 'form')) {
  return (
    <div
      className={`fixed inset-0 w-screen h-screen flex items-center justify-center theme-${theme} auth-font`}
      style={{ background: "var(--hf-shell)" }}
    >
      <FontStyles />
      <FaSpinner
        className="animate-spin text-xl"
        style={{ color: "#ED6E1F" }}
      />
    </div>
  );
}
  /* ⭐ DONE PHASE — success confirmation */
  if (phase === 'done') {
    return (
      <>
        <FontStyles />
        <div className={`fixed inset-0 w-screen h-screen flex items-center justify-center theme-${theme} auth-font`}
          style={{
            background: "var(--hf-shell)",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="text-center px-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
              className="h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: "var(--brand-grad)",
                boxShadow: "0 16px 40px -12px rgba(237,110,31,0.55)",
              }}
            >
              <FaCheckCircle className="text-white" style={{ fontSize: 30 }} />
            </motion.div>
            <h2 className="font-black tracking-tight mb-2"
              style={{ color: "var(--hf-txt)", fontSize: 22 }}>
              You're all set!
            </h2>
            <p style={{ color: "var(--hf-txt-soft)", fontSize: 13 }}>
              Redirecting...
            </p>
          </motion.div>
        </div>
      </>
    );
  }

  /* ⭐ PASSKEY PHASE — animated setup screen */
  if (phase === 'passkey') {
    return (
      <>
        <FontStyles />
        <div className={`fixed inset-0 w-screen h-screen flex flex-col theme-${theme} auth-font overflow-y-auto hf-mob-scroll`}
          style={{
            background: "var(--hf-shell)",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}>
          <div className="min-h-full flex items-center justify-center px-5 sm:px-6 py-8 sm:py-10">
            <PasskeySetupScreen
              onRegister={handleRegisterPasskey}
              onSkip={handleSkipPasskey}
              isLoading={passkeyLoading}
              error={passkeyError}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FontStyles />
      <div
        className={`fixed inset-0 w-screen h-screen flex theme-${theme} auth-font`}
        style={{ background: "var(--hf-shell)" }}
      >
        {/* ═══════════════════════════════════════════════════
            DESKTOP — Split panel
           ═══════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-shrink-0"
          style={{ background: "#0A0A12" }}
        >
          <AnimatePresence mode="wait">
            {!videoError ? (
              <motion.video
                key={currentVideoIndex}
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src={currentVideo.src}
                autoPlay muted playsInline preload="auto"
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            ) : (
              <motion.div
                key="fallback"
                className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background:
                    "radial-gradient(900px 500px at 20% 0%, rgba(237,110,31,0.15), transparent 60%), linear-gradient(180deg, #0A0A12 0%, #14141A 100%)",
                }}
              />
            )}
          </AnimatePresence>

          <div className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)",
            }}
          />

          <motion.button
            onClick={goToPrevVideo}
            disabled={isTransitioning}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Previous video"
          >
            <FaChevronLeft className="text-[10px]" />
          </motion.button>
          <motion.button
            onClick={goToNextVideo}
            disabled={isTransitioning}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Next video"
          >
            <FaChevronRight className="text-[10px]" />
          </motion.button>

          <div className="absolute inset-x-0 bottom-0 z-10 p-8 lg:p-12">
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              <FaCloud className="text-[9px]" />
              {currentVideo.tag}
            </div>

            <h3 className="text-white font-black tracking-tight leading-[1.05] mb-2"
              style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
            >
              {currentVideo.title}
            </h3>

            <p className="text-white/70 text-[13px] font-medium leading-snug mb-6 max-w-[420px]">
              {currentVideo.desc}
            </p>

            <div className="flex items-center gap-2">
              {BRAND_VIDEOS.map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i === currentVideoIndex || isTransitioning) return;
                    setIsTransitioning(true);
                    setVideoError(false);
                    setTimeout(() => {
                      setCurrentVideoIndex(i);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }, 250);
                  }}
                  className="flex-1 h-1 rounded-full transition-all"
                  style={{
                    background: i === currentVideoIndex ? "#FFFFFF" : "rgba(255,255,255,0.28)",
                    maxWidth: 40,
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            DESKTOP — Form panel
           ═══════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:flex-1 relative hf-scroll overflow-y-auto"
          style={{ background: "var(--hf-shell)" }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "var(--hf-close-bg)", color: "var(--hf-txt)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hf-close-bg-hov)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--hf-close-bg)"; }}
            aria-label="Close"
          >
            <FaTimes className="text-[11px]" />
          </button>

          <div className="min-h-full flex items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 w-full">
            <div className="w-full max-w-[380px] flex flex-col">

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="flex justify-center mb-2"
              >
                <div className="h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden"
                >
                  <LogoImage />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="text-center mb-3"
              >
                <h2 className="font-black tracking-tight mb-1.5"
                  style={{ color: "var(--hf-txt)", fontSize: "clamp(22px, 2.5vw, 30px)", letterSpacing: "-0.02em" }}
                >
                  Sign Up 
                </h2>
                <p className="text-[12.5px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                  Start buying and selling in seconds
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-2.5 p-2.5 rounded-lg flex items-start gap-2 overflow-hidden text-[11.5px] font-semibold"
                    style={{
                      background: "var(--hf-danger-soft)",
                      color: "var(--hf-danger)",
                      border: "1px solid transparent",
                    }}
                  >
                    {getErrorIcon(errorType)}
                    <span className="flex-1 break-words">{error}</span>
                    <button onClick={() => { setError(''); setErrorType(''); }}
                      className="opacity-60 hover:opacity-100 flex-shrink-0"
                      aria-label="Dismiss error"
                    >
                      <FaTimes className="text-[9px]" />
                    </button>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-2.5 p-2.5 rounded-lg flex items-center gap-2 overflow-hidden text-[11.5px] font-semibold"
                    style={{ background: "var(--hf-success-soft)", color: "var(--hf-success)" }}
                  >
                    <FaCheckCircle className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth buttons */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2"
              >
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={() => { setFullName(''); document.querySelector('input[type="text"]')?.focus(); }}
                  className="hf-btn hf-btn--amber"
                >
                  <FaGift className="text-[12px]" />
                  Sign up with business email & Get 50 credits
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="hf-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C40.9 35.7 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
                  </svg>
                  Continue with Google
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                  className="hf-btn"
                >
                  <FaGithub className="text-[16px]" />
                  Continue with GitHub
                </motion.button>

                <motion.div variants={itemVariants} className="flex items-center gap-3 my-1.5">
                  <div className="flex-1 h-px" style={{ background: "var(--hf-line-str)" }} />
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: "var(--hf-txt-faint)" }}>
                    OR
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--hf-line-str)" }} />
                </motion.div>
              </motion.div>

              <div className="my-4 h-px" style={{ background: "var(--hf-line)" }} />

              {/* Form */}
              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="flex flex-col gap-2.5"
              >
                {/* Full Name */}
                <motion.div variants={itemVariants} className="relative">
                  <FaUser
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(''); }}
                    required
                    placeholder="Full name"
                    className="hf-input"
                    autoComplete="name"
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="relative">
                  <FaEnvelope
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    placeholder="you@example.com"
                    className="hf-input"
                    autoComplete="email"
                    spellCheck={false}
                  />
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="relative">
                  <FaLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    placeholder="Password (min 8 characters)"
                    className="hf-input"
                    style={{ paddingRight: 38 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash className="text-[12px]" /> : <FaEye className="text-[12px]" />}
                  </button>
                </motion.div>

                {/* Password strength */}
                <AnimatePresence>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--hf-panel-soft)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.percent}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: passwordStrength.color }}
                          />
                        </div>
                        <span
                          className="text-[9.5px] font-bold flex items-center gap-1"
                          style={{ color: passwordStrength.textColor }}
                        >
                          <passwordStrength.icon className="text-[10px]" style={{ color: passwordStrength.iconColor }} />
                          {passwordStrength.strength}
                        </span>
                      </div>

                      {passwordStrength.feedback.length > 0 && passwordStrength.score < 4 && (
                        <div className="flex flex-col gap-0.5">
                          {passwordStrength.feedback.map((msg, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-1.5 text-[9.5px]"
                              style={{ color: "var(--hf-txt-faint)" }}
                            >
                              <span style={{ color: "var(--hf-amber-txt)" }}>•</span>
                              {msg}
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {passwordStrength.score >= 4 && (
                        <div className="flex items-center gap-1.5 text-[9.5px] font-bold" style={{ color: "var(--hf-success)" }}>
                          <FaCheckCircle />
                          <span>Great password! Strong and secure.</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="relative">
                  <FaLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    required
                    placeholder="Confirm password"
                    className="hf-input"
                    style={{ paddingRight: 38 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-[12px]" /> : <FaEye className="text-[12px]" />}
                  </button>
                </motion.div>

                <AnimatePresence>
                  {confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-1.5 text-[9.5px] font-bold"
                      style={{
                        color: password === confirmPassword ? "var(--hf-success)" : "var(--hf-danger)",
                      }}
                    >
                      {password === confirmPassword ? (
                        <><FaCheckCircle /><span>Passwords match</span></>
                      ) : (
                        <><FaTimesCircle /><span>Passwords do not match</span></>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Terms */}
                <motion.label variants={itemVariants} className="flex items-start gap-2 mt-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hf-checkbox mt-0.5"
                    checked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setError(''); }}
                  />
                  <span className="text-[11px] leading-relaxed" style={{ color: "var(--hf-txt-soft)" }}>
                    I agree to the{' '}
                    <Link to="/terms" className="font-semibold underline underline-offset-2"
                      style={{ color: "var(--hf-txt)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="font-semibold underline underline-offset-2"
                      style={{ color: "var(--hf-txt)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </motion.label>

                {/* Submit */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading || !agreed}
                  className="hf-btn hf-btn--primary mt-1.5"
                >
                  {loading ? (
                    <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <FaArrowRight className="text-[10px]" />
                    </>
                  )}
                </motion.button>
              </motion.form>

              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-center text-[11.5px] mt-4"
                style={{ color: "var(--hf-txt-soft)" }}
              >
                Already have an account?{' '}
                <Link to="/signin" className="font-bold transition-opacity hover:opacity-80"
                  style={{ color: "var(--hf-amber-txt)" }}
                >
                  Sign in
                </Link>
              </motion.p>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-5 pt-4 border-t flex items-center justify-center gap-2 text-[10.5px]"
                style={{ borderColor: "var(--hf-line)", color: "var(--hf-txt-faint)" }}
              >
                <FaCloud className="text-[10px]" />
                SSO available on{' '}
                <a href="#" className="underline underline-offset-2 font-semibold"
                  style={{ color: "var(--hf-txt-soft)" }}
                >
                  Scale
                </a>
                {' '}and{' '}
                <a href="#" className="underline underline-offset-2 font-semibold"
                  style={{ color: "var(--hf-txt-soft)" }}
                >
                  Enterprise
                </a>
                {' '}plans
              </motion.div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            MOBILE — Video + black backdrop blur + form
           ═══════════════════════════════════════════════════ */}
        <div className="lg:hidden absolute inset-0 flex flex-col" style={{ background: "#0A0A12" }}>

          {/* Background video */}
          <AnimatePresence mode="wait">
            {!videoError ? (
              <motion.video
                key={`mob-${currentVideoIndex}`}
                className="absolute inset-0 w-full h-full object-cover"
                src={currentVideo.src}
                autoPlay muted playsInline preload="auto"
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            ) : (
              <motion.div
                key="mob-fallback"
                className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background:
                    "radial-gradient(700px 500px at 20% 0%, rgba(237,110,31,0.22), transparent 60%), linear-gradient(180deg, #0A0A12 0%, #1A0A2E 100%)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Black backdrop blur overlay */}
          <div className="hf-mob-backdrop" aria-hidden="true" />

          {/* Close (X) button top-right — respects safe area */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute z-30 h-9 w-9 rounded-full flex items-center justify-center hf-mob-close"
            style={{
              top: 12,
              right: 12,
              background: "rgba(20,20,22,0.6)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#FFFFFF",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
            }}
            aria-label="Close"
          >
            <FaTimes className="text-[13px]" />
          </button>

          {/* Content — single scroll container */}
          <div
            className="relative z-20 flex-1 overflow-y-auto hf-mob-scroll hf-mob-content"
            style={{
              paddingTop: 64,
              paddingBottom: 70,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <div className="flex flex-col justify-center min-h-full py-4">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-4"
              >
                <div className="h-16 w-16 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  <LogoImage />
                </div>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-center mb-5 flex flex-col items-center px-2"
              >
                <h1
                  className="font-black tracking-tight leading-[1.05]"
                  style={{
                    fontSize: "clamp(22px, 7vw, 32px)",
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 55%, #ED6E1F 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    filter: "drop-shadow(0 2px 20px rgba(0,0,0,0.55))",
                  }}
                >
                  Sign Up
                </h1>

                <p
                  className="mt-1.5 text-[12px] font-medium"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  Join APNa Deal in just a few seconds
                </p>
              </motion.div>

              {/* Error / success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-2.5 p-2.5 rounded-2xl flex items-start gap-2 overflow-hidden text-[11.5px] font-semibold"
                    style={{
                      background: "rgba(255,107,107,0.18)",
                      color: "#FFB4B4",
                      border: "1px solid rgba(255,107,107,0.35)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    {getErrorIcon(errorType)}
                    <span className="flex-1 break-words">{error}</span>
                    <button onClick={() => { setError(''); setErrorType(''); }}
                      className="opacity-60 hover:opacity-100 flex-shrink-0"
                      aria-label="Dismiss error"
                    >
                      <FaTimes className="text-[9px]" />
                    </button>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-2.5 p-2.5 rounded-2xl flex items-center gap-2 overflow-hidden text-[11.5px] font-semibold"
                    style={{
                      background: "rgba(74,222,128,0.15)",
                      color: "#8CFFB8",
                      border: "1px solid rgba(74,222,128,0.3)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <FaCheckCircle className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth buttons */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2.5"
              >
                {/* Google */}
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="hf-mob-btn hf-mob-btn--white"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="flex-shrink-0">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C40.9 35.7 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
                  </svg>
                  Continue with Google
                </motion.button>

                {/* GitHub */}
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                  className="hf-mob-btn hf-mob-btn--white"
                >
                  <FaGithub className="text-[18px] flex-shrink-0" />
                  Continue with GitHub
                </motion.button>

                {/* Continue with email — ghost pill */}
                {!showForm && (
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="hf-mob-btn hf-mob-btn--ghost"
                  >
                    Continue with email
                  </motion.button>
                )}

                {/* Email form (expands inline) */}
                <AnimatePresence>
                  {showForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-2.5 overflow-hidden"
                    >
                      {/* Full Name */}
                      <div style={{ position: "relative", width: "100%" }}>
                        <span style={{
                          position: "absolute", left: 14, top: "50%",
                          transform: "translateY(-50%)", zIndex: 10,
                          color: "rgba(255,255,255,0.7)", pointerEvents: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12,
                        }}>
                          <FaUser />
                        </span>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); setError(''); }}
                          required
                          placeholder="Full name"
                          className="hf-input-mob"
                          autoComplete="name"
                        />
                      </div>

                      {/* Email */}
                      <div style={{ position: "relative", width: "100%" }}>
                        <span style={{
                          position: "absolute", left: 14, top: "50%",
                          transform: "translateY(-50%)", zIndex: 10,
                          color: "rgba(255,255,255,0.7)", pointerEvents: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12,
                        }}>
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          required
                          placeholder="you@example.com"
                          className="hf-input-mob"
                          autoComplete="email"
                          spellCheck={false}
                        />
                      </div>

                      {/* Password */}
                      <div style={{ position: "relative", width: "100%" }}>
                        <span style={{
                          position: "absolute", left: 14, top: "50%",
                          transform: "translateY(-50%)", zIndex: 10,
                          color: "rgba(255,255,255,0.7)", pointerEvents: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12,
                        }}>
                          <FaLock />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(''); }}
                          required
                          placeholder="Password (min 8)"
                          className="hf-input-mob"
                          style={{ paddingRight: 38 }}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute", right: 14, top: "50%",
                            transform: "translateY(-50%)", zIndex: 10,
                            color: "rgba(255,255,255,0.7)", background: "transparent",
                            border: "none", cursor: "pointer", padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FaEyeSlash style={{ fontSize: 12 }} /> : <FaEye style={{ fontSize: 12 }} />}
                        </button>
                      </div>

                      {/* Password strength */}
                      <AnimatePresence>
                        {password && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="flex flex-col gap-1.5 px-1"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.1)" }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${passwordStrength.percent}%` }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: passwordStrength.color }}
                                />
                              </div>
                              <span className="text-[9.5px] font-bold flex items-center gap-1"
                                style={{ color: passwordStrength.textColor }}>
                                <passwordStrength.icon className="text-[10px]" style={{ color: passwordStrength.iconColor }} />
                                {passwordStrength.strength}
                              </span>
                            </div>
                            {passwordStrength.feedback.length > 0 && passwordStrength.score < 4 && (
                              <div className="flex flex-col gap-0.5">
                                {passwordStrength.feedback.map((msg, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-1.5 text-[9.5px]"
                                    style={{ color: "rgba(255,255,255,0.6)" }}
                                  >
                                    <span style={{ color: "#ED6E1F" }}>•</span>
                                    {msg}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Confirm Password */}
                      <div style={{ position: "relative", width: "100%" }}>
                        <span style={{
                          position: "absolute", left: 14, top: "50%",
                          transform: "translateY(-50%)", zIndex: 10,
                          color: "rgba(255,255,255,0.7)", pointerEvents: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12,
                        }}>
                          <FaLock />
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                          required
                          placeholder="Confirm password"
                          className="hf-input-mob"
                          style={{ paddingRight: 38 }}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: "absolute", right: 14, top: "50%",
                            transform: "translateY(-50%)", zIndex: 10,
                            color: "rgba(255,255,255,0.7)", background: "transparent",
                            border: "none", cursor: "pointer", padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <FaEyeSlash style={{ fontSize: 12 }} /> : <FaEye style={{ fontSize: 12 }} />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {confirmPassword && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex items-center gap-1.5 text-[9.5px] font-bold px-1"
                            style={{
                              color: password === confirmPassword ? "#4ADE80" : "#FF6B6B",
                            }}
                          >
                            {password === confirmPassword ? (
                              <><FaCheckCircle /><span>Passwords match</span></>
                            ) : (
                              <><FaTimesCircle /><span>Passwords do not match</span></>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Terms */}
                      <label className="flex items-start gap-2.5 px-1 cursor-pointer">
                        <input
                          type="checkbox"
                          className="hf-checkbox mt-0.5"
                          checked={agreed}
                          onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setError(''); }}
                        />
                        <span className="text-[11.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                          I agree to the{' '}
                          <Link to="/terms" className="font-semibold underline underline-offset-2" style={{ color: "#ED6E1F" }}>
                            Terms
                          </Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="font-semibold underline underline-offset-2" style={{ color: "#ED6E1F" }}>
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading || !agreed}
                        className="hf-mob-btn hf-mob-btn--amber mt-1"
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin text-[12px]" />
                        ) : (
                          <>
                            Create Account
                            <FaArrowRight className="text-[12px]" />
                          </>
                        )}
                      </button>

                      {/* Back to options */}
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="text-center text-[12px] font-semibold mt-0.5 py-1.5"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        ← Back to other options
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Business email promo pill */}
                {!showForm && (
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="hf-mob-btn hf-mob-btn--ghost"
                    style={{
                      background: "rgba(237,110,31,0.18)",
                      borderColor: "rgba(237,110,31,0.45)",
                      color: "#ED6E1F",
                      fontWeight: 700,
                      height: "auto",
                      minHeight: 44,
                      textAlign: "center",
                      lineHeight: 1.3,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    <FaGift className="text-[12px] flex-shrink-0" />
                    <span>Sign up &amp; Get 50 credits</span>
                  </motion.button>
                )}

                {/* Footer links */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-3 mt-4 text-[11.5px]"
                >
                  <Link to="/privacy" className="font-medium transition-opacity hover:opacity-80"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Privacy policy
                  </Link>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
                  <Link to="/terms" className="font-medium transition-opacity hover:opacity-80"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Terms of service
                  </Link>
                </motion.div>

                {/* Sign in link */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-[12px] mt-2.5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Already have an account?{' '}
                  <Link to="/signin" className="font-bold" style={{ color: "#ED6E1F" }}>
                    Sign in
                  </Link>
                </motion.p>

                {/* Video dots */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-2.5 mt-4 mb-1"
                >
                  {BRAND_VIDEOS.map((v, i) => {
                    const isActive = i === currentVideoIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (i === currentVideoIndex || isTransitioning) return;
                          setIsTransitioning(true);
                          setVideoError(false);
                          setTimeout(() => {
                            setCurrentVideoIndex(i);
                            setTimeout(() => setIsTransitioning(false), 300);
                          }, 250);
                        }}
                        className="h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: isActive ? 24 : 7,
                          background: isActive ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                          transform: isActive ? "scaleY(1.15)" : "scaleY(1)",
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;