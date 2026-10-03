// src/components/OnboardingModal.jsx — Full-bleed image onboarding
// - Image mode = image fills full card width, auto height (no crop)
// - Text/wizard mode = same visual language as before
// - Agreement checkbox required to enable the primary button
// - Mobile = true full screen
// - Blurred backdrop behind modal
// - Uses nav-* theme tokens (dark + light)
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaCheck, FaCheckCircle, FaSpinner, FaArrowRight, FaArrowLeft,
  FaShieldAlt, FaBolt, FaStore, FaUser,
  FaGlobe, FaBullhorn, FaQuestionCircle, FaCar, FaMobileAlt, FaHome,
  FaLaptop, FaTag, FaMapMarkerAlt, FaHeadset, FaHandshake, FaBan,
  FaMoneyBillWave, FaCamera, FaStar,
} from "react-icons/fa";
import { useOnboarding } from "../contexts/OnboardingContext";

/* ═══════════════════════════════════════════════════════════════
   THEME STYLES — Uses your exact original tokens
   ═══════════════════════════════════════════════════════════════ */
const OnboardingStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    .ob-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    /* ── DARK THEME (Your Colors) ── */
    .theme-dark {
      --nav-bg:           #0A0A12;
      --nav-bg-2:         #0F0F1A;
      --nav-panel:        #16161F;
      --nav-panel-2:      #1C1C28;
      --nav-surface:      rgba(255,255,255,0.045);
      --nav-surface-2:    rgba(255,255,255,0.02);
      --nav-line:         rgba(255,255,255,0.08);
      --nav-line-str:     rgba(255,255,255,0.15);
      --nav-txt:          #FFFFFF;
      --nav-txt-soft:     rgba(255,255,255,0.65);
      --nav-txt-faint:    rgba(255,255,255,0.45);
      --nav-primary:      #eb7d34;
      --nav-primary-2:    #f59e0b;
      --nav-primary-3:    #c8631f;
      --nav-primary-soft: rgba(235,125,52,0.14);
      --nav-primary-glow: rgba(235,125,52,0.45);
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.6);
      --nav-pill-bg:      rgba(20,20,30,0.55);
      --nav-pill-border:  rgba(255,255,255,0.08);
    }

    /* ── LIGHT THEME (Your Colors) ── */
    .theme-light {
      --nav-bg:           #FFFFFF;
      --nav-bg-2:         #FAF7F3;
      --nav-panel:        #FFFFFF;
      --nav-panel-2:      #F8F7FB;
      --nav-surface:      rgba(0,0,0,0.04);
      --nav-surface-2:    rgba(0,0,0,0.02);
      --nav-line:         rgba(20,20,30,0.08);
      --nav-line-str:     rgba(20,20,30,0.15);
      --nav-txt:          #1A1613;
      --nav-txt-soft:     rgba(26,22,19,0.62);
      --nav-txt-faint:    rgba(26,22,19,0.42);
      --nav-primary:      #c8631f;
      --nav-primary-2:    #eb7d34;
      --nav-primary-3:    #f59e0b;
      --nav-primary-soft: rgba(200,99,31,0.10);
      --nav-primary-glow: rgba(200,99,31,0.35);
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.12);
      --nav-pill-bg:      rgba(255,255,255,0.72);
      --nav-pill-border:  rgba(20,20,30,0.08);
    }

    /* Blurred backdrop */
    .ob-backdrop {
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
    }
    .theme-dark  .ob-backdrop { background: rgba(10,10,18,0.55); }
    .theme-light .ob-backdrop { background: rgba(20,20,30,0.35); }

    /* Button Styles matching your theme */
    .ob-btn-primary {
      background: linear-gradient(135deg, var(--nav-primary) 0%, var(--nav-primary-2) 100%);
      color: #FFFFFF;
      box-shadow: 0 14px 30px -12px var(--nav-primary-glow), inset 0 1px 0 rgba(255,255,255,0.25);
      transition: all 0.2s ease;
    }
    .ob-btn-primary:hover:not(:disabled) {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }
    .ob-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    .ob-btn-primary:disabled {
      background: var(--nav-surface);
      color: var(--nav-txt-faint);
      box-shadow: none;
      cursor: not-allowed;
    }

    .ob-btn-secondary {
      background: var(--nav-surface);
      border: 1px solid var(--nav-line-str);
      color: var(--nav-txt);
      transition: all 0.2s ease;
    }
    .ob-btn-secondary:hover:not(:disabled) {
      background: var(--nav-surface-2);
    }
    .ob-btn-secondary:active:not(:disabled) {
      transform: scale(0.98);
    }

    /* ⭐ FULL-BLEED image — no crop, full width, auto height */
    .ob-image {
      display: block;
      width: 100%;
      height: auto;
      max-width: 100%;
      object-fit: contain;
      object-position: center top;
      user-select: none;
      -webkit-user-drag: none;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   LOGO
   ═══════════════════════════════════════════════════════════════ */
const LogoImage = ({ className = "h-full w-full object-contain" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className="h-full w-full flex items-center justify-center font-black rounded-lg ob-font"
        style={{ background: "var(--nav-primary)", color: "#FFFFFF" }}
      >
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
   3D BELL ILLUSTRATION (Styled to match the image, using your colors)
   ═══════════════════════════════════════════════════════════════ */
const BellIllustration = () => (
  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
    <div
      className="absolute inset-0 blur-[40px] rounded-full opacity-30"
      style={{ background: "var(--nav-primary)" }}
    />

    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl relative z-10">
      <defs>
        <linearGradient id="bellBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1A1A2E" />
          <stop offset="25%" stopColor="#4A4A6A" />
          <stop offset="50%" stopColor="#8A8AAE" />
          <stop offset="75%" stopColor="#3A3A5A" />
          <stop offset="100%" stopColor="#0A0A15" />
        </linearGradient>

        <linearGradient id="bellRim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0A0A15" />
          <stop offset="40%" stopColor="#6A6A8E" />
          <stop offset="60%" stopColor="#9A9ABE" />
          <stop offset="100%" stopColor="#1A1A2E" />
        </linearGradient>

        <linearGradient id="bellHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <radialGradient id="bellShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="105" rx="35" ry="8" fill="url(#bellShadow)" />

      <circle cx="60" cy="18" r="6" fill="#8A8AAE" />
      <circle cx="60" cy="18" r="3" fill="#B0B0D0" />

      <path
        d="M60 25 C40 25 30 45 28 75 L92 75 C90 45 80 25 60 25 Z"
        fill="url(#bellBody)"
      />

      <ellipse cx="60" cy="78" rx="34" ry="8" fill="url(#bellRim)" />
      <ellipse cx="60" cy="78" rx="20" ry="4" fill="#0A0A15" />

      <circle cx="60" cy="85" r="5" fill="#6A6A8E" />
      <circle cx="60" cy="84" r="2" fill="#B0B0D0" />

      <path
        d="M42 30 C35 45 33 65 34 75 L40 75 C40 60 42 45 48 30 Z"
        fill="url(#bellHighlight)"
      />

      <path
        d="M75 35 C78 45 80 60 80 70 L75 70 C75 55 73 45 70 35 Z"
        fill="url(#bellHighlight)"
        opacity="0.5"
      />
    </svg>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   ICONS (wizard option icons)
   ═══════════════════════════════════════════════════════════════ */
const ICONS = {
  store: FaStore, user: FaUser, globe: FaGlobe, bullhorn: FaBullhorn,
  help: FaQuestionCircle, car: FaCar, mobile: FaMobileAlt, home: FaHome,
  laptop: FaLaptop, tag: FaTag, map: FaMapMarkerAlt, headset: FaHeadset,
  shield: FaShieldAlt, handshake: FaHandshake, ban: FaBan,
  money: FaMoneyBillWave, camera: FaCamera,
};

/* ═══════════════════════════════════════════════════════════════
   AGREEMENT CHECKBOX
   ═══════════════════════════════════════════════════════════════ */
const AgreementCheckbox = ({ checked, onChange, label }) => (
  <label
    className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-2xl transition-colors"
    style={{
      background: checked ? "var(--nav-primary-soft)" : "var(--nav-surface)",
      border: `1px solid ${
        checked ? "var(--nav-primary)" : "var(--nav-line)"
      }`,
    }}
  >
    <span
      className="flex items-center justify-center flex-shrink-0 mt-0.5 relative"
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        background: checked ? "var(--nav-primary)" : "transparent",
        border: checked
          ? `1.5px solid var(--nav-primary)`
          : `1.5px solid var(--nav-line-str)`,
        transition: "all 0.15s ease",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="absolute inset-0 opacity-0 cursor-pointer m-0"
        aria-label={typeof label === "string" ? label : "Agreement"}
      />
      {checked && <FaCheck className="text-[11px] text-white" />}
    </span>
    <span
      className="text-[12.5px] sm:text-[13px] leading-snug"
      style={{ color: "var(--nav-txt-soft)" }}
    >
      {label}
    </span>
  </label>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const OnboardingModal = () => {
  const { config, showModal, acknowledge, forceMode } = useOnboarding();
  const [phase, setPhase] = useState("instructions");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const isImageMode = config?.mode === "image" && config?.image_url;

  /* Detect dark theme */
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => {
      const h = document.documentElement;
      setIsDark(
        h.classList.contains("theme-dark") ||
          h.classList.contains("dark") ||
          (!h.classList.contains("theme-light") &&
            (localStorage.getItem("theme") ||
              localStorage.getItem("app-theme")) === "dark")
      );
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  /* Wizard data */
  const wizardSteps =
    Array.isArray(config?.wizard) && config.wizard.length > 0
      ? config.wizard
      : [];

  const hasWizard = wizardSteps.length > 0;
  const totalSteps = wizardSteps.length;
  const currentMeta = wizardSteps[step] || wizardSteps[0] || {};
  const currentOptions = useMemo(
    () =>
      (currentMeta?.options || []).map((opt) => ({
        ...opt,
        icon: ICONS[opt.icon] || FaCheckCircle,
      })),
    [currentMeta]
  );
  const isLastStep = step === totalSteps - 1;

  useEffect(() => {
    if (showModal) {
      setPhase("instructions");
      setStep(0);
      setSelected({});
      setIsFinishing(false);
      setAgreed(false);
    }
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [showModal]);

  if (!config?.enabled) return null;

  /* Navigation */
  const goToWizard = () => {
    if (!agreed) return;
    if (!hasWizard) {
      acknowledge();
      return;
    }
    setPhase("wizard");
    setStep(0);
    setSelected({});
  };

  const nextStep = () => {
    if (isLastStep) return finishWizard();
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const prevStep = () => {
    if (step === 0) {
      setPhase("instructions");
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const finishWizard = () => {
    setIsFinishing(true);
    setTimeout(() => {
      acknowledge();
      setIsFinishing(false);
    }, 1200);
  };

  const handleOptionClick = (stepIdx, label) => {
    setSelected((prev) => {
      const set = new Set(prev[stepIdx] || []);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...prev, [stepIdx]: set };
    });
  };

  const selectedSet = selected[step] || new Set();

  /* Instructions content */
  const instructionSections = Array.isArray(config?.sections)
    ? config.sections
    : [];
  const instructionBullets =
    instructionSections.length > 0
      ? instructionSections
          .slice(1)
          .map((s) => s.body || s.heading)
          .filter(Boolean)
      : [];
  const heroHeading =
    instructionSections[0]?.heading || config?.title || "Welcome to APNa Deal";
  const heroBody = instructionSections[0]?.body || config?.subtitle || "";

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`ob-font fixed inset-0 z-[10000] w-screen h-screen overflow-hidden ${
            isDark ? "theme-dark" : "theme-light"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <OnboardingStyles />

          <div className="ob-backdrop absolute inset-0" aria-hidden="true" />

          {/* Layout wrapper — mobile: full bleed, desktop: wider card */}
          <div className="relative w-full h-full flex items-stretch lg:items-center justify-center lg:p-5">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
className="relative w-full h-full lg:h-auto lg:max-w-[920px] lg:max-h-[126vh] lg:rounded-[36px] overflow-hidden flex flex-col"              style={{
                background: "var(--nav-bg)",
                boxShadow: `0 0 0 1px var(--nav-line), var(--nav-shadow)`,
              }}
            >
              {/* Close button */}
              <button
                onClick={acknowledge}
                aria-label="Close"
                className="absolute z-30 h-9 w-9 rounded-full flex items-center justify-center transition-colors"
                style={{
                  top: "max(env(safe-area-inset-top), 16px)",
                  right: 10,
                  background: "var(--nav-pill-bg)",
                  color: "var(--nav-txt)",
                  border: `1px solid var(--nav-pill-border)`,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <FaTimes className="text-[12px]" />
              </button>

              {/* ═══ BODY ═══ */}
              <div
                className="relative flex-1 flex flex-col overflow-hidden"
                style={{
                  background: "var(--nav-bg)",
                  paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
                }}
              >


                
                {isImageMode ? (
                <div className="flex flex-col min-h-0 overflow-y-auto">
  <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
    <img
      src={config.image_url}
      alt={config?.title || "Onboarding"}
      className="w-full h-full object-contain select-none"
      style={{
        display: "block",
        maxWidth: "100%",
        maxHeight: "100%",
        WebkitUserDrag: "none",
      }}
      draggable={false}
    />
  </div>

  {/* BOTTOM SHEET — sits directly under the image */}
  <div
    className="relative flex-shrink-0 pt-4 pb-6"
    style={{
      background: "var(--nav-bg)",
      paddingLeft: "max(env(safe-area-inset-left), 22px)",
      paddingRight: "max(env(safe-area-inset-right), 22px)",
      marginTop: "-20px",
    }}
  >
   


    <AgreementCheckbox
      checked={agreed}
      onChange={setAgreed}
      label="I've read and agree to the guidelines above."
    />

    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      onClick={acknowledge}
      disabled={!agreed}
      className="mt-3 w-full py-4 rounded-full text-[15px] font-bold tracking-wide transition-transform ob-btn-primary"
    >
      {config?.cta_label || "Next"}
    </motion.button>
  </div>
</div>
                ) : (
                  /* ─── TEXT / WIZARD MODE ─── */
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-16 pb-4">
                      <div className="w-full max-w-[400px] mx-auto">
                        <AnimatePresence mode="wait">
                          {/* PHASE 1 — INSTRUCTIONS */}
                          {phase === "instructions" && (
                            <motion.div
                              key="instructions"
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -16 }}
                              transition={{
                                duration: 0.35,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="text-center"
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="mb-8"
                              >
                                <BellIllustration />
                              </motion.div>

                              <h1
                                className="text-[26px] sm:text-[30px] font-extrabold leading-[1.12] tracking-tight mb-3"
                                style={{ color: "var(--nav-txt)" }}
                              >
                                {heroHeading}
                              </h1>

                              {heroBody && (
                                <p
                                  className="text-[13.5px] leading-relaxed mb-7 max-w-[360px] mx-auto"
                                  style={{ color: "var(--nav-txt-soft)" }}
                                >
                                  {heroBody}
                                </p>
                              )}

                              {instructionBullets.length > 0 && (
                                <ul className="space-y-3 text-left">
                                  {instructionBullets.map((line, i) => (
                                    <motion.li
                                      key={i}
                                      initial={{ opacity: 0, x: 8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{
                                        delay: 0.28 + i * 0.06,
                                      }}
                                      className="flex items-start gap-3"
                                    >
                                      <span
                                        className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center"
                                        style={{
                                          background: "var(--nav-primary-soft)",
                                          color: "var(--nav-primary-2)",
                                        }}
                                      >
                                        <FaCheck className="text-[8px]" />
                                      </span>
                                      <span
                                        className="text-[13px] leading-snug"
                                        style={{ color: "var(--nav-txt)" }}
                                      >
                                        {line}
                                      </span>
                                    </motion.li>
                                  ))}
                                </ul>
                              )}
                            </motion.div>
                          )}

                          {/* PHASE 2 — WIZARD */}
                          {phase === "wizard" && hasWizard && (
                            <motion.div
                              key={`wizard-${step}`}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -16 }}
                              transition={{
                                duration: 0.35,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              {currentMeta.eyebrow && (
                                <span
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
                                  style={{
                                    background: "var(--nav-primary-soft)",
                                    color: "var(--nav-primary-2)",
                                  }}
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ background: "var(--nav-primary)" }}
                                  />
                                  {currentMeta.eyebrow}
                                </span>
                              )}

                              <h2
                                className="text-[24px] sm:text-[28px] font-extrabold leading-[1.15] tracking-tight mb-2"
                                style={{ color: "var(--nav-txt)" }}
                              >
                                {currentMeta.title}
                              </h2>

                              {currentMeta.subtitle && (
                                <p
                                  className="text-[13.5px] leading-relaxed mb-6"
                                  style={{ color: "var(--nav-txt-soft)" }}
                                >
                                  {currentMeta.subtitle}
                                </p>
                              )}

                              {currentOptions.length > 0 ? (
                                <div className="space-y-2.5">
                                  {currentOptions.map((opt, i) => {
                                    const Icon = opt.icon;
                                    const isSelected = selectedSet.has(
                                      opt.label
                                    );
                                    return (
                                      <motion.button
                                        key={opt.label}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: 0.18 + i * 0.05,
                                        }}
                                        onClick={() =>
                                          handleOptionClick(step, opt.label)
                                        }
                                        disabled={isFinishing}
                                        className="w-full text-left flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.005] active:scale-[0.995]"
                                        style={{
                                          borderColor: isSelected
                                            ? "var(--nav-primary)"
                                            : "var(--nav-line)",
                                          background: isSelected
                                            ? "var(--nav-primary-soft)"
                                            : "var(--nav-surface)",
                                          boxShadow: isSelected
                                            ? `0 8px 20px -12px var(--nav-primary-glow)`
                                            : "none",
                                        }}
                                      >
                                        <div
                                          className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
                                          style={{
                                            background: isSelected
                                              ? "var(--nav-primary)"
                                              : "var(--nav-surface)",
                                            color: isSelected
                                              ? "#FFFFFF"
                                              : "var(--nav-primary-2)",
                                          }}
                                        >
                                          <Icon className="text-sm" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className="text-[14px] font-bold leading-tight"
                                            style={{ color: "var(--nav-txt)" }}
                                          >
                                            {opt.label}
                                          </p>
                                          {opt.desc && (
                                            <p
                                              className="text-[12px] leading-snug mt-0.5"
                                              style={{
                                                color: "var(--nav-txt-soft)",
                                              }}
                                            >
                                              {opt.desc}
                                            </p>
                                          )}
                                        </div>
                                        <div
                                          className="flex-shrink-0 h-5 w-5 rounded-md flex items-center justify-center"
                                          style={
                                            isSelected
                                              ? {
                                                  background: "var(--nav-primary)",
                                                  border: `1px solid var(--nav-primary)`,
                                                }
                                              : {
                                                  border: `2px solid var(--nav-line-str)`,
                                                }
                                          }
                                        >
                                          {isSelected && (
                                            <FaCheck className="text-[9px] text-white" />
                                          )}
                                        </div>
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div
                                  className="rounded-2xl p-6 text-center"
                                  style={{
                                    background: "var(--nav-surface)",
                                    border: `1px dashed var(--nav-line-str)`,
                                  }}
                                >
                                  <p
                                    className="text-[13px]"
                                    style={{ color: "var(--nav-txt-soft)" }}
                                  >
                                    No options to choose from — click Continue.
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex-shrink-0 px-5 sm:px-6 pt-3 pb-6">
                      <div className="w-full max-w-[400px] mx-auto">
                        {phase === "instructions" ? (
                          <>
                            <AgreementCheckbox
                              checked={agreed}
                              onChange={setAgreed}
                              label={
                                <>
                                  I've read and agree to the{" "}
                                  <strong style={{ color: "var(--nav-txt)" }}>
                                    guidelines
                                  </strong>{" "}
                                  above.
                                </>
                              }
                            />

                            <button
                              onClick={
                                forceMode ? acknowledge : goToWizard
                              }
                              disabled={!agreed}
                              className="mt-4 w-full py-4 rounded-full text-[15px] font-bold tracking-wide transition-transform ob-btn-primary"
                            >
                              {config.cta_label || "Next"}
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={prevStep}
                              disabled={isFinishing}
                              className="inline-flex items-center justify-center h-[54px] w-[54px] rounded-full border transition-colors disabled:opacity-50 ob-btn-secondary"
                              aria-label="Back"
                            >
                              <FaArrowLeft className="text-[11px]" />
                            </button>

                            <button
                              onClick={nextStep}
                              disabled={isFinishing}
                              className="flex-1 h-[54px] rounded-full text-[15px] font-bold tracking-wide transition-transform disabled:opacity-80 disabled:cursor-wait inline-flex items-center justify-center gap-2 ob-btn-primary"
                            >
                              {isFinishing ? (
                                <>
                                  <FaSpinner className="text-[12px] animate-spin" />
                                  Setting up…
                                </>
                              ) : isLastStep ? (
                                "Finish"
                              ) : (
                                "Next"
                              )}
                            </button>

                            <button
                              onClick={acknowledge}
                              disabled={isFinishing}
                              className="h-[54px] px-4 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-50"
                              style={{ color: "var(--nav-txt-soft)" }}
                            >
                              Skip
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;