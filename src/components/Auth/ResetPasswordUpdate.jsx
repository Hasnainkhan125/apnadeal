// pages/auth/ResetPasswordUpdate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaUserCheck,
  FaInfoCircle,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaCloud,
  FaTimes,
  FaSpinner,
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
   FONTS + THEME TOKENS (identical to SignIn / SignUp)
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .auth-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

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

      --hf-amber:         #fc9d03;
      --hf-amber-soft:    rgba(252,157,3,0.14);
      --hf-amber-border:  rgba(252,157,3,0.40);
      --hf-amber-txt:     #fc9d03;
      --hf-amber-glow:    rgba(252,157,3,0.35);
      --hf-amber-dark:    #0A0A12;

      --hf-danger:        #FF6B6B;
      --hf-danger-soft:   rgba(255,107,107,0.10);
      --hf-success:       #4ADE80;
      --hf-success-soft:  rgba(74,222,128,0.10);
      --hf-logo-bg:       #fc9d03;
      --hf-logo-txt:      #0A0A12;
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

      --hf-amber:         #fc9d03;
      --hf-amber-soft:    rgba(252,157,3,0.12);
      --hf-amber-border:  rgba(252,157,3,0.42);
      --hf-amber-txt:     #B87B00;
      --hf-amber-glow:    rgba(252,157,3,0.35);
      --hf-amber-dark:    #0A0A12;

      --hf-danger:        #DC2626;
      --hf-danger-soft:   rgba(220,38,38,0.08);
      --hf-success:       #16A34A;
      --hf-success-soft:  rgba(22,163,74,0.10);
      --hf-logo-bg:       #fc9d03;
      --hf-logo-txt:      #0A0A12;
      --hf-close-bg:      rgba(20,20,30,0.06);
      --hf-close-bg-hov:  rgba(20,20,30,0.12);
    }

    .hf-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 20px;
      border-radius: 10px;
      background: var(--hf-btn-bg);
      color: var(--hf-txt);
      border: 1px solid var(--hf-btn-border);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.005em;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    }
    .hf-btn:hover:not(:disabled) {
      background: var(--hf-btn-bg-hover);
      border-color: var(--hf-btn-border-hover);
    }
    .hf-btn:active:not(:disabled) { transform: scale(0.99); }
    .hf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .hf-btn--primary {
      background: var(--hf-amber);
      border-color: var(--hf-amber);
      color: var(--hf-amber-dark);
      font-weight: 800;
      box-shadow: 0 8px 24px -8px var(--hf-amber-glow);
    }
    .hf-btn--primary:hover:not(:disabled) {
      filter: brightness(1.06);
      box-shadow: 0 10px 28px -8px var(--hf-amber-glow);
    }

    /* ═══════ MOBILE PILL BUTTONS ═══════ */
    .hf-mob-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 22px;
      border-radius: 999px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.005em;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform 0.12s ease, filter 0.15s ease, background 0.15s ease;
    }
    .hf-mob-btn:active:not(:disabled) { transform: scale(0.98); }
    .hf-mob-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .hf-mob-btn--ghost {
      background: rgba(20,20,22,0.55);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.14);
      backdrop-filter: blur(12px) saturate(120%);
      -webkit-backdrop-filter: blur(12px) saturate(120%);
      font-weight: 600;
      box-shadow: 0 8px 24px -10px rgba(0,0,0,0.4);
    }
    .hf-mob-btn--ghost:hover:not(:disabled) {
      background: rgba(20,20,22,0.7);
    }

    .hf-mob-btn--amber {
      background: var(--hf-amber);
      color: var(--hf-amber-dark);
      font-weight: 800;
      box-shadow: 0 10px 24px -10px var(--hf-amber-glow);
    }
    .hf-mob-btn--amber:hover:not(:disabled) {
      filter: brightness(1.06);
    }

    .hf-input {
      width: 100%;
      padding: 14px 16px 14px 44px;
      border-radius: 10px;
      background: var(--hf-panel-soft);
      color: var(--hf-txt);
      border: 1px solid var(--hf-line);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .hf-input::placeholder { color: var(--hf-txt-faint); }
    .hf-input:focus {
      border-color: var(--hf-amber);
      box-shadow: 0 0 0 3px var(--hf-amber-soft);
    }

    .hf-input-mob {
      width: 100%;
      padding: 16px 16px 16px 46px;
      border-radius: 14px;
      background: rgba(20,20,22,0.55);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.16);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14.5px;
      outline: none;
      backdrop-filter: blur(12px) saturate(120%);
      -webkit-backdrop-filter: blur(12px) saturate(120%);
      transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }
    .hf-input-mob::placeholder { color: rgba(255,255,255,0.5); }
    .hf-input-mob:focus {
      border-color: var(--hf-amber);
      background: rgba(20,20,22,0.7);
      box-shadow: 0 0 0 3px rgba(252,157,3,0.28);
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
  `}</style>
);

// ═══ BULLETPROOF LOGO ═══
const LogoImage = ({ className = "h-full w-full object-contain p-1" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="h-full w-full flex items-center justify-center font-black text-lg rounded-lg"
        style={{ background: "var(--hf-logo-bg)", color: "var(--hf-logo-txt)" }}>
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

const ResetPasswordUpdate = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const videoRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => { setVideoError(false); }, [currentVideoIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── OTP flow: verify recovery session exists ── */
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please request a new reset code.');
        setErrorType('token_error');
      }
    };
    checkSession();
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

  const getErrorIcon = (type) => {
    switch (type) {
      case 'token_error':
      case 'auth_error':
        return <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />;
      case 'password_required':
      case 'password_short':
      case 'password_mismatch':
        return <FaLock className="flex-shrink-0 mt-0.5" />;
      default:
        return <FaInfoCircle className="flex-shrink-0 mt-0.5" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setSuccess('');

    if (!password.trim()) {
      setError('Please enter a new password.');
      setErrorType('password_required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setErrorType('password_short');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setErrorType('password_mismatch');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error);
        setErrorType('auth_error');
      } else {
        setSuccess('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    }
    setLoading(false);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

  const currentVideo = BRAND_VIDEOS[currentVideoIndex];

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
                    "radial-gradient(900px 500px at 20% 0%, rgba(252,157,3,0.15), transparent 60%), linear-gradient(180deg, #0A0A12 0%, #14141A 100%)",
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Previous video"
          >
            <FaChevronLeft className="text-[12px]" />
          </motion.button>
          <motion.button
            onClick={goToNextVideo}
            disabled={isTransitioning}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Next video"
          >
            <FaChevronRight className="text-[12px]" />
          </motion.button>

          <div className="absolute inset-x-0 bottom-0 z-10 p-8 lg:p-12">
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              <FaCloud className="text-[10px]" />
              {currentVideo.tag}
            </div>

            <h3 className="text-white font-black tracking-tight leading-[1.05] mb-2"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              {currentVideo.title}
            </h3>

            <p className="text-white/70 text-[14px] font-medium leading-snug mb-6 max-w-[420px]">
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
                    maxWidth: 48,
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-5 mt-5">
              {BRAND_VIDEOS.map((v, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold transition-opacity"
                  style={{ color: i === currentVideoIndex ? "#fff" : "rgba(255,255,255,0.45)" }}
                >
                  {v.title.split(" ").slice(0, 2).join(" ")}
                </span>
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
            onClick={() => navigate('/signin')}
            className="absolute top-5 right-5 z-20 h-10 w-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: "var(--hf-close-bg)", color: "var(--hf-txt)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hf-close-bg-hov)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--hf-close-bg)"; }}
            aria-label="Close"
          >
            <FaTimes className="text-[13px]" />
          </button>

          <div className="min-h-full flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 w-full">
            <div className="w-full max-w-[440px] flex flex-col">

              {/* Logo */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="flex justify-center mb-5"
              >
                <div className="h-12 w-12 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--hf-logo-bg)" }}
                >
                  <LogoImage />
                </div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="text-center mb-8"
              >
                <h2 className="font-black tracking-tight mb-2"
                  style={{ color: "var(--hf-txt)", fontSize: "clamp(28px, 3vw, 36px)", letterSpacing: "-0.02em" }}
                >
                  Set new password
                </h2>
                <p className="text-[14px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                  Choose a strong and secure password
                </p>
              </motion.div>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-3 p-3 rounded-lg flex items-start gap-2 overflow-hidden text-[12.5px] font-semibold"
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
                      <FaTimes className="text-[10px]" />
                    </button>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-3 p-3 rounded-lg flex items-center gap-2 overflow-hidden text-[12.5px] font-semibold"
                    style={{ background: "var(--hf-success-soft)", color: "var(--hf-success)" }}
                  >
                    <FaUserCheck className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
              >
                {/* New Password */}
                <motion.div variants={itemVariants} className="relative">
                  <FaLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    placeholder="New password (min 6 characters)"
                    className="hf-input"
                    style={{ paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash className="text-[14px]" /> : <FaEye className="text-[14px]" />}
                  </button>
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="relative">
                  <FaLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    required
                    placeholder="Confirm password"
                    className="hf-input"
                    style={{ paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                    style={{ color: "var(--hf-txt-faint)" }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-[14px]" /> : <FaEye className="text-[14px]" />}
                  </button>
                </motion.div>

                {/* Match indicator */}
                <AnimatePresence>
                  {confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-1.5 text-[10.5px] font-bold"
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

                {/* Submit */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="hf-btn hf-btn--primary mt-2"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-[#0A0A12] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Update Password
                      <FaArrowRight className="text-[12px]" />
                    </>
                  )}
                </motion.button>

                <motion.div variants={itemVariants} className="text-center mt-3">
                  <Link
                    to="/signin"
                    className="text-[12.5px] inline-flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-80"
                    style={{ color: "var(--hf-txt-soft)" }}
                  >
                    <FaArrowLeft className="text-[11px]" />
                    Back to Sign In
                  </Link>
                </motion.div>
              </motion.form>

              {/* SSO footer */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-6 pt-5 border-t flex items-center justify-center gap-2 text-[11.5px]"
                style={{ borderColor: "var(--hf-line)", color: "var(--hf-txt-faint)" }}
              >
                <FaCloud className="text-[11px]" />
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
                    "radial-gradient(700px 500px at 20% 0%, rgba(252,157,3,0.22), transparent 60%), linear-gradient(180deg, #0A0A12 0%, #1A0A2E 100%)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Black backdrop blur overlay */}
          <div className="hf-mob-backdrop" aria-hidden="true" />

          {/* Close (X) button top-right */}
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="absolute top-4 right-4 z-30 h-11 w-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(20,20,22,0.6)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#FFFFFF",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
            }}
            aria-label="Close"
          >
            <FaTimes className="text-[15px]" />
          </button>

          {/* Content (scrollable) */}
          <div className="relative z-20 flex-1 flex flex-col hf-noscroll overflow-y-auto px-5 pt-20 pb-10">
            <div className="flex-1 flex flex-col justify-end min-h-0">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-5"
              >
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{ background: "#fc9d03", boxShadow: "0 14px 34px -10px rgba(252,157,3,0.6)" }}
                >
                  <LogoImage />
                </div>
              </motion.div>

              {/* ⭐ Modern Heading */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-center mb-7 flex flex-col items-center"
              >
                {/* Small brand chip above */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[10.5px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: "rgba(252,157,3,0.15)",
                    border: "1px solid rgba(252,157,3,0.35)",
                    color: "#fc9d03",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#fc9d03", boxShadow: "0 0 8px #fc9d03" }}
                  />
                  Final step
                </span>

                {/* Main heading with gradient */}
                <h1
                  className="font-black tracking-tight leading-[1.05]"
                  style={{
                    fontSize: "clamp(30px, 8.5vw, 42px)",
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 55%, #fc9d03 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    filter: "drop-shadow(0 2px 20px rgba(0,0,0,0.55))",
                  }}
                >
                  Set new password
                </h1>

                {/* Subtitle */}
                <p
                  className="mt-2 text-[13px] font-medium"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  Choose a strong and secure password
                </p>
              </motion.div>

              {/* Error / success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-3 p-3 rounded-2xl flex items-start gap-2 overflow-hidden text-[12.5px] font-semibold"
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
                      <FaTimes className="text-[10px]" />
                    </button>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-3 p-3 rounded-2xl flex items-center gap-2 overflow-hidden text-[12.5px] font-semibold"
                    style={{
                      background: "rgba(74,222,128,0.15)",
                      color: "#8CFFB8",
                      border: "1px solid rgba(74,222,128,0.3)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <FaUserCheck className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ MOBILE FORM ═══ */}
              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
              >
                {/* New Password */}
                <motion.div
                  variants={itemVariants}
                  style={{ position: "relative", width: "100%" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      color: "rgba(255,255,255,0.7)",
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    placeholder="New password (min 6)"
                    className="hf-input-mob"
                    style={{ paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      color: "rgba(255,255,255,0.7)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash style={{ fontSize: 14 }} /> : <FaEye style={{ fontSize: 14 }} />}
                  </button>
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  variants={itemVariants}
                  style={{ position: "relative", width: "100%" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      color: "rgba(255,255,255,0.7)",
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    required
                    placeholder="Confirm password"
                    className="hf-input-mob"
                    style={{ paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      color: "rgba(255,255,255,0.7)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <FaEyeSlash style={{ fontSize: 14 }} /> : <FaEye style={{ fontSize: 14 }} />}
                  </button>
                </motion.div>

                {/* Match indicator */}
                <AnimatePresence>
                  {confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-1.5 text-[10.5px] font-bold px-1"
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

                {/* Submit — amber pill */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="hf-mob-btn hf-mob-btn--amber mt-1"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-[14px]" />
                  ) : (
                    <>
                      Update Password
                      <FaArrowRight className="text-[14px]" />
                    </>
                  )}
                </motion.button>

                {/* Back to Sign In — ghost pill */}
                <motion.div variants={itemVariants}>
                  <Link
                    to="/signin"
                    className="hf-mob-btn hf-mob-btn--ghost"
                  >
                    <FaArrowLeft className="text-[12px]" />
                    Back to Sign In
                  </Link>
                </motion.div>
              </motion.form>

              {/* SSO footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-6 pt-5 border-t flex items-center justify-center gap-2 text-[11.5px]"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
              >
                <FaCloud className="text-[11px]" />
                SSO available on{' '}
                <a href="#" className="underline underline-offset-2 font-semibold"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Scale
                </a>
                {' '}and{' '}
                <a href="#" className="underline underline-offset-2 font-semibold"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Enterprise
                </a>
                {' '}plans
              </motion.div>
{/* Video dots */}
<motion.div
  variants={itemVariants}
  className="flex items-center justify-center gap-2.5 mt-6"
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
          width: isActive ? 28 : 8,
          background: isActive ? "#FFFFFF" : "rgba(255,255,255,0.35)",
          transform: isActive ? "scaleY(1.15)" : "scaleY(1)",
        }}
        aria-label={`Go to slide ${i + 1}`}
      />
    );
  })}
</motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordUpdate; 