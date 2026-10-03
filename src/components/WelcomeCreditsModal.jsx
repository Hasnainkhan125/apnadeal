// src/components/WelcomeCreditsModal.jsx — Modern welcome / congrats credits modal
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCoins, FaTimes, FaRocket, FaCheck, FaCrown, FaMagic } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";

/* ═══════════════════════════════════════════════════════════════
   CONFETTI — lightweight, no external deps
   ═══════════════════════════════════════════════════════════════ */
const Confetti = ({ active }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["#eb7d34", "#f59e0b", "#fbbf24", "#22d3ee", "#a78bfa", "#34d399"];
    const next = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.9,
      duration: 2.2 + Math.random() * 1.6,
      color: colors[i % colors.length],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 120,
    }));
    setPieces(next);
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -30, opacity: 0, rotate: 0 }}
          animate={{
            y: "110%",
            x: p.drift,
            opacity: [0, 1, 1, 0],
            rotate: p.rotate + 360,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.size / 3,
            boxShadow: `0 0 8px ${p.color}88`,
          }}
        />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN MODAL
   ═══════════════════════════════════════════════════════════════ */
const WelcomeCreditsModal = ({
  isOpen,
  onClose,
  credits = 10,
  userName = "",
  onPrimaryAction,
  onSecondaryAction,
}) => {
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

  const isLight = theme === "light";

  const T = isLight
    ? {
        panel: "#FFFFFF",
        panel2: "#F8F7FC",
        line: "rgba(20,20,40,0.08)",
        lineStrong: "rgba(20,20,40,0.14)",
        txt: "#0F0D1A",
        txtSoft: "rgba(15,13,26,0.62)",
        txtFaint: "rgba(15,13,26,0.42)",
        primary: "#eb7d34",
        primary2: "#f59e0b",
        primarySoft: "rgba(235,125,52,0.10)",
        primaryGlow: "rgba(235,125,52,0.40)",
        overlay: "rgba(15,13,26,0.55)",
      }
    : {
        panel: "#16161F",
        panel2: "#1C1C28",
        line: "rgba(255,255,255,0.07)",
        lineStrong: "rgba(255,255,255,0.14)",
        txt: "#FFFFFF",
        txtSoft: "rgba(255,255,255,0.66)",
        txtFaint: "rgba(255,255,255,0.44)",
        primary: "#eb7d34",
        primary2: "#f59e0b",
        primarySoft: "rgba(235,125,52,0.14)",
        primaryGlow: "rgba(235,125,52,0.45)",
        overlay: "rgba(0,0,0,0.78)",
      };

  /* Lock body scroll while open */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  /* Escape to close */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const firstName = (userName || "").trim().split(" ")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome credits reward"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: T.overlay,
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          {/* ═══ MODAL CARD ═══ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 460,
              maxHeight: "calc(100vh - 32px)",
              overflow: "hidden",
              borderRadius: 24,
              background: T.panel,
              border: `1px solid ${T.line}`,
              boxShadow: isLight
                ? "0 40px 80px -20px rgba(15,13,26,0.28), 0 0 0 1px rgba(20,20,40,0.04)"
                : "0 40px 100px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* Confetti layer */}
            <Confetti active={isOpen} />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 10,
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: isLight ? "rgba(15,13,26,0.06)" : "rgba(255,255,255,0.08)",
                color: T.txtSoft,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isLight
                  ? "rgba(15,13,26,0.10)"
                  : "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isLight
                  ? "rgba(15,13,26,0.06)"
                  : "rgba(255,255,255,0.08)";
              }}
            >
              <FaTimes style={{ fontSize: 12 }} />
            </button>

            {/* ═══ HEADER ═══ */}
            <div
              style={{
                position: "relative",
                padding: "32px 24px 24px",
                background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 55%, #fbbf24 100%)`,
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              {/* Radial glow */}
              <div
                style={{
                  position: "absolute",
                  top: -120,
                  right: -80,
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -100,
                  left: -60,
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />

              {/* Animated coin badge */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.15,
                  }}
                  style={{
                    position: "relative",
                    width: 96,
                    height: 96,
                  }}
                >
                  {/* Pulsing halo */}
                  <motion.span
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      inset: -12,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 65%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Coin circle */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #fff 0%, #fef3c7 40%, #fbbf24 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 12px 32px -8px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(180,83,9,0.25), inset 0 4px 10px rgba(255,255,255,0.6)",
                      border: "3px solid rgba(255,255,255,0.85)",
                    }}
                  >
                    <FaCoins
                      style={{
                        fontSize: 42,
                        color: "#b45309",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                      }}
                    />
                  </div>

                  {/* Sparkles */}
                  {[0, 1, 2, 3].map((i) => {
                    const angle = (i / 4) * Math.PI * 2;
                    const radius = 60;
                    return (
                      <motion.span
                        key={i}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.2, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: -7,
                          marginLeft: -7,
                          transform: `translate(${Math.cos(angle) * radius}px, ${
                            Math.sin(angle) * radius
                          }px)`,
                          color: "#fff",
                          fontSize: 14,
                          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
                          pointerEvents: "none",
                        }}
                      >
                        <FaMagic />
                      </motion.span>
                    );
                  })}
                </motion.div>
              </div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                  color: "#fff",
                  margin: "0 0 8px",
                  lineHeight: 1.1,
                  textShadow: "0 2px 12px rgba(0,0,0,0.25)",
                }}
              >
                {firstName ? `Congrats, ${firstName}!` : "Congrats!"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                You've received your welcome bonus
              </motion.p>
            </div>

            {/* ═══ CREDITS AMOUNT ═══ */}
            <div
              style={{
                padding: "20px 24px 0",
                textAlign: "center",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: T.primarySoft,
                  border: `1px solid ${T.primary}44`,
                  boxShadow: `0 4px 20px -6px ${T.primaryGlow}`,
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  +{credits}
                </motion.span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: T.primary,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  credits
                </span>
              </motion.div>
            </div>

            {/* ═══ BENEFITS ═══ */}
            <div
              style={{
                padding: "20px 24px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { icon: FaWandMagicSparkles, label: "Generate AI images instantly" },
                { icon: FaRocket, label: "10 credits per image" },
                { icon: FaCrown, label: "Unlock premium tools anytime" },
              ].map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: T.panel2,
                    border: `1px solid ${T.line}`,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: T.primarySoft,
                      border: `1px solid ${T.primary}33`,
                      color: T.primary,
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ fontSize: 12 }} />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.txt,
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ═══ ACTION BUTTONS ═══ */}
            <div
              style={{
                padding: "16px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <motion.button
                type="button"
                onClick={() => {
                  onPrimaryAction?.();
                  onClose?.();
                }}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  position: "relative",
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                  border: "none",
                  color: "#fff",
                  fontSize: 14.5,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  letterSpacing: "-0.005em",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: `0 10px 30px -10px ${T.primaryGlow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  overflow: "hidden",
                }}
              >
                {/* Shimmer sweep */}
                <motion.span
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 2,
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "55%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    transform: "skewX(-20deg)",
                    pointerEvents: "none",
                  }}
                />
                <FaWandMagicSparkles style={{ fontSize: 13, position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Start Creating</span>
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  onSecondaryAction?.();
                  onClose?.();
                }}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "transparent",
                  border: `1px solid ${T.lineStrong}`,
                  color: T.txtSoft,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.panel2;
                  e.currentTarget.style.color = T.txt;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = T.txtSoft;
                }}
              >
                <FaCheck style={{ fontSize: 11 }} />
                Got it, thanks
              </button>

              <p
                style={{
                  margin: "6px 0 0",
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.txtFaint,
                  lineHeight: 1.5,
                }}
              >
                Your credits never expire · Use them at your own pace
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeCreditsModal;