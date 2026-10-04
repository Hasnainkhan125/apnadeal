// pages/auth/ResetPasswordVerify.jsx
// ⭐ Brand: signature logo gradient (#F7941D → #ED6E1F → #D4521A)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaRedo,
  FaChevronLeft,
  FaChevronRight,
  FaCloud,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const OTP_LENGTH = 8;
const RESEND_COOLDOWN = 60;

/* ═══════════════════════════════════════════════════════════════
   3 VIDEO URLS (DESKTOP ONLY)
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
    src: "https://cdn.dribbble.com/userupload/48743776/file/c4917ac1ab3155f709d7174976f84c25.mp4",
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
   FONTS + TOKENS
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .auth-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    :root {
      --brand-grad-start: #F7941D;
      --brand-grad-mid:   #ED6E1F;
      --brand-grad-end:   #D4521A;
      --brand-grad:       linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%);
    }

    /* ── DARK THEME ── */
    html.theme-dark, .theme-dark {
      --hf-backdrop:      rgba(0,0,0,0.65);
      --hf-shell:         #0F0F14;
      --hf-shell-2:       #16161C;
      --hf-panel:         #1A1A20;
      --hf-panel-soft:    #212127;
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

    /* ═══════ DESKTOP BUTTONS ═══════ */
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

    /* ═══════ MOBILE PILL BUTTONS — theme-aware ═══════ */
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
      transition: transform 0.12s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease;
      line-height: 1.25;
      text-align: center;
      white-space: normal;
      word-break: break-word;
      height: auto;
      min-height: 44px;
      text-decoration: none;
    }
    .hf-mob-btn:active:not(:disabled) { transform: scale(0.98); }
    .hf-mob-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .hf-mob-btn svg { flex-shrink: 0; }

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

    .hf-mob-btn--ghost {
      background: var(--hf-panel);
      color: var(--hf-txt);
      border: 1px solid var(--hf-line);
      font-weight: 600;
    }
    .hf-mob-btn--ghost:hover:not(:disabled) {
      background: var(--hf-panel-soft);
      border-color: var(--hf-line-str);
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

    /* ═══════ OTP INPUT — theme aware ═══════ */
    .hf-otp-input {
      font-family: 'Inter', system-ui, sans-serif;
      text-align: center;
      font-weight: 700;
      border-radius: 10px;
      outline: none;
      caret-color: #ED6E1F;
      background: var(--hf-panel-soft);
      color: var(--hf-txt);
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }

    .hf-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 5px;
      border: 1.5px solid var(--hf-line-str);
      background: var(--hf-panel-soft);
      cursor: pointer;
      position: relative;
      transition: all 0.15s ease;
      flex-shrink: 0;
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

    /* ═══════ MOBILE SAFE-AREA + SCROLL ═══════ */
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
    }

    @media (max-width: 360px) {
      .hf-mob-btn {
        padding: 10px 14px;
        font-size: 12.5px;
        min-height: 40px;
      }
      .hf-btn {
        padding: 9px 12px;
        font-size: 12px;
        min-height: 38px;
      }
      .hf-otp-input {
        width: 30px !important;
        height: 42px !important;
        font-size: 15px !important;
      }
    }

    @media (max-height: 500px) and (max-width: 1023px) {
      .hf-mob-content-tight {
        padding-top: calc(env(safe-area-inset-top, 0px) + 44px) !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px) !important;
      }
    }

    /* ⭐ Lock brand-gradient buttons */
    .hf-btn.hf-btn--primary,
    .hf-btn.hf-btn--primary:hover,
    .hf-btn.hf-btn--primary:focus,
    .hf-btn.hf-btn--primary:focus-visible,
    .hf-btn.hf-btn--primary:active,
    .theme-light .hf-btn.hf-btn--primary,
    .theme-dark .hf-btn.hf-btn--primary,
    .hf-mob-btn.hf-mob-btn--amber,
    .hf-mob-btn.hf-mob-btn--amber:hover,
    .hf-mob-btn.hf-mob-btn--amber:focus,
    .hf-mob-btn.hf-mob-btn--amber:focus-visible,
    .hf-mob-btn.hf-mob-btn--amber:active,
    .theme-light .hf-mob-btn.hf-mob-btn--amber,
    .theme-dark .hf-mob-btn.hf-mob-btn--amber {
      background: linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%) !important;
      background-image: linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%) !important;
      background-color: #ED6E1F !important;
      color: #FFFFFF !important;
      -webkit-text-fill-color: #FFFFFF !important;
      border-color: transparent !important;
    }
  `}</style>
);

// ═══ BULLETPROOF LOGO ═══
const LogoImage = ({ className = "h-full w-full rounded-full object-contain p-1" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div className="h-full w-full flex items-center justify-center font-black text-base rounded-lg"
        style={{ background: "var(--brand-grad)", color: "#FFFFFF" }}>
        D
      </div>
    );
  }
  return (
    <img src={sources[idx]} alt="Dealora" className={className}
      onError={() => { if (idx < sources.length - 1) setIdx(idx + 1); else setFailed(true); }} />
  );
};

const ResetPasswordVerify = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const inputsRef = useRef([]);
  const videoRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const theme = useTheme();

  useEffect(() => {
    if (!email) navigate('/reset-password');
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    setTimeout(() => inputsRef.current[0]?.focus(), 300);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Video logic (desktop only uses it, but harmless to keep)
  useEffect(() => { setVideoError(false); }, [currentVideoIndex]);
  useEffect(() => {
    return () => { if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current); };
  }, []);

  const handleVideoEnd = () => goToNextVideo();
  const handleVideoError = () => { setVideoError(true); setTimeout(() => goToNextVideo(), 1000); };

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

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the full ${OTP_LENGTH}-digit code.`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });
      if (error) {
        setError(error.message || 'Invalid or expired code. Please try again.');
      } else {
        setSuccess('Code verified! Redirecting...');
        setTimeout(() => navigate('/reset-password/update'), 900);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) setError(error.message || 'Failed to resend code.');
      else {
        setSuccess('A new code has been sent to your email.');
        setResendTimer(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const currentVideo = BRAND_VIDEOS[currentVideoIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <>
      <FontStyles />
      <div
        className={`fixed inset-0 w-screen h-screen flex theme-${theme} auth-font`}
        style={{ background: "var(--hf-shell)" }}
      >
        {/* ═══════════════════════════════════════════════════
            DESKTOP — Split panel (with video)
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

          <div className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: 'radial-gradient(#ED6E1F 0.6px, transparent 0.6px)', backgroundSize: '18px 18px' }}
            aria-hidden="true" />

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
                    background: i === currentVideoIndex
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.28)",
                    maxWidth: 40,
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            DESKTOP — OTP Form panel
           ═══════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:flex-1 relative hf-scroll overflow-y-auto"
          style={{ background: "var(--hf-shell)" }}
        >
          <div className="min-h-full flex items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 w-full">
            <div className="w-full max-w-[380px] flex flex-col">

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="flex justify-center mb-3"
              >
                <div className="h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden">
                  <LogoImage />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="text-center mb-6"
              >
                <div className="h-14 w-14 mx-auto rounded-full flex items-center justify-center mb-3"
                  style={{ background: "var(--hf-amber-soft)" }}
                >
                  <FaShieldAlt className="text-xl" style={{ color: "var(--hf-amber-txt)" }} />
                </div>
                <h2 className="font-black tracking-tight mb-1.5"
                  style={{ color: "var(--hf-txt)", fontSize: "clamp(20px, 2.5vw, 26px)", letterSpacing: "-0.02em" }}
                >
                  Enter Reset Code
                </h2>
                <p className="text-[12.5px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                  We sent a {OTP_LENGTH}-digit code to
                </p>
                <p className="text-[12.5px] font-bold mt-0.5" style={{ color: "var(--hf-amber-txt)" }}>
                  {email}
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
                    <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                    <span className="flex-1 break-words">{error}</span>
                    <button onClick={() => setError('')}
                      className="opacity-60 hover:opacity-100 flex-shrink-0"
                      aria-label="Dismiss error"
                    >
                      <FaTimesCircle className="text-[9px]" />
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

              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3.5"
              >
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-1.5 flex-wrap">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={handlePaste}
                      className="hf-otp-input"
                      style={{
                        width: 36,
                        height: 46,
                        fontSize: 17,
                        border: digit ? "1.5px solid #ED6E1F" : "1px solid var(--hf-line)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ED6E1F";
                        e.target.style.boxShadow = "0 0 0 3px rgba(237,110,31,0.18)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = digit ? "#ED6E1F" : "var(--hf-line)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  ))}
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading || otp.join('').length !== OTP_LENGTH}
                  className="hf-btn hf-btn--primary mt-1.5"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify Code</>
                  )}
                </motion.button>
              </motion.form>

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="mt-5 text-center"
              >
                <p className="text-[11.5px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                  Didn't receive the code?{' '}
                  <button type="button" onClick={handleResend} disabled={resendTimer > 0 || resending}
                    className="font-bold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                    style={{
                      color: resendTimer > 0 ? 'var(--hf-txt-faint)' : 'var(--hf-amber-txt)',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    }}>
                    <FaRedo className="text-[9px]" />
                    {resending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="mt-4 text-center"
              >
                <Link to="/reset-password"
                  className="text-[11.5px] inline-flex items-center gap-1 font-bold hover:opacity-80"
                  style={{ color: "var(--hf-txt-soft)" }}>
                  <FaArrowLeft className="text-[9px]" /> Back
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            MOBILE — Clean solid background (NO VIDEO)
           ═══════════════════════════════════════════════════ */}
        <div
          className="lg:hidden absolute inset-0 flex flex-col hf-mob-scroll overflow-y-auto"
          style={{ background: "var(--hf-shell)" }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute z-30 h-9 w-9 rounded-full flex items-center justify-center hf-mob-close"
            style={{
              top: 12,
              right: 12,
              background: "var(--hf-close-bg)",
              color: "var(--hf-txt)",
              border: "1px solid var(--hf-line)",
            }}
            aria-label="Close"
          >
            <FaTimesCircle className="text-[13px]" />
          </button>

          <div className="relative z-20 flex-1 flex flex-col px-4 pt-16 pb-8 hf-mob-content-tight">
<div className="flex flex-col justify-center min-h-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-4"
              >
                <div className="h-14 w-14 rounded-xl flex items-center justify-center overflow-hidden">
                  <LogoImage />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-center mb-5 flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "var(--hf-amber-soft)", border: "1px solid var(--hf-amber-border)" }}
                >
                  <FaShieldAlt className="text-lg" style={{ color: "var(--hf-amber-txt)" }} />
                </div>

                <h1
                  className="font-black tracking-tight leading-[1.05]"
                  style={{
                    fontSize: "clamp(22px, 7vw, 32px)",
                    letterSpacing: "-0.03em",
                    backgroundImage: `linear-gradient(135deg, var(--hf-txt) 0%, var(--hf-txt) 55%, #ED6E1F 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  Enter Reset Code
                </h1>

                <p className="mt-1.5 text-[12px] font-medium"
                  style={{ color: "var(--hf-txt-soft)" }}
                >
                  We sent a {OTP_LENGTH}-digit code to
                </p>
                <p className="mt-0.5 text-[12px] font-bold"
                  style={{ color: "var(--hf-amber-txt)" }}
                >
                  {email}
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-2.5 p-2.5 rounded-2xl flex items-start gap-2 overflow-hidden text-[11.5px] font-semibold"
                    style={{
                      background: "var(--hf-danger-soft)",
                      color: "var(--hf-danger)",
                      border: "1px solid var(--hf-danger-soft)",
                    }}
                  >
                    <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                    <span className="flex-1 break-words">{error}</span>
                    <button onClick={() => setError('')}
                      className="opacity-60 hover:opacity-100 flex-shrink-0"
                      aria-label="Dismiss error"
                    >
                      <FaTimesCircle className="text-[9px]" />
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
                      background: "var(--hf-success-soft)",
                      color: "var(--hf-success)",
                      border: "1px solid var(--hf-success-soft)",
                    }}
                  >
                    <FaCheckCircle className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={handlePaste}
                      className="hf-otp-input"
                      style={{
                        width: 32,
                        height: 44,
                        fontSize: 16,
                        border: digit ? "1.5px solid #ED6E1F" : "1px solid var(--hf-line)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ED6E1F";
                        e.target.style.boxShadow = "0 0 0 3px rgba(237,110,31,0.22)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = digit ? "#ED6E1F" : "var(--hf-line)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== OTP_LENGTH}
                  className="hf-mob-btn hf-mob-btn--amber mt-1.5"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Verify Code</>
                  )}
                </button>
              </form>

              <p className="text-center text-[12px] mt-4" style={{ color: "var(--hf-txt-soft)" }}>
                Didn't receive the code?{' '}
                <button type="button" onClick={handleResend} disabled={resendTimer > 0 || resending}
                  className="font-bold inline-flex items-center gap-1"
                  style={{
                    color: resendTimer > 0 ? 'var(--hf-txt-faint)' : 'var(--hf-amber-txt)',
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                  }}>
                  <FaRedo className="text-[9px]" />
                  {resending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </p>

              <Link to="/reset-password"
                className="mt-4 text-center text-[12px] inline-flex items-center justify-center gap-1 font-semibold"
                style={{ color: "var(--hf-txt-soft)" }}>
                <FaArrowLeft className="text-[10px]" /> Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordVerify;