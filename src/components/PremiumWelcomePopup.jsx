// src/components/PremiumWelcomePopup.jsx
// Premium onboarding slider — modern split-panel layout (mobile stack, desktop side-by-side).
import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaArrowRight,
  FaMagic,
  FaEraser,
  FaImage,
  FaComments,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const STORAGE_KEY = (userId) => `premium_welcome_seen_${userId}`;

/* ────────────────────────────────────────────────────────────────
   SLIDES
   ──────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    icon: FaMagic,
    bg: "https://cdn.cgdream.ai/_next/image?url=https%3A%2F%2Fapi.cgdream.ai%2Frails%2Factive_storage%2Fblobs%2Fredirect%2FeyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNGtCaFE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--e608afaefdf42f3ec7e7e28ad01cbcdaa37bc789%2F2c73c0f5-02b9-4538-8d0a-5dd2bca9ccf9_0.png&w=1920&q=95",
    title: "Generate any image",
    desc: "Describe what you want and let AI do the rest. Perfect for product shots, posters, and logos — no design skills needed.",
  },
  {
    icon: FaEraser,
    bg: "https://cdn.cgdream.ai/_next/image?url=https%3A%2F%2Fapi.cgdream.ai%2Frails%2Factive_storage%2Fblobs%2Fredirect%2FeyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNlR5ckE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--20a24dc7483d2031265f4b9a26c45be2e2ba560e%2F4651f10f-fb7e-413e-b421-170baeea0634_0.png&w=1920&q=95",
    title: "Remove backgrounds",
    desc: "Turn any photo into a clean, professional cut-out in one tap. Ideal for listings, catalogs, and storefronts.",
  },
  {
    icon: FaImage,
    bg: "https://www.bazaart.com/wp-content/uploads/2024/11/handbag5.jpg",
    title: "Post unlimited ads",
    desc: "List as many products as you want, whenever you want. Your ads get priority placement in search.",
  },
  {
    icon: FaComments,
    bg: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=1200&q=80&auto=format&fit=crop",
    title: "Priority chat",
    desc: "Message buyers and sellers in real time with zero delays. Every deal is escrow-protected for safety.",
  },
];

/* ────────────────────────────────────────────────────────────────
   THEME HOOK
   ──────────────────────────────────────────────────────────────── */
const useTheme = () => {
  const getTheme = () => {
    if (typeof document === "undefined") return "dark";
    const html = document.documentElement;
    if (html.classList.contains("theme-light")) return "light";
    if (html.classList.contains("theme-dark")) return "dark";
    if (html.classList.contains("dark")) return "dark";
    try {
      const saved =
        localStorage.getItem("theme") || localStorage.getItem("app-theme");
      if (saved === "light") return "light";
      if (saved === "dark") return "dark";
    } catch {}
    return "dark";
  };
  const [theme, setTheme] = useState(getTheme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return theme;
};

export default function PremiumWelcomePopup() {
  const { user, isPremium } = useAuth();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const total = SLIDES.length;
  const isLast = step === total - 1;

  const userIsPremium = typeof isPremium === "function" ? isPremium() : false;

  /* Show once per day for premium users */
  useEffect(() => {
    if (!user?.id || !userIsPremium) return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY(user.id));
      if (seen === new Date().toDateString()) return;
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    } catch {}
  }, [user?.id, userIsPremium]);

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      if (user?.id) {
        localStorage.setItem(STORAGE_KEY(user.id), new Date().toDateString());
      }
    } catch {}
  }, [user?.id]);

  const next = () => {
    if (isLast) handleClose();
    else setStep((s) => Math.min(s + 1, total - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const goTo = (i) => setStep(i);

  /* Keyboard nav */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, isLast, step]);

  /* Lock body scroll */
  useEffect(() => {
    if (!open) return;
    setStep(0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const isDark = theme === "dark";

  const T = {
    overlay: isDark ? "rgba(0,0,0,0.85)" : "rgba(20,20,30,0.55)",
    card: isDark ? "#12121A" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(20,20,30,0.06)",
    heading: isDark ? "#FFFFFF" : "#0B0B0F",
    body: isDark ? "rgba(255,255,255,0.62)" : "rgba(15,20,25,0.58)",
    faint: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,20,25,0.40)",
    dotIdle: isDark ? "rgba(255,255,255,0.20)" : "rgba(15,20,25,0.14)",
    dotActive: isDark ? "#f5b947" : "#c8631f",
    primary: isDark ? "#eb7d34" : "#c8631f",
    primary2: isDark ? "#f59e0b" : "#eb7d34",
    mediaBg: isDark ? "#0A0A12" : "#F5F5F7",
    closeBg: isDark ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.90)",
    closeBorder: isDark ? "rgba(255,255,255,0.20)" : "rgba(20,20,30,0.10)",
    leftTint: isDark
      ? "linear-gradient(180deg, rgba(235,125,52,0.06) 0%, transparent 60%)"
      : "linear-gradient(180deg, rgba(200,99,31,0.05) 0%, transparent 60%)",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pw"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
          className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6"
          style={{
            background: T.overlay,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-full overflow-hidden flex flex-col md:flex-row
              rounded-t-[24px] md:rounded-[28px]
              md:max-w-[900px] lg:max-w-[1000px]
              h-[92dvh] md:h-auto md:max-h-[85vh]
            "
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              boxShadow: isDark
                ? "0 40px 100px -30px rgba(0,0,0,0.9)"
                : "0 40px 100px -30px rgba(0,0,0,0.25)",
            }}
          >
            {/* ══════════ CLOSE (mobile) ══════════ */}
            <button
              onClick={handleClose}
              aria-label="Close"
              type="button"
              className="absolute top-3 right-3 z-30 h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 md:hidden"
              style={{
                background: T.closeBg,
                border: `1px solid ${T.closeBorder}`,
                color: isDark ? "#FFFFFF" : "#0B0B0F",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <FaTimes className="text-[12px]" />
            </button>

            {/* ══════════ LEFT: IMAGE PANEL ══════════ */}
            <div
              className="
                relative flex-shrink-0
                h-[45%] md:h-auto md:w-[45%]
                overflow-hidden
              "
              style={{ background: T.mediaBg }}
            >
              {/* Sliding images */}
              <motion.div
                animate={{ x: `-${step * 100}%` }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -60 && !isLast) next();
                  else if (info.offset.x > 60 && step > 0) prev();
                }}
                className="absolute inset-0 flex"
                style={{ touchAction: "pan-y" }}
              >
                {SLIDES.map((s, i) => (
                  <div
                    key={i}
                    className="min-w-full h-full relative select-none"
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${s.bg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 40%, rgba(0,0,0,0.35) 100%)",
                      }}
                    />
                  </div>
                ))}
              </motion.div>

              {/* Dots — top-left of image (desktop) */}
              <div className="hidden md:flex absolute top-5 left-5 z-20 items-center gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="rounded-full transition-all"
                    style={{
                      width: i === step ? 24 : 8,
                      height: 8,
                      background:
                        i === step
                          ? "#FFFFFF"
                          : "rgba(255,255,255,0.45)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      boxShadow:
                        i === step
                          ? "0 2px 8px rgba(0,0,0,0.35)"
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ══════════ RIGHT: CONTENT PANEL ══════════ */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Desktop close */}
              <button
                onClick={handleClose}
                aria-label="Close"
                type="button"
                className="hidden md:flex absolute top-5 right-5 z-30 h-9 w-9 rounded-full items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(20,20,30,0.05)",
                  border: `1px solid ${T.border}`,
                  color: T.heading,
                }}
              >
                <FaTimes className="text-[12px]" />
              </button>

              <div
                className="
                  flex flex-col flex-1 min-h-0
                  px-6 pt-6 pb-6
                  md:px-10 md:pt-14 md:pb-10
                  lg:px-12 lg:pt-16 lg:pb-12
                "
              >
                {/* Animated content */}
                <div className="flex-1 min-h-0 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* Step counter */}
                      <div className="flex items-center gap-2 mb-4 md:mb-5">
                        <span
                          className="font-ticket-body text-[11px] font-extrabold tracking-[0.2em] uppercase"
                          style={{ color: T.primary }}
                        >
                          Step {String(step + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="h-px flex-1"
                          style={{
                            background: `linear-gradient(90deg, ${T.primary} 30%, transparent)`,
                          }}
                        />
                        <span
                          className="font-ticket-body text-[11px] font-semibold"
                          style={{ color: T.faint }}
                        >
                          {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className="
                          font-ticket-display
                          text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px]
                          leading-[1.1] tracking-tight
                        "
                        style={{ color: T.heading, fontWeight: 800 }}
                      >
                        {SLIDES[step].title}
                      </h2>

                      {/* Description */}
                      <p
                        className="font-ticket-body text-[14px] md:text-[15px] mt-3 md:mt-4 leading-relaxed max-w-[420px]"
                        style={{ color: T.body, fontWeight: 500 }}
                      >
                        {SLIDES[step].desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Dots — mobile only */}
                <div className="flex md:hidden items-center justify-center gap-2 mt-5 mb-4 flex-shrink-0">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="rounded-full transition-all"
                      style={{
                        width: i === step ? 24 : 8,
                        height: 8,
                        background: i === step ? T.dotActive : T.dotIdle,
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                {/* ══════════ SIMPLE BUTTONS ══════════ */}
                <div className="flex-shrink-0 mt-6 md:mt-8">
                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={next}
                    className="
                      group w-full inline-flex items-center justify-center gap-2
                      py-4 rounded-2xl
                      font-ticket-body text-[14px] font-extrabold tracking-wide
                      transition-all
                      hover:scale-[1.01] active:scale-[0.98]
                    "
                    style={{
                      background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                      color: "#FFFFFF",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: isDark
                        ? "0 12px 28px -10px rgba(235,125,52,0.65)"
                        : "0 12px 28px -10px rgba(200,99,31,0.45)",
                    }}
                  >
                    <span>{isLast ? "Get Started" : "Continue"}</span>
                    <FaArrowRight className="text-[11px] transition-transform group-hover:translate-x-1" />
                  </button>

                  {/* Secondary text link */}
                  {!isLast && (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="
                        block w-full text-center mt-3 py-2
                        font-ticket-body text-[12.5px] font-semibold
                        transition-opacity hover:opacity-70
                      "
                      style={{
                        color: T.faint,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Skip tour
                    </button>
                  )}

                  {/* Footer hint */}
                  <p
                    className="text-center mt-2 font-ticket-body text-[11px] font-medium"
                    style={{ color: T.faint }}
                  >
                    You'll see this once. Enjoy Premium.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}