// components/Hero/Hero.jsx — Modern AI Studio Hero (brand orange · dark + light)
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowLeft,
  FaStar,
  FaCar,
  FaMobileAlt,
  FaMotorcycle,
  FaHome,
  FaLaptop,
  FaStore,
  FaShieldAlt,
  FaHandshake,
  FaSyncAlt,
  FaLeaf,
  FaMoneyBillWave,
  FaCamera,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaBolt,
  FaClock,
  FaMagic,
  FaPlay,
  FaTimes,
  FaExpand,
  FaCompress,
  FaComments,
  FaUsers,
  FaVideo,
  FaRobot,
  FaEraser,
  FaBrain,
  FaImages,
} from "react-icons/fa";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

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
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    .theme-dark {
      --hero-bg-1:        #0A0A12;
      --hero-bg-2:        #0F0F1A;
      --hero-panel:       rgba(255,255,255,0.045);
      --hero-panel-2:     rgba(255,255,255,0.02);
      --hero-line:        rgba(255,255,255,0.08);
      --hero-line-str:    rgba(255,255,255,0.15);
      --hero-txt:         #FFFFFF;
      --hero-txt-soft:    rgba(255,255,255,0.65);
      --hero-txt-faint:   rgba(255,255,255,0.45);
      --hero-dot:         rgba(255,255,255,0.06);
      --hero-orb-1:       rgba(252,157,3,0.25);
      --hero-orb-2:       rgba(200,99,31,0.20);
      --hero-primary:     #fc9d03;
      --hero-primary-2:   #f59e0b;
      --hero-primary-3:   #c8631f;
      --hero-primary-soft: rgba(252,157,3,0.14);
      --hero-primary-glow: rgba(252,157,3,0.45);
    }

    .theme-light {
      --hero-bg-1:        #FFFFFF;
      --hero-bg-2:        #FAF7F3;
      --hero-panel:       rgba(255,255,255,0.85);
      --hero-panel-2:     rgba(255,255,255,0.95);
      --hero-line:        rgba(20,20,30,0.08);
      --hero-line-str:    rgba(20,20,30,0.15);
      --hero-txt:         #1A1613;
      --hero-txt-soft:    rgba(26,22,19,0.62);
      --hero-txt-faint:   rgba(26,22,19,0.42);
      --hero-dot:         rgba(20,20,30,0.08);
      --hero-orb-1:       rgba(252,157,3,0.18);
      --hero-orb-2:       rgba(200,99,31,0.12);
      --hero-primary:     #c8631f;
      --hero-primary-2:   #fc9d03;
      --hero-primary-3:   #f59e0b;
      --hero-primary-soft: rgba(200,99,31,0.10);
      --hero-primary-glow: rgba(200,99,31,0.35);
    }

    .hero-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--hero-orb-1), transparent 60%),
        radial-gradient(900px 500px at 100% 25%, var(--hero-orb-2), transparent 60%),
        linear-gradient(180deg, var(--hero-bg-1) 0%, var(--hero-bg-2) 100%);
      color: var(--hero-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }

    .hero-grad-text {
      background: linear-gradient(120deg, var(--hero-primary) 0%, var(--hero-primary-2) 50%, var(--hero-primary-3) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .hero-grad-bg {
      background: linear-gradient(135deg, var(--hero-primary) 0%, var(--hero-primary-2) 50%, var(--hero-primary-3) 100%);
    }

    .hero-glass {
      background: linear-gradient(180deg, var(--hero-panel), var(--hero-panel-2));
      border: 1px solid var(--hero-line);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      transition: background 0.35s ease, border-color 0.35s ease;
    }

    @keyframes hero-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    .hero-float { animation: hero-float 3.5s ease-in-out infinite; }

    @keyframes ai-pulse {
      0%, 100% { box-shadow: 0 12px 32px -8px var(--hero-primary-glow), 0 0 0 0 var(--hero-primary-glow); }
      50%      { box-shadow: 0 12px 32px -8px var(--hero-primary-glow), 0 0 0 12px rgba(252,157,3,0); }
    }
    .ai-pulse { animation: ai-pulse 2.4s ease-in-out infinite; }

    @keyframes demo-pulse {
      0%, 100% { box-shadow: 0 12px 32px -8px rgba(0,0,0,0.35), 0 0 0 0 rgba(255,255,255,0.35); }
      50%      { box-shadow: 0 12px 32px -8px rgba(0,0,0,0.35), 0 0 0 10px rgba(255,255,255,0); }
    }
    .demo-pulse { animation: demo-pulse 2.4s ease-in-out infinite; }

    .demo-video:fullscreen {
      object-fit: contain !important;
      width: 100vw !important;
      height: 100vh !important;
      background: #000 !important;
    }
    .demo-video:-webkit-full-screen {
      object-fit: contain !important;
      width: 100vw !important;
      height: 100vh !important;
      background: #000 !important;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
const AnimatedCounter = ({ value, duration = 1.8 }) => {
  const match = value.match(/^([^\d]*)([\d,\.]+)(.*)$/);
  const prefix = match ? match[1] : "";
  const numStr = match ? match[2].replace(/,/g, "") : "0";
  const suffix = match ? match[3] : "";
  const target = parseFloat(numStr) || 0;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const hasCommas = match && match[2].includes(",");
    return hasCommas
      ? Math.floor(latest).toLocaleString("en-US")
      : Number.isInteger(target)
      ? Math.floor(latest).toString()
      : latest.toFixed(2);
  });

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [target, count, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOLD STAMP
   ═══════════════════════════════════════════════════════════════ */
const SoldStamp = () => (
  <motion.div
    initial={{ scale: 0, rotate: -45, opacity: 0 }}
    animate={{ scale: 1, rotate: -14, opacity: 1 }}
    exit={{ scale: 0, rotate: -45, opacity: 0 }}
    transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
    className="absolute top-16 sm:top-20 right-3 sm:right-5 z-20 pointer-events-none"
  >
    <div className="relative">
      <div
        className="absolute inset-0 rounded-full blur-2xl animate-pulse"
        style={{ background: "var(--hero-primary-glow)" }}
      />
      <div
        className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full p-[3px]"
        style={{ background: "linear-gradient(135deg, var(--hero-primary), var(--hero-primary-2))" }}
      >
        <div
          className="h-full w-full rounded-full flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--hero-primary), var(--hero-primary-3))",
            border: "2px dashed rgba(255,255,255,0.75)",
          }}
        >
          <span className="font-ticket-body text-[7px] sm:text-[8px] font-black text-white/95 tracking-[0.2em] uppercase leading-none mb-0.5">
            Posted
          </span>
          <span className="font-ticket-display text-[13px] sm:text-[15px] font-bold text-white tracking-wider uppercase leading-none">
            LIVE
          </span>
          <span className="font-ticket-body text-[6.5px] sm:text-[7.5px] font-bold text-white/90 tracking-[0.15em] uppercase leading-none mt-1">
            Everywhere
          </span>
          <div className="w-8 sm:w-10 h-px bg-white/60 my-0.5" />
          <div className="flex items-center gap-0.5">
            <FaCheckCircle className="text-white text-[7px] sm:text-[8px]" />
            <span className="font-ticket-body text-[6px] sm:text-[6.5px] font-bold text-white/90 tracking-wider">
              VERIFIED
            </span>
          </div>
        </div>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-8px] pointer-events-none"
      >
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--hero-primary-2)",
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateY(-58px) translateX(-50%)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   CARD LIGHT SWEEP
   ═══════════════════════════════════════════════════════════════ */
const CardLightSweep = () => {
  const sharedEase = [0.45, 0, 0.15, 1];
  return (
    <>
      <motion.div
        animate={{ opacity: [0.1, 0.35, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none z-20 mix-blend-soft-light"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.32), transparent 65%)" }}
      />
      <motion.div
        initial={{ x: "-150%" }}
        animate={{ x: "150%" }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: sharedEase }}
        className="absolute inset-y-0 -inset-x-1/2 pointer-events-none z-30 mix-blend-overlay"
        style={{
          background: "linear-gradient(105deg, transparent 28%, rgba(252,157,3,0.2) 40%, rgba(255,255,255,0.45) 47%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.45) 53%, rgba(252,157,3,0.2) 60%, transparent 72%)",
          filter: "blur(10px)",
        }}
      />
      <motion.div
        initial={{ x: "-160%" }}
        animate={{ x: "160%" }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: sharedEase, delay: 0.35 }}
        className="absolute inset-y-0 -inset-x-1/2 pointer-events-none z-30 mix-blend-screen"
        style={{
          background: "linear-gradient(105deg, transparent 45%, rgba(255,255,255,0.55) 50%, transparent 55%)",
          filter: "blur(3px)",
        }}
      />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MODERN ITEM CARD
   ═══════════════════════════════════════════════════════════════ */
const ModernItemCard = ({ flipped, setFlipped, currentItem, currentIndex, total, onNext }) => {
  useEffect(() => {
    const timer = setInterval(onNext, 6000);
    return () => clearInterval(timer);
  }, [onNext]);

  const item = currentItem;

  return (
    <div className="relative w-full max-w-[340px] xs:max-w-sm sm:max-w-md">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.15, 0.35] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[26px] blur-2xl"
        style={{ background: "var(--hero-primary-soft)" }}
      />

      <div
        className="relative h-[360px] xs:h-[400px] sm:h-[440px] md:h-[480px] cursor-pointer group"
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          animate={{ rotate: [-7, -9, -7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-[26px]"
          style={{ background: "linear-gradient(135deg, var(--hero-primary), var(--hero-primary-2))" }}
        />
        <motion.div
          animate={{ rotate: [5, 8, 5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-0 rounded-[26px] bg-[#0E0E18]"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${item.id}-${flipped ? "back" : "front"}`}
            initial={{ rotateY: flipped ? -180 : 0, opacity: 0, scale: 0.85 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: flipped ? 180 : -180, opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 180, damping: 20 }}
            className="absolute inset-0 rounded-[26px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              background: "#0E0E18",
              border: "2px solid #1C1C28",
            }}
          >
            {!flipped ? (
              <div className="relative h-full w-full flex items-center justify-center overflow-hidden" style={{ background: "#0E0E18" }}>
                <motion.div
                  animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 20%, rgba(252,157,3,0.5), transparent 55%), radial-gradient(circle at 70% 80%, rgba(200,99,31,0.4), transparent 55%)",
                    backgroundSize: "200% 200%",
                  }}
                />

                <motion.img
                  key={item.image}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={item.image}
                  alt={item.title}
                  className="relative h-full w-full object-contain p-4 sm:p-6 z-10"
                  loading="lazy"
                />

                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
                <CardLightSweep />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-ticket-body text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, var(--hero-primary), var(--hero-primary-2))" }}
                  >
                    {item.category}
                  </motion.span>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 rounded-full backdrop-blur-md flex items-center justify-center"
                    style={{ background: "rgba(252,157,3,0.18)", border: "2px solid var(--hero-primary-2)" }}
                  >
                    <FaSyncAlt className="text-[var(--hero-primary-2)] text-xs" />
                  </motion.div>
                </div>

                <SoldStamp />

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20">
                  <div className="absolute inset-x-0 bottom-0 h-44 sm:h-52 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-32 sm:h-36 backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black_60%,transparent)] pointer-events-none" />

                  <div className="relative z-10">
                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-1.5 text-white/85 font-ticket-body text-[10px] sm:text-xs font-medium mb-2"
                    >
                      <FaMapMarkerAlt className="text-[var(--hero-primary-2)]" />
                      {item.location}
                    </motion.div>
                    <motion.h3
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.22 }}
                      className="font-ticket-display text-lg sm:text-2xl font-bold text-white leading-tight mb-2"
                    >
                      {item.title}
                    </motion.h3>
                    <div className="flex items-center justify-between">
                      <motion.p
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-ticket-display text-xl sm:text-2xl font-bold hero-grad-text"
                      >
                        <AnimatedCounter value={item.price} duration={2} />
                      </motion.p>
                      <motion.span
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.38 }}
                        className="font-ticket-body text-[10px] text-white/90 flex items-center gap-1.5"
                      >
                        <FaSyncAlt className="text-[9px]" />
                        Tap for details
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative h-full w-full p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
                style={{ background: "#0E0E18" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl pointer-events-none"
                  style={{ background: "rgba(252,157,3,0.55)" }}
                />
                <motion.div
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl pointer-events-none"
                  style={{ background: "rgba(200,99,31,0.4)" }}
                />

                <CardLightSweep />

                <motion.div
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="relative flex items-center justify-between z-10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ border: "2px solid var(--hero-primary-2)" }}
                    >
                      <FaMoneyBillWave className="text-[var(--hero-primary-2)] text-base" />
                    </div>
                    <span className="font-ticket-body text-[10px] font-bold text-white uppercase tracking-widest">
                      Price Details
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ border: "2px solid var(--hero-primary-2)" }}
                  >
                    <FaSyncAlt className="text-[var(--hero-primary-2)] text-xs" />
                  </motion.div>
                </motion.div>

                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4 text-center relative z-10">
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-ticket-body text-[10px] font-semibold text-[var(--hero-primary-2)] uppercase tracking-widest"
                  >
                    Selling For
                  </motion.p>

                  <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 160 }}
                    className="font-ticket-display text-3xl sm:text-4xl md:text-5xl font-bold hero-grad-text"
                  >
                    <AnimatedCounter value={item.price} duration={1.6} />
                  </motion.p>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-16 h-px bg-white/30"
                  />

                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.45, type: "spring", stiffness: 200 }}
                    className="relative h-16 w-16"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: "2px solid rgba(252,157,3,0.7)" }}
                    />
                    <div
                      className="h-full w-full rounded-2xl overflow-hidden"
                      style={{ border: "2px solid var(--hero-primary-2)" }}
                    >
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="font-ticket-body text-xs sm:text-sm text-white/70 leading-relaxed max-w-[260px]"
                  >
                    {item.description}
                  </motion.p>

                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className="flex flex-wrap items-center justify-center gap-1.5 mt-1"
                  >
                    <span
                      className="font-ticket-body text-[9px] px-2 py-1 rounded-full font-semibold flex items-center gap-1"
                      style={{ border: "1px solid rgba(252,157,3,0.6)", color: "var(--hero-primary-2)" }}
                    >
                      <FaCheckCircle className="text-[8px]" /> Verified Seller
                    </span>
                    <span className="font-ticket-body text-[9px] px-2 py-1 rounded-full border border-white/25 text-white/80 font-semibold flex items-center gap-1">
                      <FaShieldAlt className="text-[8px]" /> Escrow
                    </span>
                    <span className="font-ticket-body text-[9px] px-2 py-1 rounded-full border border-white/25 text-white/80 font-semibold flex items-center gap-1">
                      <FaBolt className="text-[8px]" /> Live Chat
                    </span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="relative flex items-center justify-between font-ticket-body text-[10px] text-white/60 z-10 pt-4 border-t-2 border-dashed border-white/15"
                >
                  <div className="flex items-center gap-1.5">
                    <FaLeaf className="text-[var(--hero-primary-2)]" />
                    <span>AI Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaClock className="text-[var(--hero-primary-2)]/80 text-[9px]" />
                    <span>
                      {currentIndex + 1} / {total}
                    </span>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute -top-4 -right-4 h-12 w-12 rounded-full blur-xl animate-pulse"
          style={{ background: "var(--hero-primary-soft)" }}
        />
        <div
          className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full blur-xl animate-pulse delay-150"
          style={{ background: "var(--hero-orb-2)" }}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SAMPLE DATA
   ═══════════════════════════════════════════════════════════════ */
const marketplaceItems = [
  { id: 1, category: "Vehicles", title: "Toyota Hilux Pickup truck", location: "Lahore, Pakistan", price: "Rs 15,600,000",
    description: "Toyota Hilux Pickup truck 2.8L diesel, automatic, 78,000 km driven. Single owner, complete service history, brand-new tires, and TRD body kit.", image: "/car1.png" },
  { id: 2, category: "Vehicles", title: "Land Cruiser Prado 2015", location: "Karachi, Pakistan", price: "Rs 18,800,000",
    description: "2015 Toyota Land Cruiser Prado TX — 2.7L petrol, automatic, 4x4, sunroof, leather interior, and 92,000 km. Imported, fully documented.", image: "/car2.png" },
  { id: 4, category: "Property", title: "Facade Residential Two Floor", location: "Lahore, DHA Phase 2", price: "Rs 6.88 crore",
    description: "10 Marla double-storey facade house in DHA Phase 2, Lahore. 5 bedrooms, 6 baths, drawing room, lounge, and spacious car porch.", image: "/car4.png" },
  { id: 3, category: "Vehicles", title: "Honda Civic Type R 2018", location: "Islamabad", price: "Rs 6,800,000",
    description: "2018 Honda Civic Type R (FK8) — 2.0L turbo VTEC, 306 HP, 6-speed manual. Championship White, only 45,000 km, unmodified.", image: "/car3.png" },
  { id: 5, category: "Mobiles", title: "iPhone 15 Pro 256GB", location: "Rawalpindi, Punjab", price: "Rs 318,000",
    description: "iPhone 15 Pro 256GB — Natural Titanium, PTA approved, boxed. Battery health 98%, no scratches, complete with warranty.", image: "/car5.png" },
  { id: 6, category: "Bikes", title: "Honda F1 Sport 150cc", location: "Rawalpindi, Punjab", price: "Rs 220,000",
    description: "Honda F1 Sport 150cc — black, red, and gray. Single owner, only 4,200 km driven. Documents clear, brand-new tires.", image: "/car6.png" },
];

/* ═══════════════════════════════════════════════════════════════
   DEMO VIDEOS
   ═══════════════════════════════════════════════════════════════ */
const DEMO_VIDEOS = [
  {
    id: "demo-1",
    src: "https://cdn.dribbble.com/userupload/48346304/file/284fb1f8fb638fedcc3091d938b20b1a.mp4",
    title: "How the app works",
    subtitle: "Post · Chat · Sell · Create with AI",
  },
  {
    id: "demo-2",
    src: "https://cdn.dribbble.com/userupload/47510971/file/5b1096096003ebeaf9156fd7d67183cf.mp4",
    title: "Watch listings go live",
    subtitle: "AI writes, perfects, and posts for you",
  },
  {
    id: "demo-3",
    src: "https://cdn.dribbble.com/userupload/45770786/file/0c40faecdfcdaffc80d81d0f074226f2.mp4",
    title: "Real-time seller chat",
    subtitle: "Talk to buyers instantly — no waiting",
  },
];
/* ═══════════════════════════════════════════════════════════════
   FULLSCREEN DEMO MODAL — auto-fullscreen + arrows + in-video close
   ═══════════════════════════════════════════════════════════════ */
const DemoModal = ({ open, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const active = DEMO_VIDEOS[activeIndex];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = stageRef.current;
    if (!el) return;

    const t = setTimeout(async () => {
      try {
        if (!document.fullscreenElement) {
          await el.requestFullscreen();
        }
      } catch (err) {
        console.warn("Auto-fullscreen blocked:", err);
      }
    }, 150);

    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) return;
    (async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.warn("Exit fullscreen failed:", err);
      }
    })();
  }, [open]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) return;
        onClose();
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, activeIndex]);

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  const next = () => setActiveIndex((i) => (i + 1) % DEMO_VIDEOS.length);
  const prev = () => setActiveIndex((i) => (i - 1 + DEMO_VIDEOS.length) % DEMO_VIDEOS.length);

  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="demo-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[999] flex flex-col"
          style={{ background: "rgba(0,0,0,0.98)" }}
        >
          {/* Top bar (header info only — no close button here) */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #fc9d03 0%, #f59e0b 100%)",
                  boxShadow: "0 8px 20px -8px rgba(252,157,3,0.7)",
                }}
              >
                <FaPlay className="text-[11px] text-white" />
              </span>
              <div className="min-w-0">
                <p className="font-ticket-body text-[10px] font-black uppercase tracking-[0.2em] text-white/60 leading-none">
                  Demo · {activeIndex + 1} / {DEMO_VIDEOS.length}
                </p>
                <p className="font-ticket-display text-sm sm:text-base font-bold text-white leading-tight truncate mt-0.5">
                  {active.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <FaCompress className="text-[11px]" /> : <FaExpand className="text-[11px]" />}
              </button>
            </div>
          </div>

          {/* Video stage */}
          <div
            ref={stageRef}
            className="relative flex-1 min-h-0 flex items-center justify-center bg-black"
            style={{ padding: "0 8px" }}
          >
            {/* Prev arrow */}
            <button
              onClick={prev}
              className="group absolute left-2 sm:left-4 z-30 inline-flex items-center justify-center h-11 w-11 sm:h-14 sm:w-14 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 32px -8px rgba(0,0,0,0.7)",
              }}
              aria-label="Previous video"
            >
              <FaArrowLeft className="text-[14px] sm:text-[18px] transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* ─── Video card wrapper ─── */}
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.video
                  key={active.id}
                  ref={videoRef}
                  src={active.src}
                  autoPlay
                  muted
                  playsInline
                  controls
                  preload="auto"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="demo-video w-full h-full rounded-2xl object-contain bg-black"
                  style={{
                    boxShadow:
                      "0 40px 100px -30px rgba(252,157,3,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                  onEnded={() => {
                    if (DEMO_VIDEOS.length > 1) next();
                  }}
                />
              </AnimatePresence>
{/* ─── Close icon INSIDE the video card (top-right) ─── */}
<motion.button
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.25, delay: 0.2 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={onClose}
  aria-label="Close video"
  title="Close (Esc)"
  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[50] inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full text-white transition-all duration-300"
  style={{
    background: "rgba(80,80,80,0.75)",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 6px 20px -6px rgba(0,0,0,0.6)",
  }}
>
  <FaTimes className="text-[15px] sm:text-[17px]" />
</motion.button>
            </div>

            {/* Next arrow */}
            <button
              onClick={next}
              className="group absolute right-2 sm:right-4 z-30 inline-flex items-center justify-center h-11 w-11 sm:h-14 sm:w-14 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 32px -8px rgba(0,0,0,0.7)",
              }}
              aria-label="Next video"
            >
              <FaArrowRight className="text-[14px] sm:text-[18px] transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */
const Hero = () => {
  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const theme = useTheme();

  const nextCard = () => {
    setFlipped(false);
    setCurrentCard((prev) => (prev + 1) % marketplaceItems.length);
  };

  const features = [
    { label: "Live Seller Chat",   icon: FaComments },
    { label: "Social Feed",        icon: FaImages },
    { label: "Marketplace",        icon: FaStore },
    { label: "AI Image Gen",       icon: FaMagic },
    { label: "BG Remover",         icon: FaEraser },
    { label: "ChatGPT-5 Tools",    icon: FaBrain },
  ];

  const trustPoints = [
    { icon: FaBolt,      title: "Real-time chat",      body: "Talk to sellers instantly" },
    { icon: FaShieldAlt, title: "Escrow protected",    body: "Your money, held safely" },
    { icon: FaRobot,     title: "AI does the work",    body: "ChatGPT-5 · NanoBanana · BG" },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
  const rise = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      <section className={`relative min-h-screen flex items-center pt-20 sm:pt-28 lg:pt-20 pb-16 sm:pb-20 overflow-hidden hero-bg theme-${theme}`}>
        <FontStyles />

        <div
          className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full hero-float"
          style={{ background: "radial-gradient(circle, var(--hero-orb-1), transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full hero-float"
          style={{ background: "radial-gradient(circle, var(--hero-orb-2), transparent 70%)", filter: "blur(60px)", animationDelay: "2s" }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(var(--hero-dot) 0.7px, transparent 0.7px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-[1.15fr_1fr] gap-10 sm:gap-12 lg:gap-12 xl:gap-16 items-center"
          >
            <div className="space-y-6 sm:space-y-7 text-center lg:text-left">
         <motion.h1
                variants={rise}
                className="font-ticket-display text-[44px] xs:text-[40px] sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.1] tracking-tight text-[var(--hero-txt)]"
              >
                Buy Sell Anything{" "}
                <br className="hidden sm:block" />
                <span className="hero-grad-text">Fast & Secure</span>
              </motion.h1>
              <motion.p
                variants={rise}
                className="font-ticket-body text-[13px] xs:text-sm sm:text-base md:text-lg text-[var(--hero-txt-soft)] max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                One app for{" "}
                <span className="font-semibold text-[var(--hero-txt)]">live chat</span>,{" "}
                <span className="font-semibold text-[var(--hero-txt)]">social feed</span>,{" "}
                <span className="font-semibold text-[var(--hero-txt)]">marketplace</span>, and AI —{" "}
                <span className="font-semibold text-[var(--hero-txt)]">ChatGPT-5</span>,{" "}
                <span className="font-semibold text-[var(--hero-txt)]">image generation</span>, and{" "}
                <span className="font-semibold text-[var(--hero-txt)]">background removal</span>. Everything you need, in one place.
              </motion.p>

              <motion.ul
                variants={rise}
                className="grid grid-cols-2 gap-x-3 xs:gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 max-w-lg mx-auto lg:mx-0"
              >
                {features.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 font-ticket-body text-[11px] xs:text-xs sm:text-sm text-[var(--hero-txt)] font-medium text-left"
                  >
                    <div
                      className="p-1.5 rounded-lg shrink-0"
                      style={{
                        background: "var(--hero-primary-soft)",
                        border: "1px solid rgba(252,157,3,0.4)",
                      }}
                    >
                      <Icon className="text-[var(--hero-primary-2)] text-xs sm:text-sm" />
                    </div>
                    <span className="truncate">{label}</span>
                  </li>
                ))}
              </motion.ul>

              <motion.div
                variants={rise}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1"
              >
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="demo-pulse group relative inline-flex items-center justify-center gap-2 pl-4 pr-7 py-2.5 rounded-md overflow-hidden text-white font-ticket-body font-bold text-[12px] xs:text-[13px] sm:text-base transition-all duration-300 hover:scale-[1.04] active:scale-95 hero-grad-bg"
                  style={{ boxShadow: "0 12px 32px -8px var(--hero-primary-glow), inset 0 1px 0 rgba(255,255,255,0.25)" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span
                    className="relative flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.22)" }}
                  >
                    <FaPlay className="text-[11px] sm:text-[12px] translate-x-[1px]" />
                  </span>
                  <span className="relative">Watch Demo</span>
                  <FaArrowRight className="text-xs sm:text-sm relative group-hover:translate-x-1 transition-transform" />
                </button>

                <Link
                  to="/ai-image"
                  className="ai-pulse group relative inline-flex items-center justify-center gap-2 px-5 xs:px-4 sm:px-6 py-3 rounded-full overflow-hidden font-ticket-body font-bold text-[12px] xs:text-[13px] sm:text-base text-[var(--hero-txt)] transition-all duration-300 hover:scale-[1.04] active:scale-95"
                  style={{
                    background: "var(--hero-panel)",
                    border: "2px solid var(--hero-primary-2)",
                  }}
                >
                  <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hero-grad-bg" />
                  <FaMagic className="text-xs sm:text-sm relative z-10 transition-transform group-hover:scale-110 text-[var(--hero-primary-2)] group-hover:text-white" />
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                    AI Image Studio
                  </span>
                  <span
                    className="relative z-10 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: "linear-gradient(135deg, var(--hero-primary), var(--hero-primary-2))",
                      color: "#fff",
                    }}
                  >
                    Free
                  </span>
                </Link>
              </motion.div>

              <motion.div
                variants={rise}
                className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto lg:mx-0 pt-1"
              >
                {trustPoints.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div
                      key={point.title}
                      className="flex flex-col items-center lg:items-start gap-1.5 p-2.5 sm:p-3 rounded-xl hero-glass"
                    >
                      <Icon className="text-[var(--hero-primary-2)] text-xs sm:text-sm" />
                      <p className="font-ticket-body text-[9px] sm:text-[10px] font-bold text-[var(--hero-txt)] text-center lg:text-left leading-tight">
                        {point.title}
                      </p>
                      <p className="font-ticket-body text-[8px] sm:text-[9px] text-[var(--hero-txt-soft)] text-center lg:text-left leading-tight">
                        {point.body}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            <motion.div
              variants={rise}
              className="relative mt-4 lg:mt-0 flex justify-center lg:justify-end"
            >
              <ModernItemCard
                flipped={flipped}
                setFlipped={setFlipped}
                currentItem={marketplaceItems[currentCard]}
                currentIndex={currentCard}
                total={marketplaceItems.length}
                onNext={nextCard}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
};

export default Hero;