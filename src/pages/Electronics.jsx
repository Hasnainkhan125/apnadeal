// pages/Electronics.jsx — Ticket Design System + Supabase + Cart + Modern Snackbar + MiniCart + Sold lock
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { readCart, writeCart } from "../lib/cartStore";
import {
  FaLaptop,
  FaTv,
  FaCamera,
  FaHeadphones,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaClock,
  FaBolt,
  FaThLarge,
  FaList,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaSlidersH,
  FaSpinner,
  FaShoppingCart,
  FaCheck,
  FaExclamationCircle,
  FaTrash,
  FaArrowRight,
  FaLock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   ELECTRONICS — THEME TOKENS (CSS variables)
   ═══════════════════════════════════════════════════════════════ */
const ElectronicsStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ── DARK THEME ─────────────────────────────────────────── */
    .theme-dark {
      --el-bg-1:           #0A0A12;
      --el-bg-2:           #0F0F1A;
      --el-panel:          rgba(255,255,255,0.045);
      --el-panel-2:        rgba(255,255,255,0.02);
      --el-line:           rgba(255,255,255,0.08);
      --el-line-str:       rgba(255,255,255,0.15);
      --el-txt:            #FFFFFF;
      --el-txt-soft:       rgba(255,255,255,0.65);
      --el-txt-faint:      rgba(255,255,255,0.45);
      --el-dot:            rgba(255,255,255,0.06);
      --el-primary:        #fc9d03;
      --el-primary-2:      #f59e0b;
      --el-primary-3:      #c8631f;
      --el-primary-soft:   rgba(252,157,3,0.14);
      --el-primary-glow:   rgba(252,157,3,0.45);
      --el-danger:         #B23A2E;
      --el-danger-soft:    rgba(178,58,46,0.14);
      /* Clean card image tile + heart button */
      --el-img-bg:         #0A0A12;
      --el-heart-bg:       rgba(255,255,255,0.10);
      --el-heart-ink:      rgba(255,255,255,0.75);
      --el-heart-border:   rgba(255,255,255,0.12);
      /* Card modern */
      --el-card-bg:        rgba(255,255,255,0.03);
      --el-card-border:    rgba(255,255,255,0.06);
      --el-card-shadow:    0 4px 20px -8px rgba(0,0,0,0.5);
      --el-card-shadow-hover: 0 20px 40px -12px rgba(0,0,0,0.7);
      --el-card-accent:    rgba(252,157,3,0.3);
    }

    /* ── LIGHT THEME ────────────────────────────────────────── */
    .theme-light {
      --el-bg-1:           #FFFFFF;
      --el-bg-2:           #FAF7F3;
      --el-panel:          rgba(255,255,255,0.85);
      --el-panel-2:        rgba(255,255,255,0.95);
      --el-line:           rgba(20,20,30,0.08);
      --el-line-str:       rgba(20,20,30,0.15);
      --el-txt:            #1A1613;
      --el-txt-soft:       rgba(26,22,19,0.62);
      --el-txt-faint:      rgba(26,22,19,0.42);
      --el-dot:            rgba(20,20,30,0.08);
      --el-primary:        #c8631f;
      --el-primary-2:      #fc9d03;
      --el-primary-3:      #f59e0b;
      --el-primary-soft:   rgba(200,99,31,0.10);
      --el-primary-glow:   rgba(200,99,31,0.35);
      --el-danger:         #B23A2E;
      --el-danger-soft:    rgba(178,58,46,0.10);
      /* Clean card image tile + heart button */
      --el-img-bg:         #FFFFFF;
      --el-heart-bg:       rgba(255,255,255,0.95);
      --el-heart-ink:      var(--el-txt);
      --el-heart-border:   rgba(20,20,30,0.06);
      /* Card modern */
      --el-card-bg:        rgba(255,255,255,0.9);
      --el-card-border:    rgba(20,20,30,0.06);
      --el-card-shadow:    0 4px 16px -6px rgba(0,0,0,0.08);
      --el-card-shadow-hover: 0 20px 40px -12px rgba(0,0,0,0.15);
      --el-card-accent:    rgba(200,99,31,0.2);
    }

    /* ── Utilities ──────────────────────────────────────────── */
    .el-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--el-primary-soft), transparent 60%),
        linear-gradient(180deg, var(--el-bg-1) 0%, var(--el-bg-2) 100%);
      color: var(--el-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .el-panel-solid {
      background: var(--el-bg-1);
      border: 1px solid var(--el-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .el-panel {
      background: var(--el-panel);
      border: 1px solid var(--el-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .el-input {
      background: var(--el-bg-1);
      color: var(--el-txt);
      border: 1px solid var(--el-line-str);
      transition: border-color 0.2s ease;
    }
    /* Modern premium card */
    .el-card-modern {
      background: var(--el-card-bg);
      border: 1px solid var(--el-card-border);
      box-shadow: var(--el-card-shadow);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .el-card-modern:hover {
      transform: translateY(-6px);
      box-shadow: var(--el-card-shadow-hover);
      border-color: var(--el-primary);
    }
    .el-img-tile {
      background: var(--el-img-bg);
    }

    @keyframes sweep {
      0%   { transform: translateX(-150%) skewX(-20deg); }
      60%  { transform: translateX(350%)  skewX(-20deg); }
      100% { transform: translateX(350%)  skewX(-20deg); }
    }
  `}</style>
);

/* ────────────────────────────────────────────────────────────
   REUSABLE SOLD STAMP
   ──────────────────────────────────────────────────────────── */
const SoldStamp = ({ size = "md" }) => {
  const sizes = {
    sm: { stamp: "px-3.5 py-1.5 gap-1.5 rounded-lg", text: "text-xs sm:text-sm tracking-[0.18em]", icon: "h-4 w-4", svg: "h-2.5 w-2.5", rotate: "-rotate-[9deg]" },
    md: { stamp: "px-5 py-2 gap-2 rounded-xl",       text: "text-base sm:text-lg tracking-[0.2em]", icon: "h-5 w-5", svg: "h-3 w-3", rotate: "-rotate-[10deg]" },
    lg: { stamp: "px-7 py-3 gap-2.5 rounded-2xl",    text: "text-xl sm:text-2xl tracking-[0.22em]", icon: "h-6 w-6", svg: "h-3.5 w-3.5", rotate: "-rotate-[11deg]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`relative ${s.rotate} flex flex-col items-center`}>
      <div className="absolute inset-0 translate-y-1 rounded-xl bg-black/40 blur-[6px]" />
      <div
        className={`relative flex items-center ${s.stamp}`}
        style={{
          background: "linear-gradient(135deg, var(--el-primary) 0%, var(--el-primary-3) 100%)",
          boxShadow: "0 12px 30px -8px var(--el-primary-glow), 0 0 0 2px rgba(255,255,255,0.9) inset, 0 0 0 4px var(--el-primary-soft) inset",
        }}
      >
        <span className={`relative flex ${s.icon} items-center justify-center rounded-full bg-white/20 ring-1 ring-white/50`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={s.svg}>
            <polyline points="5 12 10 17 19 8" />
          </svg>
        </span>
        <span className={`font-ticket-display ${s.text} font-bold text-white leading-none`}>
          SOLD
        </span>
        <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
          <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[sweep_2.8s_ease-in-out_infinite]" />
        </span>
      </div>
      <div className="mt-1 h-1 w-3/4 rounded-full bg-black/40 blur-[3px]" />
    </div>
  );
};

/* ─── Full-cover overlay for card image ─── */
const SoldOverlay = ({ size = "md" }) => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
    <div
      className="absolute inset-0 opacity-[0.14]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, #ffffff 0 2px, transparent 2px 12px)",
      }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-2xl opacity-50"
      style={{ background: "var(--el-primary)" }}
    />
    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br-md" />

    <div className="absolute inset-0 flex items-center justify-center">
      <SoldStamp size={size} />
    </div>
  </div>
);

const categories = [
  { id: "all", label: "All Electronics", icon: FaLaptop },
  { id: "Laptops", label: "Laptops", icon: FaLaptop },
  { id: "TVs", label: "TVs", icon: FaTv },
  { id: "Cameras", label: "Cameras", icon: FaCamera },
  { id: "Audio", label: "Audio", icon: FaHeadphones },
  { id: "Gaming", label: "Gaming", icon: FaBolt },
];

const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

const timeAgo = (iso) => {
  if (!iso) return "recently";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
};

const normalizeSubcategory = (raw) => {
  if (!raw) return "Laptops";
  const c = String(raw).trim();
  const lower = c.toLowerCase();
  if (lower.includes("laptop") || lower.includes("macbook") || lower.includes("notebook")) return "Laptops";
  if (lower.includes("tv") || lower.includes("television")) return "TVs";
  if (lower.includes("camera")) return "Cameras";
  if (lower.includes("audio") || lower.includes("headphone") || lower.includes("speaker")) return "Audio";
  if (lower.includes("gaming") || lower.includes("console") || lower.includes("playstation") || lower.includes("xbox")) return "Gaming";
  return c;
};

const formatRs = (num) => `Rs ${Number(num || 0).toLocaleString("en-US")}`;

/* ────────────────────────────────────────────────────────────
   MODERN TOAST
   ──────────────────────────────────────────────────────────── */
const Toast = ({ toast, onDismiss, duration = 2600 }) => {
  const isError = toast?.type === "error";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 28, scale: 0.94, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 20, scale: 0.94, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          onClick={onDismiss}
          role="status"
          className="fixed top-20 right-4 z-[200] cursor-pointer select-none max-w-[calc(100vw-2rem)]"
        >
          <div
            className="relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-[0_12px_36px_-12px_rgba(0,0,0,0.28)] w-[280px]"
            style={{
              background: "var(--el-bg-1)",
              borderColor: isError ? "var(--el-danger)" : "var(--el-primary)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: isError
                  ? "linear-gradient(90deg, transparent, var(--el-danger), transparent)"
                  : "linear-gradient(90deg, transparent, var(--el-primary), transparent)",
              }}
            />

            <div className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-2">
              <div
                className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center relative"
                style={{
                  background: isError ? "var(--el-danger-soft)" : "var(--el-primary-soft)",
                  boxShadow: isError
                    ? "0 0 0 1px var(--el-danger) inset"
                    : "0 0 0 1px var(--el-primary) inset",
                }}
              >
                {isError ? (
                  <FaExclamationCircle className="text-[10px]" style={{ color: "var(--el-danger)" }} />
                ) : (
                  <FaCheck className="text-[10px]" style={{ color: "var(--el-primary-2)" }} />
                )}
                <motion.span
                  initial={{ opacity: 0.55, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.9 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: isError
                      ? "0 0 0 2px var(--el-danger)"
                      : "0 0 0 2px var(--el-primary)",
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-ticket-body text-[11px] font-extrabold truncate leading-tight"
                  style={{ color: "var(--el-txt)" }}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="font-ticket-body text-[9.5px] truncate leading-tight mt-0.5"
                    style={{ color: "var(--el-txt-soft)" }}>
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                aria-label="Dismiss"
                className="flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center transition-colors"
                style={{ color: "var(--el-txt-soft)" }}
              >
                <FaTimes className="text-[9px]" />
              </button>
            </div>

            <motion.div
              key={toast.id + "-bar"}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{
                transformOrigin: "left",
                height: 2,
                background: isError
                  ? "linear-gradient(90deg, var(--el-danger), var(--el-danger))"
                  : "linear-gradient(90deg, var(--el-primary), var(--el-primary-3))",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────
   MINI CART POPOVER
   ──────────────────────────────────────────────────────────── */
const MiniCartPopover = ({ open, onClose, cart, onRemove, detailPath }) => {
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const subtotal = cart.reduce(
    (s, c) => s + (Number(c.price) || 0) * (c.qty || 1),
    0
  );
  const count = cart.reduce((s, c) => s + (c.qty || 1), 0);

  const goToDetail = (item) => {
    onClose();
    navigate(`${detailPath}/${item.id}`);
  };
  const goToFullCart = () => {
    onClose();
    navigate("/cart");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="absolute right-0 top-[calc(100%+10px)] z-[150] w-[340px] max-w-[calc(100vw-1rem)] rounded-2xl shadow-[0_25px_70px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
          style={{ background: "var(--el-bg-1)", border: "1px solid var(--el-line)" }}
          role="dialog"
          aria-label="Mini cart"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--el-primary), transparent)",
            }}
          />

          <div className="flex items-center justify-between px-4 pt-3.5 pb-3" style={{ borderBottom: "1px solid var(--el-line)" }}>
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-[12px]" style={{ color: "var(--el-primary-2)" }} />
              <span className="font-ticket-display text-sm font-bold" style={{ color: "var(--el-txt)" }}>
                Your Cart
              </span>
              <span className="font-ticket-body text-[10px] font-bold" style={{ color: "var(--el-txt-soft)" }}>
                · {count} {count === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ color: "var(--el-txt-soft)" }}
              aria-label="Close cart"
            >
              <FaTimes className="text-[10px]" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FaShoppingCart className="text-2xl mx-auto mb-2" style={{ color: "var(--el-txt-faint)" }} />
              <p className="font-ticket-body text-xs" style={{ color: "var(--el-txt-soft)" }}>
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="max-h-[280px] overflow-y-auto py-2">
              {cart.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-2.5"
                >
                  <div
                    className="h-11 w-11 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ border: "1px solid var(--el-line)", background: "var(--el-img-bg)" }}
                  >
                    <img
                      src={item.image || "/car5.png"}
                      alt={item.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-ticket-body text-[11px] font-bold truncate leading-tight" style={{ color: "var(--el-txt)" }}>
                      {item.title}
                    </p>
                    <p className="font-ticket-body text-[9px] truncate mt-0.5" style={{ color: "var(--el-txt-soft)" }}>
                      {item.location || item.category} · Qty {item.qty || 1}
                    </p>

                    <button
                      onClick={() => goToDetail(item)}
                      className="mt-1 inline-flex items-center gap-1 font-ticket-body text-[9.5px] font-bold underline underline-offset-2"
                      style={{ color: "var(--el-primary-2)" }}
                    >
                      Learn more
                      <FaArrowRight className="text-[7px]" />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="font-ticket-display text-[11px] font-bold tabular-nums" style={{ color: "var(--el-txt)" }}>
                      {formatRs((item.price || 0) * (item.qty || 1))}
                    </p>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="h-6 w-6 rounded-md flex items-center justify-center transition-colors"
                      style={{ color: "var(--el-danger)" }}
                      aria-label={`Remove ${item.title}`}
                      title="Remove"
                    >
                      <FaTrash className="text-[9px]" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length > 5 && (
                <p className="px-4 py-2 font-ticket-body text-[10px] text-center" style={{ color: "var(--el-txt-soft)" }}>
                  +{cart.length - 5} more items
                </p>
              )}
            </div>
          )}

          {cart.length > 0 && (
            <div className="px-4 py-3" style={{ borderTop: "1px solid var(--el-line)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--el-txt-soft)" }}>
                  Subtotal
                </span>
                <span className="font-ticket-display text-base font-bold tabular-nums" style={{ color: "var(--el-primary-2)" }}>
                  {formatRs(subtotal)}
                </span>
              </div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToFullCart}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-ticket-body text-[11px] font-extrabold tracking-wide text-white"
                style={{ background: "var(--el-primary)" }}
              >
                View full cart
                <FaArrowRight className="text-[9px]" />
              </motion.button>

              <button
                onClick={goToFullCart}
                className="mt-2 w-full text-center font-ticket-body text-[9.5px] underline decoration-dotted underline-offset-2 transition-colors"
                style={{ color: "var(--el-txt-soft)" }}
              >
                Learn more about orders & checkout
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Electronics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [cart, setCart] = useState(() => readCart());
  const [toast, setToast] = useState(null);
  const [cartBump, setCartBump] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const prevCountRef = useRef(0);

  const pushToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToast({ id, type, title, message });
    setTimeout(() => setToast(null), 2600);
  };

  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);

  useEffect(() => {
    if (prevCountRef.current !== cartCount) {
      setCartBump((n) => n + 1);
      prevCountRef.current = cartCount;
    }
  }, [cartCount]);

  useEffect(() => {
    const onUpdate = () => setCart(readCart());
    window.addEventListener("cart:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cart:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const handleAddToCart = (item, e) => {
    if (e) e.stopPropagation();
    if (item.sold) {
      pushToast("error", "This item is sold", "No longer available.");
      return;
    }
    const exists = cart.find((c) => c.id === item.id);
    const next = exists
      ? cart.map((c) =>
          c.id === item.id ? { ...c, qty: (c.qty || 1) + 1 } : c
        )
      : [
          ...cart,
          {
            id: item.id,
            title: item.title,
            price: Number(item.price) || 0,
            image: item.image,
            location: item.location,
            category: item.category,
            qty: 1,
          },
        ];
    setCart(next);
    writeCart(next);
    pushToast(
      "success",
      "Added to cart",
      `${item.title} · ${formatRs(item.price)}`
    );
  };

  const handleRemoveFromCart = (id) => {
    const next = cart.filter((c) => c.id !== id);
    setCart(next);
    writeCart(next);
    pushToast("success", "Removed", "Item removed from cart");
  };

  const handleCardClick = (item) => {
    if (item.sold) {
      pushToast("error", "This item is sold", "No longer available.");
      return;
    }
    navigate(`/electronic/${item.id}`);
  };

  useEffect(() => {
    const fetchElectronics = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .ilike("category", "electronics")
          .order("posted_at", { ascending: false });

        if (error) {
          console.error("❌ Supabase error:", error);
          throw error;
        }

        const visible = (data || []).filter((item) => {
          const status = (item.status || "").toLowerCase().trim();
          return status !== "removed" && status !== "deleted";
        });

        const mapped = visible.map((item) => {
          const status = (item.status || "").toLowerCase().trim();
          return {
            id: item.id,
            category: normalizeSubcategory(item.subcategory || item.specs?.type),
            type: (item.subcategory || "laptop").toLowerCase(),
            title: item.title,
            storage: item.specs?.storage || item.specs?.size || "—",
            condition: item.condition || "—",
            warranty: item.specs?.warranty || "—",
            location: item.area ? `${item.area}, ${item.city}` : item.city || "—",
            price: Number(item.price) || 0,
            image: item.cover_image || item.images?.[0] || "/car5.png",
            verified: item.verified || false,
            featured: item.featured || false,
            status: item.status,
            sold: status === "sold",
            postedAgo: timeAgo(item.posted_at),
          };
        });

        setListings(mapped);
      } catch (err) {
        console.error("❌ Fetch electronics error:", err);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectronics();
  }, [user]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id);

        if (error) throw error;
        setFavorites((data || []).map((f) => f.listing_id));
      } catch (err) {
        console.error("Fetch favorites error:", err);
      }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      pushToast("error", "Sign in required", "Please sign in to save favorites.");
      return;
    }

    const isFav = favorites.includes(id);

    setFavorites((prev) =>
      isFav ? prev.filter((f) => f !== id) : [...prev, id]
    );

    try {
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: id });
        if (error) throw error;
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      setFavorites((prev) =>
        isFav ? [...prev, id] : prev.filter((f) => f !== id)
      );
    }
  };

  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (activeCategory !== "all")
      result = result.filter((v) => v.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.location?.toLowerCase().includes(q)
      );
    }
    result = result.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [listings, activeCategory, searchQuery, sortBy, priceRange]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen el-bg relative">
      <ElectronicsStyles />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(var(--el-primary) 0.6px, transparent 0.6px)`,
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div
            className="h-11 w-11 rounded-xl border flex items-center justify-center el-panel-solid"
            style={{ borderColor: "var(--el-primary)" }}
          >
            <FaLaptop className="text-base" style={{ color: "var(--el-primary-2)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-ticket-display text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: "var(--el-txt)" }}>
              Electronics
            </h1>
            <p className="font-ticket-body text-xs sm:text-sm" style={{ color: "var(--el-txt-soft)" }}>
              {isLoading
                ? "Loading..."
                : `${filteredListings.length} listings · laptops, TVs, cameras & more`}
            </p>
          </div>

          {/* Cart button */}
          <div className="relative">
            <motion.button
              key={cartBump}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setCartOpen((v) => !v)}
              aria-label={`Open cart preview, ${cartCount} items`}
              aria-expanded={cartOpen}
              className="relative inline-flex items-center gap-2.5 pl-3 pr-3.5 py-2.5 rounded-xl border el-panel-solid transition-colors group/cart"
              style={{ borderColor: "var(--el-primary)" }}
            >
              <span className="relative inline-flex items-center justify-center">
                <FaShoppingCart className="text-[13px]" style={{ color: "var(--el-primary-2)" }} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shadow-[0_4px_12px_-2px_var(--el-primary-glow)] ring-2"
                      style={{
                        background: "linear-gradient(135deg, var(--el-primary), var(--el-primary-3))",
                        ["--tw-ring-color"]: "var(--el-bg-1)",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>

              <span className="hidden sm:inline font-ticket-body text-xs font-extrabold tracking-wide"
                style={{ color: "var(--el-txt)" }}>
                Cart
              </span>

              <span className="pointer-events-none absolute inset-y-1.5 left-0 w-px"
                style={{ background: "var(--el-line)" }} />
            </motion.button>

            <MiniCartPopover
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              cart={cart}
              onRemove={handleRemoveFromCart}
              detailPath="/electronic"
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="el-panel-solid rounded-[22px] p-3 sm:p-4 mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <FaSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "var(--el-primary-2)" }}
              />
              <input
                type="text"
                placeholder="Search electronics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="font-ticket-body w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none el-input"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-ticket-body appearance-none pl-4 pr-9 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer el-input"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FaChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                style={{ color: "var(--el-primary-2)" }}
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl p-1 el-panel-solid">
              {[
                { id: "grid", icon: FaThLarge },
                { id: "list", icon: FaList },
              ].map((v) => {
                const Icon = v.icon;
                const active = viewMode === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setViewMode(v.id)}
                    className="relative p-2 rounded-lg"
                    style={{ color: active ? "#fff" : "var(--el-txt-soft)" }}
                  >
                    {active && (
                      <motion.div
                        layoutId="vm-elec"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: "var(--el-primary)" }}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <Icon className="text-xs relative z-10" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-ticket-body text-xs font-bold el-panel-solid"
              style={{ color: "var(--el-txt)" }}
            >
              <FaSlidersH className="text-[10px]" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          {/* Filters */}
          <aside className={`lg:block ${showMobileFilters ? "block" : "hidden"}`}>
            <div className="el-panel-solid rounded-[22px] p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: "1px solid var(--el-line)" }}>
                <FaFilter className="text-xs" style={{ color: "var(--el-primary-2)" }} />
                <span className="font-ticket-display text-sm font-bold" style={{ color: "var(--el-txt)" }}>
                  Filters
                </span>
              </div>
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--el-txt-soft)" }}>
                Category
              </p>
              <div className="space-y-1 mb-6">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const active = activeCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCategory(c.id);
                        setCurrentPage(1);
                      }}
                      className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-ticket-body text-xs font-bold"
                      style={
                        active
                          ? { background: "var(--el-primary)", color: "#fff" }
                          : { color: "var(--el-txt)" }
                      }
                    >
                      <Icon
                        className="text-xs"
                        style={{ color: active ? "#ffffff" : "var(--el-primary-2)" }}
                      />
                      <span className="flex-1 text-left">{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--el-txt-soft)" }}>
                Max Price
              </p>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full mb-2"
                style={{ accentColor: "var(--el-primary)" }}
              />
              <p className="font-ticket-body text-[10px] font-bold mb-5" style={{ color: "var(--el-txt)" }}>
                {formatRs(priceRange[1])}
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  setPriceRange([0, 500000]);
                }}
                className="w-full py-2.5 rounded-xl font-ticket-body text-xs font-bold transition-colors"
                style={{ border: "1px solid var(--el-line-str)", color: "var(--el-txt)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--el-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--el-line-str)"; }}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Listings */}
          <div>
            {isLoading ? (
              <div className="el-panel-solid rounded-[22px] py-20 text-center">
                <FaSpinner
                  className="text-3xl mx-auto mb-4 animate-spin"
                  style={{ color: "var(--el-primary-2)" }}
                />
                <p className="font-ticket-body text-sm" style={{ color: "var(--el-txt-soft)" }}>
                  Loading electronics...
                </p>
              </div>
            ) : paginatedListings.length === 0 ? (
              <div className="el-panel-solid rounded-[22px] py-16 text-center">
                <FaLaptop className="text-4xl mx-auto mb-4" style={{ color: "var(--el-txt-faint)" }} />
                <p className="font-ticket-display text-lg font-bold mb-1" style={{ color: "var(--el-txt)" }}>
                  No electronics found
                </p>
                <p className="font-ticket-body text-xs" style={{ color: "var(--el-txt-soft)" }}>
                  Try adjusting your filters or search
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {paginatedListings.map((v, i) => {
                    const locked = v.sold;
                    return (
                      <motion.div
                        key={v.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        onClick={() => handleCardClick(v)}
                        className={`group/card relative flex flex-col el-card-modern rounded-2xl overflow-hidden ${
                          locked ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        {/* Accent line on top */}
                        <div
                          className="absolute top-0 left-0 right-0 h-[3px] z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                          style={{ background: "var(--el-card-accent)" }}
                        />

                        {/* Image tile — clean */}
                        <div className="relative aspect-[4/3] overflow-hidden el-img-tile">
                          <img
                            src={v.image}
                            alt={v.title}
                            className={`w-full h-full object-contain transition-transform duration-500 ${
                              locked ? "" : "group-hover/card:scale-[1.03]"
                            } ${locked ? "opacity-50 grayscale-[30%]" : ""}`}
                            loading="lazy"
                          />

                          {/* Category badge */}
                          {!locked && (
                            <div
                              className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-ticket-body text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm"
                              style={{
                                background: "var(--el-heart-bg)",
                                color: "var(--el-txt-soft)",
                                border: "1px solid var(--el-heart-border)",
                              }}
                            >
                              {v.category}
                            </div>
                          )}

                          {locked && <SoldOverlay size="md" />}

                          {/* Favorite heart */}
                          {!locked && (
                            <button
                              onClick={(e) => toggleFavorite(v.id, e)}
                              aria-label="Toggle favorite"
                              className="absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                              style={{
                                background: "var(--el-heart-bg)",
                                color: "var(--el-heart-ink)",
                                border: "1px solid var(--el-heart-border)",
                                boxShadow: "0 4px 14px -6px rgba(0,0,0,0.25)",
                              }}
                            >
                              {favorites.includes(v.id) ? (
                                <FaHeart className="text-[13px]" style={{ color: "var(--el-primary)" }} />
                              ) : (
                                <FaRegHeart className="text-[13px]" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Info block */}
                        <div className="pt-4 px-4 pb-4 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className="font-ticket-display text-xl sm:text-2xl font-extrabold tracking-tight tabular-nums"
                              style={{
                                color: locked ? "var(--el-txt-soft)" : "var(--el-txt)",
                                textDecoration: locked ? "line-through" : "none",
                              }}
                            >
                              {formatRs(v.price)}
                            </p>
                            {v.verified && (
                              <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold flex-shrink-0 mt-1" style={{ color: "var(--el-primary-2)" }}>
                                <FaCheckCircle className="text-[8px]" /> Verified
                              </span>
                            )}
                          </div>

                          <p
                            className="font-ticket-body text-[13px] sm:text-sm mt-1.5 truncate"
                            style={{ color: "var(--el-txt-soft)" }}
                          >
                            {v.location}
                          </p>

                          {/* Meta line: spec · condition · category */}
                          <p
                            className="font-ticket-body text-[11.5px] sm:text-xs mt-1 truncate"
                            style={{ color: "var(--el-txt-faint)" }}
                          >
                            {[v.storage, v.condition, v.category]
                              .filter((x) => x && x !== "—")
                              .join(" · ")}
                          </p>

                          {/* Actions — ALWAYS VISIBLE */}
                          {!locked && (
                            <div className="mt-4 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--el-line)" }}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => handleAddToCart(v, e)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                                style={{
                                  border: "1px solid var(--el-line-str)",
                                  color: "var(--el-txt)",
                                  background: "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "var(--el-primary)";
                                  e.currentTarget.style.borderColor = "var(--el-primary)";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                  e.currentTarget.style.borderColor = "var(--el-line-str)";
                                  e.currentTarget.style.color = "var(--el-txt)";
                                }}
                              >
                                <FaShoppingCart className="text-[10px]" />
                                Add to cart
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/electronic/${v.id}`); }}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                                style={{
                                  background: "var(--el-primary)",
                                  color: "white",
                                  border: "1px solid var(--el-primary)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "var(--el-primary-3)";
                                  e.currentTarget.style.borderColor = "var(--el-primary-3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "var(--el-primary)";
                                  e.currentTarget.style.borderColor = "var(--el-primary)";
                                }}
                              >
                                <FaEye className="text-[10px]" />
                                View
                              </motion.button>
                            </div>
                          )}

                          {locked && (
                            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--el-line)" }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/electronic/${v.id}`);
                                }}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold underline decoration-dotted underline-offset-2"
                                style={{ color: "var(--el-primary-2)" }}
                              >
                                <FaCheckCircle className="text-[10px]" />
                                Sold · View details
                                <FaArrowRight className="text-[9px]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedListings.map((v) => {
                  const locked = v.sold;
                  return (
                    <motion.div
                      key={v.id}
                      layout
                      onClick={() => handleCardClick(v)}
                      className={`el-panel-solid rounded-[22px] flex flex-col sm:flex-row overflow-hidden ${locked ? "cursor-default" : "cursor-pointer"}`}
                      onMouseEnter={(e) => {
                        if (!locked) e.currentTarget.style.borderColor = "var(--el-primary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!locked) e.currentTarget.style.borderColor = "var(--el-line)";
                      }}
                    >
                      <div className="relative sm:w-56 aspect-[4/3] sm:aspect-auto el-img-tile flex-shrink-0">
                        <img
                          src={v.image}
                          alt={v.title}
                          className={`w-full h-full object-contain p-3 ${locked ? "opacity-50 grayscale-[30%]" : ""}`}
                          loading="lazy"
                        />

                        {locked && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <SoldStamp size="sm" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="font-ticket-body text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit"
                            style={{ borderColor: "var(--el-primary)", color: "var(--el-primary-2)" }}
                          >
                            {v.category}
                          </span>
                          {v.verified && (
                            <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold" style={{ color: "var(--el-primary-2)" }}>
                              <FaCheckCircle className="text-[8px]" /> Verified
                            </span>
                          )}
                          {locked && (
                            <span
                              className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
                              style={{ background: "var(--el-primary)" }}
                            >
                              <FaCheckCircle className="text-[8px]" /> Sold
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-ticket-display text-lg font-bold mb-1 line-clamp-1"
                          style={{ color: locked ? "var(--el-txt-soft)" : "var(--el-txt)" }}
                        >
                          {v.title}
                        </h3>
                        <p className="font-ticket-body text-[10px] mb-3 truncate" style={{ color: "var(--el-txt-soft)" }}>
                          {v.location} · {v.storage} · {v.condition}
                        </p>
                        <div className="mt-auto pt-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--el-line)" }}>
                          <p
                            className="font-ticket-display text-xl font-bold"
                            style={{
                              color: locked ? "var(--el-txt-soft)" : "var(--el-primary-2)",
                              textDecoration: locked ? "line-through" : "none",
                            }}
                          >
                            {formatRs(v.price)}
                          </p>
                          {locked ? (
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[10px] font-bold cursor-not-allowed select-none"
                              style={{
                                border: "1px dashed var(--el-txt-faint)",
                                background: "var(--el-bg-1)",
                                color: "var(--el-txt-soft)",
                              }}
                            >
                              <FaLock className="text-[9px]" />
                              Sold
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleAddToCart(v, e)}
                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
                                style={{ border: "1px solid var(--el-line-str)", color: "var(--el-txt)" }}
                                aria-label="Add to cart"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "var(--el-primary)";
                                  e.currentTarget.style.borderColor = "var(--el-primary)";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "";
                                  e.currentTarget.style.borderColor = "var(--el-line-str)";
                                  e.currentTarget.style.color = "var(--el-txt)";
                                }}
                              >
                                <FaShoppingCart className="text-[11px]" />
                              </motion.button>
                              <button
                                onClick={(e) => toggleFavorite(v.id, e)}
                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
                                style={{ border: "1px solid var(--el-line-str)", color: "var(--el-txt)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "var(--el-primary)";
                                  e.currentTarget.style.color = "var(--el-primary-2)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "var(--el-line-str)";
                                  e.currentTarget.style.color = "var(--el-txt)";
                                }}
                                aria-label="Toggle favorite"
                              >
                                {favorites.includes(v.id) ? (
                                  <FaHeart className="text-[11px]" />
                                ) : (
                                  <FaRegHeart className="text-[11px]" />
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/electronic/${v.id}`);
                                }}
                                className="px-4 py-2 rounded-xl text-white font-ticket-body text-[11px] font-bold"
                                style={{ background: "var(--el-primary)" }}
                              >
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ border: "1px solid var(--el-line-str)", color: "var(--el-txt)" }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.borderColor = "var(--el-primary)";
                      e.currentTarget.style.color = "var(--el-primary-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--el-line-str)";
                    e.currentTarget.style.color = "var(--el-txt)";
                  }}
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className="min-w-[36px] h-9 px-3 rounded-xl font-ticket-body text-xs font-bold"
                    style={
                      currentPage === i + 1
                        ? { background: "var(--el-primary)", color: "#fff", border: "1px solid var(--el-primary)" }
                        : { border: "1px solid var(--el-line-str)", color: "var(--el-txt)" }
                    }
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ border: "1px solid var(--el-line-str)", color: "var(--el-txt)" }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.borderColor = "var(--el-primary)";
                      e.currentTarget.style.color = "var(--el-primary-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--el-line-str)";
                    e.currentTarget.style.color = "var(--el-txt)";
                  }}
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Electronics;