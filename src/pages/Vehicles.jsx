// pages/Vehicles.jsx — Modern Ticket Design System + Supabase + Cart + Modern Snackbar + MiniCart + Sold lock
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { readCart, writeCart } from "../lib/cartStore";
import {
  FaCar, FaMotorcycle, FaTruck, FaSearch, FaFilter, FaMapMarkerAlt,
  FaHeart, FaRegHeart, FaEye, FaClock, FaBolt, FaThLarge, FaList,
  FaChevronDown, FaChevronLeft, FaChevronRight, FaCheckCircle,
  FaSlidersH, FaSpinner, FaShoppingCart, FaCheck, FaExclamationCircle,
  FaTimes, FaTrash, FaArrowRight, FaLock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   VEHICLES — THEME TOKENS (CSS variables)
   ═══════════════════════════════════════════════════════════════ */
const VehiclesStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ── DARK THEME ─────────────────────────────────────────── */
    .theme-dark {
      --vh-bg-1:           #0A0A12;
      --vh-bg-2:           #0F0F1A;
      --vh-panel:          rgba(255,255,255,0.045);
      --vh-panel-2:        rgba(255,255,255,0.02);
      --vh-line:           rgba(255,255,255,0.08);
      --vh-line-str:       rgba(255,255,255,0.15);
      --vh-txt:            #FFFFFF;
      --vh-txt-soft:       rgba(255,255,255,0.65);
      --vh-txt-faint:      rgba(255,255,255,0.45);
      --vh-dot:            rgba(255,255,255,0.06);
      --vh-primary:        #fc9d03;
      --vh-primary-2:      #f59e0b;
      --vh-primary-3:      #c8631f;
      --vh-primary-soft:   rgba(252,157,3,0.14);
      --vh-primary-glow:   rgba(252,157,3,0.45);
      --vh-danger:         #B23A2E;
      --vh-danger-soft:    rgba(178,58,46,0.14);
      /* Card image bg for grid tiles */
      --vh-img-bg:         #0A0A12;
      /* Card modern */
      --vh-card-bg:        rgba(255,255,255,0.03);
      --vh-card-border:    rgba(255,255,255,0.06);
      --vh-card-shadow:    0 4px 20px -8px rgba(0,0,0,0.5);
      --vh-card-shadow-hover: 0 20px 40px -12px rgba(0,0,0,0.7);
      --vh-card-accent:    rgba(252,157,3,0.3);
    }

    /* ── LIGHT THEME ────────────────────────────────────────── */
    .theme-light {
      --vh-bg-1:           #FFFFFF;
      --vh-bg-2:           #FAF7F3;
      --vh-panel:          rgba(255,255,255,0.85);
      --vh-panel-2:        rgba(255,255,255,0.95);
      --vh-line:           rgba(20,20,30,0.08);
      --vh-line-str:       rgba(20,20,30,0.15);
      --vh-txt:            #1A1613;
      --vh-txt-soft:       rgba(26,22,19,0.62);
      --vh-txt-faint:      rgba(26,22,19,0.42);
      --vh-dot:            rgba(20,20,30,0.08);
      --vh-primary:        #c8631f;
      --vh-primary-2:      #fc9d03;
      --vh-primary-3:      #f59e0b;
      --vh-primary-soft:   rgba(200,99,31,0.10);
      --vh-primary-glow:   rgba(200,99,31,0.35);
      --vh-danger:         #B23A2E;
      --vh-danger-soft:    rgba(178,58,46,0.10);
      /* Card image bg for grid tiles */
      --vh-img-bg:         #FFFFFF;
      /* Card modern */
      --vh-card-bg:        rgba(255,255,255,0.9);
      --vh-card-border:    rgba(20,20,30,0.06);
      --vh-card-shadow:    0 4px 16px -6px rgba(0,0,0,0.08);
      --vh-card-shadow-hover: 0 20px 40px -12px rgba(0,0,0,0.15);
      --vh-card-accent:    rgba(200,99,31,0.2);
    }

    /* ── Utilities ──────────────────────────────────────────── */
    .vh-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--vh-primary-soft), transparent 60%),
        linear-gradient(180deg, var(--vh-bg-1) 0%, var(--vh-bg-2) 100%);
      color: var(--vh-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .vh-panel-solid {
      background: var(--vh-bg-1);
      border: 1px solid var(--vh-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .vh-panel {
      background: var(--vh-panel);
      border: 1px solid var(--vh-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .vh-input {
      background: var(--vh-bg-1);
      color: var(--vh-txt);
      border: 1px solid var(--vh-line-str);
      transition: border-color 0.2s ease;
    }
    /* Modern premium card */
    .vh-card-modern {
      background: var(--vh-card-bg);
      border: 1px solid var(--vh-card-border);
      box-shadow: var(--vh-card-shadow);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .vh-card-modern:hover {
      transform: translateY(-6px);
      box-shadow: var(--vh-card-shadow-hover);
      border-color: var(--vh-primary);
    }
    .vh-img-tile {
      background: var(--vh-img-bg);
    }

    @keyframes sweep {
      0%   { transform: translateX(-150%) skewX(-20deg); }
      60%  { transform: translateX(350%)  skewX(-20deg); }
      100% { transform: translateX(350%)  skewX(-20deg); }
    }
  `}</style>
);

const categories = [
  { id: "all", label: "All Vehicles", icon: FaCar },
  { id: "Cars", label: "Cars", icon: FaCar },
  { id: "Bikes", label: "Bikes", icon: FaMotorcycle },
  { id: "Trucks", label: "Trucks", icon: FaTruck },
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

const formatPrice = (num) => {
  const n = Number(num) || 0;
  if (n >= 10000000) {
    const c = n / 10000000;
    return `Rs ${c % 1 === 0 ? c.toFixed(0) : c.toFixed(2).replace(/\.?0+$/, "")} Crore`;
  }
  if (n >= 100000) {
    const l = n / 100000;
    return `Rs ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, "")} Lakh`;
  }
  return `Rs ${n.toLocaleString("en-US")}`;
};

/* ────────────────────────────────────────────────────────────
   MODERN TOAST / SNACKBAR
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
              background: "var(--vh-bg-1)",
              borderColor: isError ? "var(--vh-danger)" : "var(--vh-primary)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: isError
                  ? "linear-gradient(90deg, transparent, var(--vh-danger), transparent)"
                  : "linear-gradient(90deg, transparent, var(--vh-primary), transparent)",
              }}
            />

            <div className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-2">
              <div
                className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center relative"
                style={{
                  background: isError ? "var(--vh-danger-soft)" : "var(--vh-primary-soft)",
                  boxShadow: isError
                    ? "0 0 0 1px var(--vh-danger) inset"
                    : "0 0 0 1px var(--vh-primary) inset",
                }}
              >
                {isError ? (
                  <FaExclamationCircle className="text-[10px]" style={{ color: "var(--vh-danger)" }} />
                ) : (
                  <FaCheck className="text-[10px]" style={{ color: "var(--vh-primary-2)" }} />
                )}
                <motion.span
                  initial={{ opacity: 0.55, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.9 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: isError
                      ? "0 0 0 2px var(--vh-danger)"
                      : "0 0 0 2px var(--vh-primary)",
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-ticket-body text-[11px] font-extrabold truncate leading-tight"
                  style={{ color: "var(--vh-txt)" }}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="font-ticket-body text-[9.5px] truncate leading-tight mt-0.5"
                    style={{ color: "var(--vh-txt-soft)" }}>
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
                style={{ color: "var(--vh-txt-soft)" }}
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
                  ? "linear-gradient(90deg, var(--vh-danger), var(--vh-danger))"
                  : "linear-gradient(90deg, var(--vh-primary), var(--vh-primary-3))",
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
          style={{ background: "var(--vh-bg-1)", border: "1px solid var(--vh-line)" }}
          role="dialog"
          aria-label="Mini cart"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--vh-primary), transparent)",
            }}
          />

          <div className="flex items-center justify-between px-4 pt-3.5 pb-3" style={{ borderBottom: "1px solid var(--vh-line)" }}>
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-[12px]" style={{ color: "var(--vh-primary-2)" }} />
              <span className="font-ticket-display text-sm font-bold" style={{ color: "var(--vh-txt)" }}>
                Your Cart
              </span>
              <span className="font-ticket-body text-[10px] font-bold" style={{ color: "var(--vh-txt-soft)" }}>
                · {count} {count === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ color: "var(--vh-txt-soft)" }}
              aria-label="Close cart"
            >
              <FaTimes className="text-[10px]" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FaShoppingCart className="text-2xl mx-auto mb-2" style={{ color: "var(--vh-txt-faint)" }} />
              <p className="font-ticket-body text-xs" style={{ color: "var(--vh-txt-soft)" }}>
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="max-h-[280px] overflow-y-auto py-2">
              {cart.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="group/row flex items-start gap-3 px-4 py-2.5"
                >
                  <div className="h-11 w-11 rounded-lg overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--vh-line)", background: "var(--vh-img-bg)" }}>
                    <img
                      src={item.image || "/car1.png"}
                      alt={item.title}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-ticket-body text-[11px] font-bold truncate leading-tight" style={{ color: "var(--vh-txt)" }}>
                      {item.title}
                    </p>
                    <p className="font-ticket-body text-[9px] truncate mt-0.5" style={{ color: "var(--vh-txt-soft)" }}>
                      {item.location || item.category} · Qty {item.qty || 1}
                    </p>

                    <button
                      onClick={() => goToDetail(item)}
                      className="mt-1 inline-flex items-center gap-1 font-ticket-body text-[9.5px] font-bold underline underline-offset-2"
                      style={{ color: "var(--vh-primary-2)" }}
                    >
                      Learn more
                      <FaArrowRight className="text-[7px]" />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="font-ticket-display text-[11px] font-bold tabular-nums" style={{ color: "var(--vh-txt)" }}>
                      {formatPrice((item.price || 0) * (item.qty || 1))}
                    </p>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="h-6 w-6 rounded-md flex items-center justify-center transition-colors"
                      style={{ color: "var(--vh-danger)" }}
                      aria-label={`Remove ${item.title}`}
                    >
                      <FaTrash className="text-[9px]" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length > 5 && (
                <p className="px-4 py-2 font-ticket-body text-[10px] text-center" style={{ color: "var(--vh-txt-soft)" }}>
                  +{cart.length - 5} more items
                </p>
              )}
            </div>
          )}

          {cart.length > 0 && (
            <div className="px-4 py-3" style={{ borderTop: "1px solid var(--vh-line)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--vh-txt-soft)" }}>
                  Subtotal
                </span>
                <span className="font-ticket-display text-base font-bold tabular-nums" style={{ color: "var(--vh-primary-2)" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToFullCart}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-ticket-body text-[11px] font-extrabold tracking-wide text-white"
                style={{ background: "var(--vh-primary)" }}
              >
                View full cart
                <FaArrowRight className="text-[9px]" />
              </motion.button>

              <button
                onClick={goToFullCart}
                className="mt-2 w-full text-center font-ticket-body text-[9.5px] underline decoration-dotted underline-offset-2 transition-colors"
                style={{ color: "var(--vh-txt-soft)" }}
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

const Vehicles = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 25000000]);
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

  const handleAddToCart = (vehicle, e) => {
    if (e) e.stopPropagation();
    if (vehicle.sold) {
      pushToast("error", "This vehicle is sold", "No longer available.");
      return;
    }
    const exists = cart.find((c) => c.id === vehicle.id);
    const next = exists
      ? cart.map((c) =>
          c.id === vehicle.id ? { ...c, qty: (c.qty || 1) + 1 } : c
        )
      : [
          ...cart,
          {
            id: vehicle.id,
            title: vehicle.title,
            price: Number(vehicle.price) || 0,
            image: vehicle.image,
            location: vehicle.location,
            category: vehicle.category,
            detailPath: "vehicle",
            qty: 1,
          },
        ];
    setCart(next);
    writeCart(next);
    pushToast(
      "success",
      "Added to cart",
      `${vehicle.title} · ${formatPrice(vehicle.price)}`
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
      pushToast("error", "This vehicle is sold", "No longer available.");
      return;
    }
    navigate(`/vehicle/${item.id}`);
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        let query = supabase
          .from("listings")
          .select("*")
          .eq("category", "Vehicles")
          .order("posted_at", { ascending: false });

        if (currentUser?.id) {
          query = query.or(
            `status.eq.active,status.eq.sold,user_id.eq.${currentUser.id}`
          );
        } else {
          query = query.in("status", ["active", "sold"]);
        }

        const { data, error } = await query;
        if (error) throw error;

        const mapped = (data || []).map((item) => ({
          id: item.id,
          category: item.subcategory || "Cars",
          title: item.title,
          year: item.specs?.year || "—",
          km: item.specs?.km || "—",
          fuel: item.specs?.fuel || "—",
          location: item.area ? `${item.area}, ${item.city}` : item.city,
          price: Number(item.price) || 0,
          image: item.cover_image || item.images?.[0] || "/car1.png",
          verified: item.verified || false,
          featured: item.featured || false,
          status: item.status,
          sold: (item.status || "").toLowerCase() === "sold",
          postedAgo: timeAgo(item.posted_at),
        }));

        setListings(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (activeCategory !== "all") result = result.filter((v) => v.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) => v.title.toLowerCase().includes(q) || v.location?.toLowerCase().includes(q)
      );
    }
    result = result.filter((v) => v.price >= priceRange[0] && v.price <= priceRange[1]);
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [listings, activeCategory, searchQuery, sortBy, priceRange]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const formatFilterPrice = (num) => {
    const n = Number(num) || 0;
    if (n >= 10000000) {
      const c = n / 10000000;
      return `Rs ${c % 1 === 0 ? c.toFixed(0) : c.toFixed(2).replace(/\.?0+$/, "")} Cr`;
    }
    if (n >= 100000) {
      const l = n / 100000;
      return `Rs ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, "")} Lac`;
    }
    return `Rs ${n.toLocaleString("en-US")}`;
  };

  return (
    <div className="min-h-screen vh-bg relative">
      <VehiclesStyles />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(var(--vh-primary) 0.6px, transparent 0.6px)`,
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div
            className="h-11 w-11 rounded-xl border flex items-center justify-center vh-panel-solid"
            style={{ borderColor: "var(--vh-primary)" }}
          >
            <FaCar className="text-base" style={{ color: "var(--vh-primary-2)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-ticket-display text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: "var(--vh-txt)" }}>
              Vehicles
            </h1>
            <p className="font-ticket-body text-xs sm:text-sm" style={{ color: "var(--vh-txt-soft)" }}>
              {isLoading ? "Loading..." : `${filteredListings.length} listings · cars, bikes & trucks`}
            </p>
          </div>

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
              className="relative inline-flex items-center gap-2.5 pl-3 pr-3.5 py-2.5 rounded-xl border vh-panel-solid transition-colors group/cart"
              style={{ borderColor: "var(--vh-primary)" }}
            >
              <span className="relative inline-flex items-center justify-center">
                <FaShoppingCart className="text-[13px]" style={{ color: "var(--vh-primary-2)" }} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shadow-[0_4px_12px_-2px_var(--vh-primary-glow)] ring-2"
                      style={{
                        background: "linear-gradient(135deg, var(--vh-primary), var(--vh-primary-3))",
                        ["--tw-ring-color"]: "var(--vh-bg-1)",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>

              <span className="hidden sm:inline font-ticket-body text-xs font-extrabold tracking-wide"
                style={{ color: "var(--vh-txt)" }}>
                Cart
              </span>

              <span className="pointer-events-none absolute inset-y-1.5 left-0 w-px"
                style={{ background: "var(--vh-line)" }} />
            </motion.button>

            <MiniCartPopover
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              cart={cart}
              onRemove={handleRemoveFromCart}
              detailPath="/vehicle"
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="vh-panel-solid rounded-[22px] p-3 sm:p-4 mb-5 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <FaSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "var(--vh-primary-2)" }}
              />
              <input
                type="text"
                placeholder="Search cars, bikes, trucks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="font-ticket-body w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none vh-input"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-ticket-body appearance-none pl-4 pr-9 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer outline-none vh-input"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <FaChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                style={{ color: "var(--vh-primary-2)" }}
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl p-1 vh-panel-solid">
              {[{ id: "grid", icon: FaThLarge }, { id: "list", icon: FaList }].map((v) => {
                const Icon = v.icon;
                const active = viewMode === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setViewMode(v.id)}
                    className="relative p-2 rounded-lg"
                    style={{ color: active ? "#fff" : "var(--vh-txt-soft)" }}
                  >
                    {active && (
                      <motion.div
                        layoutId="vm-vehicles"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: "var(--vh-primary)" }}
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
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-ticket-body text-xs font-bold vh-panel-solid"
              style={{ color: "var(--vh-txt)" }}
            >
              <FaSlidersH className="text-[10px]" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          {/* Filters */}
          <aside className={`lg:block ${showMobileFilters ? "block" : "hidden"}`}>
            <div className="vh-panel-solid rounded-[22px] p-5 sticky top-24 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: "1px solid var(--vh-line)" }}>
                <FaFilter className="text-xs" style={{ color: "var(--vh-primary-2)" }} />
                <span className="font-ticket-display text-sm font-bold" style={{ color: "var(--vh-txt)" }}>Filters</span>
              </div>
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--vh-txt-soft)" }}>
                Category
              </p>
              <div className="space-y-1 mb-6">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const active = activeCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setActiveCategory(c.id); setCurrentPage(1); }}
                      className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-ticket-body text-xs font-bold transition-colors"
                      style={
                        active
                          ? { background: "var(--vh-primary)", color: "#fff" }
                          : { color: "var(--vh-txt)" }
                      }
                    >
                      <Icon
                        className="text-xs"
                        style={{ color: active ? "#ffffff" : "var(--vh-primary-2)" }}
                      />
                      <span className="flex-1 text-left">{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--vh-txt-soft)" }}>
                Max Price
              </p>
              <input
                type="range"
                min="0"
                max="25000000"
                step="100000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full mb-2"
                style={{ accentColor: "var(--vh-primary)" }}
              />
              <p className="font-ticket-body text-[10px] font-bold mb-5" style={{ color: "var(--vh-txt)" }}>
                {formatFilterPrice(priceRange[1])}
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  setPriceRange([0, 25000000]);
                  setSortBy("newest");
                }}
                className="w-full py-2.5 rounded-xl font-ticket-body text-xs font-bold transition-colors"
                style={{ border: "1px solid var(--vh-line-str)", color: "var(--vh-txt)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--vh-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--vh-line-str)"; }}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Listings */}
          <div>
            {isLoading ? (
              <div className="vh-panel-solid rounded-[22px] py-20 text-center shadow-sm">
                <FaSpinner
                  className="text-3xl mx-auto mb-4 animate-spin"
                  style={{ color: "var(--vh-primary-2)" }}
                />
                <p className="font-ticket-body text-sm" style={{ color: "var(--vh-txt-soft)" }}>Loading listings...</p>
              </div>
            ) : paginatedListings.length === 0 ? (
              <div className="vh-panel-solid rounded-[22px] py-16 text-center shadow-sm">
                <FaCar className="text-4xl mx-auto mb-4" style={{ color: "var(--vh-txt-faint)" }} />
                <p className="font-ticket-display text-lg font-bold mb-1" style={{ color: "var(--vh-txt)" }}>
                  No vehicles found
                </p>
                <p className="font-ticket-body text-xs" style={{ color: "var(--vh-txt-soft)" }}>
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
                        className={`group/card relative flex flex-col vh-card-modern rounded-2xl overflow-hidden ${
                          locked ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        {/* Accent line on top */}
                        <div
                          className="absolute top-0 left-0 right-0 h-[3px] z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                          style={{ background: "var(--vh-card-accent)" }}
                        />

                        {/* Image tile */}
                        <div className="relative aspect-[4/3] overflow-hidden vh-img-tile">
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
                                background: "var(--vh-heart-bg)",
                                color: "var(--vh-txt-soft)",
                                border: "1px solid var(--vh-heart-border)",
                              }}
                            >
                              {v.category}
                            </div>
                          )}

                          {/* Sold lock overlay */}
                          {locked && (
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
                                style={{ background: "var(--vh-primary)" }}
                              />
                              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
                              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br-md" />

                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative -rotate-[10deg] flex flex-col items-center">
                                  <div className="absolute inset-0 translate-y-1 rounded-xl bg-black/40 blur-[6px]" />
                                  <div
                                    className="relative flex items-center gap-2 px-5 py-2 rounded-xl"
                                    style={{
                                      background: "linear-gradient(135deg, var(--vh-primary) 0%, var(--vh-primary-3) 100%)",
                                      boxShadow: "0 12px 30px -8px var(--vh-primary-glow), 0 0 0 2px rgba(255,255,255,0.9) inset, 0 0 0 4px var(--vh-primary-soft) inset",
                                    }}
                                  >
                                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/50">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-3 w-3"
                                      >
                                        <polyline points="5 12 10 17 19 8" />
                                      </svg>
                                    </span>
                                    <span className="font-ticket-display text-base sm:text-lg font-bold tracking-[0.2em] text-white leading-none">
                                      SOLD
                                    </span>
                                    <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
                                      <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[sweep_2.8s_ease-in-out_infinite]" />
                                    </span>
                                  </div>
                                  <div className="mt-1 h-1 w-3/4 rounded-full bg-black/40 blur-[3px]" />
                                </div>
                              </div>
                            </div>
                          )}

                          {!locked && (
                            <button
                              onClick={(e) => toggleFavorite(v.id, e)}
                              aria-label={
                                favorites.includes(v.id)
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              className="favorite-heart absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                              style={{
                                background: "var(--vh-heart-bg)",
                                color: "var(--vh-heart-ink)",
                                boxShadow: "var(--vh-heart-shadow)",
                                border: "1px solid var(--vh-heart-border)",
                              }}
                            >
                              {favorites.includes(v.id) ? (
                                <FaHeart className="text-[13px]" style={{ color: "var(--vh-primary)" }} />
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
                                color: locked ? "var(--vh-txt-soft)" : "var(--vh-txt)",
                                textDecoration: locked ? "line-through" : "none",
                              }}
                            >
                              {formatPrice(v.price)}
                            </p>
                            {v.verified && (
                              <span className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold flex-shrink-0 mt-1" style={{ color: "var(--vh-primary-2)" }}>
                                <FaCheckCircle className="text-[8px]" /> Verified
                              </span>
                            )}
                          </div>

                          <p
                            className="font-ticket-body text-[13px] sm:text-sm mt-1.5 truncate"
                            style={{ color: "var(--vh-txt-soft)" }}
                          >
                            {v.location}
                          </p>

                          {/* Meta line */}
                          <p
                            className="font-ticket-body text-[11.5px] sm:text-xs mt-1 truncate"
                            style={{ color: "var(--vh-txt-faint)" }}
                          >
                            {[v.year, v.km, v.fuel, v.category]
                              .filter((x) => x && x !== "—")
                              .join(" · ")}
                          </p>

                          {/* Actions — ALWAYS VISIBLE */}
                          {!locked && (
                            <div className="mt-4 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--vh-line)" }}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => handleAddToCart(v, e)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                                style={{
                                  border: "1px solid var(--vh-line-str)",
                                  color: "var(--vh-txt)",
                                  background: "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "var(--vh-primary)";
                                  e.currentTarget.style.borderColor = "var(--vh-primary)";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                  e.currentTarget.style.borderColor = "var(--vh-line-str)";
                                  e.currentTarget.style.color = "var(--vh-txt)";
                                }}
                              >
                                <FaShoppingCart className="text-[10px]" />
                                Add to cart
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/vehicle/${v.id}`); }}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                                style={{
                                  background: "var(--vh-primary)",
                                  color: "white",
                                  border: "1px solid var(--vh-primary)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "var(--vh-primary-3)";
                                  e.currentTarget.style.borderColor = "var(--vh-primary-3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "var(--vh-primary)";
                                  e.currentTarget.style.borderColor = "var(--vh-primary)";
                                }}
                              >
                                <FaEye className="text-[10px]" />
                                View
                              </motion.button>
                            </div>
                          )}

                          {locked && (
                            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--vh-line)" }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/vehicle/${v.id}`);
                                }}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold underline decoration-dotted underline-offset-2"
                                style={{ color: "var(--vh-primary-2)" }}
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
                      className={`vh-panel-solid rounded-[22px] flex flex-col sm:flex-row overflow-hidden shadow-sm ${locked ? "cursor-default" : "cursor-pointer"}`}
                      onMouseEnter={(e) => {
                        if (!locked) e.currentTarget.style.borderColor = "var(--vh-primary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!locked) e.currentTarget.style.borderColor = "var(--vh-line)";
                      }}
                    >
                      <div className="relative sm:w-56 aspect-[4/3] sm:aspect-auto vh-img-tile flex-shrink-0">
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
                              <div
                                className="-rotate-[10deg] px-4 py-1.5 rounded-lg font-ticket-display text-sm font-bold tracking-[0.2em] text-white border-2 border-white"
                                style={{ background: "var(--vh-primary)" }}
                              >
                                SOLD
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="font-ticket-body text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit"
                            style={{ borderColor: "var(--vh-primary)", color: "var(--vh-primary-2)" }}
                          >
                            {v.category}
                          </span>
                          {locked && (
                            <span
                              className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
                              style={{ background: "var(--vh-primary)" }}
                            >
                              <FaCheckCircle className="text-[8px]" /> Sold
                            </span>
                          )}
                        </div>

                        <h3
                          className="font-ticket-display text-lg font-bold mb-1 line-clamp-1"
                          style={{ color: locked ? "var(--vh-txt-soft)" : "var(--vh-txt)" }}
                        >
                          {v.title}
                        </h3>
                        <p className="font-ticket-body text-[10px] mb-3 truncate" style={{ color: "var(--vh-txt-soft)" }}>
                          {v.location} · {v.year} · {v.km} · {v.fuel}
                        </p>

                        <div className="mt-auto pt-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--vh-line)" }}>
                          <p
                            className="font-ticket-display text-xl font-bold"
                            style={{
                              color: locked ? "var(--vh-txt-soft)" : "var(--vh-primary-2)",
                              textDecoration: locked ? "line-through" : "none",
                            }}
                          >
                            {formatPrice(v.price)}
                          </p>

                          {locked ? (
                            <div
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[10px] font-bold cursor-not-allowed select-none"
                              style={{
                                border: "1px dashed var(--vh-txt-faint)",
                                background: "var(--vh-bg-1)",
                                color: "var(--vh-txt-soft)",
                              }}
                            >
                              <FaLock className="text-[9px]" />
                              Sold
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleAddToCart(v, e)}
                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
                                style={{ border: "1px solid var(--vh-line-str)", color: "var(--vh-txt)" }}
                                aria-label="Add to cart"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "var(--vh-primary)";
                                  e.currentTarget.style.borderColor = "var(--vh-primary)";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "";
                                  e.currentTarget.style.borderColor = "var(--vh-line-str)";
                                  e.currentTarget.style.color = "var(--vh-txt)";
                                }}
                              >
                                <FaShoppingCart className="text-[11px]" />
                              </motion.button>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/vehicle/${v.id}`); }}
                                className="px-4 py-2 rounded-xl text-white font-ticket-body text-[11px] font-bold transition-transform hover:scale-[1.03] active:scale-95"
                                style={{ background: "var(--vh-primary)" }}
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
                  className="h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors"
                  style={{ border: "1px solid var(--vh-line-str)", color: "var(--vh-txt)" }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.borderColor = "var(--vh-primary)";
                      e.currentTarget.style.color = "var(--vh-primary-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--vh-line-str)";
                    e.currentTarget.style.color = "var(--vh-txt)";
                  }}
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className="min-w-[36px] h-9 px-3 rounded-xl font-ticket-body text-xs font-bold transition-colors"
                    style={
                      currentPage === i + 1
                        ? { background: "var(--vh-primary)", color: "#fff", border: "1px solid var(--vh-primary)" }
                        : { border: "1px solid var(--vh-line-str)", color: "var(--vh-txt)" }
                    }
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors"
                  style={{ border: "1px solid var(--vh-line-str)", color: "var(--vh-txt)" }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.borderColor = "var(--vh-primary)";
                      e.currentTarget.style.color = "var(--vh-primary-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--vh-line-str)";
                    e.currentTarget.style.color = "var(--vh-txt)";
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

export default Vehicles;