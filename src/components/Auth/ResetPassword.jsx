// pages/auth/ResetPassword.jsx
// ⭐ Brand: signature logo gradient (#F7941D → #ED6E1F → #D4521A)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaArrowRight,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaCloud,
  FaTimesCircle,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
   FONTS + THEME TOKENS — logo gradient (#F7941D → #ED6E1F → #D4521A)
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .auth-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    /* ══════════════════════════════════════════════════════════
       LOGO GRADIENT — signature diagonal (135deg)
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

    /* ═══════ DESKTOP BUTTONS (smaller, matching SignIn/SignUp) ═══════ */
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

    /* ⭐ Primary submit — full logo gradient */
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

    /* ═══════ MOBILE PILL BUTTONS (smaller) ═══════ */
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

    .hf-input-mob {
      width: 100%;
      padding: 12px 14px 12px 40px;
      border-radius: 12px;
      background: rgba(20,20,22,0.55);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.16);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 16px;
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

    .hf-scroll::-webkit-scrollbar { width: 6px; }
    .hf-scroll::-webkit-scrollbar-track { background: transparent; }
    .hf-scroll::-webkit-scrollbar-thumb {
      background: var(--hf-line-str); border-radius: 3px;
    }

    .hf-noscroll::-webkit-scrollbar { display: none; }
    .hf-noscroll { -ms-overflow-style: none; scrollbar-width: none; }

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

    /* ═══════ MOBILE SAFE-AREA ═══════ */
    @media (max-width: 1023px) {
      .hf-mob-close {
        top: max(12px, env(safe-area-inset-top, 0px)) !important;
        right: max(12px, env(safe-area-inset-right, 0px)) !important;
      }
    }

    /* Tiny phones */
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

    /* ═══════════════════════════════════════════════════════════════
       ⭐⭐ BULLETPROOF FIX — lock brand-gradient buttons
       ═══════════════════════════════════════════════════════════════ */
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

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });

      if (error) {
        setError(error.message || 'Failed to send reset code. Please try again.');
        setLoading(false);
      } else {
        setIsSent(true);
        setSuccess('A reset code has been sent to your email!');
        setTimeout(() => {
          navigate('/reset-password/verify', {
            state: { email: email.trim() },
            replace: false,
          });
        }, 800);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

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

            <div className="hidden xl:flex items-center gap-5 mt-5">
              {BRAND_VIDEOS.map((v, i) => (
                <span
                  key={i}
                  className="text-[10.5px] font-semibold transition-opacity"
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

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-2"
              >
                <div className="h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden"
                >
                  <LogoImage />
                </div>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-center mb-5"
              >
                <h2 className="font-black tracking-tight mb-1.5"
                  style={{ color: "var(--hf-txt)", fontSize: "clamp(22px, 2.5vw, 30px)", letterSpacing: "-0.02em" }}
                >
                  Reset password
                </h2>
                <p className="text-[12.5px] font-medium" style={{ color: "var(--hf-txt-soft)" }}>
                  Enter your email to receive a reset code
                </p>
              </motion.div>

              {/* Error / Success */}
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
                      <FaTimes className="text-[9px]" />
                    </button>
                  </motion.div>
                )}
                {success && !isSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-2.5 p-2.5 rounded-lg flex items-center gap-2 overflow-hidden text-[11.5px] font-semibold"
                    style={{ background: "var(--hf-success-soft)", color: "var(--hf-success)" }}
                  >
                    <FaShieldAlt className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ SENDING STATE ═══ */}
              {isSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "var(--hf-amber-soft)" }}
                  >
                    <FaShieldAlt className="text-[26px]" style={{ color: "var(--hf-amber-txt)" }} />
                  </div>
                  <h3 className="text-[18px] font-black mb-1.5" style={{ color: "var(--hf-txt)" }}>
                    Sending Code...
                  </h3>
                  <p className="text-[12.5px] mb-1" style={{ color: "var(--hf-txt-soft)" }}>
                    Redirecting you to enter the reset code
                  </p>
                  <p className="text-[12.5px] font-bold mb-5" style={{ color: "var(--hf-amber-txt)" }}>
                    {email}
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="inline-block h-4 w-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "var(--hf-amber)", borderTopColor: "transparent" }}
                    />
                  </div>
                </motion.div>
              ) : (
                /* ═══ FORM STATE ═══ */
                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                  <div className="relative">
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
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="hf-btn hf-btn--primary mt-0.5"
                  >
                    {loading ? (
                      <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Code
                        <FaArrowRight className="text-[10px]" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-2">
                    <Link
                      to="/signin"
                      className="text-[11.5px] inline-flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-80"
                      style={{ color: "var(--hf-txt-soft)" }}
                    >
                      <FaArrowLeft className="text-[10px]" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}

              {/* SSO footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
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

          {/* Close (X) button top-right */}
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="absolute top-3 right-3 z-30 h-9 w-9 rounded-full flex items-center justify-center"
            style={{
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

          {/* Content (scrollable) */}
          <div className="relative z-20 flex-1 flex flex-col hf-noscroll overflow-y-auto px-4 pt-16 pb-8">
            <div className="flex-1 flex flex-col justify-end min-h-0">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-4"
              >
                <div className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden"
                >
                  <LogoImage />
                </div>
              </motion.div>

              {/* ⭐ Modern Heading */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-center mb-5 flex flex-col items-center"
              >
                {/* Small brand chip above */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: "rgba(237,110,31,0.15)",
                    border: "1px solid rgba(237,110,31,0.35)",
                    color: "#ED6E1F",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#ED6E1F", boxShadow: "0 0 8px #ED6E1F" }}
                  />
                  Account recovery
                </span>

                {/* Main heading with gradient */}
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
                  Reset password
                </h1>

                {/* Subtitle */}
                <p
                  className="mt-1.5 text-[12px] font-medium"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  Enter your email to receive a reset code
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
                    <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                    <span className="flex-1 break-words">{error}</span>
                    <button onClick={() => setError('')}
                      className="opacity-60 hover:opacity-100 flex-shrink-0"
                      aria-label="Dismiss error"
                    >
                      <FaTimes className="text-[9px]" />
                    </button>
                  </motion.div>
                )}
                {success && !isSent && (
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
                    <FaShieldAlt className="flex-shrink-0" />
                    <span className="break-words">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ MOBILE SENDING STATE ═══ */}
              {isSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: "rgba(237,110,31,0.16)",
                      border: "1px solid rgba(237,110,31,0.35)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <FaShieldAlt className="text-[26px]" style={{ color: "#ED6E1F" }} />
                  </div>
                  <h3 className="text-[18px] font-black mb-1.5 text-white">
                    Sending Code...
                  </h3>
                  <p className="text-[12.5px] mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Redirecting you to enter the reset code
                  </p>
                  <p className="text-[12.5px] font-bold mb-5" style={{ color: "#ED6E1F" }}>
                    {email}
                  </p>
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin text-[18px]" style={{ color: "#ED6E1F" }} />
                  </div>
                </motion.div>
              ) : (
                /* ═══ MOBILE FORM STATE ═══ */
                <motion.form
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-2.5"
                >
                  {/* Email with icon */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                    style={{ position: "relative", width: "100%" }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        color: "rgba(255,255,255,0.7)",
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
                  </motion.div>

                  {/* Submit — amber pill */}
                  <motion.button
                    variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                    type="submit"
                    disabled={loading}
                    className="hf-mob-btn hf-mob-btn--amber mt-0.5"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin text-[12px]" />
                    ) : (
                      <>
                        Send Reset Code
                        <FaArrowRight className="text-[12px]" />
                      </>
                    )}
                  </motion.button>

                  {/* Back to Sign In — ghost pill */}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                  >
                    <Link
                      to="/signin"
                      className="hf-mob-btn hf-mob-btn--ghost"
                    >
                      <FaArrowLeft className="text-[12px]" />
                      Back to Sign In
                    </Link>
                  </motion.div>
                </motion.form>
              )}

              {/* SSO footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-5 pt-4 border-t flex items-center justify-center gap-2 text-[10.5px]"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
              >
                <FaCloud className="text-[10px]" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center justify-center gap-2.5 mt-4"
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;