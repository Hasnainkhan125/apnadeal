// src/pages/Landing.jsx — Dealora animated landing page (FULL)
// ⭐ Brand: #e66000 (unified) + modern view
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  FaArrowRight, FaChevronDown, FaChevronRight, FaBars, FaTimes,
  FaStore, FaHandshake, FaShieldAlt, FaBolt, FaTruck, FaClock,  FaEnvelope, FaMapMarkerAlt, FaPhone, FaTiktok,
  FaPlay, FaCheck, FaCheckCircle, FaStar, FaCog, FaSun, FaMoon,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaMobileAlt, FaLaptop, FaCar, FaHome, FaGem, FaGamepad,
  FaTshirt, FaCouch, FaBicycle, FaCamera,
  FaLock, FaHeadset, FaUndo, FaShippingFast,
  FaUserPlus, FaBoxOpen, FaCreditCard,
  FaQuoteLeft, FaPlus, FaMinus,FaComments, FaImages, FaMagic,
  FaApple, FaGooglePlay, FaCrown, FaRocket, FaChartLine,
  FaUsers, FaThumbsUp, FaAward, FaArrowUp,
} from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   ⭐ THREE.JS AMBIENT SHADOW BACKGROUND
   ═══════════════════════════════════════════════════════════════ */
const ThreeShadowBackground = ({ dark }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const orbsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rafRef = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const palette = dark
      ? [0xe66000, 0xff7a1a, 0xc75200, 0x8b5cf6, 0xec4899]
      : [0xe66000, 0xff7a1a, 0xffb066, 0xff8a33, 0xffd9a8];

    const makeGlowTexture = (hex) => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const c = new THREE.Color(hex);
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      const rgb = `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`;
      grad.addColorStop(0.0, `rgba(${rgb}, 0.85)`);
      grad.addColorStop(0.4, `rgba(${rgb}, 0.35)`);
      grad.addColorStop(1.0, `rgba(${rgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    };

    const orbCount = 10;
    const orbs = [];
    for (let i = 0; i < orbCount; i++) {
      const color = palette[i % palette.length];
      const tex = makeGlowTexture(color);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: dark ? 0.55 : 0.35,
      });
      const sprite = new THREE.Sprite(mat);
      const baseX = (Math.random() - 0.5) * 30;
      const baseY = (Math.random() - 0.5) * 20;
      const baseZ = (Math.random() - 0.5) * 12 - 4;
      const scale = 3 + Math.random() * 6;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(baseX, baseY, baseZ);
      sprite.userData = {
        baseX, baseY, baseZ,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        speedX: 0.15 + Math.random() * 0.35,
        speedY: 0.12 + Math.random() * 0.28,
        ampX: 0.6 + Math.random() * 1.8,
        ampY: 0.5 + Math.random() * 1.4,
        rotSpeed: (Math.random() - 0.5) * 0.4,
      };
      scene.add(sprite);
      orbs.push(sprite);
    }
    orbsRef.current = orbs;

    const onMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(container);

    const clock = new THREE.Clock();
    let elapsed = 0;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = clock.getDelta();
      elapsed += Math.min(dt, 0.05);
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.045;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.045;
      const { x: mx, y: my } = mouseRef.current;
      orbs.forEach((sprite, i) => {
        const u = sprite.userData;
        const t = elapsed;
        const px = u.baseX + Math.sin(t * u.speedX + u.phaseX) * u.ampX;
        const py = u.baseY + Math.cos(t * u.speedY + u.phaseY) * u.ampY;
        sprite.position.x = px + mx * (1.2 + i * 0.08);
        sprite.position.y = py - my * (1.2 + i * 0.08);
        sprite.material.rotation = t * u.rotSpeed;
        const breathe = 0.55 + Math.sin(t * 0.4 + u.phaseX) * 0.15;
        sprite.material.opacity = (dark ? 0.55 : 0.35) * breathe;
      });
      if (isVisibleRef.current) renderer.render(scene, camera);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      orbs.forEach((sprite) => {
        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [dark]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
      style={{
        mixBlendMode: dark ? "screen" : "multiply",
        opacity: dark ? 0.75 : 0.55,
      }}
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ CURSOR-FOLLOW GLOW
   ═══════════════════════════════════════════════════════════════ */
const CursorGlow = () => {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isDesktop || prefersReduced) return;
    const onMove = (e) => {
      x.set(e.clientX - 200);
      y.set(e.clientY - 200);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed h-[400px] w-[400px] rounded-full blur-3xl opacity-[0.18] z-[5] hidden lg:block"
      style={{
        x: sx,
        y: sy,
        background: "radial-gradient(circle, #e66000 0%, transparent 70%)",
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[200] origin-left pointer-events-none"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #e66000 0%, #ff7a1a 100%)",
        boxShadow: "0 0 20px rgba(230,96,0,0.6)",
      }}
      aria-hidden="true"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ WORD-BY-WORD TEXT REVEAL
   ═══════════════════════════════════════════════════════════════ */
const RevealWords = ({ text, delay = 0, className = "", style = {} }) => {
  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ delay: delay + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */
const Counter = ({ to, suffix = "", prefix = "", duration = 1600 }) => {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ MAGNETIC WRAPPER
   ═══════════════════════════════════════════════════════════════ */
const Magnetic = ({ children, strength = 0.35 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ 3D TILT CARD
   ═══════════════════════════════════════════════════════════════ */
const TiltCard = ({ children, max = 8, className = "", style = {} }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        ...style,
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ HERO VIDEO SOURCES
   ═══════════════════════════════════════════════════════════════ */
const HERO_VIDEOS = {
  dark: "https://cdn.dribbble.com/userupload/48389236/file/2a2f6dc334fbf581ba7f5b5d9253f88f.mp4",
  light: "https://cdn.dribbble.com/userupload/48389236/file/2a2f6dc334fbf581ba7f5b5d9253f88f.mp4",
  fallback: "https://cdn.dribbble.com/userupload/48389236/file/2a2f6dc334fbf581ba7f5b5d9253f88f.mp4",
};

/* ═══════════════════════════════════════════════════════════════
   STYLES — brand #e66000
   ═══════════════════════════════════════════════════════════════ */
const LandingStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');

    .land-font-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.03em; font-optical-sizing: auto; }
    .land-font-body { font-family: 'Manrope', system-ui, -apple-system, sans-serif; }

    .theme-dark {
      --land-bg: #0A0A12;
      --land-bg-2: #0F0F1A;
      --land-bg-3: #16161F;
      --land-surface: rgba(255,255,255,0.045);
      --land-surface-2: rgba(255,255,255,0.02);
      --land-line: rgba(255,255,255,0.08);
      --land-line-str: rgba(255,255,255,0.15);
      --land-txt: #FFFFFF;
      --land-txt-soft: rgba(255,255,255,0.65);
      --land-txt-faint: rgba(255,255,255,0.45);
      --land-primary: #e66000;
      --land-primary-2: #ff7a1a;
      --land-primary-3: #c75200;
      --land-primary-soft: rgba(230,96,0,0.14);
      --land-primary-glow: rgba(230,96,0,0.45);
      --land-ink: #0A0A12;
      --land-badge: rgba(230,96,0,0.14);
      --land-badge-border: rgba(230,96,0,0.4);
      --land-btn-primary-bg: #0A0A12;
      --land-btn-primary-fg: #FFFFFF;
      --land-btn-primary-border: #0A0A12;
      --land-card-shadow: 0 12px 40px -20px rgba(0,0,0,0.6);
      --land-success: #4ADE80;
      --land-success-soft: rgba(74,222,128,0.12);
      --land-nav-pill-bg: rgba(255,255,255,0.06);
      --land-nav-pill-border: rgba(255,255,255,0.12);
      --land-video-overlay: linear-gradient(180deg,
        rgba(10,10,18,0.55) 0%,
        rgba(10,10,18,0.42) 40%,
        rgba(10,10,18,0.75) 80%,
        var(--land-bg) 100%);
    }
    .theme-light {
      --land-bg: #FFFFFF;
      --land-bg-2: #FDFAF5;
      --land-bg-3: #F8F4EC;
      --land-surface: rgba(0,0,0,0.04);
      --land-surface-2: rgba(0,0,0,0.02);
      --land-line: rgba(20,20,30,0.08);
      --land-line-str: rgba(20,20,30,0.15);
      --land-txt: #1A1613;
      --land-txt-soft: rgba(26,22,19,0.65);
      --land-txt-faint: rgba(26,22,19,0.42);
      --land-primary: #e66000;
      --land-primary-2: #ff7a1a;
      --land-primary-3: #c75200;
      --land-primary-soft: rgba(230,96,0,0.10);
      --land-primary-glow: rgba(230,96,0,0.35);
      --land-ink: #FFFFFF;
      --land-badge: rgba(230,96,0,0.10);
      --land-badge-border: rgba(230,96,0,0.3);
      --land-btn-primary-bg: #0A0A12;
      --land-btn-primary-fg: #FFFFFF;
      --land-btn-primary-border: #0A0A12;
      --land-card-shadow: 0 12px 40px -20px rgba(0,0,0,0.12);
      --land-success: #16A34A;
      --land-success-soft: rgba(22,163,74,0.10);
      --land-nav-pill-bg: rgba(255,255,255,0.65);
      --land-nav-pill-border: rgba(20,20,30,0.08);
      --land-video-overlay: linear-gradient(180deg,
        rgba(255,255,255,0.35) 0%,
        rgba(255,246,230,0.35) 40%,
        rgba(255,230,199,0.7) 80%,
        var(--land-bg) 100%);
    }

    .land-bg { background: var(--land-bg); color: var(--land-txt); }
    .land-surface { background: var(--land-surface); }
    .land-line { border-color: var(--land-line); }

    .land-nav-shell {
      background: var(--land-nav-pill-bg);
      border: 1px solid var(--land-nav-pill-border);
      backdrop-filter: blur(18px) saturate(150%);
      -webkit-backdrop-filter: blur(18px) saturate(150%);
    }
    .land-nav-link {
      position: relative;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--land-txt);
      transition: color 0.2s ease;
      padding: 8px 14px;
      border-radius: 999px;
    }
    .land-nav-link:hover { color: var(--land-primary); background: var(--land-surface); }

    .land-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 22px;
      border-radius: 999px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 700;
      background: var(--land-btn-primary-bg);
      color: var(--land-btn-primary-fg);
      border: 1px solid var(--land-btn-primary-border);
      box-shadow: 0 12px 28px -12px rgba(0,0,0,0.35);
      transition: transform 0.2s ease, box-shadow 0.3s ease, filter 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }
    .land-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 36px -14px rgba(0,0,0,0.5);
      filter: brightness(1.06);
    }

    .land-btn-ghost {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 22px;
      border-radius: 999px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 600;
      background: transparent;
      color: var(--land-txt);
      border: 1px solid var(--land-line-str);
      transition: all 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }
    .land-btn-ghost:hover { border-color: var(--land-txt); background: var(--land-surface); }

    .land-btn-amber {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 22px;
      border-radius: 999px;
      font-family: 'Manrope', sans-serif;
      font-size: 14px;
      font-weight: 700;
      background: linear-gradient(135deg, #e66000, #ff7a1a);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 14px 30px -12px var(--land-primary-glow);
      transition: transform 0.2s ease, filter 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }
    .land-btn-amber:hover { transform: translateY(-2px); filter: brightness(1.06); }

    .land-premium-btn-primary,
    .land-premium-btn-ghost {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 19px 49px;
      border-radius: 14px;
      font-family: 'Manrope', sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.005em;
      cursor: pointer;
      overflow: hidden;
      isolation: isolate;
      transition:
        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.4s ease,
        border-color 0.3s ease,
        background 0.3s ease;
      white-space: nowrap;
    }
    .land-premium-btn-primary {
      color: #FFFFFF;
      background: linear-gradient(135deg, #1A0F2E 0%, #2A1538 100%);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.08) inset,
        0 10px 30px -10px rgba(26,15,46,0.65),
        0 0 0 0 var(--land-primary-glow);
    }
    .land-premium-btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, #e66000 0%, #ff7a1a 100%);
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 0;
    }
    .land-premium-btn-primary:hover {
      transform: translateY(-3px);
      border-color: var(--land-primary);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.12) inset,
        0 20px 40px -14px var(--land-primary-glow),
        0 0 0 4px var(--land-primary-soft);
    }
    .land-premium-btn-primary:hover::before { opacity: 1; }
    .land-premium-btn-primary:active { transform: translateY(-1px) scale(0.99); }

    .land-premium-btn-ghost {
      color: var(--land-txt);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.18);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.15) inset,
        0 8px 26px -12px rgba(0,0,0,0.35);
    }
    .theme-light .land-premium-btn-ghost {
      background: rgba(255,255,255,0.75);
      border: 1px solid rgba(20,20,30,0.10);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.9) inset,
        0 8px 26px -12px rgba(0,0,0,0.15);
    }
    .land-premium-btn-ghost:hover {
      transform: translateY(-3px);
      border-color: var(--land-primary);
      background: var(--land-primary-soft);
      color: var(--land-primary);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.2) inset,
        0 16px 34px -14px var(--land-primary-glow),
        0 0 0 4px var(--land-primary-soft);
    }
    .land-premium-btn-ghost:active { transform: translateY(-1px) scale(0.99); }

    .land-premium-btn-shine {
      position: absolute;
      top: 0; left: -120%;
      width: 60%; height: 100%;
      background: linear-gradient(100deg,
        transparent 0%,
        rgba(255,255,255,0.35) 45%,
        rgba(255,255,255,0.65) 50%,
        rgba(255,255,255,0.35) 55%,
        transparent 100%);
      transform: skewX(-20deg);
      z-index: 5;
      pointer-events: none;
      transition: left 0.75s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .land-premium-btn-primary:hover .land-premium-btn-shine,
    .land-premium-btn-ghost:hover .land-premium-btn-shine { left: 130%; }

    @media (prefers-reduced-motion: reduce) {
      .land-premium-btn-primary,
      .land-premium-btn-ghost,
      .land-premium-btn-shine { transition: none !important; }
    }

    .land-section { padding: 80px 0; position: relative; }
    @media (min-width: 1024px) { .land-section { padding: 120px 0; } }

    .land-section-label {
      font-family: 'Manrope', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: var(--land-primary);
    }
    .land-section-title {
      font-family: 'Fraunces', serif;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.05;
      color: var(--land-txt);
      font-size: clamp(28px, 4.5vw, 52px);
    }

    .land-card {
      background: var(--land-bg-3);
      border: 1px solid var(--land-line);
      border-radius: 20px;
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .land-card:hover {
      transform: translateY(-4px);
      border-color: var(--land-line-str);
      box-shadow: var(--land-card-shadow);
    }

    .land-glass {
      background: var(--land-surface);
      border: 1px solid var(--land-line);
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
    }

    .land-faq-item {
      border: 1px solid var(--land-line);
      border-radius: 16px;
      background: var(--land-bg-3);
      overflow: hidden;
      transition: border-color 0.25s ease;
    }
    .land-faq-item:hover { border-color: var(--land-line-str); }

    @keyframes landFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes landShimmer {
      0% { transform: translateX(-150%) skewX(-16deg); }
      100% { transform: translateX(450%) skewX(-16deg); }
    }
    @keyframes landBubble {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
      50% { transform: translateY(-30px) scale(1.1); opacity: 0.8; }
    }
    @keyframes landVideoZoom {
      0% { transform: scale(1.05); }
      100% { transform: scale(1.15); }
    }
    .land-float { animation: landFloat 6s ease-in-out infinite; }
    .land-shimmer::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
      transform: translateX(-150%) skewX(-16deg);
      pointer-events: none;
      border-radius: inherit;
    }
    .land-shimmer:hover::before { animation: landShimmer 1.2s ease forwards; }
    .land-bubble {
      animation: landBubble 8s ease-in-out infinite;
      filter: blur(1px);
    }
    .land-hero-video {
      animation: landVideoZoom 22s ease-in-out infinite alternate;
    }

    .land-noscroll::-webkit-scrollbar { display: none; }
    .land-noscroll { -ms-overflow-style: none; scrollbar-width: none; }

    @media (max-width: 1023px) {
      .land-safe-top { padding-top: max(env(safe-area-inset-top, 0px), 0px); }
      .land-safe-bottom { padding-bottom: max(env(safe-area-inset-bottom, 0px), 0px); }
    }

    @media (prefers-reduced-motion: reduce) {
      .land-hero-video,
      .land-float,
      .land-bubble,
      .land-shimmer::before { animation: none !important; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   ⭐ VIDEO HERO BACKGROUND
   ═══════════════════════════════════════════════════════════════ */
const VideoHeroBackground = ({ dark }) => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const src = dark ? HERO_VIDEOS.dark : HERO_VIDEOS.light;

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
  }, [src]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "linear-gradient(180deg, #0A0A12 0%, #1A1A2E 60%, #2A1A2E 100%)"
            : "linear-gradient(180deg, #FFF4E0 0%, #FFE6C7 60%, #FFD9A8 100%)",
        }}
      />
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay muted loop playsInline preload="auto"
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          className="land-hero-video absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoReady ? 1 : 0, transition: "opacity 1.2s ease" }}
        >
          <source src={src} type="video/mp4" />
          <source src={HERO_VIDEOS.fallback} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0" style={{ background: "var(--land-video-overlay)" }} />
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[24%] w-[900px] h-[500px] rounded-full opacity-40"
        style={{
          background: dark
            ? "radial-gradient(circle, rgba(230,96,0,0.22) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to top, var(--land-bg) 0%, transparent 100%)" }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ THEME TOGGLE
   ═══════════════════════════════════════════════════════════════ */
const ThemeToggle = ({ compact = false }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    const h = document.documentElement;
    if (h.classList.contains("theme-light")) return "light";
    if (h.classList.contains("theme-dark")) return "dark";
    try {
      const saved = localStorage.getItem("theme") || localStorage.getItem("app-theme");
      if (saved === "light") return "light";
      if (saved === "dark") return "dark";
    } catch {}
    return "dark";
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => {
      const h = document.documentElement;
      if (h.classList.contains("theme-light")) setTheme("light");
      else if (h.classList.contains("theme-dark")) setTheme("dark");
    };
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggle = () => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const next = theme === "dark" ? "light" : "dark";

    html.classList.remove("theme-dark", "theme-light", "dark");

    html.classList.add(`theme-${next}`);
    if (next === "dark") html.classList.add("dark");

    try {
      localStorage.setItem("theme", next);
      localStorage.setItem("app-theme", next);
    } catch {}

    setTheme(next);
  };

  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[11.5px] font-bold transition-all"
        style={{
          background: "var(--land-surface)",
          border: "1px solid var(--land-line)",
          color: "var(--land-txt)",
        }}
      >
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <FaMoon className="text-[11px]" style={{ color: "var(--land-primary)" }} />
          ) : (
            <FaSun className="text-[11px]" style={{ color: "var(--land-primary)" }} />
          )}
        </motion.span>
        <span>{isDark ? "Dark" : "Light"}</span>
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden group"
      style={{
        background: "var(--land-surface)",
        border: "1px solid var(--land-line)",
      }}
    >
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 50%, rgba(230,96,0,0.22), transparent 65%)"
            : "radial-gradient(circle at 50% 50%, rgba(230,96,0,0.18), transparent 65%)",
        }}
        aria-hidden="true"
      />

      {mounted && (
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.3 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.3 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="relative z-10 flex items-center justify-center"
        >
          {isDark ? (
            <FaMoon className="text-[13px] sm:text-[14px]" style={{ color: "var(--land-txt)" }} />
          ) : (
            <FaSun className="text-[13px] sm:text-[14px]" style={{ color: "#e66000" }} />
          )}
        </motion.span>
      )}

      <motion.span
        key={`ripple-${theme}`}
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "var(--land-primary)",
          transformOrigin: "center",
        }}
        aria-hidden="true"
      />
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════ */
const Navbar = ({ audience, setAudience, onSignup, onSignin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const navLinks = [
    { label: "Home",     href: "#home",     badge: null },
    { label: "Features", href: "#features", badge: null },
    { label: "Plans",    href: "#pricing",  badge: "Save 17%" },
    { label: "selling ",  href: "#sellers",  badge: null },
    { label: "FAQ",      href: "#faq",      badge: null },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 land-safe-top pt-2.5 sm:pt-3.5"
      >
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8">
          <motion.div
            animate={{
              backgroundColor: scrolled
                ? (typeof document !== "undefined" && document.documentElement.classList.contains("theme-light")
                    ? "rgba(255,255,255,0.78)"
                    : "rgba(16,16,24,0.72)")
                : "rgba(20,20,30,0.06)",
              borderColor: scrolled
                ? "var(--land-nav-pill-border)"
                : "var(--land-line)",
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between h-14 sm:h-16 rounded-full pl-4 sm:pl-5 pr-2 sm:pr-2.5"
            style={{
              border: "1px solid var(--land-nav-pill-border)",
              backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "blur(14px) saturate(140%)",
              WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "blur(14px) saturate(140%)",
              boxShadow: scrolled
                ? "0 20px 40px -20px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset"
                : "0 6px 24px -16px rgba(0,0,0,0.15)",
              transition: "box-shadow 0.35s ease",
            }}
          >

         {/* ─── LEFT: Logo + audience toggle ─── */}
<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
{/* Logo only — no wordmark */}
<Link
  to="/"
  className="flex items-center flex-shrink-0"
  aria-label="Dealora home"
>
  <div
    className="logo-inner"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <motion.img
      src="/logo.png"
      alt="Dealora"
      whileHover={{ scale: 1.06, rotate: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="h-10 sm:h-10 md:h-12 rounded-full w-auto object-contain flex-shrink-0"
    />
  </div>

</Link>

  {/* Audience pill toggle */}
  <div
    className="inline-flex items-center rounded-full p-0.5 relative flex-shrink-0"
    style={{
      background: "var(--land-surface)",
      border: "1px solid var(--land-line)",
    }}
  >
    {["individual", "company"].map((opt) => {
      const active = audience === opt;
      return (
        <button
          key={opt}
          onClick={() => setAudience(opt)}
          className="relative px-2 sm:px-3 py-1 rounded-full text-[10.5px] sm:text-[11.5px] font-semibold capitalize transition-colors z-10"
          style={{ color: active ? "var(--land-bg)" : "var(--land-txt-soft)" }}
          aria-pressed={active}
        >
          {active && (
            <motion.span
              layoutId="audience-pill"
              className="absolute inset-0 rounded-full"
              style={{
                background: "var(--land-txt)",
                boxShadow: "0 4px 12px -6px rgba(0,0,0,0.3)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt}</span>
        </button>
      );
    })}
  </div>
</div>
            {/* ─── CENTER: desktop nav ─── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13.5px] font-medium transition-colors"
                  style={{ color: "var(--land-txt)" }}
                >
                  <span className="relative z-10 group-hover:text-[var(--land-primary)] transition-colors">
                    {link.label}
                  </span>
                  {link.badge && (
                    <span
                      className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(16,185,129,0.15)",
                        color: "#10B981",
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "var(--land-surface)" }}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </nav>

            {/* ─── RIGHT ─── */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
  <ThemeToggle />

              <button
                onClick={onSignin}
                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-full transition-all hover:bg-[var(--land-surface)]"
                style={{ color: "var(--land-txt)" }}
              >
                Login
                <FaArrowUpRightFromSquare className="text-[9px] opacity-70" />
              </button>

              <motion.button
                onClick={onSignup}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden md:inline-flex items-center gap-1.5 rounded-full font-bold text-[12.5px] relative overflow-hidden group"
                style={{
                  padding: "9px 18px",
                  background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 10px 22px -10px rgba(230,96,0,0.7), 0 1px 0 rgba(255,255,255,0.2) inset",
                }}
              >
                <span className="relative z-10">Get Started</span>
                <FaArrowRight className="relative z-10 text-[10px] transition-transform duration-300 group-hover:translate-x-0.5" />
                <span
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  }}
                />
              </motion.button>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden relative h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors active:scale-95"
                style={{
                  background: "var(--land-surface)",
                  border: "1px solid var(--land-line)",
                }}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <span className="relative block h-4 w-5">
                  <motion.span
                    animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 top-0 h-[2px] rounded-full"
                    style={{ background: "var(--land-txt)" }}
                  />
                  <motion.span
                    animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full"
                    style={{ background: "var(--land-txt)" }}
                  />
                  <motion.span
                    animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full"
                    style={{ background: "var(--land-txt)" }}
                  />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* ═══════ MODERN MOBILE DRAWER ═══════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] lg:hidden"
              style={{
                background: "rgba(10,10,18,0.65)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.9 }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed left-3 right-3 bottom-3 z-[101] lg:hidden rounded-[28px] overflow-hidden land-safe-bottom"
              style={{
                background: "var(--land-bg)",
                border: "1px solid var(--land-line)",
                maxHeight: "88vh",
                boxShadow:
                  "0 -30px 80px -30px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
              }}
            >
              <div className="pt-3 pb-2 flex justify-center">
                <div className="h-1 w-10 rounded-full" style={{ background: "var(--land-line-str)" }} />
              </div>

              <div className="px-5 pb-4 flex items-center justify-between gap-3">
             <div className="flex items-center gap-2 min-w-0">
  <div
    className="logo-inner"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <img
      src="/logo.png"
      alt="Dealora"
      className="h-12 w-auto rounded-full object-contain flex-shrink-0"
    />
  </div>

</div>
                <div
                  className="inline-flex items-center rounded-full p-0.5 flex-shrink-0"
                  style={{
                    background: "var(--land-surface)",
                    border: "1px solid var(--land-line)",
                  }}
                >
                  {["individual", "company"].map((opt) => {
                    const active = audience === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setAudience(opt)}
                        className="relative px-2.5 py-1 rounded-full text-[10.5px] font-semibold capitalize transition-colors"
                        style={{ color: active ? "var(--land-bg)" : "var(--land-txt-soft)" }}
                      >
                        {active && (
                          <motion.span
                            layoutId="audience-pill-mobile"
                            className="absolute inset-0 rounded-full"
                            style={{ background: "var(--land-txt)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mx-5 h-px" style={{ background: "var(--land-line)" }} />

              <div
                className="px-4 pt-4 overflow-y-auto land-noscroll"
                style={{ maxHeight: "calc(88vh - 260px)" }}
              >
                <nav className="grid gap-2">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors overflow-hidden"
                      style={{
                        background: "var(--land-surface)",
                        border: "1px solid var(--land-line)",
                        color: "var(--land-txt)",
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2.5 text-[14.5px] font-semibold">
                        {link.label}
                        {link.badge && (
                          <span
                            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "rgba(16,185,129,0.15)",
                              color: "#10B981",
                            }}
                          >
                            {link.badge}
                          </span>
                        )}
                      </span>
                      <FaArrowRight
                        className="relative z-10 text-[11px] transition-transform duration-300 group-hover:translate-x-1"
                        style={{ color: "var(--land-txt-soft)" }}
                      />
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(230,96,0,0.08) 0%, transparent 100%)",
                        }}
                        aria-hidden="true"
                      />
                    </motion.a>
                  ))}
                </nav>
              </div>

              <div className="mx-5 mt-4 h-px" style={{ background: "var(--land-line)" }} />

              <div className="p-4 flex flex-col gap-2.5">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.35 }}
                  onClick={() => {
                    setMobileOpen(false);
                    onSignup();
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 14px 30px -12px rgba(230,96,0,0.6), 0 1px 0 rgba(255,255,255,0.2) inset",
                  }}
                >
                  <span className="relative z-10">Get Started Free</span>
                  <FaArrowRight className="relative z-10 text-[11px] transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                    }}
                  />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.35 }}
                  onClick={() => {
                    setMobileOpen(false);
                    onSignin();
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-[14px] transition-colors"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--land-line-str)",
                    color: "var(--land-txt)",
                  }}
                >
                  Login
                  <FaArrowUpRightFromSquare className="text-[10px] opacity-70" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════ */
const SectionHeader = ({ label, title, subtitle, align = "center" }) => (
  <div className={`mb-10 sm:mb-14 ${align === "center" ? "text-center mx-auto" : ""} max-w-2xl`}>
    {label && (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="land-section-label mb-3"
      >
        {label}
      </motion.p>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: 0.05, duration: 0.6 }}
      className="land-section-title mb-4"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-[15px] sm:text-[16px] leading-relaxed"
        style={{ color: "var(--land-txt-soft)" }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   ⭐ BG REMOVER SHOWCASE
   ═══════════════════════════════════════════════════════════════ */
const BgRemoverShowcase = ({ isDark, onStart, onPricing }) => {
  const PRODUCT_IMG =
    "https://sb.kaleidousercontent.com/67418/992x558/235d7eafc9/stunning-quality-prodcut-transp.png";

  const [sliderPos, setSliderPos] = useState(50);
  const [autoDrag, setAutoDrag] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!autoDrag) return;
    let raf;
    let dir = 1;
    let pos = 50;
    const tick = () => {
      pos += dir * 0.35;
      if (pos >= 82) { pos = 82; dir = -1; }
      if (pos <= 18) { pos = 18; dir = 1; }
      setSliderPos(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoDrag]);

  const handleSliderDrag = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
    setAutoDrag(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleSliderDrag(e);
    const move = (ev) => handleSliderDrag(ev);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  return (
    <section
      id="bg-remover"
      className="relative z-10 overflow-hidden w-full"
      style={{
        background: "transparent",
        padding:
          "clamp(56px, 8vw, 96px) 0 clamp(48px, 7vw, 80px)",
      }}
    >
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[1400px] mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 sm:mb-8"
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              background: isDark ? "var(--land-bg-3)" : "#FFFFFF",
              border: `1px solid ${isDark ? "var(--land-badge-border)" : "var(--land-line)"}`,
              color: "var(--land-txt)",
              fontSize: "clamp(12px, 1.4vw, 13.5px)",
              fontWeight: 600,
            }}
          >
            <motion.span
              animate={{ rotate: [0, 15, 0, -15, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
              style={{ color: "var(--land-primary)" }}
            >
              <FaMagic style={{ fontSize: 12 }} />
            </motion.span>
            AI Powered
          </motion.div>

<motion.h1
  initial={{ opacity: 0, y: 14 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.05 }}
  className="land-font-body"
  style={{
    fontSize: "clamp(32px, 6.2vw, 88px)",
    fontWeight: 900,
    letterSpacing: "-0.045em",
    lineHeight: 1.05,
    margin: "0 0 clamp(18px, 2.6vw, 24px)",
    color: "var(--land-txt)",
  }}
>
  Cut out backgrounds
  <br />
  with one{" "}
  <span
    style={{
      display: "inline-block",
      padding: "clamp(2px, 0.6vw, 6px) clamp(10px, 1.8vw, 18px)",
      borderRadius: 14,
      background: isDark
        ? "linear-gradient(135deg, rgba(230,96,0,0.35) 0%, rgba(255,122,26,0.25) 100%)"
        : "linear-gradient(135deg, rgba(230,96,0,0.30) 0%, rgba(255,122,26,0.20) 100%)",
      color: "#e66000",
    }}
  >
    click
  </span>
</motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto"
            style={{
              fontSize: "clamp(14px, 1.7vw, 17px)",
              lineHeight: 1.6,
              color: "var(--land-txt-soft)",
              margin: "0 auto clamp(28px, 4vw, 38px)",
              maxWidth: 560,
              fontWeight: 500,
            }}
          >
            Next-gen removal, fast batch processing, transparent pricing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-12 sm:mb-16"
          >
<motion.button
  whileHover={{ y: -2, scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
  onClick={onStart}
  className="inline-flex items-center justify-center gap-2.5 font-bold"
  style={{
    padding: "clamp(13px, 1.8vw, 15px) clamp(22px, 3vw, 30px)",
    minWidth: "clamp(150px, 34vw, 180px)",
    borderRadius: 999,
    background: "#e66000",
    color: "#FFFFFF",
    border: "none",
    fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
    cursor: "pointer",
  }}
>
  Start for free
  <FaArrowRight style={{ fontSize: 12 }} />
</motion.button>
            <motion.button
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                } else if (onPricing) {
                  onPricing();
                }
              }}
              className="inline-flex items-center justify-center gap-2.5 font-semibold"
              style={{
                padding: "clamp(13px, 1.8vw, 15px) clamp(22px, 3vw, 30px)",
                minWidth: "clamp(150px, 34vw, 180px)",
                borderRadius: 999,
                background: isDark ? "var(--land-surface)" : "#FFFFFF",
                color: "var(--land-txt)",
                border: `1px solid ${isDark ? "var(--land-line-str)" : "var(--land-line)"}`,
                fontSize: "clamp(13.5px, 1.5vw, 14.5px)",
                cursor: "pointer",
                boxShadow: isDark
                  ? "0 6px 18px -10px rgba(0,0,0,0.5)"
                  : "0 6px 18px -10px rgba(0,0,0,0.12)",
              }}
            >
              View pricing
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="w-full"
            style={{
              borderRadius: "clamp(20px, 3vw, 32px)",
              padding:
                "clamp(20px, 3.5vw, 40px) clamp(16px, 3vw, 40px) clamp(24px, 4vw, 44px)",
              background: isDark
                ? "rgba(22,22,31,0.72)"
                : "rgba(255,255,255,0.85)",
              border: `1px solid var(--land-line)`,
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
            }}
          >
            <p
              className="land-font-body"
              style={{
                fontSize: "clamp(10px, 1.2vw, 12px)",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--land-txt-soft)",
                margin: "0 0 clamp(16px, 2.6vw, 22px)",
              }}
            >
              See the magic in action — drag the slider
            </p>

            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
              style={{
                position: "relative",
                width: "100%",
                margin: "0 auto",
                aspectRatio: "16/9",
                borderRadius: "clamp(14px, 2.2vw, 24px)",
                overflow: "hidden",
                cursor: "ew-resize",
                userSelect: "none",
                boxShadow: "0 8px 30px -18px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                }}
              >
                <img
                  src={PRODUCT_IMG}
                  alt="Before"
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "6%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isDark
                    ? "repeating-conic-gradient(#1F1F2C 0% 25%, #15151F 0% 50%) 50% / 22px 22px"
                    : "repeating-conic-gradient(#E5E7EB 0% 25%, #FFFFFF 0% 50%) 50% / 22px 22px",
                  clipPath: `inset(0 0 0 ${sliderPos}%)`,
                  WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
                }}
              >
                <img
                  src={PRODUCT_IMG}
                  alt="After"
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "6%",
                    boxSizing: "border-box",
                    clipPath: `inset(0 0 0 ${sliderPos}%)`,
                    WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
                  }}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${sliderPos}%`,
                  width: 2,
                  marginLeft: -1,
                  background: "#FFFFFF",
                  boxShadow: "0 0 14px rgba(0,0,0,0.3)",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${sliderPos}%`,
                  transform: "translate(-50%, -50%)",
                  width: "clamp(38px, 5.5vw, 52px)",
                  height: "clamp(38px, 5.5vw, 52px)",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 22px -6px rgba(0,0,0,0.35)",
                  zIndex: 4,
                  pointerEvents: "none",
                  color: "#e66000",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: "clamp(13px, 1.8vw, 18px)",
                    height: "clamp(13px, 1.8vw, 18px)",
                  }}
                >
                  <path d="M9 6L3 12l6 6M15 6l6 6-6 6" />
                </svg>
              </div>

              <span
                style={{
                  position: "absolute",
                  top: "clamp(10px, 1.6vw, 20px)",
                  left: "clamp(10px, 1.6vw, 20px)",
                  padding: "clamp(5px, 0.9vw, 8px) clamp(12px, 1.8vw, 20px)",
                  borderRadius: 999,
                  background: "rgba(20,20,30,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: "#FFFFFF",
                  fontSize: "clamp(11px, 1.2vw, 14px)",
                  fontWeight: 700,
                  zIndex: 5,
                }}
              >
                Before
              </span>

              <span
                style={{
                  position: "absolute",
                  top: "clamp(10px, 1.6vw, 20px)",
                  right: "clamp(10px, 1.6vw, 20px)",
                  padding: "clamp(5px, 0.9vw, 8px) clamp(12px, 1.8vw, 20px)",
                  borderRadius: 999,
                  background: "rgba(20,20,30,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: "#FFFFFF",
                  fontSize: "clamp(11px, 1.2vw, 14px)",
                  fontWeight: 700,
                  zIndex: 5,
                }}
              >
                After
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FAQ ITEM
   ═══════════════════════════════════════════════════════════════ */
const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="land-faq-item"
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <span className="text-[14.5px] sm:text-[15px] font-bold" style={{ color: "var(--land-txt)" }}>{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--land-primary-soft)", color: "var(--land-primary)" }}
        >
          <FaPlus className="text-[10px]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[13.5px] leading-relaxed" style={{ color: "var(--land-txt-soft)" }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
const Landing = () => {
  const navigate = useNavigate();
  const [audience, setAudience] = useState("individual");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    if (!demoOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDemoOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [demoOpen]);

  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => {
      const h = document.documentElement;
      setIsDark(
        h.classList.contains("theme-dark") ||
        h.classList.contains("dark") ||
        (!h.classList.contains("theme-light") &&
          (localStorage.getItem("theme") || localStorage.getItem("app-theme")) === "dark")
      );
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.5]);

  const goSignup = () => navigate("/signup");
  const goSignin = () => navigate("/signin");

  const heroCopy = {
    individual: {
      title: "Buy and sell with",
      titleItalic: "complete",
      titleAccent: "confidence",
      desc: "APNaDEAL connects you with verified sellers across Pakistan. Browse thousands of products, pay securely, and get fast delivery — all in one place",
      primaryCta: "Get Started",
      ghostCta: "Explore Classes",
    },
    company: {
      title: "Scale your business with",
      titleItalic: "unified",
      titleAccent: "commerce",
      desc: "The complete marketplace platform for growing businesses. Manage inventory, track orders, automate invoicing, and reach millions of buyers nationwide.",
      primaryCta: "Start Selling",
      ghostCta: "Book a Demo",
    },
  };
  const copy = heroCopy[audience];

  const categories = [
    { icon: FaMobileAlt, label: "Mobiles", count: "2.4K+", color: "#e66000" },
    { icon: FaLaptop, label: "Electronics", count: "1.8K+", color: "#8B5CF6" },
    { icon: FaCar, label: "Vehicles", count: "960+", color: "#EC4899" },
    { icon: FaHome, label: "Property", count: "740+", color: "#10B981" },
    { icon: FaTshirt, label: "Fashion", count: "3.1K+", color: "#F59E0B" },
    { icon: FaCouch, label: "Home & Living", count: "1.2K+", color: "#3B82F6" },
    { icon: FaBicycle, label: "Sports", count: "820+", color: "#EF4444" },
    { icon: FaGem, label: "Collectibles", count: "460+", color: "#A855F7" },
  ];

  const steps = [
    { icon: FaUserPlus, title: "Create Account", desc: "Sign up for free in under 30 seconds." },
    { icon: FaBoxOpen, title: "Browse & Order", desc: "Explore thousands of verified listings." },
    { icon: FaCreditCard, title: "Pay Securely", desc: "COD, Easypaisa, or bank transfer." },
    { icon: FaShippingFast, title: "Fast Delivery", desc: "Track live. Delivered in 2–4 days." },
  ];

  const testimonials = [
    { name: "Ahmed Khan", role: "Buyer · Lahore", text: "APNaDEAL is my go-to marketplace. Fast delivery, genuine products, and COD makes it super convenient.", rating: 5 },
    { name: "Fatima Ali", role: "Seller · Karachi", text: "As a small business owner, listing here doubled my sales in 3 months. The seller dashboard is incredibly intuitive.", rating: 5 },
    { name: "Bilal Raza", role: "Buyer · Islamabad", text: "Best prices I've found anywhere in Pakistan. Got my laptop in 2 days with free shipping. Highly recommended!", rating: 5 },
  ];

  const plans = [
    {
      id: "starter", name: "Starter", badgeIcon: FaRocket,
      tagline: "Perfect to explore the marketplace",
      priceMonthly: 0, priceYearly: 0,
      cta: "Start Free", popular: false, isFree: true,
      features: [
        { title: "5 Active Listing", desc: "Post one item at a time." },
        { title: "3 AI Images / month", desc: "Try NanoBanana image generation." },
        { title: "Live Seller Chat", desc: "Message buyers and sellers in real time." },
        { title: "Social Feed", desc: "Post, like, comment and share." },
        { title: "Escrow Checkout", desc: "Safe payments until both sides confirm." },
        { title: "Buy Any Item", desc: "Browse and purchase without limits." },
      ],
    },
    {
      id: "seller", name: "Seller", badgeIcon: FaBolt,
      tagline: "For serious sellers who want more reach",
      priceMonthly: 500, priceYearly: 5000,
      badge: "Most Popular", cta: "Upgrade to Seller",
      popular: true, isFree: false,
      features: [
        { title: "30 Active Listings", desc: "6× more than the free plan." },
        { title: "30 AI Images / month", desc: "Clean product photos without effort." },
        { title: "1 Featured Boost / month", desc: "Top of category for 7 days." },
        { title: "Verified Seller Badge", desc: "Build trust with every buyer." },
        { title: "Background Remover", desc: "One-click cut-outs for any item." },
        { title: "Priority in Search", desc: "Rank above free sellers." },
      ],
      mutedFeatures: [{ title: "Listing Analytics", desc: "Pro Seller only." }],
    },
    {
      id: "pro", name: "Pro Seller", badgeIcon: FaCrown,
      tagline: "For power sellers and dealers",
      priceMonthly: 1500, priceYearly: 15000,
      cta: "Upgrade to Pro", popular: false, isFree: false,
      features: [
        { title: "Unlimited Listings", desc: "List your whole inventory." },
        { title: "200 AI Images / month", desc: "Full AI Studio access." },
        { title: "4 Featured Boosts / month", desc: "Stay at the top." },
        { title: "Listing Analytics", desc: "Views, clicks, chats and conversions." },
        { title: "Priority Support", desc: "Chat with a human within minutes." },
        { title: "Gold Business Badge", desc: "Stand out as a verified dealer." },
      ],
    },
  ];

  const faqs = [
    { q: "How do I place my first order?", a: "Simply create a free account, browse any of our 8 categories, add items to your cart, and checkout. We accept Cash on Delivery, Easypaisa, and Bank transfers." },
    { q: "What payment methods do you accept?", a: "We accept Cash on Delivery (COD), Easypaisa mobile wallet, and direct Bank transfers. All methods are 100% secure." },
    { q: "How long does delivery take?", a: "Standard delivery takes 2-4 business days across Pakistan." },
    { q: "Can I return an item?", a: "Yes! You can return any item within 7 days of delivery for a full refund." },
    { q: "How do I become a seller?", a: "Sign up, complete KYC verification, and upgrade to a Premium plan." },
    { q: "Is my payment information safe?", a: "Absolutely. All transactions are encrypted end-to-end." },
  ];

  const stats = [
    { value: 1000, suffix: "+", label: "Active users" },
    { value: 120, suffix: "+", label: "Products sold" },
    { value: 900, suffix: "+", label: "Verified sellers" },
    { value: 4.2, suffix: "★", label: "Average rating", decimals: 1 },
  ];

  const heroAvatars = [
    "https://i.pravatar.cc/64?img=12",
    "https://i.pravatar.cc/64?img=32",
    "https://i.pravatar.cc/64?img=45",
    "https://i.pravatar.cc/64?img=68",
  ];

  const [slideIndex, setSlideIndex] = useState(0);

  const HOW_VIDEOS = [
    "https://cdn.dribbble.com/userupload/48863336/file/490b48c12b66b1c8deefcc735dd9d14c.mp4",
    "https://cdn.dribbble.com/userupload/47467403/file/ce5650b7e24f21e1316dca413e66d2b8.mp4",
    "https://cdn.dribbble.com/userupload/48769269/file/f90f9e4a9885930bcc70aaadee0d0353.mp4",
  ];
  const [howVideoIndex, setHowVideoIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHowVideoIndex((i) => (i + 1) % HOW_VIDEOS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const SLIDES = [
    { src: "https://m.media-amazon.com/images/I/417NhPd56zL._SR420,420_.jpg", alt: "AI 1", label: "AI Image Generated" },
    { src: "https://cdn.dribbble.com/userupload/48338351/file/3c4fe233e26659354e5cfe8b5895e98e.png", alt: "AI 2", label: "Video ready in 5s" },
    { src: "https://cdn.dribbble.com/userupload/46228733/file/790a678243a5ee254e192c11cbc64998.png", alt: "AI 3", label: "Background removed" },
    { src: "https://cdn.dribbble.com/userupload/47097229/file/60ff77618555fe1739c5abe217f1dca8.png", alt: "AI 5", label: "Posted to marketplace" },
  ];
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="home" className={`min-h-screen relative overflow-x-hidden land-bg land-font-body ${isDark ? "theme-dark" : "theme-light"}`}>
      <LandingStyles />

      <ScrollProgressBar />

      <ThreeShadowBackground dark={isDark} />

      <CursorGlow />

      <div className="absolute top-0 left-0 right-0 h-[100vh] min-h-[720px] pointer-events-none z-[2]">
        <VideoHeroBackground dark={isDark} />
      </div>

      <Navbar audience={audience} setAudience={setAudience} onSignup={goSignup} onSignin={goSignin} />

      {/* ═══ HERO ═══ */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-6 sm:pb-10"
      >
        <div className="flex-1 flex items-start justify-center pt-6 sm:pt-10 lg:pt-14">
          <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4 py-2 rounded-full"
              style={{
                background: isDark ? "rgba(20,20,30,0.35)" : "rgba(255,255,255,0.6)",
                border: "1px solid var(--land-nav-pill-border)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center -space-x-2.5">
                {heroAvatars.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
                    style={{ border: `2px solid ${isDark ? "#1A1A2E" : "#FFFFFF"}` }} />
                ))}
              </div>
              <div className="flex items-center gap-2 text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-[10px] sm:text-[11px]" style={{ color: "#F59E0B" }} />
                  ))}
                </div>
                <span className="text-[11px] sm:text-[12.5px] font-semibold whitespace-nowrap" style={{ color: "var(--land-txt)" }}>
                  Thousands  Already Joined
                </span>
              </div>
            </motion.div>

            <h1
              className="land-font-display font-bold tracking-tight mb-5 sm:mb-6 px-2"
              style={{
                fontSize: "clamp(40px, 8vw, 96px)",
                lineHeight: 0.98,
                color: "var(--land-txt)",
                textShadow: isDark ? "0 2px 30px rgba(0,0,0,0.6)" : "0 2px 30px rgba(255,255,255,0.6)",
              }}
            >
              <RevealWords text={copy.title} delay={0.2} />{" "}
              <motion.span
                initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="italic"
                style={{ display: "inline-block", color: "var(--land-primary)", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}
              >
                {copy.titleItalic}
              </motion.span>{" "}
              <RevealWords text={copy.titleAccent} delay={0.75} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[15px] sm:text-[17px] leading-relaxed mb-8 sm:mb-10 max-w-[620px] px-2"
              style={{ color: "var(--land-txt-soft)" }}
            >
              {copy.desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto px-4 sm:px-0"
            >
              <Magnetic strength={0.25}>
               <Magnetic strength={0.25}>
  <button onClick={() => navigate("/feed")} className="land-premium-btn-primary group w-full sm:w-auto">
    <span className="relative z-10 flex items-center gap-2.5">
      {copy.primaryCta}
      <FaArrowRight className="text-[11px] transition-transform duration-300 group-hover:translate-x-1" />
    </span>
    <span className="land-premium-btn-shine" />
  </button>
</Magnetic>
              </Magnetic>
              <button onClick={() => {}} className="land-premium-btn-ghost group w-full sm:w-auto">
                <span className="relative z-10 flex items-center gap-2.5">
                  <FaPlay className="text-[10px]" />
                  {copy.ghostCta}
                </span>
                <span className="land-premium-btn-shine" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-2"
            >
              {["Secure shopping", "Verified sellers", "Smart Ai Tools."].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-[12.5px] sm:text-[13.5px] font-medium" style={{ color: "var(--land-txt-soft)" }}>
                  <FaCheck className="text-[10px]" style={{ color: "var(--land-txt)" }} />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-auto w-full max-w-6xl mx-auto"
        >
          <div
            className="rounded-3xl p-5 sm:p-7 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            style={{
              background: isDark ? "rgba(20,20,30,0.45)" : "rgba(255,255,255,0.55)",
              border: "1px solid var(--land-nav-pill-border)",
              backdropFilter: "blur(18px) saturate(150%)",
              WebkitBackdropFilter: "blur(18px) saturate(150%)",
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
                className="text-center"
              >
                <p className="land-font-display text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--land-primary)" }}>
                  {s.decimals ? (
                    <>{s.value.toFixed(1)}{s.suffix}</>
                  ) : (
                    <Counter to={s.value} suffix={s.suffix} />
                  )}
                </p>
                <p className="text-[11px] sm:text-xs mt-1" style={{ color: "var(--land-txt-soft)" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="land-section relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[28px] p-5 sm:p-7 lg:p-9 overflow-hidden"
            style={{
              background: isDark ? "rgba(20,20,30,0.45)" : "rgba(255,255,255,0.55)",
              border: "1px solid var(--land-nav-pill-border)",
              backdropFilter: "blur(18px) saturate(150%)",
              WebkitBackdropFilter: "blur(18px) saturate(150%)",
            }}
          >
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="relative lg:hidden -mt-1 mb-2">
                <div className="relative w-full max-w-[320px] mx-auto aspect-[4/5]">
                  <div className="absolute inset-0 rounded-[24px] overflow-hidden" style={{ boxShadow: "0 20px 40px -22px rgba(0,0,0,0.35)" }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={slideIndex}
                        src={SLIDES[slideIndex].src}
                        alt={SLIDES[slideIndex].alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, x: 60, scale: 1.05 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -60, scale: 1.05 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#0A0A12" }}>
                    <FaStar className="text-[11px]" style={{ color: isDark ? "var(--land-primary)" : "#FFFFFF" }} />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[12.5px] font-bold" style={{ color: "var(--land-txt)" }}>5.0 Rated</p>
                    <p className="text-[11.5px] font-medium" style={{ color: "var(--land-txt-soft)" }}>
                      Read Our <span className="font-bold underline underline-offset-4 decoration-2" style={{ color: "var(--land-txt)" }}>Success Stories</span>
                    </p>
                  </div>
                </div>
                <h2 className="land-font-display font-bold tracking-tight mb-4 sm:mb-5 leading-[0.95]"
                  style={{ fontSize: "clamp(44px, 9vw, 96px)", color: "var(--land-txt)", letterSpacing: "-0.05em" }}>
                  Sell <span className="italic" style={{ color: "var(--land-primary)", fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>Smarter</span>
                </h2>
                <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed mb-4 sm:mb-5 max-w-[440px]" style={{ color: "var(--land-txt)" }}>
                  Post items on the marketplace in seconds with built-in AI. Generate stunning product images, create short videos, and remove backgrounds with one click — no design skills needed.
                </p>
                <ul className="space-y-2 mb-5 sm:mb-6 max-w-[440px]">
                  {[
                    { icon: FaBolt, text: "AI product image generation in seconds" },
                    { icon: FaCamera, text: "Auto-generate videos for any listing" },
                    { icon: FaGem, text: "One-click background removal" },
                    { icon: FaRocket, text: "Post & publish on the marketplace instantly" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i} className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                          <Icon className="text-[10px]" style={{ color: "var(--land-primary)" }} />
                        </div>
                        <span className="text-[12.5px] font-medium" style={{ color: "var(--land-txt-soft)" }}>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <Magnetic strength={0.2}>
                  <button onClick={() => navigate("/ai-image")}
  className="land-shimmer relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-[13px] transition-transform hover:scale-105 w-full sm:w-auto"
  style={{ background: "#0A0A12", color: "#FFFFFF" }}>
  <FaBolt className="text-[10px]" />
  Start Selling — It's Free
</button>
                  </Magnetic>
                  <button onClick={() => {}}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-[13px] transition-colors w-full sm:w-auto"
                    style={{ background: "transparent", border: "1px solid var(--land-line-str)", color: "var(--land-txt)" }}>
                    <FaArrowRight className="text-[10px]" />
                    Try AI Tools
                  </button>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative w-full max-w-[420px] mx-auto aspect-[4/5]">
                  <div className="absolute inset-0 rounded-[28px] overflow-hidden" style={{ boxShadow: "0 24px 50px -25px rgba(0,0,0,0.35)" }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={slideIndex}
                        src={SLIDES[slideIndex].src}
                        alt={SLIDES[slideIndex].alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, x: 60, scale: 1.05 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -60, scale: 1.05 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </AnimatePresence>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: -16, y: -8 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="land-float absolute top-5 -left-5 sm:-left-8 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-full shadow-lg"
                    style={{ background: "#FCD34D", color: "#1A1613" }}>
                    <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#1A1613" }}>
                      <FaBolt className="text-[9px]" style={{ color: "#FCD34D" }} />
                    </div>
                    <span className="text-[11.5px] font-bold whitespace-nowrap">AI Generated</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="land-float absolute bottom-[30%] -right-5 sm:-right-8 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-full shadow-lg"
                    style={{ background: "#FFFFFF", color: "#1A1613", animationDelay: "1s" }}>
                    <div className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#10B981" }}>
                      <FaGem className="text-[9px]" style={{ color: "#FFFFFF" }} />
                    </div>
                    <span className="text-[11.5px] font-semibold whitespace-nowrap">Background removed</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BgRemoverShowcase
        isDark={isDark}
        onStart={goSignup}
        onPricing={() => navigate("/pricing")}
      />

      {/* ═══ AI PANEL ═══ */}
      <section id="categories" className="land-section relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[32px] overflow-hidden"
            style={{
              background: isDark ? "rgba(20,20,30,0.55)" : "rgba(255,255,255,0.75)",
              border: "1px solid var(--land-nav-pill-border)",
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 85% 10%, rgba(140,60,220,0.25) 0%, transparent 45%), radial-gradient(circle at 50% 110%, rgba(40,200,200,0.25) 0%, transparent 55%)",
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-14 items-center p-6 sm:p-10 lg:p-14">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <FaBolt className="text-[10px]" style={{ color: isDark ? "#FFFFFF" : "var(--land-primary)" }} />
                  <span className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: isDark ? "#FFFFFF" : "var(--land-txt)" }}>
                    24/7 AI Workforce
                  </span>
                </div>
                <h2 className="font-extrabold tracking-[-0.03em] mb-5 leading-[1.05]"
                  style={{ fontSize: "clamp(34px, 5.2vw, 62px)", fontFamily: "'Manrope', system-ui, sans-serif", color: isDark ? "#FFFFFF" : "var(--land-txt)" }}>
                  Your AI marketplace<br />expert agent that<br />runs forever
                </h2>
                <p className="text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-[480px]"
                  style={{ color: isDark ? "rgba(255,255,255,0.65)" : "var(--land-txt-soft)" }}>
                  Post, price, and publish on APNaDEAL 24/7 — AI generates images, videos, and removes backgrounds automatically.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Magnetic strength={0.2}>
                    <button onClick={goSignup}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[14px] transition-transform hover:scale-[1.03] w-full sm:w-auto"
                      style={{ background: "linear-gradient(135deg, #6E3AFF 0%, #4B1FCC 100%)", color: "#FFFFFF", boxShadow: "0 14px 30px -12px rgba(110,58,255,0.6)" }}>
                      Start Using Agent
                    </button>
                  </Magnetic>
                  <button onClick={() => setDemoOpen(true)}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-[14px] transition-colors w-full sm:w-auto"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: isDark ? "#FFFFFF" : "var(--land-txt)" }}>
                    Watch Demo
                    <span className="h-5 w-5 rounded-full flex items-center justify-center" style={{ border: "1.5px solid rgba(255,255,255,0.55)" }}>
                      <FaPlay className="text-[7px] ml-[1px]" />
                    </span>
                  </button>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.75 }}
                className="relative"
              >
                <div className="absolute -inset-6 rounded-[36px] blur-2xl opacity-70 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(110,58,255,0.5), rgba(60,90,220,0.35), rgba(40,200,200,0.4))" }} />
                <div className="relative rounded-[24px] overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 0 0 1px rgba(110,58,255,0.25), 0 30px 60px -20px rgba(0,0,0,0.6)" }}>
                  <button type="button" onClick={() => setDemoOpen(true)} className="relative block w-full cursor-pointer group">
                    <video autoPlay muted loop playsInline preload="auto" className="w-full h-auto block aspect-[4/3] object-cover">
                      <source src="https://www.media.io/videos/ai-video-generator/tti_1.mp4" type="video/mp4" />
                    </video>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FULLSCREEN VIDEO MODAL */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-8"
            style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
            onClick={() => setDemoOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setDemoOpen(false); }}
              aria-label="Close"
              className="absolute top-5 right-5 sm:top-7 sm:right-7 h-11 w-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 z-10"
              style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", color: "#FFFFFF" }}
            >
              <FaTimes className="text-lg" />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-[1200px] aspect-video rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video autoPlay controls playsInline className="w-full h-full object-contain bg-black">
                <source src="https://cdn.dribbble.com/userupload/47510971/file/5b1096096003ebeaf9156fd7d67183cf.mp4" type="video/mp4" />
              </video>
            </motion.div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11.5px] tracking-wide" style={{ color: "rgba(255,255,255,0.45)" }}>
              Press ESC or click anywhere to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>

{/* ═══ CATEGORY ILLUSTRATION + Vehicles CTA ═══ */}
<section
  className="land-section relative z-10 px-0"
  style={{ background: "var(--land-bg-2)" }}
>
  <div className="w-full mx-auto px-4 sm:px-6 lg:px-10">
    <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 sm:mb-20">

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex justify-center lg:justify-start"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--land-primary-glow) 0%, transparent 65%)",
            filter: "blur(60px)",
            opacity: 0.35,
          }}
        />

        <img
          src="https://cdn.dribbble.com/userupload/43865763/file/original-25635eb5c3d08bc89ee616666299be18.png"
          alt="People shopping"
          className="relative w-full max-w-[460px] sm:max-w-[520px] h-auto select-none pointer-events-none"
          loading="lazy"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[520px] mx-auto lg:mx-0 text-center lg:text-left"
      >
        <div className="inline-flex items-center gap-2 mb-5">
          <span
            className="h-[2px] w-8 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #e66000 0%, #ff7a1a 100%)",
            }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "var(--land-primary)" }}
          >
            Marketplace
          </span>
        </div>

        <h2
          className="land-font-body font-black tracking-[-0.035em] mb-5 leading-[1.05]"
          style={{
            fontSize: "clamp(30px, 4.6vw, 52px)",
            color: "var(--land-txt)",
          }}
        >
          Unforgettable{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Deals
          </span>
        </h2>

        <p
          className="text-[14.5px] sm:text-[15.5px] leading-[1.75] mb-7"
          style={{ color: "var(--land-txt-soft)" }}
        >
          Products just seem to stick. That's why we curate the best listings to help
          you find exactly what you need — verified sellers, fast delivery, and full
          buyer protection. From mobiles to property, we help all buyers — young and
          old, across Pakistan — reach their goals and declare:{" "}
          <span className="font-bold" style={{ color: "var(--land-txt)" }}>
            I found it!
          </span>
        </p>

<div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">

  <Link
    to="/vehicles"
    className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-[14px] transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto"
    style={{
      background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
      color: "#FFFFFF",
      boxShadow: "none",
    }}
  >
    <FaCar className="text-[13px]" />
    Browse Vehicles
    <FaArrowRight className="text-[11px] transition-transform duration-300 group-hover:translate-x-1" />
  </Link>
<Link
  to="/browse"
  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-[14px] transition-all duration-300 w-full sm:w-auto"
  style={{
    background: "#FFFFFF",
    border: "1px solid rgba(20,20,30,0.10)",
    color: "#1A1613",
  }}
>
  See all categories
  <FaChevronRight className="text-[10px] transition-transform duration-300 group-hover:translate-x-0.5" />
</Link>
</div>
      </motion.div>
    </div>
  </div>
</section>

      {/* ═══ HOW IT WORKS — video bg ═══ */}
      <section id="how" className="relative z-10 w-full">
        <div className="relative w-full min-h-[640px] sm:min-h-[720px] lg:min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <AnimatePresence mode="sync">
              <motion.video
                key={howVideoIndex}
                autoPlay muted loop playsInline preload="auto"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={HOW_VIDEOS[howVideoIndex]} type="video/mp4" />
              </motion.video>
            </AnimatePresence>
          </div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.85) 60%, #0A0A0F 100%)" }} />
          <div className="relative w-full max-w-[1400px] mx-auto px-5 sm:px-8 py-20 text-center flex flex-col items-center">
            <p className="font-extrabold uppercase text-[11px] sm:text-[12px] tracking-[0.28em] mb-5 sm:mb-6"
              style={{ color: "#e66000" }}>How Video Works</p>
            <h3 className="text-white w-full mb-6 px-2 sm:px-4"
              style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 7.5vw, 96px)", lineHeight: 1.05, letterSpacing: "-0.04em", textShadow: "0 4px 40px rgba(0,0,0,0.45)" }}>
              <span className="block">From browse to Doorstep</span>
              <span className="block" style={{
                background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 60%, #c75200 100%)",
                WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                fontStyle: "italic", fontWeight: 800,
              }}>in 4 quick steps.</span>
            </h3>
            <p className="font-medium text-[13.5px] sm:text-[15px] md:text-[16px] leading-[1.65] max-w-[720px] mx-auto mb-8 sm:mb-10 px-4"
              style={{ color: "rgba(255,255,255,0.72)" }}>
              Simple, fast, and secure. Post your item in seconds, get matched with verified
              buyers near you, pay safely through escrow, and get it delivered to your doorstep —{" "}
              <span className="font-bold text-white">zero paperwork</span> and{" "}
              <span className="font-bold text-white">zero hidden fees.</span>
            </p>
            <Magnetic strength={0.25}>
              <button onClick={goSignup}
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full font-extrabold text-[15px] sm:text-[17px] transition-all duration-300 hover:scale-[1.05]"
                style={{ background: "linear-gradient(135deg, #ff7a1a 0%, #c75200 100%)", color: "#FFFFFF", boxShadow: "0 20px 50px -14px rgba(230,96,0,0.7)" }}>
                Generate Video
                <FaArrowRight className="text-[13px] transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </Magnetic>
          </div>
        </div>
      </section>

{/* ═══════════════════════════════════════════════════════
    SELLERS CTA — centered + iPhone mockup
   ═══════════════════════════════════════════════════════ */}
<section id="sellers" className="relative z-10 py-14 sm:py-20 lg:py-28 overflow-hidden">
  <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65 }}
      className="text-center mb-8 sm:mb-10"
    >
      <h2
        className="font-black tracking-[-0.03em] leading-[1.08] mb-5 sm:mb-6 mx-auto"
        style={{
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontSize: "clamp(26px, 4.8vw, 56px)",
          color: isDark ? "var(--land-txt)" : "#1A1613",
          maxWidth: 780,
        }}
      >
        The best way to grow your{" "}
        <span style={{ color: "#e66000" }}> business</span>
      </h2>

      <p
        className="text-[14px] sm:text-[15.5px] leading-relaxed max-w-[640px] mx-auto mb-8 px-2"
        style={{ color: isDark ? "var(--land-txt-soft)" : "#6B7280" }}
      >
        Join 10,00+ sellers reaching thousend of buyers. List unlimited products,
        track orders in real-time, and get paid instantly — all from one app.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-4">
        <button
          onClick={goSignup}
          className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-[14px] transition-all duration-300 hover:scale-[1.04] w-full sm:w-auto"
          style={{
            background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
            color: "#FFFFFF",
            boxShadow: "0 16px 34px -12px rgba(230,96,0,0.6)",
          }}
        >
          Start selling free
          <FaArrowRight className="text-[11px] transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        <a
          href="#pricing"
          className="group inline-flex items-center gap-1.5 text-[14px] font-semibold transition-colors hover:opacity-80"
          style={{ color: "#e66000" }}
        >
          See pricing
          <FaChevronRight className="text-[10px] transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>

      <p
        className="text-[11.5px] font-medium"
        style={{ color: isDark ? "var(--land-txt-faint)" : "#9CA3AF" }}
      >
        No listing fees · Cancel anytime
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 gap-y-5 mb-10 sm:mb-16"
    >
      {[
        {
          left: (
            <div
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-[9px] text-center leading-none flex-shrink-0"
              style={{ border: "2px dashed #e66000", color: "#e66000", transform: "rotate(-6deg)" }}
            >
              ★<br />4.2
            </div>
          ),
          label: "Endorsed as",
          value: "Best Seller Hub",
        },
        {
          left: (
            <div
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center font-black text-[10px] flex-shrink-0"
              style={{ background: "#1A1613", color: "#e66000" }}
            >
              ★5
            </div>
          ),
          label: "Ranked",
          value: "#1 Marketplace",
        },
        {
          left: (
            <div className="flex -space-x-2 flex-shrink-0">
              {[
                "https://i.pravatar.cc/64?img=12",
                "https://i.pravatar.cc/64?img=32",
                "https://i.pravatar.cc/64?img=45",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
                  style={{ border: `2px solid ${isDark ? "#1A1A2E" : "#FFFFFF"}` }}
                />
              ))}
            </div>
          ),
          label: "Trusted by over",
          value: "2000+ people",
        },
      ].map((badge, i) => (
        <div key={i} className="flex items-center gap-3">
          {badge.left}
          <div className="text-left">
            <p
              className="text-[11px] sm:text-[11.5px] font-medium leading-tight"
              style={{ color: isDark ? "var(--land-txt-faint)" : "#9CA3AF" }}
            >
              {badge.label}
            </p>
            <p
              className="text-[12.5px] sm:text-[13.5px] font-bold leading-tight"
              style={{ color: isDark ? "var(--land-txt)" : "#1A1613" }}
            >
              {badge.value}
            </p>
          </div>
        </div>
      ))}
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="relative w-full max-w-[720px] mx-auto"
    >

      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(230,96,0,0.35) 1.2px, transparent 1.2px)",
          backgroundSize: "14px 14px",
          maskImage: "radial-gradient(ellipse at 50% 55%, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 55%, black 0%, transparent 70%)",
          opacity: isDark ? 0.5 : 0.55,
        }}
        aria-hidden="true"
      />

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #e66000, transparent 70%)" }}
        aria-hidden="true"
      />

<div className="relative mx-auto w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[340px] md:max-w-[380px] aspect-[9/18] sm:aspect-[9/18.5] md:aspect-[9/18.5]">
        <div
          className="relative h-full w-full rounded-[40px] sm:rounded-[48px] p-[8px] sm:p-[10px] overflow-hidden"
          style={{
            background: isDark ? "#1A1A2E" : "#0F0F1A",
            boxShadow:
              "0 40px 80px -30px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.06) inset",
          }}
        >
          <div
            className="relative h-full w-full rounded-[32px] sm:rounded-[38px] overflow-hidden flex flex-col"
            style={{
              background: isDark
                ? "linear-gradient(180deg, #0F172A 0%, #0A0A12 100%)"
                : "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 sm:px-6 pt-2.5 sm:pt-3 pb-1.5 text-[9px] sm:text-[10px] font-bold flex-shrink-0"
              style={{ color: isDark ? "#FFFFFF" : "#1A1613" }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>▮▮▮</span>
                <span>◆</span>
                <span>🔋</span>
              </div>
            </div>

            <div
              className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 h-4 sm:h-5 w-16 sm:w-20 rounded-full z-20"
              style={{ background: "#0A0A0F" }}
            />

            <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #e66000, #ff7a1a)" }}
                >
                  <FaStore className="text-white text-[9px]" />
                </div>
                <span
                  className="text-[11px] font-black tracking-tight"
                  style={{ color: isDark ? "#FFFFFF" : "#1A1613" }}
                >
                  Deal<span style={{ color: "#e66000" }}>ora</span>
                </span>
                <span className="ml-auto text-[9px] font-bold" style={{ color: "#e66000" }}>
                  ● Live
                </span>
              </div>
            </div>

            <div
              className="mx-3 sm:mx-4 rounded-2xl p-2.5 sm:p-3.5 flex-shrink-0"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(20,20,30,0.06)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <FaShieldAlt className="text-[10px]" style={{ color: "#10B981" }} />
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isDark ? "#FFFFFF" : "#1A1613" }}
                >
                  Seller Active
                </span>
                <span
                  className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
                >
                  On
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "48", l: "Listings" },
                  { v: "26", l: "Orders" },
                  { v: "4.9", l: "Rating" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p
                      className="text-[13px] sm:text-[14px] font-black leading-none"
                      style={{ color: "#e66000" }}
                    >
                      {s.v}
                    </p>
                    <p
                      className="text-[7.5px] sm:text-[8px] uppercase tracking-wider mt-1 font-bold"
                      style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}
                    >
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>

<div className="px-3 sm:px-4 mt-2.5 sm:mt-3 flex-shrink-0">
  <div className="flex items-center gap-1.5 overflow-x-auto land-noscroll pb-1">
    {["All", "Vehicles", "Property", "Mobiles", "Electronics"].map((cat, i) => {
      const active = i === 0;
      return (
        <span
          key={cat}
          className="text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          style={{
            background: active
              ? "linear-gradient(135deg, #e66000, #ff7a1a)"
              : isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(20,20,30,0.05)",
            color: active
              ? "#FFFFFF"
              : isDark
              ? "rgba(255,255,255,0.6)"
              : "#6B7280",
          }}
        >
          {cat}
        </span>
      );
    })}
  </div>
</div>

<div className="px-3 sm:px-4 mt-2 sm:mt-2.5 space-y-1.5 sm:space-y-2 flex-1 overflow-hidden">

  {[
    {
      name: "Honda CD 70 2024",
      price: "Rs 145,000",
      tag: "Vehicles",
      img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "3 Bed Apartment",
      price: "Rs 2,45,00,000",
      tag: "Property",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "iPhone 15 Pro Max",
      price: "Rs 425,000",
      tag: "Mobiles",
      img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Suzuki Alto VXL",
      price: "Rs 2,850,000",
      tag: "Vehicles",
      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "MacBook Air M3",
      price: "Rs 385,000",
      tag: "Electronics",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Samsung 55\" 4K TV",
      price: "Rs 165,000",
      tag: "Electronics",
      img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=200&q=80",
    },
  ].map((p, i) => (
    <div
      key={i}
      className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl"
      style={{
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "rgba(20,20,30,0.03)",
      }}
    >
      <div
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex-shrink-0 overflow-hidden"
        style={{ background: "#F3F4F6" }}
      >
        <img
          src={p.img}
          alt={p.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] sm:text-[10.5px] font-bold truncate"
          style={{ color: isDark ? "#FFFFFF" : "#1A1613" }}
        >
          {p.name}
        </p>
        <div className="flex items-center gap-1.5">
          <p
            className="text-[8.5px] sm:text-[9px] font-bold"
            style={{ color: "#e66000" }}
          >
            {p.price}
          </p>
          <span
            className="text-[7px] font-bold px-1 py-0.5 rounded"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(20,20,30,0.05)",
              color: isDark
                ? "rgba(255,255,255,0.6)"
                : "#6B7280",
            }}
          >
            {p.tag}
          </span>
        </div>
      </div>

      <span
        className="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
        style={{ background: "rgba(230,96,0,0.15)", color: "#e66000" }}
      >
        Live
      </span>
    </div>
  ))}
</div>
            <div
              className="flex items-center justify-around py-2 sm:py-2.5 border-t flex-shrink-0"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(20,20,30,0.06)",
                background: isDark ? "#0A0A12" : "#FFFFFF",
              }}
            >
              {[FaStore, FaChartLine, FaUsers, FaCog].map((Icon, i) => {
                const active = i === 0;
                return (
                  <Icon
                    key={i}
                    className="text-[12px] sm:text-[13px]"
                    style={{
                      color: active
                        ? "#e66000"
                        : isDark
                        ? "rgba(255,255,255,0.3)"
                        : "#9CA3AF",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20, y: -10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="land-float absolute top-[14%] -left-4 xs:-left-6 sm:-left-12 z-20 rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 shadow-xl"
          style={{
            background: isDark ? "#1A1A2E" : "#FFFFFF",
            border: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(20,20,30,0.06)",
            minWidth: 120,
          }}
        >
          <p
            className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider mb-0.5"
            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}
          >
            Your Store
          </p>
          <p
            className="text-[11.5px] sm:text-[12px] font-black"
            style={{ color: isDark ? "#FFFFFF" : "#1A1613" }}
          >
            Rs 124,500
          </p>
          <p className="text-[8.5px] sm:text-[9px] font-bold mt-0.5" style={{ color: "#10B981" }}>
            ↑ +18% this week
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20, y: 10 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="land-float absolute bottom-[18%] -right-4 xs:-right-6 sm:-right-12 z-20 rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 shadow-xl"
          style={{
            background: isDark ? "#1A1A2E" : "#FFFFFF",
            border: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(20,20,30,0.06)",
            animationDelay: "1.5s",
          }}
        >
          <div className="flex items-center gap-2">
            <img
              src="https://i.pravatar.cc/64?img=12"
              alt=""
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
            />
            <div>
              <p
                className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}
              >
                New Sale
              </p>
              <p
                className="text-[10.5px] sm:text-[11px] font-black"
                style={{ color: isDark ? "#FFFFFF" : "#1A1613" }}
              >
                Rs 42,500
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </div>
</section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative z-10 py-14 sm:py-20 lg:py-24 overflow-hidden scroll-mt-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65 }}
            className="text-center mb-8 sm:mb-10"
          >
            <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: "#e66000" }}>Pricing</p>
            <h2 className="font-black tracking-[-0.03em] leading-[1.05] mb-4"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(28px, 4.8vw, 56px)", color: "var(--land-txt)" }}>
              Plans that grow <span style={{ color: "#e66000", fontStyle: "italic", fontWeight: 500 }}>with you</span>
            </h2>
            <p className="text-[14.5px] sm:text-[16px] leading-relaxed max-w-[600px] mx-auto mb-6" style={{ color: "var(--land-txt-soft)" }}>
              Sell more, faster. Start free — upgrade only when it pays off.
            </p>
          </motion.div>

          <div className="flex justify-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1 p-1 rounded-full"
              style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(20,20,30,0.04)", border: "1px solid var(--land-line)" }}>
              {[{ id: "monthly", label: "Monthly" }, { id: "yearly", label: "Yearly", badge: "Save 17%" }].map((opt) => {
                const active = billingCycle === opt.id;
                return (
                  <button key={opt.id} onClick={() => setBillingCycle(opt.id)}
                    className="relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12.5px] sm:text-[13px] font-bold transition-colors"
                    style={{
                      color: active ? "#FFFFFF" : "var(--land-txt-soft)",
                      background: active ? "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)" : "transparent",
                    }}>
                    {opt.label}
                    {opt.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: active ? "rgba(255,255,255,0.25)" : "rgba(16,185,129,0.15)", color: active ? "#FFFFFF" : "#10B981" }}>
                        {opt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch" style={{ perspective: 1200 }}>
            {plans.map((plan, i) => {
              const isPopular = plan.popular;
              const priceValue = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
              const period = billingCycle === "monthly" ? "month" : "year";
              const BadgeIcon = plan.badgeIcon;

              return (
                <TiltCard key={plan.id} max={5}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: i * 0.08, duration: 0.55 }}
                    className="relative flex flex-col rounded-[28px] overflow-hidden h-full"
                    style={{
                      background: isPopular
                        ? isDark ? "linear-gradient(135deg, rgba(230,96,0,0.10) 0%, rgba(230,96,0,0.02) 100%)" : "linear-gradient(135deg, #FFF4E0 0%, #FFFBF5 100%)"
                        : isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                      border: isPopular ? "1.5px solid #e66000" : "1px solid var(--land-line)",
                    }}
                  >
                    {plan.badge && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase tracking-wider z-10"
                        style={{ background: "linear-gradient(135deg, #e66000, #ff7a1a)", color: "#FFFFFF" }}>
                        ★ {plan.badge}
                      </span>
                    )}
                    <div className="p-6 sm:p-7 pb-2">
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: isPopular ? "linear-gradient(135deg, #e66000, #ff7a1a)" : isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                          color: isPopular ? "#FFFFFF" : "#e66000",
                        }}>
                        <BadgeIcon className="text-[18px] sm:text-[20px]" />
                      </div>
                      <h3 className="font-black text-[22px] sm:text-[26px] leading-tight mb-1" style={{ color: "var(--land-txt)" }}>{plan.name}</h3>
                      <p className="text-[12.5px] leading-snug mb-5" style={{ color: "var(--land-txt-soft)" }}>{plan.tagline}</p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-black leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(36px, 5vw, 48px)", color: "var(--land-txt)", letterSpacing: "-0.045em" }}>
                          {priceValue === 0 ? "Free" : `Rs ${priceValue.toLocaleString()}`}
                        </span>
                        {priceValue > 0 && <span className="text-[12.5px] font-semibold" style={{ color: "var(--land-txt-soft)" }}>/{period}</span>}
                      </div>
                    </div>
                    <div className="px-6 sm:px-7 pb-4 flex-1">
                      <ul className="space-y-4">
                        {plan.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <div className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: isPopular ? "linear-gradient(135deg, #e66000, #ff7a1a)" : "rgba(230,96,0,0.12)", color: isPopular ? "#FFFFFF" : "#e66000" }}>
                              <FaCheck className="text-[7px]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12.5px] sm:text-[13px] font-bold leading-snug mb-0.5" style={{ color: "var(--land-txt)" }}>{f.title}</p>
                              <p className="text-[11.5px] leading-snug" style={{ color: "var(--land-txt-soft)" }}>{f.desc}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                      <button
                        onClick={plan.isFree ? () => {} : goSignup}
                        className="group w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13.5px] font-bold transition-all duration-300 hover:scale-[1.02]"
                        style={isPopular
                          ? { background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)", color: "#FFFFFF" }
                          : { background: isDark ? "rgba(255,255,255,0.05)" : "#1A1613", color: "#FFFFFF" }}>
                        {plan.cta}
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

<section
  className="relative z-10 py-14 sm:py-20 lg:py-24 overflow-hidden"
  style={{ background: "var(--land-bg-2)" }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65 }}
      className="text-center mb-10 sm:mb-14"
    >
      <p
        className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.28em] mb-3"
        style={{ color: "#e66000" }}
      >
        Loved by users
      </p>
      <h2
        className="font-black tracking-[-0.03em] leading-[1.05] mb-4"
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "clamp(28px, 4.5vw, 52px)",
          color: "var(--land-txt)",
        }}
      >
        What our customers{" "}
        <span style={{ color: "#e66000" }}>say</span>
      </h2>
      <p
        className="text-[14.5px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto"
        style={{ color: "var(--land-txt-soft)" }}
      >
       Thousands of people are choosing APNaDEAL to discover great products, connect with sellers, and grow their businesses. Shop with confidence 
       and sell with powerful tools built for you.
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="relative rounded-3xl p-5 sm:p-8 mb-10 sm:mb-14 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(230,96,0,0.08) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(135deg, #FFF4E0 0%, #FFFFFF 100%)",
        border: isDark
          ? "1px solid rgba(230,96,0,0.15)"
          : "1px solid rgba(230,96,0,0.15)",
      }}
    >
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 items-center">

        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar key={s} className="text-[18px] sm:text-[22px]" style={{ color: "#e66000" }} />
            ))}
          </div>
          <div className="flex items-baseline gap-2 justify-center md:justify-start">
            <span
              className="font-black leading-none"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(40px, 6vw, 64px)",
                color: "var(--land-txt)",
              }}
            >
              4.9
            </span>
            <span className="text-[14px] font-semibold" style={{ color: "var(--land-txt-soft)" }}>
              / 5.0
            </span>
          </div>
          <p
            className="text-[12.5px] font-medium mt-2"
            style={{ color: "var(--land-txt-soft)" }}
          >
            Based on 24,800+ verified reviews
          </p>
        </div>

        <div className="space-y-2">
          {[
            { stars: 5, pct: 94 },
            { stars: 4, pct: 5 },
            { stars: 3, pct: 1 },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <span
                className="text-[11.5px] font-bold w-8 text-right flex-shrink-0"
                style={{ color: "var(--land-txt-soft)" }}
              >
                {row.stars}★
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(20,20,30,0.06)",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${row.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #e66000, #ff7a1a)" }}
                />
              </div>
              <span
                className="text-[11.5px] font-bold w-10 flex-shrink-0"
                style={{ color: "var(--land-txt-soft)" }}
              >
                {row.pct}%
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { v: "500+", l: "Happy users" },
            { v: "10000+", l: "Deals closed" },
            { v: "5000+", l: "Sellers" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p
                className="font-black leading-none"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: "clamp(20px, 2.8vw, 28px)",
                  color: "#e66000",
                }}
              >
                {s.v}
              </p>
              <p
                className="text-[10.5px] font-bold uppercase tracking-wider mt-1.5"
                style={{ color: "var(--land-txt-soft)" }}
              >
                {s.l}
              </p>
            </div>
          ))}
        </div>

      </div>
    </motion.div>

    <div className="mb-10 sm:mb-14 relative overflow-hidden">
      <p
        className="text-center text-[11px] font-bold uppercase tracking-[0.28em] mb-5"
        style={{ color: "var(--land-txt-faint)" }}
      >
        Trusted by teams & sellers across
      </p>

      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, var(--land-bg-2) 0%, transparent 100%)`,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(270deg, var(--land-bg-2) 0%, transparent 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="flex gap-10 sm:gap-14 marquee-track">
          {[...Array(2)].map((_, dupIdx) => (
            <div key={dupIdx} className="flex gap-10 sm:gap-14 flex-shrink-0">
              {["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"].map((city) => (
                <span
                  key={`${dupIdx}-${city}`}
                  className="text-[15px] sm:text-[17px] font-black tracking-tight whitespace-nowrap select-none"
                  style={{ color: "var(--land-txt)", opacity: 0.55 }}
                >
                  {city}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="relative rounded-3xl p-6 sm:p-10 mb-10 sm:mb-12 overflow-hidden"
      style={{
        background: "var(--land-bg-3)",
        border: "1px solid var(--land-line)",
      }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #e66000, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-start">
        <div>
          <p
            className="leading-relaxed mb-6"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(18px, 2.4vw, 26px)",
              color: "var(--land-txt)",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
          APNaDeal completely changed how I run my property business. I list apartments in seconds with the AI tools, chat with buyers instantly,
           and close deals the same week — I've tripled my sales in 3 months.
          </p>

          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/80?img=12"
              alt="Fatima Ali"
              className="h-12 w-12 rounded-full object-cover"
              style={{ border: "2px solid #e66000" }}
              loading="lazy"
            />
            <div>
              <p
                className="text-[14px] font-black leading-tight"
                style={{ color: "var(--land-txt)" }}
              >
                Fatima Ali
              </p>
              <p
                className="text-[12px] font-medium leading-tight"
                style={{ color: "var(--land-txt-soft)" }}
              >
                Verified Seller · Karachi
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 sm:p-5 flex-shrink-0 lg:w-52"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
            border: "1px solid var(--land-line)",
          }}
        >
          <p
            className="text-[10.5px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--land-txt-soft)" }}
          >
            This month
          </p>
          <p
            className="font-black leading-none mb-1"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "32px",
              color: "#e66000",
            }}
          >
            +240%
          </p>
          <p className="text-[11.5px] font-semibold" style={{ color: "#10B981" }}>
            ↑ sales growth
          </p>

          <div
            className="mt-4 pt-4"
            style={{ borderTop: "1px solid var(--land-line)" }}
          >
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar key={s} className="text-[10px]" style={{ color: "#e66000" }} />
              ))}
            </div>
            <p className="text-[10.5px] font-medium" style={{ color: "var(--land-txt-soft)" }}>
              Seller rating
            </p>
          </div>
        </div>
      </div>
    </motion.div>

<div
  className="
    tm-scroll
    flex md:grid md:grid-cols-3
    gap-4 sm:gap-5 md:gap-5
    md:overflow-visible
    snap-x snap-mandatory
    pb-3 md:pb-0
  "
>
  {testimonials.map((t, i) => (
    <motion.div
      key={t.name}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: i * 0.1, duration: 0.55 }}
      whileHover={{ y: -6 }}
      className="
        relative rounded-2xl p-5 sm:p-6
        transition-shadow duration-300
        flex-shrink-0
        w-[82vw] xs:w-[74vw] sm:w-[56vw] md:w-auto
        snap-center md:snap-align-none
      "
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
        border: "1px solid var(--land-line)",
        boxShadow: isDark
          ? "0 6px 24px -14px rgba(0,0,0,0.5)"
          : "0 6px 24px -14px rgba(20,20,30,0.08)",
      }}
    >
      <p
        className="text-[13.5px] leading-relaxed mb-5"
        style={{ color: "var(--land-txt)" }}
      >
        {t.text}
      </p>

      <div className="flex items-center gap-1 mb-4">
        {[...Array(t.rating)].map((_, idx) => (
          <FaStar key={idx} className="text-[11px]" style={{ color: "#e66000" }} />
        ))}
      </div>

      <div
        className="flex items-center gap-3 pt-4"
        style={{ borderTop: "1px solid var(--land-line)" }}
      >
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center font-black text-[13px] flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #e66000, #ff7a1a)",
            color: "#FFFFFF",
          }}
        >
          {t.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-bold truncate"
            style={{ color: "var(--land-txt)" }}
          >
            {t.name}
          </p>
          <p
            className="text-[11px] truncate"
            style={{ color: "var(--land-txt-soft)" }}
          >
            {t.role}
          </p>
        </div>

        <span
          className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold"
          style={{
            background: "rgba(16,185,129,0.12)",
            color: "#10B981",
          }}
        >
          ✓ Verified
        </span>
      </div>
    </motion.div>
  ))}
</div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.55 }}
      className="text-center mt-10 sm:mt-14"
    >
      <p
        className="text-[13.5px] sm:text-[14.5px] font-semibold mb-4"
        style={{ color: "var(--land-txt-soft)" }}
      >
        Join thousands of happy buyers & sellers today
      </p>
      <button
        onClick={goSignup}
        className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-bold text-[13.5px] transition-all duration-300 hover:scale-[1.04]"
        style={{
          background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
          color: "#FFFFFF",
          boxShadow: "0 14px 30px -12px rgba(230,96,0,0.6)",
        }}
      >
        Create free account
        <FaArrowRight className="text-[11px] transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </motion.div>

  </div>

  <style>{`
    @keyframes testimonials-marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track {
      width: max-content;
      animation: testimonials-marquee 30s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }
    @media (prefers-reduced-motion: reduce) {
      .marquee-track { animation: none; }
    }
  `}</style>
</section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="land-section relative z-10 px-4 sm:px-6 lg:px-8" style={{ background: "var(--land-bg-2)" }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeader label="FAQ" title="Questions? We've got answers" subtitle="Everything you need to know about buying and selling on APNaDEAL." />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden"
          >
            <div className="absolute inset-0" style={{ background: isDark ? "linear-gradient(135deg, #0F0F1A 0%, #0A0A12 100%)" : "linear-gradient(135deg, #1A1613 0%, #0F0F1A 100%)" }} />
            <div className="relative px-6 sm:px-10 lg:px-16 py-14 sm:py-16 lg:py-20 text-center">
              <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.28em] mb-5" style={{ color: "#e66000" }}>Get started today</p>
                 <h3 className="text-white w-full mb-6 px-2 sm:px-4"
              style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 7.5vw, 96px)", lineHeight: 1.05, letterSpacing: "-0.04em", textShadow: "0 4px 40px rgba(0,0,0,0.45)" }}>
              <span className="block">  Ready to start </span>
              <span className="block" style={{
                background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 60%, #c75200 100%)",
                WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
                fontStyle: "italic", fontWeight: 800,
              }}> Journey?</span>
            </h3>
              <p className="text-[14px] sm:text-[16px] leading-relaxed max-w-[560px] mx-auto mb-9 sm:mb-10" style={{ color: "rgba(255,255,255,0.62)" }}>
                Join over 1,0000 users on Pakistan's fastest-growing marketplace. Sign up free — no credit card needed.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8 sm:mb-10">
                <Magnetic strength={0.25}>
                  <button onClick={goSignup}
                    className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-[14px] sm:text-[15px] transition-all duration-300 hover:scale-[1.04] w-full sm:w-auto"
                    style={{ background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)", color: "#FFFFFF", boxShadow: "0 16px 40px -14px rgba(230,96,0,0.6)" }}>
                    Create free account
                    <FaArrowRight className="text-[11px]" />
                  </button>
                </Magnetic>
                <button onClick={goSignin}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14px] sm:text-[15px] transition-colors w-full sm:w-auto"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#FFFFFF" }}>
                  Sign in
                </button>
              </div>
              <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {["Free forever plan", "No credit card required", "Cancel anytime"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-[11.5px] sm:text-[12.5px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <FaCheckCircle className="text-[11px]" style={{ color: "#e66000" }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

{/* ═══ FOOTER ═══ */}
<footer
  className="relative z-10 border-t land-safe-bottom"
  style={{ borderColor: "var(--land-line)", background: "var(--land-bg)" }}
>
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">

      <div className="col-span-2 sm:col-span-4 lg:col-span-2">
      <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
  <div
    className="logo-inner"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <img
      src="/logo.png"
      alt="Dealora"
      className="h-10 sm:h-10 w-auto rounded-full object-contain"
    />
  </div>

</Link>

        <p
          className="text-[13px] leading-relaxed mb-5 max-w-xs"
          style={{ color: "var(--land-txt-soft)" }}
        >
        Fastest-growing marketplace. Post your ad Right now
           AI handles everything, and your item sells Fast.
        </p>

        <div className="space-y-2 mb-5">
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--land-txt-soft)" }}
          >
            <FaEnvelope className="text-[11px]" style={{ color: "var(--land-primary)" }} />
            <span>contact@APNaDEAL.com</span>
          </div>
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--land-txt-soft)" }}
          >
            <FaPhone className="text-[11px]" style={{ color: "var(--land-primary)" }} />
            <span>+92 314 0972575</span>
          </div>
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--land-txt-soft)" }}
          >
            <FaMapMarkerAlt className="text-[11px]" style={{ color: "var(--land-primary)" }} />
            <span>Islamabad Bahria, Pakistan</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { Icon: FaFacebook,  label: "Facebook" },
            { Icon: FaTiktok,    label: "TikTok" },
            { Icon: FaYoutube,   label: "YouTube" },
            { Icon: FaInstagram, label: "Instagram" },
          ].map(({ Icon, label }, i) => (
            <a
              key={i}
              href="#"
              aria-label={label}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                border: "1px solid var(--land-line-str)",
                color: "var(--land-txt-soft)",
              }}
            >
              <Icon className="text-[11px]" />
            </a>
          ))}
        </div>
      </div>

      {[
        {
          title: "Marketplace",
          links: [
            { name: "Vehicles",    path: "/vehicles" },
            { name: "Mobiles",     path: "/mobiles" },
            { name: "Property",    path: "/property" },
            { name: "Electronics", path: "/electronics" },
          ],
        },
        {
          title: "Company",
          links: [
            { name: "About Us",        path: "/about" },
            { name: "Post Your Ad",    path: "/post-ad" },
            { name: "Browse Listings", path: "/browse" },
            { name: "Contact",         path: "/contact" },
          ],
        },
        {
          title: "Legal",
          links: [
            { name: "Privacy Policy",   path: "/privacy" },
            { name: "Terms of Service", path: "/terms" },
            { name: "Cookie Policy",    path: "/cookies" },
            { name: "Disclaimer",       path: "/disclaimer" },
          ],
        },
      ].map((col) => (
        <div key={col.title}>
          <h4
            className="text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ color: "var(--land-txt)" }}
          >
            {col.title}
          </h4>
          <ul className="space-y-2.5">
            {col.links.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="text-[13px] transition-colors"
                  style={{ color: "var(--land-txt-soft)" }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div
      className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
      style={{ borderColor: "var(--land-line)" }}
    >
      <p className="text-[11px]" style={{ color: "var(--land-txt-faint)" }}>
        © {new Date().getFullYear()}{" "}
        <span className="font-bold" style={{ color: "var(--land-txt)" }}>
          APNaDEAL
        </span>{" "}
        Marketplace. All rights reserved.
      </p>
      <div className="flex items-center gap-5 text-[11px]">
        <Link to="/privacy" style={{ color: "var(--land-txt-faint)" }}>Privacy</Link>
        <Link to="/terms"   style={{ color: "var(--land-txt-faint)" }}>Terms</Link>
        <Link to="/cookies" style={{ color: "var(--land-txt-faint)" }}>Cookies</Link>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Landing;