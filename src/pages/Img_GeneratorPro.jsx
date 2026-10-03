// src/pages/Img_GeneratorPro.jsx — Premium modern text-to-image generator + Supabase + modern header
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown, FaTimes, FaPlus,
  FaMagic, FaSpinner, FaDownload,
  FaHeart, FaRegHeart, FaImage, FaThLarge,
  FaBolt, FaGift, FaCoins, FaCheck,
  FaLightbulb, FaFire, FaCrown, FaRocket,
  FaArrowRight,
  FaVideo, FaMusic,
  FaCog, FaSignOutAlt, FaUser,
  FaSlidersH, FaExpand, FaRandom, FaEraser,
  FaStar, FaBolt as FaBoltAlt, FaInfinity,
  FaLock, FaUnlock, FaRegClock, FaShapes,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { generateWithPollinations } from "../lib/pollinations";
import { supabase } from "../lib/supabase";
import AIRailSidebar from "./AIRailSidebar";
import {
  saveGeneratedImage,
  uploadGeneratedToStorage,
  loadRecentGeneratedImages,
  loadUserCredits,
  deductUserCredits,
  addUserCredits,
} from "../lib/imageStorage";
import { useNavigate } from "react-router-dom";
import PremiumCreditsModal from "../components/PremiumCreditsModal";

/* ═══════════════════════════════════════════════════════════════
   MODELS
   ═══════════════════════════════════════════════════════════════ */
const MODELS = [
  { id: "nano-banana-2", name: "Nano Banana 2", desc: "Detailed multi-capabilities", credits: 10, badge: "New" },
  { id: "flux-schnell",  name: "Flux Schnell",  desc: "Ultra-fast generation",       credits: 10 },
  { id: "flux-pro",      name: "Flux Pro",      desc: "Highest quality output",      credits: 10, badge: "Pro" },
  { id: "sd-turbo",      name: "SD Turbo",      desc: "Balanced speed & quality",    credits: 10 },
];

const STYLES = [
  { id: "none",       label: "None" },
  { id: "photoreal",  label: "Photoreal" },
  { id: "cinematic",  label: "Cinematic" },
  { id: "anime",      label: "Anime" },
  { id: "3d",         label: "3D Render" },
  { id: "digital-art",label: "Digital Art" },
  { id: "oil-paint",  label: "Oil Painting" },
  { id: "watercolor", label: "Watercolor" },
];

const QUALITY_OPTIONS = [
  { id: "1k", label: "1K", w: 1024, h: 1024, desc: "Standard" },
  { id: "2k", label: "2K", w: 1536, h: 1536, desc: "High" },
  { id: "4k", label: "4K", w: 2048, h: 2048, desc: "Ultra" },
];

const ASPECTS = [
  { id: "1:1",  label: "1:1",  ratio: 1,     icon: "▢" },
  { id: "4:3",  label: "4:3",  ratio: 4 / 3, icon: "▭" },
  { id: "3:4",  label: "3:4",  ratio: 3 / 4, icon: "▯" },
  { id: "16:9", label: "16:9", ratio: 16 / 9, icon: "▬" },
  { id: "9:16", label: "9:16", ratio: 9 / 16, icon: "▮" },
];

const PROMPT_IDEAS = [
  "A mystical forest with glowing mushrooms at night, fireflies, ethereal atmosphere",
  "Cyberpunk street market in Tokyo at midnight, neon signs, rain, reflections",
  "Majestic dragon perched on a mountain peak during sunset, epic scale",
  "Astronaut floating above Earth, stars and galaxy visible, cinematic",
  "Luxury perfume bottle on black marble, dramatic studio lighting, water droplets",
  "Vintage muscle car on empty desert highway at sunset, cinematic",
];

const FEATURED_SOURCE = [
  {
    type: "video",
    url: "https://cdn.dribbble.com/userupload/47711944/file/67c36c84c8638e21a38ebf88d3c8c1c0.mp4",
    poster: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s2/c70cbd35a4dd3df53e93d026fdc9181c.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80",
    prompt: "Leo Agent",
    tag: "AI Agent"
  },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s3/52189ad8aa1863e505e6ed7c6749d17f.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "GPT Sunburst", tag: "Abstract" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s2/2ddd6ca605de2d218e0f7ff3963ee7fd.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Seedance Portrait", tag: "Portrait" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s7/ab75b49686278eee43c5420c9d9d5c8f.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "MiniMax H3 Scene", tag: "Cinematic" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s1/d31aec88c3dbaf8504a5aa77a59509d3.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Old Photo Restoration", tag: "Restoration" },
  { url: "https://cdn.leonardo.ai/users/b7a4954c-355c-4734-bc9f-03387b3b0052/generations/1f1ac7e4-f999-6cc0-837e-14da65d44a08/lucid-origin_A_high-fashion_editorial_photo_of_a_full-body_shot_of_a_black_and_white_photo_of-3.jpg", prompt: "Consistent Character", tag: "Portrait" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s9/4df4b226e2dd3b8c18faafc83224ccc0.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Cinematic Portrait", tag: "Cinematic" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s6/7f295b6071418018148043d2ce810f25.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Abstract Floral", tag: "Abstract" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s1/0e3e4c3f797e72ae51fd6646fb9a1fc2.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Blooming Sculpture", tag: "3D" },
  { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s4/4486979e4f01293331112d7261d1badf.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Nautilus Macro", tag: "Macro" },
  { url: "https://images.media.io/media-ai/zone/card/ai_ads_card_2.png", prompt: "Vintage Family", tag: "Vintage" },
  { url: "https://images.media.io/media-ai/zone/ai_story_card.png", prompt: "Fashion Editorial", tag: "Fashion" },
];

/* ═══════════════════════════════════════════════════════════════
   MEDIA QUERY
   ═══════════════════════════════════════════════════════════════ */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    m.addEventListener ? m.addEventListener("change", onChange) : m.addListener(onChange);
    return () => {
      m.removeEventListener ? m.removeEventListener("change", onChange) : m.removeListener(onChange);
    };
  }, [query]);
  return matches;
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND — gradient mesh + floating orbs
   ═══════════════════════════════════════════════════════════════ */
const AnimatedBackdrop = ({ isLight }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
    {/* Base gradient mesh */}
    <motion.div
      animate={{
        background: isLight
          ? [
              "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(235,125,52,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 60% 90%, rgba(139,92,246,0.05), transparent 60%)",
              "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(245,158,11,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 70% 40%, rgba(235,125,52,0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 40% 85%, rgba(236,72,153,0.05), transparent 60%)",
              "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(235,125,52,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse 50% 60% at 60% 90%, rgba(139,92,246,0.05), transparent 60%)",
            ]
          : [
              "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(235,125,52,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(245,158,11,0.12), transparent 60%), radial-gradient(ellipse 50% 60% at 60% 90%, rgba(139,92,246,0.10), transparent 60%)",
              "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 70% 40%, rgba(235,125,52,0.14), transparent 60%), radial-gradient(ellipse 50% 60% at 40% 85%, rgba(236,72,153,0.10), transparent 60%)",
              "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(235,125,52,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(245,158,11,0.12), transparent 60%), radial-gradient(ellipse 50% 60% at 60% 90%, rgba(139,92,246,0.10), transparent 60%)",
            ]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute", inset: 0 }}
    />

    {/* Floating orbs */}
    {[
      { size: 400, top: "-10%", left: "-5%", color: "#eb7d34", delay: 0 },
      { size: 300, top: "40%", right: "-8%", color: "#f59e0b", delay: 2 },
      { size: 250, bottom: "-10%", left: "30%", color: "#8b5cf6", delay: 4 },
    ].map((orb, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -40, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15 + i * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: orb.delay,
        }}
        style={{
          position: "absolute",
          width: orb.size,
          height: orb.size,
          top: orb.top,
          left: orb.left,
          right: orb.right,
          bottom: orb.bottom,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${orb.color}${isLight ? "20" : "30"}, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
    ))}

    {/* Dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(${isLight ? "rgba(20,20,40,0.06)" : "rgba(255,255,255,0.04)"} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 70%)",
      }}
    />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD WRAPPER
   ═══════════════════════════════════════════════════════════════ */
const GlassCard = ({ isLight, children, style, ...rest }) => (
  <div
    {...rest}
    style={{
      background: isLight
        ? "linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))"
        : "linear-gradient(145deg, rgba(28,28,40,0.75), rgba(20,20,32,0.55))",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      border: isLight
        ? "1px solid rgba(255,255,255,0.9)"
        : "1px solid rgba(255,255,255,0.08)",
      boxShadow: isLight
        ? "0 8px 32px -8px rgba(20,20,40,0.10), inset 0 1px 0 rgba(255,255,255,0.9)"
        : "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      borderRadius: 24,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   GENERATING CARD
   ═══════════════════════════════════════════════════════════════ */
const GeneratingCard = ({ T, isLight, credits, prompt, index = 0 }) => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf;
    const start = Date.now();
    const duration = 8000 + index * 400;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(98, (elapsed / duration) * 100);
      setPct(p);
      if (p < 98) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: isLight
          ? "linear-gradient(145deg, #FFFFFF, #F8F7FC)"
          : "linear-gradient(145deg, #1C1C28, #16161F)",
        border: `1px solid ${T.line}`,
        aspectRatio: "1 / 1",
        boxShadow: isLight
          ? "0 12px 40px -16px rgba(20,20,40,0.15)"
          : "0 12px 40px -16px rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 20,
      }}
    >
      {/* Shimmer overlay */}
      <motion.div
        animate={{ backgroundPosition: ["200% 50%", "-200% 50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: 0,
          background: isLight
            ? "linear-gradient(115deg, transparent 30%, rgba(235,125,52,0.08) 50%, transparent 70%)"
            : "linear-gradient(115deg, transparent 30%, rgba(235,125,52,0.15) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          pointerEvents: "none",
        }}
      />

      {/* Spinner */}
      <div style={{ position: "relative", width: 72, height: 72, zIndex: 1 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: `3px solid transparent`,
            borderTopColor: T.primary,
            borderRightColor: T.primary2,
            filter: `drop-shadow(0 0 8px ${T.primaryGlow})`,
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", inset: 8,
            borderRadius: "50%",
            border: `3px solid transparent`,
            borderBottomColor: T.primary2,
            borderLeftColor: T.primary,
            opacity: 0.6,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 16,
            borderRadius: "50%",
            background: T.gradientBtn,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            boxShadow: `0 8px 24px -8px ${T.primaryGlow}`,
          }}
        >
          <FaWandMagicSparkles style={{ fontSize: 18 }} />
        </motion.div>
      </div>

      {/* Text */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{
            fontSize: 13, fontWeight: 800, color: T.txt,
            letterSpacing: "-0.01em", marginBottom: 6,
          }}
        >
          Crafting magic…
        </motion.div>
        <div style={{
          fontSize: 12, fontWeight: 800, color: T.primary,
          fontVariantNumeric: "tabular-nums",
        }}>
          {Math.round(pct)}%
        </div>
      </div>

      {/* Progress */}
      <div style={{
        width: "75%", height: 4, borderRadius: 999,
        background: isLight ? "rgba(20,20,40,0.06)" : "rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative", zIndex: 1,
      }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
          style={{
            height: "100%",
            background: T.gradientBtn,
            borderRadius: 999,
            boxShadow: `0 0 12px ${T.primaryGlow}`,
          }}
        />
      </div>

      {/* Credits badge */}
      <div
        style={{
          position: "absolute", top: 12, right: 12,
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 10px", borderRadius: 999,
          background: isLight
            ? "rgba(255,255,255,0.9)"
            : "rgba(0,0,0,0.55)",
          border: `1px solid ${T.primary}55`,
          color: T.primary,
          fontSize: 10, fontWeight: 800,
          letterSpacing: "0.02em",
          backdropFilter: "blur(8px)",
          zIndex: 2,
        }}
      >
        <FaCoins style={{ fontSize: 9 }} />
        -{credits}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CREDITS PROMO CARD
   ═══════════════════════════════════════════════════════════════ */
const CreditsPromoCard = ({ onTopUp, T, isLight, credits, isMobile }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.94 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        right: isMobile ? 12 : 24,
        bottom: isMobile ? 12 : 24,
        left: isMobile ? 12 : "auto",
        width: isMobile ? "auto" : 360,
        maxWidth: isMobile ? "calc(100vw - 24px)" : "calc(100vw - 32px)",
        zIndex: 80,
        borderRadius: 24,
        overflow: "hidden",
        background: isLight
          ? "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))"
          : "linear-gradient(145deg, rgba(28,28,40,0.95), rgba(20,20,32,0.9))",
        border: isLight
          ? "1px solid rgba(255,255,255,0.9)"
          : "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px) saturate(180%)",
        boxShadow: isLight
          ? "0 24px 60px -20px rgba(20,20,40,0.25), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        position: "relative",
        padding: isMobile ? "18px 20px 20px" : "22px 24px 24px",
        background: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 55%, #fbbf24 100%)",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: -60, right: -40,
          width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }} />

        <button
          onClick={() => setDismissed(true)}
          type="button"
          aria-label="Close"
          style={{
            position: "absolute", top: 12, right: 12,
            width: 26, height: 26, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "none", color: "#fff",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2, fontSize: 11,
          }}
        >
          <FaTimes />
        </button>

        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 999,
              background: "rgba(255,255,255,0.22)",
              marginBottom: 10,
            }}>
              <FaCrown style={{ fontSize: 9, color: "#fff" }} />
              <span style={{
                fontSize: 10, fontWeight: 800, color: "#fff",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                Credits
              </span>
            </div>
            <h3 style={{
              fontSize: isMobile ? 18 : 20, fontWeight: 900, color: "#fff",
              margin: "0 0 8px",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>
              Out of Credits
            </h3>
            <p style={{
              fontSize: isMobile ? 12 : 13, color: "rgba(255,255,255,0.92)",
              margin: 0, lineHeight: 1.5, maxWidth: isMobile ? "100%" : 220,
            }}>
              You have <strong>{credits}</strong> credits left. Top up to keep creating stunning AI images.
            </p>
          </div>

          <div style={{
            flexShrink: 0,
            fontSize: isMobile ? 44 : 52, lineHeight: 1,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.3))",
            transform: "translateY(-4px)",
          }}>
            🪙
          </div>
        </div>
      </div>

      <div style={{
        padding: isMobile ? "16px 18px 18px" : "18px 22px 20px",
      }}>
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 12, marginBottom: 18,
        }}>
          {[
            { icon: FaCoins, label: "10 credits per image" },
            { icon: FaInfinity,  label: "Unlimited generations" },
            { icon: FaRocket, label: "Priority queue access" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                border: `1.5px solid ${isLight ? "rgba(235,125,52,0.25)" : "rgba(255,255,255,0.15)"}`,
                background: isLight ? "rgba(235,125,52,0.08)" : "rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isLight ? "#eb7d34" : "#fff",
                flexShrink: 0,
              }}>
                <Icon style={{ fontSize: 13 }} />
              </div>
              <span style={{
                fontSize: isMobile ? 12.5 : 13.5, color: T.txt,
                fontWeight: 500, lineHeight: 1.3,
              }}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onTopUp}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          style={{
            width: "100%",
            padding: isMobile ? "13px 18px" : "15px 20px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%)",
            border: "none", color: "#fff",
            fontSize: isMobile ? 14 : 15, fontWeight: 800,
            fontFamily: "inherit", letterSpacing: "-0.01em",
            cursor: "pointer",
            boxShadow: "0 12px 32px -10px rgba(235,125,52,0.7)",
            display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            gap: 8,
          }}
        >
          <FaCoins style={{ fontSize: 13 }} />
          Top Up Credits
          <FaArrowRight style={{ fontSize: 11 }} />
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   RECENT GENERATIONS
   ═══════════════════════════════════════════════════════════════ */
const RecentGenerationsSection = ({ T, isMobile, items, userProfile, onOpen }) => {
  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginTop: isMobile ? 20 : 28 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, marginBottom: 18, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <motion.span
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 4, height: isMobile ? 26 : 34,
              borderRadius: 999,
              background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primary2} 100%)`,
              boxShadow: `0 0 14px -1px ${T.primaryGlow}`,
              transformOrigin: "center",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{
                fontSize: isMobile ? 17 : 22,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: T.txt,
                margin: 0,
                lineHeight: 1.1,
              }}>
                Recent creations
              </h2>
              <span style={{
                fontSize: 10, fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "4px 10px", borderRadius: 999,
                background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                color: "#fff",
                textTransform: "uppercase",
                lineHeight: 1, flexShrink: 0,
                boxShadow: `0 4px 12px -4px ${T.primaryGlow}`,
              }}>
                {items.length} live
              </span>
            </div>
            <p style={{
              fontSize: isMobile ? 11.5 : 12.5,
              fontWeight: 500, color: T.txtFaint,
              margin: "6px 0 0", lineHeight: 1.3,
            }}>
              Fresh work from creators around the world
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .recent-viewport {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 6px 0 12px;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
        }
        .recent-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: recent-scroll 65s linear infinite;
          will-change: transform;
        }
        .recent-viewport:hover .recent-track {
          animation-play-state: paused;
        }
        .recent-track.is-short {
          animation-duration: 40s;
        }
        @keyframes recent-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .recent-card {
          position: relative;
          flex-shrink: 0;
          width: 210px;
          height: 280px;
          border-radius: 20px;
          overflow: hidden;
          background: #1a1a1f;
          cursor: pointer;
          padding: 0;
          border: 1px solid rgba(255,255,255,0.06);
          font-family: inherit;
          text-align: left;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.35s ease;
        }
        .recent-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 30px 60px -18px rgba(235, 125, 52, 0.55), 0 0 0 1px rgba(235, 125, 52, 0.5);
          border-color: rgba(235, 125, 52, 0.6);
          z-index: 2;
        }
        .recent-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .recent-card:hover img {
          transform: scale(1.08);
        }

        .recent-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.55) 70%, rgba(0, 0, 0, 0.92) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 14px;
        }

        .recent-title {
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.015em;
          display: block;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
        }
        .recent-sub {
          color: rgba(255, 255, 255, 0.68);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-top: 5px;
          display: block;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        }

        .recent-avatar {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #eb7d34, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          border: 2px solid rgba(255, 255, 255, 0.85);
          pointer-events: none;
          z-index: 4;
        }

        @media (max-width: 640px) {
          .recent-card {
            width: 160px;
            height: 220px;
          }
          .recent-title {
            font-size: 12px;
          }
          .recent-avatar {
            width: 22px;
            height: 22px;
            font-size: 9px;
            bottom: 10px;
            right: 10px;
          }
        }
      `}</style>

      <div className="recent-viewport">
        <div className={`recent-track ${items.length <= 3 ? "is-short" : ""}`}>
          {[...items, ...items].map((item, idx) => {
            const displayName =
              item.user_name ||
              (item.user_email ? item.user_email.split("@")[0] : "Anonymous");
            const isMine = item.user_id === userProfile?.id;
            const initial = displayName.charAt(0).toUpperCase();

            const isNew = (() => {
              const ts = item.created_at ? new Date(item.created_at).getTime() : 0;
              if (!ts) return false;
              return Date.now() - ts < 3 * 60 * 1000;
            })();

            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => onOpen(item)}
                type="button"
                className="recent-card"
              >
                <img
                  src={item.url}
                  alt={item.prompt || ""}
                  loading="lazy"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/fallback-${item.id}/400/560`;
                  }}
                />

                {isNew && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute", top: 12, left: 12,
                      padding: "4px 10px", borderRadius: 999,
                      background: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%)",
                      color: "#fff",
                      fontSize: 9, fontWeight: 900,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      lineHeight: 1, zIndex: 5,
                      pointerEvents: "none",
                      boxShadow: "0 4px 12px rgba(235,125,52,0.5)",
                    }}
                  >
                    ✦ New
                  </motion.span>
                )}

                <div className="recent-avatar">{initial}</div>

                <div className="recent-overlay">
                  <span className="recent-title">
                    {isMine ? "You" : displayName}
                  </span>
                  <span className="recent-sub">Tap to view</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SEGMENTED CONTROL (reusable pill switcher)
   ═══════════════════════════════════════════════════════════════ */
const SegmentedControl = ({ options, value, onChange, T, isLight, compact }) => (
  <div style={{
    display: "flex",
    gap: 4,
    background: isLight ? "rgba(20,20,40,0.04)" : "rgba(255,255,255,0.03)",
    borderRadius: 999,
    padding: 4,
    border: `1px solid ${T.line}`,
  }}>
    {options.map((opt) => {
      const active = value === opt.id;
      const Icon = opt.icon;
      return (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          type="button"
          style={{
            position: "relative",
            flex: 1,
            padding: compact ? "8px 10px" : "10px 14px",
            borderRadius: 999,
            background: "transparent",
            border: "none",
            color: active ? "#fff" : T.txtSoft,
            fontSize: compact ? 12 : 13,
            fontWeight: active ? 800 : 600,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "color 0.18s ease",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {active && (
            <motion.div
              layoutId={`seg-${options.map(o => o.id).join("-")}`}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background: T.gradientBtn,
                boxShadow: `0 4px 14px -4px ${T.primaryGlow}`,
                zIndex: 0,
              }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            />
          )}
          {Icon && <Icon style={{ fontSize: compact ? 10 : 11, position: "relative", zIndex: 1 }} />}
          <span style={{ position: "relative", zIndex: 1 }}>{opt.label}</span>
        </button>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const Img_GeneratorPro = () => {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");

  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  });

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("theme-light") ? "light" : "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = () => {
    const isLightNow = document.documentElement.classList.contains("theme-light");
    document.documentElement.classList.toggle("theme-light", !isLightNow);
    setTheme(!isLightNow ? "light" : "dark");
  };
  const isLight = theme === "light";

  const T = isLight
    ? {
        bg: "#F5F4F9",
        bg2: "#EFEEF5",
        panel: "#FFFFFF",
        panel2: "#F8F7FC",
        panel3: "#F0EFF6",
        inputBg: "#F8F7FC",
        hoverBg: "rgba(20,20,30,0.045)",
        dropdownBg: "#FFFFFF",
        line: "rgba(20,20,40,0.07)",
        lineStrong: "rgba(20,20,40,0.14)",
        txt: "#0F0D1A",
        txtSoft: "rgba(15,13,26,0.62)",
        txtFaint: "rgba(15,13,26,0.42)",
        txtDim: "rgba(15,13,26,0.22)",
        primary: "#eb7d34",
        primary2: "#f59e0b",
        primary3: "#c8631f",
        primarySoft: "rgba(235,125,52,0.10)",
        primaryGlow: "rgba(235,125,52,0.40)",
        shadow: "0 8px 28px -14px rgba(15,13,26,0.10)",
        cardShadow: "0 2px 10px -4px rgba(15,13,26,0.06)",
        dropdownShadow: "0 16px 40px -12px rgba(15,13,26,0.16)",
        gradientBtn: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%)",
      }
    : {
        bg: "#0A0A12",
        bg2: "#0F0F1A",
        panel: "#16161F",
        panel2: "#1C1C28",
        panel3: "#232332",
        inputBg: "#1C1C28",
        hoverBg: "rgba(255,255,255,0.06)",
        dropdownBg: "#1C1C28",
        line: "rgba(255,255,255,0.07)",
        lineStrong: "rgba(255,255,255,0.14)",
        txt: "#FFFFFF",
        txtSoft: "rgba(255,255,255,0.66)",
        txtFaint: "rgba(255,255,255,0.44)",
        txtDim: "rgba(255,255,255,0.22)",
        primary: "#eb7d34",
        primary2: "#f59e0b",
        primary3: "#c8631f",
        primarySoft: "rgba(235,125,52,0.14)",
        primaryGlow: "rgba(235,125,52,0.45)",
        shadow: "0 8px 28px -12px rgba(0,0,0,0.6)",
        cardShadow: "0 2px 10px -2px rgba(0,0,0,0.4)",
        dropdownShadow: "0 16px 40px -8px rgba(0,0,0,0.75)",
        gradientBtn: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%)",
      };

  const fileInputRef = useRef(null);

  /* ═══ USER PROFILE ═══ */
  const [userProfile, setUserProfile] = useState({
    id: null,
    name: "User",
    email: "",
    avatar: null,
    plan: "Free Plan",
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) {
            setUserProfile({ id: null, name: "Guest", email: "", avatar: null, plan: "Free Plan" });
          }
          return;
        }

        const meta = user.user_metadata || {};
        const fallbackName =
          meta.full_name ||
          meta.name ||
          meta.display_name ||
          (user.email || "").split("@")[0] ||
          "User";

        let savedName = null;
        let savedAvatar = null;
        try {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("full_name, avatar")
            .eq("user_id", user.id)
            .maybeSingle();
          if (settings) {
            savedName = settings.full_name || null;
            savedAvatar = settings.avatar || null;
          }
        } catch {}

        let isPremium = false;
        try {
          const { data: usrRow } = await supabase
            .from("users")
            .select("is_premium")
            .eq("id", user.id)
            .maybeSingle();
          isPremium = usrRow?.is_premium === true;
        } catch {}

        if (!cancelled) {
          setUserProfile({
            id: user.id,
            name: savedName || fallbackName,
            email: user.email || "",
            avatar: savedAvatar,
            plan: isPremium ? "Premium Plan" : "Free Plan",
          });
        }
      } catch (err) {
        console.warn("Failed to load profile:", err);
      }
    };

    loadProfile();

    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    const onUpdate = () => loadProfile();
    window.addEventListener("user-profile-updated", onUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("user-profile-updated", onUpdate);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-user-menu]")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  /* ═══ RECENT GENERATIONS ═══ */
  const [recentImages, setRecentImages] = useState([]);
  const [recentTick, setRecentTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const recent = await loadRecentGeneratedImages(30);
      if (!cancelled) setRecentImages(recent);
    })();
    return () => { cancelled = true; };
  }, [recentTick]);

  useEffect(() => {
    const onUpdated = () => setRecentTick((t) => t + 1);
    window.addEventListener("library-updated", onUpdated);
    return () => window.removeEventListener("library-updated", onUpdated);
  }, []);

  /* ═══ CREDITS ═══ */
  const [credits, setCredits] = useState(10);
  const [creditsLoaded, setCreditsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const balance = await loadUserCredits();
      if (!cancelled) {
        setCredits(balance);
        setCreditsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Model */
  const [modelId, setModelId] = useState("nano-banana-2");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];

  /* Prompt */
  const [prompt, setPrompt] = useState("");
  const MAX_CHARS = 2000;

  /* References */
  const [references, setReferences] = useState([]);

  /* Style */
  const [styleId, setStyleId] = useState("none");

  /* Premium modal */
  const [showPremium, setShowPremium] = useState(false);

  /* Quality / Aspect */
  const [qualityId, setQualityId] = useState("1k");
  const [aspectId, setAspectId] = useState("1:1");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);

  /* Amount */
  const [amount, setAmount] = useState(1);

  /* Advanced toggle */
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* Generation state */
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCards, setGeneratingCards] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const isLowCredits = credits < selectedModel.credits;

  const selectedQuality = QUALITY_OPTIONS.find((q) => q.id === qualityId) || QUALITY_OPTIONS[0];
  const selectedAspect  = ASPECTS.find((a) => a.id === aspectId) || ASPECTS[0];
  const selectedStyle   = STYLES.find((s) => s.id === styleId) || STYLES[0];

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newRefs = files.slice(0, 4 - references.length).map((f) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setReferences((prev) => [...prev, ...newRefs].slice(0, 4));
    e.target.value = "";
  };

  const removeReference = (id) => {
    setReferences((prev) => {
      const ref = prev.find((r) => r.id === id);
      if (ref) URL.revokeObjectURL(ref.url);
      return prev.filter((r) => r.id !== id);
    });
  };

  /* ═══════════════════════════════════════════════════════════
     HANDLE GENERATE
     ═══════════════════════════════════════════════════════════ */
  const handleGenerate = async () => {
    if (!prompt.trim() && references.length === 0) {
      setError("Please enter a prompt to continue");
      return;
    }

    const cost = selectedModel.credits * amount;
    if (credits < cost) {
      setError(`Not enough credits. You need ${cost} but have ${credits}.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const newBalance = await deductUserCredits(cost);
    if (newBalance === null) {
      setError("Failed to deduct credits. Please try again.");
      setIsGenerating(false);
      return;
    }
    setCredits(newBalance);

    const placeholders = Array.from({ length: amount }, (_, i) => ({
      id: `gen_${Date.now()}_${i}`,
      prompt: prompt || "Image from reference",
      credits: selectedModel.credits,
    }));
    setGeneratingCards(placeholders);

    try {
      const styleSuffix = selectedStyle.id === "none"
        ? ""
        : `, ${selectedStyle.id} style, highly detailed, cinematic lighting, 8k`;

      const baseW = selectedQuality.w;
      const baseH = selectedQuality.h;
      const ratio = selectedAspect.ratio;
      const w = ratio >= 1 ? baseW : Math.round(baseH * ratio);
      const h = ratio >= 1 ? Math.round(baseW / ratio) : baseH;

      const baseSeed = Math.floor(Math.random() * 1_000_000);

      const generations = await Promise.all(
        Array.from({ length: amount }, async (_, i) => {
          const seed = baseSeed + i;

          const base64Url = await generateWithPollinations({
            prompt: `${prompt}${styleSuffix}`,
            model: "@cf/black-forest-labs/flux-1-schnell",
            width: w,
            height: h,
            seed,
          });

          let publicUrl = null;
          try {
            publicUrl = await uploadGeneratedToStorage(base64Url, "generated");
          } catch (upErr) {
            console.warn("Storage upload failed, using base64 fallback:", upErr);
          }
          if (!publicUrl) publicUrl = base64Url;

          let saved = null;
          try {
            saved = await saveGeneratedImage({
              url: publicUrl,
              prompt,
              model: "flux-1-schnell",
              style: selectedStyle.label,
              width: w,
              height: h,
              seed,
            });
          } catch (saveErr) {
            console.error("DB save failed:", saveErr);
          }

          return {
            id: saved?.id || `gen_${Date.now()}_${i}`,
            url: publicUrl,
            prompt,
            style: selectedStyle.label,
            quality: selectedQuality.label,
            aspect: selectedAspect.id,
            dimension: `${w}×${h}`,
            ts: Date.now() + i,
            credits: selectedModel.credits,
            user_email: saved?.user_email || userProfile?.email || "",
            user_name: saved?.user_name || userProfile?.name || "You",
            user_id: saved?.user_id || userProfile?.id,
            isMine: true,
          };
        })
      );

      setResults((prev) => [...generations, ...prev]);

      const fresh = await loadRecentGeneratedImages(30);
      setRecentImages(fresh);
      setRecentTick((t) => t + 1);
      window.dispatchEvent(new Event("library-updated"));
    } catch (err) {
      console.error(err);
      setError(err?.message || "Generation failed. Please try again.");
      const refunded = await addUserCredits(cost);
      if (refunded !== null) setCredits(refunded);
    } finally {
      setIsGenerating(false);
      setGeneratingCards([]);
    }
  };

  const handleDownload = async (url) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      window.open(url, "_blank");
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearForm = () => {
    setPrompt("");
    setReferences((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
    setStyleId("none");
    setQualityId("1k");
    setAspectId("1:1");
    setAmount(1);
    setError(null);
  };

  const handleSignOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setUserMenuOpen(false);
    navigate("/");
  };

  const totalCredits = selectedModel.credits * amount;
  const hasContent = results.length > 0 || generatingCards.length > 0;

  const canGenerate =
    (prompt.trim().length > 0 || references.length > 0) &&
    credits >= totalCredits &&
    !isGenerating;

  /* ─── Prompt stats ─── */
  const promptStats = useMemo(() => {
    const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
    return { chars: prompt.length, words };
  }, [prompt]);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.txt,
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "background 0.3s ease, color 0.3s ease",
      overflowX: "hidden",
      width: "100%",
      position: "relative",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <AnimatedBackdrop isLight={isLight} />

      {/* ═══ TOP NAVBAR ═══ */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90 }}>
        <AIRailSidebar theme={theme} onToggleTheme={toggleTheme} />
      </div>

      {/* ═══ HERO ═══ */}
      <div style={{
        position: "relative",
        zIndex: 1,
        padding: isMobile ? "88px 16px 24px" : "100px 32px 32px",
        maxWidth: 1800,
        margin: "0 auto",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 900 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 999,
            background: isLight
              ? "linear-gradient(135deg, rgba(235,125,52,0.10), rgba(245,158,11,0.10))"
              : "linear-gradient(135deg, rgba(235,125,52,0.15), rgba(245,158,11,0.15))",
            border: `1px solid ${T.primary}33`,
            marginBottom: 20,
            backdropFilter: "blur(8px)",
          }}>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: T.primary,
                boxShadow: `0 0 12px ${T.primary}`,
              }}
            />
            <FaFire style={{ fontSize: 10, color: T.primary }} />
            <span style={{
              fontSize: 11, fontWeight: 800, color: T.primary,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              AI Studio · Live
            </span>
          </div>

  <h1 style={{
  fontSize: isSmallMobile ? 32 : isMobile ? 40 : 64,
  fontWeight: 900,
  letterSpacing: "-0.045em",
  margin: "0 0 18px",
  lineHeight: 1.02,
  color: T.txt,                       /* ← solid, clean color */
}}>
  Imagine it.{" "}
  <span style={{ color: T.primary }}>
    See it.
  </span>
</h1>

          <p style={{
            fontSize: isSmallMobile ? 13 : isMobile ? 14 : 16,
            lineHeight: 1.6,
            color: T.txtSoft,
            margin: 0,
            maxWidth: 620,
          }}>
            Turn your wildest ideas into stunning visuals. Just describe what you want — our AI handles the rest in seconds.
          </p>
        </motion.div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div style={{
        position: "relative",
        zIndex: 1,
        padding: isMobile ? "0 1px 10px" : "0 20px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "420px 1fr",
        gap: isMobile ? 20 : 32,
        alignItems: "start",
        maxWidth: 1800,
        margin: "0 auto",
      }}>

        {/* ═══════════ SIDEBAR (Controls) ═══════════ */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: isMobile ? "relative" : "sticky",
            top: 88,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 0,
          }}
        >
          <GlassCard
            isLight={isLight}
            style={{
              padding: isMobile ? 18 : 22,
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 18 : 20,
            }}
          >
            {/* ─── TABS ─── */}
            <SegmentedControl
              options={[
                { id: "image", label: "Image", icon: FaImage },
                { id: "video", label: "Video", icon: FaVideo },
                { id: "audio", label: "Audio", icon: FaMusic },
              ]}
              value="image"
              onChange={() => {}}
              T={T}
              isLight={isLight}
            />

            {/* ─── MODEL ─── */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: T.txtFaint,
                }}>
                  Engine
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 700, color: T.primary,
                }}>
                  <FaBoltAlt style={{ fontSize: 8 }} />
                  Fast mode
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowModelMenu((v) => !v)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 12,
                    padding: isMobile ? "11px 12px" : "13px 14px",
                    background: isLight
                      ? "linear-gradient(145deg, #FFFFFF, #F8F7FC)"
                      : "linear-gradient(145deg, #1C1C28, #16161F)",
                    border: `1px solid ${showModelMenu ? T.primary : T.line}`,
                    borderRadius: 16,
                    color: T.txt,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "border-color 0.2s ease",
                    boxShadow: showModelMenu
                      ? `0 0 0 3px ${T.primarySoft}`
                      : "none",
                  }}
                >
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 11,
                    background: T.gradientBtn,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 6px 16px -6px ${T.primaryGlow}`,
                  }}>
                    <FaWandMagicSparkles style={{ fontSize: 15, color: "#fff" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 800, color: T.txt,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      letterSpacing: "-0.01em",
                    }}>
                      {selectedModel.name}
                    </div>
                    <div style={{
                      fontSize: 11, color: T.txtFaint, marginTop: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {selectedModel.desc}
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 9px", borderRadius: 999,
                    background: T.primarySoft,
                    border: `1px solid ${T.primary}33`,
                    fontSize: 11, fontWeight: 800, color: T.primary,
                    flexShrink: 0,
                  }}>
                    <FaCoins style={{ fontSize: 9 }} />
                    {selectedModel.credits}
                  </div>
                  <motion.div
                    animate={{ rotate: showModelMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", flexShrink: 0 }}
                  >
                    <FaChevronDown style={{ fontSize: 10, color: T.txtFaint }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showModelMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0, right: 0,
                        background: T.dropdownBg,
                        border: `1px solid ${T.line}`,
                        borderRadius: 16,
                        padding: 6,
                        zIndex: 20,
                        boxShadow: T.dropdownShadow,
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      {MODELS.map((m) => {
                        const active = m.id === modelId;
                        return (
                          <button
                            key={m.id}
                            onClick={() => { setModelId(m.id); setShowModelMenu(false); }}
                            type="button"
                            style={{
                              width: "100%",
                              padding: "11px 12px",
                              borderRadius: 11,
                              background: active ? T.primarySoft : "transparent",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                display: "flex", alignItems: "center", gap: 6,
                                fontSize: 13, fontWeight: 800, color: active ? T.primary : T.txt,
                              }}>
                                {m.name}
                                {m.badge && (
                                  <span style={{
                                    fontSize: 8, fontWeight: 800,
                                    padding: "2px 7px", borderRadius: 999,
                                    background: T.primary, color: "#fff",
                                    letterSpacing: "0.06em", textTransform: "uppercase",
                                  }}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: T.txtFaint, marginTop: 2 }}>
                                {m.desc}
                              </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 800, color: T.txtFaint }}>
                              {m.credits}c
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ─── PROMPT ─── */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: T.txtFaint,
                }}>
                  Prompt
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 10, fontWeight: 700,
                  color: T.primary,
                  padding: "3px 9px", borderRadius: 999,
                  background: T.primarySoft,
                  border: `1px solid ${T.primary}22`,
                }}>
                  <FaLightbulb style={{ fontSize: 8 }} />
                  AI Enhanced
                </div>
              </div>

              <motion.div
                animate={{
                  borderColor: prompt.trim() ? `${T.primary}66` : T.line,
                  boxShadow: prompt.trim() ? `0 0 0 4px ${T.primarySoft}` : "none",
                }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "relative",
                  background: isLight
                    ? "linear-gradient(145deg, #FFFFFF, #F8F7FC)"
                    : "linear-gradient(145deg, #1C1C28, #16161F)",
                  border: "1px solid",
                  borderRadius: 18,
                  padding: isMobile ? 14 : 16,
                }}
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Describe your vision in detail — subject, mood, lighting, style, colors, composition..."
                  rows={isMobile ? 4 : 5}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none", outline: "none", resize: "none",
                    color: T.txt,
                    fontSize: isMobile ? 13 : 13.5,
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                    minHeight: isMobile ? 80 : 100,
                    boxSizing: "border-box",
                  }}
                />

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 8, marginTop: 10, paddingTop: 12,
                  borderTop: `1px solid ${T.line}`,
                  flexWrap: "wrap",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    fontSize: 11, color: T.txtFaint, fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    <span>{promptStats.words} words</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{promptStats.chars}/{MAX_CHARS}</span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => {
                        const idea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
                        setPrompt(idea);
                        setError(null);
                      }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "7px 12px",
                        background: T.primarySoft,
                        border: `1px solid ${T.primary}33`,
                        borderRadius: 9,
                        color: T.primary,
                        fontSize: 11, fontWeight: 800,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FaMagic style={{ fontSize: 9 }} />
                      Surprise me
                    </motion.button>

                    {prompt && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setPrompt("")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "7px 10px",
                          background: T.hoverBg,
                          border: `1px solid ${T.line}`,
                          borderRadius: 9,
                          color: T.txtSoft,
                          fontSize: 11, fontWeight: 700,
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <FaEraser style={{ fontSize: 9 }} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ─── REFERENCES ─── */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: T.txtFaint,
                }}>
                  References
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: references.length > 0 ? T.primary : T.txtDim,
                }}>
                  {references.length}/4
                </div>
              </div>
              <div
                onClick={() => references.length < 4 && fileInputRef.current?.click()}
                style={{
                  position: "relative",
                  width: "100%",
                  height: references.length === 0 ? (isMobile ? 100 : 120) : "auto",
                  background: isLight
                    ? "linear-gradient(145deg, #FAFAFD, #F5F4F9)"
                    : "linear-gradient(145deg, #1A1A24, #16161F)",
                  border: `1.5px dashed ${references.length > 0 ? T.line : T.lineStrong}`,
                  borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: references.length < 4 ? "pointer" : "not-allowed",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                }}
              >
                {references.length === 0 ? (
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 8,
                    color: T.txtFaint,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: T.primarySoft,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FaImage style={{ fontSize: 18, color: T.primary }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>Add reference image</span>
                    <span style={{ fontSize: 10, color: T.txtDim }}>Optional · drag or click</span>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(references.length, 2)}, 1fr)`,
                    gap: 8, padding: 8,
                    width: "100%",
                  }}>
                    {references.map((ref) => (
                      <div key={ref.id} style={{
                        position: "relative",
                        borderRadius: 12,
                        overflow: "hidden",
                        aspectRatio: "1 / 1",
                        background: T.bg2,
                      }}>
                        <img
                          src={ref.url}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeReference(ref.id); }}
                          type="button"
                          style={{
                            position: "absolute", top: 6, right: 6,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(8px)",
                            border: "none", color: "#fff", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <FaTimes style={{ fontSize: 8 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleReferenceUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* ─── ADVANCED TOGGLE ─── */}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px",
                background: showAdvanced ? T.primarySoft : T.hoverBg,
                border: `1px solid ${showAdvanced ? T.primary : T.line}`,
                borderRadius: 12,
                color: showAdvanced ? T.primary : T.txt,
                fontSize: 12, fontWeight: 800,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <FaSlidersH style={{ fontSize: 11 }} />
                Advanced Settings
              </span>
              <motion.span
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: "inline-flex" }}
              >
                <FaChevronDown style={{ fontSize: 10 }} />
              </motion.span>
            </button>

            {/* ─── ADVANCED PANEL ─── */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>

                    {/* QUALITY + ASPECT */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: isSmallMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                    }}>
                      <div style={{ position: "relative" }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: T.txtFaint,
                          marginBottom: 10,
                        }}>
                          Quality
                        </div>
                        <button
                          type="button"
                          onClick={() => { setShowQualityMenu((v) => !v); setShowAspectMenu(false); }}
                          style={{
                            width: "100%",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: isMobile ? "10px 12px" : "11px 14px",
                            background: isLight ? "#F8F7FC" : "#1C1C28",
                            border: `1px solid ${showQualityMenu ? T.primary : T.line}`,
                            borderRadius: 12,
                            color: T.txt,
                            fontSize: isMobile ? 12 : 13,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            cursor: "pointer",
                            transition: "border-color 0.2s ease",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <FaThLarge style={{ fontSize: 11, color: T.primary }} />
                            {selectedQuality.label}
                          </span>
                          <FaChevronDown style={{ fontSize: 9, color: T.txtFaint }} />
                        </button>
                        <AnimatePresence>
                          {showQualityMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                position: "absolute",
                                top: "calc(100% + 6px)",
                                left: 0, right: 0,
                                background: T.dropdownBg,
                                border: `1px solid ${T.line}`,
                                borderRadius: 14,
                                padding: 6,
                                zIndex: 20,
                                boxShadow: T.dropdownShadow,
                              }}
                            >
                              {QUALITY_OPTIONS.map((q) => {
                                const active = q.id === qualityId;
                                return (
                                  <button
                                    key={q.id}
                                    onClick={() => { setQualityId(q.id); setShowQualityMenu(false); }}
                                    type="button"
                                    style={{
                                      width: "100%",
                                      padding: "9px 12px",
                                      borderRadius: 9,
                                      background: active ? T.primarySoft : "transparent",
                                      border: "none",
                                      color: active ? T.primary : T.txt,
                                      fontSize: 13, fontWeight: 700,
                                      fontFamily: "inherit",
                                      textAlign: "left",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <span>{q.label}</span>
                                    <span style={{ fontSize: 10, color: T.txtFaint, fontWeight: 600 }}>{q.desc}</span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div style={{ position: "relative" }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: T.txtFaint,
                          marginBottom: 10,
                        }}>
                          Aspect
                        </div>
                        <button
                          type="button"
                          onClick={() => { setShowAspectMenu((v) => !v); setShowQualityMenu(false); }}
                          style={{
                            width: "100%",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: isMobile ? "10px 12px" : "11px 14px",
                            background: isLight ? "#F8F7FC" : "#1C1C28",
                            border: `1px solid ${showAspectMenu ? T.primary : T.line}`,
                            borderRadius: 12,
                            color: T.txt,
                            fontSize: isMobile ? 12 : 13,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            cursor: "pointer",
                            transition: "border-color 0.2s ease",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <FaShapes style={{ fontSize: 11, color: T.primary }} />
                            {selectedAspect.label}
                          </span>
                          <FaChevronDown style={{ fontSize: 9, color: T.txtFaint }} />
                        </button>
                        <AnimatePresence>
                          {showAspectMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                position: "absolute",
                                top: "calc(100% + 6px)",
                                left: 0, right: 0,
                                background: T.dropdownBg,
                                border: `1px solid ${T.line}`,
                                borderRadius: 14,
                                padding: 6,
                                zIndex: 20,
                                boxShadow: T.dropdownShadow,
                              }}
                            >
                              {ASPECTS.map((a) => {
                                const active = a.id === aspectId;
                                return (
                                  <button
                                    key={a.id}
                                    onClick={() => { setAspectId(a.id); setShowAspectMenu(false); }}
                                    type="button"
                                    style={{
                                      width: "100%",
                                      padding: "9px 12px",
                                      borderRadius: 9,
                                      background: active ? T.primarySoft : "transparent",
                                      border: "none",
                                      color: active ? T.primary : T.txt,
                                      fontSize: 13, fontWeight: 700,
                                      fontFamily: "inherit",
                                      textAlign: "left",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <span style={{
                                      display: "inline-block",
                                      width: 14,
                                      height: 14,
                                      border: `1.5px solid ${active ? T.primary : T.txtSoft}`,
                                      borderRadius: 3,
                                      aspectRatio: a.ratio,
                                    }} />
                                    {a.label}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* STYLE */}
                    <div>
                      <div style={{
                        fontSize: 10, fontWeight: 800,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        color: T.txtFaint,
                        marginBottom: 10,
                      }}>
                        Style preset
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {STYLES.map((s) => {
                          const active = s.id === styleId;
                          return (
                            <motion.button
                              key={s.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setStyleId(s.id)}
                              type="button"
                              style={{
                                padding: "7px 13px",
                                borderRadius: 999,
                                background: active ? T.gradientBtn : (isLight ? "#F8F7FC" : "#1C1C28"),
                                border: `1px solid ${active ? "transparent" : T.line}`,
                                color: active ? "#fff" : T.txtSoft,
                                fontSize: 11.5, fontWeight: 700,
                                fontFamily: "inherit",
                                cursor: "pointer",
                                boxShadow: active ? `0 4px 12px -4px ${T.primaryGlow}` : "none",
                                transition: "all 0.18s ease",
                              }}
                            >
                              {s.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* NUMBER OF IMAGES */}
                    <div>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginBottom: 10,
                      }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: T.txtFaint,
                        }}>
                          Batch size
                        </div>
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: T.txtDim,
                        }}>
                          Max 2
                        </span>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: isMobile ? 6 : 8,
                      }}>
                        {[1, 2, 3, 4].map((n) => {
                          const active = amount === n;
                          const cost = selectedModel.credits * n;
                          const canAfford = credits >= cost;
                          const isLocked = n >= 3;
                          const isDisabled = isLocked || !canAfford;

                          return (
                            <motion.button
                              key={n}
                              onClick={() => !isDisabled && setAmount(n)}
                              disabled={isDisabled}
                              whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
                              whileTap={!isDisabled ? { scale: 0.96 } : {}}
                              type="button"
                              title={isLocked ? "Upgrade to unlock" : `${n} image${n > 1 ? "s" : ""}`}
                              style={{
                                position: "relative",
                                padding: isMobile ? "9px 2px 8px" : "11px 4px 10px",
                                borderRadius: 12,
                                background: isLocked
                                  ? (isLight ? "rgba(20,20,40,0.03)" : "rgba(255,255,255,0.02)")
                                  : (active
                                      ? `linear-gradient(145deg, ${T.primarySoft}, ${T.primarySoft})`
                                      : (isLight ? "#F8F7FC" : "#1C1C28")),
                                border: isLocked
                                  ? `1px dashed ${T.lineStrong}`
                                  : (active
                                      ? `1.5px solid ${T.primary}`
                                      : `1px solid ${T.line}`),
                                color: isLocked ? T.txtDim : (active ? T.primary : (canAfford ? T.txt : T.txtDim)),
                                fontFamily: "inherit",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isLocked ? 0.55 : (canAfford ? 1 : 0.4),
                                transition: "all 0.2s ease",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                boxShadow: active && !isLocked ? `0 6px 18px -6px ${T.primaryGlow}` : "none",
                                overflow: "hidden",
                              }}
                            >
                              {isLocked && (
                                <span style={{
                                  position: "absolute", top: 6, right: 6,
                                  width: 16, height: 16, borderRadius: "50%",
                                  background: isLight ? "rgba(20,20,40,0.08)" : "rgba(255,255,255,0.08)",
                                  border: `1px solid ${T.line}`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  pointerEvents: "none",
                                  zIndex: 3,
                                }}>
                                  <FaLock style={{ fontSize: 7, color: T.txtDim }} />
                                </span>
                              )}

                              <div style={{
                                display: "grid",
                                gridTemplateColumns: n === 1 ? "1fr" : "1fr 1fr",
                                gridTemplateRows: n <= 2 ? "1fr" : "1fr 1fr",
                                gap: 3,
                                width: isMobile ? 32 : 38,
                                height: isMobile ? 32 : 38,
                                padding: 2,
                                opacity: isLocked ? 0.6 : 1,
                              }}>
                                {Array.from({ length: n }).map((_, i) => {
                                  const spanStyle = (n === 3 && i === 0) ? { gridRow: "span 2" } : {};
                                  return (
                                    <div
                                      key={i}
                                      style={{
                                        ...spanStyle,
                                        borderRadius: 3,
                                        background: isLocked
                                          ? (isLight ? "rgba(20,20,40,0.10)" : "rgba(255,255,255,0.10)")
                                          : (active
                                              ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                                              : (isLight ? "rgba(20,20,40,0.10)" : "rgba(255,255,255,0.12)")),
                                        border: active && !isLocked
                                          ? "1px solid rgba(255,255,255,0.25)"
                                          : `1px solid ${T.line}`,
                                      }}
                                    />
                                  );
                                })}
                              </div>

                              <span style={{
                                fontSize: isMobile ? 12 : 13,
                                fontWeight: 900,
                                letterSpacing: "-0.02em",
                                lineHeight: 1,
                                color: isLocked ? T.txtDim : (active ? T.primary : (canAfford ? T.txt : T.txtDim)),
                              }}>
                                {n}
                              </span>

                              <span style={{
                                fontSize: isMobile ? 8 : 9,
                                fontWeight: 700,
                                color: isLocked ? T.txtDim : (active ? T.primary : T.txtFaint),
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                lineHeight: 1,
                              }}>
                                {isLocked ? "Locked" : `${cost}c`}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── ACTION BUTTONS ─── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isSmallMobile ? "1fr" : "auto 1fr",
              gap: 10,
              marginTop: 4,
            }}>
              <button
                onClick={clearForm}
                type="button"
                style={{
                  padding: isMobile ? "13px 18px" : "15px 22px",
                  borderRadius: 14,
                  background: "transparent",
                  border: `1px solid ${T.lineStrong}`,
                  color: T.txt,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "border-color 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.lineStrong; }}
              >
                Clear
              </button>

              <motion.button
                onClick={handleGenerate}
                disabled={!canGenerate}
                whileHover={canGenerate ? { scale: 1.02, y: -1 } : {}}
                whileTap={canGenerate ? { scale: 0.98 } : {}}
                type="button"
                style={{
                  position: "relative",
                  padding: isMobile ? "13px 18px" : "15px 22px",
                  borderRadius: 14,
                  background: canGenerate ? T.gradientBtn : (isLight ? "#EFEEF5" : "#1F1F2A"),
                  border: "none",
                  color: canGenerate ? "#fff" : T.txtDim,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: canGenerate ? `0 12px 32px -8px ${T.primaryGlow}` : "none",
                  opacity: canGenerate ? 1 : 0.65,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {canGenerate && (
                  <motion.span
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    style={{
                      position: "absolute",
                      top: 0, bottom: 0,
                      width: "40%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
                  {isGenerating ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-flex" }}
                      >
                        <FaSpinner style={{ fontSize: 12 }} />
                      </motion.span>
                      <span>Generating…</span>
                    </>
                  ) : (
                    <>
                      <FaWandMagicSparkles style={{ fontSize: 13 }} />
                      <span>Generate · {totalCredits}c</span>
                    </>
                  )}
                </span>
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "12px 14px",
                  background: isLight ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 12,
                  color: "#ef4444",
                  fontSize: 12, fontWeight: 600,
                  wordBreak: "break-word",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "rgba(239,68,68,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 11, fontWeight: 900,
                }}>!</span>
                {error}
              </motion.div>
            )}
          </GlassCard>
        </motion.aside>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <main style={{ minWidth: 0 }}>

          {/* ─── RECENT GENERATIONS ─── */}
          <RecentGenerationsSection
            T={T}
            isMobile={isMobile}
            items={recentImages}
            userProfile={userProfile}
            onOpen={(item) => setLightbox(item)}
          />

          {/* ─── YOUR GENERATIONS ─── */}
          {hasContent && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: isMobile ? 24 : 32 }}
            >
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 18,
                flexWrap: "wrap",
                gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.span
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: 4, height: isMobile ? 24 : 32,
                      borderRadius: 999,
                      background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                      boxShadow: `0 0 14px -1px ${T.primaryGlow}`,
                      transformOrigin: "center",
                      flexShrink: 0,
                    }}
                  />
                  <h2 style={{
                    fontSize: isMobile ? 18 : 22,
                    fontWeight: 900,
                    color: T.txt,
                    margin: 0,
                    letterSpacing: "-0.03em",
                  }}>
                    {isGenerating ? "Creating…" : "Your Generations"}
                  </h2>
                </div>

                {results.length > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 800,
                    color: T.txtFaint,
                    padding: "5px 12px",
                    background: T.hoverBg,
                    border: `1px solid ${T.line}`,
                    borderRadius: 999,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {results.length} {results.length === 1 ? "image" : "images"}
                  </span>
                )}
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: isSmallMobile ? "1fr" : isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                gap: isMobile ? 12 : 16,
                marginBottom: 40,
              }}>
                <AnimatePresence mode="popLayout">
                  {generatingCards.map((g, i) => (
                    <GeneratingCard
                      key={g.id}
                      T={T}
                      isLight={isLight}
                      credits={g.credits}
                      prompt={g.prompt}
                      index={i}
                    />
                  ))}
                </AnimatePresence>

                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6 }}
                    style={{
                      position: "relative",
                      borderRadius: 20,
                      overflow: "hidden",
                      background: T.panel,
                      border: `1px solid ${T.line}`,
                      aspectRatio: "1 / 1",
                      boxShadow: isLight
                        ? "0 12px 40px -16px rgba(20,20,40,0.15)"
                        : "0 12px 40px -16px rgba(0,0,0,0.7)",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <img
                      src={r.url}
                      alt={r.prompt}
                      onClick={() => setLightbox(r)}
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        cursor: "zoom-in",
                        display: "block",
                      }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
                      pointerEvents: "none",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }} className="gen-overlay" />
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      display: "flex", gap: 6,
                      opacity: 0,
                      transition: "opacity 0.25s ease",
                    }} className="gen-actions">
                      <button
                        onClick={() => toggleFavorite(r.id)}
                        type="button"
                        style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: "rgba(0,0,0,0.65)",
                          backdropFilter: "blur(10px)",
                          border: "none",
                          color: favorites.has(r.id) ? T.primary : "#fff",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {favorites.has(r.id) ? <FaHeart style={{ fontSize: 12 }} /> : <FaRegHeart style={{ fontSize: 12 }} />}
                      </button>
                      <button
                        onClick={() => handleDownload(r.url)}
                        type="button"
                        style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: "rgba(0,0,0,0.65)",
                          backdropFilter: "blur(10px)",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <FaDownload style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <style>{`
                .gen-card-hover:hover .gen-actions,
                .gen-card-hover:hover .gen-overlay {
                  opacity: 1 !important;
                }
              `}</style>
            </motion.section>
          )}

          {/* ─── EXPLORE GALLERY ─── */}
          <section style={{ marginTop: hasContent ? 12 : isMobile ? 20 : 28 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
              gap: 12, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: 4, height: isMobile ? 26 : 34,
                    borderRadius: 999,
                    background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                    boxShadow: `0 0 14px -1px ${T.primaryGlow}`,
                    transformOrigin: "center",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{
                      fontSize: isMobile ? 18 : 22,
                      fontWeight: 900,
                      color: T.txt,
                      margin: 0,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                    }}>
                      Explore
                    </h2>
                    <span style={{
                      fontSize: 10, fontWeight: 900,
                      letterSpacing: "0.08em",
                      padding: "4px 10px", borderRadius: 999,
                      background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                      color: "#fff",
                      textTransform: "uppercase",
                      lineHeight: 1, flexShrink: 0,
                      boxShadow: `0 4px 12px -4px ${T.primaryGlow}`,
                    }}>
                      {FEATURED_SOURCE.length} ready
                    </span>
                  </div>
                  <p style={{
                    fontSize: isMobile ? 11.5 : 12.5,
                    fontWeight: 500, color: T.txtFaint,
                    margin: "6px 0 0", lineHeight: 1.3,
                  }}>
                    Curated AI art — just browse for inspiration
                  </p>
                </div>
              </div>
            </div>

            {/* Bento grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isSmallMobile
                ? "1fr"
                : isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",
              gridAutoRows: "1fr",
              gap: isMobile ? 12 : 16,
            }}>
              {FEATURED_SOURCE.map((item, idx) => {
                const isFeatured = !isSmallMobile && idx === 0;
                return (
                  <motion.div
                    key={`${item.prompt}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: (idx % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -6 }}
                    style={{
                      position: "relative",
                      borderRadius: isFeatured ? 24 : 18,
                      overflow: "hidden",
                      background: T.panel,
                      border: `1px solid ${T.line}`,
                      cursor: "pointer",
                      aspectRatio: "1 / 1",
                      boxShadow: isLight
                        ? "0 6px 24px -12px rgba(20,20,40,0.12)"
                        : "0 6px 24px -12px rgba(0,0,0,0.6)",
                      gridColumn: isFeatured ? "span 2" : "span 1",
                      gridRow: isFeatured ? "span 2" : "span 1",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.25s ease",
                      isolation: "isolate",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isLight
                        ? `0 24px 60px -20px ${T.primaryGlow}, 0 0 0 1px ${T.primary}66`
                        : `0 28px 70px -20px ${T.primaryGlow}, 0 0 0 1px ${T.primary}77`;
                      e.currentTarget.style.borderColor = `${T.primary}88`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = isLight
                        ? "0 6px 24px -12px rgba(20,20,40,0.12)"
                        : "0 6px 24px -12px rgba(0,0,0,0.6)";
                      e.currentTarget.style.borderColor = T.line;
                    }}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        poster={item.poster}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.prompt}
                        loading="lazy"
                        draggable={false}
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      />
                    )}

                    <div style={{
                      position: "absolute", inset: 0,
                      background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.92) 100%)`,
                      pointerEvents: "none",
                    }} />

                    <div style={{
                      position: "absolute",
                      top: isFeatured ? 16 : 12,
                      left: isFeatured ? 16 : 12,
                      zIndex: 3,
                    }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: isFeatured ? "5px 12px" : "4px 10px",
                        borderRadius: 999,
                        background: "rgba(43,127,255,0.92)",
                        color: "#fff",
                        fontSize: isFeatured ? 11 : 10,
                        fontWeight: 800,
                        letterSpacing: "0.02em",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        boxShadow: "0 2px 8px rgba(43,127,255,0.4)",
                        whiteSpace: "nowrap",
                      }}>
                        {item.tag}
                      </span>
                    </div>

                    <div style={{
                      position: "absolute",
                      left: 0, right: 0, bottom: 0,
                      padding: isFeatured ? "28px 18px 18px" : "22px 14px 14px",
                      zIndex: 3,
                      pointerEvents: "none",
                    }}>
                      <span style={{
                        color: "#fff",
                        fontSize: isFeatured ? (isMobile ? 15 : 18) : (isSmallMobile ? 11.5 : 13),
                        fontWeight: 800,
                        lineHeight: 1.25,
                        letterSpacing: "-0.015em",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                      }}>
                        {item.prompt}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* ═══ CREDITS PROMO ═══ */}
      <AnimatePresence>
        {isLowCredits && (
          <CreditsPromoCard
            onTopUp={() => setShowPremium(true)}
            T={T}
            isLight={isLight}
            credits={credits}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      {/* ═══ PREMIUM MODAL ═══ */}
      <PremiumCreditsModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        userCredits={credits}
        onSubscribe={async (planId) => {
          console.log("Subscribe to plan:", planId);
        }}
        onBuyCredits={async (packId, creditAmount) => {
          console.log("Buy credit pack:", packId, "amount:", creditAmount);
          const newBal = await addUserCredits(creditAmount);
          if (newBal !== null) setCredits(newBal);
          setShowPremium(false);
        }}
      />

      {/* ═══ LIGHTBOX ═══ */}
      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(0,0,0,0.95)",
                backdropFilter: "blur(12px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "fixed",
                inset: isMobile ? 12 : 24,
                zIndex: 101,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              {lightbox.type === "video" ? (
                <video
                  src={lightbox.url}
                  poster={lightbox.poster}
                  controls
                  autoPlay
                  style={{
                    maxWidth: "100%",
                    maxHeight: isMobile ? "80vh" : "90vh",
                    objectFit: "contain",
                    borderRadius: 16,
                    pointerEvents: "auto",
                    boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)",
                  }}
                />
              ) : (
                <img
                  src={lightbox.url}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    maxHeight: isMobile ? "80vh" : "90vh",
                    objectFit: "contain",
                    borderRadius: 16,
                    pointerEvents: "auto",
                    boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)",
                  }}
                />
              )}
              <div style={{
                position: "absolute",
                top: 0, right: 0,
                display: "flex", gap: 8, pointerEvents: "auto",
              }}>
                <button
                  onClick={() => handleDownload(lightbox.url)}
                  type="button"
                  style={{
                    width: isMobile ? 40 : 46,
                    height: isMobile ? 40 : 46,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "none", color: "#fff",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                >
                  <FaDownload style={{ fontSize: isMobile ? 13 : 15 }} />
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  type="button"
                  style={{
                    width: isMobile ? 40 : 46,
                    height: isMobile ? 40 : 46,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "none", color: "#fff",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                >
                  <FaTimes style={{ fontSize: isMobile ? 13 : 15 }} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        * { box-sizing: border-box; }
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb {
          background: ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.10)"};
          border-radius: 999px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: ${isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"};
        }

        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }

        @media (max-width: 900px) {
          body { -webkit-tap-highlight-color: transparent; }
        }

        @media (max-width: 480px) {
          html { font-size: 14px; }
        }

        img, button, textarea, input, select { max-width: 100%; }
      `}</style>
    </div>
  );
};

export default Img_GeneratorPro;