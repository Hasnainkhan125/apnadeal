// src/components/ManualPaymentModal.jsx
// Modern two-column subscription checkout — fully responsive + theme-aware
// ⭐ Brand color: #e66000
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaCloudUploadAlt, FaCheckCircle, FaCheck, FaCopy,
  FaUniversity, FaMobileAlt, FaWallet, FaKey, FaSpinner, FaLock,
  FaBoxOpen, FaCrown, FaShieldAlt, FaChevronDown, FaChevronRight,
  FaPaperPlane, FaGift, FaClock, FaBell, FaTicketAlt, FaCreditCard,
  FaMapMarkerAlt, FaArrowLeft, FaInfoCircle, FaBolt, FaStar,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { uploadReceiptImage, saveManualPayment } from "../lib/manualPayments";
import { normalizePlanId } from "../lib/plans";
import { useAuth } from "../contexts/AuthContext";


/* ═══════════════════════════════════════════════════════════════
   STYLES — Brand palette #e66000
   ═══════════════════════════════════════════════════════════════ */
const PaymentStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    .mp-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }

    .mp-theme-dark {
      --mp-bg: #0A0A12;
      --mp-panel: #111119;
      --mp-panel-alt: #181822;
      --mp-surface: rgba(255,255,255,0.04);
      --mp-surface-2: rgba(255,255,255,0.02);
      --mp-line: rgba(255,255,255,0.08);
      --mp-line-str: rgba(255,255,255,0.16);
      --mp-txt: #FFFFFF;
      --mp-txt-soft: rgba(255,255,255,0.68);
      --mp-txt-faint: rgba(255,255,255,0.45);
      --mp-primary: #e66000;
      --mp-primary-2: #ff7a1a;
      --mp-primary-3: #c75200;
      --mp-primary-soft: rgba(230,96,0,0.14);
      --mp-primary-glow: rgba(230,96,0,0.45);
      --mp-success: #22c55e;
      --mp-success-soft: rgba(34,197,94,0.10);
      --mp-success-brd: rgba(34,197,94,0.30);
      --mp-danger: #ef4444;
      --mp-danger-soft: rgba(239,68,68,0.08);
      --mp-danger-brd: rgba(239,68,68,0.30);
      --mp-blue: #3b82f6;
      --mp-blue-soft: rgba(59,130,246,0.10);
      --mp-shadow: 0 20px 60px -20px rgba(0,0,0,0.7);

      --mp-left-bg: linear-gradient(160deg, #2A0F00 0%, #0A0A12 100%);
      --mp-left-txt: #FFFFFF;
      --mp-left-txt-soft: rgba(255,255,255,0.72);
      --mp-left-line: rgba(255,255,255,0.10);
      --mp-left-surface: rgba(255,255,255,0.08);
      --mp-left-panel: rgba(255,255,255,0.06);
    }

    .mp-theme-light {
      --mp-bg: #F5F6F8;
      --mp-panel: #FFFFFF;
      --mp-panel-alt: #F8F9FB;
      --mp-surface: rgba(0,0,0,0.03);
      --mp-surface-2: rgba(0,0,0,0.02);
      --mp-line: rgba(20,20,30,0.08);
      --mp-line-str: rgba(20,20,30,0.16);
      --mp-txt: #0F1117;
      --mp-txt-soft: rgba(15,17,23,0.65);
      --mp-txt-faint: rgba(15,17,23,0.45);
      --mp-primary: #e66000;
      --mp-primary-2: #ff7a1a;
      --mp-primary-3: #c75200;
      --mp-primary-soft: rgba(230,96,0,0.10);
      --mp-primary-glow: rgba(230,96,0,0.35);
      --mp-success: #16a34a;
      --mp-success-soft: rgba(22,163,74,0.08);
      --mp-success-brd: rgba(22,163,74,0.25);
      --mp-danger: #dc2626;
      --mp-danger-soft: rgba(220,38,38,0.06);
      --mp-danger-brd: rgba(220,38,38,0.25);
      --mp-blue: #2563eb;
      --mp-blue-soft: rgba(37,99,235,0.08);
      --mp-shadow: 0 20px 60px -20px rgba(0,0,0,0.15);

      --mp-left-bg: linear-gradient(160deg, #2A0F00 0%, #0A0A12 100%);
      --mp-left-txt: #FFFFFF;
      --mp-left-txt-soft: rgba(255,255,255,0.72);
      --mp-left-line: rgba(255,255,255,0.10);
      --mp-left-surface: rgba(255,255,255,0.08);
      --mp-left-panel: rgba(255,255,255,0.06);
    }

    .mp-input:focus, input.mp-input:focus {
      border-color: var(--mp-primary) !important;
      box-shadow: 0 0 0 3px var(--mp-primary-soft) !important;
    }
    .mp-btn-hover:hover { transform: translateY(-1px); }
    .mp-btn-hover:active { transform: translateY(0) scale(0.99); }

    .mp-scroll::-webkit-scrollbar { width: 6px; }
    .mp-scroll::-webkit-scrollbar-track { background: transparent; }
    .mp-scroll::-webkit-scrollbar-thumb {
      background: var(--mp-line-str);
      border-radius: 3px;
    }
    .mp-scroll::-webkit-scrollbar-thumb:hover { background: var(--mp-txt-faint); }

    @keyframes mpShine {
      0% { transform: translateX(-150%) skewX(-16deg); }
      100% { transform: translateX(450%) skewX(-16deg); }
    }
    .mp-cta-shine::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
      transform: translateX(-150%) skewX(-16deg);
      pointer-events: none;
    }
    .mp-cta-shine:hover::after { animation: mpShine 0.9s ease; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const PKR_TO_USD = 1 / 278;
const formatPrice = (pricePKR, currency = "PKR") => {
  if (currency === "USD") return `$${(pricePKR * PKR_TO_USD).toFixed(2)}`;
  return `PKR ${Number(pricePKR || 0).toLocaleString()}`;
};

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    m.addEventListener ? m.addEventListener("change", onChange) : m.addListener(onChange);
    return () => {
      m.removeEventListener ? m.removeEventListener("change", onChange) : m.removeListener(onChange);
    };
  }, [query]);
  return matches;
};

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    const h = document.documentElement;
    return (
      h.classList.contains("theme-dark") ||
      h.classList.contains("dark") ||
      (!h.classList.contains("theme-light") &&
        (localStorage.getItem("theme") || localStorage.getItem("app-theme")) === "dark")
    );
  });

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

  return isDark;
};

const useCountdown = (initialSeconds) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => { setSeconds(initialSeconds); }, [initialSeconds]);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { seconds, mm, ss };
};

/* ═══════════════════════════════════════════════════════════════
   PROMO OVERLAY
   ═══════════════════════════════════════════════════════════════ */
function PromoOverlay({ isOpen, onClose, onApply, isMobile, isSmallMobile }) {
  const { mm, ss } = useCountdown(2 * 60 + 30);
  const digits = [
    { label: "0" }, { label: "0" }, { label: ":" },
    { label: mm[0] }, { label: mm[1] }, { label: ":" },
    { label: ss[0] }, { label: ss[1] },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 2100,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: isSmallMobile ? 12 : 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative", width: "100%", maxWidth: 800,
              maxHeight: "calc(100% - 24px)", overflow: "hidden",
              borderRadius: 24,
              background: "linear-gradient(135deg, #2A0F00 0%, #6B2900 45%, #C75200 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <button
              onClick={onClose} type="button" aria-label="Close"
              style={{
                position: "absolute", top: 16, right: 16,
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.20)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 5,
              }}
            >
              <FaTimes style={{ fontSize: 14 }} />
            </button>

            <div style={{
              padding: isSmallMobile ? "32px 24px 28px" : isMobile ? "40px 32px 32px" : "48px 40px 40px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              position: "relative", zIndex: 2,
            }}>
              <h3 style={{
                fontSize: isSmallMobile ? 36 : isMobile ? 44 : 52,
                fontWeight: 900, letterSpacing: "-0.03em",
                color: "#fff", margin: "0 0 12px", lineHeight: 1,
              }}>
                30% OFF
              </h3>
              <p style={{
                fontSize: isSmallMobile ? 15 : 17, fontWeight: 700,
                color: "#fff", margin: "0 0 8px", lineHeight: 1.4,
              }}>
                Wait! You left something behind...
              </p>
              <p style={{
                fontSize: isSmallMobile ? 13 : 14,
                color: "rgba(255,255,255,0.75)",
                margin: "0 0 24px", lineHeight: 1.6, maxWidth: 320,
              }}>
                Complete your purchase today to instantly unlock your exclusive 30% discount
              </p>

              <div style={{ display: "flex", gap: isSmallMobile ? 6 : 8, marginBottom: 24 }}>
                {digits.map((d, i) =>
                  d.label === ":" ? (
                    <div key={i} style={{
                      color: "#fff", fontSize: isSmallMobile ? 24 : 32,
                      fontWeight: 900, alignSelf: "center", padding: "0 2px",
                    }}>:</div>
                  ) : (
                    <div key={i} style={{
                      minWidth: isSmallMobile ? 36 : 44,
                      padding: isSmallMobile ? "8px 8px" : "10px 12px",
                      borderRadius: 10, background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff", fontSize: isSmallMobile ? 20 : 24,
                      fontWeight: 900, textAlign: "center",
                      fontVariantNumeric: "tabular-nums",
                      boxShadow: "0 4px 12px -4px rgba(0,0,0,0.5)",
                    }}>{d.label}</div>
                  )
                )}
              </div>

              <button
                type="button" onClick={onApply}
                className="mp-btn-hover"
                style={{
                  position: "relative", width: "100%", maxWidth: 360,
                  padding: isSmallMobile ? "16px 24px" : "18px 28px",
                  borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                  color: "#fff", fontSize: isSmallMobile ? 15 : 16,
                  fontWeight: 900, fontFamily: "inherit",
                  letterSpacing: "-0.005em", cursor: "pointer",
                  boxShadow: "0 12px 30px -10px rgba(230,96,0,0.7), inset 0 1px 0 rgba(255,255,255,0.25)",
                  overflow: "hidden",
                  transition: "transform 0.15s ease",
                }}
              >
                Apply and checkout
              </button>
            </div>

            <div style={{
              position: "relative", minHeight: isMobile ? 200 : "auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              <img
                src="https://vapps-res.media.io/mediaai/app_static/unclaimed-product.png"
                alt=""
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                  display: "block", pointerEvents: "none", userSelect: "none",
                }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAYMENT METHODS
   ═══════════════════════════════════════════════════════════════ */
const PAYMENT_METHODS = [
  {
    id: "jazzcash", label: "JazzCash", short: "Jazz Cash",
    icon: FaWallet, logo: "/jazcash.png",
    accountName: "Hasnain Ahmad", accountNumber: "0314-0972575",
    color: "#c8102e",
  },
  {
    id: "easypaisa", label: "Easypaisa", short: "easypaisa",
    icon: FaMobileAlt, logo: "/esypaisa.png",
    accountName: "Hasnain Hamid", accountNumber: "0314-0972575",
    color: "#16a34a",
  },
  {
    id: "bank", label: "Bank Transfer", short: "Bank",
    icon: FaUniversity, logo: "/meezan.png",
    accountName: "Hasnain Ahmad", accountNumber: "00300116164743",
    extra: "Meezan Bank", color: "#2563eb",
  },
];

const PROMO_CODES = {
  apnadeal10: { discount: 0.10, label: "10% OFF" },
  apnadeal20: { discount: 0.20, label: "20% OFF" },
  apnadeal30: { discount: 0.30, label: "30% OFF" },
  welcome50:  { discount: 0.50, label: "50% OFF" },
};

const DEFAULT_FEATURES = [
  { label: "AI Image Generation" }, { label: "AI Chat" },
  { label: "Background Removal" },  { label: "AI Upscaler" },
  { label: "Smart Auto-Reply" },    { label: "Photo Restoration" },
];

/* ═══════════════════════════════════════════════════════════════
   PAYMENT LOGO
   ═══════════════════════════════════════════════════════════════ */
function PaymentLogo({ method, size = 32 }) {
  const [imgError, setImgError] = useState(false);
  const Icon = method.icon;
  if (imgError || !method.logo) {
    return <Icon style={{ fontSize: size * 0.55, color: method.color }} />;
  }
  return (
    <img
      src={method.logo}
      alt={method.label}
      onError={() => setImgError(true)}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL ROW
   ═══════════════════════════════════════════════════════════════ */
function DetailRow({ label, value, onCopy, mono = false, isLast = false }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopy?.(); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, padding: "12px 0",
      borderBottom: isLast ? "none" : "1px solid var(--mp-line)",
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--mp-txt-faint)", marginBottom: 5,
        }}>{label}</div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: "var(--mp-txt)",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : "inherit",
          letterSpacing: mono ? "0.02em" : "normal", wordBreak: "break-all",
        }}>{value}</div>
      </div>
      {onCopy && (
        <button type="button" onClick={handleCopy}
          className="mp-btn-hover"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 12px", borderRadius: 9,
            background: copied ? "var(--mp-success-soft)" : "var(--mp-surface)",
            border: `1px solid ${copied ? "var(--mp-success-brd)" : "var(--mp-line)"}`,
            color: copied ? "var(--mp-success)" : "var(--mp-txt-soft)",
            fontSize: 12, fontWeight: 800, fontFamily: "inherit",
            cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
            transition: "all 0.2s ease",
          }}>
          {copied ? <FaCheckCircle style={{ fontSize: 10 }} /> : <FaCopy style={{ fontSize: 10 }} />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUCCESS STATE
   ═══════════════════════════════════════════════════════════════ */
function SuccessState({ mode, credits, onClose }) {
  if (mode === "pending") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 100, height: 100 }}>
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--mp-success)" }} />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--mp-primary)" }} />
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16 }}
            style={{
              position: "absolute", inset: 14, borderRadius: "50%",
              background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 16px 40px -12px rgba(230,96,0,0.5)",
            }}>
            <motion.div animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}>
              <FaBell style={{ fontSize: 34, color: "#fff" }} />
            </motion.div>
          </motion.div>
        </div>

        <div style={{ fontSize: 24, fontWeight: 900, color: "var(--mp-txt)", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          Request sent successfully
        </div>

        <div style={{ fontSize: 15, color: "var(--mp-txt-soft)", lineHeight: 1.6, padding: "0 8px" }}>
          You'll receive{" "}
          <strong style={{ color: "var(--mp-txt)", fontWeight: 800 }}>
            Premium + {Number(credits).toLocaleString()} credits
          </strong>{" "}
          <strong style={{ color: "#4ade80", fontWeight: 800 }}>within 2 hours</strong>{" "}
          after our team verifies your payment.
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 18px", borderRadius: 12,
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.20)",
        }}>
          <FaClock style={{ fontSize: 16, color: "#4ade80", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--mp-txt-soft)", textAlign: "left", lineHeight: 1.4 }}>
            Usually approved within 2 hours during business hours.
          </span>
        </div>

        <p style={{ fontSize: 12, color: "var(--mp-txt-faint)", marginTop: 8, fontWeight: 500 }}>
          Closing automatically…
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--mp-success) 0%, #16a34a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 20px 50px -16px var(--mp-success)",
      }}>
        <FaCheckCircle style={{ fontSize: 44, color: "#fff" }} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "var(--mp-success)" }}>Code Redeemed!</div>
      <div style={{ fontSize: 15, color: "var(--mp-txt-soft)", lineHeight: 1.6, maxWidth: 340 }}>
        <strong style={{ color: "var(--mp-txt)", fontWeight: 900 }}>
          +{Number(credits).toLocaleString()} credits
        </strong>{" "}
        have been added to your account.
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
        fontSize: 13, color: "var(--mp-txt-faint)", fontWeight: 600,
      }}>
        <FaShieldAlt style={{ fontSize: 11 }} /> Secured payment
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ManualPaymentModal({ isOpen, onClose, pack, onSuccess }) {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmallMobile = useMediaQuery("(max-width: 600px)");
  const isDark = useDarkMode();

  /* ⭐ Auth — used to refresh the user after code redemption */
  const { refreshUser } = useAuth();

  const fileInputRef = useRef(null);

  const [selectedMethod, setSelectedMethod] = useState("jazzcash");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState("instant");
  const [successCredits, setSuccessCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [couponOpen, setCouponOpen] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [currency, setCurrency] = useState(pack?.currency || "PKR");

  const [userProfile, setUserProfile] = useState({
    name: "APNa Deal Support", email: "apnadeal.support@gmail.com", avatar: null,
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const [showPromo, setShowPromo] = useState(false);
  const promoShownRef = useRef(false);

  const featuresToShow =
    Array.isArray(pack?.features) && pack.features.length > 0 ? pack.features : DEFAULT_FEATURES;
  const hasCustomFeatures = Array.isArray(pack?.features) && pack.features.length > 0;

  useEffect(() => { if (pack?.currency) setCurrency(pack.currency); }, [pack?.currency]);

  useEffect(() => {
    if (isOpen) {
      setReceiptFile(null); setReceiptPreview(null);
      setCode(""); setError(null);
      setSuccess(false); setSuccessMode("instant"); setSuccessCredits(0);
      setLoading(false); setSelectedMethod("jazzcash");
      setCouponOpen(true); setCoupon(""); setAppliedPromo(null);
      setCouponError(null); setCouponLoading(false);
      setAgreedToTerms(false); setProfileLoading(true);
      setCurrency(pack?.currency || "PKR");
      setShowPromo(false);
      promoShownRef.current = false;
    }
  }, [isOpen, pack?.currency]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (promoShownRef.current) return;
    const t = setTimeout(() => {
      promoShownRef.current = true;
      setShowPromo(true);
    }, 3000);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setProfileLoading(true);
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        const meta = user?.user_metadata || {};
        let name = meta.full_name || meta.name || meta.display_name ||
          (user?.email || "").split("@")[0] || "APNa Deal User";
        let email = user?.email || "apnadeal.support@gmail.com";
        let avatar = null;
        if (user?.id) {
          try {
            const { data: s } = await supabase
              .from("user_settings").select("full_name, email, avatar")
              .eq("user_id", user.id).maybeSingle();
            if (!cancelled && s) {
              if (s.full_name) name = s.full_name;
              if (s.email) email = s.email;
              if (s.avatar) avatar = s.avatar;
            }
          } catch (err) { console.warn("user_settings load:", err); }
        }
        if (!avatar) avatar = meta.avatar_url || meta.picture || null;
        if (!cancelled) setUserProfile({ name, email, avatar });
      } catch (err) { console.warn("profile load:", err); }
      finally { setTimeout(() => { if (!cancelled) setProfileLoading(false); }, 400); }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file (JPG, PNG)"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File too large (max 5 MB)"); return; }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); };
  const handlePaste = (e) => {
    const items = e.clipboardData?.items; if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) { handleFile(item.getAsFile()); break; }
    }
  };
  const copyToClipboard = (text) => navigator.clipboard.writeText(text).catch(() => {});

  const handleApplyCoupon = async () => {
    setCouponError(null);
    const trimmed = coupon.trim().toLowerCase();
    if (!trimmed) { setCouponError("Please enter a promo code"); return; }
    setCouponLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const promo = PROMO_CODES[trimmed];
    if (promo) { setAppliedPromo({ code: trimmed, ...promo }); setCouponError(null); }
    else { setAppliedPromo(null); setCouponError("Invalid promo code. Please try again."); }
    setCouponLoading(false);
  };
  const removeCoupon = () => { setAppliedPromo(null); setCoupon(""); setCouponError(null); };

  const handleApplyPromoFromOverlay = () => {
    setShowPromo(false);
    const promoCode = "apnadeal30";
    setCoupon(promoCode);
    setCouponOpen(true);
    (async () => {
      setCouponLoading(true);
      await new Promise((r) => setTimeout(r, 300));
      const promo = PROMO_CODES[promoCode];
      if (promo) {
        setAppliedPromo({ code: promoCode, ...promo });
        setCouponError(null);
      } else {
        setCouponError("Promo code unavailable.");
      }
      setCouponLoading(false);
    })();
  };

  const subtotalPKR = (() => {
    if (typeof pack?.pricePKR === "number") return pack.pricePKR;
    if (typeof pack?.pricePKR === "string") {
      const p = parseFloat(pack.pricePKR.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(p)) return p;
    }
    const raw = pack?.price;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const p = parseFloat(raw.replace(/[^0-9.]/g, ""));
      return Number.isFinite(p) ? p : 0;
    }
    return 0;
  })();
  const isOriginalUSD = (pack?.price || "").toString().trim().startsWith("$");
  const subtotalPKRBase = isOriginalUSD ? subtotalPKR / PKR_TO_USD : subtotalPKR;
  const discountAmountPKR = appliedPromo ? Math.round(subtotalPKRBase * appliedPromo.discount) : 0;
  const finalPKR = subtotalPKRBase - discountAmountPKR;
  const subtotalDisplay = formatPrice(subtotalPKRBase, currency);
  const discountDisplay = formatPrice(discountAmountPKR, currency);
  const finalDisplay = formatPrice(finalPKR, currency);

  /* ⭐ Determine the plan id from the pack the user chose */
  const resolvePackPlan = () => {
    if (pack?.plan)  return String(pack.plan).toLowerCase();
    if (pack?.planId) return String(pack.planId).toLowerCase();

    const name = String(pack?.name || "").toLowerCase();
    if (/(pro|advanced|premium|elite|gold|deluxe|vip)/i.test(name))  return "pro";
    if (/(seller|business|standard|plus|basic|starter)/i.test(name)) return "seller";
    if (/(free|trial|starter)/i.test(name))                           return "free";

    const credits = Number(pack?.credits || 0);
    const price   = Number(pack?.pricePKR || 0);
    if (credits >= 500 || price >= 1500) return "pro";
    if (credits >= 1   || price >= 1)    return "seller";
    return "free";
  };

  const handleSubmit = async () => {
    setError(null);
    const trimmedCode = code.trim();
    const hasCode = trimmedCode.length > 0;

    if (!hasCode && !receiptFile) {
      setError("Please upload a screenshot of your payment receipt");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Privacy Policy and Terms of Service.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setError("Please sign in before submitting.");
        setLoading(false);
        return;
      }

      if (hasCode) {
        const { data: redeemData, error: redeemErr } = await supabase.rpc(
          "redeem_activation_code", { p_code: trimmedCode }
        );
        if (redeemErr) {
          setError(redeemErr.message || "Could not redeem this code.");
          setLoading(false);
          return;
        }

        const added = Number(redeemData?.credits_added) || 0;
        const newBalance = Number(redeemData?.new_balance) || 0;
        const gotPremium = redeemData?.premium === true;

        /* ⭐ Refresh auth user so the badge flips instantly (no page reload) */
        try { await refreshUser?.(); } catch (err) { console.warn("refreshUser failed:", err); }

        let receiptUrl = null;
        if (receiptFile) {
          try { receiptUrl = await uploadReceiptImage(receiptFile, user.id); } catch (e) { console.warn(e); }
        }

        try {
          await saveManualPayment({
            userId: user.id,
            userEmail: userProfile.email,
            userName: userProfile.name,
            plan: normalizePlanId(pack),
            pack: {
              id: pack?.id,
              name: pack?.name,
              credits: pack?.credits,
              pricePKR: subtotalPKRBase,
              currency,
              features: hasCustomFeatures ? pack?.features : null,
            },
            method: selectedMethod,
            receiptUrl,
            promoCode: appliedPromo?.code || null,
            promoDiscount: discountAmountPKR,
            finalAmountPKR: finalPKR,
            activationCode: trimmedCode,
          });
        } catch (e) { console.warn(e); }

        setSuccessMode("instant"); setSuccessCredits(added);
        onSuccess?.(added, { mode: "instant", newBalance, premium: gotPremium, code: trimmedCode });

        try {
          const { toast } = await import("../lib/toast");
          const parts = [];
          if (added > 0) parts.push(`+${added.toLocaleString()} credits`);
          if (gotPremium) parts.push("Premium unlocked");
          toast(parts.length ? `🎉 Code redeemed — ${parts.join(" · ")}` : "🎉 Code redeemed!", { type: "success", duration: 5000 });
        } catch {}

        setSuccess(true);
        setTimeout(() => onClose?.(), 6000);
        return;
      }

      /* ── No code: manual receipt upload → pending approval ── */
      let receiptUrl = null;
      try { receiptUrl = await uploadReceiptImage(receiptFile, user.id); } catch (e) { console.warn(e); }

      await saveManualPayment({
        userId: user.id,
        userEmail: userProfile.email,
        userName: userProfile.name,
        plan: normalizePlanId(pack),
        pack: {
          id: pack?.id,
          name: pack?.name,
          credits: pack?.credits,
          pricePKR: subtotalPKRBase,
          currency,
          features: hasCustomFeatures ? pack?.features : null,
        },
        method: selectedMethod,
        receiptUrl,
        promoCode: appliedPromo?.code || null,
        promoDiscount: discountAmountPKR,
        finalAmountPKR: finalPKR,
        activationCode: null,
      });

      try {
        const { toast } = await import("../lib/toast");
        toast("✅ Request has been sent — you'll receive credits within 12 hours.", { type: "success", duration: 6000 });
      } catch {}
      setSuccessMode("pending"); setSuccessCredits(pack?.credits || 0);
      setSuccess(true);

      setTimeout(() => {
        onSuccess?.(0, { mode: "pending", pendingCredits: pack?.credits || 0 });
      }, 500);

      setTimeout(() => {
        onClose?.();
      }, 6000);
    } catch (err) {
      console.error("[ManualPayment] Submit error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const userInitial = (userProfile.name || "A").trim().charAt(0).toUpperCase();
  const isCreditsPack = typeof pack?.credits === "number" && !hasCustomFeatures;

  return (
    <AnimatePresence>
      <motion.div
        key="mp-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onPaste={handlePaste}
        className={`mp-font mp-theme-${isDark ? "dark" : "light"}`}
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          background: "var(--mp-bg)",
          overflowY: "auto", overflowX: "hidden",
          color: "var(--mp-txt)", WebkitOverflowScrolling: "touch",
        }}
      >
        <PaymentStyles />

        <PromoOverlay
          isOpen={showPromo}
          onClose={() => setShowPromo(false)}
          onApply={handleApplyPromoFromOverlay}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {profileLoading && (
            <motion.div key="mp-loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed", inset: 0, zIndex: 1300,
                background: "rgba(10,10,18,0.75)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 24,
              }}>
              <div style={{ position: "relative", width: 88, height: 88 }}>
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid #e66000` }} />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute", inset: 8, borderRadius: "50%",
                    border: "3px solid transparent",
                    borderTopColor: "#e66000", borderRightColor: "#ff7a1a",
                  }} />
                <div style={{
                  position: "absolute", inset: 24, borderRadius: "50%",
                  background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 20, fontWeight: 900,
                  boxShadow: "0 8px 24px -8px rgba(230,96,0,0.6)",
                }}>A</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>
                  Preparing your checkout
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                  Loading your account…
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full screen wrapper */}
        <div style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
        }}>
          <div style={{
            width: "100%",
            minHeight: "100vh",
            overflow: "hidden",
            background: "var(--mp-panel)",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)",
              minHeight: "100vh",
            }}>

              {/* ══════════════ LEFT PANEL ══════════════ */}
              <div style={{
                position: "relative",
                background: "var(--mp-left-bg)",
                color: "var(--mp-left-txt)",
                padding: isSmallMobile ? "32px 24px" : isMobile ? "40px 32px" : "56px 48px",
                display: "flex", flexDirection: "column", overflow: "hidden",
              }}>
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 18px)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", top: "-20%", left: "-10%",
                    width: "60%", height: "60%",
                    background: "radial-gradient(circle, rgba(230,96,0,0.20) 0%, transparent 70%)",
                    filter: "blur(60px)", pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 14, marginBottom: isSmallMobile ? 40 : 56 }}>
                  <button type="button" onClick={onClose} aria-label="Back"
                    className="mp-btn-hover"
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}>
                    <FaArrowLeft style={{ fontSize: 14 }} />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 13,
                      background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#e66000",
                      boxShadow: "0 8px 20px -8px rgba(0,0,0,0.3)",
                    }}>
                      <FaCrown style={{ fontSize: 20 }} />
                    </div>
                    <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.015em" }}>
                      APNa Deal
                    </span>
                  </div>
                </div>

                <div style={{ position: "relative", zIndex: 2 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px", borderRadius: 999,
                    background: "rgba(230,96,0,0.18)",
                    border: "1px solid rgba(230,96,0,0.35)",
                    color: "#ffd0a8",
                    fontSize: 11.5, fontWeight: 800,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    marginBottom: 18,
                  }}>
                    <FaStar style={{ fontSize: 9 }} />
                    {pack?.name || "Premium Plan"}
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <span style={{
                      fontSize: isSmallMobile ? 48 : 64,
                      fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1,
                    }}>
                      {finalDisplay}
                    </span>
                    <span style={{
                      fontSize: 13, color: "rgba(255,255,255,0.7)",
                      marginTop: 14, fontWeight: 500, lineHeight: 1.3,
                    }}>
                      Per<br />month
                    </span>
                  </div>

                  <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.78)", fontWeight: 500, marginBottom: 32 }}>
                    {isCreditsPack
                      ? `${pack.credits.toLocaleString()} credits · Unlimited access`
                      : "Unlimited contacts, 500 Messages per month"}
                  </p>
                </div>

                <div style={{ position: "relative", zIndex: 2, marginBottom: 32 }}>
                  <div style={{
                    borderRadius: 16, overflow: "hidden",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 18px",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {pack?.name || "Standard"}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3, fontWeight: 500 }}>
                          Billed monthly
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        {subtotalDisplay}
                      </div>
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 18px", borderTop: "1px solid rgba(255,255,255,0.08)",
                      flexWrap: "wrap", gap: 10,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{
                          width: 34, height: 20, borderRadius: 999,
                          background: "rgba(230,96,0,0.40)",
                          position: "relative", flexShrink: 0,
                          display: "inline-flex", alignItems: "center",
                          border: "1px solid rgba(230,96,0,0.55)",
                        }}>
                          <span style={{
                            position: "absolute", top: 1.5, right: 1.5,
                            width: 15, height: 15, borderRadius: "50%",
                            background: "#ff7a1a",
                          }} />
                        </span>
                        <span style={{
                          padding: "4px 10px", borderRadius: 7,
                          background: "rgba(230,96,0,0.22)",
                          color: "#ffd0a8", fontSize: 11, fontWeight: 800,
                          letterSpacing: "0.02em",
                        }}>
                          Save {formatPrice(subtotalPKRBase * 12 * 0.3, currency)}
                        </span>
                        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                          with annual billing
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.9)" }}>
                        {formatPrice(subtotalPKRBase * 12 * 0.7, currency)}/yr
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ position: "relative", zIndex: 2, marginBottom: 32 }}>
                  <p style={{
                    fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 18,
                  }}>
                    What's included
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                    {featuresToShow.map((f, i) => {
                      const title = typeof f === "string"
                        ? (f.split("—")[0] || f).trim()
                        : (f.title || f.label || "");
                      const desc = typeof f === "string"
                        ? (f.split("—")[1] || "").trim()
                        : (f.desc || "");

                      return (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: "rgba(230,96,0,0.22)",
                            border: "1px solid rgba(230,96,0,0.40)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: 1,
                          }}>
                            <FaCheck style={{ fontSize: 10, color: "#ffd0a8" }} />
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                              fontSize: 14, fontWeight: 700, color: "#fff",
                              lineHeight: 1.3, marginBottom: desc ? 3 : 0,
                            }}>
                              {title}
                            </div>
                            {desc && (
                              <div style={{
                                fontSize: 12.5, color: "rgba(255,255,255,0.62)",
                                lineHeight: 1.5, fontWeight: 500,
                              }}>
                                {desc}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div style={{ position: "relative", zIndex: 2, marginTop: "auto" }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingBottom: 16, marginBottom: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                  }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Subtotal</span>
                    <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                      {subtotalDisplay}
                    </span>
                  </div>

                  {appliedPromo && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      paddingBottom: 16, marginBottom: 12,
                      borderBottom: "1px solid rgba(255,255,255,0.10)",
                    }}>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                        Discount <span style={{ color: "#86efac", fontWeight: 800 }}>({appliedPromo.code})</span>
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#86efac", fontVariantNumeric: "tabular-nums" }}>
                        -{discountDisplay}
                      </span>
                    </div>
                  )}

                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingBottom: 16, marginBottom: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                  }}>
                    <span style={{
                      fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500,
                      display: "inline-flex", alignItems: "center", gap: 8,
                    }}>
                      Tax <FaInfoCircle style={{ fontSize: 12, opacity: 0.6 }} />
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                      {formatPrice(0, currency)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 }}>
                    <span style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>Total due today</span>
                    <span style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                      {finalDisplay}
                    </span>
                  </div>
                </div>

                <div style={{
                  position: "relative", zIndex: 2,
                  marginTop: isSmallMobile ? 32 : 48,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500,
                  flexWrap: "wrap", gap: 12,
                }}>
                  <span>©{new Date().getFullYear()} All rights reserved</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>Terms</a>
                    <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>Privacy</a>
                  </div>
                </div>
              </div>

              {/* ══════════════ RIGHT PANEL ══════════════ */}
              <div className="mp-scroll" style={{
                background: "var(--mp-panel)",
                padding: isSmallMobile ? "32px 24px" : isMobile ? "40px 32px" : "56px 48px",
                overflowY: "auto",
              }}>
                <h2 style={{
                  fontSize: 26, fontWeight: 900, color: "var(--mp-txt)",
                  letterSpacing: "-0.025em", marginBottom: 8, marginTop: 0,
                }}>
                  Complete Payment
                </h2>
                <p style={{
                  fontSize: 13.5, color: "var(--mp-txt-soft)", marginBottom: 32, fontWeight: 500,
                }}>
                  Fill in the details below to activate your plan
                </p>

                <div style={{ marginBottom: 28 }}>
                  <label style={{
                    fontSize: 12.5, fontWeight: 800, color: "var(--mp-txt)",
                    marginBottom: 10, display: "block",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                  }}>
                    Your Account
                  </label>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 18px", borderRadius: 14,
                    border: "1px solid var(--mp-line)",
                    background: "var(--mp-surface)",
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%",
                      background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17, fontWeight: 900,
                      flexShrink: 0, overflow: "hidden",
                      boxShadow: "0 6px 16px -6px rgba(230,96,0,0.4)",
                    }}>
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.name}
                          referrerPolicy="no-referrer"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : userInitial}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--mp-txt)", lineHeight: 1.3 }}>
                        {userProfile.name}
                      </div>
                      <div style={{
                        fontSize: 12, color: "var(--mp-txt-soft)", marginTop: 3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                        {userProfile.email}
                      </div>
                    </div>
                    <FaLock style={{ fontSize: 13, color: "var(--mp-success)", flexShrink: 0 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{
                    fontSize: 12.5, fontWeight: 800, color: "var(--mp-txt)",
                    marginBottom: 10, display: "block",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                  }}>
                    Payment Method
                  </label>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {PAYMENT_METHODS.map((m) => {
                      const active = selectedMethod === m.id;
                      return (
                        <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)}
                          className="mp-btn-hover"
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "15px 16px", borderRadius: 14,
                            background: active ? "var(--mp-primary-soft)" : "var(--mp-surface)",
                            border: active ? `1.5px solid var(--mp-primary)` : "1.5px solid var(--mp-line)",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.2s ease", textAlign: "left",
                          }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 11,
                            background: active ? "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)" : "var(--mp-panel-alt)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: active ? "#fff" : m.color, flexShrink: 0,
                            border: active ? "none" : "1px solid var(--mp-line)",
                          }}>
                            <PaymentLogo method={m} size={22} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--mp-txt)" }}>{m.label}</div>
                            <div style={{ fontSize: 12, color: "var(--mp-txt-soft)", marginTop: 3, fontWeight: 500 }}>
                              {m.short} · verify within 2 hours
                            </div>
                          </div>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: active ? "#e66000" : "transparent",
                            border: active ? "none" : "1.5px solid var(--mp-line-str)",
                            color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.2s ease",
                          }}>
                            {active && <FaCheck style={{ fontSize: 10 }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const m = PAYMENT_METHODS.find((x) => x.id === selectedMethod);
                    if (!m) return null;
                    return (
                      <motion.div key={m.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          marginTop: 14, padding: 18, borderRadius: 14,
                          background: "var(--mp-panel-alt)", border: "1px solid var(--mp-line)",
                        }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8,
                          marginBottom: 6, paddingBottom: 12,
                          borderBottom: "1px dashed var(--mp-line)",
                        }}>
                          <FaUniversity style={{ fontSize: 11, color: "var(--mp-primary)" }} />
                          <span style={{
                            fontSize: 11, fontWeight: 800, color: "var(--mp-txt-soft)",
                            textTransform: "uppercase", letterSpacing: "0.08em",
                          }}>
                            Transfer to
                          </span>
                        </div>
                        <DetailRow label="Account Name" value={m.accountName}
                          onCopy={() => copyToClipboard(m.accountName)} />
                        <DetailRow label="Account Number" value={m.accountNumber}
                          onCopy={() => copyToClipboard(m.accountNumber)} mono />
                        {m.extra && <DetailRow label="Bank" value={m.extra} isLast />}
                      </motion.div>
                    );
                  })()}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{
                    fontSize: 12.5, fontWeight: 800, color: "var(--mp-txt)",
                    marginBottom: 10, display: "block",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                  }}>
                    Upload Receipt
                  </label>

                  {!receiptPreview ? (
                    <motion.div onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      whileHover={{ scale: 1.005 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "20px 18px", borderRadius: 14,
                        background: dragOver ? "var(--mp-blue-soft)" : "var(--mp-surface)",
                        border: dragOver ? `1.5px dashed var(--mp-blue)` : "1.5px dashed var(--mp-line-str)",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 13,
                        background: "linear-gradient(135deg, var(--mp-blue-soft) 0%, rgba(59,130,246,0.15) 100%)",
                        color: "var(--mp-blue)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        border: "1px solid rgba(59,130,246,0.20)",
                      }}>
                        <FaCloudUploadAlt style={{ fontSize: 20 }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--mp-txt)", marginBottom: 3 }}>
                          Click to upload screenshot
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--mp-txt-faint)", fontWeight: 500 }}>
                          PNG, JPG up to 5 MB
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                      style={{
                        position: "relative", borderRadius: 14, overflow: "hidden",
                        border: `1.5px solid var(--mp-success)`, background: "#000",
                        boxShadow: "0 12px 30px -12px var(--mp-success)",
                      }}>
                      <img src={receiptPreview} alt="Receipt"
                        style={{ width: "100%", maxHeight: 180, objectFit: "contain", display: "block" }} />
                      <button type="button"
                        onClick={() => {
                          URL.revokeObjectURL(receiptPreview);
                          setReceiptFile(null); setReceiptPreview(null);
                        }}
                        style={{
                          position: "absolute", top: 10, right: 10,
                          width: 30, height: 30, borderRadius: "50%",
                          background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.15)",
                          color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backdropFilter: "blur(8px)",
                        }}>
                        <FaTimes style={{ fontSize: 10 }} />
                      </button>
                      <div style={{
                        position: "absolute", bottom: 10, left: 10,
                        padding: "5px 12px", borderRadius: 999,
                        background: "rgba(34,197,94,0.95)", color: "#fff",
                        fontSize: 11, fontWeight: 800,
                        display: "inline-flex", alignItems: "center", gap: 6,
                        boxShadow: "0 4px 12px -4px rgba(34,197,94,0.5)",
                      }}>
                        <FaCheckCircle style={{ fontSize: 10 }} /> Uploaded
                      </div>
                    </motion.div>
                  )}

                  <input ref={fileInputRef} type="file" accept="image/*"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    style={{ display: "none" }} />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: 800, color: "var(--mp-txt)",
                    marginBottom: 10, display: "flex",
                    alignItems: "center", justifyContent: "space-between",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                  }}>
                    <span>Activation Code</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: "var(--mp-txt-faint)",
                      padding: "3px 8px", borderRadius: 6,
                      background: "var(--mp-surface)",
                      border: "1px solid var(--mp-line)",
                    }}>
                      OPTIONAL
                    </span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <FaKey style={{
                      position: "absolute", left: 16, top: "50%",
                      transform: "translateY(-50%)", color: "var(--mp-txt-faint)",
                      fontSize: 13, pointerEvents: "none",
                    }} />
                    <input type="text" value={code}
                      onChange={(e) => { setCode(e.target.value); setError(null); }}
                      placeholder="Have a code? Paste it here"
                      autoComplete="off" spellCheck={false}
                      className="mp-input"
                      style={{
                        width: "100%", padding: "15px 14px 15px 44px",
                        borderRadius: 14, background: "var(--mp-surface)",
                        border: "1.5px solid var(--mp-line)",
                        color: "var(--mp-txt)", fontSize: 14,
                        fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                        transition: "all 0.2s ease",
                      }} />
                  </div>
                  <p style={{ marginTop: 10, fontSize: 12, color: "var(--mp-txt-faint)", lineHeight: 1.5, fontWeight: 500 }}>
                    <strong style={{ color: "var(--mp-txt)", fontWeight: 800 }}>Have a code?</strong> Paste it to get credits instantly.
                  </p>
                </div>

                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "16px 18px", borderRadius: 14,
                  background: "var(--mp-surface)", border: "1px solid var(--mp-line)",
                  marginBottom: 24,
                  cursor: "pointer",
                }}
                  onClick={() => { setAgreedToTerms(!agreedToTerms); if (!agreedToTerms) setError(null); }}
                >
                  <span style={{
                    position: "relative", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                    width: 22, height: 22, borderRadius: 7,
                    border: agreedToTerms ? `1.5px solid #e66000` : "1.5px solid var(--mp-line-str)",
                    background: agreedToTerms ? "#e66000" : "transparent",
                    flexShrink: 0, marginTop: 1,
                    transition: "all 0.15s ease",
                  }}>
                    <input type="checkbox" checked={agreedToTerms}
                      onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setError(null); }}
                      style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer", margin: 0 }} />
                    {agreedToTerms && <FaCheck style={{ fontSize: 11, color: "#fff" }} />}
                  </span>
                  <div style={{ fontSize: 12.5, color: "var(--mp-txt-soft)", lineHeight: 1.55, fontWeight: 500 }}>
                    <div style={{ fontWeight: 800, color: "var(--mp-txt)", marginBottom: 3, fontSize: 13 }}>
                      Securely save my information
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--mp-txt-faint)" }}>
                      Pay faster on APNa Deal and everywhere Link is accepted
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden", marginBottom: 16 }}>
                      <div style={{
                        padding: "13px 16px", borderRadius: 12,
                        background: "var(--mp-danger-soft)",
                        border: `1px solid var(--mp-danger-brd)`,
                        color: "var(--mp-danger)", fontSize: 13, fontWeight: 700,
                        display: "flex", alignItems: "flex-start", gap: 10,
                      }}>
                        <FaInfoCircle style={{ fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="button"
                  disabled={loading || !agreedToTerms}
                  onClick={handleSubmit}
                  className="mp-cta-shine mp-btn-hover"
                  style={{
                    position: "relative",
                    width: "100%", padding: "18px 24px",
                    borderRadius: 14, border: "none",
                    background: loading || !agreedToTerms
                      ? "var(--mp-surface)"
                      : "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                    color: loading || !agreedToTerms ? "var(--mp-txt-faint)" : "#fff",
                    fontSize: 16, fontWeight: 800,
                    fontFamily: "inherit",
                    cursor: loading || !agreedToTerms ? "not-allowed" : "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.2s ease",
                    boxShadow: loading || !agreedToTerms ? "none" : "0 16px 40px -12px rgba(230,96,0,0.55)",
                    overflow: "hidden",
                  }}>
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ display: "inline-flex" }}>
                        <FaSpinner style={{ fontSize: 14 }} />
                      </motion.span>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <FaShieldAlt style={{ fontSize: 13 }} />
                      {code.trim() ? "Redeem Code" : "Subscribe Now"}
                    </>
                  )}
                </button>

                <p style={{
                  fontSize: 11.5, color: "var(--mp-txt-faint)", lineHeight: 1.6, marginTop: 16,
                  textAlign: "center", fontWeight: 500,
                }}>
                  By confirming your subscription, you allow us to charge your card for this and future payments in accordance with terms. You can always cancel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, zIndex: 1400,
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
              }}>
              <div style={{
                maxWidth: 520, width: "100%", textAlign: "center",
                padding: 32, borderRadius: 24,
                background: "var(--mp-panel)",
                border: "1px solid var(--mp-line)",
                boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8)",
              }}>
                <SuccessState mode={successMode} credits={successCredits} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}