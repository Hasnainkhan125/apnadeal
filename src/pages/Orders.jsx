// pages/Orders.jsx — Contrado-style order confirmation + editable delivery address
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaClipboardCheck, FaBoxOpen, FaTruck, FaHome, FaCheck,
  FaArrowLeft, FaShoppingCart, FaLock, FaTrashAlt,
  FaMobileAlt, FaCreditCard, FaUniversity, FaSpinner,
  FaDownload, FaSearch, FaCopy, FaHeadset, FaMapMarkerAlt,
  FaRedo, FaExclamationTriangle, FaWallet, FaTimes,
  FaShippingFast, FaBox, FaMapSigns, FaUser, FaEnvelope,
  FaPhone, FaChevronRight, FaCheckCircle, FaEdit, FaSave,
  FaMinus, FaPlus, FaTag, FaRegEdit,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  readCart,
  writeCart,
  readOrders,
  writeOrders,
  deleteOrder,
  syncCartFromSupabase,
  syncOrdersFromSupabase,
  ORDER_STEPS,
} from "../lib/cartStore";
import { supabase } from "../lib/supabase";
import { downloadOrderPDF } from "../components/OrderPDF";

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const OrdersStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    .theme-dark {
      --or-bg-1:#0A0A12; --or-bg-2:#0F0F1A;
      --or-card:#16161F; --or-side:#1A1A24;
      --or-panel:rgba(255,255,255,0.045);
      --or-line:rgba(255,255,255,0.08);
      --or-line-str:rgba(255,255,255,0.15);
      --or-txt:#FFFFFF; --or-txt-soft:rgba(255,255,255,0.65); --or-txt-faint:rgba(255,255,255,0.45);
      --or-primary:#fc9d03; --or-primary-2:#f59e0b; --or-primary-3:#c8631f;
      --or-primary-soft:rgba(252,157,3,0.14); --or-primary-glow:rgba(252,157,3,0.45);
      --or-danger:#E2795F; --or-danger-soft:rgba(226,121,95,0.14);
      --or-success:#3fa77f; --or-success-soft:rgba(63,167,127,0.10);
      --or-green-bg:#0F3A2C;
      --or-green-bg-2:#0A2A20;
      --cart-bg: #0F0F1A;
      --cart-surface: #16161F;
      --cart-border: rgba(255,255,255,0.08);
      --cart-txt: #FFFFFF;
      --cart-txt-muted: rgba(255,255,255,0.55);
      --cart-txt-faint: rgba(255,255,255,0.35);
      --cart-lime: #fc9d03;
      --cart-lime-hover: #e08a00;
      --cart-lime-text: #0A0A0A;
      --cart-danger: #FF5B5B;
    }
    .theme-light {
      --or-bg-1:#F5F5F5; --or-bg-2:#F5F5F5;
      --or-card:#FFFFFF; --or-side:#FAFAFA;
      --or-panel:rgba(255,255,255,0.85);
      --or-line:rgba(20,20,30,0.08);
      --or-line-str:rgba(20,20,30,0.15);
      --or-txt:#111111; --or-txt-soft:rgba(17,17,17,0.62); --or-txt-faint:rgba(17,17,17,0.42);
      --or-primary:#c8631f; --or-primary-2:#fc9d03; --or-primary-3:#f59e0b;
      --or-primary-soft:rgba(200,99,31,0.10); --or-primary-glow:rgba(200,99,31,0.35);
      --or-danger:#B23A2E; --or-danger-soft:rgba(178,58,46,0.10);
      --or-success:#16A34A; --or-success-soft:rgba(22,163,74,0.10);
      --or-green-bg:#16A34A;
      --or-green-bg-2:#15803D;
      --cart-bg: #F4F4F4;
      --cart-surface: #FFFFFF;
      --cart-border: rgba(20,20,30,0.08);
      --cart-txt: #0A0A0A;
      --cart-txt-muted: rgba(10,10,10,0.6);
      --cart-txt-faint: rgba(10,10,10,0.4);
      --cart-lime: #fc9d03;
      --cart-lime-hover: #e08a00;
      --cart-lime-text: #0A0A0A;
      --cart-danger: #D92D2D;
    }

    .or-bg { background: var(--or-bg-1); color: var(--or-txt); transition: background 0.3s ease, color 0.3s ease; }
    .or-card { background: var(--or-card); border: 1px solid var(--or-line); transition: background 0.35s ease, border-color 0.35s ease; }
    .or-side { background: var(--or-side); transition: background 0.35s ease; }
    .or-input { background: var(--or-card); color: var(--or-txt); border: 1px solid var(--or-line-str); transition: border-color 0.2s ease, box-shadow 0.2s ease; font-size: 16px; }
    .or-input:focus { border-color: var(--or-primary); box-shadow: 0 0 0 3px var(--or-primary-soft); outline: none; }
    .or-green-panel { background: linear-gradient(135deg, var(--or-green-bg) 0%, var(--or-green-bg-2) 100%); }

    .cart-bg { background: var(--cart-bg); color: var(--cart-txt); }
    .cart-surface { background: var(--cart-surface); }
    .cart-border { border-color: var(--cart-border); }
    .cart-txt { color: var(--cart-txt); }
    .cart-txt-muted { color: var(--cart-txt-muted); }
    .cart-txt-faint { color: var(--cart-txt-faint); }
    .cart-lime-bg { background: var(--cart-lime); color: var(--cart-lime-text); }
    .cart-lime-bg:hover { background: var(--cart-lime-hover); }
    .cart-danger { color: var(--cart-danger); }
    .cart-summary-card { background: #ECECEC; }
    .theme-dark .cart-summary-card { background: #1C1C28; }
    .cart-coupon-card { background: #ECECEC; }
    .theme-dark .cart-coupon-card { background: #1C1C28; }
    .cart-pay-btn { background: #ECECEC; color: var(--cart-txt); transition: background 0.2s ease; }
    .theme-dark .cart-pay-btn { background: #1C1C28; }
    .cart-pay-btn:hover { background: #E0E0E0; }
    .theme-dark .cart-pay-btn:hover { background: #252533; }

    /* ═══════ RESPONSIVE STEPPER ═══════ */
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
      margin-bottom: 32px;
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
      .co-stepper { padding: 10px 10px; gap: 4px; border-radius: 14px; margin-bottom: 24px; }
      .co-step-item { gap: 6px; }
      .co-step-circle { width: 24px; height: 24px; }
      .co-step-label { font-size: 11px; }
      .co-step-connector { min-width: 8px; }
    }

    /* ═══════ MOBILE SAFE AREA ═══════ */
    @media (max-width: 1023px) {
      .or-safe-bottom {
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
      }
      .or-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
      }
    }

    /* Prevent horizontal scroll */
    .or-bg, .or-bg * { box-sizing: border-box; }
    .or-bg { overflow-x: hidden; }
  `}</style>
);

const STEP_META = {
  placed:     { color: "#2A6FB8", icon: FaClipboardCheck, label: "Order Confirmed", desc: "Order placed" },
  processing: { color: "#8B5CF6", icon: FaBox, label: "Start Production", desc: "Preparing" },
  shipped:    { color: "#fc9d03", icon: FaShippingFast, label: "Quality Check", desc: "Verified" },
  out:        { color: "#E26A2C", icon: FaMapSigns, label: "Dispatched", desc: "On the way" },
  delivered:  { color: "#16A34A", icon: FaHome, label: "Product Delivered", desc: "Completed" },
};

const getStepMeta = (id) => STEP_META[id] || STEP_META.placed;

const formatRs = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const METHOD_META = {
  easypaisa: { label: "Easypaisa", icon: FaMobileAlt, logo: "/esypaisa.png" },
  bank:      { label: "Meezan Bank", icon: FaUniversity, logo: "/meezan.png" },
  cod:       { label: "Cash on Delivery", icon: FaWallet, logo: null },
};

const SECONDS_PER_STEP = 8;

const getStepIndex = (order) => {
  if (order.statusIndex != null) return order.statusIndex;
  const placedAt = new Date(order.placedAt).getTime();
  const elapsed = (Date.now() - placedAt) / 1000;
  return Math.min(ORDER_STEPS.length - 1, Math.floor(elapsed / SECONDS_PER_STEP));
};

const getTrackingNumber = (order) =>
  order.trackingNumber ||
  `APD-${String(order.id).replace(/[^0-9A-Za-z]/g, "").slice(-6).toUpperCase() || "000000"}`;

const getCourier = (order) => order.courier || "APNa Logistics";

const getEta = (order) => {
  const placedAt = new Date(order.placedAt).getTime();
  const totalSteps = ORDER_STEPS.length - 1;
  return new Date(placedAt + totalSteps * SECONDS_PER_STEP * 1000);
};

const formatDateTime = (d) =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
  " · " +
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const TABS = [
  { id: "cart",   to: "/cart",   label: "Cart",   icon: FaShoppingCart, match: (p) => p === "/cart" || p === "/orders/cart" },
  { id: "orders", to: "/orders", label: "Orders", icon: FaClipboardCheck, match: (p) => p === "/orders" || p === "/orders/list" },
];

/* ═══════════════════════════════════════════════════════════════
   ⭐ RESPONSIVE STEPPER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const CheckoutStepper = ({ steps }) => {
  return (
    <div className="co-stepper" role="list" aria-label="Checkout progress">
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
                    ? { background: "var(--cart-lime)", border: "2px solid var(--cart-lime)", boxShadow: "0 6px 16px -6px rgba(252,157,3,0.5)" }
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
                style={{ color: isDone ? "#10B981" : isActive ? "var(--cart-txt)" : "var(--cart-txt-muted)" }}
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

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const Orders = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    const hit = TABS.find((t) => t.match(location.pathname));
    if (hit) return hit.id;
    return initialTab === "orders" ? "orders" : "cart";
  }, [location.pathname, initialTab]);

  const [cart, setCart] = useState(() => readCart());
  const [orders, setOrders] = useState(() => readOrders());
  const [openOrderId, setOpenOrderId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNavigating, setIsNavigating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveUpdateFlash, setLiveUpdateFlash] = useState(null);

  const realtimeChannelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSyncing(true);
      try {
        const [cartItems, ordersList] = await Promise.all([
          syncCartFromSupabase(),
          syncOrdersFromSupabase(),
        ]);
        if (cancelled) return;
        if (cartItems) setCart(cartItems);
        if (ordersList) setOrders(ordersList);
      } catch (err) {
        console.error("[Orders] ❌ Sync failed:", err);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const setupRealtime = async () => {
      if (!supabase) return;
      let uid = null;
      try {
        const { data } = await supabase.auth.getUser();
        uid = data?.user?.id || null;
      } catch {}
      if (isCancelled) return;

      const channelName = uid ? `orders-live-${uid}` : "orders-live-anon";

      if (realtimeChannelRef.current) {
        try { supabase.removeChannel(realtimeChannelRef.current); } catch {}
        realtimeChannelRef.current = null;
      }

      const channel = supabase
        .channel(channelName)
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "orders",
          ...(uid ? { filter: `user_id=eq.${uid}` } : {}),
        }, (payload) => {
          const updated = payload.new;
          if (!updated) return;
          setOrders((prev) => prev.map((o) => {
            const matches = o.dbId === updated.id || o.id === updated.order_number;
            if (!matches) return o;
            const newIndex = updated.status_index ?? o.statusIndex ?? 0;
            if (newIndex !== o.statusIndex) {
              setLiveUpdateFlash(o.id);
              setTimeout(() => setLiveUpdateFlash(null), 2000);
            }
            return {
              ...o,
              statusIndex: newIndex,
              statusUpdatedAt: updated.status_updated_at || new Date().toISOString(),
              trackingNumber: updated.tracking_number || o.trackingNumber,
              courier: updated.courier || o.courier,
            };
          }));
        })
        .on("postgres_changes", {
          event: "INSERT", schema: "public", table: "orders",
          ...(uid ? { filter: `user_id=eq.${uid}` } : {}),
        }, () => {
          syncOrdersFromSupabase().then((list) => {
            if (list) setOrders(list);
          });
        })
        .subscribe((status) => {
          if (isCancelled) return;
          if (status === "SUBSCRIBED") setLiveConnected(true);
          else setLiveConnected(false);
        });

      realtimeChannelRef.current = channel;
    };

    setupRealtime();

    return () => {
      isCancelled = true;
      if (realtimeChannelRef.current && supabase) {
        try { supabase.removeChannel(realtimeChannelRef.current); } catch {}
        realtimeChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (orders.length > 0 && openOrderId === null) setOpenOrderId(orders[0].id);
  }, [orders]);

  useEffect(() => {
    const onCart = () => setCart(readCart());
    const onOrders = () => setOrders(readOrders());
    window.addEventListener("cart:update", onCart);
    window.addEventListener("orders:update", onOrders);
    window.addEventListener("storage", onCart);
    window.addEventListener("storage", onOrders);
    return () => {
      window.removeEventListener("cart:update", onCart);
      window.removeEventListener("orders:update", onOrders);
      window.removeEventListener("storage", onCart);
      window.removeEventListener("storage", onOrders);
    };
  }, []);

  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const cartTotal = cart.reduce((s, c) => s + c.price * (c.qty || 1), 0);
  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);
  const cartDiscount = useMemo(() => {
    return Math.round(cartTotal * 0.011);
  }, [cartTotal]);
  const cartTax = 0;
  const cartShipping = 0;
  const cartGrandTotal = cartTotal - cartDiscount + cartTax + cartShipping;

  const updateQty = async (id, delta) => {
    const next = cart.map((c) =>
      c.id === id ? { ...c, qty: Math.max(1, (c.qty || 1) + delta) } : c
    );
    setCart(next);
    try { await writeCart(next); } catch (err) { console.error(err); }
  };

  const removeFromCart = async (id) => {
    const next = cart.filter((c) => c.id !== id);
    setCart(next);
    try { await writeCart(next); } catch (err) { console.error(err); }
  };
  const clearCart = async () => {
    setCart([]);
    try { await writeCart([]); } catch (err) { console.error(err); }
  };
  const handleCheckout = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/checkout");
      setIsNavigating(false);
    }, 400);
  };

  const removeOrder = async (orderId) => {
    const next = orders.filter((o) => o.id !== orderId);
    setOrders(next);
    writeOrders(next);
    if (openOrderId === orderId) setOpenOrderId(null);
    try { await deleteOrder(orderId); } catch (err) { console.error(err); }
  };
  const reorder = async (order) => {
    const current = readCart();
    const merged = [...current];
    order.items.forEach((it) => {
      const idx = merged.findIndex((c) => c.id === it.id);
      if (idx > -1) {
        merged[idx] = { ...merged[idx], qty: (merged[idx].qty || 1) + (it.qty || 1) };
      } else {
        merged.push({ ...it });
      }
    });
    setCart(merged);
    try { await writeCart(merged); } catch (err) { console.error(err); }
    navigate("/cart");
  };

  const updateOrderAddress = async (orderId, newCustomer) => {
    const nextOrders = orders.map((o) =>
      o.id === orderId ? { ...o, customer: { ...o.customer, ...newCustomer } } : o
    );
    setOrders(nextOrders);

    try {
      writeOrders(nextOrders);
    } catch (err) {
      console.error("[Orders] writeOrders failed:", err);
    }

    try {
      const target = nextOrders.find((o) => o.id === orderId);
      if (target && supabase) {
        const updatePayload = {
          customer_name: newCustomer.fullName ?? null,
          customer_phone: newCustomer.phone ?? null,
          customer_address: newCustomer.address ?? null,
          customer_city: newCustomer.city ?? null,
        };
        await supabase
          .from("orders")
          .update(updatePayload)
          .or(`id.eq.${target.dbId || "0"},order_number.eq.${orderId}`);
      }
    } catch (err) {
      console.warn("[Orders] Supabase address update failed (non-fatal):", err);
    }
  };

  const stats = useMemo(() => {
    const inTransit = orders.filter((o) => {
      const idx = getStepIndex(o);
      return idx > 0 && idx < ORDER_STEPS.length - 1;
    }).length;
    const delivered = orders.filter((o) => getStepIndex(o) >= ORDER_STEPS.length - 1).length;
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
    return { total: orders.length, inTransit, delivered, totalSpent };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const stepId = ORDER_STEPS[getStepIndex(o)]?.id;
      const matchesStatus = statusFilter === "all" || stepId === statusFilter;
      const matchesSearch =
        q === "" ||
        String(o.id).toLowerCase().includes(q) ||
        o.items.some((it) => it.title.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const estimatedDelivery = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  /* ⭐ Steps for Cart page stepper — Cart ● → Checkout ○ → Payment ○ */
  const cartStepperSteps = [
    { key: "cart",     label: "Cart",     done: false, active: true  },
    { key: "checkout", label: "Checkout", done: false, active: false },
    { key: "payment",  label: "Payment",  done: false, active: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen or-bg"
    >
      <OrdersStyles />

      {activeTab === "cart" ? (
        /* ═══════════════════════════════════════════════════════
           CART VIEW
           ═══════════════════════════════════════════════════════ */
        <div className="cart-bg min-h-screen font-ticket-body">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">

            {/* TABS */}
            <div
              className="inline-flex rounded-lg p-1 mb-6 sm:mb-8"
              style={{ background: "var(--or-card)", border: "1px solid var(--or-line)" }}
            >
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                const label = t.id === "cart" ? `${t.label} (${cartCount})` : `${t.label} (${orders.length})`;
                return (
                  <Link
                    key={t.id}
                    to={t.to}
                    className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md font-ticket-body text-xs font-bold"
                    style={{ color: active ? "#fff" : "var(--or-txt-soft)" }}
                  >
                    {active && (
                      <motion.div
                        layoutId="orders-tab"
                        className="absolute inset-0 rounded-md"
                        style={{ background: "var(--or-primary)" }}
                        transition={{ type: "spring", duration: 0.4 }}
                      />
                    )}
                    <Icon className="text-xs relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Header */}
            <h1 className="font-ticket-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 cart-txt">
              Cart
            </h1>

            {/* ⭐ RESPONSIVE STEPPER */}
            <CheckoutStepper steps={cartStepperSteps} />

            {cart.length === 0 ? (
              <EmptyState
                icon={FaShoppingCart}
                title="Your cart is empty"
                sub="Add some items to get started."
                action={
                  <Link
                    to="/mobiles"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-ticket-body font-bold text-sm"
                    style={{ background: "var(--or-primary)" }}
                  >
                    Browse Mobiles
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 xl:gap-12">

                {/* LEFT: CART ITEMS */}
                <div className="space-y-0 min-w-0">
                  {cart.map((item) => (
                    <div key={item.id} className="pb-5 sm:pb-6 mb-5 sm:mb-6" style={{ borderBottom: "1px solid var(--cart-border)" }}>
                      <div className="flex gap-3 sm:gap-6">
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ background: "var(--cart-surface)", border: "1px solid var(--cart-border)" }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-ticket-display text-base sm:text-lg md:text-xl font-bold cart-txt mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="font-ticket-body text-[11px] sm:text-xs md:text-sm cart-txt-muted mb-2 line-clamp-2">
                            {item.subtitle || "Perfect run and active lifestyle"}
                          </p>
                          <div className="flex items-center gap-3 mb-2 sm:mb-3 flex-wrap">
                            <span className="font-ticket-body text-[11px] sm:text-xs cart-txt-muted">
                              Size <strong className="cart-txt">{item.size || "42"}</strong>
                            </span>
                            <span className="font-ticket-body text-[11px] sm:text-xs cart-txt-muted">
                              / Color <strong className="cart-txt">{item.color || "Fuego"}</strong>
                            </span>
                          </div>
                          <p className="font-ticket-display text-sm sm:text-base md:text-lg font-bold cart-txt">
                            {formatRs(item.price * (item.qty || 1))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 sm:mt-4 flex-wrap gap-2">
                        <div
                          className="inline-flex items-center rounded-lg overflow-hidden"
                          style={{ border: "1px solid var(--cart-border)" }}
                        >
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cart-txt hover:opacity-70 transition-opacity"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus className="text-[10px]" />
                          </button>
                          <span className="w-9 sm:w-10 text-center font-ticket-body text-sm font-bold cart-txt">
                            {item.qty || 1}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cart-txt hover:opacity-70 transition-opacity"
                            aria-label="Increase quantity"
                          >
                            <FaPlus className="text-[10px]" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center cart-txt hover:opacity-70 transition-opacity"
                            style={{ border: "1px solid var(--cart-border)" }}
                            aria-label="Remove item"
                          >
                            <FaTrashAlt className="text-[11px]" />
                          </button>
                          <button
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center cart-txt hover:opacity-70 transition-opacity"
                            style={{ border: "1px solid var(--cart-border)" }}
                            aria-label="Edit item"
                          >
                            <FaRegEdit className="text-[11px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="font-ticket-body text-xs font-bold cart-txt-muted hover:cart-txt underline transition-colors"
                    >
                      Clear entire cart
                    </button>
                  )}
                </div>

                {/* RIGHT: SUMMARY */}
                <div className="space-y-5 sm:space-y-6 min-w-0">

                  <div className="cart-summary-card rounded-2xl p-5 sm:p-7">
                    <h2 className="font-ticket-display text-lg sm:text-xl md:text-2xl font-bold cart-txt mb-5 sm:mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-4">
                      <SummaryRow label="Sub Total" value={formatRs(cartTotal)} />
                      <SummaryRow label="Discount" value={formatRs(cartDiscount)} />
                      <SummaryRow label="Tax" value={formatRs(cartTax)} />
                      <SummaryRow
                        label="Shipping"
                        value={cartShipping === 0 ? "Free" : formatRs(cartShipping)}
                        valueColor={cartShipping === 0 ? "#fc9d03" : undefined}
                      />
                      <div
                        className="pt-4 mt-2 flex items-center justify-between"
                        style={{ borderTop: "1px solid var(--cart-border)" }}
                      >
                        <span className="font-ticket-body text-sm font-bold cart-txt">Total</span>
                        <span className="font-ticket-display text-base sm:text-lg font-bold cart-txt">
                          {formatRs(cartGrandTotal)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isNavigating}
                      className="w-full mt-5 sm:mt-6 py-3.5 sm:py-4 rounded-2xl font-ticket-body text-sm font-bold cart-lime-bg transition-colors disabled:opacity-60"
                    >
                      {isNavigating ? "Loading Checkout..." : "Proceed to Checkout"}
                    </button>

                    <p className="font-ticket-body text-xs cart-txt-muted text-center mt-4 sm:mt-5">
                      Estimated Delivery by{" "}
                      <strong className="cart-txt">{estimatedDelivery}</strong>
                    </p>
                  </div>

                  <div className="cart-coupon-card rounded-2xl p-5 sm:p-7">
                    <h2 className="font-ticket-display text-lg sm:text-xl font-bold cart-txt mb-4">
                      Have a Coupon?
                    </h2>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        className="flex-1 min-w-0 px-4 py-3 rounded-xl font-ticket-body text-sm outline-none cart-surface cart-txt"
                        style={{ border: "1px solid var(--cart-border)", fontSize: 16 }}
                      />
                      <button
                        className="px-4 sm:px-5 py-3 rounded-xl font-ticket-body text-sm font-bold transition-colors flex-shrink-0"
                        style={{
                          color: "#fc9d03",
                          background: "transparent",
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="cart-pay-btn rounded-2xl py-3.5 sm:py-4 px-3 sm:px-4 flex items-center justify-center gap-2 font-ticket-body text-xs sm:text-sm font-bold transition-colors">
                      <FaWallet className="text-sm flex-shrink-0" />
                      <span className="truncate">Cash Payment</span>
                    </button>
                    <button className="cart-pay-btn rounded-2xl py-3.5 sm:py-4 px-3 sm:px-4 flex items-center justify-center gap-2 font-ticket-body text-xs sm:text-sm font-bold transition-colors">
                      <FaUniversity className="text-sm flex-shrink-0" />
                      <span className="truncate">Online Payment</span>
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════
           ORDERS VIEW
           ═══════════════════════════════════════════════════════ */
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3 py-2 rounded-lg font-ticket-body text-xs font-bold transition-colors"
            style={{ border: "1px solid var(--or-line)", color: "var(--or-txt)" }}
          >
            <FaArrowLeft className="text-[10px]" /> Back
          </button>

          <div className="flex items-center gap-3 mb-5 sm:mb-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="font-ticket-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--or-txt)" }}>
                My Orders
              </h1>
              <p className="font-ticket-body text-xs mt-0.5" style={{ color: "var(--or-txt-soft)" }}>
                Track your orders & delivery details
              </p>
            </div>

            {liveConnected && (
              <span
                className="inline-flex items-center gap-1.5 font-ticket-body text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "var(--or-success-soft)", color: "var(--or-success)" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--or-success)" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--or-success)" }} />
                </span>
                Live
              </span>
            )}
            {syncing && (
              <span className="inline-flex items-center gap-1.5 font-ticket-body text-[10px] font-bold" style={{ color: "var(--or-txt-soft)" }}>
                <FaSpinner className="animate-spin text-[10px]" /> Syncing…
              </span>
            )}
          </div>

          <div className="inline-flex rounded-lg p-1 mb-5 sm:mb-6" style={{ background: "var(--or-card)", border: "1px solid var(--or-line)" }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              const label = t.id === "cart" ? `${t.label} (${cartCount})` : `${t.label} (${orders.length})`;
              return (
                <Link
                  key={t.id}
                  to={t.to}
                  className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md font-ticket-body text-xs font-bold"
                  style={{ color: active ? "#fff" : "var(--or-txt-soft)" }}
                >
                  {active && (
                    <motion.div
                      layoutId="orders-tab"
                      className="absolute inset-0 rounded-md"
                      style={{ background: "var(--or-primary)" }}
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                  <Icon className="text-xs relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          <section>
            {orders.length === 0 ? (
              <EmptyState
                icon={FaClipboardCheck}
                title="No orders yet"
                sub="Your placed orders will appear here."
                action={
                  <Link to="/mobiles" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-ticket-body font-bold text-sm" style={{ background: "var(--or-primary)" }}>
                    Start Shopping
                  </Link>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Total orders", value: stats.total, icon: FaClipboardCheck },
                    { label: "In transit", value: stats.inTransit, icon: FaTruck },
                    { label: "Delivered", value: stats.delivered, icon: FaHome },
                    { label: "Total spent", value: formatRs(stats.totalSpent), icon: FaWallet },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="or-card rounded-xl p-3.5">
                        <Icon className="text-sm mb-2" style={{ color: "var(--or-primary-2)" }} />
                        <p className="font-ticket-display text-lg font-bold leading-none truncate" style={{ color: "var(--or-txt)" }}>{s.value}</p>
                        <p className="font-ticket-body text-[10px] mt-1 truncate" style={{ color: "var(--or-txt-soft)" }}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1 min-w-0">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--or-primary-2)" }} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by order ID or item..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg font-ticket-body text-xs outline-none or-input"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 or-scroll">
                    {[{ id: "all", label: "All", color: "#666" }, ...ORDER_STEPS.map((s) => {
                      const meta = getStepMeta(s.id);
                      return { id: s.id, label: s.label, color: meta.color };
                    })].map((f) => {
                      const isActive = statusFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setStatusFilter(f.id)}
                          className="shrink-0 px-3 py-2 rounded-lg font-ticket-body text-[11px] font-bold transition-colors"
                          style={isActive
                            ? { background: f.color || "var(--or-primary)", color: "#fff" }
                            : { border: "1px solid var(--or-line)", color: "var(--or-txt-soft)" }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <EmptyState
                    icon={FaSearch}
                    title="No matching orders"
                    sub="Try a different search term or status filter."
                    action={
                      <button
                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-ticket-body font-bold text-sm"
                        style={{ border: "1px solid var(--or-line-str)", color: "var(--or-txt)" }}
                      >
                        Clear filters
                      </button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isOpen={openOrderId === order.id}
                        isLiveUpdating={liveUpdateFlash === order.id}
                        onToggle={() => setOpenOrderId(openOrderId === order.id ? null : order.id)}
                        onRemove={() => removeOrder(order.id)}
                        onReorder={() => reorder(order)}
                        onUpdateAddress={(newCustomer) => updateOrderAddress(order.id, newCustomer)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUMMARY ROW
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

/* ═══════════════════════════════════════════════════════════════
   ORDER CARD
   ═══════════════════════════════════════════════════════════════ */
const OrderCard = ({ order, isOpen, isLiveUpdating, onToggle, onRemove, onReorder, onUpdateAddress }) => {
  const stepIndex = getStepIndex(order);
  const currentStep = ORDER_STEPS[stepIndex];
  const currentMeta = getStepMeta(currentStep?.id);
  const isDelivered = stepIndex >= ORDER_STEPS.length - 1;
  const isEarlyStage = stepIndex === 0;
  const canEditAddress = stepIndex <= 1;

  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [draft, setDraft] = useState({
    fullName: order?.customer?.fullName || "",
    phone: order?.customer?.phone || "",
    address: order?.customer?.address || "",
    city: order?.customer?.city || "",
  });

  useEffect(() => {
    setDraft({
      fullName: order?.customer?.fullName || "",
      phone: order?.customer?.phone || "",
      address: order?.customer?.address || "",
      city: order?.customer?.city || "",
    });
  }, [order?.customer?.fullName, order?.customer?.phone, order?.customer?.address, order?.customer?.city]);

  const meta = METHOD_META[order.method] || METHOD_META.easypaisa;
  const MethodIcon = meta.icon;
  const methodLabel = meta.label;
  const methodLogo = meta.logo;

  const trackingNumber = getTrackingNumber(order);
  const courier = getCourier(order);
  const eta = getEta(order);
  const placedAt = new Date(order.placedAt);

  const customer = order.customer || {};
  const shippingAddress = [customer.address, customer.city].filter(Boolean).join(", ") || "—";

  const handleCopyTracking = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try { await downloadOrderPDF(order); }
    catch (err) {
      console.error("PDF download failed:", err);
      alert("Could not generate PDF. Please try again.");
    }
  };

  const handleSaveAddress = async (e) => {
    e.stopPropagation();
    setSavingAddress(true);
    try {
      await onUpdateAddress?.({
        fullName: draft.fullName.trim(),
        phone: draft.phone.trim(),
        address: draft.address.trim(),
        city: draft.city.trim(),
      });
      setEditingAddress(false);
    } catch (err) {
      console.error("[OrderCard] address update failed:", err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingAddress(false);
    setDraft({
      fullName: order?.customer?.fullName || "",
      phone: order?.customer?.phone || "",
      address: order?.customer?.address || "",
      city: order?.customer?.city || "",
    });
  };

  return (
    <motion.div
      layout
      className="or-card rounded-2xl overflow-hidden"
      style={{
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: isLiveUpdating ? currentMeta.color : isOpen ? `${currentMeta.color}44` : "var(--or-line)",
        boxShadow: isLiveUpdating ? `0 0 0 4px ${currentMeta.color}22` : undefined,
      }}
    >
      <button onClick={onToggle} className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-5 text-left">
        <div
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: "var(--or-primary-soft)", border: "1px solid var(--or-primary)" }}
        >
          {methodLogo ? (
            <img src={methodLogo} alt={methodLabel} className="h-6 sm:h-7 object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <MethodIcon className="text-sm" style={{ color: "var(--or-primary-2)" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-ticket-display text-[13px] sm:text-sm font-bold truncate" style={{ color: "var(--or-txt)" }}>
              Order #{order.id}
            </p>
            {isLiveUpdating && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: "var(--or-success)" }}
              >
                <FaCheck className="text-[7px]" /> Just updated
              </motion.span>
            )}
          </div>
          <p className="font-ticket-body text-[10px] truncate" style={{ color: "var(--or-txt-soft)" }}>
            {order.items.length} item{order.items.length > 1 ? "s" : ""} · {formatRs(order.total)} · {placedAt.toLocaleDateString()}
          </p>
        </div>
        <span
          className="hidden sm:inline-flex items-center gap-1.5 font-ticket-body text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          style={{ background: currentMeta.color, color: "#fff" }}
        >
          <FaCheck className="text-[8px]" />
          {currentMeta.label}
        </span>
        <FaChevronRight
          className="text-[10px] transition-transform flex-shrink-0"
          style={{ color: "var(--or-txt-soft)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
              <div className="or-green-panel relative p-4 sm:p-6 lg:p-8 text-white">
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
                  {[
                    { top: "12%", left: "14%", color: "#facc15", size: 8, rot: 45 },
                    { top: "22%", left: "24%", color: "#f472b6", size: 6, rot: 20 },
                    { top: "18%", left: "78%", color: "#60a5fa", size: 7, rot: -15 },
                    { top: "68%", left: "12%", color: "#a78bfa", size: 6, rot: 30 },
                    { top: "78%", left: "82%", color: "#facc15", size: 8, rot: -30 },
                    { top: "34%", left: "88%", color: "#f472b6", size: 7, rot: 45 },
                    { top: "82%", left: "40%", color: "#60a5fa", size: 6, rot: -20 },
                  ].map((p, i) => (
                    <span
                      key={i}
                      className="absolute rounded-sm"
                      style={{
                        top: p.top,
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        transform: `rotate(${p.rot}deg)`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative flex flex-col items-center text-center pt-4 sm:pt-6 pb-6 sm:pb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.6, bounce: 0.5 }}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white flex items-center justify-center mb-4 sm:mb-5 shadow-2xl"
                  >
                    <svg viewBox="0 0 52 52" className="w-10 h-10 sm:w-12 sm:h-12">
                      <motion.path
                        d="M14 27 L23 36 L38 18"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>

                  <p className="font-ticket-body text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase opacity-90 mb-2">
                    Thank You
                  </p>
                  <h2 className="font-ticket-display text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
                    {isDelivered ? "Your Order Is Delivered" : "Your Order Is Confirmed"}
                  </h2>
                  <p className="font-ticket-body text-[11px] sm:text-xs opacity-90 max-w-md px-2">
                    We will be sending you an email confirmation to {customer.email || "your email"} shortly.
                  </p>
                </div>

                <div className="relative bg-white rounded-lg p-3 sm:p-5 text-[#111111]">
                  <p className="font-ticket-body text-[10px] sm:text-[11px] text-center text-gray-500 mb-4 sm:mb-5">
                    Order <strong>#{order.id}</strong> was placed on{" "}
                    <strong>{placedAt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</strong>{" "}
                    and is currently in progress
                  </p>

                  <div className="relative flex items-start justify-between gap-1">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 rounded-full" />
                    <motion.div
                      className="absolute top-4 left-4 h-0.5 rounded-full"
                      style={{ background: "#16A34A" }}
                      initial={{ width: 0 }}
                      animate={{ width: `calc(${(stepIndex / (ORDER_STEPS.length - 1)) * 100}% - 0px)` }}
                      transition={{ duration: 0.6 }}
                    />

                    {ORDER_STEPS.map((s, i) => {
                      const sMeta = getStepMeta(s.id);
                      const Icon = sMeta.icon;
                      const done = i <= stepIndex;
                      const active = i === stepIndex;
                      return (
                        <div key={s.id} className="relative z-10 flex flex-col items-center flex-1 min-w-0">
                          <div
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all flex-shrink-0"
                            style={
                              done
                                ? { background: "#16A34A", color: "#fff" }
                                : { background: "#e5e7eb", color: "#9ca3af" }
                            }
                          >
                            {active && !isDelivered ? (
                              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                <Icon className="text-[10px] sm:text-xs" />
                              </motion.span>
                            ) : (
                              <Icon className="text-[10px] sm:text-xs" />
                            )}
                          </div>
                          <p
                            className="font-ticket-body text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-center leading-tight line-clamp-2 px-0.5"
                            style={{ color: done ? "#111111" : "#9ca3af" }}
                          >
                            {sMeta.label}
                          </p>
                          {active && !isDelivered && (
                            <p className="font-ticket-body text-[7px] sm:text-[8px] mt-1 text-center" style={{ color: "#16A34A" }}>
                              In progress
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-200 flex-wrap gap-2">
                    <p className="font-ticket-body text-[10px]" style={{ color: "#6b7280" }}>
                      Expected Delivery:{" "}
                      <strong className="text-[#111111]">
                        {eta.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                      </strong>
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyTracking(); }}
                      className="font-ticket-body text-[11px] font-bold underline"
                      style={{ color: "#2563eb" }}
                    >
                      {copied ? "Copied!" : "Track Your Order"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="or-side p-4 sm:p-5 lg:p-6 flex flex-col gap-4 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--or-txt-soft)" }}>
                      Order Detail
                    </p>
                    <p className="font-ticket-display text-base sm:text-lg font-bold mt-0.5" style={{ color: "var(--or-txt)" }}>
                      #{order.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-ticket-body text-[10px]" style={{ color: "var(--or-txt-soft)" }}>
                      Pay with {methodLabel}
                    </p>
                    <button
                      onClick={handleDownload}
                      className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-ticket-body text-[11px] font-bold transition-colors"
                      style={{ border: "1px solid var(--or-line-str)", color: "var(--or-txt)" }}
                    >
                      <FaDownload className="text-[10px]" />
                      Download Invoice
                    </button>
                  </div>
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid var(--or-line)" }}>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt style={{ color: "var(--or-primary-2)" }} className="text-xs" />
                      <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--or-txt)" }}>
                        Delivery Address
                      </p>
                    </div>

                    {!editingAddress && canEditAddress && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingAddress(true); }}
                        className="inline-flex items-center gap-1 font-ticket-body text-[10px] font-bold underline"
                        style={{ color: "#2563eb" }}
                      >
                        <FaEdit className="text-[9px]" />
                        Change Details
                      </button>
                    )}

                    {!editingAddress && !canEditAddress && (
                      <span
                        className="inline-flex items-center gap-1 font-ticket-body text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--or-success-soft)", color: "var(--or-success)" }}
                        title="Address can no longer be edited once shipped"
                      >
                        <FaLock className="text-[8px]" /> Locked
                      </span>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {!editingAddress ? (
                      <motion.div
                        key="readonly"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="font-ticket-body text-[11px] leading-relaxed" style={{ color: "var(--or-txt-soft)" }}>
                          {customer.fullName || "—"}<br />
                          {shippingAddress}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="space-y-2"
                      >
                        <input
                          type="text"
                          value={draft.fullName}
                          onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                          placeholder="Full name"
                          className="w-full px-3 py-2 rounded-lg font-ticket-body text-[11px] outline-none or-input"
                        />
                        <input
                          type="text"
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          placeholder="Phone number"
                          className="w-full px-3 py-2 rounded-lg font-ticket-body text-[11px] outline-none or-input"
                        />
                        <input
                          type="text"
                          value={draft.address}
                          onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                          placeholder="House #, street, area"
                          className="w-full px-3 py-2 rounded-lg font-ticket-body text-[11px] outline-none or-input"
                        />
                        <input
                          type="text"
                          value={draft.city}
                          onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                          placeholder="City"
                          className="w-full px-3 py-2 rounded-lg font-ticket-body text-[11px] outline-none or-input"
                        />

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={handleSaveAddress}
                            disabled={savingAddress}
                            className="flex-1 py-2 rounded-lg font-ticket-body text-[11px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                            style={{ background: "var(--or-primary)", color: "#fff" }}
                          >
                            {savingAddress ? (
                              <>
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                  className="inline-block h-3 w-3 rounded-full"
                                  style={{ border: "2px solid #fff", borderTopColor: "transparent" }}
                                />
                                Saving…
                              </>
                            ) : (
                              <>
                                <FaSave className="text-[10px]" /> Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-2 rounded-lg font-ticket-body text-[11px] font-bold"
                            style={{ border: "1px solid var(--or-line-str)", color: "var(--or-txt)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid var(--or-line)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaClipboardCheck style={{ color: "var(--or-primary-2)" }} className="text-xs" />
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--or-txt)" }}>
                      Billing Address
                    </p>
                  </div>
                  <p className="font-ticket-body text-[11px] leading-relaxed" style={{ color: "var(--or-txt-soft)" }}>
                    {customer.fullName || "—"}<br />
                    {shippingAddress}
                  </p>
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid var(--or-line)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser style={{ color: "var(--or-primary-2)" }} className="text-xs" />
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--or-txt)" }}>
                      Contact Details
                    </p>
                  </div>
                  <div className="space-y-1">
                    {customer.email && (
                      <p className="font-ticket-body text-[11px] break-all" style={{ color: "var(--or-txt-soft)" }}>
                        <FaEnvelope className="inline text-[9px] mr-1.5" /> {customer.email}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="font-ticket-body text-[11px]" style={{ color: "var(--or-txt-soft)" }}>
                        <FaPhone className="inline text-[9px] mr-1.5" /> {customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden mt-auto" style={{ border: "1px solid var(--or-line)" }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--or-card)" }}>
                    <p className="font-ticket-body text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--or-txt)" }}>
                      Order Summary ({order.items.length})
                    </p>
                    <FaChevronRight className="text-[10px]" style={{ color: "var(--or-txt-soft)" }} />
                  </div>
                  <div className="px-4 py-3 space-y-2" style={{ background: "var(--or-side)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-ticket-body text-[11px]" style={{ color: "var(--or-txt-soft)" }}>Sub Total</span>
                      <span className="font-ticket-display text-[11px] font-bold flex-shrink-0" style={{ color: "var(--or-txt)" }}>{formatRs(order.subtotal || order.total)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-ticket-body text-[11px]" style={{ color: "var(--or-txt-soft)" }}>Delivery</span>
                      <span className="font-ticket-display text-[11px] font-bold flex-shrink-0" style={{ color: "var(--or-txt)" }}>
                        {formatRs((order.shippingFee || 0) + (order.deliveryCharge || 0))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--or-card)", borderTop: "1px solid var(--or-line)" }}>
                    <span className="font-ticket-body text-xs font-bold" style={{ color: "var(--or-txt)" }}>Total</span>
                    <span className="font-ticket-display text-sm font-bold flex-shrink-0" style={{ color: "var(--or-primary-2)" }}>{formatRs(order.total)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid var(--or-line)" }}>
                  {isDelivered && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onReorder(); }}
                      className="w-full py-2.5 rounded-lg font-ticket-body text-xs font-bold inline-flex items-center justify-center gap-2"
                      style={{ background: "var(--or-primary)", color: "#fff" }}
                    >
                      <FaRedo className="text-[11px]" /> Reorder
                    </button>
                  )}

                  {!confirmingRemove ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmingRemove(true); }}
                      className="w-full py-2.5 rounded-lg font-ticket-body text-xs font-bold inline-flex items-center justify-center gap-2"
                      style={{ border: "1px solid var(--or-danger)", color: "var(--or-danger)" }}
                    >
                      <FaTrashAlt className="text-[11px]" />
                      {isEarlyStage ? "Cancel order" : "Remove order"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: "1px solid var(--or-danger)" }}>
                      <FaExclamationTriangle className="text-[11px] shrink-0" style={{ color: "var(--or-danger)" }} />
                      <span className="font-ticket-body text-[11px] font-bold flex-1" style={{ color: "var(--or-txt)" }}>Sure?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="px-2.5 py-1 rounded-md text-white font-ticket-body text-[10px] font-bold"
                        style={{ background: "var(--or-danger)" }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmingRemove(false); }}
                        className="px-2.5 py-1 rounded-md font-ticket-body text-[10px] font-bold"
                        style={{ border: "1px solid var(--or-line-str)", color: "var(--or-txt)" }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmptyState = ({ icon: Icon, title, sub, action }) => (
  <div className="or-card rounded-2xl py-12 sm:py-16 px-5 sm:px-6 text-center">
    <Icon className="text-4xl mx-auto mb-4" style={{ color: "var(--or-txt-faint)" }} />
    <p className="font-ticket-display text-lg font-bold mb-1" style={{ color: "var(--or-txt)" }}>{title}</p>
    <p className="font-ticket-body text-xs mb-5" style={{ color: "var(--or-txt-soft)" }}>{sub}</p>
    {action}
  </div>
);

export default Orders;