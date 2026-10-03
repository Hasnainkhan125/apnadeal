// pages/Momento.jsx — Seller marketplace + Shorts + Profile + Universal Share
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaNewspaper, FaExclamationTriangle, FaShare, FaPlus,
  FaBookmark, FaSpinner, FaImage, FaFire,
  FaRegBookmark, FaChevronDown, FaHeart, FaCommentDots,
  FaPaperPlane, FaTimes, FaFileVideo,
  FaRocket, FaEllipsisH, FaCheckCircle,
  FaHome, FaCog, FaEnvelope, FaEye,
  FaShoppingCart, FaMapMarkerAlt, FaArrowRight, FaBolt,
  FaExternalLinkAlt, FaTag, FaEdit, FaTrash,
  FaCamera as FaCameraSolid, FaChevronRight,
  FaUser,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '../contexts/PlanContext';
import { Video } from 'lucide-react';
import FollowButton from '../components/FollowButton';
import MomentoProfile from '../components/MomentoProfile';
import MomentoShorts from '../components/MomentoShorts';
import VideoUploadModal from '../components/VideoUploadModal';
import { shareContent, copyContentLink, buildSharePayload } from '../lib/shareUtils';

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
      --sp-bg:          #0A0A12;
      --sp-card:        #14141D;
      --sp-card-2:      #1A1A24;
      --sp-line:        rgba(255,255,255,0.08);
      --sp-line-str:    rgba(255,255,255,0.14);
      --sp-txt:         #FFFFFF;
      --sp-txt-soft:    rgba(255,255,255,0.68);
      --sp-txt-faint:   rgba(255,255,255,0.42);
      --sp-primary:     #F58220;
      --sp-primary-2:   #E26A2C;
      --sp-primary-3:   #D35400;
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
      --sp-primary:     #D35400;
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
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
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
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
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

/* ⭐ Parse deep-link from URL — path OR query, and detect shorts */
const parseDeepLink = () => {
  try {
    // 1. Path: /momento/(post|short|reel|video)/<id>
    const pathMatch = window.location.pathname.match(
      /^\/momento\/(post|short|reel|video)\/([^/]+)$/
    );
    if (pathMatch?.[2]) return { type: pathMatch[1], id: pathMatch[2] };

    // 2. /momento/shorts?short=<id>  or /momento/shorts?id=<id>
    if (/^\/momento\/shorts\/?$/.test(window.location.pathname)) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("short") || params.get("id");
      return id ? { type: "short", id } : { type: "shorts-list", id: null };
    }

    // 3. /momento/shorts/<id>
    const shortMatch = window.location.pathname.match(/^\/momento\/shorts\/([^/]+)$/);
    if (shortMatch?.[1]) return { type: "short", id: shortMatch[1] };

    // 4. Legacy: /momento?post=…  or /momento?short=…
    const params = new URLSearchParams(window.location.search);
    const q = params.get("post") || params.get("short");
    if (q) return { type: params.get("short") ? "short" : "post", id: q };

    return null;
  } catch {
    return null;
  }
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
   ONBOARDING SCREEN
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center pt-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
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
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-ticket text-[14px] sm:text-[16px] leading-relaxed mb-9 max-w-lg"
          style={{ color: "var(--sp-txt-soft)" }}
        >
          Turn product photos into a social feed that sells. Post, link your
          listings, and let buyers buy with one tap.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
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
          <FaRocket className="text-sm relative z-10" />
          <span className="relative z-10">Enter Momento</span>
          <FaArrowRight className="text-xs relative z-10" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
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
   CREATE POST DIALOG
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

  useEffect(() => { if (show) setStep(1); }, [show]);

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

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-full sm:max-w-2xl flex flex-col overflow-hidden sm:rounded-[28px] rounded-t-[28px]"
            style={{
              background: 'var(--sp-card)',
              border: '1px solid var(--sp-line)',
              height: '92vh',
              maxHeight: '92vh',
            }}
          >
            <div className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b" style={{ borderColor: 'var(--sp-line)' }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black truncate" style={{ color: 'var(--sp-txt)' }}>Sell Something</h2>
                  <p className="text-[10px] sm:text-[11px]" style={{ color: 'var(--sp-txt-soft)' }}>Step {step} of 3</p>
                </div>
                <button onClick={onClose} className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}>
                  <FaTimes className="text-xs" style={{ color: 'var(--sp-txt-soft)' }} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const active = step === s.id;
                  const done = step > s.id;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center"
                        style={{
                          background: done ? 'var(--sp-success)' : active ? 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))' : 'var(--sp-card-2)',
                        }}>
                        {done ? <FaCheckCircle className="text-white text-[9px] sm:text-[10px]" /> : <Icon className="text-[10px] sm:text-[11px]" style={{ color: active ? '#fff' : 'var(--sp-txt-faint)' }} />}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="flex-1 h-[2px] rounded-full" style={{ background: step > s.id ? 'var(--sp-success)' : 'var(--sp-line)' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3 sm:space-y-4 pb-24 sm:pb-5">
              {step === 1 && (
                <>
                  {!postMediaPreview ? (
                    <>
                      <button onClick={() => imageInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center py-10 sm:py-12 rounded-2xl sm:rounded-3xl"
                        style={{ background: 'var(--sp-card-2)', border: '2px dashed var(--sp-line-str)' }}>
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
                          style={{ background: 'var(--sp-primary-soft)' }}>
                          <FaCameraSolid className="text-xl sm:text-2xl" style={{ color: 'var(--sp-primary)' }} />
                        </div>
                        <p className="text-sm font-black" style={{ color: 'var(--sp-txt)' }}>Add photos or videos</p>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--sp-txt-soft)' }}>JPG, PNG, MP4</p>
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { setUploadType('image'); imageInputRef.current?.click(); }}
                          className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl"
                          style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}>
                          <FaImage className="text-sm" style={{ color: 'var(--sp-primary)' }} />
                          <span className="text-xs font-black">Photo</span>
                        </button>
                        {isPaid ? (
                          <button onClick={() => { setUploadType('video'); videoInputRef.current?.click(); }}
                            className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl"
                            style={{ background: 'var(--sp-card-2)', border: '1px solid var(--sp-line)' }}>
                            <FaFileVideo className="text-sm" style={{ color: 'var(--sp-primary)' }} />
                            <span className="text-xs font-black">Video</span>
                          </button>
                        ) : (
                          <button onClick={() => pushToast('info', 'Video is Pro-only')}
                            className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl"
                            style={{ background: 'var(--sp-primary-soft)', border: '1px solid var(--sp-primary)' }}>
                            <FaFileVideo className="text-sm" style={{ color: 'var(--sp-primary)' }} />
                            <span className="text-xs font-black" style={{ color: 'var(--sp-primary)' }}>Video · Pro</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ border: '1px solid var(--sp-line)' }}>
                        {uploadType === 'video' ? (
                          <video src={postMediaPreview} className="w-full h-56 sm:h-64 object-cover" controls playsInline />
                        ) : (
                          <img src={postMediaPreview} alt="" className="w-full h-56 sm:h-64 object-cover" />
                        )}
                        <button onClick={removeMedia}
                          className="absolute top-3 right-3 h-9 w-9 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--sp-txt-soft)' }}>
                      Content * ({postContent.length}/2000)
                    </label>
                    <textarea value={postContent} onChange={e => setPostContent(e.target.value)}
                      placeholder="Describe your product…" rows={5} maxLength={2000}
                      className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm outline-none resize-none"
                      style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1.5px solid var(--sp-line)' }} />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--sp-txt-soft)' }}>
                      Title (optional)
                    </label>
                    <input type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)}
                      placeholder="e.g. iPhone 15 Pro Max"
                      className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm outline-none"
                      style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1.5px solid var(--sp-line)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--sp-txt-soft)' }}>
                        Price
                      </label>
                      <input type="number" value={postPrice} onChange={e => setPostPrice(e.target.value)}
                        placeholder="Rs"
                        className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm outline-none"
                        style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1.5px solid var(--sp-line)' }} />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--sp-txt-soft)' }}>
                        Category
                      </label>
                      <select value={postCategory} onChange={e => setPostCategory(e.target.value)}
                        className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm outline-none"
                        style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1.5px solid var(--sp-line)' }}>
                        <option value="">Select…</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="mobiles">Mobiles</option>
                        <option value="property">Property</option>
                        <option value="electronics">Electronics</option>
                        <option value="toys">Toys</option>
                      </select>
                    </div>
                  </div>
                  {myListings.length > 0 && (
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--sp-txt-soft)' }}>
                        Link a listing
                      </label>
                      <select value={linkedListingId} onChange={e => setLinkedListingId(e.target.value)}
                        className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm outline-none"
                        style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)', border: '1.5px solid var(--sp-line)' }}>
                        <option value="">— None —</option>
                        {myListings.map(l => (
                          <option key={l.id} value={l.id}>{l.title} · {formatPrice(l.price)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2" style={{ color: 'var(--sp-txt-soft)' }}>
                      Post to group *
                    </label>
                    {loadingGroups ? (
                      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--sp-card-2)' }}>
                        <FaSpinner className="animate-spin text-sm" style={{ color: 'var(--sp-primary)' }} />
                        <span className="text-xs">Loading groups…</span>
                      </div>
                    ) : userGroups.length > 0 ? (
                      <div className="space-y-2">
                        {userGroups.map(g => {
                          const isSelected = selectedGroup === g.id;
                          return (
                            <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                              className="w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left"
                              style={{
                                background: isSelected ? 'var(--sp-primary-soft)' : 'var(--sp-card-2)',
                                border: `1.5px solid ${isSelected ? 'var(--sp-primary)' : 'var(--sp-line)'}`,
                              }}>
                              <GroupAvatar group={g} size="h-9 w-9 sm:h-10 sm:w-10" rounded="rounded-lg sm:rounded-xl" />
                              <p className="flex-1 text-xs sm:text-sm font-bold truncate">{g.name}</p>
                              {isSelected && <FaCheckCircle className="shrink-0" style={{ color: 'var(--sp-primary)' }} />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl" style={{ background: 'var(--sp-danger-soft)', border: '1px solid var(--sp-danger)' }}>
                        <p className="text-xs font-bold" style={{ color: 'var(--sp-danger)' }}>No groups joined</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div
              className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 border-t"
              style={{
                borderColor: 'var(--sp-line)',
                background: 'var(--sp-card)',
                paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
              }}
            >
              <button onClick={step === 1 ? onClose : () => setStep(step - 1)} disabled={submitting}
                className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm disabled:opacity-40 shrink-0"
                style={{ background: 'var(--sp-card-2)', color: 'var(--sp-txt)' }}>
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button onClick={nextStep}
                disabled={submitting || (step === 3 && (!selectedGroup || userGroups.length === 0))}
                className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))', color: '#fff' }}>
                {submitting ? (<><FaSpinner className="animate-spin text-sm" /> Posting…</>) :
                 step === 3 ? (<><FaPaperPlane className="text-sm" /> Publish</>) :
                 (<>Continue <FaChevronRight className="text-xs" /></>)}
              </button>
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
   LOADER
   ═══════════════════════════════════════════════════════════════ */
const MomentoLoader = () => (
  <div className="min-h-screen sp-bg flex items-center justify-center">
    <StudyPostsStyles />
    <div className="flex flex-col items-center gap-4">
      <div className="h-14 w-14 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))' }}>
        <FaSpinner className="text-white text-xl animate-spin" />
      </div>
      <p className="font-ticket text-sm font-bold" style={{ color: 'var(--sp-txt-soft)' }}>Loading Momento…</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN MOMENTO
   ═══════════════════════════════════════════════════════════════ */
const Momento = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const planCtx = usePlan();
  const isPaid = planCtx?.planId && planCtx.planId !== "free";

  /* Onboarding */
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return localStorage.getItem('momento.onboarded') !== 'true'; } catch { return true; }
  });

  /* View state */
  const [view, setView] = useState('feed');

  /* ⭐ Deep link state — object form so we can distinguish post vs short */
  const [deepLink, setDeepLink] = useState(() => parseDeepLink());
  const deepLinkId = deepLink?.id || null;
  const deepLinkType = deepLink?.type || null;

  const [deepLinkNotFound, setDeepLinkNotFound] = useState(false);
  const [deepLinkPost, setDeepLinkPost] = useState(null);
  const [deepLinkLoading, setDeepLinkLoading] = useState(false);

  /* ⭐ Fetch a single post by ID (for deep links when not in feed) */
  const fetchPostById = async (postId) => {
    if (!postId) return null;
    try {
      const { data, error } = await supabase
        .from('study_group_posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (error || !data) return null;

      const [uR, sR, gR, lR] = await Promise.all([
        supabase.from('users')
          .select('id, name, full_name, username, email, avatar_url')
          .eq('id', data.user_id).maybeSingle(),
        supabase.from('user_settings')
          .select('user_id, full_name, avatar, avatar_url')
          .eq('user_id', data.user_id).maybeSingle(),
        data.group_id
          ? supabase.from('study_groups').select('id, name, image_url').eq('id', data.group_id).maybeSingle()
          : Promise.resolve({ data: null }),
        data.listing_id
          ? supabase.from('listings')
              .select('id, title, price, cover_image, city, area, category, status, user_id')
              .eq('id', data.listing_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const u = uR.data || {};
      const s = sR.data || {};

      return {
        ...data,
        users: {
          id: data.user_id,
          full_name: s.full_name || u.full_name || u.name,
          name: u.name,
          username: u.username,
          email: u.email,
          avatar_url: s.avatar || s.avatar_url || u.avatar_url || null,
        },
        study_groups: gR.data || null,
        linkedListing: lR.data || null,
      };
    } catch (err) {
      console.error("fetchPostById failed:", err);
      return null;
    }
  };

  /* Shorts + Video upload state */
  const [showShortsViewer, setShowShortsViewer] = useState(false);
  const [shortsStartIndex, setShortsStartIndex] = useState(0);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  /* Feed state */
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});

  /* Create post state */
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

  /* Comments state */
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  /* Filters */
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* Fullscreen */
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [fullscreenMediaType, setFullscreenMediaType] = useState('image');
  const [fullscreenMediaItem, setFullscreenMediaItem] = useState(null);

  /* Highlight */
  const [highlightedPostId, setHighlightedPostId] = useState(null);

  /* Profile stats */
  const [myPostCount, setMyPostCount] = useState(0);
  const [myProfile, setMyProfile] = useState(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  /* Dialog states */
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  /* Edit media */
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [editMediaPreview, setEditMediaPreview] = useState(null);
  const [editUploadType, setEditUploadType] = useState('image');
  const [editRemoveMedia, setEditRemoveMedia] = useState(false);
  const editImageInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const videoRefs = useRef({});
  const myInsertedPostIds = useRef(new Set());
  const viewTracked = useRef(new Set());

  const pushToast = (type, title, message, duration = 3200) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ⭐ UNIVERSAL SHARE */
  const handleSharePost = async (post, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    await shareContent(post, pushToast);
  };

  const focusPost = (postId) => {
    if (!postId) return;
    setHighlightedPostId(postId);
    setTimeout(() => setHighlightedPostId(null), 3200);
    const el = document.querySelector(`[data-post-id="${postId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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

  /* Initial load */
  useEffect(() => {
    fetchPosts();
    fetchUserGroups();
    fetchMyProfile();
    fetchFollowStats();
    fetchMyListings();
    const saved = localStorage.getItem('saved_posts');
    if (saved) { try { setSavedPosts(JSON.parse(saved)); } catch {} }
  }, []);

  /* ⭐ Re-check deep link when URL changes */
  useEffect(() => {
    const handleUrlChange = () => setDeepLink(parseDeepLink());
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  /* ESC key */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showCreateDialog) setShowCreateDialog(false);
        else if (editingPost) setEditingPost(null);
        else if (fullscreenMedia) { setFullscreenMedia(null); setFullscreenMediaItem(null); }
        else if (openMenuPostId) setOpenMenuPostId(null);
        else if (showShortsViewer) setShowShortsViewer(false);
        else if (showVideoUpload) setShowVideoUpload(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [fullscreenMedia, showCreateDialog, editingPost, openMenuPostId, showShortsViewer, showVideoUpload]);

  /* Click outside menu */
  useEffect(() => {
    if (!openMenuPostId) return;
    const close = (e) => {
      if (!e.target.closest("[data-post-menu]")) setOpenMenuPostId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenuPostId]);

  /* Realtime posts subscription */
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
          avatar_url: settingsData?.avatar || settingsData?.avatar_url,
        } : null);
        setPosts((prev) => [{ ...newRow, users: mergedUser, study_groups: groupData || null }, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'study_group_posts' }, (payload) => {
        setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(postsChannel); };
  }, [user]);

  /* View tracking */
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

  /* ⭐ Deep-link → Shorts: open the viewer immediately */
  useEffect(() => {
    if (!deepLink) return;

    // Just the shorts list, no specific video
    if (deepLink.type === "shorts-list") {
      setShortsStartIndex(0);
      setShowShortsViewer(true);
      return;
    }

    // Specific short by id
    if (deepLink.type === "short" && deepLink.id) {
      setShowShortsViewer(true);

      (async () => {
        try {
          const { data } = await supabase
            .from("study_group_posts")
            .select("id")
            .eq("is_short", true)
            .eq("media_type", "video")
            .order("created_at", { ascending: false })
            .limit(100);

          const idx = (data || []).findIndex(
            (s) => String(s.id) === String(deepLink.id)
          );
          setShortsStartIndex(idx >= 0 ? idx : 0);
        } catch {
          setShortsStartIndex(0);
        }
      })();
    }
  }, [deepLink]);

  /* ⭐ Deep-link: fetch by ID if not in feed, then scroll (POSTS ONLY) */
  useEffect(() => {
    if (!deepLinkId) return;

    // Skip if this deep link is a SHORT (handled by the effect above)
    if (deepLinkType === "short" || deepLinkType === "shorts-list") return;

    let cancelled = false;

    (async () => {
      const inFeed = posts.find((p) => String(p.id) === String(deepLinkId));

      if (inFeed) {
        if (cancelled) return;
        setDeepLinkPost(inFeed);
        setDeepLinkNotFound(false);
        setDeepLinkLoading(false);
        return;
      }

      if (loading) return;

      setDeepLinkLoading(true);
      const fetched = await fetchPostById(deepLinkId);
      if (cancelled) return;

      if (fetched) {
        setDeepLinkPost(fetched);
        setDeepLinkNotFound(false);
      } else {
        setDeepLinkPost(null);
        setDeepLinkNotFound(true);
      }
      setDeepLinkLoading(false);
    })();

    return () => { cancelled = true; };
  }, [deepLinkId, deepLinkType, posts, loading]);

  /* ⭐ Scroll + highlight once we have the deep-link post */
  useEffect(() => {
    if (!deepLinkPost) return;

    const t = setTimeout(() => {
      const el = document.querySelector(`[data-post-id="${deepLinkPost.id}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

      setHighlightedPostId(deepLinkPost.id);
      setTimeout(() => setHighlightedPostId(null), 3200);

      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("post");
        url.searchParams.delete("short");
        const hasPath = /^\/momento\/(post|short|reel|video)\//.test(window.location.pathname);
        if (hasPath) {
          window.history.replaceState({}, "", "/momento");
        } else {
          window.history.replaceState({}, "", url.pathname + url.search);
        }
        setDeepLink(null);
      } catch {}
    }, 400);

    return () => clearTimeout(t);
  }, [deepLinkPost]);

  /* Fetchers */
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
        .eq('is_short', false)
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
    } finally {
      setLoading(false);
    }
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
    if (!user) { pushToast('info', 'Sign in required', ''); return; }
    if (post.user_id === user.id) { pushToast('info', 'This is your post', ''); return; }
    (async () => {
      try { await supabase.rpc('increment_post_chats', { p_post_id: post.id }); } catch {}
    })();
    navigate(`/chat?user=${post.user_id}&listing=${post.listing_id || ''}`);
  };

  const handleBuyNow = (post) => {
    if (!user) { pushToast('info', 'Sign in required', ''); return; }
    if (!post.linkedListing) { pushToast('info', 'No listing attached', ''); return; }
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
        pushToast('info', 'Video uploads are a Pro feature', '');
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }
      setUploadType('video');
    } else if (isImageFile(file)) setUploadType('image');
    else { pushToast('error', 'Unsupported file', ''); return; }
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

  const handleCreatePost = async () => {
    if (userGroups.length === 0) { pushToast('info', 'No group joined', ''); return; }
    if (!postContent.trim() && !postMediaFile) { pushToast('info', 'Nothing to post', ''); return; }
    if (!selectedGroup) { pushToast('error', 'Select a group', ''); return; }

    setSubmitting(true);
    try {
      let mediaUrl = null, mediaType = 'image';
      if (postMediaFile) { mediaUrl = await uploadMedia(postMediaFile); mediaType = uploadType; }

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
        is_short: false,
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
      setShowCreateDialog(false);
      pushToast('success', 'Posted!', 'Your moment is live.');
    } catch (err) { pushToast('error', "Couldn't post", err.message); }
    finally { setSubmitting(false); }
  };

  const handleEditMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (isVideoFile(file)) {
      if (!isPaid) { pushToast('info', 'Video is Pro-only', ''); return; }
      setEditUploadType('video');
    } else if (isImageFile(file)) setEditUploadType('image');
    else { pushToast('error', 'Unsupported file', ''); return; }
    setEditMediaFile(file);
    setEditRemoveMedia(false);
    const reader = new FileReader();
    reader.onloadend = () => setEditMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeEditMedia = () => {
    setEditMediaFile(null); setEditMediaPreview(null); setEditRemoveMedia(true); setEditUploadType('image');
    if (editImageInputRef.current) editImageInputRef.current.value = '';
    if (editVideoInputRef.current) editVideoInputRef.current.value = '';
  };

  const openEditDialog = (post) => {
    setEditingPost(post);
    setEditContent(post.content || "");
    setEditTitle(post.title || "");
    setEditPrice(post.price ? String(post.price) : "");
    setOpenMenuPostId(null);
    setEditMediaFile(null);
    setEditMediaPreview(post.image_url || null);
    setEditUploadType(post.media_type || 'image');
    setEditRemoveMedia(false);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    if (!editContent.trim()) { pushToast("error", "Content required", ""); return; }
    setSavingEdit(true);
    try {
      let newMediaUrl = editingPost.image_url;
      let newMediaType = editingPost.media_type || 'image';
      if (editRemoveMedia && !editMediaFile) { newMediaUrl = null; newMediaType = 'image'; }
      else if (editMediaFile) {
        const uploaded = await uploadMedia(editMediaFile);
        if (uploaded) { newMediaUrl = uploaded; newMediaType = editUploadType; }
      }
      const updates = {
        content: editContent,
        title: editTitle || "",
        price: editPrice ? Number(editPrice) : null,
        image_url: newMediaUrl,
        media_type: newMediaType,
      };
      const { error } = await supabase.from("study_group_posts").update(updates).eq("id", editingPost.id);
      if (error) throw error;
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? { ...p, ...updates } : p)));
      pushToast("success", "Post updated", "");
      setEditingPost(null);
    } catch (err) {
      pushToast("error", "Couldn't update", err.message || "");
    } finally { setSavingEdit(false); }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm("Delete this post?")) return;
    setDeletingPostId(post.id);
    try {
      const { error } = await supabase.from("study_group_posts").delete().eq("id", post.id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setMyPostCount((n) => Math.max(0, n - 1));
      pushToast("success", "Post deleted", "");
      setOpenMenuPostId(null);
    } catch (err) {
      pushToast("error", "Couldn't delete", err.message || "");
    } finally { setDeletingPostId(null); }
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

  /* ⭐ filteredPosts — pure feed filter (deep link handled separately above) */
  const filteredPosts = React.useMemo(() => {
    let f = posts;

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

  /* ⭐ What actually renders — if post deep link active, show ONLY that post */
  const postsToRender = React.useMemo(() => {
    // Shorts are handled by the viewer, not the feed
    if (deepLinkType === "short" || deepLinkType === "shorts-list") return filteredPosts;

    if (!deepLinkId && !deepLinkPost) return filteredPosts;
    if (deepLinkPost) return [deepLinkPost];
    return [];
  }, [deepLinkId, deepLinkType, deepLinkPost, filteredPosts]);

  const handleOnboardingComplete = () => {
    try { localStorage.setItem('momento.onboarded', 'true'); } catch {}
    setShowOnboarding(false);
  };

  /* Render gates */
  if (showOnboarding) return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  if (loading) return <MomentoLoader />;

  if (showShortsViewer) {
    return (
      <>
        <StudyPostsStyles />
        <MomentoShorts
          startIndex={shortsStartIndex}
          onClose={() => {
            setShowShortsViewer(false);
            setDeepLink(null);
            try { window.history.replaceState({}, "", "/momento"); } catch {}
          }}
        />
      </>
    );
  }

  /* ⭐ Deep-link active → single-post focused view (POSTS ONLY) */
  const isDeepLinkView =
    !!(deepLinkId || deepLinkPost) &&
    deepLinkType !== "short" &&
    deepLinkType !== "shorts-list";

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
          onClick={() => { setShortsStartIndex(0); setShowShortsViewer(true); }}
          className="relative h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
          title="Watch Shorts"
        >
          <Video className="text-sm" style={{ color: "var(--sp-txt)" }} />
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
              { id: 'shorts',  icon: Video,   label: 'Shorts', special: true },
              { id: 'profile', icon: FaUser,  label: 'My Profile' },
            ].map((item) => {
              const Icon = item.icon;
              const active = item.id === 'shorts' ? false : view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'shorts') {
                      setShortsStartIndex(0);
                      setShowShortsViewer(true);
                    } else {
                      setView(item.id);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all font-semibold text-[13px]"
                  style={active
                    ? { background: "var(--sp-primary-soft)", color: "var(--sp-primary)", border: "1px solid var(--sp-primary)" }
                    : item.id === 'shorts'
                      ? { background: "linear-gradient(135deg, var(--sp-primary-soft), transparent)", color: "var(--sp-primary)", border: "1px solid var(--sp-primary)" }
                      : { color: "var(--sp-txt-soft)", border: "1px solid transparent" }}
                >
                  <Icon className="text-[15px]" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'shorts' && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase"
                      style={{ background: "var(--sp-primary)", color: "#fff" }}>New</span>
                  )}
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
            onClick={() => setShowVideoUpload(true)}
            className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 mb-3 transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "transparent",
              border: `2px dashed var(--sp-primary)`,
              color: "var(--sp-primary)",
            }}
          >
            <FaFileVideo className="text-sm" />
            Upload Short
          </button>

          <button
            onClick={() => setShowCreateDialog(true)}
            className="group relative w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))`, color: "#fff", boxShadow: `0 12px 28px -10px var(--sp-primary-glow)` }}
          >
            <FaPlus className="text-sm relative z-10" />
            <span className="relative z-10">Sell Something</span>
          </button>
        </aside>

        {/* MAIN */}
        <main className="min-w-0">
          <AnimatePresence mode="wait">
            {view === 'feed' ? (
              <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* HIDE Fresh Drops + filters during deep link */}
                {!isDeepLinkView && posts.length > 0 && (
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
                          <button onClick={() => focusPost(p.id)} className="flex flex-col items-center gap-2 w-full">
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
                          <button onClick={(e) => handleSharePost(p, e)}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                            <FaShare style={{ fontSize: 9 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HIDE filter chips during deep link */}
                {!isDeepLinkView && (
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
                )}

                {/* BACK TO FEED banner during deep link */}
                {isDeepLinkView && (
                  <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-2xl"
                    style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FaNewspaper className="text-sm flex-shrink-0" style={{ color: "var(--sp-primary)" }} />
                      <p className="text-xs font-bold truncate" style={{ color: "var(--sp-txt)" }}>
                        Viewing shared post
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDeepLink(null);
                        setDeepLinkPost(null);
                        setDeepLinkNotFound(false);
                        try { window.history.replaceState({}, "", "/momento"); } catch {}
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 flex-shrink-0"
                      style={{ background: "var(--sp-primary)", color: "#fff" }}
                    >
                      <FaArrowRight className="text-[10px] rotate-180" />
                      Back to Feed
                    </button>
                  </div>
                )}

                {/* LOADING state (deep link fetching) */}
                {isDeepLinkView && deepLinkLoading && (
                  <div className="text-center py-20 sp-card rounded-3xl">
                    <FaSpinner className="text-3xl animate-spin mx-auto mb-4" style={{ color: "var(--sp-primary)" }} />
                    <p className="text-sm font-bold" style={{ color: "var(--sp-txt-soft)" }}>
                      Loading post…
                    </p>
                  </div>
                )}

                {/* POST NOT FOUND state */}
                {isDeepLinkView && !deepLinkLoading && deepLinkNotFound && (
                  <div className="text-center py-20 sp-card rounded-3xl">
                    <div className="h-20 w-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
                      style={{ background: "var(--sp-card-2)", border: "1px solid var(--sp-line)" }}>
                      <FaExclamationTriangle className="text-3xl" style={{ color: "var(--sp-danger)" }} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--sp-txt)" }}>
                      Post not found
                    </h3>
                    <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--sp-txt-soft)" }}>
                      This post may have been deleted, or the link is broken.
                    </p>
                    <button
                      onClick={() => {
                        setDeepLink(null);
                        setDeepLinkPost(null);
                        setDeepLinkNotFound(false);
                        setDeepLinkLoading(false);
                        try { window.history.replaceState({}, "", "/momento"); } catch {}
                      }}
                      className="mt-6 px-7 py-3 rounded-2xl text-white font-black text-sm inline-flex items-center gap-2"
                      style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}
                    >
                      <FaArrowRight className="text-xs rotate-180" />
                      Back to Feed
                    </button>
                  </div>
                )}

                {/* NO POSTS state (feed empty, not deep link) */}
                {!isDeepLinkView && postsToRender.length === 0 && (
                  <div className="text-center py-20 sp-card rounded-3xl">
                    <div className="h-20 w-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
                      style={{ background: "var(--sp-card-2)", border: "1px solid var(--sp-line)" }}>
                      <FaNewspaper className="text-3xl" style={{ color: "var(--sp-primary)" }} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--sp-txt)" }}>
                      {activeFilter === 'saved' ? 'No saved posts' : 'Nothing here yet'}
                    </h3>
                    <button onClick={() => setShowCreateDialog(true)}
                      className="mt-6 px-7 py-3 rounded-2xl text-white font-black text-sm"
                      style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
                      Sell Something
                    </button>
                  </div>
                )}

                {/* POSTS GRID */}
                {postsToRender.length > 0 && (
                  <div className="space-y-4">
                    {postsToRender.map((post, i) => {
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
                            opacity: 1, y: 0,
                            boxShadow: highlightedPostId === post.id
                              ? "0 0 0 3px var(--sp-primary)"
                              : "0 0 0 0px transparent",
                          }}
                          transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                          className="sp-card rounded-3xl overflow-hidden"
                        >
                          <div className="flex items-center gap-3 p-4">
                            <div className="p-[2px] rounded-full sp-story-ring">
                              <div className="p-[2px] rounded-full" style={{ background: "var(--sp-card)" }}>
                                <UserAvatar profile={post.users} size="h-11 w-11" textSize="text-sm" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="text-[13px] sm:text-sm font-black truncate min-w-0"
                                  style={{ color: "var(--sp-txt)" }}
                                >
                                  {authorName}
                                </span>

                                {hasListing && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded text-[7px] sm:text-[8px] font-black uppercase flex-shrink-0"
                                    style={{ background: "var(--sp-success-soft)", color: "var(--sp-success)" }}
                                  >
                                    <FaTag className="text-[6px] sm:text-[7px]" />
                                    <span className="hidden xs:inline">Live</span>
                                  </span>
                                )}

                                {!isMine && (
                                  <div className="ml-auto flex-shrink-0">
                                    <FollowButton
                                      targetUserId={post.user_id}
                                      size="sm"
                                      variant="minimal"
                                    />
                                  </div>
                                )}
                              </div>

                              <p
                                className="text-[10px] sm:text-[11px] truncate mt-0.5"
                                style={{ color: "var(--sp-txt-soft)" }}
                              >
                                {formatTimeAgo(post.created_at)}
                                {post.category && <span className="opacity-70"> · {post.category}</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => handleSharePost(post, e)} className="p-2 rounded-xl" title="Share">
                                <FaShare className="text-sm" style={{ color: "var(--sp-txt-soft)" }} />
                              </button>
                              {isMine && (
                                <div className="relative" data-post-menu>
                                  <button onClick={() => setOpenMenuPostId((id) => (id === post.id ? null : post.id))}
                                    className="p-2 rounded-xl">
                                    <FaEllipsisH className="text-sm" style={{ color: "var(--sp-txt-soft)" }} />
                                  </button>
                                  <AnimatePresence>
                                    {openMenuPostId === post.id && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                        className="absolute right-0 top-full mt-1 z-30 min-w-[170px] rounded-xl overflow-hidden shadow-2xl"
                                        style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line-str)" }}
                                      >
                                        <button onClick={() => openEditDialog(post)}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold"
                                          style={{ color: "var(--sp-txt)" }}>
                                          <FaEdit className="text-[11px]" style={{ color: "var(--sp-primary)" }} />
                                          Edit Post
                                        </button>
                                        <div style={{ height: 1, background: "var(--sp-line)" }} />
                                        <button onClick={(e) => { setOpenMenuPostId(null); handleSharePost(post, e); }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold"
                                          style={{ color: "var(--sp-txt)" }}>
                                          <FaShare className="text-[11px]" style={{ color: "var(--sp-primary)" }} />
                                          Share
                                        </button>
                                        <div style={{ height: 1, background: "var(--sp-line)" }} />
                                        <button onClick={() => handleDeletePost(post)}
                                          disabled={deletingPostId === post.id}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold"
                                          style={{ color: "var(--sp-danger)" }}>
                                          <FaTrash className="text-[11px]" /> Delete
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
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
                              <div className="rounded-2xl overflow-hidden cursor-pointer"
                                onClick={() => {
                                  setFullscreenMedia(post.image_url);
                                  setFullscreenMediaType(post.media_type || getMediaTypeFromUrl(post.image_url));
                                  setFullscreenMediaItem(post);
                                }}>
                                {(post.media_type || getMediaTypeFromUrl(post.image_url)) === 'video' ? (
                                  <video ref={el => videoRefs.current[post.id] = el}
                                    src={post.image_url} className="w-full object-cover max-h-[560px]"
                                    autoPlay playsInline loop muted />
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
                                  {post.linkedListing.city}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="px-4 py-3 flex items-center gap-2 border-t" style={{ borderColor: "var(--sp-line)" }}>
                            <button onClick={() => handleSave(post.id)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                              style={{ color: isSaved ? "var(--sp-primary)" : "var(--sp-txt-soft)" }}>
                              {isSaved ? <FaBookmark className="text-[13px]" /> : <FaRegBookmark className="text-[13px]" />}
                              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                            <button onClick={(e) => handleSharePost(post, e)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                              style={{ color: "var(--sp-txt-soft)" }}>
                              <FaShare className="text-[13px]" />
                              <span className="hidden sm:inline">Share</span>
                            </button>
                            {!isMine && (
                              <button onClick={() => handleChatSeller(post)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                                style={{ color: "var(--sp-txt)" }}>
                                <FaCommentDots className="text-[13px]" />
                                <span className="hidden sm:inline">Chat</span>
                              </button>
                            )}
                            {!isMine && hasListing ? (
                              <button onClick={() => handleBuyNow(post)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-primary">
                                <FaBolt className="text-[13px]" />
                                <span>Buy</span>
                              </button>
                            ) : hasListing ? (
                              <button onClick={() => handleViewListing(post)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sp-action-secondary"
                                style={{ color: "var(--sp-txt)" }}>
                                <FaExternalLinkAlt className="text-[11px]" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                            ) : null}
                          </div>

                          <div className="px-4 pb-3 flex items-center gap-4 text-[11px] font-semibold flex-wrap"
                            style={{ color: "var(--sp-txt-faint)" }}>
                            <span className="inline-flex items-center gap-1.5">
                              <FaEye className="text-[10px]" />
                              <span className="tabular-nums">{formatCount(post.views || 0)}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FaBookmark className="text-[10px]" />
                              <span className="tabular-nums">{formatCount(post.saves || 0)}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <FaCommentDots className="text-[10px]" />
                              <span className="tabular-nums">{formatCount(post.chats || post.comments || 0)}</span>
                            </span>
                          </div>

                          {hasListing && (
                            <button onClick={() => handleViewListing(post)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border-t"
                              style={{ borderColor: "var(--sp-line)", background: "var(--sp-primary-soft)" }}>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--sp-primary)" }}>
                                  Full listing
                                </p>
                                <p className="text-[12px] font-semibold truncate" style={{ color: "var(--sp-txt)" }}>
                                  {post.linkedListing.title}
                                </p>
                              </div>
                              <FaArrowRight className="text-xs" style={{ color: "var(--sp-primary)" }} />
                            </button>
                          )}

                          <AnimatePresence>
                            {showComments[post.id] && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 pt-2 space-y-3 overflow-hidden border-t" style={{ borderColor: "var(--sp-line)" }}>
                                <div className="flex gap-2.5 pt-3">
                                  <UserAvatar user={user} profile={myProfile} size="h-9 w-9" />
                                  <div className="flex-1 flex gap-2">
                                    <input type="text" placeholder="Ask seller a question…"
                                      value={commentText[post.id] || ''}
                                      onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyPress={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                      className="flex-1 px-4 py-2.5 sp-input rounded-2xl text-xs outline-none" />
                                    <button onClick={() => handleCommentSubmit(post.id)}
                                      disabled={submittingComment[post.id]}
                                      className="px-4 py-2.5 rounded-2xl text-white text-xs font-bold disabled:opacity-40"
                                      style={{ background: `linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))` }}>
                                      <FaPaperPlane className="text-xs" />
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
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--sp-txt)" }}>{c.content}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button onClick={() => toggleComments(post.id)}
                            className="w-full text-center py-2 text-[11px] font-bold border-t"
                            style={{ borderColor: "var(--sp-line)", color: "var(--sp-txt-soft)" }}>
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
                <MomentoProfile
                  onBack={() => setView('feed')}
                  onOpenShorts={(i) => { setShortsStartIndex(i); setShowShortsViewer(true); }}
                  onOpenPost={(post) => { setView('feed'); setTimeout(() => focusPost(post.id), 200); }}
                  isOwnProfile={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="sp-bottomnav">
        <button onClick={() => setView('feed')}
          className={`sp-bottomnav__item ${view === 'feed' ? 'sp-bottomnav__item--active' : ''}`}>
          <FaHome /><span>Feed</span>
        </button>
        <button onClick={() => { setShortsStartIndex(0); setShowShortsViewer(true); }}
          className="sp-bottomnav__item">
          <Video /><span>Shorts</span>
        </button>
        <button onClick={() => setShowCreateDialog(true)} className="sp-bottomnav__center">
          <span className="sp-bottomnav__center-inner"><FaPlus className="text-base" /></span>
        </button>
        <button onClick={() => { setShowVideoUpload(true); }} className="sp-bottomnav__item">
          <FaFileVideo /><span>Upload</span>
        </button>
        <button onClick={() => setView('profile')}
          className={`sp-bottomnav__item ${view === 'profile' ? 'sp-bottomnav__item--active' : ''}`}>
          <FaUser /><span>Profile</span>
        </button>
      </nav>

      {/* CREATE POST DIALOG */}
      <CreatePostDialog
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
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

      {/* VIDEO UPLOAD MODAL */}
      <VideoUploadModal
        show={showVideoUpload}
        onClose={() => setShowVideoUpload(false)}
        onSuccess={(post) => {
          pushToast('success', 'Short published!', 'Your video is live in Shorts.');
        }}
        userGroups={userGroups}
        user={user}
      />

      {/* EDIT POST DIALOG */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[300] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="sp-card max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col"
              style={{ borderRadius: 24 }}
            >
              <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--sp-line)" }}>
                <h2 className="text-lg font-black" style={{ color: "var(--sp-txt)" }}>Edit Post</h2>
                <button onClick={() => setEditingPost(null)} className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--sp-card-2)" }}>
                  <FaTimes className="text-sm" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "var(--sp-txt-soft)" }}>
                    Title
                  </label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl sp-input text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "var(--sp-txt-soft)" }}>
                    Price
                  </label>
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl sp-input text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "var(--sp-txt-soft)" }}>
                    Content
                  </label>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                    rows={5} className="w-full px-4 py-3 rounded-xl sp-input text-sm outline-none resize-none" />
                </div>
              </div>

              <div className="px-6 py-4 flex gap-3 border-t" style={{ borderColor: "var(--sp-line)" }}>
                <button onClick={() => setEditingPost(null)} disabled={savingEdit}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "var(--sp-card-2)", color: "var(--sp-txt)" }}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={savingEdit || !editContent.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}>
                  {savingEdit ? <FaSpinner className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN MEDIA */}
      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[110] flex items-center justify-center p-4"
            onClick={() => { setFullscreenMedia(null); setFullscreenMediaItem(null); }}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}>
              {fullscreenMediaType === 'video' ? (
                <video src={fullscreenMedia} className="max-h-[90vh] rounded-2xl" controls autoPlay playsInline />
              ) : (
                <img src={fullscreenMedia} alt="" className="max-h-[90vh] object-contain rounded-2xl" />
              )}

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fullscreenMediaItem) {
                      handleSharePost(fullscreenMediaItem);
                    } else {
                      copyContentLink({ id: null }, pushToast);
                    }
                  }}
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white transition"
                  title="Share"
                >
                  <FaShare className="text-lg" />
                </button>

                <button onClick={() => { setFullscreenMedia(null); setFullscreenMediaItem(null); }}
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white transition">
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SnackbarHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Momento;