// pages/Momento.jsx — Seller-tool marketplace feed (product-first)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaNewspaper, FaExclamationTriangle, FaShare, FaPlus,
  FaBookmark, FaSpinner, FaCamera, FaImage, FaUsers, FaFire,
  FaRegBookmark, FaChevronDown, FaHeart, FaRegHeart, FaCommentDots,
  FaPaperPlane, FaTimes, FaDownload, FaExpand, FaFileVideo,
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaEllipsisH,
  FaChartBar, FaDollarSign, FaPoll, FaCheckCircle,FaRocket,
  FaHome, FaBell, FaCog, FaEnvelope, FaUserCog, FaEye,
  FaShoppingCart, FaMapMarkerAlt, FaArrowRight, FaBolt,
  FaExternalLinkAlt, FaClock, FaTag, FaEdit, FaTrash,
  FaCamera as FaCameraSolid, FaChevronRight,
  FaUser,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '../contexts/PlanContext';
import { Video } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const StudyPostsStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-dash { font-family: 'Inter', system-ui, sans-serif; }
    .font-ticket { font-family: 'Manrope', system-ui, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    .theme-dark {
      --sp-bg:          #0A0A12;   /* Navbar dark bg */
      --sp-card:        #14141D;   /* Navbar panel */
      --sp-card-2:      #1A1A24;   /* Navbar panel-2 */
      --sp-line:        rgba(255,255,255,0.08);
      --sp-line-str:    rgba(255,255,255,0.14);
      --sp-txt:         #FFFFFF;
      --sp-txt-soft:    rgba(255,255,255,0.68);
      --sp-txt-faint:   rgba(255,255,255,0.42);
      --sp-primary:     #F58220; /* Light orange from logo */
      --sp-primary-2:   #E26A2C; /* Mid orange from logo */
      --sp-primary-3:   #D35400; /* Deep burnt orange from logo */
      --sp-primary-soft:rgba(242,138,45,0.14);
      --sp-primary-glow:rgba(242,138,45,0.45);
      --sp-primary-dark: #0A0A12;
      --sp-success:     #10B981;
      --sp-success-soft:rgba(16,185,129,0.12);
      --sp-danger:      #EF4444;
      --sp-danger-soft: rgba(239,68,68,0.12);
      --sp-input-bg:    #0E1420;
      --sp-shadow:      0 20px 60px -20px rgba(0,0,0,0.6);
    }

    .theme-light {
      --sp-bg:          #F4F6FB;
      --sp-card:        #FFFFFF;
      --sp-card-2:      #F1F4FB;
      --sp-line:        #E4E9F2;
      --sp-line-str:    #CFD6E4;
      --sp-txt:         #0B1220;
      --sp-txt-soft:    #4B5563;
      --sp-txt-faint:   #94A3B8;
      --sp-primary:     #D35400; /* Deep burnt orange for light mode */
      --sp-primary-2:   #F58220;
      --sp-primary-3:   #E26A2C;
      --sp-primary-soft:rgba(211,84,0,0.10);
      --sp-primary-glow:rgba(211,84,0,0.30);
      --sp-primary-dark: #0A0A12;
      --sp-success:     #059669;
      --sp-success-soft:rgba(5,150,105,0.10);
      --sp-danger:      #DC2626;
      --sp-danger-soft: rgba(220,38,38,0.08);
      --sp-input-bg:    #F1F4FB;
      --sp-shadow:      0 20px 60px -20px rgba(0,0,0,0.10);
    }

    .sp-bg { background: var(--sp-bg); color: var(--sp-txt); }
    .sp-card { background: var(--sp-card); border: 1px solid var(--sp-line); border-radius: 20px; }
    .sp-card-2 { background: var(--sp-card-2); border: 1px solid var(--sp-line); border-radius: 14px; }
    .sp-input { background: var(--sp-input-bg); color: var(--sp-txt); border: 1px solid var(--sp-line); }
    .sp-input::placeholder { color: var(--sp-txt-faint); }
    .sp-input:focus { border-color: var(--sp-primary); outline: none; }

    @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes spFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes spPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--sp-primary); }

    select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

    .sp-story-ring {
      padding: 2px; border-radius: 999px;
      background: conic-gradient(from 180deg, var(--sp-primary), var(--sp-primary-2), var(--sp-primary-3), var(--sp-primary));
    }

    .sp-bottomnav {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-around;
      padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
      background: var(--sp-card);
      border-top: 1px solid var(--sp-line);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    .sp-bottomnav__item {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 4px; border-radius: 14px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 10px; font-weight: 700;
      color: var(--sp-txt-faint);
      text-decoration: none; transition: color 0.15s ease, background 0.15s ease;
    }
    .sp-bottomnav__item svg { font-size: 19px; }
    .sp-bottomnav__item--active { color: var(--sp-primary); background: var(--sp-primary-soft); }

    .sp-bottomnav__center { flex: 1; display: flex; align-items: center; justify-content: center; }
    .sp-bottomnav__center-inner {
      height: 44px; width: 44px; border-radius: 999px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2));
      color: var(--sp-primary-dark);
      box-shadow: 0 12px 24px -10px var(--sp-primary-glow);
      border: 3px solid var(--sp-card);
      transition: transform 0.15s ease;
    }
    .sp-bottomnav__center-inner:active { transform: scale(0.92); }

    @media (min-width: 1024px) { .sp-bottomnav { display: none; } }

    .sp-action-primary {
      background: linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2));
      color: var(--sp-primary-dark);
      font-weight: 800;
      transition: transform 0.15s ease, filter 0.2s ease;
    }
    .sp-action-primary:hover { transform: translateY(-1px); filter: brightness(1.05); }
    .sp-action-primary:active { transform: translateY(0); }

    .sp-action-secondary {
      background: var(--sp-card-2);
      color: var(--sp-txt);
      border: 1px solid var(--sp-line);
      font-weight: 700;
      transition: all 0.15s ease;
    }
    .sp-action-secondary:hover { border-color: var(--sp-primary); color: var(--sp-primary); }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   SNACKBAR
   ═══════════════════════════════════════════════════════════════ */
const FaInfoCircleFallback = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const SnackbarHost = ({ toasts, onDismiss }) => (
  <div
    className="fixed left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none w-full max-w-md"
    style={{
      bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
      paddingLeft: "max(16px, env(safe-area-inset-left, 16px))",
      paddingRight: "max(16px, env(safe-area-inset-right, 16px))",
    }}
  >
    <AnimatePresence>
      {toasts.map((t) => {
        const isError = t.type === "error";
        const isSuccess = t.type === "success";
        const accent = isError ? "#EF4444" : isSuccess ? "#10B981" : "var(--sp-primary)";
        const Icon = isError ? FaExclamationTriangle : isSuccess ? FaCheckCircle : FaInfoCircleFallback;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            onClick={() => onDismiss(t.id)}
            className="pointer-events-auto cursor-pointer select-none rounded-2xl overflow-hidden"
            style={{ background: "var(--sp-card)", border: `1px solid ${accent}` }}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center mt-0.5"
                style={{ background: `${accent}22`, color: accent }}>
                <Icon style={{ fontSize: 12 }} />
              </span>
              <div className="flex-1 min-w-0">
                {t.title && <p className="font-ticket text-[12.5px] font-extrabold" style={{ color: "var(--sp-txt)" }}>{t.title}</p>}
                {t.message && <p className="font-ticket text-[11.5px] mt-0.5" style={{ color: "var(--sp-txt-soft)" }}>{t.message}</p>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }}
                className="flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center" style={{ color: "var(--sp-txt-faint)" }}>
                <FaTimes style={{ fontSize: 10 }} />
              </button>
            </div>
            <motion.div initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
              transition={{ duration: (t.duration || 3200) / 1000, ease: "linear" }}
              style={{ transformOrigin: "left", height: 2, background: accent }} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const getDisplayName = (profile, fallback = 'User') => {
  if (!profile) return fallback;
  return profile.full_name || profile.name || profile.username || profile.email?.split('@')[0] || fallback;
};

const getAvatarUrl = (profile) => {
  if (!profile) return null;
  return profile.avatar_url || profile.avatar || profile.picture || profile.image_url || null;
};

const formatCount = (n) => {
  if (n === null || n === undefined) return '0';
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}K`;
  return `${(n / 1000000).toFixed(2)}M`;
};

const formatPrice = (num) => {
  const n = Number(num) || 0;
  if (n >= 10000000) { const c = n / 10000000; return `Rs.${(c % 1 === 0 ? c.toFixed(0) : c.toFixed(2).replace(/\.?0+$/, ""))} Cr`; }
  if (n >= 100000) { const l = n / 100000; return `Rs.${(l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, ""))} Lac`; }
  return `Rs.${n.toLocaleString("en-US")}`;
};

/* ⭐ Build a shareable URL for a post */
const getPostShareUrl = (postId) => {
  if (!postId) return "";
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/momento?post=${postId}`;
};

/* ═══════════════════════════════════════════════════════════════
   USER AVATAR
   ═══════════════════════════════════════════════════════════════ */
const UserAvatar = ({ user, profile = null, fallbackName = 'U', size = 'h-10 w-10', textSize = 'text-sm', onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const merged = {
    ...(user?.user_metadata ? {
      full_name: user.user_metadata.full_name || user.user_metadata.name,
      avatar_url: user.user_metadata.avatar_url || user.user_metadata.avatar || user.user_metadata.picture,
      email: user.email,
    } : {}),
    ...(user && { name: user.name, full_name: user.full_name || user.name, avatar_url: user.avatar_url, email: user.email }),
    ...(profile || {}),
  };
  const url = getAvatarUrl(merged);
  const name = getDisplayName(merged, fallbackName);
  const initial = (name || 'U').charAt(0).toUpperCase();
  const showImage = url && !imgFailed;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${size} relative rounded-full flex items-center justify-center font-bold overflow-hidden flex-shrink-0 select-none font-ticket ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition' : ''}`}
      style={{ background: showImage ? undefined : `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))`, color: "#fff" }}
    >
      {showImage ? (
        <img src={url} alt={name} className="h-full w-full object-cover" loading="lazy" draggable={false} onError={() => setImgFailed(true)} />
      ) : (
        <span className={textSize}>{initial}</span>
      )}
    </Tag>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GROUP AVATAR
   ═══════════════════════════════════════════════════════════════ */
const GroupAvatar = ({ group, size = 'h-10 w-10', rounded = 'rounded-full' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = group?.image_url || group?.avatar_url || null;
  const name = group?.name || 'G';
  const initial = name.charAt(0).toUpperCase();
  const showImage = url && !imgFailed;
  return (
    <div
      className={`${size} ${rounded} flex items-center justify-center font-bold overflow-hidden font-ticket flex-shrink-0`}
      style={{ background: showImage ? undefined : `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))`, color: "#fff", border: "1px solid var(--sp-line)" }}
    >
      {showImage ? (
        <img src={url} alt={name} className="w-full h-full object-cover" loading="lazy" onError={() => setImgFailed(true)} />
      ) : initial}
    </div>
  );
};



/* ═══════════════════════════════════════════════════════════════
   LANDING SCREEN — shown first, click CTA to enter the app
   ═══════════════════════════════════════════════════════════════ */
const OnboardingScreen = ({ onComplete }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.documentElement.classList.contains("theme-dark");
  });

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("theme-dark"));
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={`min-h-screen w-full flex flex-col relative overflow-hidden theme-${isDark ? "dark" : "light"}`}
      style={{
        background: isDark
          ? "linear-gradient(180deg, #05070D 0%, #0A0A12 100%)"
          : "linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)",
      }}
    >
      <StudyPostsStyles />

      {/* ════════ HERO DIAGRAM (nodes + connectors) ════════ */}
      <div className="relative w-full flex items-center justify-center pt-10 sm:pt-14 pb-4 px-4">
        <div className="relative w-full max-w-3xl aspect-[4/3]">

          {/* ─── Connector lines (SVG) ─── */}
          <svg
            viewBox="0 0 800 500"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isDark ? "rgba(255,255,255,0.15)" : "rgba(20,20,30,0.15)"} />
                <stop offset="100%" stopColor={isDark ? "rgba(255,255,255,0.15)" : "rgba(20,20,30,0.15)"} />
              </linearGradient>
            </defs>

            {/* Left connectors */}
            <path d="M 240 150 L 320 240 L 400 250" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />
            <path d="M 240 380 L 320 300 L 400 250" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />
            <path d="M 130 250 L 400 250" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />

            {/* Right connectors */}
            <path d="M 400 250 L 520 240 L 590 150" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />
            <path d="M 400 250 L 520 300 L 620 380" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />
            <path d="M 400 250 L 660 250" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />

            {/* Dots on lines */}
            <circle cx="320" cy="240" r="4" fill="#a78bfa" />
            <circle cx="320" cy="300" r="4" fill="#a78bfa" />
            <circle cx="520" cy="240" r="4" fill="#a78bfa" />
            <circle cx="520" cy="300" r="4" fill="#a78bfa" />
          </svg>

          {/* ─── Center node (purple check) ─── */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "22%",
              maxWidth: 140,
              aspectRatio: "1",
            }}>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full rounded-[28%] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
                boxShadow: "0 20px 60px -15px rgba(139,92,246,0.5)",
              }}
            >
              <div className="w-1/2 h-1/2 rounded-full flex items-center justify-center"
                style={{ border: "3px solid #fff" }}>
                <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* ─── Left: Lightbulb (yellow) ─── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute"
            style={{ left: "22%", top: "22%", width: "13%", maxWidth: 80, aspectRatio: "1" }}
          >
            <div className="w-full h-full rounded-[24%] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
                boxShadow: "0 12px 30px -8px rgba(245,158,11,0.45)",
              }}>
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
              </svg>
            </div>
          </motion.div>

          {/* ─── Left: Balloons (blue) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute"
            style={{ left: "20%", top: "62%", width: "13%", maxWidth: 80, aspectRatio: "1" }}
          >
            <div className="w-full h-full rounded-[24%] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
                boxShadow: "0 12px 30px -8px rgba(14,165,233,0.45)",
              }}>
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3a4 4 0 0 1 4 4 4 4 0 0 1-2 3.5V16a2 2 0 0 1-4 0V10.5A4 4 0 0 1 4 7a4 4 0 0 1 4-4z" />
                <path d="M18 6a4 4 0 0 1 0 8" />
                <path d="M8 18v4M18 14v6" />
              </svg>
            </div>
          </motion.div>

          {/* ─── Left: Person 1 (photo) ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute"
            style={{ left: "2%", top: "42%", width: "16%", maxWidth: 100, aspectRatio: "1" }}
          >
            <div className="w-full h-full rounded-[26%] overflow-hidden"
              style={{
                boxShadow: "0 12px 30px -8px rgba(0,0,0,0.25)",
                border: isDark ? "2px solid rgba(255,255,255,0.08)" : "2px solid #fff",
              }}>
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* ─── Right: Fire (red) ─── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute"
            style={{ right: "22%", top: "22%", width: "13%", maxWidth: 80, aspectRatio: "1" }}
          >
            <div className="w-full h-full rounded-[24%] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                boxShadow: "0 12px 30px -8px rgba(239,68,68,0.45)",
              }}>
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3.5 2-5" />
                <path d="M12 22a6 6 0 0 0 6-6c0-4-6-8-6-8" />
                <path d="M12 22a6 6 0 0 1-6-6c0-2 1-4 3-6" />
              </svg>
            </div>
          </motion.div>

          {/* ─── Right: Person 2 (photo) ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute"
            style={{ right: "18%", top: "62%", width: "14%", maxWidth: 90, aspectRatio: "1" }}
          >
            <div className="w-full h-full rounded-[26%] overflow-hidden"
              style={{
                boxShadow: "0 12px 30px -8px rgba(0,0,0,0.25)",
                border: isDark ? "2px solid rgba(255,255,255,0.08)" : "2px solid #fff",
              }}>
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* ─── Right: Eyes (white) ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="absolute"
            style={{ right: "3%", top: "42%", width: "14%", maxWidth: 90, aspectRatio: "1" }}
          >
            <div className="w-full h-full rounded-[26%] flex items-center justify-center"
              style={{
                background: isDark ? "#1F1F2C" : "#FFFFFF",
                boxShadow: "0 12px 30px -8px rgba(0,0,0,0.15)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(20,20,30,0.06)",
              }}>
              <svg width="55%" height="55%" viewBox="0 0 40 24" fill="none" stroke={isDark ? "#fff" : "#0D0D0D"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="12" rx="6" ry="7" />
                <ellipse cx="28" cy="12" rx="6" ry="7" />
                <circle cx="12" cy="12" r="2.5" fill={isDark ? "#fff" : "#0D0D0D"} />
                <circle cx="28" cy="12" r="2.5" fill={isDark ? "#fff" : "#0D0D0D"} />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════════ HEADLINE + CTA ════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-black tracking-tight mb-5"
          style={{
            fontSize: "clamp(40px, 7vw, 76px)",
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
            color: "var(--sp-txt)",
            maxWidth: 720,
          }}
        >
          Sell more with{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontStyle: "italic",
              fontWeight: 900,
            }}
          >
            Momento
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="font-ticket text-[14px] sm:text-[16px] leading-relaxed mb-9 max-w-lg"
          style={{ color: "var(--sp-txt-soft)" }}
        >
          Turn product photos into a social feed that sells. Post, link your
          listings, and let buyers buy with one tap.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-black text-[15px] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #F58220 0%, #D35400 100%)",
            color: "#FFFFFF",
            boxShadow: "0 20px 45px -15px rgba(242,138,45,0.6)",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <FaRocket className="text-sm relative z-10" />
          <span className="relative z-10">Enter Momento</span>
          <FaArrowRight className="text-xs relative z-10 transition-transform group-hover:translate-x-0.5" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-5 font-ticket text-[11px] font-semibold tracking-wide"
          style={{ color: "var(--sp-txt-faint)" }}
        >
          Free forever · No credit card needed
        </motion.p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MODERN CREATE POST DIALOG — Multi-step Wizard
   ═══════════════════════════════════════════════════════════════ */
const CreatePostDialog = ({
  show, onClose,
  postContent, setPostContent,
  postTitle, setPostTitle,
  postPrice, setPostPrice,
  postCategory, setPostCategory,
  linkedListingId, setLinkedListingId,
  selectedGroup, setSelectedGroup,
  postMediaPreview, uploadType, setUploadType,
  handleMediaChange, removeMedia,
  imageInputRef, videoInputRef,
  userGroups, loadingGroups,
  myListings,
  submitting, handleCreatePost,
  isPaid, pushToast,
  primaryGroup, user, myProfile,
}) => {
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState(null);

  const steps = [
    { id: 1, label: 'Media', icon: FaCameraSolid },
    { id: 2, label: 'Details', icon: FaTag },
    { id: 3, label: 'Publish', icon: FaPaperPlane },
  ];

  useEffect(() => {
    if (show) setStep(1);
  }, [show]);

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return postContent.trim().length > 0;
    if (step === 3) return userGroups.length > 0 && selectedGroup;
    return false;
  };

  const nextStep = () => {
    if (!canProceed()) {
      if (step === 2) pushToast('info', 'Content required', 'Please write something about your product.');
      if (step === 3) pushToast('error', 'Select a group', 'You need to join a group first.');
      return;
    }
    if (step < 3) setStep(step + 1);
    else handleCreatePost();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(242,138,45,0.08), transparent 70%), rgba(0,0,0,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-[28px]"
            style={{
              background: 'var(--sp-card)',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              border: '1px solid var(--sp-line)',
              borderBottom: 'none',
              boxShadow: '0 -20px 80px -20px rgba(0,0,0,0.5)',
            }}
          >
            {/* ── HEADER ── */}
            <div
              className="relative flex-shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4"
              style={{ borderBottom: '1px solid var(--sp-line)' }}
            >
              <div className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                style={{ background: 'var(--sp-line-str)' }} />

              <div className="flex items-center justify-between mt-2 sm:mt-0">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="h-11 w-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))' }}
                  >
                    <div className="absolute inset-0 opacity-30"
                      style={{ background: 'radial-gradient(circle at 30% 30%, white, transparent 70%)' }} />
                    <FaPlus className="text-white text-sm relative z-10" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--sp-txt)' }}>
                      Sell Something
                    </h2>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--sp-txt-soft)' }}>
                      Step {step} of 3 · {steps[step - 1].label}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}
                >
                  <FaTimes className="text-xs" style={{ color: 'var(--sp-txt-soft)' }} />
                </button>
              </div>

              {/* ── STEP INDICATOR ── */}
              <div className="flex items-center gap-2 mt-5">
                {steps.map((s, i) => {
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  const Icon = s.icon;
                  return (
                    <React.Fragment key={s.id}>
                      <button
                        onClick={() => { if (s.id < step) setStep(s.id); }}
                        className="flex items-center gap-2 flex-shrink-0"
                        disabled={s.id > step}
                      >
                        <motion.div
                          animate={{
                            scale: isActive ? 1 : 0.9,
                            opacity: isActive || isDone ? 1 : 0.4,
                          }}
                          className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: isDone
                              ? 'var(--sp-success)'
                              : isActive
                                ? 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))'
                                : 'var(--sp-card-2)',
                            border: `1px solid ${isActive || isDone ? 'transparent' : 'var(--sp-line)'}`,
                          }}
                        >
                          {isDone ? (
                            <FaCheckCircle className="text-white text-xs" />
                          ) : (
                            <Icon className={`text-[11px] ${isActive ? 'text-white' : ''}`}
                              style={{ color: isActive ? undefined : 'var(--sp-txt-faint)' }} />
                          )}
                        </motion.div>
                        <span
                          className="text-[11px] font-bold hidden sm:block"
                          style={{
                            color: isActive ? 'var(--sp-txt)' : isDone ? 'var(--sp-success)' : 'var(--sp-txt-faint)',
                          }}
                        >
                          {s.label}
                        </span>
                      </button>
                      {i < steps.length - 1 && (
                        <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: 'var(--sp-line)' }}>
                          <motion.div
                            initial={false}
                            animate={{ width: step > s.id ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                            style={{ background: 'var(--sp-success)' }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ── BODY (scrollable) ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="wait">
                {/* ═══ STEP 1: MEDIA ═══ */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 sm:p-7 space-y-5"
                  >
                    {!postMediaPreview ? (
                      <div className="space-y-4">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="relative rounded-3xl overflow-hidden cursor-pointer group"
                          style={{
                            background: 'var(--sp-card-2)',
                            border: '2px dashed var(--sp-line-str)',
                          }}
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
                              style={{ background: 'var(--sp-primary-soft)' }}
                            >
                              <FaCameraSolid className="text-2xl" style={{ color: 'var(--sp-primary)' }} />
                            </motion.div>
                            <p className="text-sm font-black mb-1" style={{ color: 'var(--sp-txt)' }}>
                              Add photos or videos
                            </p>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--sp-txt-soft)' }}>
                              Tap to upload · JPG, PNG, MP4
                            </p>
                          </div>

                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => { setUploadType('image'); imageInputRef.current?.click(); }}
                            className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                            style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}
                          >
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: 'var(--sp-primary-soft)' }}>
                              <FaImage className="text-sm" style={{ color: 'var(--sp-primary)' }} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-xs font-black" style={{ color: 'var(--sp-txt)' }}>Photo</p>
                              <p className="text-[10px]" style={{ color: 'var(--sp-txt-soft)' }}>Gallery</p>
                            </div>
                          </button>

                          {isPaid ? (
                            <button
                              onClick={() => { setUploadType('video'); videoInputRef.current?.click(); }}
                              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                              style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}
                            >
                              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--sp-primary-soft)' }}>
                                <FaFileVideo className="text-sm" style={{ color: 'var(--sp-primary)' }} />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-black" style={{ color: 'var(--sp-txt)' }}>Video</p>
                                <p className="text-[10px]" style={{ color: 'var(--sp-txt-soft)' }}>Pro</p>
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => pushToast('info', 'Video is Pro-only', 'Upgrade to unlock video posts.')}
                              className="flex items-center gap-3 p-4 rounded-2xl transition-all relative overflow-hidden"
                              style={{ background: 'var(--sp-primary-soft)', border: '1px solid var(--sp-primary)' }}
                            >
                              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--sp-primary)' }}>
                                <FaFileVideo className="text-sm text-white" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-black" style={{ color: 'var(--sp-primary)' }}>Video</p>
                                <p className="text-[10px] font-bold" style={{ color: 'var(--sp-primary)' }}>Upgrade</p>
                              </div>
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase"
                                style={{ background: 'var(--sp-primary)', color: '#fff' }}>Pro</span>
                            </button>
                          )}
                        </div>

                        <p className="text-center text-[11px] font-medium pt-2" style={{ color: 'var(--sp-txt-faint)' }}>
                          Media is optional — you can skip this step
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-3xl overflow-hidden group"
                          style={{ border: '1px solid var(--sp-line)' }}>
                          {uploadType === 'video' ? (
                            <video src={postMediaPreview} className="w-full h-64 object-cover" controls playsInline />
                          ) : (
                            <img src={postMediaPreview} alt="" className="w-full h-64 object-cover" />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={removeMedia}
                            className="absolute top-3 right-3 h-9 w-9 rounded-xl flex items-center justify-center backdrop-blur-lg"
                            style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
                          >
                            <FaTrash className="text-xs" />
                          </motion.button>

                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-lg"
                            style={{ background: 'rgba(0,0,0,0.6)' }}>
                            {uploadType === 'video' ? (
                              <FaFileVideo className="text-[10px] text-white" />
                            ) : (
                              <FaImage className="text-[10px] text-white" />
                            )}
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                              {uploadType}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if (uploadType === 'video') videoInputRef.current?.click();
                              else imageInputRef.current?.click();
                            }}
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-lg transition-all hover:scale-105"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
                          >
                            Change
                          </button>
                        </div>

                        <button
                          onClick={removeMedia}
                          className="w-full py-3 rounded-2xl text-xs font-bold transition-all hover:scale-[1.01]"
                          style={{ background: 'var(--sp-danger-soft)', color: 'var(--sp-danger)' }}
                        >
                          Remove media
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ STEP 2: DETAILS ═══ */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 sm:p-7 space-y-5"
                  >
                    <div>
                      <label className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--sp-txt-soft)' }}>
                          What are you selling?
                        </span>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: postContent.length > 1800 ? 'var(--sp-danger)' : 'var(--sp-txt-faint)' }}>
                          {postContent.length}/2000
                        </span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={postContent}
                          onChange={e => setPostContent(e.target.value)}
                          onFocus={() => setFocusedField('content')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Describe your product, condition, key features…"
                          rows={5}
                          maxLength={2000}
                          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none resize-none transition-all"
                          style={{
                            background: 'var(--sp-card-2)',
                            color: 'var(--sp-txt)',
                            border: `1.5px solid ${focusedField === 'content' ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                            boxShadow: focusedField === 'content' ? '0 0 0 4px var(--sp-primary-soft)' : 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--sp-txt-soft)' }}>
                        Title <span className="font-medium normal-case tracking-normal opacity-60">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={e => setPostTitle(e.target.value)}
                        onFocus={() => setFocusedField('title')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. iPhone 15 Pro Max — Like New"
                        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                        style={{
                          background: 'var(--sp-card-2)',
                          color: 'var(--sp-txt)',
                          border: `1.5px solid ${focusedField === 'title' ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                          boxShadow: focusedField === 'title' ? '0 0 0 4px var(--sp-primary-soft)' : 'none',
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--sp-txt-soft)' }}>
                          Price (Rs)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none"
                            style={{ color: 'var(--sp-primary)' }}>Rs</span>
                          <input
                            type="number"
                            value={postPrice}
                            onChange={e => setPostPrice(e.target.value)}
                            onFocus={() => setFocusedField('price')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                            style={{
                              background: 'var(--sp-card-2)',
                              color: 'var(--sp-txt)',
                              border: `1.5px solid ${focusedField === 'price' ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                              boxShadow: focusedField === 'price' ? '0 0 0 4px var(--sp-primary-soft)' : 'none',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--sp-txt-soft)' }}>
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={postCategory}
                            onChange={e => setPostCategory(e.target.value)}
                            onFocus={() => setFocusedField('category')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none appearance-none pr-9 transition-all"
                            style={{
                              background: 'var(--sp-card-2)',
                              color: 'var(--sp-txt)',
                              border: `1.5px solid ${focusedField === 'category' ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                              boxShadow: focusedField === 'category' ? '0 0 0 4px var(--sp-primary-soft)' : 'none',
                            }}
                          >
                            <option value="">Select…</option>
                            <option value="vehicles">🚗 Vehicles</option>
                            <option value="mobiles">📱 Mobiles</option>
                            <option value="property">🏠 Property</option>
                            <option value="electronics">💻 Electronics</option>
                            <option value="toys">🧸 Toys</option>
                          </select>
                          <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                            style={{ color: 'var(--sp-primary)' }} />
                        </div>
                      </div>
                    </div>

                    {myListings.length > 0 && (
                      <div>
                        <label className="flex items-center gap-2 mb-2.5">
                          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--sp-txt-soft)' }}>
                            Link a listing
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                            style={{ background: 'var(--sp-success-soft)', color: 'var(--sp-success)' }}>
                            Adds Buy button
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={linkedListingId}
                            onChange={e => setLinkedListingId(e.target.value)}
                            onFocus={() => setFocusedField('listing')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none appearance-none pr-9 transition-all"
                            style={{
                              background: 'var(--sp-card-2)',
                              color: 'var(--sp-txt)',
                              border: `1.5px solid ${focusedField === 'listing' ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                              boxShadow: focusedField === 'listing' ? '0 0 0 4px var(--sp-primary-soft)' : 'none',
                            }}
                          >
                            <option value="">— Just sharing (no listing) —</option>
                            {myListings.map(l => (
                              <option key={l.id} value={l.id}>
                                {l.title} · {formatPrice(l.price)}
                              </option>
                            ))}
                          </select>
                          <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                            style={{ color: 'var(--sp-primary)' }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ STEP 3: PUBLISH ═══ */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 sm:p-7 space-y-5"
                  >
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--sp-txt-soft)' }}>
                        Post to group
                      </label>
                      {loadingGroups ? (
                        <div className="flex items-center gap-3 p-4 rounded-2xl"
                          style={{ background: 'var(--sp-card-2)' }}>
                          <FaSpinner className="animate-spin text-sm" style={{ color: 'var(--sp-primary)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--sp-txt-soft)' }}>Loading groups…</span>
                        </div>
                      ) : userGroups.length > 0 ? (
                        <div className="space-y-2">
                          {userGroups.map(g => {
                            const isSelected = selectedGroup === g.id;
                            return (
                              <motion.button
                                key={g.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedGroup(g.id)}
                                className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left"
                                style={{
                                  background: isSelected ? 'var(--sp-primary-soft)' : 'var(--sp-card-2)',
                                  border: `1.5px solid ${isSelected ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                                }}
                              >
                                <GroupAvatar group={g} size="h-10 w-10" rounded="rounded-xl" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate" style={{ color: 'var(--sp-txt)' }}>{g.name}</p>
                                  <p className="text-[10px] font-medium capitalize" style={{ color: 'var(--sp-txt-soft)' }}>
                                    {g.role === 'admin' ? '👑 Admin' : 'Member'}
                                  </p>
                                </div>
                                <div
                                  className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                                  style={{
                                    background: isSelected ? 'var(--sp-primary)' : 'transparent',
                                    border: `2px solid ${isSelected ? 'var(--sp-primary)' : 'var(--sp-line-str)'}`,
                                  }}
                                >
                                  {isSelected && <FaCheckCircle className="text-[10px] text-white" />}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 rounded-2xl"
                          style={{ background: 'var(--sp-danger-soft)', border: '1px solid var(--sp-danger)' }}>
                          <FaExclamationTriangle className="text-sm flex-shrink-0" style={{ color: 'var(--sp-danger)' }} />
                          <div className="flex-1">
                            <p className="text-xs font-bold" style={{ color: 'var(--sp-danger)' }}>No groups joined</p>
                            <Link to="/study-groups" className="text-[11px] font-bold hover:underline"
                              style={{ color: 'var(--sp-primary)' }}>
                              Join a group →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--sp-txt-soft)' }}>
                        Preview
                      </label>
                      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}>
                        <div className="flex items-center gap-2.5 p-3">
                          {primaryGroup ? (
                            <GroupAvatar group={primaryGroup} size="h-9 w-9" />
                          ) : (
                            <UserAvatar user={user} profile={myProfile} size="h-9 w-9" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate" style={{ color: 'var(--sp-txt)' }}>
                              {primaryGroup ? primaryGroup.name : 'You'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--sp-txt-soft)' }}>Just now</p>
                          </div>
                        </div>

                        {postMediaPreview && (
                          <div className="px-3 pb-2">
                            {uploadType === 'video' ? (
                              <video src={postMediaPreview} className="w-full h-32 object-cover rounded-xl" />
                            ) : (
                              <img src={postMediaPreview} alt="" className="w-full h-32 object-cover rounded-xl" />
                            )}
                          </div>
                        )}

                        <div className="px-3 pb-2">
                          {postTitle && (
                            <p className="text-xs font-black mb-1" style={{ color: 'var(--sp-txt)' }}>{postTitle}</p>
                          )}
                          <p className="text-[11px] line-clamp-2" style={{ color: 'var(--sp-txt-soft)' }}>
                            {postContent || 'Your content will appear here…'}
                          </p>
                        </div>

                        {(postPrice || linkedListingId) && (
                          <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
                            {postPrice && (
                              <span className="text-sm font-black tabular-nums" style={{ color: 'var(--sp-primary)' }}>
                                {formatPrice(postPrice)}
                              </span>
                            )}
                            {linkedListingId && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase"
                                style={{ background: 'var(--sp-success-soft)', color: 'var(--sp-success)' }}>
                                <FaTag className="text-[8px]" /> Live listing
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── FOOTER ── */}
            <div
              className="flex-shrink-0 px-5 sm:px-7 py-4 flex items-center gap-3"
              style={{
                borderTop: '1px solid var(--sp-line)',
                background: 'var(--sp-card)',
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
              }}
            >
              {step > 1 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={prevStep}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm transition-all"
                  style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1px solid var(--sp-line)' }}
                >
                  Back
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm transition-all"
                  style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1px solid var(--sp-line)' }}
                >
                  Cancel
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                disabled={submitting || (step === 3 && (!selectedGroup || userGroups.length === 0))}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))',
                  color: '#fff',
                  boxShadow: '0 8px 24px -8px var(--sp-primary-glow)',
                }}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Posting…
                  </>
                ) : step === 3 ? (
                  <>
                    <FaPaperPlane className="text-sm" />
                    Publish
                  </>
                ) : (
                  <>
                    Continue
                    <FaChevronRight className="text-xs" />
                  </>
                )}
              </motion.button>
            </div>

            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleMediaChange} className="hidden" />
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleMediaChange} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ RANDOM LOADER — picks a different animation each mount
   ═══════════════════════════════════════════════════════════════ */
const MomentoLoader = () => {
  const loaderRef = useRef(null);
  if (loaderRef.current === null) {
    loaderRef.current = Math.floor(Math.random() * 6);
  }
  const which = loaderRef.current;

  const messages = [
    "Loading feed…",
    "Warming up…",
    "Getting things ready…",
    "Almost there…",
    "Fetching fresh drops…",
    "Just a moment…",
  ];

  return (
    <div className="min-h-screen sp-bg relative">
      <StudyPostsStyles />

      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-[0.12] z-0"
        style={{ background: `radial-gradient(circle, var(--sp-primary), transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">

        {which === 0 && (
          <div className="relative w-32 h-32 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid var(--sp-primary)` }}
                animate={{ scale: [0.6, 1.3, 1.6], opacity: [0.9, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
              />
            ))}
            <motion.div
              className="absolute inset-8 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaNewspaper className="text-white text-2xl" />
            </motion.div>
          </div>
        )}

        {which === 1 && (
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}
              >
                <FaShoppingCart className="text-white text-lg" />
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
                  style={{ background: "var(--sp-primary)", opacity: 1 - i * 0.18 }}
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
                    ? `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))`
                    : "var(--sp-primary)",
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
                style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  style={{ background: "linear-gradient(90deg, transparent, rgba(242,138,45,0.22), transparent)" }}
                />
              </div>
            ))}
          </div>
        )}

        {which === 4 && (
          <div className="relative w-24 h-24 mb-8">
            <motion.div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}
              animate={{
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["24%", "50%", "24%", "50%", "24%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FaRocket className="text-white text-2xl" />
            </div>
          </div>
        )}

        {which === 5 && (
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-2xl"
                style={{ border: `2px solid var(--sp-primary)`, width: 40, height: 40 }}
                animate={{ scale: [1, 3.2], opacity: [0.9, 0], rotate: [0, 90] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
              />
            ))}
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center z-10"
              style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}
            >
              <FaBolt className="text-white text-sm" />
            </div>
          </div>
        )}

        <motion.p
          key={`text-${which}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-ticket text-sm font-bold tracking-wide"
          style={{ color: "var(--sp-txt-soft)" }}
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
              style={{ background: "var(--sp-primary)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const Momento = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const planCtx = usePlan();
  const isPaid = planCtx?.planId && planCtx.planId !== "free";
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('momento.onboarded') !== 'true';
    } catch {
      return true; // if storage is unavailable, still show once
    }
  });
  const [view, setView] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});

  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [linkedListingId, setLinkedListingId] = useState('');
  const [myListings, setMyListings] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [postMediaFile, setPostMediaFile] = useState(null);
  const [postMediaPreview, setPostMediaPreview] = useState(null);
  const [uploadType, setUploadType] = useState('image');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('7d');

  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [fullscreenMediaType, setFullscreenMediaType] = useState('image');
  const [videoPlaying, setVideoPlaying] = useState({});
  const [videoMuted, setVideoMuted] = useState({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  /* ⭐ Deep-link: highlight the post targeted by ?post=<id> */
  const [highlightedPostId, setHighlightedPostId] = useState(null);

  const [myPostCount, setMyPostCount] = useState(0);
  const [myProfile, setMyProfile] = useState(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  /* ⭐ NEW: Edit media state */
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [editMediaPreview, setEditMediaPreview] = useState(null);
  const [editUploadType, setEditUploadType] = useState('image');
  const [editRemoveMedia, setEditRemoveMedia] = useState(false);
  const editImageInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

  const pushToast = (type, title, message, duration = 3200) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ⭐ Copy the post's link to clipboard / open native share */
  const handleSharePost = async (post, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const url = getPostShareUrl(post.id);
    const shareTitle = post.title || "Check this out on Momento";
    const shareText = post.content?.slice(0, 120) || "Check out this listing";

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        pushToast("success", "Link copied", "Share it anywhere.");
        return;
      }
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      pushToast("success", "Link copied", "Share it anywhere.");
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.warn("Share failed:", err);
      pushToast("error", "Couldn't copy link", "Please try again.");
    }
  };

  /* ⭐ Scroll to a specific post + highlight it */
  const focusPost = (postId, scroll = true) => {
    if (!postId) return;
    setHighlightedPostId(postId);
    setTimeout(() => setHighlightedPostId(null), 3200);
    if (scroll) {
      const el = document.querySelector(`[data-post-id="${postId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const videoRefs = useRef({});
  const myInsertedPostIds = useRef(new Set());
  const viewTracked = useRef(new Set());

  const isVideoFile = (f) => f?.type?.startsWith('video/');
  const isImageFile = (f) => f?.type?.startsWith('image/');

  const getMediaTypeFromUrl = (url) => {
    if (!url) return 'image';
    const ext = url.split('.').pop()?.toLowerCase();
    return ['mp4','webm','ogg','mov','avi','mkv','flv','wmv'].includes(ext) ? 'video' : 'image';
  };

  const CATEGORY_FILTERS = [
    { id: 'all',         label: 'All',         icon: FaNewspaper },
    { id: 'vehicles',    label: 'Vehicles',    icon: FaTag },
    { id: 'mobiles',     label: 'Mobiles',     icon: FaTag },
    { id: 'property',    label: 'Property',    icon: FaTag },
    { id: 'electronics', label: 'Electronics', icon: FaTag },
    { id: 'hot',         label: 'Hot Deals',   icon: FaFire },
    { id: 'saved',       label: 'Saved',       icon: FaBookmark },
  ];

  const primaryGroup = React.useMemo(() => {
    if (!userGroups || userGroups.length === 0) return null;
    return userGroups.find(g => g.role === 'admin') || userGroups[0];
  }, [userGroups]);

  useEffect(() => {
    fetchPosts();
    fetchUserGroups();
    fetchMyProfile();
    fetchFollowStats();
    fetchMyListings();
    const saved = localStorage.getItem('saved_posts');
    if (saved) { try { setSavedPosts(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showCreateDialog) setShowCreateDialog(false);
        else if (editingPost) setEditingPost(null);
        else if (fullscreenMedia) setFullscreenMedia(null);
        else if (openMenuPostId) setOpenMenuPostId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [fullscreenMedia, showCreateDialog, editingPost, openMenuPostId]);

  useEffect(() => {
    if (!openMenuPostId) return;
    const close = (e) => {
      if (!e.target.closest("[data-post-menu]")) setOpenMenuPostId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenuPostId]);

  useEffect(() => {
    if (!user) return;

    const postsChannel = supabase
      .channel('realtime:momento-posts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'study_group_posts' }, (payload) => {
        const updated = payload.new;
        setPosts((prev) => prev.map((p) => p.id === updated.id
          ? { ...p, views: updated.views ?? p.views, saves: updated.saves ?? p.saves, chats: updated.chats ?? p.chats }
          : p));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_group_posts' }, async (payload) => {
        const newRow = payload.new;
        if (myInsertedPostIds.current.has(newRow.id)) return;
        let exists = false;
        setPosts((prev) => { exists = prev.some((p) => p.id === newRow.id); return prev; });
        if (exists) return;

        const [{ data: userData }, { data: settingsData }, { data: groupData }] = await Promise.all([
          supabase.from('users').select('id, name, full_name, username, email, avatar_url').eq('id', newRow.user_id).maybeSingle(),
          supabase.from('user_settings').select('user_id, full_name, avatar, avatar_url').eq('user_id', newRow.user_id).maybeSingle(),
          supabase.from('study_groups').select('id, name, image_url').eq('id', newRow.group_id).maybeSingle(),
        ]);

        const mergedUser = userData ? {
          ...userData,
          full_name: settingsData?.full_name || userData.full_name,
          avatar_url: settingsData?.avatar || settingsData?.avatar_url || userData.avatar_url,
        } : (settingsData ? {
          id: newRow.user_id,
          full_name: settingsData.full_name,
          avatar_url: settingsData.avatar || settingsData.avatar_url,
        } : null);

        setPosts((prev) => [{ ...newRow, users: mergedUser, study_groups: groupData || null }, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'study_group_posts' }, (payload) => {
        setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(postsChannel); };
  }, [user]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const postId = entry.target.dataset.postId;
          if (!postId || viewTracked.current.has(postId)) return;
          viewTracked.current.add(postId);

          (async () => {
            try { await supabase.rpc('increment_post_views', { p_post_id: postId }); } catch {}
          })();
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-post-id]').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [posts]);

  /* ⭐ Handle ?post=<id> deep link — scroll to it & briefly highlight */
  useEffect(() => {
    if (!posts.length) return;

    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("post");
    if (!targetId) return;

    const t = setTimeout(() => {
      const el = document.querySelector(`[data-post-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setHighlightedPostId(targetId);
      setTimeout(() => setHighlightedPostId(null), 3200);

      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("post");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch {}
    }, 400);

    return () => clearTimeout(t);
  }, [posts]);

  const fetchMyProfile = async () => {
    if (!user) return;
    try {
      const [{ data: userData }, { data: settingsData }] = await Promise.all([
        supabase.from('users').select('id, name, full_name, username, email, avatar_url').eq('id', user.id).maybeSingle(),
        supabase.from('user_settings').select('user_id, full_name, avatar, avatar_url').eq('user_id', user.id).maybeSingle(),
      ]);
      setMyProfile({
        id: user.id,
        full_name: settingsData?.full_name || userData?.full_name || userData?.name || user.user_metadata?.full_name,
        username: userData?.username,
        email: user.email,
        avatar_url: settingsData?.avatar || settingsData?.avatar_url || userData?.avatar_url || user.user_metadata?.avatar_url,
      });
    } catch {}
  };

  const fetchFollowStats = async () => {
    if (!user) return;
    try {
      const { count: joinedCount } = await supabase
        .from('study_group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      setFollowingCount(joinedCount || 0);
      const { data: myGroups } = await supabase.from('study_groups').select('id').eq('created_by', user.id);
      const ids = (myGroups || []).map(g => g.id).filter(Boolean);
      if (!ids.length) { setFollowersCount(0); return; }
      const { count } = await supabase.from('study_group_members')
        .select('*', { count: 'exact', head: true }).in('group_id', ids).neq('user_id', user.id);
      setFollowersCount(count || 0);
    } catch {}
  };

  const fetchMyListings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('listings')
        .select('id, title, price, cover_image, category, city')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('posted_at', { ascending: false })
        .limit(50);
      setMyListings(data || []);
    } catch { setMyListings([]); }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('study_group_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (postsError) { setError('Failed to load posts'); setLoading(false); return; }

      const authorIds = [...new Set((postsData || []).map(p => p.user_id).filter(Boolean))];
      const usersMap = {}, settingsMap = {};
      if (authorIds.length) {
        const [usersRes, settingsRes] = await Promise.all([
          supabase.from('users').select('id, name, full_name, username, email, avatar_url').in('id', authorIds),
          supabase.from('user_settings').select('user_id, full_name, avatar, avatar_url').in('user_id', authorIds),
        ]);
        if (usersRes.data) usersRes.data.forEach(u => { usersMap[u.id] = u; });
        if (settingsRes.data) settingsRes.data.forEach(s => { settingsMap[s.user_id] = s; });
      }

      const groupIds = [...new Set((postsData || []).map(p => p.group_id).filter(Boolean))];
      const groupsMap = {};
      if (groupIds.length) {
        const { data: groups } = await supabase.from('study_groups').select('id, name, image_url').in('id', groupIds);
        if (groups) groups.forEach(g => { groupsMap[g.id] = g; });
      }

      const listingIds = [...new Set((postsData || []).map(p => p.listing_id).filter(Boolean))];
      const listingsMap = {};
      if (listingIds.length) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, price, cover_image, city, area, category, status, user_id')
          .in('id', listingIds);
        if (listings) listings.forEach(l => { listingsMap[l.id] = l; });
      }

      const enriched = (postsData || []).map(p => {
        const u = usersMap[p.user_id] || {};
        const s = settingsMap[p.user_id] || {};
        return {
          ...p,
          users: {
            id: p.user_id,
            full_name: s.full_name || u.full_name || u.name,
            name: u.name,
            username: u.username,
            email: u.email,
            avatar_url: s.avatar || s.avatar_url || u.avatar_url || null,
          },
          study_groups: groupsMap[p.group_id] || null,
          linkedListing: p.listing_id ? listingsMap[p.listing_id] : null,
        };
      });

      setPosts(enriched);
      if (user) setMyPostCount(enriched.filter(p => p.user_id === user.id).length);
    } catch (err) {
      setError('Failed to load posts');
    } finally { setLoading(false); }
  };

  const fetchUserGroups = async () => {
    if (!user) { setLoadingGroups(false); return; }
    setLoadingGroups(true);
    try {
      const { data: memberData } = await supabase.from('study_group_members').select('group_id, role').eq('user_id', user.id);
      if (!memberData || memberData.length === 0) { setUserGroups([]); setLoadingGroups(false); return; }
      const ids = memberData.map(m => m.group_id);
      const roleMap = {}; memberData.forEach(m => { roleMap[m.group_id] = m.role; });
      const { data: groupsData } = await supabase.from('study_groups').select('id, name, image_url').in('id', ids);
      if (groupsData && groupsData.length > 0) {
        const groups = groupsData.map(g => ({ id: g.id, name: g.name || 'Group', image_url: g.image_url, role: roleMap[g.id] || 'member' }));
        setUserGroups(groups);
        setSelectedGroup(groups[0].id);
      } else setUserGroups([]);
    } catch { setUserGroups([]); }
    finally { setLoadingGroups(false); }
  };

  const uploadMedia = async (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const path = `post-media/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from('study-group-images').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('study-group-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async (postId) => {
    const isSaved = !!savedPosts[postId];
    const next = { ...savedPosts, [postId]: !isSaved };
    setSavedPosts(next);
    localStorage.setItem('saved_posts', JSON.stringify(next));

    if (!isSaved) {
      (async () => {
        try { await supabase.rpc('increment_post_saves', { p_post_id: postId }); } catch {}
      })();
    }
  };

  const handleChatSeller = (post) => {
    if (!user) { pushToast('info', 'Sign in required', 'Please sign in to chat.'); return; }
    if (post.user_id === user.id) { pushToast('info', 'This is your post', ''); return; }
    (async () => {
      try { await supabase.rpc('increment_post_chats', { p_post_id: post.id }); } catch {}
    })();
    navigate(`/chat?user=${post.user_id}&listing=${post.listing_id || ''}`);
  };

  const handleBuyNow = (post) => {
    if (!user) { pushToast('info', 'Sign in required', 'Please sign in to buy.'); return; }
    if (!post.linkedListing) { pushToast('info', 'No listing attached', 'This post is not linked to a listing.'); return; }
    navigate(`/checkout?listing=${post.linkedListing.id}`);
  };

  const handleViewListing = (post) => {
    if (!post.linkedListing) return;
    const cat = (post.linkedListing.category || '').toLowerCase();
    const map = { vehicles: 'vehicle', bikes: 'vehicle', mobiles: 'mobile', property: 'property', electronics: 'electronic', toys: 'toy' };
    const base = map[cat] || 'feed';
    navigate(`/${base}/${post.linkedListing.id}`);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (isVideoFile(file)) {
      if (!isPaid) {
        pushToast('info', 'Video uploads are a Pro feature', 'Upgrade to Seller or Pro to post videos.', 4000);
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }
      setUploadType('video');
    } else if (isImageFile(file)) setUploadType('image');
    else { pushToast('error', 'Unsupported file', 'Please upload an image or video.'); return; }
    setPostMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPostMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setPostMediaFile(null); setPostMediaPreview(null); setUploadType('image');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const downloadMedia = async (url, filename) => {
    try {
      const res = await fetch(url); const blob = await res.blob();
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = u; a.download = filename || 'media';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(u);
    } catch { pushToast('error', 'Download failed', 'Please try again.'); }
  };

  const addPollOption = () => { if (pollOptions.length < 10) setPollOptions([...pollOptions, '']); };
  const removePollOption = (i) => { if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, j) => j !== i)); };
  const updatePollOption = (i, v) => { const o = [...pollOptions]; o[i] = v; setPollOptions(o); };

  const handleCreatePost = async () => {
    if (userGroups.length === 0) { pushToast('info', 'No group joined', 'Join a group first.'); return; }
    if (!postContent.trim() && !postMediaFile && !isPoll) { pushToast('info', 'Nothing to post', 'Add content, media, or a poll.'); return; }
    if (!selectedGroup) { pushToast('error', 'Select a group', ''); return; }

    setSubmitting(true);
    try {
      let mediaUrl = null, mediaType = 'image';
      if (postMediaFile) { mediaUrl = await uploadMedia(postMediaFile); mediaType = uploadType; }

      let pollData = null;
      if (isPoll) {
        const opts = pollOptions.filter(o => o.trim());
        if (opts.length < 2) { pushToast('error', 'Poll needs 2 options', ''); setSubmitting(false); return; }
        pollData = { options: opts, duration: pollDuration, votes: opts.map(() => 0), totalVotes: 0 };
      }

      const postData = {
        title: postTitle || '',
        content: postContent,
        group_id: selectedGroup,
        user_id: user.id,
        image_url: mediaUrl,
        media_type: mediaType,
        price: postPrice ? Number(postPrice) : null,
        category: postCategory || null,
        listing_id: linkedListingId || null,
        is_poll: isPoll || false,
        poll_data: pollData,
        likes: 0, comments: 0, views: 0, saves: 0, chats: 0,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('study_group_posts').insert([postData]).select();
      if (error) { pushToast('error', "Couldn't post", error.message); setSubmitting(false); return; }

      if (data?.length) {
        const newPost = data[0];
        myInsertedPostIds.current.add(newPost.id);
        const gp = userGroups.find(g => g.id === selectedGroup);
        const linked = myListings.find(l => l.id === linkedListingId);
        setPosts(prev => [{
          ...newPost,
          users: myProfile,
          study_groups: gp ? { id: gp.id, name: gp.name, image_url: gp.image_url } : null,
          linkedListing: linked || null,
        }, ...prev]);
        setMyPostCount(prev => prev + 1);
      }

      setPostContent(''); setPostTitle(''); setPostPrice(''); setPostCategory(''); setLinkedListingId('');
      setPostMediaFile(null); setPostMediaPreview(null); setUploadType('image');
      setIsPoll(false); setPollOptions(['', '']);

      setShowCreateDialog(false);
      setDialogStep(1);
      pushToast('success', 'Posted!', 'Your moment is live.');
    } catch (err) { pushToast('error', "Couldn't post", err.message); }
    finally { setSubmitting(false); }
  };

  /* ⭐ NEW: Edit media handlers */
  const handleEditMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isVideoFile(file)) {
      if (!isPaid) {
        pushToast('info', 'Video uploads are a Pro feature', 'Upgrade to Seller or Pro to post videos.', 4000);
        if (editVideoInputRef.current) editVideoInputRef.current.value = '';
        return;
      }
      setEditUploadType('video');
    } else if (isImageFile(file)) {
      setEditUploadType('image');
    } else {
      pushToast('error', 'Unsupported file', 'Please upload an image or video.');
      return;
    }

    setEditMediaFile(file);
    setEditRemoveMedia(false);
    const reader = new FileReader();
    reader.onloadend = () => setEditMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeEditMedia = () => {
    setEditMediaFile(null);
    setEditMediaPreview(null);
    setEditRemoveMedia(true);
    setEditUploadType('image');
    if (editImageInputRef.current) editImageInputRef.current.value = '';
    if (editVideoInputRef.current) editVideoInputRef.current.value = '';
  };

  const clearEditMediaRemoval = () => {
    setEditRemoveMedia(false);
    setEditMediaPreview(editingPost?.image_url || null);
    setEditUploadType(editingPost?.media_type || 'image');
  };
  const openEditDialog = (post) => {
    setEditingPost(post);
    setEditContent(post.content || "");
    setEditTitle(post.title || "");
    setEditPrice(post.price ? String(post.price) : "");
    setOpenMenuPostId(null);

    /* ⭐ Reset media edit state */
    setEditMediaFile(null);
    setEditMediaPreview(post.image_url || null);
    setEditUploadType(post.media_type || 'image');
    setEditRemoveMedia(false);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    if (!editContent.trim()) {
      pushToast("error", "Content required", "Please write something.");
      return;
    }
    setSavingEdit(true);
    try {
      let newMediaUrl = editingPost.image_url;
      let newMediaType = editingPost.media_type || 'image';

      /* ⭐ Handle media changes */
      if (editRemoveMedia && !editMediaFile) {
        newMediaUrl = null;
        newMediaType = 'image';
      } else if (editMediaFile) {
        const uploaded = await uploadMedia(editMediaFile);
        if (uploaded) {
          newMediaUrl = uploaded;
          newMediaType = editUploadType;
        } else {
          pushToast("error", "Upload failed", "Could not upload new media.");
          setSavingEdit(false);
          return;
        }
      }

      const updates = {
        content: editContent,
        title: editTitle || "",
        price: editPrice ? Number(editPrice) : null,
        image_url: newMediaUrl,
        media_type: newMediaType,
      };

      const { error } = await supabase
        .from("study_group_posts")
        .update(updates)
        .eq("id", editingPost.id);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? { ...p, ...updates } : p))
      );
      pushToast("success", "Post updated", "");

      setEditingPost(null);
      setEditMediaFile(null);
      setEditMediaPreview(null);
      setEditRemoveMedia(false);
      setEditUploadType('image');
    } catch (err) {
      console.error("Edit error:", err);
      pushToast("error", "Couldn't update post", err.message || "");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = async (post) => {
    const ok = window.confirm(
      "Delete this post?\n\nThis cannot be undone. The linked listing (if any) will stay on the marketplace."
    );
    if (!ok) return;

    setDeletingPostId(post.id);
    try {
      const { error } = await supabase
        .from("study_group_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setMyPostCount((n) => Math.max(0, n - 1));
      pushToast("success", "Post deleted", "");
      setOpenMenuPostId(null);
    } catch (err) {
      console.error("Delete error:", err);
      pushToast("error", "Couldn't delete post", err.message || "");
    } finally {
      setDeletingPostId(null);
    }
  };

  const fetchComments = async (postId) => {
    const { data } = await supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (data && data.length > 0) {
      const ids = [...new Set(data.map(c => c.user_id).filter(Boolean))];
      const usersMap = {}, settingsMap = {};
      if (ids.length) {
        const [uR, sR] = await Promise.all([
          supabase.from('users').select('id, name, full_name, username, email, avatar_url').in('id', ids),
          supabase.from('user_settings').select('user_id, full_name, avatar, avatar_url').in('user_id', ids),
        ]);
        if (uR.data) uR.data.forEach(u => { usersMap[u.id] = u; });
        if (sR.data) sR.data.forEach(s => { settingsMap[s.user_id] = s; });
      }
      setComments(prev => ({
        ...prev,
        [postId]: data.map(c => ({
          ...c,
          users: {
            id: c.user_id,
            full_name: settingsMap[c.user_id]?.full_name || usersMap[c.user_id]?.full_name || usersMap[c.user_id]?.name,
            avatar_url: settingsMap[c.user_id]?.avatar || settingsMap[c.user_id]?.avatar_url || usersMap[c.user_id]?.avatar_url,
          },
        })),
      }));
    } else setComments(prev => ({ ...prev, [postId]: [] }));
  };

  const toggleComments = async (postId) => {
    const open = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !open }));
    if (!open && !comments[postId]) await fetchComments(postId);
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) { pushToast('info', 'Sign in required', ''); return; }
    if (!commentText[postId]?.trim()) return;
    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content: commentText[postId] });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
    } catch (err) { pushToast('error', 'Comment failed', ''); }
    finally { setSubmittingComment(prev => ({ ...prev, [postId]: false })); }
  };

  const formatTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  const toggleVideoPlay = (postId) => {
    const v = videoRefs.current[postId];
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setVideoPlaying(p => ({ ...p, [postId]: true })); }
    else { v.pause(); setVideoPlaying(p => ({ ...p, [postId]: false })); }
  };
  const toggleVideoMute = (postId) => {
    const v = videoRefs.current[postId];
    if (!v) return;
    v.muted = !v.muted;
    setVideoMuted(p => ({ ...p, [postId]: v.muted }));
  };

  const filteredPosts = React.useMemo(() => {
    let f = posts;

    /* ⭐ If URL has ?post=<id>, show that post first so deep links always find it */
    try {
      const params = new URLSearchParams(window.location.search);
      const deepLinkId = params.get("post");
      if (deepLinkId) {
        const target = f.find((p) => p.id === deepLinkId);
        if (target) return [target];
      }
    } catch {}

    if (activeFilter === 'saved') {
      f = f.filter(p => savedPosts[p.id]);
    } else if (activeFilter === 'hot') {
      f = [...f].sort((a, b) => (b.views || 0) + (b.saves || 0) * 3 - ((a.views || 0) + (a.saves || 0) * 3));
    } else if (activeFilter !== 'all') {
      f = f.filter(p => (p.category || '').toLowerCase() === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      f = f.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.users?.full_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    return f;
  }, [posts, activeFilter, savedPosts, searchQuery]);

  const myPosts = posts.filter(p => p.user_id === user?.id);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('momento.onboarded', 'true');
    } catch {}
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (loading) {
    return <MomentoLoader />;
  }
  return (
    <div className="min-h-screen sp-bg relative font-dash overflow-x-hidden pb-24 lg:pb-0">
      <StudyPostsStyles />

      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-[0.10] z-0"
        style={{ background: `radial-gradient(circle, var(--sp-primary), transparent 70%)` }} aria-hidden="true" />

      {/* MOBILE HEADER */}
      <div className="lg:hidden sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{ background: "var(--sp-bg)", borderBottom: "1px solid var(--sp-line)" }}>
        <button onClick={() => setView("profile")} className="flex-shrink-0">
          {primaryGroup ? <GroupAvatar group={primaryGroup} size="h-10 w-10" /> : <UserAvatar user={user} profile={myProfile} size="h-10 w-10" />}
        </button>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex-1 text-left px-4 py-2.5 rounded-full font-ticket text-xs font-medium truncate"
          style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)", color: "var(--sp-txt-faint)" }}
        >
          Sell something…
        </button>
        <button
          onClick={() => navigate("/chat")}
          className="relative h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
        >
          <FaCommentDots className="text-sm" style={{ color: "var(--sp-txt)" }} />
        </button>
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 p-4 lg:p-6">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide pr-1">
          <div className="flex items-center gap-3 mb-7 px-1">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
              <FaNewspaper className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none" style={{ color: "var(--sp-txt)" }}>Momento</h1>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mt-1" style={{ color: "var(--sp-txt-faint)" }}>Showcase</p>
            </div>
          </div>

          <div className="relative rounded-3xl p-5 mb-5" style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}>
            <div className="flex flex-col items-center text-center">
              <div className="p-[3px] rounded-full sp-story-ring mb-3">
                <div className="p-[2px] rounded-full" style={{ background: "var(--sp-card)" }}>
                  {primaryGroup ? <GroupAvatar group={primaryGroup} size="h-[64px] w-[64px]" /> : <UserAvatar user={user} profile={myProfile} size="h-[64px] w-[64px]" />}
                </div>
              </div>
              <h2 className="text-base font-black" style={{ color: "var(--sp-txt)" }}>
                {primaryGroup ? primaryGroup.name : getDisplayName(myProfile || user, 'User')}
              </h2>
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: "var(--sp-txt-soft)" }}>
                {primaryGroup ? (primaryGroup.role === 'admin' ? 'Group Admin' : 'Member') : `@${myProfile?.username || user?.email?.split('@')[0] || 'user'}`}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-5 w-full">
                {[
                  { label: 'Posts', value: formatCount(myPostCount) },
                  { label: 'Subs', value: formatCount(followersCount) },
                  { label: 'Groups', value: formatCount(followingCount) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl py-2.5 px-1" style={{ background: "var(--sp-card-2)", border: "1px solid var(--sp-line)" }}>
                    <p className="text-sm font-black tabular-nums" style={{ color: "var(--sp-txt)" }}>{stat.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--sp-txt-faint)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <nav className="space-y-1 mb-5">
            {[
              { id: 'feed',    icon: FaHome,  label: 'Feed' },
              { id: 'profile', icon: FaUsers, label: 'My Profile' },
            ].map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => setView(item.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-semibold text-[13px]"
                  style={active
                    ? { background: "var(--sp-primary-soft)", color: "var(--sp-primary)", border: "1px solid var(--sp-primary)" }
                    : { color: "var(--sp-txt-soft)", border: "1px solid transparent" }}>
                  <Icon className="text-[15px]" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
            <Link to="/feed" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-[13px]" style={{ color: "var(--sp-txt-soft)" }}>
              <FaShoppingCart className="text-[15px]" />
              <span className="flex-1 text-left">Marketplace</span>
            </Link>
            <Link to="/my-listings" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-[13px]" style={{ color: "var(--sp-txt-soft)" }}>
              <FaTag className="text-[15px]" />
              <span className="flex-1 text-left">My Listings</span>
            </Link>
            <Link to="/chat" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-[13px]" style={{ color: "var(--sp-txt-soft)" }}>
              <FaEnvelope className="text-[15px]" />
              <span className="flex-1 text-left">Messages</span>
            </Link>
            <Link to="/settings" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-[13px]" style={{ color: "var(--sp-txt-soft)" }}>
              <FaCog className="text-[15px]" />
              <span className="flex-1 text-left">Settings</span>
            </Link>
          </nav>

          <button
            onClick={() => setShowCreateDialog(true)}
            className="group relative w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))`, color: "#fff", boxShadow: `0 12px 28px -10px var(--sp-primary-glow)` }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <FaPlus className="text-sm relative z-10" />
            <span className="relative z-10">Sell Something</span>
          </button>
        </aside>

        {/* MAIN */}
        <main className="min-w-0">
          <AnimatePresence mode="wait">
            {view === 'feed' ? (
              <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {posts.length > 0 && (
                  <div className="mb-5">
                    <h2 className="text-lg font-black mb-3 tracking-tight" style={{ color: "var(--sp-txt)" }}>Fresh Drops</h2>
                    <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide pb-1">
                      <button onClick={() => setShowCreateDialog(true)}
                        className="flex-shrink-0 flex flex-col items-center gap-2" style={{ width: 76 }}>
                        <div className="relative h-[76px] w-[76px] rounded-3xl overflow-hidden flex items-center justify-center"
                          style={{ background: "var(--sp-card)", border: "2px dashed var(--sp-primary)" }}>
                          <FaPlus className="text-2xl" style={{ color: "var(--sp-primary)" }} />
                        </div>
                        <span className="text-[11px] font-bold text-center" style={{ color: "var(--sp-primary)" }}>Post</span>
                      </button>

                      {posts.slice(0, 10).map((p, idx) => (
                        <div key={p.id || idx} className="relative flex-shrink-0" style={{ width: 76 }}>
                          <button
                            onClick={() => focusPost(p.id)}
                            className="flex flex-col items-center gap-2 w-full"
                          >
                            <div className="relative h-[76px] w-[76px] rounded-3xl overflow-hidden">
                              {p.image_url ? (
                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserAvatar profile={p.users} size="h-full w-full" textSize="text-xl" />
                              )}
                              {p.linkedListing && (
                                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full flex items-center justify-center"
                                  style={{ background: "var(--sp-success)", border: "2px solid var(--sp-card)" }}>
                                  <FaTag className="text-[8px] text-white" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold truncate w-full text-center" style={{ color: "var(--sp-txt-soft)" }}>
                              {p.price ? formatPrice(p.price) : getDisplayName(p.users, 'User').split(' ')[0]}
                            </span>
                          </button>

                          {/* ⭐ Small share dot */}
                          <button
                            onClick={(e) => handleSharePost(p, e)}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                            aria-label="Share post"
                          >
                            <FaShare style={{ fontSize: 9 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {CATEGORY_FILTERS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeFilter === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
                        style={isActive
                          ? { background: "var(--sp-primary)", color: "#fff" }
                          : { background: "var(--sp-card)", color: "var(--sp-txt-soft)", border: "1px solid var(--sp-line)" }}>
                        <Icon className="text-[10px]" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="text-center py-20 sp-card rounded-3xl">
                    <div className="h-20 w-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
                      style={{ background: "var(--sp-card-2)", border: "1px solid var(--sp-line)" }}>
                      <FaNewspaper className="text-3xl" style={{ color: "var(--sp-primary)" }} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--sp-txt)" }}>
                      {activeFilter === 'saved' ? 'No saved posts' : 'Nothing here yet'}
                    </h3>
                    <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: "var(--sp-txt-soft)" }}>
                      Be the first to showcase something
                    </p>
                    <button onClick={() => setShowCreateDialog(true)}
                      className="mt-6 px-7 py-3 rounded-2xl text-white font-black text-sm hover:scale-[1.03] transition-all shadow-xl"
                      style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
                      Sell Something
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post, i) => {
                      const authorName = getDisplayName(post.users, 'Seller');
                      const isMine = post.user_id === user?.id;
                      const isSaved = !!savedPosts[post.id];
                      const hasListing = !!post.linkedListing;

                      return (
                        <motion.div
                          key={post.id}
                          data-post-id={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            boxShadow: highlightedPostId === post.id
                              ? "0 0 0 3px var(--sp-primary), 0 20px 50px -20px var(--sp-primary-glow)"
                              : "0 0 0 0px transparent",
                          }}
                          transition={{
                            delay: Math.min(i * 0.03, 0.3),
                            duration: 0.35,
                            boxShadow: { duration: 0.4 },
                          }}
                          className="sp-card rounded-3xl overflow-hidden"
                        >
                          <div className="flex items-center gap-3 p-4">
                            <div className="p-[2px] rounded-full sp-story-ring">
                              <div className="p-[2px] rounded-full" style={{ background: "var(--sp-card)" }}>
                                <UserAvatar profile={post.users} size="h-11 w-11" textSize="text-sm" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black truncate" style={{ color: "var(--sp-txt)" }}>{authorName}</span>
                                {hasListing && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider"
                                    style={{ background: "var(--sp-success-soft)", color: "var(--sp-success)" }}>
                                    <FaTag className="text-[7px]" /> Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px]" style={{ color: "var(--sp-txt-soft)" }}>
                                {formatTimeAgo(post.created_at)}
                                {post.category && ` · ${post.category}`}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* ⭐ Share button */}
                              <button
                                onClick={(e) => handleSharePost(post, e)}
                                className="p-2 rounded-xl hover:bg-[var(--sp-card-2)] transition"
                                aria-label="Share post"
                                title="Copy shareable link"
                              >
                                <FaShare className="text-sm" style={{ color: "var(--sp-txt-soft)" }} />
                              </button>

                              {isMine ? (
                                <div className="relative" data-post-menu>
                                  <button
                                    onClick={() =>
                                      setOpenMenuPostId((id) => (id === post.id ? null : post.id))
                                    }
                                    className="p-2 rounded-xl hover:bg-[var(--sp-card-2)] transition"
                                    aria-label="Post options"
                                  >
                                    <FaEllipsisH className="text-sm" style={{ color: "var(--sp-txt-soft)" }} />
                                  </button>

                                  <AnimatePresence>
                                    {openMenuPostId === post.id && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1 z-30 min-w-[170px] rounded-xl overflow-hidden shadow-2xl"
                                        style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line-str)" }}
                                      >
                                        <button
                                          onClick={() => openEditDialog(post)}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold transition-colors hover:bg-[var(--sp-card-2)]"
                                          style={{ color: "var(--sp-txt)" }}
                                        >
                                          <FaEdit className="text-[11px]" style={{ color: "var(--sp-primary)" }} />
                                          Edit Post
                                        </button>

                                        <div style={{ height: 1, background: "var(--sp-line)" }} />

                                        <button
                                          onClick={() => { handleSharePost(post); setOpenMenuPostId(null); }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold transition-colors hover:bg-[var(--sp-card-2)]"
                                          style={{ color: "var(--sp-txt)" }}
                                        >
                                          <FaShare className="text-[11px]" style={{ color: "var(--sp-primary)" }} />
                                          Copy link
                                        </button>

                                        <div style={{ height: 1, background: "var(--sp-line)" }} />

                                        <button
                                          onClick={() => handleDeletePost(post)}
                                          disabled={deletingPostId === post.id}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold transition-colors hover:bg-[rgba(239,68,68,0.08)] disabled:opacity-50"
                                          style={{ color: "var(--sp-danger)" }}
                                        >
                                          {deletingPostId === post.id ? (
                                            <FaSpinner className="text-[11px] animate-spin" />
                                          ) : (
                                            <FaTrash className="text-[11px]" />
                                          )}
                                          {deletingPostId === post.id ? "Deleting…" : "Delete Post"}
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {post.content && (
                            <div className="px-4 pb-3">
                              <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--sp-txt)" }}>
                                {post.content}
                              </p>
                            </div>
                          )}

                          {post.image_url && (
                            <div className="px-4 pb-2">
                              <div
                                className="rounded-2xl overflow-hidden cursor-pointer relative group"
                                onClick={() => {
                                  setFullscreenMedia(post.image_url);
                                  setFullscreenMediaType(post.media_type || getMediaTypeFromUrl(post.image_url));
                                }}
                              >
                                {(post.media_type || getMediaTypeFromUrl(post.image_url)) === 'video' ? (
                                  <video
                                    ref={el => videoRefs.current[post.id] = el}
                                    src={post.image_url}
                                    className="w-full object-cover max-h-[560px]"
                                    autoPlay playsInline loop muted
                                  />
                                ) : (
                                  <img src={post.image_url} alt={post.title} className="w-full object-cover max-h-[700px]" loading="lazy" />
                                )}
                              </div>
                            </div>
                          )}

                          {(post.price || post.linkedListing) && (
                            <div className="px-4 pt-2 pb-3 flex items-center gap-3 flex-wrap">
                              {post.price && (
                                <span className="font-ticket text-xl font-black tabular-nums" style={{ color: "var(--sp-primary)" }}>
                                  {formatPrice(post.price)}
                                </span>
                              )}
                              {post.linkedListing?.city && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                                  style={{ color: "var(--sp-txt-soft)" }}>
                                  <FaMapMarkerAlt className="text-[9px]" />
                                  {post.linkedListing.area ? `${post.linkedListing.area}, ` : ''}{post.linkedListing.city}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="px-3 sm:px-4 py-3 flex items-center gap-2 border-t" style={{ borderColor: "var(--sp-line)" }}>
                            <button
                              onClick={() => handleSave(post.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                              style={{ color: isSaved ? "var(--sp-primary)" : "var(--sp-txt-soft)" }}
                            >
                              {isSaved ? <FaBookmark className="text-[13px]" /> : <FaRegBookmark className="text-[13px]" />}
                              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                            </button>

                            <button
                              onClick={(e) => handleSharePost(post, e)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                              style={{ color: "var(--sp-txt-soft)" }}
                              title="Copy shareable link"
                            >
                              <FaShare className="text-[13px]" />
                              <span className="hidden sm:inline">Share</span>
                            </button>

                            {!isMine && (
                              <button
                                onClick={() => handleChatSeller(post)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                                style={{ color: "var(--sp-txt)" }}
                              >
                                <FaCommentDots className="text-[13px]" />
                                <span className="hidden sm:inline">Chat</span>
                              </button>
                            )}

                            {!isMine && hasListing ? (
                              <button
                                onClick={() => handleBuyNow(post)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-primary"
                              >
                                <FaBolt className="text-[13px]" />
                                <span>Buy</span>
                              </button>
                            ) : hasListing ? (
                              <button
                                onClick={() => handleViewListing(post)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                                style={{ color: "var(--sp-txt)" }}
                              >
                                <FaExternalLinkAlt className="text-[11px]" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                            ) : null}
                          </div>

                          <div className="px-4 pb-3 flex items-center gap-4 text-[11px] font-semibold flex-wrap" style={{ color: "var(--sp-txt-faint)" }}>
                            <span className="inline-flex items-center gap-1.5">
                              <FaEye className="text-[10px]" />
                              <span className="tabular-nums">{formatCount(post.views || 0)}</span>
                              <span className="opacity-70">views</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FaBookmark className="text-[10px]" />
                              <span className="tabular-nums">{formatCount(post.saves || 0)}</span>
                              <span className="opacity-70">saves</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FaCommentDots className="text-[10px]" />
                              <span className="tabular-nums">{formatCount(post.chats || post.comments || 0)}</span>
                              <span className="opacity-70">chats</span>
                            </span>
                          </div>

                          {hasListing && (
                            <button
                              onClick={() => handleViewListing(post)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border-t transition-colors"
                              style={{ borderColor: "var(--sp-line)", background: "var(--sp-primary-soft)" }}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--sp-primary)" }}>
                                  Full listing
                                </p>
                                <p className="text-[12px] font-semibold truncate" style={{ color: "var(--sp-txt)" }}>
                                  {post.linkedListing.title}
                                </p>
                              </div>
                              <FaArrowRight className="text-xs flex-shrink-0" style={{ color: "var(--sp-primary)" }} />
                            </button>
                          )}

                          <AnimatePresence>
                            {showComments[post.id] && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 pt-2 space-y-3 overflow-hidden border-t" style={{ borderColor: "var(--sp-line)" }}>
                                <div className="flex gap-2.5 pt-3">
                                  {primaryGroup ? <GroupAvatar group={primaryGroup} size="h-9 w-9" /> : <UserAvatar user={user} profile={myProfile} size="h-9 w-9" />}
                                  <div className="flex-1 flex gap-2">
                                    <input type="text" placeholder="Ask seller a question…"
                                      value={commentText[post.id] || ''}
                                      onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyPress={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                      className="flex-1 px-4 py-2.5 sp-input rounded-2xl text-xs outline-none"
                                      style={{ color: "var(--sp-txt)" }} />
                                    <button onClick={() => handleCommentSubmit(post.id)}
                                      disabled={submittingComment[post.id] || !commentText[post.id]?.trim()}
                                      className="px-4 py-2.5 rounded-2xl text-white text-xs font-bold disabled:opacity-40"
                                      style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
                                      {submittingComment[post.id] ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
                                    </button>
                                  </div>
                                </div>
                                {comments[post.id]?.map(c => (
                                  <div key={c.id} className="flex gap-2.5">
                                    <UserAvatar profile={c.users} size="h-9 w-9" />
                                    <div className="flex-1 min-w-0">
                                      <div className="rounded-2xl px-4 py-3" style={{ background: "var(--sp-card-2)", border: "1px solid var(--sp-line)" }}>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-black" style={{ color: "var(--sp-txt)" }}>{getDisplayName(c.users, 'User')}</span>
                                          <span className="text-[10px]" style={{ color: "var(--sp-txt-soft)" }}>{formatTimeAgo(c.created_at)}</span>
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--sp-txt)" }}>{c.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            onClick={() => toggleComments(post.id)}
                            className="w-full text-center py-2 text-[11px] font-bold border-t"
                            style={{ borderColor: "var(--sp-line)", color: "var(--sp-txt-soft)" }}
                          >
                            {showComments[post.id] ? 'Hide' : 'Ask a question'}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative rounded-3xl p-6 mb-5 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
                  <div className="flex items-center gap-4">
                    {primaryGroup ? <GroupAvatar group={primaryGroup} size="h-20 w-20" /> : <UserAvatar user={user} profile={myProfile} size="h-20 w-20" />}
                    <div className="text-white min-w-0">
                      <h1 className="text-2xl font-black truncate">
                        {primaryGroup ? primaryGroup.name : getDisplayName(myProfile || user, 'User')}
                      </h1>
                      <p className="text-sm opacity-90 mt-1">
                        {primaryGroup ? 'Group Seller' : `@${myProfile?.username || 'user'}`}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      { label: 'Posts', value: myPostCount },
                      { label: 'Subs', value: followersCount },
                      { label: 'Groups', value: followingCount },
                    ].map(s => (
                      <div key={s.label} className="text-center text-white">
                        <p className="text-2xl font-black tabular-nums">{formatCount(s.value)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mb-5">
                  <button onClick={() => navigate('/my-listings')}
                    className="flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
                    <FaTag className="text-xs" /> Manage Listings
                  </button>
                  <button onClick={() => navigate('/settings')}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)", color: "var(--sp-txt)" }}>
                    <FaCog className="text-xs" /> Settings
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {myPosts.length === 0 ? (
                    <div className="col-span-full text-center py-16 sp-card rounded-3xl">
                      <FaImage className="text-3xl mx-auto mb-3" style={{ color: "var(--sp-txt-faint)" }} />
                      <p className="text-sm font-bold" style={{ color: "var(--sp-txt)" }}>No posts yet</p>
                      <button onClick={() => setShowCreateDialog(true)}
                        className="mt-4 px-5 py-2.5 rounded-full text-white text-xs font-bold"
                        style={{ background: "var(--sp-primary)" }}>
                        Sell Something
                      </button>
                    </div>
                  ) : (
                    myPosts.map((p) => (
                      <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-square cursor-pointer group"
                        style={{ background: "var(--sp-card-2)" }}
                        onClick={() => {
                          if (p.image_url) {
                            setFullscreenMedia(p.image_url);
                            setFullscreenMediaType(p.media_type || getMediaTypeFromUrl(p.image_url));
                          }
                        }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-4">
                            <p className="text-[11px] font-bold text-center line-clamp-4" style={{ color: "var(--sp-txt-soft)" }}>
                              {p.content?.slice(0, 80)}
                            </p>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1"><FaEye /> {p.views || 0}</span>
                          <span className="flex items-center gap-1"><FaBookmark /> {p.saves || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="sp-bottomnav">
        <button onClick={() => setView('feed')} className={`sp-bottomnav__item ${view === 'feed' ? 'sp-bottomnav__item--active' : ''}`}>
          <FaHome /><span>Feed</span>
        </button>
         <button onClick={() => navigate('/chat')} className="sp-bottomnav__item">
          <Video /><span>Shorts</span>
        </button>
        <button onClick={() => setShowCreateDialog(true)} className="sp-bottomnav__center">
          <span className="sp-bottomnav__center-inner"><FaPlus className="text-base" /></span>
        </button>
        
        <button onClick={() => navigate('/chat')} className="sp-bottomnav__item">
          <FaCommentDots /><span>Chats</span>
        </button>
        <button onClick={() => setView('profile')} className={`sp-bottomnav__item ${view === 'profile' ? 'sp-bottomnav__item--active' : ''}`}>
          <FaUser /><span>Profile</span>
        </button>
        
      </nav>

      {/* ⭐ MODERN CREATE POST DIALOG */}
      <CreatePostDialog
        show={showCreateDialog}
        onClose={() => { setShowCreateDialog(false); setDialogStep(1); }}
        postContent={postContent} setPostContent={setPostContent}
        postTitle={postTitle} setPostTitle={setPostTitle}
        postPrice={postPrice} setPostPrice={setPostPrice}
        postCategory={postCategory} setPostCategory={setPostCategory}
        linkedListingId={linkedListingId} setLinkedListingId={setLinkedListingId}
        selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup}
        postMediaPreview={postMediaPreview}
        uploadType={uploadType} setUploadType={setUploadType}
        handleMediaChange={handleMediaChange} removeMedia={removeMedia}
        imageInputRef={imageInputRef} videoInputRef={videoInputRef}
        userGroups={userGroups} loadingGroups={loadingGroups}
        myListings={myListings}
        submitting={submitting} handleCreatePost={handleCreatePost}
        isPaid={isPaid} pushToast={pushToast}
        primaryGroup={primaryGroup} user={user} myProfile={myProfile}
      />

    {/* ⭐ EDIT POST DIALOG */}
<AnimatePresence>
  {editingPost && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sp-card max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        style={{ borderRadius: 24 }}
      >
        {/* HEADER */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--sp-line)" }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}>
              <FaEdit className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: "var(--sp-txt)" }}>Edit Post</h2>
              <p className="text-xs" style={{ color: "var(--sp-txt-soft)" }}>Update text, price & media</p>
            </div>
          </div>
          <button onClick={() => setEditingPost(null)} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-[var(--sp-card-2)] transition">
            <FaTimes className="text-sm" style={{ color: "var(--sp-txt-soft)" }} />
          </button>
        </div>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">

          {/* ⭐ MEDIA EDIT SECTION */}
          <div>
            <label className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--sp-txt-soft)" }}>
                Photo / Video
              </span>
              {editMediaPreview && (
                <button
                  onClick={removeEditMedia}
                  className="text-[10px] font-bold flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: "var(--sp-danger)" }}
                >
                  <FaTrash className="text-[9px]" /> Remove
                </button>
              )}
            </label>

            {editMediaPreview ? (
              /* Media preview with change buttons */
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden group"
                  style={{ border: "1px solid var(--sp-line)" }}>
                  {editUploadType === 'video' ? (
                    <video src={editMediaPreview} className="w-full h-56 object-cover" controls playsInline />
                  ) : (
                    <img src={editMediaPreview} alt="" className="w-full h-56 object-cover" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Type badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-lg"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    {editUploadType === 'video' ? (
                      <FaFileVideo className="text-[10px] text-white" />
                    ) : (
                      <FaImage className="text-[10px] text-white" />
                    )}
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {editUploadType}
                    </span>
                    {editMediaFile && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase"
                        style={{ background: 'var(--sp-primary)', color: '#fff' }}>
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                {/* Change media buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setEditUploadType('image'); editImageInputRef.current?.click(); }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ background: "var(--sp-card-2)", color: "var(--sp-txt-soft)", border: "1px solid var(--sp-line)" }}
                  >
                    <FaImage className="text-sm" style={{ color: "var(--sp-primary)" }} /> Change Photo
                  </button>

                  {isPaid ? (
                    <button
                      onClick={() => { setEditUploadType('video'); editVideoInputRef.current?.click(); }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                      style={{ background: "var(--sp-card-2)", color: "var(--sp-txt-soft)", border: "1px solid var(--sp-line)" }}
                    >
                      <FaFileVideo className="text-sm" style={{ color: "var(--sp-primary)" }} /> Change Video
                    </button>
                  ) : (
                    <button
                      onClick={() => pushToast('info', 'Video is Pro-only', 'Upgrade to Seller or Pro.')}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold relative"
                      style={{ background: "var(--sp-primary-soft)", border: "1px solid var(--sp-primary)", color: "var(--sp-primary)" }}
                    >
                      <FaFileVideo className="text-sm" /> Video
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase"
                        style={{ background: "var(--sp-primary)", color: "#fff" }}>Pro</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* No media — show upload zone */
              <div className="space-y-2">
                {editRemoveMedia ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: "var(--sp-danger-soft)", border: "1px solid var(--sp-danger)" }}>
                    <FaTrash className="text-sm flex-shrink-0" style={{ color: "var(--sp-danger)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: "var(--sp-danger)" }}>
                        Media will be removed
                      </p>
                      <button
                        onClick={clearEditMediaRemoval}
                        className="text-[11px] font-bold hover:underline"
                        style={{ color: "var(--sp-primary)" }}
                      >
                        Undo removal →
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => editImageInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center py-8 rounded-2xl transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--sp-card-2)",
                      border: "2px dashed var(--sp-line-str)",
                    }}
                  >
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "var(--sp-primary-soft)" }}>
                      <FaCameraSolid className="text-lg" style={{ color: "var(--sp-primary)" }} />
                    </div>
                    <p className="text-xs font-black" style={{ color: "var(--sp-txt)" }}>
                      Add photo or video
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--sp-txt-soft)" }}>
                      Tap to upload
                    </p>
                  </button>
                )}

                {!editRemoveMedia && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setEditUploadType('image'); editImageInputRef.current?.click(); }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold"
                      style={{ background: "var(--sp-card-2)", color: "var(--sp-txt-soft)", border: "1px solid var(--sp-line)" }}
                    >
                      <FaImage className="text-sm" style={{ color: "var(--sp-primary)" }} /> Photo
                    </button>

                    {isPaid ? (
                      <button
                        onClick={() => { setEditUploadType('video'); editVideoInputRef.current?.click(); }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold"
                        style={{ background: "var(--sp-card-2)", color: "var(--sp-txt-soft)", border: "1px solid var(--sp-line)" }}
                      >
                        <FaFileVideo className="text-sm" style={{ color: "var(--sp-primary)" }} /> Video
                      </button>
                    ) : (
                      <button
                        onClick={() => pushToast('info', 'Video is Pro-only', 'Upgrade to unlock video posts.')}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold relative"
                        style={{ background: "var(--sp-primary-soft)", border: "1px solid var(--sp-primary)", color: "var(--sp-primary)" }}
                      >
                        <FaFileVideo className="text-sm" /> Video
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase"
                          style={{ background: "var(--sp-primary)", color: "#fff" }}>Pro</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--sp-txt-soft)" }}>
              Title (optional)
            </label>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post title"
              className="w-full px-4 py-3 rounded-xl sp-input text-sm outline-none" style={{ color: "var(--sp-txt)" }} />
          </div>

          {/* PRICE */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--sp-txt-soft)" }}>
              Price (Rs, optional)
            </label>
            <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
              placeholder="e.g. 145000"
              className="w-full px-4 py-3 rounded-xl sp-input text-sm outline-none" style={{ color: "var(--sp-txt)" }} />
          </div>

          {/* CONTENT */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--sp-txt-soft)" }}>
              Content <span style={{ color: "var(--sp-danger)" }}>*</span>
            </label>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's this about?" rows="5"
              className="w-full px-4 py-3 rounded-xl sp-input text-sm outline-none resize-none" style={{ color: "var(--sp-txt)" }} />
            <p className="text-[10px] text-right mt-1" style={{ color: "var(--sp-txt-faint)" }}>{editContent.length} / 2000</p>
          </div>

          {/* INFO */}
          <div className="p-3 rounded-xl text-[11px] font-semibold leading-relaxed"
            style={{ background: "var(--sp-primary-soft)", color: "var(--sp-primary)", border: "1px solid var(--sp-primary)" }}>
            💡 Category and linked listing can't be changed. Create a new post if you need to update them.
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 px-6 py-4 flex gap-3 border-t"
          style={{ borderColor: "var(--sp-line)", background: "var(--sp-card)" }}>
          <button onClick={() => setEditingPost(null)} disabled={savingEdit}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: "var(--sp-card-2)", color: "var(--sp-txt)", border: "1px solid var(--sp-line)" }}>
            Cancel
          </button>
          <button onClick={handleSaveEdit} disabled={savingEdit || !editContent.trim()}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}>
            {savingEdit ? (
              <><FaSpinner className="animate-spin text-sm" /> Saving…</>
            ) : (
              <><FaCheckCircle className="text-sm" /> Save Changes</>
            )}
          </button>
        </div>

        {/* Hidden file inputs */}
        <input ref={editImageInputRef} type="file" accept="image/*" onChange={handleEditMediaChange} className="hidden" />
        <input ref={editVideoInputRef} type="file" accept="video/*" onChange={handleEditMediaChange} className="hidden" />
      </motion.div>
    </div>
  )}
</AnimatePresence>

      {/* FULLSCREEN MEDIA */}
      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[110] flex items-center justify-center p-4"
            onClick={() => setFullscreenMedia(null)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}>
              {fullscreenMediaType === 'video' ? (
                <video src={fullscreenMedia} className="max-h-[90vh] rounded-2xl" controls autoPlay playsInline />
              ) : (
                <img src={fullscreenMedia} alt="" className="max-h-[90vh] object-contain rounded-2xl" />
              )}
              <button onClick={() => setFullscreenMedia(null)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-lg">
                <FaTimes className="text-lg" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SnackbarHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Momento;