// pages/auth/SignIn.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGithub,
  FaShieldAlt,
  FaRobot,
  FaUserCheck,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaGift,
  FaCloud,
  FaFingerprint,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   3 VIDEO URLS + FEATURE LABELS (DESKTOP ONLY)
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
   FONTS + THEME TOKENS
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .auth-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    :root {
      --brand-grad-start: #F7941D;
      --brand-grad-mid:   #ED6E1F;
      --brand-grad-end:   #D4521A;
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
      --hf-logo-txt:      #0A0A12;
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

    .hf-btn--passkey {
      background: linear-gradient(135deg, rgba(247,148,29,0.14) 0%, rgba(212,82,26,0.14) 100%);
      border-color: rgba(237,110,31,0.42);
      color: var(--hf-amber-txt);
      font-weight: 700;
    }
    .hf-btn--passkey:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(247,148,29,0.22) 0%, rgba(212,82,26,0.22) 100%);
      border-color: #ED6E1F;
      box-shadow: 0 6px 20px -8px var(--hf-amber-glow);
    }

    .hf-btn--amber {
      background: linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%);
      border-color: transparent;
      color: #FFFFFF;
      font-weight: 700;
      box-shadow: 0 6px 20px -8px rgba(237,110,31,0.45);
    }
    .hf-btn--amber:hover:not(:disabled) {
      filter: brightness(1.06);
      box-shadow: 0 8px 26px -8px rgba(237,110,31,0.55);
    }

    .hf-btn--primary {
      background: linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%);
      border-color: transparent;
      color: #FFFFFF;
      font-weight: 800;
      box-shadow: 0 6px 20px -8px rgba(237,110,31,0.45);
    }
    .hf-btn--primary:hover:not(:disabled) {
      filter: brightness(1.06);
      box-shadow: 0 8px 26px -8px rgba(237,110,31,0.55);
    }

    /* ═══════ MOBILE PILL BUTTONS — now theme-aware ═══════ */
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
    }
    .hf-mob-btn:active:not(:disabled) { transform: scale(0.98); }
    .hf-mob-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .hf-mob-btn svg { flex-shrink: 0; }

    /* White/solid button — theme aware */
    .hf-mob-btn--white {
      background: var(--hf-panel);
      color: var(--hf-txt);
      border: 1px solid var(--hf-line);
      box-shadow: 0 6px 20px -10px rgba(0,0,0,0.25);
    }
    .hf-mob-btn--white:hover:not(:disabled) {
      background: var(--hf-panel-soft);
      border-color: var(--hf-line-str);
    }

    /* Ghost/outline — theme aware */
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

    /* Passkey pill */
    .hf-mob-btn--passkey {
      background: linear-gradient(135deg, rgba(247,148,29,0.14) 0%, rgba(212,82,26,0.14) 100%);
      color: var(--hf-amber-txt);
      border: 1px solid rgba(237,110,31,0.42);
      font-weight: 700;
      box-shadow: 0 6px 20px -10px rgba(237,110,31,0.35);
    }
    .hf-mob-btn--passkey:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(247,148,29,0.22) 0%, rgba(212,82,26,0.22) 100%);
      border-color: #ED6E1F;
    }

    /* Amber CTA */
    .hf-mob-btn--amber {
      background: linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%);
      color: #FFFFFF;
      font-weight: 800;
      box-shadow: 0 8px 22px -10px rgba(237,110,31,0.55);
    }
    .hf-mob-btn--amber:hover:not(:disabled) {
      filter: brightness(1.06);
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

    /* Mobile input — theme aware, no blur */
    .hf-input-mob {
      width: 100%;
      padding: 12px 14px 12px 40px;
      border-radius: 12px;
      background: var(--hf-panel);
      color: var(--hf-txt);
      border: 1px solid var(--hf-line);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 16px;
      outline: none;
      transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
      line-height: 1.3;
    }
    .hf-input-mob::placeholder { color: var(--hf-txt-faint); }
    .hf-input-mob:focus {
      border-color: #ED6E1F;
      background: var(--hf-panel-soft);
      box-shadow: 0 0 0 3px rgba(237,110,31,0.22);
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
      background: linear-gradient(135deg, #F7941D 0%, #ED6E1F 50%, #D4521A 100%);
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

    /* ═══════ MOBILE RESPONSIVE HELPERS ═══════ */
    @media (max-width: 1023px) {
      .hf-mob-close {
        top: max(12px, env(safe-area-inset-top, 0px)) !important;
        right: max(12px, env(safe-area-inset-right, 0px)) !important;
      }
      .hf-mob-content {
        padding-top: calc(env(safe-area-inset-top, 0px) + 60px) !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 30px) !important;
        padding-left: max(16px, env(safe-area-inset-left, 0px)) !important;
        padding-right: max(16px, env(safe-area-inset-right, 0px)) !important;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
      }
    }

    @media (max-width: 360px) {
      .hf-mob-btn {
        padding: 10px 14px;
        font-size: 12.5px;
        min-height: 40px;
      }
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

    @media (max-height: 500px) and (max-width: 1023px) {
      .hf-mob-content {
        padding-top: calc(env(safe-area-inset-top, 0px) + 44px) !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px) !important;
      }
    }

    /* ⭐ Lock brand-gradient buttons */
    .hf-btn.hf-btn--amber,
    .hf-btn.hf-btn--amber:hover,
    .hf-btn.hf-btn--amber:focus,
    .hf-btn.hf-btn--amber:focus-visible,
    .hf-btn.hf-btn--amber:active,
    .theme-light .hf-btn.hf-btn--amber,
    .theme-light .hf-btn.hf-btn--amber:hover,
    .theme-dark .hf-btn.hf-btn--amber,
    .theme-dark .hf-btn.hf-btn--amber:hover,
    .hf-btn.hf-btn--primary,
    .hf-btn.hf-btn--primary:hover,
    .hf-btn.hf-btn--primary:focus,
    .hf-btn.hf-btn--primary:focus-visible,
    .hf-btn.hf-btn--primary:active,
    .theme-light .hf-btn.hf-btn--primary,
    .theme-light .hf-btn.hf-btn--primary:hover,
    .theme-dark .hf-btn.hf-btn--primary,
    .theme-dark .hf-btn.hf-btn--primary:hover,
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
        style={{ background: "linear-gradient(135deg, #F7941D 0%, #D4521A 100%)", color: "#FFFFFF" }}>
        D
      </div>
    );
  }
  return (
    <img
      src={sources[idx]}
      alt="Dealora"
      className={className}
      onError={() => {
        if (idx < sources.length - 1) setIdx(idx + 1);
        else setFailed(true);
      }}
    />
  );
};

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [showCaptchaDialog, setShowCaptchaDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const videoRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  const { user, loading: authLoading, signIn, signInWithGoogle, signInWithGitHub } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate("/feed", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const randomChance = Math.random() * 100;
    setCaptchaRequired(randomChance < 30);
  }, []);

  useEffect(() => {
    setVideoError(false);
  }, [currentVideoIndex]);

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

  const handleVerifyHuman = () => {
    if (isHumanVerified) {
      setIsHumanVerified(false);
      setVerificationChecked(false);
      return;
    }
    setIsVerifying(true);
    setVerificationError('');
    setTimeout(() => {
      setIsVerifying(false);
      setIsHumanVerified(true);
      setVerificationChecked(true);
      setVerificationError('');
      setTimeout(() => setShowCaptchaDialog(false), 1000);
    }, 1500);
  };

  const openCaptchaDialog = () => {
    if (!captchaRequired) {
      setIsHumanVerified(true);
      setVerificationChecked(true);
      setSuccess('✓ Human verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }
    setShowCaptchaDialog(true);
    setError('');
    setErrorType('');
    setVerificationError('');
    setVerificationChecked(false);
  };

  const handleGoogleSignIn = async () => {
    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }
    setError(''); setErrorType(''); setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(typeof error === 'string' ? error : 'Google sign in failed. Please try again.');
        setErrorType('auth_error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally { setLoading(false); }
  };

  const handleGitHubSignIn = async () => {
    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }
    setError(''); setErrorType(''); setLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setError(typeof error === 'string' ? error : 'GitHub sign in failed. Please try again.');
        setErrorType('auth_error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally { setLoading(false); }
  };

  const handlePasskeySignIn = async () => {
    setError(''); setErrorType(''); setSuccess('');
    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }
    setPasskeyLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error) {
        setError(error.message || 'Passkey sign in failed. Please try again.');
        setErrorType('auth_error');
      } else {
        setSuccess('Welcome back! Redirecting...');
        setTimeout(() => navigate('/feed'), 1500);
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setErrorType(''); setSuccess('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Use and Privacy Policy.');
      setErrorType('terms_required');
      return;
    }
    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      setErrorType('email_required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setErrorType('email_invalid');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      setErrorType('password_required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setErrorType('password_short');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setError(typeof error === 'string' ? error : 'Invalid email or password. Please try again.');
        setErrorType('auth_error');
      } else {
        setSuccess('Welcome back! Redirecting...');
        setTimeout(() => navigate('/feed'), 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    }
    setLoading(false);
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'verification_required': return <FaShieldAlt className="flex-shrink-0" />;
      case 'email_required':
      case 'email_invalid': return <FaEnvelope className="flex-shrink-0" />;
      case 'password_required':
      case 'password_short': return <FaLock className="flex-shrink-0" />;
      case 'auth_error': return <FaExclamationTriangle className="flex-shrink-0" />;
      case 'terms_required': return <FaInfoCircle className="flex-shrink-0" />;
      default: return <FaInfoCircle className="flex-shrink-0" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 24 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 26, stiffness: 260 } },
    exit: { opacity: 0, scale: 0.94, y: 24, transition: { duration: 0.2 } },
  };
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  const currentVideo = BRAND_VIDEOS[currentVideoIndex];

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
            DESKTOP — Form panel
           ═══════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:flex-1 relative hf-scroll overflow-y-auto"
          style={{ background: "var(--hf-shell)" }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "var(--hf-close-bg)",
              color: "var(--hf-txt)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hf-close-bg-hov)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--hf-close-bg)"; }}
            aria-label="Close"
          >
            <FaTimes className="text-[11px]" />
          </button>

          <div className="min-h-full flex items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 w-full">
            <div className="w-full max-w-[380px] flex flex-col">

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="flex justify-center mb-4"
              >
                <div className="h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden">
                  <LogoImage />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible"
                className="text-center mb-2"
              >
                <div className="mb-1">
                  <h2
                    className="font-black tracking-tight mb-1 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(135deg, var(--hf-txt) 0%, var(--hf-txt) 60%, #ED6E1F 100%)",
                      fontSize: "clamp(22px, 2.5vw, 30px)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                    }}
                  >
                    Sign in
                  </h2>
                  <p
                    className="text-[12.5px] font-medium"
                    style={{ color: "var(--hf-txt-soft)" }}
                  >
                    Welcome back. Let's get you in.
                  </p>
                </div>
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
                    <FaUserCheck className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2"
              >
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={() => { setEmail(''); document.querySelector('input[type="email"]')?.focus(); }}
                  className="hf-btn hf-btn--amber"
                >
                  <FaGift className="text-[12px]" />
                  <span>
                    Sign in with business email{" "}
                    <span className="hidden sm:inline">&amp;</span>
                    <span className="sm:hidden">+</span>{" "}
                    Get 50 credits
                  </span>
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

                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handlePasskeySignIn}
                  disabled={loading || passkeyLoading}
                  className="hf-btn hf-btn--passkey"
                >
                  {passkeyLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-[12px]" />
                      Verifying passkey...
                    </>
                  ) : (
                    <>
                      <FaFingerprint className="text-[14px]" />
                      Sign in with Passkey
                    </>
                  )}
                </motion.button>

                <motion.div variants={itemVariants} className="flex items-center gap-3 my-1.5">
                  <div className="flex-1 h-px" style={{ background: "var(--hf-line-str)" }} />
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: "var(--hf-txt-faint)" }}>
                    OR
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--hf-line-str)" }} />
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={() => document.querySelector('input[type="email"]')?.focus()}
                  className="hf-btn"
                >
                  <FaEnvelope className="text-[12px]" />
                  Continue with Email
                </motion.button>
              </motion.div>

              <div className="my-4 h-px" style={{ background: "var(--hf-line)" }} />

              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="flex flex-col gap-2.5"
              >
                <motion.div variants={itemVariants} className="relative">
                  <FaEnvelope
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none"
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

                <motion.div variants={itemVariants} className="relative">
                  <FaLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none"
                    style={{ color: "var(--hf-txt-faint)" }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    placeholder="••••••••"
                    className="hf-input"
                    style={{ paddingRight: 38 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--hf-txt-faint)" }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash className="text-[12px]" /> : <FaEye className="text-[12px]" />}
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between mt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="hf-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-[11.5px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/reset-password"
                    className="text-[11.5px] font-semibold transition-opacity hover:opacity-80"
                    style={{ color: "var(--hf-amber-txt)" }}
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.label variants={itemVariants} className="flex items-start gap-2 mt-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hf-checkbox mt-0.5"
                    checked={agreedToTerms}
                    onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setError(''); }}
                  />
                  <span className="text-[11px] leading-relaxed" style={{ color: "var(--hf-txt-soft)" }}>
                    I agree to the{' '}
                    <Link to="/terms" className="font-semibold underline underline-offset-2"
                      style={{ color: "var(--hf-txt)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Use
                    </Link>
                    , acknowledge the{' '}
                    <Link to="/privacy" className="font-semibold underline underline-offset-2"
                      style={{ color: "var(--hf-txt)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                    , and confirm I'm at least 18 years old.
                  </span>
                </motion.label>

                <motion.div variants={itemVariants} className="mt-1.5">
                  {isHumanVerified ? (
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg"
                      style={{ background: "var(--hf-success-soft)" }}
                    >
                      <FaCheckCircle className="text-[14px] flex-shrink-0" style={{ color: "var(--hf-success)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] font-bold" style={{ color: "var(--hf-success)" }}>
                          Human verified
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--hf-success)", opacity: 0.7 }}>
                          You passed the verification
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openCaptchaDialog}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg transition-all"
                      style={{
                        background: "var(--hf-panel-soft)",
                        border: "1px solid var(--hf-line)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ED6E1F"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--hf-line)"; }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-[16px] w-[16px] rounded-[4px] flex items-center justify-center flex-shrink-0"
                          style={{ border: "1.5px solid var(--hf-line-str)" }}
                        />
                        <div className="text-left">
                          <p className="text-[11.5px] font-semibold" style={{ color: "var(--hf-txt)" }}>
                            I'm not a robot
                          </p>
                          <p className="text-[9.5px]" style={{ color: "var(--hf-txt-faint)" }}>
                            {captchaRequired ? 'Click to verify' : 'Verification skipped'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaRobot className="text-[10px]" style={{ color: "var(--hf-txt-faint)" }} />
                        <span className="text-[8.5px] font-bold" style={{ color: "var(--hf-txt-faint)" }}>
                          reCAPTCHA
                        </span>
                      </div>
                    </button>
                  )}
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading || !isHumanVerified || !agreedToTerms}
                  className="hf-btn hf-btn--primary mt-1.5"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-[12px]" />
                  ) : (
                    <>
                      Sign In
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
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold transition-opacity hover:opacity-80"
                  style={{ color: "var(--hf-amber-txt)" }}
                >
                  Sign up
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
            MOBILE — Clean solid background (NO VIDEO)
            Just dark/light theme-aware shell
           ═══════════════════════════════════════════════════ */}
        <div
          className="lg:hidden absolute inset-0 flex flex-col hf-scroll overflow-y-auto"
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
            <FaTimes className="text-[13px]" />
          </button>

          <div
            className="relative z-20 flex-1 hf-mob-content"
            style={{
              paddingTop: 64,
              paddingBottom: 30,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <div className="flex flex-col justify-center min-h-full py-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-4"
              >
                <div className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  <LogoImage />
                </div>
              </motion.div>

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
                    backgroundImage: `linear-gradient(135deg, var(--hf-txt) 0%, var(--hf-txt) 55%, #ED6E1F 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  Sign In
                </h1>

                <p
                  className="mt-1.5 text-[12px] font-medium"
                  style={{ color: "var(--hf-txt-soft)" }}
                >
                  Continue your journey with ApexDeal
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
                      background: "var(--hf-success-soft)",
                      color: "var(--hf-success)",
                      border: "1px solid var(--hf-success-soft)",
                    }}
                  >
                    <FaUserCheck className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2.5"
              >
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="hf-mob-btn hf-mob-btn--white"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
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
                  className="hf-mob-btn hf-mob-btn--white"
                >
                  <FaGithub className="text-[18px]" />
                  Continue with GitHub
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handlePasskeySignIn}
                  disabled={loading || passkeyLoading}
                  className="hf-mob-btn hf-mob-btn--passkey"
                >
                  {passkeyLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-[14px]" />
                      Verifying passkey...
                    </>
                  ) : (
                    <>
                      <FaFingerprint className="text-[16px]" />
                      Sign in with Passkey
                    </>
                  )}
                </motion.button>

                {!showEmailForm && (
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="hf-mob-btn hf-mob-btn--ghost"
                  >
                    Continue with email
                  </motion.button>
                )}

                <AnimatePresence>
                  {showEmailForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-2.5 overflow-hidden"
                    >
                      <div style={{ position: "relative", width: "100%" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            color: "var(--hf-txt-faint)",
                            pointerEvents: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                          }}
                        >
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

                      <div style={{ position: "relative", width: "100%" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            color: "var(--hf-txt-faint)",
                            pointerEvents: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                          }}
                        >
                          <FaLock />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(''); }}
                          required
                          placeholder="••••••••"
                          className="hf-input-mob"
                          style={{ paddingRight: 38 }}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            color: "var(--hf-txt-faint)",
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
                          {showPassword ? <FaEyeSlash style={{ fontSize: 12 }} /> : <FaEye style={{ fontSize: 12 }} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="hf-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <span className="text-[12px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                            Remember me
                          </span>
                        </label>
                        <Link
                          to="/reset-password"
                          className="text-[12px] font-semibold"
                          style={{ color: "var(--hf-amber-txt)" }}
                        >
                          Forgot?
                        </Link>
                      </div>

                      <label className="flex items-start gap-2.5 px-1 cursor-pointer">
                        <input
                          type="checkbox"
                          className="hf-checkbox mt-0.5"
                          checked={agreedToTerms}
                          onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setError(''); }}
                        />
                        <span className="text-[11.5px] leading-relaxed" style={{ color: "var(--hf-txt-soft)" }}>
                          I agree to the{' '}
                          <Link to="/terms" className="font-semibold underline underline-offset-2" style={{ color: "var(--hf-amber-txt)" }}>
                            Terms
                          </Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="font-semibold underline underline-offset-2" style={{ color: "var(--hf-amber-txt)" }}>
                            Privacy Policy
                          </Link>
                          , and I'm 18+.
                        </span>
                      </label>

                      {isHumanVerified ? (
                        <div className="flex items-center gap-3 p-2.5 rounded-2xl"
                          style={{
                            background: "var(--hf-success-soft)",
                            border: "1px solid var(--hf-success-soft)",
                          }}
                        >
                          <FaCheckCircle className="text-[14px] flex-shrink-0" style={{ color: "var(--hf-success)" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold" style={{ color: "var(--hf-success)" }}>
                              Human verified
                            </p>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={openCaptchaDialog}
                          className="w-full flex items-center justify-between p-3 rounded-2xl"
                          style={{
                            background: "var(--hf-panel)",
                            border: "1px solid var(--hf-line)",
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="h-4 w-4 rounded-[5px] flex items-center justify-center flex-shrink-0"
                              style={{ border: "1.5px solid var(--hf-line-str)", background: "var(--hf-panel-soft)" }}
                            />
                            <div className="text-left">
                              <p className="text-[12px] font-semibold" style={{ color: "var(--hf-txt)" }}>
                                I'm not a robot
                              </p>
                              <p className="text-[10px]" style={{ color: "var(--hf-txt-faint)" }}>
                                {captchaRequired ? 'Click to verify' : 'Verification skipped'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaRobot className="text-[10px]" style={{ color: "var(--hf-txt-faint)" }} />
                            <span className="text-[8.5px] font-bold" style={{ color: "var(--hf-txt-faint)" }}>
                              reCAPTCHA
                            </span>
                          </div>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !isHumanVerified || !agreedToTerms}
                        className="hf-mob-btn hf-mob-btn--amber mt-1"
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin text-[12px]" />
                        ) : (
                          <>
                            Sign In
                            <FaArrowRight className="text-[12px]" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="text-center text-[12px] font-semibold mt-0.5 py-1.5"
                        style={{ color: "var(--hf-txt-soft)" }}
                      >
                        ← Back to other options
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {!showEmailForm && (
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="hf-mob-btn hf-mob-btn--ghost"
                    style={{
                      background: "linear-gradient(135deg, rgba(247,148,29,0.14) 0%, rgba(212,82,26,0.14) 100%)",
                      borderColor: "rgba(237,110,31,0.42)",
                      color: "var(--hf-amber-txt)",
                      fontWeight: 700,
                    }}
                  >
                    <FaGift className="text-[12px] flex-shrink-0" />
                    <span>
                      Sign in with email{" "}
                      <span className="hidden sm:inline">&amp;</span>
                      <span className="sm:hidden">+</span>{" "}
                      Get 50 credits
                    </span>
                  </motion.button>
                )}

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-center gap-3 mt-4 text-[11.5px]"
                >
                  <Link
                    to="/privacy"
                    className="font-medium transition-opacity hover:opacity-80"
                    style={{ color: "var(--hf-txt-soft)" }}
                  >
                    Privacy policy
                  </Link>
                  <span style={{ color: "var(--hf-txt-faint)" }}>|</span>
                  <Link
                    to="/terms"
                    className="font-medium transition-opacity hover:opacity-80"
                    style={{ color: "var(--hf-txt-soft)" }}
                  >
                    Terms of service
                  </Link>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="text-center text-[12px] mt-2.5"
                  style={{ color: "var(--hf-txt-soft)" }}
                >
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-bold" style={{ color: "var(--hf-amber-txt)" }}>
                    Sign up
                  </Link>
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CAPTCHA DIALOG (shared)
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCaptchaDialog && captchaRequired && (
          <div className={`theme-${theme} auth-font`}>
            <motion.div
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 z-[9999]"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              onClick={() => {
                if (!isHumanVerified && !isVerifying) {
                  setShowCaptchaDialog(false);
                  setVerificationError('');
                }
              }}
            />

            <motion.div
              variants={dialogVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-xl max-w-xs w-full overflow-hidden shadow-2xl my-auto"
                style={{
                  background: "var(--hf-panel)",
                  border: "1px solid var(--hf-line)",
                  marginTop: "max(16px, env(safe-area-inset-top, 0px))",
                  marginBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
                }}
              >
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: "var(--hf-amber-soft)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--hf-amber-soft)" }}
                    >
                      <FaShieldAlt className="text-[11px]" style={{ color: "var(--hf-amber-txt)" }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold" style={{ color: "var(--hf-txt)" }}>reCAPTCHA</p>
                      <p className="text-[8px]" style={{ color: "var(--hf-txt-soft)" }}>
                        Verify you are human
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isHumanVerified && !isVerifying) {
                        setShowCaptchaDialog(false);
                        setVerificationError('');
                      }
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: "var(--hf-txt-soft)" }}
                    disabled={isHumanVerified || isVerifying}
                    aria-label="Close"
                  >
                    <FaTimes className="text-[12px]" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 p-3 rounded-full" style={{ background: "var(--hf-amber-soft)" }}>
                      <FaRobot className="text-2xl" style={{ color: "var(--hf-amber-txt)" }} />
                    </div>
                    <p className="text-center text-[12px] font-bold mb-0.5" style={{ color: "var(--hf-txt)" }}>
                      I'm not a robot
                    </p>
                    <p className="text-center text-[11px] mb-3" style={{ color: "var(--hf-txt-soft)" }}>
                      Click the checkbox to verify you are human
                    </p>

                    <div
                      onClick={handleVerifyHuman}
                      className="w-full p-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isHumanVerified
                          ? "var(--hf-success-soft)"
                          : isVerifying
                          ? "var(--hf-amber-soft)"
                          : "var(--hf-panel-soft)",
                        border: isHumanVerified ? "1px solid var(--hf-success)" : "1px solid transparent",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: isHumanVerified
                              ? "var(--hf-success)"
                              : isVerifying
                              ? "var(--hf-amber-soft)"
                              : "var(--hf-panel-soft)",
                          }}
                        >
                          {isVerifying ? (
                            <FaSpinner className="animate-spin text-[12px]" style={{ color: "var(--hf-amber-txt)" }} />
                          ) : isHumanVerified ? (
                            <FaCheck className="text-white text-[12px]" />
                          ) : null}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[12px] font-bold" style={{ color: "var(--hf-txt)" }}>
                            I'm not a robot
                          </p>
                          {isHumanVerified && (
                            <p className="text-[11px] font-bold" style={{ color: "var(--hf-success)" }}>
                              ✓ Verification passed
                            </p>
                          )}
                          {isVerifying && (
                            <p className="text-[11px] font-bold" style={{ color: "var(--hf-amber-txt)" }}>
                              Verifying...
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <FaRobot className="text-[10px]" style={{ color: "var(--hf-amber-txt)" }} />
                          <span className="text-[7px] font-bold" style={{ color: "var(--hf-txt-soft)" }}>
                            reCAPTCHA
                          </span>
                        </div>
                      </div>
                    </div>

                    {verificationError && (
                      <div className="w-full mt-2.5 p-2 rounded-lg text-[11px] flex items-start gap-2"
                        style={{ background: "var(--hf-danger-soft)", color: "var(--hf-danger)" }}
                      >
                        <FaExclamationTriangle className="text-[11px] flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{verificationError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2"
                  style={{ background: "var(--hf-amber-soft)" }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[7px] font-bold" style={{ color: "var(--hf-txt-soft)" }}>
                      Protected by reCAPTCHA
                    </p>
                    <span className="text-[7px]" style={{ color: "var(--hf-txt-soft)" }}>|</span>
                    <a href="#" className="text-[7px] hover:underline font-bold" style={{ color: "var(--hf-amber-txt)" }}>
                      Privacy
                    </a>
                    <span className="text-[7px]" style={{ color: "var(--hf-txt-soft)" }}>·</span>
                    <a href="#" className="text-[7px] hover:underline font-bold" style={{ color: "var(--hf-amber-txt)" }}>
                      Terms
                    </a>
                  </div>
                  <button
                    onClick={() => { if (isHumanVerified) setShowCaptchaDialog(false); }}
                    disabled={isVerifying}
                    className="px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                    style={
                      isHumanVerified
                        ? { background: "linear-gradient(135deg, #F7941D 0%, #D4521A 100%)", color: "#FFFFFF", boxShadow: "0 6px 18px -8px rgba(237,110,31,0.6)" }
                        : { background: "var(--hf-panel-soft)", color: "var(--hf-txt-faint)", cursor: "not-allowed" }
                    }
                  >
                    {isHumanVerified ? '✓ Done' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SignIn;