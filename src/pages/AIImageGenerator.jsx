// src/pages/AIImageGenerator.jsx — Leonardo home + premium loading + entrance animations + credits + welcome modal
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMagic, FaSpinner, FaDownload, FaImage,
  FaStar, FaCheck, FaTimes, FaCog,
  FaVideo, FaMusic, FaCube, FaPencilRuler,
  FaExpandArrowsAlt, FaRegSmile, FaThLarge, FaChevronRight,
  FaThumbsUp, FaHeart, FaPlay, FaArrowUp,
  FaCoins, FaCrown, FaBolt, FaRocket,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { generateWithPollinations } from "../lib/pollinations";
import { supabase } from "../lib/supabase";
import {
  saveGeneratedImage,
  loadRecentGeneratedImages,
  deleteGeneratedImage,
  uploadGeneratedToStorage,
  loadUserCredits,
  deductUserCredits,
  addUserCredits,
} from "../lib/imageStorage";
import AIRailSidebar from "./AIRailSidebar";
import PremiumCreditsModal from "../components/PremiumCreditsModal";
import WelcomeCreditsModal from "../components/WelcomeCreditsModal";

/* ═══════════════════════════════════════════════════════════════
   HERO VIDEOS
   ═══════════════════════════════════════════════════════════════ */
const HERO_VIDEOS = [
  {
    src: "https://www.media.io/videos/ai-video-generator/tti_1.mp4",
    poster: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&q=80",
  },
  {
    src: "https://cdn.dribbble.com/userupload/47510971/file/5b1096096003ebeaf9156fd7d67183cf.mp4",
    poster: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&q=80",
  },
  {
    src: "https://cdn.dribbble.com/userupload/48389236/file/2a2f6dc334fbf581ba7f5b5d9253f88f.mp4",
    poster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80",
  },
];

/* ═══════════════════════════════════════════════════════════════
   THEME TOKENS
   ═══════════════════════════════════════════════════════════════ */
const DARK = {
  bg: "#0A0A12",
  rail: "#0F0F1A",
  panel: "#16161F",
  panel2: "#1C1C28",
  panel3: "#232332",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.15)",
  txt: "#FFFFFF",
  txtSoft: "rgba(255,255,255,0.65)",
  txtFaint: "rgba(255,255,255,0.45)",
  txtDim: "rgba(255,255,255,0.25)",
  primary: "#eb7d34",
  primary2: "#f59e0b",
  primary3: "#c8631f",
  primarySoft: "rgba(235,125,52,0.14)",
  primaryGlow: "rgba(235,125,52,0.45)",
  green: "#22C55E",
  heroOverlay1: "rgba(10,10,18,0.35)",
  heroOverlay2: "rgba(10,10,18,0.95)",
};

const LIGHT = {
  bg: "#FFFFFF",
  rail: "#FFFFFF",
  panel: "#FFFFFF",
  panel2: "#F4F1EC",
  panel3: "#EBE7E0",
  line: "rgba(20,20,30,0.08)",
  lineStrong: "rgba(20,20,30,0.15)",
  txt: "#1A1613",
  txtSoft: "rgba(26,22,19,0.62)",
  txtFaint: "rgba(26,22,19,0.42)",
  txtDim: "rgba(26,22,19,0.25)",
  primary: "#c8631f",
  primary2: "#eb7d34",
  primary3: "#f59e0b",
  primarySoft: "rgba(200,99,31,0.10)",
  primaryGlow: "rgba(200,99,31,0.35)",
  green: "#16A34A",
  heroOverlay1: "rgba(255,255,255,0.30)",
  heroOverlay2: "rgba(255,255,255,0.98)",
};

const CREDITS_PER_IMAGE = 10;

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const TOOLS = [
  { id: "agent",     label: "Agent",      icon: FaMagic, badge: "Beta" },
  { id: "image",     label: "Image",      icon: FaImage },
  { id: "video",     label: "Video",      icon: FaVideo },
  { id: "audio",     label: "Audio",      icon: FaMusic },
  { id: "3d",        label: "3D",         icon: FaCube },
  { id: "blueprints",label: "Blueprints", icon: FaPencilRuler },
  { id: "upscaler",  label: "Upscaler",   icon: FaExpandArrowsAlt },
];

const STYLE_PRESETS = [
  { id: "dynamic",   label: "Dynamic",   suffix: ", dynamic composition, dramatic lighting, high contrast, bold colors, highly detailed, sharp focus, 8k, professional photography" },
  { id: "photoreal", label: "Photoreal", suffix: ", ultra realistic, photorealistic, hyper detailed, 8k resolution, cinematic lighting, razor sharp focus, professional photography, high detail, masterpiece quality" },
  { id: "anime",     label: "Anime",     suffix: ", anime style, japanese animation, studio ghibli, vibrant colors, cel shaded, ultra detailed, high resolution, sharp lines" },
  { id: "cyberpunk", label: "Cyberpunk", suffix: ", cyberpunk style, neon lights, futuristic, dramatic lighting, high contrast, ultra detailed, sharp focus, 8k" },
  { id: "3d",        label: "3D Render", suffix: ", 3d render, octane render, cinema4d, volumetric lighting, high detail, ultra sharp, ray tracing, 8k" },
  { id: "watercolor",label: "Watercolor",suffix: ", watercolor painting, soft edges, artistic, brush strokes, delicate, high detail, sharp texture" },
  { id: "minimal",   label: "Minimal",   suffix: ", minimalist, clean, simple, elegant, soft colors, negative space, high detail, sharp focus" },
];

const ASPECTS = [
  { id: "1:1",  label: "1:1",  w: 1024, h: 1024 },
  { id: "2:3",  label: "2:3",  w: 832,  h: 1024 },
  { id: "3:4",  label: "3:4",  w: 896,  h: 1024 },
  { id: "16:9", label: "16:9", w: 1024, h: 576  },
  { id: "9:16", label: "9:16", w: 576,  h: 1024 },
];

const COUNTS = [1, 2, 3, 4];

const FEATURED = [
  { id: "agent",   label: "Leo Agent",              thumb: "https://cdn.dribbble.com/userupload/47736442/file/d7dbb4a4d3294b9e0e67281950776a09.jpeg?resize=1200x1200&vertical=center" },
  { id: "sunburst",label: "GPT Image 2.5 Sunburst", thumb: "https://cdn.dribbble.com/userupload/47112391/file/0729a3ae2b2ca0ba1c6b37faa6d39d2c.png?format=webp&resize=700x525&vertical=center" },
  { id: "seedance",label: "Seedance 2.5",           thumb: "https://cdn.dribbble.com/userupload/48669340/file/69d40d868fba7b6160d5bcac5888b6a3.png?crop=0x165-1254x1105&format=webp&resize=700x525&vertical=center" },
  { id: "restore", label: "Dermalux LED Facial Mask",  thumb: "https://cdn.dribbble.com/userupload/49100419/file/6516ccfcafd1345c9166a0dc49c24586.png?crop=0x13-808x619&format=webp&resize=700x525&vertical=center" },
  { id: "char",    label: "Consistent Character",   thumb: "https://cdn.dribbble.com/userupload/48142636/file/433fda20e1dcef6549dc504f631cc95a.jpg?format=webp&resize=700x525&vertical=center" },
  { id: "agent2",    label: "Modern Real Estate Billboard",   thumb: "https://cdn.dribbble.com/userupload/48285905/file/3699fa4226a11692eb39484eeee75b16.jpg?resize=2048x1536&vertical=center" },
  { id: "sunburst2", label: "Abstract Floral Art",  thumb: "https://cdn.dribbble.com/userupload/48252283/file/712a1d5a5593ed7a8bee666294327c51.jpeg?crop=0x322-1122x1164&format=webp&resize=700x525&vertical=center" },
];

const PRODUCT_INSPIRATION = [
  { id: "perfume", label: "Perfume", tag: "Product",
    thumb: "https://malak.com.pk/cdn/shop/files/3614273954167.jpg?v=1755496970&width=800",
    prompt: "Luxury crystal perfume bottle on a marble pedestal, soft studio lighting, water droplets on the glass, elegant product photography, premium commercial packshot, subtle reflections, minimal background, 4k detail",
    style: "photoreal", aspect: "1:1" },
  { id: "watch", label: "Watch", tag: "Product",
    thumb: "https://cdn.shopify.com/s/files/1/0003/5815/4293/files/11335-07.jpg?v=1788002122",
    prompt: "Luxury gold wristwatch on black silk fabric, warm golden spotlight behind, dark moody background, cinematic product photography, macro details, glowing reflections on the gold case, premium commercial packshot, ultra detailed, 8k, sharp focus, elegant composition",
    style: "photoreal", aspect: "1:1" },
  { id: "car", label: "Car", tag: "Automotive",
    thumb: "https://assets-autodeals.s3.eu-west-1.amazonaws.com/1729246556910honda_fit_2022_exterior.jpg",
    prompt: "Vintage American muscle car on an empty desert highway at sunset, dramatic orange and purple sky, cinematic automotive photography, dust kicking up, low angle, chrome reflections, premium car advertisement, ultra detailed, 8k, professional shot",
    style: "photoreal", aspect: "16:9" },
  { id: "sneakers", label: "Sneakers", tag: "Fashion",
    thumb: "https://image.metroshoes.com/cdn-cgi/image/width=900,quality=85,format=auto/products/71-459/550/71-459M21.jpg",
    prompt: "Luxury black sneakers on a dark reflective floor, single overhead spotlight, glowing orange radial glow behind, dramatic shadows, cinematic product photography, premium commercial packshot, macro details of the stitching and laces, ultra detailed, 8k, sharp focus",
    style: "photoreal", aspect: "1:1" },
  { id: "headphones", label: "Headphones", tag: "Tech",
    thumb: "https://audionic.co/cdn/shop/files/White_2.png?v=1775456457&width=660",
    prompt: "Premium wireless over-ear headphones on a soft gradient blue background, minimal studio lighting, sharp material detail, matte and metallic finish, modern tech product photography, clean commercial shot",
    style: "photoreal", aspect: "1:1" },
  { id: "coffee", label: "Coffee", tag: "Lifestyle",
    thumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKnkYrpYWXEYgMpJ874ILja2n0rsPNoGuWPA6gcoeGfw&s=10",
    prompt: "Artisan ceramic coffee cup with perfect latte art on a rustic wooden table, warm morning sunlight streaming through a window, steam rising gently, cozy café atmosphere, food photography, shallow depth of field",
    style: "photoreal", aspect: "1:1" },
  { 
    id: "house", 
    label: "House", 
    tag: "Real Estate",
    thumb: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop",
    prompt: "Modern luxury villa exterior at golden hour, sleek architectural lines, large glass windows glowing warm from inside, manicured garden with palm trees, infinity pool reflecting the sunset sky, cinematic real estate photography, wide angle, professional architectural shot, ultra detailed, 8k, commercial quality",
    style: "photoreal", 
    aspect: "16:9" 
  },
  { 
    id: "villa", 
    label: "Villa", 
    tag: "Real Estate",
    thumb: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop",
    prompt: "Elegant Mediterranean villa with terracotta roof, surrounded by lush tropical garden, stone pathway leading to the entrance, soft golden hour light, ocean visible in the background, cinematic real estate photography, ultra detailed, 8k, commercial advertisement quality",
    style: "photoreal", 
    aspect: "16:9" 
  },
  { 
    id: "apartment", 
    label: "Apartment", 
    tag: "Real Estate",
    thumb: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop",
    prompt: "Luxury modern apartment living room interior, floor to ceiling windows with city skyline view at dusk, warm ambient lighting, elegant furniture with neutral tones, marble floors, minimal decor, professional interior design photography, wide angle, ultra detailed, 8k, cinematic quality",
    style: "photoreal", 
    aspect: "16:9" 
  },
];

const COMMUNITY_USERS = [
  "NovaArt", "PixelForge", "Aurora", "Drift",
  "LunaRay", "ChromaKid", "VortexAI", "NeonDream",
  "SolsticeArt", "DeepInk", "PrismStudio", "EchoFrame",
];

const communityThumb = (seed) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/560/700`;

const seededRandom = (seed) => {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
};

const COMMUNITY = Array.from({ length: 12 }, (_, i) => {
  const id = `c${i + 1}`;
  const seed = `ai-creation-${i + 1}`;
  const user = COMMUNITY_USERS[i % COMMUNITY_USERS.length];
  const likes = Math.floor(seededRandom(seed) * 3000) + 100;
  return { id, thumb: communityThumb(seed), user, likes };
});

const COMMUNITY_FILTERS = [
  { id: "all",        label: "All",         icon: FaThLarge },
  { id: "photography",label: "Photography", icon: FaImage },
  { id: "animals",    label: "Animals",     icon: FaRegSmile },
  { id: "anime",      label: "Anime",       icon: FaMagic },
];

const SURPRISE_PROMPTS = [
  "A mystical forest with glowing mushrooms at night, fireflies, ethereal atmosphere",
  "A cyberpunk street market in Tokyo at midnight, neon signs, rain, reflections",
  "A majestic dragon perched on a mountain peak during sunset, epic scale",
  "An astronaut floating above Earth, stars and galaxy visible, cinematic",
];

const HOT_SKILLS = [
  {
    id: "tryon",
    title: "Realistic Try-On",
    subtitle: "Real-human effect",
    thumb: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
    accent: "#A78BFA",
    icon: FaMagic,
  },
  {
    id: "multi",
    title: "Multi-View",
    subtitle: "Create 360° angles",
    thumb: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400&q=80",
    accent: "#34D399",
    icon: FaCube,
  },
  {
    id: "restore",
    title: "Photo Restore",
    subtitle: "Bring old photos back",
    thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    accent: "#F59E0B",
    icon: FaStar,
  },
  {
    id: "cinematic",
    title: "Cinematic Shot",
    subtitle: "Film-grade visuals",
    thumb: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80",
    accent: "#F472B6",
    icon: FaPlay,
  },
  {
    id: "anime",
    title: "Anime Style",
    subtitle: "Ghibli-inspired art",
    thumb: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
    accent: "#06B6D4",
    icon: FaHeart,
  },
];

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
        bottom: isMobile ? 100 : 130,
        left: isMobile ? 12 : "auto",
        width: isMobile ? "auto" : 340,
        maxWidth: isMobile ? "calc(100vw - 24px)" : "calc(100vw - 32px)",
        zIndex: 60,
        borderRadius: 20,
        overflow: "hidden",
        background: T.panel,
        border: `1px solid ${T.line}`,
        boxShadow: isLight
          ? "0 20px 50px -20px rgba(0,0,0,0.18), 0 0 0 1px rgba(20,20,30,0.06)"
          : "0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        position: "relative",
        padding: isMobile ? "16px 18px 18px" : "20px 22px 22px",
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
            position: "absolute",
            top: 12, right: 12,
            width: 24, height: 24,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            fontSize: 11,
          }}
        >
          <FaTimes />
        </button>

        <div style={{
          position: "relative", zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.2)",
              marginBottom: 10,
            }}>
              <FaCrown style={{ fontSize: 9, color: "#fff" }} />
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Credits
              </span>
            </div>
            <h3 style={{
              fontSize: isMobile ? 17 : 19, fontWeight: 900, color: "#fff",
              margin: "0 0 8px",
              letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>
              Almost out
            </h3>
            <p style={{
              fontSize: isMobile ? 12 : 13, color: "rgba(255,255,255,0.92)",
              margin: 0, lineHeight: 1.5, maxWidth: isMobile ? "100%" : 210,
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
        padding: isMobile ? "14px 16px 16px" : "16px 20px 18px",
        background: isLight ? T.panel2 : T.bg,
      }}>
        <div style={{
          display: "flex", flexDirection: "column",
          gap: 12, marginBottom: 18,
        }}>
          {[
            { icon: FaCoins, label: "10 credits per image" },
            { icon: FaBolt,  label: "Unlimited generations" },
            { icon: FaRocket, label: "Priority queue access" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                border: `1.5px solid ${isLight ? "rgba(235,125,52,0.25)" : "rgba(255,255,255,0.18)"}`,
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
            padding: isMobile ? "12px 18px" : "14px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%)",
            border: "none",
            color: "#fff",
            fontSize: isMobile ? 14 : 15, fontWeight: 800,
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            cursor: "pointer",
            boxShadow: "0 10px 30px -10px rgba(235,125,52,0.7)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <FaCoins style={{ fontSize: 13 }} />
          Top Up Credits
          <FaArrowUp style={{ fontSize: 11, transform: "rotate(45deg)" }} />
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ RANDOM SPLASH — picks a different animation each mount
   ═══════════════════════════════════════════════════════════════ */
const RandomSplash = ({ onDone }) => {
  // Random loader index — picked ONCE per mount
  const loaderRef = useRef(null);
  if (loaderRef.current === null) {
    loaderRef.current = Math.floor(Math.random() * 6);
  }
  const which = loaderRef.current;

  // Progress simulation (still drives onDone timing)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf;
    const start = Date.now();
    const duration = 1800;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const messages = [
    "Yours to Create",
    "Warming up your canvas…",
    "Sharpening the brushes…",
    "Almost ready…",
    "Loading your studio…",
    "Just a moment…",
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 28,
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* Ambient amber glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(235,125,52,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── LOADER #0: Pulsing rings ── */}
        {which === 0 && (
          <div style={{ position: "relative", width: 128, height: 128, marginBottom: 28 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "2px solid #eb7d34",
                }}
                animate={{ scale: [0.6, 1.3, 1.6], opacity: [0.9, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
              />
            ))}
            <motion.div
              style={{
                position: "absolute", inset: 32, borderRadius: "50%",
                background: "#eb7d34",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 30px -10px rgba(235,125,52,0.5)",
              }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaWandMagicSparkles style={{ fontSize: 22, color: "#fff" }} />
            </motion.div>
          </div>
        )}

        {/* ── LOADER #1: Orbiting dots ── */}
        {which === 1 && (
          <div style={{ position: "relative", width: 128, height: 128, marginBottom: 28 }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: "#eb7d34",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 10px 30px -10px rgba(235,125,52,0.5)",
                }}
              >
                <FaMagic style={{ fontSize: 18, color: "#fff" }} />
              </div>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                style={{ position: "absolute", inset: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.15 }}
              >
                <span
                  style={{
                    position: "absolute", top: 0, left: "50%",
                    transform: "translateX(-50%)",
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#eb7d34", opacity: 1 - i * 0.18,
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── LOADER #2: Bouncing trio ── */}
        {which === 2 && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 96, marginBottom: 28 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: i === 1 ? "#eb7d34" : "rgba(235,125,52,0.55)",
                }}
                animate={{ y: [0, -28, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* ── LOADER #3: Shimmer skeleton ── */}
        {which === 3 && (
          <div style={{ width: 320, marginBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "relative", height: 60, borderRadius: 14,
                  overflow: "hidden",
                  background: "#F5F1EA",
                  border: "1px solid rgba(20,20,30,0.06)",
                }}
              >
                <motion.div
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(235,125,52,0.25), transparent)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── LOADER #4: Morphing square ── */}
        {which === 4 && (
          <div style={{ position: "relative", width: 96, height: 96, marginBottom: 28 }}>
            <motion.div
              style={{
                position: "absolute", inset: 0,
                background: "#eb7d34",
                boxShadow: "0 10px 30px -10px rgba(235,125,52,0.5)",
              }}
              animate={{
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["24%", "50%", "24%", "50%", "24%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaWandMagicSparkles style={{ fontSize: 24, color: "#fff" }} />
            </div>
          </div>
        )}

        {/* ── LOADER #5: Expanding squares ── */}
        {which === 5 && (
          <div style={{ position: "relative", width: 128, height: 128, marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute", width: 40, height: 40,
                  borderRadius: 16,
                  border: "2px solid #eb7d34",
                }}
                animate={{ scale: [1, 3.2], opacity: [0.9, 0], rotate: [0, 90] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
              />
            ))}
            <div
              style={{
                position: "relative", zIndex: 10,
                width: 40, height: 40, borderRadius: 12,
                background: "#eb7d34",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 30px -10px rgba(235,125,52,0.5)",
              }}
            >
              <FaMagic style={{ fontSize: 14, color: "#fff" }} />
            </div>
          </div>
        )}

        {/* Text */}
        <motion.div
          key={`text-${which}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 14, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#1A1613",
          }}
        >
          {messages[which]}
        </motion.div>

        {/* Progress bar */}
        <div style={{
          width: 180, height: 3, borderRadius: 999,
          background: "rgba(0,0,0,0.08)", overflow: "hidden",
          marginTop: 20,
        }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "#eb7d34", borderRadius: 999,
            transition: "width 0.1s linear",
          }} />
        </div>

        <div style={{
          fontSize: 12, fontWeight: 600,
          color: "rgba(26,22,19,0.42)",
          fontVariantNumeric: "tabular-nums",
          marginTop: 10,
        }}>
          {Math.round(progress)}%
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const AIImageGenerator = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

const [showSplash, setShowSplash] = useState(true); 
  const [activeInspiration, setActiveInspiration] = useState(null);
  const [pendingInspiration, setPendingInspiration] = useState(null);
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const promptCardRef = useRef(null);
  const textareaRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [recentImages, setRecentImages] = useState([]);

  const [credits, setCredits] = useState(0);
  const [creditsLoaded, setCreditsLoaded] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  });
  const T = theme === "light" ? LIGHT : DARK;

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("theme-light") ? "light" : "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.contains("theme-light");
    document.documentElement.classList.toggle("theme-light", !isLight);
    setTheme(!isLight ? "light" : "dark");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) {
          const meta = user.user_metadata || {};
          setUserProfile({
            id: user.id,
            email: user.email,
            name:
              meta.full_name ||
              meta.name ||
              meta.display_name ||
              (user.email || "").split("@")[0] ||
              "Anonymous",
          });
        }
      } catch (err) {
        console.warn("Failed to load user:", err);
      }

      const recent = await loadRecentGeneratedImages(30);
      if (!cancelled) setRecentImages(recent);
    })();
    return () => { cancelled = true; };
  }, []);

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

  useEffect(() => {
    if (!creditsLoaded) return;
    try {
      const shown = localStorage.getItem("welcome_credits_shown");
      if (!shown && credits >= 10) {
        const t = setTimeout(() => setShowWelcome(true), 700);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [creditsLoaded, credits]);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem("welcome_credits_shown", "1");
    } catch {}
  };

  useEffect(() => {
    const id = setInterval(() => {
      setHeroVideoIndex((i) => (i + 1) % HERO_VIDEOS.length);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  const [prompt, setPrompt] = useState("");
  const [activeTool, setActiveTool] = useState("image");
  const [styleId, setStyleId] = useState("dynamic");
  const [aspectId, setAspectId] = useState("16:9");
  const [count, setCount] = useState(1);
  const [communityFilter, setCommunityFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [promptExpanded, setPromptExpanded] = useState(false);

  const selectedStyle = STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];
  const selectedAspect = ASPECTS.find((a) => a.id === aspectId) || ASPECTS[0];

  const totalCost = CREDITS_PER_IMAGE * count;
  const canAfford = credits >= totalCost;
  const isLowCredits = credits < CREDITS_PER_IMAGE;
  const isLight = theme === "light";

  useEffect(() => {
    if (!promptExpanded) return;

    const handlePointerDown = (e) => {
      if (promptCardRef.current && !promptCardRef.current.contains(e.target)) {
        setPromptExpanded(false);
        textareaRef.current?.blur();
      }
    };

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setPromptExpanded(false);
        textareaRef.current?.blur();
      }
    };

    const t = setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("keydown", handleKey);
    }, 0);

    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [promptExpanded]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, isMobile ? 120 : 200)}px`;
  }, [prompt, isMobile]);

  const runGenerate = useCallback(async (overridePrompt) => {
    const promptText = (overridePrompt ?? prompt).trim();
    if (!promptText) { setError("Please describe the image you want"); return; }

    const cost = CREDITS_PER_IMAGE * count;
    if (credits < cost) {
      setError(`Not enough credits. You need ${cost} but have ${credits}.`);
      setShowPremium(true);
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

    try {
      const fullPrompt = `${promptText}${selectedStyle.suffix}`;
      const baseSeed = Math.floor(Math.random() * 1_000_000);

      const generations = await Promise.all(
        Array.from({ length: count }, async (_, i) => {
          const seed = baseSeed + i;
          const url = await generateWithPollinations({
            prompt: fullPrompt,
            model: "@cf/black-forest-labs/flux-1-schnell",
            width: selectedAspect.w,
            height: selectedAspect.h,
            seed,
          });

          let publicUrl = url;
          try {
            const uploaded = await uploadGeneratedToStorage(url, "generated");
            if (uploaded) publicUrl = uploaded;
          } catch (upErr) {
            console.warn("Storage upload failed, using original URL:", upErr);
          }

          let saved = null;
          try {
            saved = await saveGeneratedImage({
              url: publicUrl,
              prompt: promptText,
              model: "flux-1-schnell",
              style: selectedStyle.label,
              width: selectedAspect.w,
              height: selectedAspect.h,
              seed,
            });
          } catch (saveErr) {
            console.warn("DB save failed:", saveErr);
          }

          return {
            id: saved?.id || `gen_${Date.now()}_${i}`,
            url: publicUrl,
            prompt: promptText,
            style: selectedStyle.label,
            dimension: `${selectedAspect.w}×${selectedAspect.h}`,
            ts: Date.now() + i,
            type: "generated",
            user_email: saved?.user_email || userProfile?.email || "",
            user_name: saved?.user_name || userProfile?.name || "You",
            user_id: saved?.user_id || userProfile?.id,
            isMine: true,
          };
        })
      );

      setResults((prev) => [...generations, ...prev]);

      setRecentImages((prev) => [
        ...generations.map((g) => ({
          id: g.id,
          url: g.url,
          prompt: g.prompt,
          model: "flux-1-schnell",
          style: g.style,
          width: selectedAspect.w,
          height: selectedAspect.h,
          user_email: g.user_email,
          user_name: g.user_name,
          user_id: g.user_id,
          created_at: new Date(g.ts).toISOString(),
        })),
        ...prev,
      ].slice(0, 30));

      window.dispatchEvent(new Event("library-updated"));

      setPrompt("");
      setPromptExpanded(false);
      setPendingInspiration(null);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Generation failed. Please try again.");

      const refunded = await addUserCredits(cost);
      if (refunded !== null) setCredits(refunded);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedStyle, selectedAspect, count, userProfile, credits]);

  const handleGenerate = () => runGenerate();

  const handleSurprise = () => {
    const p = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(p);
    setError(null);
  };

  const handleDownload = async (url) => {
    if (!url) return;
    try {
      if (url.startsWith("data:image")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `leonardo-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `leonardo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleDeleteFromLibrary = async (id) => {
    setResults((prev) => prev.filter((item) => item.id !== id));
    setRecentImages((prev) => prev.filter((item) => item.id !== id));
    setLightboxUrl(null);
    await deleteGeneratedImage(id);
    window.dispatchEvent(new Event("library-updated"));
  };

  const rootStyle = {
    background: T.bg,
    color: T.txt,
    fontFamily: "'Inter', system-ui, sans-serif",
    minHeight: "100vh",
  };

  const displayedRecent = results.length > 0 ? results : recentImages;

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const staggerContainer = (stagger = 0.12, delay = 0.1) => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  });

  return (
    <>
    <AnimatePresence>
  {showSplash && (
    <RandomSplash
      onDone={() => {
        setShowSplash(false);
        try {
          sessionStorage.setItem("leo_splash_shown", "1");
        } catch {}
      }}
    />
  )}
</AnimatePresence>

      <div style={rootStyle}>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%", background: T.bg, position: "relative" }}>
  <AIRailSidebar theme={theme} onToggleTheme={toggleTheme} />
          <main
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              height: "100vh",
              position: "relative",
              paddingBottom: isMobile ? 140 : 160,
            }}
          >
            <motion.div
              initial="hidden"
              animate={showSplash ? "hidden" : "visible"}
              variants={staggerContainer(0.15, 0.1)}
            >
              {/* ═══ HERO SECTION ═══ */}
              <motion.section
                variants={fadeInUp}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: isMobile ? 0 : 24,
                  padding: isMobile ? "70px 16px 24px" : isTablet ? "160px 20px 28px" : "240px 24px 32px",
                  textAlign: "center",
                  isolation: "isolate",
                }}
              >
                {HERO_VIDEOS.map((video, i) => (
                  <video
                    key={video.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={i === 0 ? "auto" : "metadata"}
                    poster={video.poster}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 30%",
                      zIndex: -2,
                      pointerEvents: "none",
                      opacity: heroVideoIndex === i ? 1 : 0,
                      transition: "opacity 1.4s ease-in-out",
                    }}
                  >
                    <source src={video.src} type="video/mp4" />
                  </video>
                ))}

                <div style={{
                  position: "absolute", inset: 0, zIndex: -1,
                  background: `linear-gradient(180deg, ${T.heroOverlay1} 0%, ${T.heroOverlay2} 65%, ${T.bg} 100%)`,
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: isMobile ? "clamp(28px, 8vw, 38px)" : isTablet ? "clamp(44px, 7vw, 64px)" : "clamp(56px, 6.5vw, 92px)",
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      lineHeight: 0.95,
                      textTransform: "uppercase",
                      margin: isMobile ? "0 0 18px" : "0 0 32px",
                      color: T.txt,
                      textShadow: theme === "light"
                        ? "0 2px 8px rgba(0,0,0,0.08)"
                        : "0 6px 24px rgba(0,0,0,0.45)",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: isMobile ? "0 10px" : "0 20px",
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: "inline-block", position: "relative" }}
                    >
                      Yours
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          position: "absolute",
                          left: 0, right: 0,
                          bottom: isMobile ? -4 : -8,
                          height: isMobile ? 3 : 5,
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${T.primary}, ${T.primary2})`,
                          transformOrigin: "left center",
                          boxShadow: `0 4px 20px -2px ${T.primaryGlow}`,
                        }}
                      />
                    </motion.span>

                    <motion.span
                      initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: "inline-block",
                        fontSize: "0.5em",
                        fontWeight: 700,
                        color: T.txtSoft,
                        textShadow: "none",
                        transform: "translateY(-0.06em)",
                      }}
                    >
                      to
                    </motion.span>

                    <motion.span
                      initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: "inline-block",
                        position: "relative",
                        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 50%, ${T.primary3} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Create
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
                        transition={{
                          opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                          scale: { duration: 0.5, delay: 1.2 },
                        }}
                        style={{
                          position: "absolute",
                          top: isMobile ? "-6px" : "-12px",
                          right: isMobile ? "-10px" : "-18px",
                          width: isMobile ? 8 : 12,
                          height: isMobile ? 8 : 12,
                          borderRadius: "50%",
                          background: `radial-gradient(circle, #fff 0%, ${T.primary} 60%, transparent 100%)`,
                          boxShadow: `0 0 20px 4px ${T.primaryGlow}`,
                          pointerEvents: "none",
                        }}
                      />
                    </motion.span>
                  </motion.h1>

                  <button
                    onClick={() => {
                      setPromptExpanded(true);
                      setTimeout(() => textareaRef.current?.focus(), 100);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: isMobile ? "12px 20px" : "14px 26px",
                      marginBottom: isMobile ? 24 : 40,
                      borderRadius: 999,
                      background: theme === "light" ? "rgba(255,255,255,0.94)" : "rgba(22,22,30,0.85)",
                      backdropFilter: "blur(24px) saturate(180%)",
                      WebkitBackdropFilter: "blur(24px) saturate(180%)",
                      border: `1px solid ${T.lineStrong}`,
                      color: T.txtSoft,
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      boxShadow: `0 16px 40px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }}
                  >
                    <FaWandMagicSparkles style={{ fontSize: 14, color: T.primary2 }} />
                    <span>Describe anything you can imagine…</span>
                  </button>

                  <motion.div
                    variants={staggerContainer(0.06, 0.6)}
                    initial="hidden"
                    animate={showSplash ? "hidden" : "visible"}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: isMobile ? "flex-start" : "center",
                      gap: isMobile ? 18 : 24,
                      overflowX: "auto",
                      padding: "8px 2px",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    {TOOLS.map((t) => {
                      const Icon = t.icon;
                      const active = activeTool === t.id;
                      return (
                        <motion.div
                          key={t.id}
                          variants={{
                            hidden: { opacity: 0, y: 20, scale: 0.9 },
                            visible: {
                              opacity: 1, y: 0, scale: 1,
                              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                            },
                          }}
                          style={{ position: "relative", flexShrink: 0 }}
                        >
                          <button
                            onClick={() => setActiveTool(t.id)}
                            type="button"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 8,
                              padding: 0,
                              background: "transparent",
                              border: "none",
                              color: active ? T.txt : T.txtSoft,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              flexShrink: 0,
                              minWidth: isMobile ? 56 : 62,
                            }}
                          >
                            <div style={{
                              width: isMobile ? 52 : 54,
                              height: isMobile ? 52 : 54,
                              borderRadius: 999,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: active
                                ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                                : theme === "light"
                                  ? "rgba(0,0,0,0.04)"
                                  : "rgba(30,30,38,0.75)",
                              border: active
                                ? "1px solid transparent"
                                : theme === "light"
                                  ? "1px solid rgba(20,20,30,0.12)"
                                  : `1px solid ${T.lineStrong}`,
                              color: active
                                ? "#fff"
                                : theme === "light"
                                  ? "rgba(26,22,19,0.65)"
                                  : T.txtSoft,
                              boxShadow: active
                                ? `0 10px 24px -8px ${T.primaryGlow}`
                                : "inset 0 1px 0 rgba(255,255,255,0.04)",
                              backdropFilter: "blur(10px)",
                              WebkitBackdropFilter: "blur(10px)",
                              transition: "all 0.18s ease",
                            }}>
                              <Icon style={{ fontSize: isMobile ? 18 : 18 }} />
                            </div>
                            <span style={{
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: active ? 700 : 500,
                              color: active ? T.txt : T.txtSoft,
                            }}>
                              {t.label}
                            </span>
                          </button>
                          {t.badge && (
                            <span style={{
                              position: "absolute",
                              top: -8, left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 8,
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: 999,
                              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                              color: "#fff",
                              letterSpacing: "0.03em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}>
                              {t.badge}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.section>

              {/* ERROR */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ padding: isMobile ? "0 16px" : "0 24px", maxWidth: 1400, margin: "0 auto" }}
                  >
                    <div style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <FaTimes style={{ fontSize: 12, color: "#f87171" }} />
                      <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <HotSkillsSection
                T={T}
                isMobile={isMobile}
                onPick={(skill) => {
                  if (!skill) return;
                  setPrompt(`Create a ${skill.title.toLowerCase()} style image`);
                  setError(null);
                  setPromptExpanded(true);
                  setTimeout(() => textareaRef.current?.focus(), 120);
                }}
              />

              {/* ── Try a prompt ── */}
              <motion.div variants={fadeInUp}>
                <Section title="Try a prompt" T={T} isMobile={isMobile}>
                  <style>{`
                    .try-prompt-viewport {
                      position: relative;
                      width: 100%;
                      overflow: hidden;
                      padding: 6px 0 12px;
                    }
                    .try-prompt-rail {
                      display: flex;
                      gap: 12px;
                      overflow-x: auto;
                      padding-left: 4px;
                      padding-right: 24px;
                      scroll-snap-type: x proximity;
                      scrollbar-width: none;
                      -ms-overflow-style: none;
                      -webkit-overflow-scrolling: touch;
                    }
                    .try-prompt-rail::-webkit-scrollbar { display: none; }
                    .try-prompt-rail > * { scroll-snap-align: start; }
                    .try-prompt-card {
                      position: relative;
                      flex-shrink: 0;
                      width: 160px;
                      height: 160px;
                      border-radius: 16px;
                      overflow: hidden;
                      padding: 0;
                      font-family: inherit;
                      text-align: left;
                      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                                  box-shadow 0.4s ease;
                    }
                    .try-prompt-card:hover { transform: translateY(-5px) scale(1.03); }
                    .try-prompt-card:hover img { transform: scale(1.08); }
                    .try-prompt-card img { transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
                    @media (max-width: 768px) {
                      .try-prompt-rail {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                        overflow-x: visible;
                        padding: 0;
                      }
                      .try-prompt-card {
                        width: 100%;
                        height: auto;
                        aspect-ratio: 1 / 1;
                        border-radius: 14px;
                      }
                    }
                  `}</style>

                  <div className="try-prompt-viewport">
                    <div className="try-prompt-rail">
                      {PRODUCT_INSPIRATION.map((item) => {
                        const isActive = pendingInspiration === item.id;
                        const isGeneratingThis = isGenerating && pendingInspiration === item.id;

                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            className="try-prompt-card"
                            onClick={() => {
                              setActiveInspiration(item.id);
                              setPendingInspiration(item.id);
                              setPrompt(item.prompt);
                              setStyleId(item.style);
                              setAspectId(item.aspect);
                              setError(null);
                              setPromptExpanded(true);
                              setTimeout(() => textareaRef.current?.focus(), 120);
                            }}
                            disabled={isGenerating && !isGeneratingThis}
                            animate={isGeneratingThis ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                            transition={isGeneratingThis
                              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                              : { duration: 0.3 }}
                            style={{
                              background: T.panel2,
                              border: isActive
                                ? `2px solid ${T.primary}`
                                : `1px solid ${T.line}`,
                              boxShadow: isActive
                                ? `0 0 0 4px ${T.primarySoft}, 0 16px 40px -12px ${T.primaryGlow}`
                                : theme === "light"
                                  ? "0 4px 16px -8px rgba(0,0,0,0.08)"
                                  : "0 4px 16px -8px rgba(0,0,0,0.4)",
                              opacity: isGenerating && !isGeneratingThis ? 0.45 : 1,
                              cursor: isGenerating && !isGeneratingThis ? "not-allowed" : "pointer",
                              filter: isGenerating && !isGeneratingThis ? "grayscale(0.4)" : "none",
                            }}
                          >
                            <img
                              src={item.thumb}
                              alt={item.label}
                              loading="lazy"
                              style={{
                                width: "100%", height: "100%",
                                objectFit: "cover", display: "block",
                                transform: isGeneratingThis ? "scale(1.08)" : "scale(1)",
                              }}
                            />

                            <div style={{
                              position: "absolute", inset: 0,
                              background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.88) 100%)",
                              pointerEvents: "none",
                              zIndex: 2,
                            }} />

                            <span style={{
                              position: "absolute", top: 10, left: 10,
                              fontSize: 9, fontWeight: 800,
                              padding: "4px 9px", borderRadius: 999,
                              background: "rgba(0,0,0,0.55)",
                              backdropFilter: "blur(10px)",
                              WebkitBackdropFilter: "blur(10px)",
                              color: "#fff",
                              letterSpacing: "0.05em", textTransform: "uppercase",
                              border: "1px solid rgba(255,255,255,0.18)",
                              pointerEvents: "none", zIndex: 5,
                            }}>{item.tag}</span>

                            {isActive && !isGeneratingThis && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                  position: "absolute", top: 10, right: 10,
                                  width: 22, height: 22, borderRadius: "50%",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                                  boxShadow: `0 4px 12px -2px ${T.primaryGlow}`,
                                  pointerEvents: "none", zIndex: 5,
                                }}
                              >
                                <FaCheck style={{ fontSize: 10, color: "#fff" }} />
                              </motion.span>
                            )}

                            <div style={{
                              position: "absolute", bottom: 10, left: 12, right: 12,
                              pointerEvents: "none", zIndex: 5,
                            }}>
                              <span style={{
                                color: "#fff",
                                fontSize: 13.5, fontWeight: 800,
                                lineHeight: 1.15, letterSpacing: "-0.01em",
                                display: "block",
                                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>{item.label}</span>
                              <span style={{
                                display: "block", fontSize: 9, fontWeight: 600,
                                letterSpacing: "0.08em", textTransform: "uppercase",
                                color: "rgba(255,255,255,0.7)", marginTop: 3,
                                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                              }}>
                                {isGeneratingThis ? "Generating…" : isActive ? "Ready" : "Tap to fill"}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </Section>
              </motion.div>

              {/* ── Recent generations ── */}
              {(isGenerating || displayedRecent.length > 0) && (
                <motion.div variants={fadeInUp}>
                  <Section
                    title={isGenerating ? "Generating…" : "Recent generations"}
                    subtitle={isGenerating ? undefined : "Made by the community"}
                    T={T}
                    isMobile={isMobile}
                    count={displayedRecent.length}
                    isLive={isGenerating}
                  >
                    <style>{`
                      .recent-viewport {
                        position: relative; width: 100%; overflow: hidden;
                        padding: 4px 0 8px;
                        mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
                        -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
                      }
                      .recent-track {
                        display: flex; gap: 12px; width: max-content;
                        animation: recent-scroll 60s linear infinite;
                        will-change: transform;
                      }
                      .recent-viewport:hover .recent-track { animation-play-state: paused; }
                      .recent-track.is-short { animation-duration: 35s; }
                      @keyframes recent-scroll {
                        0%   { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                      }
                      .recent-card {
                        position: relative; flex-shrink: 0;
                        width: 180px; height: 240px;
                        border-radius: 12px; overflow: hidden;
                        background: #1a1a1f; cursor: pointer;
                        padding: 0; border: none;
                        font-family: inherit; text-align: left;
                        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                                    box-shadow 0.35s ease;
                      }
                      .recent-card:hover {
                        transform: translateY(-5px) scale(1.03);
                        box-shadow: 0 20px 40px -12px rgba(235, 125, 52, 0.45);
                        z-index: 2;
                      }
                      .recent-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
                      .recent-overlay {
                        position: absolute; inset: 0; pointer-events: none;
                        background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.78) 100%);
                        display: flex; flex-direction: column; justify-content: flex-end;
                        padding: 12px;
                      }
                      @media (max-width: 768px) {
                        .recent-card { width: 150px; height: 200px; }
                      }
                    `}</style>

                    <div className="recent-viewport">
                      <div className={`recent-track ${displayedRecent.length <= 3 ? "is-short" : ""}`}>
                        {isGenerating &&
                          Array.from({ length: count }).map((_, i) => (
                            <div
                              key={`loading-${i}`}
                              className="recent-card"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: `linear-gradient(100deg, ${T.panel2} 30%, ${T.panel3} 50%, ${T.panel2} 70%)`,
                                backgroundSize: "200% 100%",
                                animation: "leo-shimmer 1.6s ease-in-out infinite",
                                color: T.txtFaint,
                              }}
                            >
                              <FaSpinner style={{ fontSize: 20, animation: "leo-spin 1s linear infinite" }} />
                            </div>
                          ))}

                        {!isGenerating &&
                          [...displayedRecent, ...displayedRecent].map((item, idx) => {
                            const displayName =
                              item.user_name ||
                              (item.user_email ? item.user_email.split("@")[0] : "Anonymous");
                            const isMine = item.isMine || item.user_id === userProfile?.id;

                            const isNew = (() => {
                              const ts = item.created_at
                                ? new Date(item.created_at).getTime()
                                : item.ts || 0;
                              if (!ts) return false;
                              return Date.now() - ts < 3 * 60 * 1000;
                            })();

                            return (
                              <button
                                key={`${item.id}-${idx}`}
                                onClick={() => setLightboxUrl(item.url)}
                                type="button"
                                className="recent-card"
                              >
                                <img src={item.url} alt={item.prompt} loading="lazy" draggable={false} />
                                {isNew && (
                                  <span
                                    style={{
                                      position: "absolute", top: 10, right: 10,
                                      padding: "3px 8px", borderRadius: 999,
                                      background: "linear-gradient(135deg, #eb7d34 0%, #f59e0b 100%)",
                                      color: "#fff", fontSize: 8, fontWeight: 800,
                                      letterSpacing: "0.08em", textTransform: "uppercase",
                                      lineHeight: 1,
                                      boxShadow: "0 2px 8px rgba(235,125,52,0.5)",
                                      zIndex: 5, pointerEvents: "none",
                                    }}
                                  >
                                    New
                                  </span>
                                )}
                                <div className="recent-overlay">
                                  <span style={{
                                    color: "#fff", fontSize: 13, fontWeight: 700,
                                    lineHeight: 1.2, letterSpacing: "-0.01em",
                                    display: "block",
                                    textShadow: "0 1px 6px rgba(0, 0, 0, 0.6)",
                                  }}>
                                    {isMine ? "You" : displayName}
                                  </span>
                                  <span style={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    fontSize: 9, fontWeight: 700,
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                    marginTop: 4, display: "block",
                                    textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)",
                                  }}>
                                    Tap to view
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </Section>
                </motion.div>
              )}

              {/* ── Featured ── */}
              <motion.div variants={fadeInUp}>
                <Section title="Featured" T={T} isMobile={isMobile}>
                  <style>{`
                    @keyframes leo-marquee {
                      0%   { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .leo-featured-viewport {
                      overflow: hidden; width: 100%; position: relative;
                      padding: 12px 0 20px;
                      mask-image: linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
                      -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 4%, #000 96%, transparent 100%);
                    }
                    .leo-featured-track {
                      display: flex; gap: 14px; width: max-content;
                      animation: leo-marquee 60s linear infinite;
                      will-change: transform;
                    }
                    .leo-featured-viewport:hover .leo-featured-track { animation-play-state: paused; }
                    .leo-featured-card {
                      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                                  box-shadow 0.4s ease, border-color 0.4s ease;
                    }
                    .leo-featured-card:hover {
                      transform: translateY(-7px) scale(1.02);
                      border-color: var(--leo-feat-primary, rgba(235,125,52,0.6)) !important;
                      box-shadow: 0 28px 60px -16px var(--leo-feat-glow, rgba(235,125,52,0.55)) !important;
                    }
                    .leo-featured-card img { transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
                    .leo-featured-card:hover img { transform: scale(1.08); }
                  `}</style>

                  <div className="leo-featured-viewport">
                    <div className="leo-featured-track">
                      {[...FEATURED, ...FEATURED].map((item, idx) => (
                        <button
                          key={`${item.id}-${idx}`}
                          onClick={() => {
                            setPrompt(item.label);
                            setError(null);
                            setPromptExpanded(true);
                            setTimeout(() => textareaRef.current?.focus(), 120);
                          }}
                          type="button"
                          className="leo-featured-card"
                          style={{
                            "--leo-feat-primary": T.primary,
                            "--leo-feat-glow": T.primaryGlow,
                            position: "relative", flexShrink: 0,
                            width: isMobile ? 180 : 260,
                            height: isMobile ? 260 : 360,
                            borderRadius: 20, overflow: "hidden",
                            background: T.panel2,
                            border: `1px solid ${T.line}`,
                            cursor: "pointer", padding: 0,
                            fontFamily: "inherit", textAlign: "left",
                            boxShadow: theme === "light"
                              ? "0 12px 32px -16px rgba(0,0,0,0.15)"
                              : "0 12px 32px -16px rgba(0,0,0,0.5)",
                          }}
                        >
                          <img
                            src={item.thumb}
                            alt={item.label}
                            loading="lazy"
                            draggable={false}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.92) 100%)",
                            pointerEvents: "none",
                          }} />
                          <span style={{
                            position: "absolute", top: 12, right: 12,
                            padding: "4px 10px", borderRadius: 999,
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#fff", fontSize: 9.5, fontWeight: 700,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            pointerEvents: "none",
                          }}>Featured</span>
                          <div style={{
                            position: "absolute", left: 0, right: 0, bottom: 0,
                            padding: "14px 16px", pointerEvents: "none",
                          }}>
                            <span style={{
                              color: "#fff",
                              fontSize: isMobile ? 14 : 17,
                              fontWeight: 800, lineHeight: 1.15,
                              letterSpacing: "-0.01em", display: "block",
                              textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                            }}>{item.label}</span>
                            <span style={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: 9.5, fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              marginTop: 4, display: "block",
                            }}>Tap to try</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Section>
              </motion.div>

              {/* ── Community ── */}
              <motion.div variants={fadeInUp}>
                <Section
                  title="Community Creations"
                  subtitle="Fresh works from creators around the world"
                  T={T}
                  isMobile={isMobile}
                  count={COMMUNITY.length}
                >
                  <style>{`
                    .comm-filter {
                      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .comm-filter:hover { transform: translateY(-1px); }
                    .comm-card {
                      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                                  box-shadow 0.4s ease, border-color 0.35s ease;
                    }
                    .comm-card:hover {
                      transform: translateY(-7px) scale(1.02);
                      box-shadow: 0 28px 56px -18px rgba(235, 125, 52, 0.45);
                      border-color: rgba(235, 125, 52, 0.6) !important;
                    }
                    .comm-card:hover img { transform: scale(1.08); }
                    .comm-card img { transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
                  `}</style>

                  <div style={{
                    display: "flex", gap: 8,
                    overflowX: "auto", marginBottom: 18, paddingBottom: 4,
                    scrollbarWidth: "none", msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}>
                    {COMMUNITY_FILTERS.map((f) => {
                      const Icon = f.icon;
                      const active = communityFilter === f.id;
                      return (
                        <motion.button
                          key={f.id}
                          onClick={() => setCommunityFilter(f.id)}
                          type="button"
                          className="comm-filter"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 999,
                            fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
                            background: active
                              ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                              : theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                            color: active ? "#fff" : T.txtSoft,
                            border: active ? "1px solid transparent" : `1px solid ${T.line}`,
                            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                            boxShadow: active ? `0 10px 24px -10px ${T.primaryGlow}` : "none",
                          }}
                        >
                          <Icon style={{ fontSize: 12 }} />
                          <span>{f.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.div
                    key={communityFilter}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "repeat(2, 1fr)"
                        : isTablet
                          ? "repeat(3, 1fr)"
                          : "repeat(4, 1fr)",
                      gap: isMobile ? 10 : 14,
                    }}
                  >
                    {COMMUNITY.map((item) => (
                      <motion.button
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 20, scale: 0.95 },
                          visible: {
                            opacity: 1, y: 0, scale: 1,
                            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          },
                        }}
                        onClick={() => setLightboxUrl(item.thumb)}
                        type="button"
                        className="comm-card"
                        style={{
                          position: "relative",
                          borderRadius: 16, overflow: "hidden",
                          background: T.panel,
                          border: `1px solid ${T.line}`,
                          aspectRatio: "3 / 4",
                          cursor: "pointer", padding: 0,
                          fontFamily: "inherit", textAlign: "left",
                          boxShadow: theme === "light"
                            ? "0 4px 16px -8px rgba(0,0,0,0.08)"
                            : "0 4px 16px -8px rgba(0,0,0,0.35)",
                        }}
                      >
                        <img
                          src={item.thumb}
                          alt=""
                          loading="lazy"
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "cover", display: "block",
                          }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.9) 100%)",
                          pointerEvents: "none", zIndex: 1,
                        }} />
                        <div style={{
                          position: "absolute", insetInline: 0, bottom: 0,
                          padding: "10px 10px 10px",
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between", gap: 6,
                          pointerEvents: "none", zIndex: 3,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                            <div style={{
                              position: "relative",
                              width: 24, height: 24, borderRadius: "50%",
                              padding: 2,
                              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                              flexShrink: 0,
                            }}>
                              <div style={{
                                width: "100%", height: "100%",
                                borderRadius: "50%", background: "#0A0A12",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: 9, fontWeight: 800,
                              }}>
                                {item.user.charAt(0)}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 10.5, fontWeight: 700, color: "#fff",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                            }}>
                              {item.user}
                            </span>
                          </div>
                          <span style={{
                            display: "flex", alignItems: "center", gap: 3,
                            fontSize: 9.5, fontWeight: 700, color: "#fff",
                            padding: "3px 7px", borderRadius: 999,
                            background: "rgba(255,255,255,0.14)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.18)",
                            flexShrink: 0,
                          }}>
                            <FaThumbsUp style={{ fontSize: 8 }} />
                            {item.likes}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </Section>
              </motion.div>
            </motion.div>
          </main>
        </div>

        {/* ═══ BOTTOM PROMPT DOCK ═══ */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: showSplash ? 0 : 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            left: isMobile ? 8 : "calc(72px + 16px)",
            right: isMobile ? 8 : 16,
            bottom: isMobile ? 8 : 16,
            zIndex: 50,
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            ref={promptCardRef}
            onClick={() => {
              setPromptExpanded(true);
              setTimeout(() => textareaRef.current?.focus(), 80);
            }}
            style={{
              background: theme === "light"
                ? "rgba(255,255,255,0.96)"
                : "linear-gradient(180deg, rgba(28,28,36,0.94) 0%, rgba(20,20,28,0.98) 100%)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border: promptExpanded
                ? `1px solid ${T.primary}88`
                : theme === "light"
                  ? "1px solid rgba(20,20,30,0.08)"
                  : `1px solid ${T.lineStrong}`,
              borderRadius: 30,
              padding: "10px 12px",
              boxShadow: promptExpanded
                ? `0 24px 60px -20px rgba(0,0,0,0.85), 0 0 0 4px ${T.primarySoft}, 0 0 40px -8px ${T.primaryGlow}`
                : theme === "light"
                  ? "0 12px 40px -12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)"
                  : "0 16px 48px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
              textAlign: "left",
              cursor: "text",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 6 : 10, width: "100%", minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, minWidth: 36,
                borderRadius: 30,
                background: theme === "light" ? T.panel3 : "rgba(255,255,255,0.06)",
                border: `1px solid ${T.lineStrong}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.txtSoft,
                flexShrink: 0,
                marginBottom: 2,
              }}>
                <FaImage style={{ fontSize: 13 }} />
              </div>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setPromptExpanded(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isGenerating && prompt.trim()) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe yourimage…"
                disabled={isGenerating}
                rows={1}
                style={{
                  flex: "1 1 auto",
                  minWidth: 0,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: T.txt,
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  padding: "8px 0",
                  resize: "none",
                  lineHeight: 1.45,
                  minHeight: 36,
                  maxHeight: isMobile ? 120 : 200,
                  overflowY: "auto",
                  wordBreak: "break-word",
                  letterSpacing: "-0.005em",
                  caretColor: T.primary,
                }}
              />

              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowPremium(true); }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                title="Your credit balance · click to top up"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: isMobile ? 4 : 6,
                  padding: isMobile ? "7px 9px" : "8px 12px",
                  borderRadius: 999,
                  background: isLight
                    ? "linear-gradient(135deg, rgba(235,125,52,0.10) 0%, rgba(245,158,11,0.06) 100%)"
                    : "linear-gradient(135deg, rgba(235,125,52,0.16) 0%, rgba(245,158,11,0.08) 100%)",
                  border: `1px solid ${T.primary}33`,
                  cursor: "pointer",
                  boxShadow: `0 4px 14px -6px ${T.primaryGlow}`,
                  fontFamily: "inherit",
                  flexShrink: 0,
                  marginBottom: 2,
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "inline-flex" }}
                >
                  <FaCoins style={{ fontSize: isMobile ? 11 : 12, color: T.primary }} />
                </motion.span>
                <span style={{
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 900,
                  color: isMobile && !canAfford ? "#ef4444" : T.txt,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  {creditsLoaded ? credits : "—"}
                </span>
                {!isMobile && (
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: T.txtFaint,
                    letterSpacing: "0.02em",
                  }}>
                    credits
                  </span>
                )}
              </motion.button>

              <motion.button
                onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                disabled={isGenerating || !prompt.trim() || !canAfford}
                type="button"
                whileHover={prompt.trim() && !isGenerating && canAfford ? { scale: 1.04, y: -1 } : {}}
                whileTap={prompt.trim() && !isGenerating && canAfford ? { scale: 0.96 } : {}}
                title={!canAfford ? `Need ${totalCost} credits` : undefined}
                style={{
                  position: "relative",
                  padding: isMobile ? "9px 14px" : "10px 18px",
                  borderRadius: 12,
                  fontSize: isMobile ? 12.5 : 13.5,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  color: prompt.trim() && !isGenerating && canAfford ? "#fff" : T.txtDim,
                  background: prompt.trim() && !isGenerating && canAfford
                    ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                    : theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)",
                  border: "none",
                  cursor: prompt.trim() && !isGenerating && canAfford ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  boxShadow: prompt.trim() && !isGenerating && canAfford
                    ? `0 10px 28px -10px ${T.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`
                    : "none",
                  flexShrink: 0,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                {prompt.trim() && !isGenerating && canAfford && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: "-150%" }}
                    animate={{ x: "250%" }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      top: 0, left: 0,
                      width: "50%", height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                      transform: "skewX(-20deg)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {isGenerating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      style={{ display: "inline-flex" }}
                    >
                      <FaSpinner style={{ fontSize: 11 }} />
                    </motion.span>
                    <span className="dock-btn-label">Working…</span>
                  </>
                ) : (
                  <>
                    <FaMagic style={{ fontSize: 11 }} />
                    <span className="dock-btn-label">Generate ({totalCost})</span>
                    <span className="dock-btn-short">({totalCost})</span>
                  </>
                )}
              </motion.button>
            </div>

            <AnimatePresence initial={false}>
              {promptExpanded && (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    borderTop: `1px solid ${T.line}`,
                    marginTop: 12,
                    paddingTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}>
                    <div style={{
                      display: "flex", gap: 6, overflowX: "auto",
                      scrollbarWidth: "none", msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                      paddingBottom: 2,
                    }}>
                      {STYLE_PRESETS.map((s) => {
                        const isActive = styleId === s.id;
                        return (
                          <motion.button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); setStyleId(s.id); }}
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "7px 13px", borderRadius: 10,
                              fontSize: 11.5, fontWeight: 700, fontFamily: "inherit",
                              background: isActive
                                ? `linear-gradient(135deg, ${T.primary}22, ${T.primary2}15)`
                                : "transparent",
                              color: isActive ? T.primary2 : T.txtSoft,
                              border: isActive
                                ? `1.5px solid ${T.primary}88`
                                : `1px solid ${T.lineStrong}`,
                              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                              transition: "all 0.2s ease",
                              boxShadow: isActive
                                ? `0 4px 12px -6px ${T.primaryGlow}`
                                : "none",
                            }}
                          >
                            {isActive && <FaCheck style={{ fontSize: 8 }} />}
                            {s.label}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: T.txtFaint,
                          }}>Aspect</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {ASPECTS.map((a) => {
                              const isActive = aspectId === a.id;
                              return (
                                <motion.button
                                  key={a.id}
                                  onClick={(e) => { e.stopPropagation(); setAspectId(a.id); }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 7,
                                    fontSize: 11, fontWeight: 700,
                                    fontFamily: "inherit",
                                    background: isActive
                                      ? `linear-gradient(135deg, ${T.primary}22, ${T.primary2}15)`
                                      : "transparent",
                                    color: isActive ? T.primary2 : T.txtSoft,
                                    border: isActive
                                      ? `1.5px solid ${T.primary}88`
                                      : `1px solid ${T.lineStrong}`,
                                    cursor: "pointer", whiteSpace: "nowrap",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {a.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: T.txtFaint,
                          }}>Count</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            {COUNTS.map((n) => {
                              const isActive = count === n;
                              const cost = CREDITS_PER_IMAGE * n;
                              const affordable = credits >= cost;
                              return (
                                <motion.button
                                  key={n}
                                  onClick={(e) => { e.stopPropagation(); if (affordable) setCount(n); }}
                                  disabled={!affordable}
                                  whileHover={affordable ? { scale: 1.05 } : {}}
                                  whileTap={affordable ? { scale: 0.95 } : {}}
                                  type="button"
                                  title={!affordable ? `Need ${cost} credits` : `${cost} credits`}
                                  style={{
                                    minWidth: 28,
                                    padding: "5px 9px",
                                    borderRadius: 7,
                                    fontSize: 11, fontWeight: 700,
                                    fontFamily: "inherit",
                                    background: isActive
                                      ? `linear-gradient(135deg, ${T.primary}22, ${T.primary2}15)`
                                      : "transparent",
                                    color: isActive ? T.primary2 : (affordable ? T.txtSoft : T.txtDim),
                                    border: isActive
                                      ? `1.5px solid ${T.primary}88`
                                      : `1px solid ${T.lineStrong}`,
                                    cursor: affordable ? "pointer" : "not-allowed",
                                    opacity: affordable ? 1 : 0.4,
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {n}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          fontSize: 10.5,
                          color: !canAfford ? "#ef4444" : T.txtFaint,
                          fontWeight: !canAfford ? 700 : 500,
                        }}>
                          {selectedAspect.w} × {selectedAspect.h} px · {count} {count === 1 ? "image" : "images"}
                          {!canAfford && ` · Need ${totalCost} credits`}
                        </span>
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); handleSurprise(); }}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          title="Surprise me"
                          style={{
                            width: 30, height: 30, borderRadius: 9,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: theme === "light" ? T.panel3 : "rgba(255,255,255,0.06)",
                            border: `1px solid ${T.lineStrong}`,
                            color: T.txtSoft,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <FaCog style={{ fontSize: 11 }} />
                        </motion.button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPromptExpanded(false);
                            textareaRef.current?.blur();
                          }}
                          type="button"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: T.txtFaint,
                            fontSize: 11, fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 6px",
                          }}
                        >
                          Close
                          <FaArrowUp style={{ fontSize: 9, transform: "rotate(180deg)" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ═══ TOP-UP PROMO CARD ═══ */}
        <AnimatePresence>
          {isLowCredits && creditsLoaded && (
            <CreditsPromoCard
              onTopUp={() => setShowPremium(true)}
              T={T}
              isLight={isLight}
              credits={credits}
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>

        {/* ═══ PREMIUM CREDITS MODAL ═══ */}
        <PremiumCreditsModal
          isOpen={showPremium}
          onClose={() => setShowPremium(false)}
          userCredits={credits}
          onSubscribe={async (planId) => {
            console.log("Subscribe to plan:", planId);
          }}
          onBuyCredits={async (packId, creditAmount) => {
            const newBal = await addUserCredits(creditAmount);
            if (newBal !== null) setCredits(newBal);
            setShowPremium(false);
          }}
        />

        {/* ═══ WELCOME CREDITS MODAL ═══ */}
        <WelcomeCreditsModal
          isOpen={showWelcome}
          onClose={handleWelcomeClose}
          credits={10}
          userName={userProfile?.name}
          onPrimaryAction={() => {
            setTimeout(() => {
              setPromptExpanded(true);
              textareaRef.current?.focus();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 180);
          }}
          onSecondaryAction={() => {
            // optional follow-up
          }}
        />

        {/* LIGHTBOX */}
        <AnimatePresence>
          {lightboxUrl && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setLightboxUrl(null)}
                style={{
                  position: "fixed", inset: 0, zIndex: 100,
                  background: "rgba(0,0,0,0.94)", backdropFilter: "blur(14px)",
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                style={{
                  position: "fixed", inset: 24, zIndex: 101,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <img src={lightboxUrl} alt="" style={{
                  maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                  borderRadius: 12, pointerEvents: "auto",
                }} />
                <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8, pointerEvents: "auto" }}>
                  <button onClick={() => handleDownload(lightboxUrl)} style={{
                    height: 40, width: 40, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    backdropFilter: "blur(10px)", border: "none", cursor: "pointer",
                  }} type="button" title="Download">
                    <FaDownload style={{ fontSize: 13 }} />
                  </button>
                  {displayedRecent.some(
                    (r) => r.url === lightboxUrl && (r.isMine || r.user_id === userProfile?.id)
                  ) && (
                    <button
                      onClick={() => {
                        const match = displayedRecent.find((r) => r.url === lightboxUrl);
                        if (match) handleDeleteFromLibrary(match.id);
                      }}
                      style={{
                        height: 40, width: 40, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(239,68,68,0.2)", color: "#f87171",
                        backdropFilter: "blur(10px)", border: "none", cursor: "pointer",
                      }}
                      type="button"
                      title="Delete"
                    >
                      <FaTimes style={{ fontSize: 12 }} />
                    </button>
                  )}
                  <button onClick={() => setLightboxUrl(null)} style={{
                    height: 40, width: 40, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    backdropFilter: "blur(10px)", border: "none", cursor: "pointer",
                  }} type="button" title="Close">
                    <FaTimes style={{ fontSize: 13 }} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes leo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes leo-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          *::-webkit-scrollbar { width: 8px; height: 8px; }
          *::-webkit-scrollbar-track { background: transparent; }
          *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 999px; }

          @media (max-width: 480px) {
            .dock-btn-label { display: none; }
            .dock-btn-short { display: inline; }
          }
          @media (min-width: 481px) {
            .dock-btn-short { display: none; }
          }
        `}</style>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LOADING SPLASH
   ═══════════════════════════════════════════════════════════════ */
const LoadingSplash = ({ onDone }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf;
    const start = Date.now();
    const duration = 1800;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24, background: "#FFFFFF",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: "#eb7d34",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 30px -10px rgba(235,125,52,0.5)",
        }}
      >
        <FaWandMagicSparkles style={{ fontSize: 22, color: "#fff" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontSize: 14, fontWeight: 800,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#1A1613",
        }}
      >
        Yours to Create
      </motion.div>

      <div style={{
        width: 180, height: 3, borderRadius: 999,
        background: "rgba(0,0,0,0.08)", overflow: "hidden",
      }}>
        <div style={{
          width: `${progress}%`, height: "100%",
          background: "#eb7d34", borderRadius: 999,
          transition: "width 0.1s linear",
        }} />
      </div>

      <div style={{
        fontSize: 12, fontWeight: 600,
        color: "rgba(26,22,19,0.42)",
        fontVariantNumeric: "tabular-nums",
      }}>
        {Math.round(progress)}%
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
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
   HOT SKILLS SECTION
   ═══════════════════════════════════════════════════════════════ */
const HotSkillsSection = ({ T, isMobile, onPick }) => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section style={{
      padding: isMobile ? "6px 16px" : "8px 24px",
      maxWidth: 1400,
      margin: "0 auto",
      marginTop: 20,
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
        marginBottom: 14, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.span
            initial={{ rotate: 0, scale: 0.7, opacity: 0 }}
            animate={{ rotate: -8, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              padding: "3px 8px", borderRadius: 6,
              background: "linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)",
              color: "#0B0B14", fontSize: 10.5, fontWeight: 900,
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontStyle: "italic",
              boxShadow: "0 4px 12px -4px rgba(6,182,212,0.6)",
            }}
          >
            HOT
          </motion.span>

          <h2 style={{
            fontSize: isMobile ? 19 : 23,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0, color: T.txt,
          }}>
            Skills
          </h2>
        </div>

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => onPick && onPick(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12.5, fontWeight: 600, color: T.txtSoft,
            background: "transparent", border: "none",
            cursor: "pointer", fontFamily: "inherit",
            padding: "4px 8px", borderRadius: 8,
          }}
        >
          Create with insMind CLI
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H8M17 7V16"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      <div style={{
        display: "flex", gap: 12,
        overflowX: "auto", paddingBottom: 8, paddingTop: 4,
        scrollbarWidth: "none", msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        {HOT_SKILLS.map((s, i) => {
          const Icon = s.icon;
          const hovered = hoveredId === s.id;

          return (
            <motion.button
              key={s.id}
              type="button"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5 }}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onPick && onPick(s)}
              style={{
                position: "relative", flexShrink: 0,
                width: isMobile ? 250 : 300,
                height: isMobile ? 120 : 130,
                padding: 14, borderRadius: 18,
                background: `linear-gradient(135deg, ${s.accent}22 0%, ${s.accent}08 100%)`,
                border: `1px solid ${hovered ? s.accent + "88" : s.accent + "33"}`,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                display: "flex", gap: 12, alignItems: "center",
                overflow: "hidden",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                boxShadow: hovered
                  ? `0 20px 44px -16px ${s.accent}80, 0 0 0 1px ${s.accent}44`
                  : "0 4px 16px -8px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 140, height: 140, borderRadius: "50%",
                background: `radial-gradient(circle, ${s.accent}44 0%, transparent 70%)`,
                filter: "blur(24px)", pointerEvents: "none",
                opacity: hovered ? 1 : 0.6,
                transition: "opacity 0.3s ease",
              }} />

              <div style={{
                position: "relative",
                width: 44, height: 44, borderRadius: 12,
                background: T.panel,
                border: `1px solid ${s.accent}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.accent, flexShrink: 0,
                boxShadow: hovered ? `0 8px 20px -8px ${s.accent}80` : "none",
                transition: "box-shadow 0.25s ease",
              }}>
                <Icon style={{ fontSize: 16 }} />
              </div>

              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{
                  fontSize: isMobile ? 13.5 : 15,
                  fontWeight: 800, color: T.txt,
                  marginBottom: 2, letterSpacing: "-0.01em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {s.title}
                </div>

                <div style={{
                  fontSize: 11.5, color: T.txtSoft, marginBottom: 8,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {s.subtitle}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: T.panel,
                        border: `1px solid ${T.line}`,
                        overflow: "hidden",
                        transform: hovered ? `translateX(${idx * 2}px)` : "translateX(0)",
                        transition: `transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.04}s`,
                      }}
                    >
                      <img src={s.thumb} alt="" style={{
                        width: "100%", height: "100%",
                        objectFit: "cover", display: "block",
                      }} />
                    </div>
                  ))}

                  <div style={{
                    marginLeft: "auto",
                    width: 22, height: 22, borderRadius: "50%",
                    background: hovered ? s.accent : T.panel,
                    border: `1px solid ${hovered ? s.accent : T.line}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: hovered ? "#fff" : T.txtSoft,
                    transition: "all 0.25s ease",
                    transform: hovered ? "translateX(2px)" : "translateX(0)",
                  }}>
                    <FaChevronRight style={{ fontSize: 8 }} />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

const Section = ({ title, subtitle, children, T, isMobile, count, isLive }) => (
  <section style={{
    padding: isMobile ? "6px 16px" : "8px 24px",
    maxWidth: 1400,
    margin: "0 auto",
    marginTop: 22,
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12,
      marginBottom: 14, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 4,
            height: isMobile ? 22 : 28,
            borderRadius: 999,
            background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primary2} 100%)`,
            boxShadow: `0 0 12px -2px ${T.primaryGlow}`,
            transformOrigin: "center",
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{
              fontSize: isMobile ? 17 : 21,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: T.txt, margin: 0, lineHeight: 1.15,
              background: isLive
                ? `linear-gradient(135deg, ${T.txt} 0%, ${T.primary} 100%)`
                : "none",
              WebkitBackgroundClip: isLive ? "text" : "unset",
              WebkitTextFillColor: isLive ? "transparent" : "unset",
              backgroundClip: isLive ? "text" : "unset",
            }}>
              {title}
            </h2>

            {isLive && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  display: "inline-block",
                  width: 7, height: 7, borderRadius: "50%",
                  background: T.primary2,
                  boxShadow: `0 0 12px 2px ${T.primaryGlow}`,
                  flexShrink: 0,
                }}
              />
            )}

            {typeof count === "number" && count > 0 && !isLive && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 9.5, fontWeight: 800,
                  letterSpacing: "0.06em",
                  padding: "3px 8px", borderRadius: 999,
                  background: T.primarySoft,
                  color: T.primary2,
                  border: `1px solid ${T.primary}44`,
                  textTransform: "uppercase",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {count}
              </motion.span>
            )}
          </div>

          {subtitle && (
            <p style={{
              fontSize: 11.5, fontWeight: 500,
              color: T.txtFaint,
              margin: "4px 0 0", lineHeight: 1.3,
              letterSpacing: "-0.005em",
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
    {children}
  </section>
);

export default AIImageGenerator;