// pages/Checkout.jsx — Marketplace checkout · Contrado-style cart layout
// ⭐ Brand color: #e66000
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft, FaLock, FaCheck, FaTimes,
  FaMoneyBillWave, FaUniversity, FaShoppingCart, FaTrashAlt,
  FaTruck, FaMapMarkerAlt, FaUser, FaPhoneAlt, FaCity,
  FaShieldAlt, FaInfoCircle, FaBolt, FaClipboardList,
  FaBoxOpen, FaHome, FaCopy, FaRegCopy,
  FaExclamationCircle, FaCheckCircle, FaInfoCircle as FaInfo,
  FaMobileAlt, FaPercent, FaWifi, FaCrown, FaPlus, FaMinus,
  FaTag, FaTicketAlt, FaChevronRight, FaGift,
  FaHandHoldingUsd, FaWallet, FaRegEdit,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  readCart, writeCart, createOrder, checkSupabaseReady,
} from "../lib/cartStore";
import { useAuth } from "../contexts/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   STYLES — Brand #e66000
   ═══════════════════════════════════════════════════════════════ */
const CheckoutStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ── Theme tokens ── */
    .theme-dark {
      --or-bg-1:#0A0A12; --or-bg-2:#0F0F1A;
      --or-card:#16161F; --or-side:#1A1A24;
      --or-panel:rgba(255,255,255,0.045);
      --or-line:rgba(255,255,255,0.08);
      --or-line-str:rgba(255,255,255,0.15);
      --or-txt:#FFFFFF; --or-txt-soft:rgba(255,255,255,0.65); --or-txt-faint:rgba(255,255,255,0.45);
      --or-primary:#e66000; --or-primary-2:#ff7a1a; --or-primary-3:#c75200;
      --or-primary-soft:rgba(230,96,0,0.14); --or-primary-glow:rgba(230,96,0,0.45);
      --or-danger:#E2795F; --or-danger-soft:rgba(226,121,95,0.14);
      --or-success:#3fa77f; --or-success-soft:rgba(63,167,127,0.10);
      --or-green-bg:#2A0F00; --or-green-bg-2:#0A0A12;
      --cart-bg: #0F0F1A;
      --cart-surface: #16161F;
      --cart-border: rgba(255,255,255,0.08);
      --cart-txt: #FFFFFF;
      --cart-txt-muted: rgba(255,255,255,0.55);
      --cart-txt-faint: rgba(255,255,255,0.35);
      --cart-lime: #e66000;
      --cart-lime-hover: #c75200;
      --cart-lime-text: #FFFFFF;
      --cart-danger: #FF5B5B;
    }
    .theme-light {
      --or-bg-1:#F5F5F5; --or-bg-2:#F5F5F5;
      --or-card:#FFFFFF; --or-side:#FAFAFA;
      --or-panel:rgba(255,255,255,0.85);
      --or-line:rgba(20,20,30,0.08);
      --or-line-str:rgba(20,20,30,0.15);
      --or-txt:#111111; --or-txt-soft:rgba(17,17,17,0.62); --or-txt-faint:rgba(17,17,17,0.42);
      --or-primary:#e66000; --or-primary-2:#ff7a1a; --or-primary-3:#c75200;
      --or-primary-soft:rgba(230,96,0,0.10); --or-primary-glow:rgba(230,96,0,0.35);
      --or-danger:#B23A2E; --or-danger-soft:rgba(178,58,46,0.10);
      --or-success:#16A34A; --or-success-soft:rgba(22,163,74,0.10);
      --or-green-bg:#16A34A; --or-green-bg-2:#15803D;
      --cart-bg: #F4F4F4;
      --cart-surface: #FFFFFF;
      --cart-border: rgba(20,20,30,0.08);
      --cart-txt: #0A0A0A;
      --cart-txt-muted: rgba(10,10,10,0.6);
      --cart-txt-faint: rgba(10,10,10,0.4);
      --cart-lime: #e66000;
      --cart-lime-hover: #c75200;
      --cart-lime-text: #FFFFFF;
      --cart-danger: #D92D2D;
    }

    /* ── Cart base classes ── */
    .cart-bg { background: var(--cart-bg); color: var(--cart-txt); }
    .cart-surface { background: var(--cart-surface); }
    .cart-border { border-color: var(--cart-border); }
    .cart-txt { color: var(--cart-txt); }
    .cart-txt-muted { color: var(--cart-txt-muted); }
    .cart-txt-faint { color: var(--cart-txt-faint); }
    .cart-lime-bg { background: var(--cart-lime); color: var(--cart-lime-text); }
    .cart-lime-bg:hover { background: var(--cart-lime-hover); }
    .cart-lime-bg:disabled { opacity: 0.6; cursor: not-allowed; }
    .cart-summary-card { background: #ECECEC; }
    .theme-dark .cart-summary-card { background: #1C1C28; }
    .cart-coupon-card { background: #ECECEC; }
    .theme-dark .cart-coupon-card { background: #1C1C28; }
    .cart-pay-btn { background: #ECECEC; color: var(--cart-txt); transition: background 0.2s ease; }
    .theme-dark .cart-pay-btn { background: #1C1C28; }
    .cart-pay-btn:hover { background: #E0E0E0; }
    .theme-dark .cart-pay-btn:hover { background: #252533; }

    /* Form inputs */
    .co-input {
      background: var(--cart-surface);
      color: var(--cart-txt);
      border: 1px solid var(--cart-border);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      font-size: 16px;
    }
    .co-input:focus {
      border-color: var(--cart-lime);
      box-shadow: 0 0 0 3px rgba(230,96,0,0.25);
      outline: none;
    }
    .co-input-error { border-color: #FF5B5B !important; }

    .co-pay-active {
      background: rgba(230,96,0,0.12);
      border: 1.5px solid var(--cart-lime);
    }
    .co-pay-idle {
      background: var(--cart-surface);
      border: 1.5px solid var(--cart-border);
    }

    .co-step-done { background: var(--cart-lime); color: var(--cart-lime-text); }
    .co-step-idle { background: transparent; border: 1.5px solid var(--cart-border); color: var(--cart-txt-muted); }

    .co-lime-soft { background: rgba(230,96,0,0.12); border: 1px solid rgba(230,96,0,0.35); }

    .co-btn-emerald {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      box-shadow: 0 10px 24px -10px rgba(16,185,129,0.55);
    }
    .co-btn-emerald:hover { filter: brightness(1.05); }

    @keyframes codPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(230,96,0,0.7); }
      50%      { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(230,96,0,0); }
    }
    .cod-new-badge { animation: codPulse 2s ease-in-out infinite; }

    /* ═══════ STEPPER (responsive) ═══════ */
    .co-stepper {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 12px 14px;
      border-radius: 16px;
      background: var(--cart-surface);
      border: 1px solid var(--cart-border);
      overflow: hidden;
    }
    .co-step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .co-step-circle {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }
    .co-step-label {
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      letter-spacing: -0.01em;
    }
    .co-step-connector {
      flex: 1 1 auto;
      min-width: 12px;
      border-top: 1.5px dashed var(--cart-border);
      height: 0;
      margin: 0 2px;
    }

    @media (max-width: 380px) {
      .co-stepper { padding: 10px 10px; gap: 4px; border-radius: 14px; }
      .co-step-item { gap: 6px; }
      .co-step-circle { width: 24px; height: 24px; }
      .co-step-label { font-size: 11px; }
      .co-step-connector { min-width: 8px; }
    }

    @media (max-width: 1023px) {
      .co-safe { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px); }
      .co-sticky-cta {
        position: sticky;
        bottom: 0;
        z-index: 40;
        padding-bottom: max(env(safe-area-inset-bottom, 0px), 12px);
        background: var(--cart-bg);
        border-top: 1px solid var(--cart-border);
        margin-top: 12px;
        padding-top: 12px;
      }
      .co-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
      }
    }

    .cart-bg, .cart-bg * { box-sizing: border-box; }
    .cart-bg { overflow-x: hidden; }

    @media (max-height: 500px) and (max-width: 1023px) {
      .co-lh-tight { padding-top: 16px !important; padding-bottom: 16px !important; }
    }
  `}</style>
);

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString("en-US")}`;

const DELIVERY_FEES = { cod: 600, easypaisa: 500, bank: 300 };
const SHIPPING_FEE = 20;

const EASYPAISA_LOGO = "/esypaisa.png";
const MEEZAN_LOGO = "/meezan.png";

const BANK_DETAILS = {
  bankName: "Meezan Bank Limited",
  accountTitle: "Bank Transfer Details",
  accountNumber: "00300116164743",
  iban: "PK24MEZN0000300116164743",
  branch: "MEEZAN DIGITAL CENTRE",
};

const EASYPAISA_DETAILS = {
  mobileNumber: "0314 0972575",
  accountHolder: "HASNAIN HAMID",
  merchantId: "EP-882910",
};

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot",
  "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Larkana",
  "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan",
  "Gujrat", "Sahiwal", "Wah Cantonment", "Mardan", "Kasur",
  "Okara", "Mingora", "Nawabshah", "Chiniot", "Kotri", "Kamoke",
  "Swabi", "Abbottabad", "Mansehra", "Nowshera", "Charsadda",
  "Kohat", "Bannu", "Dera Ismail Khan", "Swat", "Gilgit",
  "Skardu", "Muzaffarabad", "Mirpur", "Attock", "Jhelum",
];

const ADDRESS_SUGGESTIONS = {
  Lahore: ["DHA Phase 1", "DHA Phase 2", "DHA Phase 3", "DHA Phase 5", "Gulberg I", "Gulberg II", "Gulberg III", "Model Town", "Johar Town", "Bahria Town", "Cantt", "Township", "Iqbal Town", "Faisal Town", "Wapda Town"],
  Karachi: ["Clifton Block 1", "Clifton Block 5", "DHA Phase 5", "Gulshan-e-Iqbal Block 13", "Gulshan-e-Johar", "Bahadurabad", "PECHS Block 2", "Saddar", "North Nazimabad", "Nazimabad", "Malir Cantt", "Korangi", "Scheme 33"],
  Islamabad: ["F-5", "F-6", "F-7", "F-8", "F-10", "F-11", "G-5", "G-6", "G-7", "G-8", "G-9", "G-10", "G-11", "E-7", "E-8", "E-11", "H-8", "H-9", "I-8", "I-9", "I-10", "DHA Phase 1", "DHA Phase 2"],
  Rawalpindi: ["Bahria Town Phase 1", "Bahria Town Phase 4", "Bahria Town Phase 5", "Bahria Town Phase 7", "Bahria Town Phase 8", "Chaklala Scheme 1", "Chaklala Scheme 2", "Chaklala Scheme 3", "Satellite Town", "Saddar", "Adiala Road"],
};

const GENERIC_SUGGESTIONS = ["Cantt", "Civil Lines", "Model Town", "Satellite Town", "Gulberg", "DHA", "Bahria Town", "Peoples Colony", "Wapda Town", "Main Bazaar", "City Area"];

const CONFETTI_COLORS = ["#e66000", "#ff7a1a", "#10B981", "#ffffff", "#6B7280"];

const ConfettiBurst = () => {
  const pieces = Array.from({ length: 34 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const distance = 120 + Math.random() * 180;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const rotate = Math.random() * 720 - 360;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 6 + Math.random() * 8;
        const delay = Math.random() * 0.15;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x, y, rotate, scale: [0, 1, 1, 0.4] }}
            transition={{ duration: 1.4, delay, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 rounded-sm"
            style={{ width: size, height: size * 0.6, backgroundColor: color }}
          />
        );
      })}
    </div>
  );
};

const Snackbar = ({ toasts, onDismiss }) => (
  <div
    className="fixed left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-md"
    style={{
      bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
      paddingLeft: "max(16px, env(safe-area-inset-left, 16px))",
      paddingRight: "max(16px, env(safe-area-inset-right, 16px))",
    }}
  >
    <AnimatePresence>
      {toasts.map((t) => {
        const Icon = t.type === "error" ? FaExclamationCircle : t.type === "success" ? FaCheckCircle : FaInfo;
        const bg =
          t.type === "error" ? "#DC2626"
          : t.type === "success" ? "#10B981"
          : "var(--cart-txt)";
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={() => onDismiss(t.id)}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)]"
            style={{ background: bg, borderColor: bg, color: t.type === "info" ? "var(--cart-bg)" : "#fff" }}
          >
            <Icon className="text-sm mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-ticket-body text-xs font-bold">{t.title}</p>
              {t.message && <p className="font-ticket-body text-[11px] mt-0.5 opacity-90 leading-relaxed">{t.message}</p>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }} className="opacity-70 hover:opacity-100 flex-shrink-0" aria-label="Dismiss">
              <FaTimes className="text-[10px]" />
            </button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

const SuggestInput = ({ label, value, onChange, onPick, placeholder, icon: Icon, suggestions = [], error, maxSuggestions = 6 }) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, maxSuggestions);
    return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, maxSuggestions);
  }, [value, suggestions, maxSuggestions]);

  const pick = (s) => { onPick ? onPick(s) : onChange(s); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % filtered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Enter") { e.preventDefault(); pick(filtered[highlight]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-1 block cart-txt-muted">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "var(--cart-lime)" }} />}
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`font-ticket-body w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 rounded-xl text-sm outline-none transition-all co-input ${error ? "co-input-error" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 rounded-xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] overflow-hidden max-h-56 overflow-y-auto cart-surface"
            style={{ border: "1px solid var(--cart-border)" }}
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                className="px-3 py-2 font-ticket-body text-xs cursor-pointer"
                style={i === highlight ? { background: "rgba(230,96,0,0.15)", color: "var(--cart-lime)" } : { color: "var(--cart-txt)" }}
              >
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {error && (
        <p className="font-ticket-body text-[10px] mt-1 flex items-center gap-1" style={{ color: "var(--cart-danger)" }}>
          <FaExclamationCircle className="text-[9px]" /> {error}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ RESPONSIVE STEPPER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const CheckoutStepper = ({ steps }) => {
  return (
    <div className="co-stepper mb-8 sm:mb-10" role="list" aria-label="Checkout progress">
      {steps.map((s, i, arr) => {
        const isDone = s.done;
        const isActive = s.active && !isDone;
        return (
          <React.Fragment key={s.key}>
            <div className="co-step-item" role="listitem">
              <span
                className="co-step-circle rounded-full flex items-center justify-center transition-all duration-300"
                style={
                  isDone
                    ? { background: "#10B981", border: "2px solid #10B981", boxShadow: "0 6px 16px -6px rgba(16,185,129,0.55)" }
                    : isActive
                    ? { background: "var(--cart-lime)", border: "2px solid var(--cart-lime)", boxShadow: "0 6px 16px -6px rgba(230,96,0,0.5)" }
                    : { background: "transparent", border: "2px solid var(--cart-border)" }
                }
              >
                {isDone ? (
                  <motion.svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-3.5 sm:w-3.5" initial="hidden" animate="visible">
                    <motion.path
                      d="M5 12 L10 17 L19 7"
                      fill="none" stroke="#FFFFFF" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round"
                      variants={{
                        hidden: { pathLength: 0, opacity: 0 },
                        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
                      }}
                    />
                  </motion.svg>
                ) : isActive ? (
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full" style={{ background: "var(--cart-lime-text)" }} />
                ) : (
                  <span className="font-ticket-body text-[10px] sm:text-[11px] font-black" style={{ color: "var(--cart-txt-faint)" }}>
                    {i + 1}
                  </span>
                )}
              </span>

              <span
                className="co-step-label transition-colors duration-300"
                style={{
                  color: isDone ? "#10B981" : isActive ? "var(--cart-txt)" : "var(--cart-txt-muted)",
                }}
              >
                {s.label}
              </span>
            </div>

            {i < arr.length - 1 && (
              <div
                className="co-step-connector"
                style={{
                  borderTopColor:
                    arr[i + 1].done || (s.done && arr[i + 1].active)
                      ? "#10B981"
                      : "var(--cart-border)",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();

  const [cart, setCart] = useState(() => readCart());
  const [method, setMethod] = useState("cod");
  const [activeTab, setActiveTab] = useState("buy");
  const [useBayana, setUseBayana] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [details, setDetails] = useState({
    fullName: user?.user_metadata?.full_name || "",
    phone: "", address: "", city: "", notes: "",
    txnRef: "",
  });
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState("");

  const [connStatus, setConnStatus] = useState("checking");
  const [connError, setConnError] = useState("");
  const [premiumStatus, setPremiumStatus] = useState("checking");

  const [isDark, setIsDark] = useState(false);
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

  useEffect(() => {
    if (!user) {
      setPremiumStatus("denied");
      return;
    }
    setPremiumStatus("ok");
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const gate = await checkSupabaseReady();
      if (cancelled) return;
      if (gate.ok) { setConnStatus("ok"); setConnError(""); }
      else { setConnStatus("error"); setConnError(gate.reason); }
    })();
    return () => { cancelled = true; };
  }, []);

  const pushToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, title, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    const onUpdate = () => setCart(readCart());
    window.addEventListener("cart:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cart:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);
  const subtotal = cart.reduce((s, c) => s + c.price * (c.qty || 1), 0);
  const deliveryCharge = DELIVERY_FEES[method] ?? 300;
  const shippingFee = cart.length ? SHIPPING_FEE : 0;
  const grandTotal = subtotal + shippingFee + deliveryCharge;

  const updateQty = (id, delta) => {
    const next = cart.map((c) =>
      c.id === id ? { ...c, qty: Math.max(1, (c.qty || 1) + delta) } : c
    );
    setCart(next);
    writeCart(next).catch(() => {});
  };

  const stageIndex = useMemo(() => {
    const hasAddress = details.fullName && details.phone && details.address && details.city;

    if (method === "bank" || method === "easypaisa") {
      if (hasAddress && details.txnRef) return 3;
      if (hasAddress) return 2;
      return 1;
    }
    if (method === "cod") {
      if (hasAddress) return 3;
      return 1;
    }
    return 1;
  }, [details, method]);

  const removeFromCart = async (id) => {
    const next = cart.filter((c) => c.id !== id);
    setCart(next);
    try { await writeCart(next); }
    catch (err) { console.error("Failed to remove from cart:", err); }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      pushToast("success", "Copied!", `${text}`);
      setTimeout(() => setCopied(""), 1600);
    } catch { pushToast("info", "Copy manually", text); }
  };

  const setField = (key, value) => {
    setDetails((d) => ({ ...d, [key]: value }));
    setErrors((e) => { if (!e[key]) return e; const next = { ...e }; delete next[key]; return next; });
  };

  const addressSuggestions = useMemo(() => {
    const city = details.city.trim();
    if (city && ADDRESS_SUGGESTIONS[city]) return ADDRESS_SUGGESTIONS[city];
    const key = Object.keys(ADDRESS_SUGGESTIONS).find((c) => c.toLowerCase() === city.toLowerCase());
    if (key) return ADDRESS_SUGGESTIONS[key];
    return GENERIC_SUGGESTIONS;
  }, [details.city]);

  const validate = () => {
    const errs = {};
    if (!details.fullName.trim()) errs.fullName = "Please enter your full name";
    if (!details.phone.trim()) errs.phone = "Please enter your phone number";
    else if (!/^[0-9+\-\s()]{7,20}$/.test(details.phone.trim())) errs.phone = "Enter a valid phone number";
    if (!details.address.trim()) errs.address = "Please enter your delivery address";
    if (!details.city.trim()) errs.city = "Please enter your city";

    if ((method === "bank" || method === "easypaisa") && !details.txnRef.trim()) {
      errs.txnRef = method === "bank"
        ? "Please enter your bank transfer reference / TID"
        : "Please enter your Easypaisa transaction ID (TID)";
    }
    return errs;
  };

  const handleConfirm = async () => {
    if (!user) {
      pushToast("error", "Sign in required", "Please sign in to place an order.");
      setTimeout(() => navigate("/signin"), 800);
      return;
    }

    if (connStatus !== "ok") {
      pushToast(
        "error",
        connStatus === "checking" ? "Still connecting…" : "Connection problem",
        connError || "Please wait a moment and try again."
      );
      return;
    }
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.txnRef) {
        pushToast(
          "error",
          method === "bank" ? "Bank reference required" : "Easypaisa TID required",
          method === "bank" ? "Enter your transfer reference / TID to continue." : "Enter your Easypaisa transaction ID (TID) to continue."
        );
      } else {
        pushToast("error", "Please check your details", "Some required fields need your attention.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPlacing(true);

    try {
      const newOrder = await createOrder({
        items: cart,
        subtotal,
        deliveryCharge,
        shippingFee,
        total: grandTotal,
        method,
        customer: {
          fullName: details.fullName,
          phone: details.phone,
          address: details.address,
          city: details.city,
          notes: details.notes,
        },
        txnRef: details.txnRef || null,
      });

      setCart([]);
      setOrder(newOrder);
      setTimeout(() => { setPlacing(false); setSuccess(true); }, 500);
    } catch (err) {
      console.error("Order failed:", err);
      pushToast("error", "Order could not be placed", err.message || "Please try again.");
      setPlacing(false);
      const gate = await checkSupabaseReady();
      setConnStatus(gate.ok ? "ok" : "error");
      setConnError(gate.ok ? "" : gate.reason);
    }
  };

  if (premiumStatus === "checking") {
    return (
      <div className={`min-h-screen cart-bg flex items-center justify-center relative ${isDark ? "theme-dark" : "theme-light"}`}>
        <CheckoutStyles />
        <div className="relative text-center px-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="inline-block h-10 w-10 rounded-full mb-4"
            style={{ border: "3px solid var(--cart-lime)", borderTopColor: "transparent" }}
          />
          <p className="font-ticket-body text-sm cart-txt-muted">Verifying your access…</p>
        </div>
      </div>
    );
  }

  if (premiumStatus === "denied") {
    return (
      <div className={`min-h-screen cart-bg flex items-center justify-center relative px-4 ${isDark ? "theme-dark" : "theme-light"}`}>
        <CheckoutStyles />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-md w-full mx-auto p-6 sm:p-8 cart-summary-card rounded-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ border: "2px solid var(--cart-lime)" }}
          >
            <FaCrown className="text-2xl" style={{ color: "var(--cart-lime)" }} />
          </motion.div>
          <h2 className="font-ticket-display text-xl font-bold mb-2 cart-txt">Premium required</h2>
          <p className="font-ticket-body text-sm mb-5 cart-txt-muted">
            Upgrade to the Rs 2,000 plan to place orders on APNa Deal.
          </p>
          <Link to="/premium" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ticket-body font-bold text-sm cart-lime-bg">
            <FaCrown className="text-xs" /> Upgrade Now
          </Link>
        </motion.div>
      </div>
    );
  }

  const ConnectionBanner = () => {
    if (connStatus === "ok") return null;
    const isChecking = connStatus === "checking";
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          background: isChecking ? "rgba(230,96,0,0.12)" : "rgba(255,91,91,0.10)",
          border: `1px solid ${isChecking ? "var(--cart-lime)" : "rgba(255,91,91,0.4)"}`,
          color: isChecking ? "var(--cart-txt)" : "var(--cart-danger)",
        }}
      >
        {isChecking ? <FaWifi className="text-sm mt-0.5 animate-pulse flex-shrink-0" /> : <FaExclamationCircle className="text-sm mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-ticket-body text-xs font-bold">
            {isChecking ? "Connecting to server…" : "Cannot place order"}
          </p>
          <p className="font-ticket-body text-[11px] mt-0.5 leading-relaxed">
            {isChecking ? "Verifying your session and connection." : connError || "Check your internet connection and refresh the page."}
          </p>
        </div>
      </motion.div>
    );
  };

  /* SUCCESS */
  if (success && order) {
    return (
      <div className={`min-h-screen cart-bg relative overflow-hidden flex items-center justify-center px-4 py-10 ${isDark ? "theme-dark" : "theme-light"}`}>
        <CheckoutStyles />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(230,96,0,0.4) 0%, rgba(230,96,0,0.1) 45%, transparent 70%)` }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.9, bounce: 0.35 }}
          className="relative w-full max-w-lg cart-summary-card rounded-2xl p-6 sm:p-9 text-center z-10"
          style={{ boxShadow: `0 25px 70px -20px rgba(230,96,0,0.3)` }}
        >
          <ConfettiBurst />
          <div className="relative mx-auto mb-6 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.7, scale: 0.7 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 2.2, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid var(--cart-lime)" }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.5, delay: 0.1 }}
              className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center"
              style={{ background: "var(--cart-lime)", boxShadow: `0 10px 30px -6px rgba(230,96,0,0.5)` }}
            >
              <motion.svg viewBox="0 0 52 52" className="w-10 h-10 sm:w-12 sm:h-12" initial="hidden" animate="visible">
                <motion.path
                  d="M14 27 L23 36 L38 18"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.7, delay: 0.35, ease: "easeOut" } },
                  }}
                />
              </motion.svg>
            </motion.div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-ticket-display text-2xl sm:text-4xl font-bold mb-2 cart-txt"
          >
            Order placed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-ticket-body text-sm mb-5 cart-txt-muted"
          >
            Your order has been placed successfully.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 co-lime-soft"
          >
            <FaBoxOpen className="text-xs" style={{ color: "var(--cart-lime)" }} />
            <span className="font-ticket-body text-xs font-bold tracking-wider" style={{ color: "var(--cart-lime)" }}>
              {order.id}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-xl p-4 mb-6 cart-surface"
            style={{ border: "1px solid var(--cart-border)" }}
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="font-ticket-display text-lg font-bold cart-txt">{order.items.length}</p>
                <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mt-0.5 cart-txt-muted">Items</p>
              </div>
              <div className="text-center" style={{ borderLeft: "1px solid var(--cart-border)", borderRight: "1px solid var(--cart-border)" }}>
                <p className="font-ticket-display text-lg font-bold cart-txt">
                  {method === "cod" ? "COD" : method === "easypaisa" ? "Easypaisa" : "Meezan"}
                </p>
                <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mt-0.5 cart-txt-muted">Payment</p>
              </div>
              <div className="text-center">
                <p className="font-ticket-display text-lg font-bold" style={{ color: "var(--cart-lime)" }}>{formatRs(order.total)}</p>
                <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mt-0.5 cart-txt-muted">
                  Total {method === "cod" ? "Due" : "Paid"}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/orders")}
              className="flex-1 py-3 rounded-xl font-ticket-body font-bold text-sm inline-flex items-center justify-center gap-2 cart-lime-bg"
            >
              <FaTruck className="text-xs" /> Track Order
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/mobiles")}
              className="flex-1 py-3 rounded-xl font-ticket-body font-bold text-sm inline-flex items-center justify-center gap-2 cart-txt"
              style={{ border: "1px solid var(--cart-border)" }}
            >
              <FaHome className="text-xs" /> Continue Shopping
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* EMPTY CART */
  if (cart.length === 0 && !order) {
    return (
      <div className={`min-h-[70vh] cart-bg flex items-center justify-center px-4 ${isDark ? "theme-dark" : "theme-light"}`}>
        <CheckoutStyles />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full mx-auto p-6 sm:p-8 cart-summary-card rounded-2xl"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <FaShoppingCart className="text-5xl mx-auto mb-4 cart-txt-faint" />
          </motion.div>
          <h2 className="font-ticket-display text-xl font-bold mb-2 cart-txt">Your cart is empty</h2>
          <p className="font-ticket-body text-sm mb-5 cart-txt-muted">Add some items before checking out.</p>
          <Link to="/mobiles" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ticket-body font-bold text-sm cart-lime-bg">
            <FaArrowLeft className="text-xs" /> Continue Browsing
          </Link>
        </motion.div>
      </div>
    );
  }

  const hasAddressComplete = !!(details.fullName && details.phone && details.address && details.city);
  const hasPaymentComplete =
    (method === "cod" && hasAddressComplete) ||
    ((method === "bank" || method === "easypaisa") && !!details.txnRef.trim());

  const stepperSteps = [
    { key: "cart",     label: "Cart",     done: true,                active: false },
    { key: "checkout", label: "Checkout", done: hasAddressComplete,  active: !hasAddressComplete },
    { key: "payment",  label: "Payment",  done: hasPaymentComplete,  active: hasAddressComplete && !hasPaymentComplete },
  ];

  /* MAIN CHECKOUT */
  return (
    <div className={`min-h-screen cart-bg ${isDark ? "theme-dark" : "theme-light"}`}>
      <CheckoutStyles />
      <Snackbar toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">

        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3 py-2 rounded-xl font-ticket-body text-xs font-bold cart-txt"
          style={{ border: "1px solid var(--cart-border)" }}
        >
          <FaArrowLeft className="text-[10px]" /> Back
        </motion.button>

        <ConnectionBanner />

        <CheckoutStepper steps={stepperSteps} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 xl:gap-12">

          <div className="space-y-6 min-w-0">

            {/* Address section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cart-summary-card rounded-2xl p-5 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <h2 className="font-ticket-display text-lg sm:text-xl font-bold cart-txt">Delivery Address</h2>
                {hasAddressComplete && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-ticket-body text-[10px] font-bold co-lime-soft" style={{ color: "var(--cart-lime)" }}>
                    <FaCheckCircle className="text-[9px]" /> Selected
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField icon={FaUser} label="Full Name" value={details.fullName} onChange={(v) => setField("fullName", v)} placeholder="Your name" error={errors.fullName} />
                <InputField icon={FaPhoneAlt} label="Phone" value={details.phone} onChange={(v) => setField("phone", v)} placeholder="+92 3XX XXXXXXX" error={errors.phone} />
                <div className="sm:col-span-2">
                  <SuggestInput icon={FaMapMarkerAlt} label="Address" value={details.address} onChange={(v) => setField("address", v)} placeholder="House #, street, area" suggestions={addressSuggestions} error={errors.address} />
                </div>
                <div className="sm:col-span-2">
                  <SuggestInput icon={FaCity} label="City" value={details.city} onChange={(v) => setField("city", v)} placeholder="Lahore" suggestions={CITIES} error={errors.city} />
                </div>
                <div className="sm:col-span-2">
                  <InputField icon={FaClipboardList} label="Delivery Notes (optional)" value={details.notes} onChange={(v) => setField("notes", v)} placeholder="Landmark, gate code, best time to call..." />
                </div>
              </div>
            </motion.div>

            {/* Payment Method section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="cart-summary-card rounded-2xl p-5 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <h2 className="font-ticket-display text-lg sm:text-xl font-bold cart-txt">Payment Method</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-ticket-body text-[10px] font-bold co-lime-soft" style={{ color: "var(--cart-lime)" }}>
                  <FaCheckCircle className="text-[9px]" /> Ready
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { id: "cod",       title: "Cash on Delivery",  sub: "Pay when you receive your order", icon: FaHandHoldingUsd, isNew: true },
                  { id: "easypaisa", title: "Easypaisa",         sub: "Transfer & upload TID",           img: EASYPAISA_LOGO },
                  { id: "bank",      title: "Meezan Bank",       sub: "Save PKR 300 on delivery",        img: MEEZAN_LOGO },
                ].map((m) => {
                  const active = method === m.id;
                  const Icon = m.icon;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-4 rounded-2xl transition-all text-left ${active ? "co-pay-active" : "co-pay-idle"}`}
                    >
                      <span
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cart-surface"
                        style={{ border: active ? "1px solid var(--cart-lime)" : "1px solid var(--cart-border)" }}
                      >
                        {m.img ? (
                          <img src={m.img} alt={m.title} className="h-5 sm:h-6 object-contain" />
                        ) : (
                          <Icon className="text-sm" style={{ color: active ? "var(--cart-lime)" : "var(--cart-txt-muted)" }} />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-ticket-body text-[13px] sm:text-[14px] font-bold cart-txt">{m.title}</p>
                          {m.isNew && (
                            <span
                              className="cod-new-badge inline-flex items-center px-2 py-0.5 rounded-full font-ticket-body text-[9px] font-black uppercase tracking-widest"
                              style={{
                                background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
                                color: "#fff",
                                boxShadow: "0 4px 10px -3px rgba(230,96,0,0.6)",
                              }}
                            >
                              New
                            </span>
                          )}
                        </div>
                        <p className="font-ticket-body text-[11px] sm:text-[12px] mt-0.5 cart-txt-muted">{m.sub}</p>
                      </div>
                      {active && (
                        <span
                          className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 px-2.5 py-1 rounded-full font-ticket-body text-[10px] font-extrabold uppercase tracking-wider"
                          style={{ background: "var(--cart-lime)", color: "var(--cart-lime-text)" }}
                        >
                          Selected
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {method === "cod" && (
                  <motion.div
                    key="cod"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4" style={{ borderTop: "1px solid var(--cart-border)" }}>
                      <div className="rounded-xl p-4 co-lime-soft">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(230,96,0,0.15)", border: "1px solid rgba(230,96,0,0.4)" }}
                          >
                            <FaHandHoldingUsd className="text-base" style={{ color: "var(--cart-lime)" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-ticket-display text-sm font-bold mb-1" style={{ color: "var(--cart-lime)" }}>
                              Pay in cash when your order arrives
                            </p>
                            <p className="font-ticket-body text-[12px] leading-relaxed cart-txt-muted">
                              No advance payment needed. Please keep <strong className="cart-txt">{formatRs(grandTotal)}</strong> ready at the time of delivery. Our rider will collect the exact amount.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px dashed rgba(230,96,0,0.4)" }}>
                          <FaTruck className="text-[11px] flex-shrink-0" style={{ color: "var(--cart-lime)" }} />
                          <p className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--cart-lime)" }}>
                            Delivery fee: {formatRs(DELIVERY_FEES.cod)} (includes COD handling)
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {method === "easypaisa" && (
                  <motion.div
                    key="easypaisa"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4" style={{ borderTop: "1px solid var(--cart-border)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <img src={EASYPAISA_LOGO} alt="Easypaisa" className="h-6 object-contain" />
                        <p className="font-ticket-display text-sm font-bold cart-txt">Easypaisa Transfer Details</p>
                      </div>
                      <div className="rounded-xl p-4 space-y-3 co-lime-soft">
                        {[
                          { key: "ep-mobile", label: "Easypaisa Number", value: EASYPAISA_DETAILS.mobileNumber },
                          { key: "ep-title", label: "Account Name", value: EASYPAISA_DETAILS.accountHolder },
                          { key: "ep-mid", label: "Merchant ID", value: EASYPAISA_DETAILS.merchantId },
                        ].map((row) => (
                          <div key={row.key} className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest cart-txt-muted">{row.label}</p>
                              <p className="font-ticket-body text-xs font-bold truncate cart-txt">{row.value}</p>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(row.value, row.key)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ border: "1px solid var(--cart-lime)", color: "var(--cart-lime)" }}
                            >
                              {copied === row.key ? <FaCheck className="text-[10px]" /> : <FaRegCopy className="text-[10px]" />}
                            </motion.button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <InputField icon={FaClipboardList} label="Easypaisa Transaction ID (TID)" value={details.txnRef} onChange={(v) => setField("txnRef", v)} placeholder="e.g. 1234567890" error={errors.txnRef} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {method === "bank" && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4" style={{ borderTop: "1px solid var(--cart-border)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <img src={MEEZAN_LOGO} alt="Meezan Bank" className="h-6 object-contain" />
                        <p className="font-ticket-display text-sm font-bold cart-txt">Meezan Bank Transfer Details</p>
                      </div>
                      <div className="rounded-xl p-4 space-y-3 co-lime-soft">
                        {[
                          { key: "bank", label: "Bank", value: BANK_DETAILS.bankName },
                          { key: "title", label: "Account Title", value: BANK_DETAILS.accountTitle },
                          { key: "acc", label: "Account No.", value: BANK_DETAILS.accountNumber },
                          { key: "iban", label: "IBAN", value: BANK_DETAILS.iban },
                          { key: "branch", label: "Branch", value: BANK_DETAILS.branch },
                        ].map((row) => (
                          <div key={row.key} className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest cart-txt-muted">{row.label}</p>
                              <p className="font-ticket-body text-xs font-bold truncate cart-txt">{row.value}</p>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(row.value, row.key)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ border: "1px solid var(--cart-lime)", color: "var(--cart-lime)" }}
                            >
                              {copied === row.key ? <FaCheck className="text-[10px]" /> : <FaRegCopy className="text-[10px]" />}
                            </motion.button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <InputField icon={FaClipboardList} label="Transfer Reference / TID" value={details.txnRef} onChange={(v) => setField("txnRef", v)} placeholder="e.g. TID-12345678" error={errors.txnRef} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Cart items list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="cart-summary-card rounded-2xl p-5 sm:p-7"
            >
              <h2 className="font-ticket-display text-lg sm:text-xl font-bold cart-txt mb-5">
                Your Items ({cartCount})
              </h2>

              <div>
                {cart.map((item, idx) => (
                  <div key={item.id} className={`flex gap-3 sm:gap-4 ${idx > 0 ? "pt-5 mt-5" : ""}`} style={idx > 0 ? { borderTop: "1px solid var(--cart-border)" } : {}}>
                    <div
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden cart-surface"
                      style={{ border: "1px solid var(--cart-border)" }}
                    >
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-ticket-display text-sm sm:text-lg font-bold cart-txt mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.category && (
                        <p className="font-ticket-body text-[11px] sm:text-xs cart-txt-muted mb-2 truncate">{item.category}</p>
                      )}
                      <p className="font-ticket-display text-sm sm:text-base font-bold cart-txt">
                        {formatRs(item.price * (item.qty || 1))}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <div
                        className="inline-flex items-center rounded-lg overflow-hidden"
                        style={{ border: "1px solid var(--cart-border)" }}
                      >
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center cart-txt hover:opacity-70 transition-opacity"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[9px]" />
                        </button>
                        <span className="w-7 sm:w-8 text-center font-ticket-body text-xs font-bold cart-txt">
                          {item.qty || 1}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center cart-txt hover:opacity-70 transition-opacity"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-[9px]" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mt-2 cart-txt hover:opacity-70 transition-opacity"
                        style={{ border: "1px solid var(--cart-border)" }}
                        aria-label="Remove item"
                      >
                        <FaTrashAlt className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* ══════ RIGHT: SUMMARY + COUPON ══════ */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit min-w-0">

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="cart-summary-card rounded-2xl p-5 sm:p-7"
            >
              <h2 className="font-ticket-display text-lg sm:text-2xl font-bold cart-txt mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <SummaryRow label="Sub Total" value={formatRs(subtotal)} />
                <SummaryRow label="Discount" value={formatRs(0)} />
                <SummaryRow label="Tax" value={formatRs(0)} />
                <SummaryRow label="Shipping" value={cart.length ? formatRs(shippingFee) : "Free"} valueColor={!cart.length ? "#e66000" : undefined} />
                <SummaryRow
                  label={`Delivery (${method === "cod" ? "COD" : method === "easypaisa" ? "Easypaisa" : "Meezan"})`}
                  value={formatRs(deliveryCharge)}
                />
                <div
                  className="pt-4 mt-2 flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--cart-border)" }}
                >
                  <span className="font-ticket-body text-sm font-bold cart-txt">Total</span>
                  <span className="font-ticket-display text-base sm:text-lg font-bold cart-txt">
                    {formatRs(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Bayana+ toggle */}
              <div className="mt-5 rounded-2xl p-4 flex items-center gap-3 co-lime-soft">
                <div className="flex-1 min-w-0">
                  <p className="font-ticket-body text-[13px] font-bold" style={{ color: "var(--cart-lime)" }}>
                    Bayana+
                  </p>
                  <p className="font-ticket-body text-[11px] mt-0.5 cart-txt-muted" style={{ opacity: 0.85 }}>
                    Kuch abhi, Baki Delivery kay waqt
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseBayana((v) => !v)}
                  className="relative w-12 h-7 rounded-full flex-shrink-0 transition-colors"
                  style={{ background: useBayana ? "var(--cart-lime)" : "rgba(255,255,255,0.4)" }}
                  aria-pressed={useBayana}
                >
                  <motion.span
                    className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
                    animate={{ left: useBayana ? 22 : 2 }}
                    transition={{ type: "spring", duration: 0.25 }}
                  />
                </button>
              </div>

              {/* Proceed / Place Order button */}
              <motion.button
                whileHover={{ scale: placing || connStatus !== "ok" ? 1 : 1.02 }}
                whileTap={{ scale: placing || connStatus !== "ok" ? 1 : 0.97 }}
                onClick={handleConfirm}
                disabled={placing || cart.length === 0 || connStatus !== "ok"}
                className="w-full mt-5 py-4 rounded-2xl font-ticket-body text-sm font-bold cart-lime-bg transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {placing ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="inline-block h-4 w-4 rounded-full relative z-10"
                      style={{ border: "2px solid #FFFFFF", borderTopColor: "transparent" }}
                    />
                    <span className="relative z-10">Placing Order…</span>
                  </>
                ) : connStatus !== "ok" ? (
                  <>
                    <FaExclamationCircle className="text-xs relative z-10" />
                    <span className="relative z-10">
                      {connStatus === "checking" ? "Connecting…" : "Cannot place order"}
                    </span>
                  </>
                ) : (
                  <>
                    {method === "cod" ? <FaHandHoldingUsd className="text-xs relative z-10" /> : <FaLock className="text-xs relative z-10" />}
                    <span className="relative z-10">
                      {method === "cod" ? `Confirm COD Order · ${formatRs(grandTotal)}` : `Place Order · ${formatRs(grandTotal)}`}
                    </span>
                  </>
                )}
              </motion.button>

              <p className="font-ticket-body text-xs cart-txt-muted text-center mt-5">
                Estimated Delivery by{" "}
                <strong className="cart-txt">
                  {(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); })()}
                </strong>
              </p>
            </motion.div>

            {/* Coupon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="cart-coupon-card rounded-2xl p-5 sm:p-7"
            >
              <h2 className="font-ticket-display text-lg sm:text-xl font-bold cart-txt mb-4">
                Have a Coupon?
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl font-ticket-body text-sm outline-none cart-surface cart-txt co-input"
                />
                <button
                  className="px-4 sm:px-5 py-3 rounded-xl font-ticket-body text-sm font-bold transition-colors flex-shrink-0"
                  style={{ color: "#e66000", background: "transparent" }}
                  onClick={() => pushToast("info", "Coupon", "Coupon validation coming soon.")}
                >
                  Apply
                </button>
              </div>
            </motion.div>

            {/* Payment Methods Quick Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod("cod")}
                className={`cart-pay-btn rounded-2xl py-3.5 sm:py-4 px-3 sm:px-4 flex items-center justify-center gap-2 font-ticket-body text-xs sm:text-sm font-bold transition-colors ${method === "cod" ? "ring-2 ring-offset-0" : ""}`}
                style={method === "cod" ? { outline: "2px solid var(--cart-lime)" } : {}}
              >
                <FaWallet className="text-sm flex-shrink-0" />
                <span className="truncate">Cash Payment</span>
              </button>
              <button
                onClick={() => setMethod("bank")}
                className={`cart-pay-btn rounded-2xl py-3.5 sm:py-4 px-3 sm:px-4 flex items-center justify-center gap-2 font-ticket-body text-xs sm:text-sm font-bold transition-colors ${method === "bank" ? "ring-2 ring-offset-0" : ""}`}
                style={method === "bank" ? { outline: "2px solid var(--cart-lime)" } : {}}
              >
                <FaUniversity className="text-sm flex-shrink-0" />
                <span className="truncate">Online Payment</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="font-ticket-body text-[10px] inline-flex items-center gap-1.5 cart-txt-muted">
                <FaLock className="text-[9px]" /> Encrypted
              </span>
              <span className="cart-txt-faint">·</span>
              <span className="font-ticket-body text-[10px] inline-flex items-center gap-1.5 cart-txt-muted">
                <FaShieldAlt className="text-[9px]" /> Buyer Protection
              </span>
              <span className="cart-txt-faint">·</span>
              <span className="font-ticket-body text-[10px] inline-flex items-center gap-1.5 cart-txt-muted">
                <FaTruck className="text-[9px]" /> 2–4 Days
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
const SummaryRow = ({ label, value, valueColor }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="font-ticket-body text-sm cart-txt-muted truncate">{label}</span>
    <span
      className="font-ticket-body text-sm font-bold cart-txt flex-shrink-0"
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </span>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, icon: Icon, error }) => (
  <div>
    <label className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-1 block cart-txt-muted">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "var(--cart-lime)" }} />}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`font-ticket-body w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 rounded-xl text-sm outline-none transition-all co-input ${error ? "co-input-error" : ""}`}
      />
    </div>
    {error && (
      <p className="font-ticket-body text-[10px] mt-1 flex items-center gap-1" style={{ color: "var(--cart-danger)" }}>
        <FaExclamationCircle className="text-[9px]" /> {error}
      </p>
    )}
  </div>
);

export default Checkout;