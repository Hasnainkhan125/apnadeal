// pages/AdminDashboard.jsx — Modern Property-Dashboard-style admin panel
// + Listings Moderation tab
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardCheck, FaBoxOpen, FaTruck, FaHome, FaCheck,
  FaArrowLeft, FaShoppingCart, FaTrashAlt, FaMobileAlt,
  FaCreditCard, FaUniversity, FaSpinner, FaSearch,
  FaCopy, FaHeadset, FaMapMarkerAlt, FaRedo, FaExclamationTriangle,
  FaWallet, FaTimes, FaUser, FaChevronDown, FaEye,
  FaChartLine, FaDollarSign, FaSync, FaFilter, FaCrown,
  FaShieldAlt, FaSave, FaUndo, FaSortAmountDown, FaSortAmountUp,
  FaFileAlt, FaImage, FaReceipt, FaCheckDouble, FaTimesCircle,
  FaExternalLinkAlt, FaDownload, FaBars, FaBell, FaCog,
  FaUsers, FaThLarge, FaListAlt, FaSignOutAlt, FaPlus,
  FaMoon, FaSun, FaChevronRight, FaCalendarAlt, FaTag,
  FaToggleOn, FaToggleOff, FaUpload,
  // ⭐ NEW for moderation tab
  FaGavel, FaCheckCircle, FaBan, FaClock, FaLightbulb,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaPaperPlane, FaUserPlus } from "react-icons/fa";
import {
  readOrders,
  writeOrders,
  syncAllOrdersFromSupabase,
  updateOrderStatus,
  adminDeleteOrder,
  ORDER_STEPS,
} from "../lib/cartStore";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { sendEmailJS } from "../lib/emailjs";
import {
  fetchManualPayments,
  updateManualPaymentStatus,
  deleteManualPayment,
  approveManualPayment,
} from "../lib/manualPayments";
import { toast as globalToast } from "../lib/toast";
import { useOnboarding } from "../contexts/OnboardingContext";
import {
  DEFAULT_SECTIONS,
  saveOnboardingConfig,
  uploadOnboardingImage,
} from "../lib/onboarding";

/* ═══════════════════════════════════════════════════════════════
   STYLES — unchanged from your existing file
   ═══════════════════════════════════════════════════════════════ */
const AdminDashboardStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    .theme-dark {
      --ad-bg:              #0A0A12;
      --ad-bg-2:            #0F0F1A;
      --ad-shell:           #0D0D17;
      --ad-card:            #14141E;
      --ad-card-2:          #1A1A24;
      --ad-side:            #0D0D17;
      --ad-line:            rgba(255,255,255,0.07);
      --ad-line-str:        rgba(255,255,255,0.14);
      --ad-txt:             #FFFFFF;
      --ad-txt-soft:        rgba(255,255,255,0.62);
      --ad-txt-faint:       rgba(255,255,255,0.42);
      --ad-dot:             rgba(252,157,3,0.07);
      --ad-amber:           #fc9d03;
      --ad-amber-2:         #ffb733;
      --ad-amber-3:         #eb7d34;
      --ad-amber-soft:      rgba(252,157,3,0.14);
      --ad-amber-glow:      rgba(252,157,3,0.45);
      --ad-cream:           #F5E6C8;
      --ad-cream-txt:       #1A1613;
      --ad-pink:            #F7D7C9;
      --ad-pink-txt:        #1A1613;
      --ad-mint:            #D9F0DD;
      --ad-mint-txt:        #0F2E1A;
      --ad-danger:          #E2795F;
      --ad-danger-soft:     rgba(226,121,95,0.14);
      --ad-success:         #3fa77f;
      --ad-success-soft:    rgba(63,167,127,0.10);
      --ad-warning:         #EAB308;
      --ad-warning-soft:    rgba(234,179,8,0.12);
    }

    .theme-light {
      --ad-bg:              #F5F7F4;
      --ad-bg-2:            #EFF3EE;
      --ad-shell:           #FFFFFF;
      --ad-card:            #FFFFFF;
      --ad-card-2:          #F8FAF7;
      --ad-side:            #FFFFFF;
      --ad-line:            rgba(20,20,30,0.08);
      --ad-line-str:        rgba(20,20,30,0.14);
      --ad-txt:             #0F1115;
      --ad-txt-soft:        rgba(15,17,21,0.62);
      --ad-txt-faint:       rgba(15,17,21,0.42);
      --ad-dot:             rgba(224,137,0,0.06);
      --ad-amber:           #e08900;
      --ad-amber-2:         #fc9d03;
      --ad-amber-3:         #eb7d34;
      --ad-amber-soft:      rgba(224,137,0,0.10);
      --ad-amber-glow:      rgba(224,137,0,0.35);
      --ad-cream:           #FFF3DC;
      --ad-cream-txt:       #1A1613;
      --ad-pink:            #FFE1D4;
      --ad-pink-txt:        #1A1613;
      --ad-mint:            #DCF2E0;
      --ad-mint-txt:        #0F2E1A;
      --ad-danger:          #DC2626;
      --ad-danger-soft:     rgba(220,38,38,0.08);
      --ad-success:         #16A34A;
      --ad-success-soft:    rgba(22,163,74,0.10);
      --ad-warning:         #CA8A04;
      --ad-warning-soft:    rgba(202,138,4,0.10);
    }

    .ad-shell {
      background: var(--ad-bg);
      color: var(--ad-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .ad-sidebar {
      background: var(--ad-side);
      border-right: 1px solid var(--ad-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .ad-card {
      background: var(--ad-card);
      border: 1px solid var(--ad-line);
      transition: background 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
    }
    .ad-card-2 {
      background: var(--ad-card-2);
      border: 1px solid var(--ad-line);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .ad-input {
      background: var(--ad-card-2);
      color: var(--ad-txt);
      border: 1px solid var(--ad-line);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .ad-input:focus {
      border-color: var(--ad-amber);
      box-shadow: 0 0 0 3px var(--ad-amber-soft);
      outline: none;
    }
    .ad-nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 12px;
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 13.5px; font-weight: 600;
      color: var(--ad-txt-soft);
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
    }
    .ad-nav-item:hover { background: var(--ad-amber-soft); color: var(--ad-amber); }
    .ad-nav-item.active { background: var(--ad-txt); color: var(--ad-bg); }
    .theme-dark .ad-nav-item.active { background: #FFFFFF; color: #0A0A12; }
    .ad-tile {
      border-radius: 22px;
      padding: 20px;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .ad-tile:hover { transform: translateY(-2px); box-shadow: 0 16px 40px -20px rgba(0,0,0,0.25); }
    .ad-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
    .ad-scroll::-webkit-scrollbar-track { background: transparent; }
    .ad-scroll::-webkit-scrollbar-thumb { background: var(--ad-line-str); border-radius: 4px; }
    .ad-scroll::-webkit-scrollbar-thumb:hover { background: var(--ad-amber); }
    .ad-bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s ease; }
    .ad-drawer-mask {
      position: fixed; inset: 0; z-index: 90;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
  `}</style>
);

/* ═══ STEP COLOR SYSTEM (unchanged) ═══ */
const STEP_META = {
  placed:     { color: "#2A6FB8", bg: "rgba(42,111,184,0.12)",  icon: FaClipboardCheck, pill: "Order Placed" },
  processing: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: FaBoxOpen,        pill: "Processing" },
  shipped:    { color: "#fc9d03", bg: "rgba(252,157,3,0.14)",   icon: FaTruck,          pill: "Shipped" },
  out:        { color: "#E26A2C", bg: "rgba(226,106,44,0.14)",  icon: FaTruck,          pill: "Out for Delivery" },
  delivered:  { color: "#16A34A", bg: "rgba(22,163,74,0.14)",   icon: FaHome,           pill: "Delivered" },
};

const getStepMeta = (id) => STEP_META[id] || STEP_META.placed;

const METHOD_META = {
  easypaisa: { label: "Easypaisa", icon: FaMobileAlt,  logo: "/esypaisa.png" },
  card:      { label: "ATM / Card", icon: FaCreditCard, logo: null },
  bank:      { label: "Meezan Bank", icon: FaUniversity, logo: "/meezan.png" },
  jazzcash:  { label: "JazzCash",   icon: FaWallet,     logo: "/jazcash.png" },
  cod:       { label: "Cash on Delivery", icon: FaWallet, logo: null },
};

const formatRs = (n) => `Rs ${Number(n || 0).toLocaleString("en-US")}`;
const formatDateTime = (d) =>
  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
  " · " +
  new Date(d).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const getTrackingNumber = (order) =>
  order.trackingNumber ||
  `APD-${String(order.id).replace(/[^0-9A-Za-z]/g, "").slice(-6).toUpperCase() || "000000"}`;

const getStepIndex = (order) => (order.statusIndex != null ? order.statusIndex : 0);

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState(() => readOrders());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [syncing, setSyncing] = useState(false);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("orders");
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("pending");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
/* ⭐ Email tab state */
const [emailTo, setEmailTo] = useState("");
const [emailFirstName, setEmailFirstName] = useState("");
const [emailTemplate, setEmailTemplate] = useState("welcome");
const [emailSubject, setEmailSubject] = useState("");
const [emailHeading, setEmailHeading] = useState("");
const [emailSubtitle, setEmailSubtitle] = useState("");
const [emailBody, setEmailBody] = useState("");
const [emailCtaLabel, setEmailCtaLabel] = useState("");
const [emailCtaUrl, setEmailCtaUrl] = useState("");
const [sendingEmail, setSendingEmail] = useState(false);
const [allUsers, setAllUsers] = useState([]);
const [usersLoading, setUsersLoading] = useState(false);
const [userSearch, setUserSearch] = useState("");   // ✅ MOVED UP
/* ⭐ Hero image upload state */
const [emailHeroUrl, setEmailHeroUrl] = useState("");
const [emailHeroUploading, setEmailHeroUploading] = useState(false);
const emailHeroFileRef = useRef(null);
/* ⭐ Logo upload state */
const [emailLogoUrl, setEmailLogoUrl] = useState("");
const [emailLogoUploading, setEmailLogoUploading] = useState(false);
const emailLogoFileRef = useRef(null);
/* Filtered users for the picker — now safe because userSearch exists */
const filteredUsers = useMemo(() => {
  const q = userSearch.trim().toLowerCase();
  if (!q) return allUsers;
  return allUsers.filter(
    (u) =>
      String(u.name || "").toLowerCase().includes(q) ||
      String(u.email || "").toLowerCase().includes(q)
  );
}, [allUsers, userSearch]);
/* ⭐ Load ALL users when Email tab opens */
useEffect(() => {
  if (tab !== "email") return;
  let cancelled = false;
  (async () => {
    setUsersLoading(true);
    try {
      // Try `users` table first (most projects have this)
      const { data: usersData, error: usersErr } = await supabase
        .from("users")
        .select("id, name, full_name, username, email, avatar_url, created_at")
        .not("email", "is", null)
        .order("created_at", { ascending: false });

      if (usersErr) {
        console.warn("users table failed, trying user_settings:", usersErr);
      }

      // Also fetch from user_settings as a fallback (some users may only be there)
      const { data: settingsData, error: settingsErr } = await supabase
        .from("user_settings")
        .select("user_id, full_name, email, avatar, created_at")
        .not("email", "is", null)
        .order("created_at", { ascending: false });

      if (settingsErr) {
        console.warn("user_settings failed:", settingsErr);
      }

      // Merge & dedupe by email (prefer `users` record)
      const mergedMap = new Map();

      (usersData || []).forEach((u) => {
        if (!u.email) return;
        mergedMap.set(u.email.toLowerCase(), {
          id: u.id,
          email: u.email,
          name: u.full_name || u.name || u.username || u.email.split("@")[0],
          avatar_url: u.avatar_url,
          created_at: u.created_at,
          source: "users",
        });
      });

      (settingsData || []).forEach((s) => {
        if (!s.email) return;
        const key = s.email.toLowerCase();
        if (!mergedMap.has(key)) {
          mergedMap.set(key, {
            id: s.user_id,
            email: s.email,
            name: s.full_name || s.email.split("@")[0],
            avatar_url: s.avatar,
            created_at: s.created_at,
            source: "user_settings",
          });
        }
      });

      const list = Array.from(mergedMap.values()).sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });

      if (!cancelled) setAllUsers(list);
    } catch (err) {
      console.error("Load users failed:", err);
      showToast("Failed to load users", "error");
    } finally {
      if (!cancelled) setUsersLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, [tab]);


  /* ⭐ NEW — moderation listings state */
  const [pendingListings, setPendingListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingFilter, setListingFilter] = useState("pending");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [moderationBusy, setModerationBusy] = useState(null);
const FROM_EMAIL_LABEL = "APNa Deal <onboarding@resend.dev>";
  /* Detect theme */
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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };



/* ⭐ Admin email — send via EmailJS */
const sendAdminEmail = async (payload) => {
  return sendEmailJS(payload);
};

/* ⭐ Hero image upload handler */
const handleHeroUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate
  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image must be under 5MB", "error");
    return;
  }

  setEmailHeroUploading(true);
  try {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `hero-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("email-assets")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("email-assets")
      .getPublicUrl(fileName);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error("Failed to get public URL");

    setEmailHeroUrl(publicUrl);
    showToast("Hero image uploaded", "success");
  } catch (err) {
    console.error("[Admin] Hero upload failed:", err);
    showToast(`Upload failed: ${err.message}`, "error");
  } finally {
    setEmailHeroUploading(false);
    e.target.value = "";
  }
};

const removeHeroImage = () => {
  setEmailHeroUrl("");
  showToast("Hero image removed", "success");
};

/* ⭐ Logo upload handler */
const handleLogoUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file", "error");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast("Logo must be under 2MB", "error");
    return;
  }

  setEmailLogoUploading(true);
  try {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("email-assets")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("email-assets")
      .getPublicUrl(fileName);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error("Failed to get public URL");

    setEmailLogoUrl(publicUrl);
    showToast("Logo uploaded", "success");
  } catch (err) {
    console.error("[Admin] Logo upload failed:", err);
    showToast(`Upload failed: ${err.message}`, "error");
  } finally {
    setEmailLogoUploading(false);
    e.target.value = "";
  }
};

const removeLogoImage = () => {
  setEmailLogoUrl("");
  showToast("Logo removed", "success");
};

useEffect(() => {
  let cancelled = false;
  let intervalId;

  const load = async () => {
    setPaymentsLoading(true);
    try {
      const list = await fetchManualPayments();
      console.log("[Admin] fetched payments:", list?.length, list);
      if (!cancelled) setPayments(list);
    } catch (err) {
      console.error("[Admin] Payments load failed:", err);
    } finally {
      if (!cancelled) setPaymentsLoading(false);
    }
  };

  load();
  intervalId = setInterval(load, 30000);   // refresh every 30 seconds

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}, []);
/* ⭐ Load listings for moderation */
const fetchListings = useCallback(async (filter = "pending") => {
  setListingsLoading(true);
  try {
    let query = supabase
      .from("listings")
      .select(`
        id, user_id, title, description, price, category, condition,
        city, area, contact_number, images, cover_image, specs,
        status, moderation_notes, created_at, reviewed_at
      `)
      .order("created_at", { ascending: filter === "pending" });

    if (filter !== "all") {
      query = query.eq("status", filter);
    } else {
      // For "all", only show recent moderation-relevant listings
      query = query.in("status", ["pending", "active", "rejected"]).limit(100);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Enrich with seller profile
    const userIds = [...new Set((data || []).map((l) => l.user_id))];
    let usersMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, name, full_name, username, email, avatar_url")
        .in("id", userIds);
      (users || []).forEach((u) => { usersMap[u.id] = u; });
    }

    const enriched = (data || []).map((l) => ({
      ...l,
      seller: usersMap[l.user_id] || null,
    }));

    setPendingListings(enriched);
  } catch (err) {
    console.error("[Admin] Listings load failed:", err);
    showToast("Failed to load listings", "error");
  } finally {
    setListingsLoading(false);
  }
}, []);

/* Load listings when tab changes or filter changes */
useEffect(() => {
  if (tab === "listings") {
    fetchListings(listingFilter);
  }
}, [tab, listingFilter, fetchListings]);
  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => getStepIndex(o) >= ORDER_STEPS.length - 1).length;
    const inTransit = orders.filter((o) => {
      const i = getStepIndex(o);
      return i > 0 && i < ORDER_STEPS.length - 1;
    }).length;
    const pending = orders.filter((o) => getStepIndex(o) === 0).length;
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    return { total, delivered, inTransit, pending, revenue };
  }, [orders]);

  /* ─── Filtered orders ─── */
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = orders.filter((o) => {
      const stepId = ORDER_STEPS[getStepIndex(o)]?.id;
      const matchStatus = statusFilter === "all" || stepId === statusFilter;
      const matchSearch =
        q === "" ||
        String(o.id).toLowerCase().includes(q) ||
        (o.customer?.fullName || "").toLowerCase().includes(q) ||
        (o.customer?.phone || "").toLowerCase().includes(q) ||
        o.items.some((it) => it.title.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.placedAt) - new Date(a.placedAt);
      if (sortBy === "oldest") return new Date(a.placedAt) - new Date(b.placedAt);
      if (sortBy === "highest") return (b.total || 0) - (a.total || 0);
      if (sortBy === "lowest") return (a.total || 0) - (b.total || 0);
      return 0;
    });
    return list;
  }, [orders, search, statusFilter, sortBy]);

  const filteredPayments = useMemo(() => {
    if (paymentFilter === "all") return payments;
    return payments.filter((p) => p.status === paymentFilter);
  }, [payments, paymentFilter]);

  const pendingPaymentsCount = useMemo(
    () => payments.filter((p) => p.status === "pending").length,
    [payments]
  );

  const pendingListingsCount = useMemo(
    () => pendingListings.filter((l) => l.status === "pending").length,
    [pendingListings]
  );

  /* ─── Actions ─── */
  const changeStatus = async (orderId, newStatusIndex) => {
    const prev = orders;
    const next = orders.map((o) =>
      o.id === orderId
        ? { ...o, statusIndex: newStatusIndex, statusUpdatedAt: new Date().toISOString() }
        : o
    );
    setOrders(next);
    writeOrders(next);
    try {
      if (updateOrderStatus) await updateOrderStatus(orderId, newStatusIndex);
      const meta = getStepMeta(ORDER_STEPS[newStatusIndex]?.id);
      showToast(`Order ${orderId} → ${meta.pill}`, "success");
    } catch (err) {
      console.error("[Admin] Status update failed:", err);
      setOrders(prev);
      writeOrders(prev);
      showToast("Failed to update status", "error");
    }
  };

  const removeOrder = async (orderId) => {
    const prev = orders;
    const next = orders.filter((o) => o.id !== orderId);
    setOrders(next);
    writeOrders(next);
    try {
      await adminDeleteOrder(orderId);
      showToast("Order deleted", "success");
    } catch (err) {
      console.error("[Admin] Order delete failed:", err);
      setOrders(prev);
      writeOrders(prev);
      showToast("Failed to delete order", "error");
    }
  };
const handleApprovePayment = async (payment) => {
  if (actionLoadingId) return;
  setActionLoadingId(payment.id);
  try {
    /* ─── Read credits before ─── */
    let creditsBefore = 0;
    if (payment.user_id) {
      const { data: beforeData } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", payment.user_id)
        .maybeSingle();
      creditsBefore = Number(beforeData?.credits || 0);
    }

    /* ─── Approve — this now handles everything:
         - RPC (credits added atomically)
         - users.is_premium
         - subscriptions.plan
         - user_settings.plan_id (badge)
    ─── */
    const result = await approveManualPayment(payment, user?.id);

    /* ─── Read credits after ─── */
    let creditsAfter = creditsBefore;
    if (payment.user_id) {
      const { data: afterData } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", payment.user_id)
        .maybeSingle();
      creditsAfter = Number(afterData?.credits || 0);
    }

    /* ─── Refresh list ─── */
    const freshList = await fetchManualPayments();
    setPayments(freshList);

    const added = creditsAfter - creditsBefore;
    const planLabel = String(result?.plan || "seller").toUpperCase();

    showToast(
      `Approved — ${planLabel} + ${added > 0 ? "+" : ""}${added.toLocaleString()} credits`,
      "success"
    );
    globalToast(
      `Payment approved · ${planLabel}${added > 0 ? ` · +${added.toLocaleString()} credits` : ""}`,
      { type: "success", duration: 4200 }
    );
  } catch (err) {
    console.error("[Admin] Approve failed:", err);
    showToast(`Approval failed: ${err.message || "unknown"}`, "error");
    try {
      const freshList = await fetchManualPayments();
      setPayments(freshList);
    } catch {}
  } finally {
    setActionLoadingId(null);
  }
};

  const handleRejectPayment = async (payment) => {
    if (actionLoadingId) return;
    setActionLoadingId(payment.id);
    try {
      await updateManualPaymentStatus(payment.id, "rejected", user?.id);
      const freshList = await fetchManualPayments();
      setPayments(freshList);
      showToast("Payment rejected", "success");
      globalToast("Payment request rejected.", { type: "warning", duration: 3600 });
    } catch (err) {
      console.error("[Admin] Reject failed:", err);
      showToast("Rejection failed", "error");
      try {
        const freshList = await fetchManualPayments();
        setPayments(freshList);
      } catch {}
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePayment = async (payment) => {
    if (actionLoadingId) return;
    setActionLoadingId(payment.id);
    try {
      await deleteManualPayment(payment.id);
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      showToast("Payment deleted", "success");
    } catch (err) {
      console.error("[Admin] Delete failed:", err);
      showToast("Delete failed", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ⭐ NEW — Listing moderation actions */
  const handleApproveListing = async (listing) => {
    if (moderationBusy) return;
    setModerationBusy(listing.id);
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          status: "active",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
          moderation_notes: null,
        })
        .eq("id", listing.id);

      if (error) throw error;

      // Notify seller
      try {
        await supabase.from("notifications").insert({
          user_id: listing.user_id,
          type: "listing_approved",
          title: "Your ad is live! 🎉",
          message: `"${listing.title}" has been approved and is now visible to buyers.`,
          related_listing_id: listing.id,
        });
      } catch (err) {
        console.warn("Notification insert failed:", err);
      }

      showToast("Listing approved", "success");
      globalToast(`Approved: ${listing.title}`, { type: "success", duration: 3600 });

      // Refresh the list
      await fetchListings(listingFilter);
    } catch (err) {
      console.error("[Admin] Approve listing failed:", err);
      showToast(`Approve failed: ${err.message || "unknown"}`, "error");
    } finally {
      setModerationBusy(null);
    }
  };

  const handleRejectListing = async () => {
    if (!rejectModal || moderationBusy) return;
    if (!rejectReason.trim()) {
      showToast("Please provide a reason", "error");
      return;
    }

    setModerationBusy(rejectModal.id);
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
          moderation_notes: rejectReason.trim(),
        })
        .eq("id", rejectModal.id);

      if (error) throw error;

      // Notify seller
      try {
        await supabase.from("notifications").insert({
          user_id: rejectModal.user_id,
          type: "listing_rejected",
          title: "Ad needs changes",
          message: `"${rejectModal.title}" was rejected: ${rejectReason.trim()}`,
          related_listing_id: rejectModal.id,
        });
      } catch (err) {
        console.warn("Notification insert failed:", err);
      }

      showToast("Listing rejected", "success");
      globalToast(`Rejected: ${rejectModal.title}`, { type: "warning", duration: 3600 });

      setRejectModal(null);
      setRejectReason("");
      await fetchListings(listingFilter);
    } catch (err) {
      console.error("[Admin] Reject listing failed:", err);
      showToast(`Reject failed: ${err.message || "unknown"}`, "error");
    } finally {
      setModerationBusy(null);
    }
  };

  const handleDeleteListing = async (listing) => {
    if (moderationBusy) return;
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;

    setModerationBusy(listing.id);
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id);

      if (error) throw error;

      setPendingListings((prev) => prev.filter((l) => l.id !== listing.id));
      showToast("Listing deleted", "success");
    } catch (err) {
      console.error("[Admin] Delete listing failed:", err);
      showToast(`Delete failed: ${err.message || "unknown"}`, "error");
    } finally {
      setModerationBusy(null);
    }
  };

  /* ⭐ Bulk approve all pending */
  const handleBulkApprove = async () => {
    const pending = pendingListings.filter((l) => l.status === "pending");
    if (pending.length === 0) return;
    if (!window.confirm(`Approve ${pending.length} pending listings?`)) return;

    try {
      const ids = pending.map((l) => l.id);
      const { error } = await supabase
        .from("listings")
        .update({
          status: "active",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
        })
        .in("id", ids);

      if (error) throw error;

      // Notify all sellers
      try {
        const notifs = pending.map((l) => ({
          user_id: l.user_id,
          type: "listing_approved",
          title: "Your ad is live! 🎉",
          message: `"${l.title}" has been approved.`,
          related_listing_id: l.id,
        }));
        await supabase.from("notifications").insert(notifs);
      } catch (err) {
        console.warn("Bulk notifications failed:", err);
      }

      showToast(`Approved ${pending.length} listings`, "success");
      await fetchListings(listingFilter);
    } catch (err) {
      console.error("[Admin] Bulk approve failed:", err);
      showToast(`Bulk approve failed: ${err.message}`, "error");
    }
  };

  const goToSection = (id) => {
    setTab(id);
    setDrawerOpen(false);
  };

  const handleSignOut = () => {
    try { supabase?.auth?.signOut?.(); } catch {}
    navigate("/signin");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen ad-shell relative"
    >
      <AdminDashboardStyles />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(var(--ad-dot) 0.6px, transparent 0.6px)`,
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-[260px] flex-shrink-0 ad-sidebar min-h-screen sticky top-0 h-screen">
          <Sidebar
            tab={tab}
            onTabChange={goToSection}
            onSignOut={handleSignOut}
            pendingCount={pendingPaymentsCount}
            listingsCount={pendingListingsCount}
            ordersCount={orders.length}
            user={user}
          />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden ad-drawer-mask"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 26, stiffness: 240 }}
                className="lg:hidden fixed top-0 left-0 bottom-0 w-[260px] z-[100] ad-sidebar flex flex-col"
              >
                <Sidebar
                  tab={tab}
                  onTabChange={goToSection}
                  onSignOut={handleSignOut}
                  pendingCount={pendingPaymentsCount}
                  listingsCount={pendingListingsCount}
                  ordersCount={orders.length}
                  user={user}
                  onClose={() => setDrawerOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <TopBar
            onMenuClick={() => setDrawerOpen(true)}
            onBack={() => navigate(-1)}
            search={search}
            setSearch={setSearch}
            syncing={syncing}
            onSync={async () => {
              setSyncing(true);
              const list = await syncAllOrdersFromSupabase();
              if (list) setOrders(list);
              if (tab === "listings") await fetchListings(listingFilter);
              setSyncing(false);
              showToast("Refreshed from server", "success");
            }}
            isDark={isDark}
            hideSearch={tab === "onboarding" || tab === "listings"}
          />

          {tab === "onboarding" && <AdminOnboardingPanel onToast={showToast} />}

          {tab !== "onboarding" && (
            <>
              <div className="mt-6 mb-6">
                <h1 className="font-ticket-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  Admin Dashboard
                </h1>
                <p className="font-ticket-body text-[13px] mt-1" style={{ color: "var(--ad-txt-soft)" }}>
                  Welcome back, {user?.email?.split("@")[0] || "Admin"}! Here's what's happening today.
                </p>
              </div>

              {/* 3 stat tiles — unchanged */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="ad-tile"
                  style={{ background: "var(--ad-cream)", color: "var(--ad-cream-txt)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-ticket-body text-[12px] font-bold uppercase tracking-widest opacity-70">Revenue</p>
                      <p className="font-ticket-display text-3xl font-black mt-1 leading-none tabular-nums">
                        {formatRs(stats.revenue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-7 w-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                            style={{ background: ["#fc9d03", "#c8631f", "#f59e0b"][i], borderColor: "var(--ad-cream)", color: "#1A1613" }}>
                            {["A", "M", "K"][i]}
                          </div>
                        ))}
                      </div>
                      <span className="h-7 min-w-[28px] px-2 rounded-full text-[10px] font-black flex items-center justify-center"
                        style={{ background: "#FFFFFF", color: "#1A1613" }}>
                        {stats.total}+
                      </span>
                    </div>
                  </div>
                  <MiniBarChart values={[30, 55, 40, 70, 90, 35, 50, 75, 45]} activeColor="#1A1613" idleColor="#fc9d03" highlightIndex={4} />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#1A1613", color: "#FFFFFF" }}>
                      ↗ {Math.min(99, Math.round((stats.delivered / Math.max(stats.total, 1)) * 100))}%
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="ad-tile"
                  style={{ background: "var(--ad-pink)", color: "var(--ad-pink-txt)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-ticket-body text-[12px] font-bold uppercase tracking-widest opacity-70">Pending Orders</p>
                      <p className="font-ticket-display text-3xl font-black mt-1 leading-none tabular-nums">{stats.pending}</p>
                    </div>
                    <span className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF", color: "#1A1613" }}>
                      <FaPlus className="text-xs" />
                    </span>
                  </div>
                  <MiniBarChart values={[55, 30, 45, 35, 65, 40, 80, 25, 45]} activeColor="#1A1613" idleColor="#E26A2C" highlightIndex={6} />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#1A1613", color: "#FFFFFF" }}>
                      ↗ {Math.min(99, Math.round((stats.inTransit / Math.max(stats.total, 1)) * 100))}%
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="ad-tile relative overflow-hidden"
                  style={{ background: "var(--ad-mint)", color: "var(--ad-mint-txt)" }}
                >
                  <div className="relative z-10">
                    <p className="font-ticket-body text-[12px] font-bold uppercase tracking-widest opacity-70">Important</p>
                    <p className="font-ticket-display text-2xl font-black mt-1 leading-tight">
                      {pendingListingsCount + pendingPaymentsCount > 0 ? "Needs Review" : "All clear"}
                    </p>
                    <p className="font-ticket-body text-[12px] mt-3 opacity-75 leading-relaxed">
                      {pendingListingsCount > 0 && (
                        <>
                          <strong>{pendingListingsCount}</strong> listing{pendingListingsCount !== 1 ? "s" : ""} awaiting approval.{" "}
                        </>
                      )}
                      {pendingPaymentsCount > 0 && (
                        <>
                          <strong>{pendingPaymentsCount}</strong> payment{pendingPaymentsCount !== 1 ? "s" : ""} pending.
                        </>
                      )}
                      {pendingListingsCount === 0 && pendingPaymentsCount === 0 && "Nothing pending right now."}
                    </p>
                    {pendingListingsCount > 0 && (
                      <button
                        onClick={() => goToSection("listings")}
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold"
                        style={{ background: "#0F2E1A", color: "#D9F0DD" }}
                      >
                        Review listings <FaChevronRight className="text-[9px]" />
                      </button>
                    )}
                  </div>
                  <svg className="absolute -right-4 -top-2 opacity-40 pointer-events-none" width="140" height="180" viewBox="0 0 140 180" fill="none">
                    <path d="M20 10 Q 80 60 40 120 T 120 170" stroke="#0F2E1A" strokeWidth="2" fill="none" />
                    <path d="M60 10 Q 100 90 60 140" stroke="#0F2E1A" strokeWidth="2" fill="none" />
                    <circle cx="118" cy="52" r="12" fill="#0F2E1A" />
                    <circle cx="46" cy="118" r="5" fill="#16A34A" />
                    <circle cx="122" cy="148" r="6" fill="#0F2E1A" />
                  </svg>
                </motion.div>
              </div>

              {/* ⭐ Tabs — now includes "Listings" */}
              <div className="ad-card rounded-2xl p-1.5 mb-5 flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "orders",   label: "Orders",   icon: FaClipboardCheck, badge: 0 },
                  { id: "listings", label: "Listings", icon: FaGavel,          badge: pendingListingsCount },
                  { id: "payments", label: "Payments", icon: FaReceipt,        badge: pendingPaymentsCount },
                    { id: "email",    label: "Send Email", icon: FaEnvelope,     badge: 0 },   // ⭐ NEW

                ].map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-ticket-body text-xs font-bold transition-all"
                      style={{ color: active ? "#0A0A12" : "var(--ad-txt-soft)" }}
                    >
                      {active && (
                        <motion.div
                          layoutId="admin-tab"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: "var(--ad-amber)" }}
                          transition={{ type: "spring", duration: 0.4 }}
                        />
                      )}
                      <Icon className="text-[11px] relative z-10" />
                      <span className="relative z-10">{t.label}</span>
                      {t.badge > 0 && (
                        <span
                          className="relative z-10 ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: active ? "rgba(10,10,18,0.15)" : "var(--ad-danger)",
                            color: active ? "#0A0A12" : "#fff",
                          }}
                        >
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB: ORDERS — unchanged */}
              {tab === "orders" && (
                <>
                  <div className="ad-card rounded-2xl p-4 mb-5">
                    <div className="flex flex-col lg:flex-row gap-3">
                      <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--ad-amber)" }} />
                        <input
                          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search by order ID, customer name, phone or item..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl font-ticket-body text-xs outline-none ad-input"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto ad-scroll">
                        {[
                          { id: "all", label: "All", icon: FaFilter, color: "#666" },
                          ...ORDER_STEPS.map((s) => {
                            const meta = getStepMeta(s.id);
                            return { id: s.id, label: s.label, icon: meta.icon, color: meta.color };
                          }),
                        ].map((f) => {
                          const Icon = f.icon;
                          const active = statusFilter === f.id;
                          return (
                            <button key={f.id} onClick={() => setStatusFilter(f.id)}
                              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-ticket-body text-[11px] font-bold transition-all"
                              style={active ? { background: f.color, color: "#fff" } : { border: "1px solid var(--ad-line)", color: "var(--ad-txt-soft)" }}>
                              <Icon className="text-[9px]" />
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="relative">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                          className="w-full lg:w-auto pl-3 pr-8 py-2.5 rounded-xl font-ticket-body text-xs font-bold outline-none appearance-none cursor-pointer ad-input">
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="highest">Highest total</option>
                          <option value="lowest">Lowest total</option>
                        </select>
                        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none" style={{ color: "var(--ad-txt-soft)" }} />
                      </div>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="ad-card rounded-[22px] py-16 px-6 text-center">
                      <FaClipboardCheck className="text-4xl mx-auto mb-4" style={{ color: "var(--ad-txt-faint)" }} />
                      <p className="font-ticket-display text-lg font-bold mb-1">
                        {orders.length === 0 ? "No orders yet" : "No matching orders"}
                      </p>
                      <p className="font-ticket-body text-xs mb-5" style={{ color: "var(--ad-txt-soft)" }}>
                        {orders.length === 0 ? "Orders will appear here as customers place them." : "Try a different search or filter."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <AdminOrderCard
                          key={order.id}
                          order={order}
                          isOpen={openOrderId === order.id}
                          onToggle={() => setOpenOrderId(openOrderId === order.id ? null : order.id)}
                          onStatusChange={(idx) => changeStatus(order.id, idx)}
                          onRemove={() => removeOrder(order.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ⭐⭐ TAB: LISTINGS (NEW) ⭐⭐ */}
              {tab === "listings" && (
                <>
                  {/* Filter bar */}
                  <div className="ad-card rounded-2xl p-4 mb-5">
                    <div className="flex flex-col lg:flex-row gap-3">
                      <div className="flex items-center gap-1.5 overflow-x-auto ad-scroll flex-1">
                        {[
                          { id: "pending",  label: "Pending Review", color: "#fc9d03", icon: FaClock },
                          { id: "active",   label: "Active",         color: "#16A34A", icon: FaCheckCircle },
                          { id: "rejected", label: "Rejected",       color: "#B23A2E", icon: FaBan },
                          { id: "all",      label: "All",            color: "#666",    icon: FaFilter },
                        ].map((f) => {
                          const Icon = f.icon;
                          const active = listingFilter === f.id;
                          const count =
                            f.id === "all"
                              ? pendingListings.length
                              : pendingListings.filter((l) => l.status === f.id).length;
                          return (
                            <button key={f.id} onClick={() => setListingFilter(f.id)}
                              className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-ticket-body text-[11px] font-bold transition-all"
                              style={active ? { background: f.color, color: "#fff" } : { border: "1px solid var(--ad-line)", color: "var(--ad-txt-soft)" }}>
                              <Icon className="text-[9px]" />
                              {f.label}
                              <span
                                className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold"
                                style={{
                                  background: active ? "rgba(255,255,255,0.25)" : "var(--ad-card-2)",
                                  color: active ? "#fff" : "var(--ad-txt-soft)",
                                }}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {listingFilter === "pending" && pendingListings.filter((l) => l.status === "pending").length > 0 && (
                        <button
                          onClick={handleBulkApprove}
                          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-ticket-body text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
                        >
                          <FaCheckDouble className="text-[10px]" />
                          Approve All ({pendingListings.filter((l) => l.status === "pending").length})
                        </button>
                      )}
                    </div>
                  </div>

                  {listingsLoading ? (
                    <div className="ad-card rounded-[22px] py-16 px-6 text-center">
                      <FaSpinner className="text-3xl mx-auto mb-3 animate-spin" style={{ color: "var(--ad-amber)" }} />
                      <p className="font-ticket-body text-xs" style={{ color: "var(--ad-txt-soft)" }}>
                        Loading listings…
                      </p>
                    </div>
                  ) : pendingListings.length === 0 ? (
                    <div className="ad-card rounded-[22px] py-16 px-6 text-center">
                      <div
                        className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "var(--ad-success-soft)", border: "1px solid var(--ad-success)" }}
                      >
                        <FaCheckCircle className="text-2xl" style={{ color: "var(--ad-success)" }} />
                      </div>
                      <p className="font-ticket-display text-lg font-bold mb-1">
                        {listingFilter === "pending" ? "All caught up! 🎉" : `No ${listingFilter} listings`}
                      </p>
                      <p className="font-ticket-body text-xs" style={{ color: "var(--ad-txt-soft)" }}>
                        {listingFilter === "pending"
                          ? "There are no listings waiting for review."
                          : "Nothing to show in this category."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingListings.map((listing) => (
                        <AdminListingCard
                          key={listing.id}
                          listing={listing}
                          isLoading={moderationBusy === listing.id}
                          onApprove={() => handleApproveListing(listing)}
                          onReject={() => {
                            setRejectModal(listing);
                            setRejectReason("");
                          }}
                          onDelete={() => handleDeleteListing(listing)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

{/* ⭐⭐ TAB: EMAIL (NEW) ⭐⭐ */}
{tab === "email" && (
  <>
{/* Helper to pick user */}
<div className="ad-card rounded-2xl p-4 mb-5">
  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ad-txt-soft)" }}>
      Registered users ({allUsers.length})
    </p>
    <span className="font-ticket-body text-[10px]" style={{ color: "var(--ad-txt-faint)" }}>
      Click any to autofill · or type manually below
    </span>
  </div>

  {/* Search box */}
  <div className="relative mb-3">
    <FaSearch
      className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px]"
      style={{ color: "var(--ad-txt-faint)" }}
    />
    <input
      type="text"
      value={userSearch}
      onChange={(e) => setUserSearch(e.target.value)}
      placeholder="Search by name or email..."
      className="w-full pl-9 pr-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
    />
  </div>

  {usersLoading ? (
    <div className="py-6 text-center">
      <FaSpinner className="text-xl animate-spin mx-auto" style={{ color: "var(--ad-amber)" }} />
      <p className="font-ticket-body text-[11px] mt-2" style={{ color: "var(--ad-txt-soft)" }}>
        Loading all registered users…
      </p>
    </div>
  ) : allUsers.length === 0 ? (
    <p className="font-ticket-body text-[12px]" style={{ color: "var(--ad-txt-soft)" }}>
      No users found. Type an email manually below.
    </p>
  ) : (
    <>
      <div className="flex flex-wrap gap-2 max-h-[260px] overflow-y-auto ad-scroll pr-1">
        {filteredUsers.map((u) => {
          const name = u.name || u.email?.split("@")[0] || "User";
          const active = emailTo === u.email;
          return (
            <button
              key={`${u.source}-${u.id}`}
              type="button"
              onClick={() => {
                setEmailTo(u.email || "");
                setEmailFirstName(name.split(" ")[0]);
              }}
              title={u.email}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-ticket-body text-[11px] font-bold transition-all"
              style={
                active
                  ? { background: "var(--ad-amber)", color: "#0A0A12" }
                  : { border: "1px solid var(--ad-line)", color: "var(--ad-txt-soft)" }
              }
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <span
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: "var(--ad-card-2)", color: "var(--ad-txt-soft)" }}
                >
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate max-w-[140px]">{name}</span>
            </button>
          );
        })}
        {filteredUsers.length === 0 && userSearch.trim() && (
          <p className="font-ticket-body text-[12px]" style={{ color: "var(--ad-txt-soft)" }}>
            No users match "{userSearch}".
          </p>
        )}
      </div>
      <p className="font-ticket-body text-[10px] mt-3" style={{ color: "var(--ad-txt-faint)" }}>
        Showing {filteredUsers.length} of {allUsers.length} users
      </p>
    </>
  )}
</div>
{/* ⭐ Logo Upload */}
<div>
  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ad-txt-soft)" }}>
    Brand Logo (optional)
  </label>

  <input
    ref={emailLogoFileRef}
    type="file"
    accept="image/*"
    onChange={handleLogoUpload}
    className="hidden"
  />

  {emailLogoUrl ? (
    <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}>
      <div
        className="rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ width: 100, height: 60, background: "#FFF", border: "1px solid var(--ad-line)" }}
      >
        <img
          src={emailLogoUrl}
          alt="Logo preview"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>
          Custom logo set
        </p>
        <p className="font-ticket-body text-[10px] mt-0.5 truncate" style={{ color: "var(--ad-txt-faint)" }}>
          {emailLogoUrl}
        </p>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => emailLogoFileRef.current?.click()}
            disabled={emailLogoUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold disabled:opacity-50"
            style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}
          >
            <FaUpload className="text-[9px]" />
            {emailLogoUploading ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            onClick={removeLogoImage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold"
            style={{ border: "1px solid var(--ad-danger)", color: "var(--ad-danger)" }}
          >
            <FaTrashAlt className="text-[9px]" />
            Remove
          </button>
        </div>
      </div>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => emailLogoFileRef.current?.click()}
      disabled={emailLogoUploading}
      className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl disabled:opacity-50"
      style={{ border: "2px dashed var(--ad-line-str)", background: "var(--ad-card-2)" }}
    >
      {emailLogoUploading ? (
        <FaSpinner className="text-lg animate-spin" style={{ color: "var(--ad-amber)" }} />
      ) : (
        <FaUpload className="text-lg" style={{ color: "var(--ad-txt-soft)" }} />
      )}
      <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>
        {emailLogoUploading ? "Uploading…" : "Upload brand logo"}
      </span>
      <span className="font-ticket-body text-[10px]" style={{ color: "var(--ad-txt-soft)" }}>
        PNG with transparent background · max 2MB
      </span>
    </button>
  )}
</div>
    {/* Email composer */}
{/* Email composer */}
<div className="ad-card rounded-2xl p-4 sm:p-5 mb-5 space-y-4">

  {/* ⭐ Hero Image Upload */}
  <div>
    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ad-txt-soft)" }}>
      Email Hero Image (optional)
    </label>

    <input
      ref={emailHeroFileRef}
      type="file"
      accept="image/*"
      onChange={handleHeroUpload}
      className="hidden"
    />

    {emailHeroUrl ? (
      <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}>
        <div
          className="rounded-lg overflow-hidden flex-shrink-0"
          style={{ width: 120, height: 80, background: "#000", border: "1px solid var(--ad-line)" }}
        >
          <img
            src={emailHeroUrl}
            alt="Hero preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>
            Custom hero image set
          </p>
          <p className="font-ticket-body text-[10px] mt-0.5 truncate" style={{ color: "var(--ad-txt-faint)" }}>
            {emailHeroUrl}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => emailHeroFileRef.current?.click()}
              disabled={emailHeroUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold disabled:opacity-50"
              style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}
            >
              <FaUpload className="text-[9px]" />
              {emailHeroUploading ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={removeHeroImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold"
              style={{ border: "1px solid var(--ad-danger)", color: "var(--ad-danger)" }}
            >
              <FaTrashAlt className="text-[9px]" />
              Remove
            </button>
          </div>
        </div>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => emailHeroFileRef.current?.click()}
        disabled={emailHeroUploading}
        className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl disabled:opacity-50"
        style={{ border: "2px dashed var(--ad-line-str)", background: "var(--ad-card-2)" }}
      >
        {emailHeroUploading ? (
          <FaSpinner className="text-xl animate-spin" style={{ color: "var(--ad-amber)" }} />
        ) : (
          <FaUpload className="text-xl" style={{ color: "var(--ad-txt-soft)" }} />
        )}
        <span className="font-ticket-body text-xs font-bold" style={{ color: "var(--ad-txt)" }}>
          {emailHeroUploading ? "Uploading…" : "Upload hero image"}
        </span>
        <span className="font-ticket-body text-[10px]" style={{ color: "var(--ad-txt-soft)" }}>
          JPG, PNG, WEBP · max 5MB · uses default if empty
        </span>
      </button>
    )}
  </div>

      {/* Template picker */}
      <div>
        <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ad-txt-soft)" }}>
          Template
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "welcome",       label: "Welcome" },
            { id: "registration",  label: "Verify email" },
            { id: "passwordReset", label: "Password reset" },
            { id: "custom",        label: "Custom" },
          ].map((tpl) => {
            const active = emailTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setEmailTemplate(tpl.id)}
                className="px-3.5 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-all"
                style={
                  active
                    ? { background: "var(--ad-amber)", color: "#0A0A12" }
                    : { border: "1px solid var(--ad-line)", color: "var(--ad-txt-soft)" }
                }
              >
                {tpl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient + first name */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-ticket-body text-[11px] font-bold mb-1.5">
            Recipient email <span style={{ color: "var(--ad-danger)" }}>*</span>
          </label>
          <input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
          />
        </div>
        <div>
          <label className="block font-ticket-body text-[11px] font-bold mb-1.5">
            First name
          </label>
          <input
            type="text"
            value={emailFirstName}
            onChange={(e) => setEmailFirstName(e.target.value)}
            placeholder="Hasnain"
            className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
          />
        </div>
      </div>

      {/* Custom fields (only show for custom) */}
      {emailTemplate === "custom" && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Message from APNa Deal"
                className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
              />
            </div>
            <div>
              <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Heading</label>
              <input
                type="text"
                value={emailHeading}
                onChange={(e) => setEmailHeading(e.target.value)}
                placeholder="A message from APNa Deal"
                className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Subtitle</label>
            <input
              type="text"
              value={emailSubtitle}
              onChange={(e) => setEmailSubtitle(e.target.value)}
              placeholder="Optional subtitle"
              className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
            />
          </div>

          <div>
            <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Body</label>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Type your message here…"
              className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none resize-none ad-input"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-ticket-body text-[11px] font-bold mb-1.5">CTA label (optional)</label>
              <input
                type="text"
                value={emailCtaLabel}
                onChange={(e) => setEmailCtaLabel(e.target.value)}
                placeholder="Visit marketplace"
                className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
              />
            </div>
            <div>
              <label className="block font-ticket-body text-[11px] font-bold mb-1.5">CTA URL (optional)</label>
              <input
                type="text"
                value={emailCtaUrl}
                onChange={(e) => setEmailCtaUrl(e.target.value)}
                placeholder="https://apnadeal-70b37.web.app/feed"
                className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input"
              />
            </div>
          </div>
        </>
      )}

      {/* Send button */}
      <div className="flex items-center justify-between gap-3 pt-4" style={{ borderTop: "1px solid var(--ad-line)" }}>
        <p className="font-ticket-body text-[10px]" style={{ color: "var(--ad-txt-soft)" }}>
Sent via EmailJS · APNa Deal
        </p>

        <button
          type="button"
          disabled={sendingEmail || !emailTo.trim()}
          onClick={async () => {
            if (!emailTo.trim()) {
              showToast("Enter recipient email", "error");
              return;
            }
            setSendingEmail(true);
            try {
await sendAdminEmail({
  to: emailTo.trim(),
  template: emailTemplate,
  firstName: emailFirstName || "there",
  subject: emailSubject,
  heading: emailHeading,
  subtitle: emailSubtitle,
  body: emailBody,
  ctaLabel: emailCtaLabel,
  ctaUrl: emailCtaUrl,
  heroImage: emailHeroUrl || undefined,
  logoImage: emailLogoUrl || undefined,     // ⭐ ADD THIS
});
              showToast(`Email sent to ${emailTo}`, "success");
            } catch (err) {
              console.error("[Admin] Send email failed:", err);
              showToast(`Failed: ${err.message}`, "error");
            } finally {
              setSendingEmail(false);
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-ticket-body text-xs font-bold text-white transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--ad-amber) 0%, var(--ad-amber-3) 100%)" }}
        >
          {sendingEmail ? (
            <><FaSpinner className="animate-spin text-[11px]" /> Sending…</>
          ) : (
            <><FaPaperPlane className="text-[11px]" /> Send Email</>
          )}
        </button>
      </div>
    </div>
  </>
)}

              {/* TAB: PAYMENTS — unchanged */}
              {tab === "payments" && (
                <>
                  <div className="ad-card rounded-2xl p-4 mb-5">
                    <div className="flex items-center gap-1.5 overflow-x-auto ad-scroll">
                      {[
                        { id: "pending",  label: "Pending",  color: "#fc9d03" },
                        { id: "approved", label: "Approved", color: "#16A34A" },
                        { id: "rejected", label: "Rejected", color: "#B23A2E" },
                        { id: "all",      label: "All",      color: "#666" },
                      ].map((f) => {
                        const active = paymentFilter === f.id;
                        const count = f.id === "all" ? payments.length : payments.filter((p) => p.status === f.id).length;
                        return (
                          <button key={f.id} onClick={() => setPaymentFilter(f.id)}
                            className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-ticket-body text-[11px] font-bold transition-all"
                            style={active ? { background: f.color, color: "#fff" } : { border: "1px solid var(--ad-line)", color: "var(--ad-txt-soft)" }}>
                            {f.label}
                            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold"
                              style={{ background: active ? "rgba(255,255,255,0.25)" : "var(--ad-card-2)", color: active ? "#fff" : "var(--ad-txt-soft)" }}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {paymentsLoading ? (
                    <div className="ad-card rounded-[22px] py-16 px-6 text-center">
                      <FaSpinner className="text-3xl mx-auto mb-3 animate-spin" style={{ color: "var(--ad-amber)" }} />
                      <p className="font-ticket-body text-xs" style={{ color: "var(--ad-txt-soft)" }}>Loading payments…</p>
                    </div>
                  ) : filteredPayments.length === 0 ? (
                    <div className="ad-card rounded-[22px] py-16 px-6 text-center">
                      <FaReceipt className="text-4xl mx-auto mb-4" style={{ color: "var(--ad-txt-faint)" }} />
                      <p className="font-ticket-display text-lg font-bold mb-1">
                        No {paymentFilter !== "all" ? paymentFilter : ""} payments
                      </p>
                      <p className="font-ticket-body text-xs" style={{ color: "var(--ad-txt-soft)" }}>
                        Receipts submitted at checkout will appear here for approval.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPayments.map((p) => (
                        <AdminPaymentCard
                          key={p.id}
                          payment={p}
                          isLoading={actionLoadingId === p.id}
                          onApprove={() => handleApprovePayment(p)}
                          onReject={() => handleRejectPayment(p)}
                          onDelete={() => handleDeletePayment(p)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div className="h-8" />
        </main>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl font-ticket-body text-xs font-bold text-white max-w-[90vw]"
            style={{ background: toast.type === "error" ? "var(--ad-danger)" : "var(--ad-success)" }}
          >
            {toast.type === "error" ? <FaExclamationTriangle className="text-[11px] shrink-0" /> : <FaCheck className="text-[11px] shrink-0" />}
            <span className="truncate">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={() => !moderationBusy && setRejectModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="ad-card rounded-[26px] p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--ad-danger-soft)", color: "var(--ad-danger)" }}>
                  <FaBan className="text-base" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-ticket-display text-lg font-bold">Reject Listing</h3>
                  <p className="font-ticket-body text-[11px] mt-0.5" style={{ color: "var(--ad-txt-soft)" }}>
                    "{rejectModal.title}"
                  </p>
                </div>
              </div>

              <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ad-txt-soft)" }}>
                Reason (seller will see this)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                autoFocus
                placeholder="e.g., Photos are too blurry. Please re-upload clear photos."
                className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none resize-none ad-input mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  disabled={!!moderationBusy}
                  className="flex-1 py-3 rounded-xl font-ticket-body text-xs font-bold transition-colors disabled:opacity-50"
                  style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectListing}
                  disabled={!!moderationBusy || !rejectReason.trim()}
                  className="flex-1 py-3 rounded-xl text-white font-ticket-body text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--ad-danger)" }}
                >
                  {moderationBusy ? <><FaSpinner className="animate-spin text-[10px]" /> Rejecting…</> : <><FaBan className="text-[10px]" /> Reject Listing</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR — updated with Listings count
   ═══════════════════════════════════════════════════════════════ */
const Sidebar = ({ tab, onTabChange, onSignOut, pendingCount, listingsCount, ordersCount, user, onClose }) => {
  const email = user?.email || "admin@apnadeal.com";
  const name = email.split("@")[0];

  const navItems = [
    { id: "orders",     label: "Orders",     icon: FaThLarge,  count: ordersCount },
    { id: "listings",   label: "Listings",   icon: FaGavel,    count: listingsCount, alert: true },
      { id: "email",      label: "Send Email", icon: FaEnvelope,  count: 0 },   // ⭐ NEW
    { id: "payments",   label: "Payments",   icon: FaListAlt,  count: pendingCount, alert: true },
    { id: "onboarding", label: "Onboarding", icon: FaFileAlt,  count: 0 },
  ];

  const secondaryNav = [
    { label: "Properties", icon: FaHome },
    { label: "Tenants",    icon: FaUsers },
    { label: "Chat",       icon: FaHeadset },
    { label: "Settings",   icon: FaCog },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--ad-amber) 0%, var(--ad-amber-3) 100%)", boxShadow: "0 8px 22px -8px var(--ad-amber-glow)" }}>
          <FaCrown className="text-[13px]" style={{ color: "#0A0A12" }} />
        </div>
        <span className="font-ticket-display text-lg font-black tracking-tight">
          APNa<span style={{ color: "var(--ad-amber)" }}>Deal</span>
        </span>
        {onClose && (
          <button onClick={onClose}
            className="lg:hidden ml-auto h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}
            aria-label="Close menu">
            <FaTimes className="text-[11px]" />
          </button>
        )}
      </div>

      <nav className="px-3 pb-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => onTabChange(item.id)}
              className={`ad-nav-item ${active ? "active" : ""}`}>
              <Icon className="text-[14px]" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[22px] px-1.5 rounded-full text-[10px] font-black"
                  style={{
                    background: item.alert ? "var(--ad-amber)" : active ? "rgba(255,255,255,0.2)" : "var(--ad-line-str)",
                    color: item.alert ? "#0A0A12" : active ? "inherit" : "var(--ad-txt-soft)",
                  }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3" style={{ borderTop: "1px solid var(--ad-line)" }}>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="ad-nav-item"
                style={{ opacity: 0.55, cursor: "not-allowed" }}
                type="button" disabled>
                <Icon className="text-[14px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto p-4" style={{ borderTop: "1px solid var(--ad-line)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-11 w-11 rounded-full flex items-center justify-center font-black text-base"
            style={{ background: "linear-gradient(135deg, var(--ad-amber) 0%, var(--ad-amber-3) 100%)", color: "#0A0A12" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-ticket-body text-[13px] font-bold truncate" style={{ color: "var(--ad-txt)" }}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </p>
            <p className="font-ticket-body text-[11px] truncate" style={{ color: "var(--ad-txt-soft)" }}>
              {email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onTabChange("onboarding")}
            className="flex-1 h-9 rounded-xl flex items-center justify-center"
            style={{ border: "1px solid var(--ad-line)" }}
            title="Onboarding">
            <FaFileAlt className="text-[11px]" style={{ color: "var(--ad-txt-soft)" }} />
          </button>
          <button onClick={onSignOut}
            className="flex-1 h-9 rounded-xl flex items-center justify-center"
            style={{ border: "1px solid var(--ad-line)" }}
            title="Sign out">
            <FaArrowLeft className="text-[11px] rotate-180" style={{ color: "var(--ad-txt-soft)" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ TOP BAR (unchanged) ═══ */
const TopBar = ({ onMenuClick, onBack, search, setSearch, syncing, onSync, isDark, hideSearch }) => {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onMenuClick}
        className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}>
        <FaBars className="text-[13px]" />
      </button>

      <button onClick={onBack}
        className="hidden lg:flex h-10 w-10 rounded-xl items-center justify-center transition-colors"
        style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ad-amber)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ad-line)"; }}>
        <FaArrowLeft className="text-[12px]" />
      </button>

      <div className="flex-1" />

      {!hideSearch && (
        <div className="relative hidden sm:block w-[220px] lg:w-[280px]">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "var(--ad-txt-faint)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl font-ticket-body text-xs outline-none ad-input" />
        </div>
      )}

      <button onClick={onSync}
        className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
        style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}
        title="Refresh from server"
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ad-amber)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ad-line)"; }}>
        <FaSync className={`text-[12px] ${syncing ? "animate-spin" : ""}`} />
      </button>

      <button className="relative h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}>
        <FaBell className="text-[13px]" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
          style={{ background: "#EF4444", border: "2px solid var(--ad-shell)" }} />
      </button>
    </div>
  );
};

/* ═══ MINI BAR CHART (unchanged) ═══ */
const MiniBarChart = ({ values = [], activeColor = "#1A1613", idleColor = "#fc9d03", highlightIndex = 0 }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5 h-12 mt-2">
      {values.map((v, i) => {
        const h = Math.max(8, Math.round((v / max) * 100));
        const isHighlight = i === highlightIndex;
        return (
          <div key={i} className="flex-1 h-full flex items-end">
            <div className="ad-bar" style={{
              height: `${h}%`,
              background: isHighlight ? activeColor : idleColor,
              opacity: isHighlight ? 1 : 0.75,
            }} />
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ NEW — LISTING CARD for moderation
   ═══════════════════════════════════════════════════════════════ */
const AdminListingCard = ({ listing, isLoading, onApprove, onReject, onDelete }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const statusMeta =
    listing.status === "approved" || listing.status === "active"
      ? { color: "#16A34A", bg: "rgba(22,163,74,0.12)", label: "Active" }
      : listing.status === "rejected"
        ? { color: "#B23A2E", bg: "rgba(178,58,46,0.12)", label: "Rejected" }
        : { color: "#fc9d03", bg: "rgba(252,157,3,0.12)", label: "Pending Review" };

  const seller = listing.seller || {};
  const sellerName =
    seller.full_name ||
    seller.name ||
    seller.username ||
    (seller.email ? seller.email.split("@")[0] : null) ||
    "Unknown Seller";

  const images = Array.isArray(listing.images) ? listing.images : [];
  const coverImage = listing.cover_image || images[0];

  const specs = listing.specs || {};
  const specsToShow = Object.entries(specs)
    .filter(([_, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
    .slice(0, 6);

  return (
    <>
      <motion.div
        layout
        className="ad-card rounded-[22px] p-4 sm:p-5 relative"
        style={{
          borderWidth: "2px",
          borderColor: `${statusMeta.color}55`,
          opacity: isLoading ? 0.7 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 rounded-[22px] flex items-center justify-center backdrop-blur-[2px]"
              style={{ background: "rgba(0,0,0,0.35)" }}>
              <div className="flex flex-col items-center gap-2">
                <FaSpinner className="text-2xl animate-spin" style={{ color: "var(--ad-amber)" }} />
                <span className="font-ticket-body text-[11px] font-bold text-white">Processing…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: statusMeta.bg, color: statusMeta.color }}>
            {listing.status === "pending" ? <FaClock className="text-base" /> :
              listing.status === "rejected" ? <FaBan className="text-base" /> :
                <FaCheckCircle className="text-base" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-ticket-display text-sm sm:text-base font-bold truncate">
                {listing.title || "Untitled"}
              </p>
              <span className="font-ticket-body text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: statusMeta.bg, color: statusMeta.color }}>
                {statusMeta.label}
              </span>
            </div>
            <p className="font-ticket-body text-[11px] mt-1" style={{ color: "var(--ad-txt-soft)" }}>
              <FaUser className="inline text-[8px] mr-1" />
              {sellerName}
              {listing.category && <> · <FaTag className="inline text-[8px] mx-1" /> {listing.category}</>}
              {listing.city && <> · <FaMapMarkerAlt className="inline text-[8px] mx-1" /> {listing.city}{listing.area ? `, ${listing.area}` : ""}</>}
            </p>
          </div>
          <p className="font-ticket-body text-[10px] shrink-0" style={{ color: "var(--ad-txt-faint)" }}>
            {listing.created_at ? formatDateTime(listing.created_at) : ""}
          </p>
        </div>

        {/* Main layout: images + details */}
        <div className="grid sm:grid-cols-[200px_1fr] gap-4 mb-4">
          {/* Images */}
          <div>
            {images.length > 0 ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setLightboxOpen(true); setLightboxIndex(0); }}
                  className="w-full aspect-square rounded-xl overflow-hidden relative group"
                  style={{ border: "1px solid var(--ad-line)", background: "#000" }}>
                  <img src={coverImage} alt={listing.title} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.4)" }}>
                    <FaEye className="text-white text-lg" />
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                    {images.length} photo{images.length > 1 ? "s" : ""}
                  </span>
                </button>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1.5">
                    {images.slice(0, 4).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setLightboxOpen(true); setLightboxIndex(i); }}
                        className="aspect-square rounded-lg overflow-hidden"
                        style={{ border: "1px solid var(--ad-line)" }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-xl flex items-center justify-center"
                style={{ border: "1px dashed var(--ad-line-str)", background: "var(--ad-card-2)" }}>
                <FaImage className="text-2xl" style={{ color: "var(--ad-txt-faint)" }} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 space-y-3">
            {/* Price */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-ticket-display text-xl font-black" style={{ color: "var(--ad-amber)" }}>
                {formatRs(listing.price)}
              </span>
              {listing.condition && (
                <span className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--ad-card-2)", color: "var(--ad-txt-soft)", border: "1px solid var(--ad-line)" }}>
                  {listing.condition}
                </span>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--ad-txt-soft)" }}>
                  Description
                </p>
                <p className="font-ticket-body text-xs leading-relaxed line-clamp-3 whitespace-pre-wrap" style={{ color: "var(--ad-txt)" }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Specs */}
            {specsToShow.length > 0 && (
              <div>
                <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--ad-txt-soft)" }}>
                  Specifications
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {specsToShow.map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                    const displayVal = Array.isArray(value) ? value.join(", ") : String(value);
                    return (
                      <div key={key} className="rounded-lg px-2.5 py-1.5"
                        style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}>
                        <p className="font-ticket-body text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--ad-txt-soft)" }}>
                          {label}
                        </p>
                        <p className="font-ticket-body text-[11px] font-bold truncate" style={{ color: "var(--ad-txt)" }}>
                          {displayVal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact */}
            {listing.contact_number && (
              <div className="rounded-lg px-3 py-2 flex items-center justify-between"
                style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}>
                <span className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ad-txt-soft)" }}>
                  Contact
                </span>
                <span className="font-ticket-body text-xs font-bold font-mono" style={{ color: "var(--ad-txt)" }}>
                  {listing.contact_number}
                </span>
              </div>
            )}

            {/* Rejection reason if rejected */}
            {listing.status === "rejected" && listing.moderation_notes && (
              <div className="rounded-lg px-3 py-2"
                style={{ background: "var(--ad-danger-soft)", border: "1px solid var(--ad-danger)" }}>
                <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--ad-danger)" }}>
                  Rejection Reason
                </p>
                <p className="font-ticket-body text-[11px]" style={{ color: "var(--ad-txt)" }}>
                  {listing.moderation_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: "1px solid var(--ad-line)" }}>
          {listing.status === "pending" && (
            <>
              <button
                onClick={onApprove}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-xs font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-60 min-w-[140px]"
                style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}>
                <FaCheckDouble className="text-[12px]" />
                Approve & Publish
              </button>
              <button
                onClick={onReject}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-xs font-bold transition-colors disabled:opacity-60 min-w-[120px]"
                style={{ background: "transparent", border: "1px solid var(--ad-danger)", color: "var(--ad-danger)" }}>
                <FaBan className="text-[11px]" />
                Reject
              </button>
            </>
          )}

          {listing.status === "active" && (
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-xs font-bold transition-colors disabled:opacity-60"
              style={{ background: "transparent", border: "1px solid var(--ad-danger)", color: "var(--ad-danger)" }}>
              <FaBan className="text-[11px]" />
              Take Down
            </button>
          )}

          {listing.status === "rejected" && (
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-xs font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}>
              <FaUndo className="text-[11px]" />
              Restore & Publish
            </button>
          )}

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-ticket-body text-xs font-bold disabled:opacity-60"
              style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt-soft)" }}>
              <FaTrashAlt className="text-[11px]" />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ border: "1px solid var(--ad-danger)" }}>
              <FaExclamationTriangle className="text-[11px] shrink-0" style={{ color: "var(--ad-danger)" }} />
              <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>
                Delete?
              </span>
              <button onClick={onDelete} disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-white font-ticket-body text-[10px] font-bold"
                style={{ background: "var(--ad-danger)" }}>
                Yes
              </button>
              <button onClick={() => setConfirmingDelete(false)}
                className="px-2.5 py-1 rounded-lg font-ticket-body text-[10px] font-bold"
                style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt)" }}>
                No
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 z-[10000] flex flex-col items-center justify-center pointer-events-none">
              <img
                src={images[lightboxIndex]}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-2xl pointer-events-auto"
              />
              {images.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-auto">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === lightboxIndex ? 24 : 6,
                        background: i === lightboxIndex ? "#fc9d03" : "rgba(255,255,255,0.25)",
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
                <a href={images[lightboxIndex]} download
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                  title="Download">
                  <FaDownload className="text-sm" />
                </a>
                <button onClick={() => setLightboxOpen(false)}
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                  title="Close">
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══ Admin Onboarding Panel + AdminPaymentCard + AdminOrderCard — UNCHANGED ═══
   (paste your existing code here — I didn't touch them)
   The three components below are exactly the same as your original file.
   ═══ */

const AdminOnboardingPanel = ({ onToast }) => {
  const { user } = useAuth();
  const { config, refresh, openManually } = useOnboarding();
  const fileRef = React.useRef(null);

  const [form, setForm] = useState(config || {});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (config) setForm(config); }, [config]);

  const showToast = (msg, type = "success") => { if (onToast) onToast(msg, type); };
  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateSection = (i, key, value) => setForm((f) => {
    const next = [...(f.sections || [])];
    next[i] = { ...next[i], [key]: value };
    return { ...f, sections: next };
  });
  const addSection = () => setForm((f) => ({ ...f, sections: [...(f.sections || []), { heading: "New section", body: "" }] }));
  const removeSection = (i) => setForm((f) => ({ ...f, sections: (f.sections || []).filter((_, idx) => idx !== i) }));
  const resetSections = () => setForm((f) => ({ ...f, sections: DEFAULT_SECTIONS }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please choose an image file", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("Max 5MB", "error"); return; }
    setUploading(true);
    try {
      const url = await uploadOnboardingImage(file);
      updateField("image_url", url);
      showToast("Image uploaded", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveOnboardingConfig({
        enabled: !!form.enabled,
        mode: form.mode || "text",
        title: form.title || "",
        subtitle: form.subtitle || "",
        sections: form.sections || [],
        image_url: form.image_url || null,
        cta_label: form.cta_label || "I Understand",
        auto_show_delay: Math.max(0, Number(form.auto_show_delay) || 3000),
        version: Number(form.version) || 1,
      }, user?.id);
      await refresh();
      showToast("Saved successfully", "success");
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const handleBumpVersion = async () => {
    const nextVersion = (Number(form.version) || 1) + 1;
    updateField("version", nextVersion);
    try {
      await saveOnboardingConfig({
        enabled: !!form.enabled, mode: form.mode || "text",
        title: form.title || "", subtitle: form.subtitle || "",
        sections: form.sections || [], image_url: form.image_url || null,
        cta_label: form.cta_label || "I Understand",
        auto_show_delay: Math.max(0, Number(form.auto_show_delay) || 3000),
        version: nextVersion,
      }, user?.id);
      await refresh();
      showToast(`Version bumped to v${nextVersion}`, "success");
    } catch (err) {
      showToast(err.message || "Failed", "error");
    }
  };

  return (
    <>
      <div className="mt-6 mb-6 flex items-center gap-3 flex-wrap">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--ad-amber) 0%, var(--ad-amber-3) 100%)", boxShadow: "0 10px 26px -12px var(--ad-amber-glow)" }}>
          <FaFileAlt className="text-[14px]" style={{ color: "#0A0A12" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-ticket-display text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Onboarding Instructions
          </h1>
          <p className="font-ticket-body text-[12px] mt-0.5" style={{ color: "var(--ad-txt-soft)" }}>
            Show a policy page to every user · Edit text · Replace with image
          </p>
        </div>
        <button onClick={openManually}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-ticket-body text-[11px] font-bold transition-all"
          style={{ background: "var(--ad-amber-soft)", border: "1px solid var(--ad-amber)", color: "var(--ad-amber)" }}>
          <FaEye className="text-[10px]" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      <div className="ad-card rounded-2xl p-4 sm:p-5 mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => updateField("enabled", !form.enabled)}
            className="shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-colors"
            style={form.enabled ? { background: "var(--ad-success)", color: "#fff" } : { background: "var(--ad-card-2)", color: "var(--ad-txt-soft)" }}>
            {form.enabled ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
          </button>
          <div className="min-w-0">
            <p className="font-ticket-display text-sm sm:text-base font-bold">
              {form.enabled ? "Enabled — showing to all users" : "Disabled"}
            </p>
            <p className="font-ticket-body text-[11px]" style={{ color: "var(--ad-txt-soft)" }}>
              {form.enabled
                ? `Shows ${Math.round((form.auto_show_delay || 3000) / 1000)}s after page loads · v${form.version || 1}`
                : "Turn on to show the instruction page to every user."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleBumpVersion}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
            style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}>
            <FaSync className="text-[9px]" />
            Force re-show
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-all disabled:opacity-60"
            style={{ background: "var(--ad-amber)", color: "#0A0A12" }}>
            {saving ? <FaSpinner className="text-[10px] animate-spin" /> : <FaSave className="text-[10px]" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="ad-card rounded-2xl p-4 sm:p-5 mb-4">
        <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--ad-txt-soft)" }}>
          Content Mode
        </p>
        <div className="inline-flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--ad-card-2)" }}>
          {[
            { id: "text", label: "Text", icon: FaFileAlt },
            { id: "image", label: "Image", icon: FaImage },
          ].map((m) => {
            const Icon = m.icon;
            const active = (form.mode || "text") === m.id;
            return (
              <button key={m.id} onClick={() => updateField("mode", m.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-ticket-body text-[11px] font-bold transition-all"
                style={active ? { background: "var(--ad-amber)", color: "#0A0A12" } : { color: "var(--ad-txt-soft)" }}>
                <Icon className="text-[10px]" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ad-card rounded-2xl p-4 sm:p-5 mb-4 space-y-4">
        <div>
          <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Title</label>
          <input type="text" value={form.title || ""} onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input" />
        </div>
        <div>
          <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Subtitle</label>
          <textarea value={form.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} rows="2"
            className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none resize-none ad-input" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-ticket-body text-[11px] font-bold mb-1.5">CTA Button Label</label>
            <input type="text" value={form.cta_label || ""} onChange={(e) => updateField("cta_label", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input" />
          </div>
          <div>
            <label className="block font-ticket-body text-[11px] font-bold mb-1.5">Auto-show delay (ms)</label>
            <input type="number" min="0" step="500" value={form.auto_show_delay || 3000}
              onChange={(e) => updateField("auto_show_delay", Number(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl font-ticket-body text-sm outline-none ad-input" />
          </div>
        </div>
      </div>

      {form.mode === "image" && (
        <div className="ad-card rounded-2xl p-4 sm:p-5 mb-4">
          <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--ad-txt-soft)" }}>
            Onboarding Image
          </p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          {form.image_url ? (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--ad-line)" }}>
                <img src={form.image_url} alt="Onboarding" className="w-full h-auto block" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[11px] font-bold"
                  style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}>
                  <FaUpload className="text-[9px]" />
                  {uploading ? "Uploading…" : "Replace image"}
                </button>
                <button onClick={() => updateField("image_url", null)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[11px] font-bold"
                  style={{ border: "1px solid var(--ad-danger)", color: "var(--ad-danger)" }}>
                  <FaTrashAlt className="text-[9px]" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-2xl disabled:opacity-50"
              style={{ border: "2px dashed var(--ad-line-str)" }}>
              {uploading ? <FaSpinner className="text-2xl animate-spin" style={{ color: "var(--ad-amber)" }} /> :
                <FaUpload className="text-2xl" style={{ color: "var(--ad-txt-soft)" }} />}
              <span className="font-ticket-body text-sm font-bold">
                {uploading ? "Uploading…" : "Click to upload image"}
              </span>
              <span className="font-ticket-body text-[10px]" style={{ color: "var(--ad-txt-soft)" }}>
                JPG, PNG, WEBP — max 5MB
              </span>
            </button>
          )}
        </div>
      )}

      {form.mode === "text" && (
        <div className="ad-card rounded-2xl p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--ad-txt-soft)" }}>
              Sections ({(form.sections || []).length})
            </p>
            <div className="flex items-center gap-2">
              <button onClick={resetSections}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold"
                style={{ border: "1px solid var(--ad-line)", color: "var(--ad-txt)" }}>
                <FaSync className="text-[9px]" /> Reset
              </button>
              <button onClick={addSection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold"
                style={{ background: "var(--ad-amber)", color: "#0A0A12" }}>
                <FaPlus className="text-[9px]" /> Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(form.sections || []).map((s, i) => (
              <div key={i} className="rounded-2xl p-3.5" style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1 h-7 w-7 rounded-lg flex items-center justify-center font-ticket-body text-[11px] font-bold"
                    style={{ background: "var(--ad-amber-soft)", color: "var(--ad-amber)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-2">
                    <input type="text" value={s.heading || ""} onChange={(e) => updateSection(i, "heading", e.target.value)}
                      placeholder="Section heading"
                      className="w-full px-3 py-2 rounded-lg font-ticket-body text-[12.5px] font-bold outline-none ad-input" />
                    <textarea value={s.body || ""} onChange={(e) => updateSection(i, "body", e.target.value)}
                      placeholder="Section body text…" rows="2"
                      className="w-full px-3 py-2 rounded-lg font-ticket-body text-[12.5px] outline-none resize-none ad-input" />
                  </div>
                  <button onClick={() => removeSection(i)}
                    className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ color: "var(--ad-danger)" }}>
                    <FaTrashAlt className="text-[11px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const AdminPaymentCard = ({ payment, isLoading, onApprove, onReject, onDelete }) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const statusMeta =
    payment.status === "approved"
      ? { color: "#16A34A", bg: "rgba(22,163,74,0.12)", label: "Approved" }
      : payment.status === "rejected"
        ? { color: "#B23A2E", bg: "rgba(178,58,46,0.12)", label: "Rejected" }
        : { color: "#fc9d03", bg: "rgba(252,157,3,0.12)", label: "Pending" };

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(payment.activation_code || "");
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {}
  };

  /* ⭐ Debug — remove after fixing */
  if (process.env.NODE_ENV !== "production") {
    console.log("[AdminPaymentCard] render:", payment?.id, payment?.status, payment?.pack_name);
  }

  return (
    <>
      <motion.div
        layout
        className="ad-card rounded-[22px] p-4 sm:p-5 relative"
        style={{
          borderWidth: "2px",
          borderColor: `${statusMeta.color}55`,
          opacity: isLoading ? 0.7 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 rounded-[22px] flex items-center justify-center backdrop-blur-[2px]"
              style={{ background: "rgba(0,0,0,0.35)" }}
            >
              <div className="flex flex-col items-center gap-2">
                <FaSpinner className="text-2xl animate-spin" style={{ color: "var(--ad-amber)" }} />
                <span className="font-ticket-body text-[11px] font-bold text-white">Processing…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: statusMeta.bg, color: statusMeta.color }}
          >
            <FaReceipt className="text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-ticket-display text-sm sm:text-base font-bold">
                {payment.pack_name || "Manual Payment"}
              </p>
              <span
                className="font-ticket-body text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: statusMeta.bg, color: statusMeta.color }}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="font-ticket-body text-[11px] mt-1" style={{ color: "var(--ad-txt-soft)" }}>
              <FaUser className="inline text-[8px] mr-1" />
              {payment.user_name || "Unknown"} · {payment.user_email || "—"}
            </p>
          </div>
          <p className="font-ticket-body text-[10px] shrink-0" style={{ color: "var(--ad-txt-faint)" }}>
            {payment.created_at ? formatDateTime(payment.created_at) : ""}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Credits",     value: payment.pack_credits ? payment.pack_credits.toLocaleString() : "—", color: "var(--ad-txt)" },
            { label: "Amount Paid", value: formatRs(payment.final_amount_pkr), color: "var(--ad-amber)" },
            { label: "Method",      value: payment.method || "—", color: "var(--ad-txt)" },
            { label: "Promo",       value: payment.promo_code || "—", color: payment.promo_code ? "#16A34A" : "var(--ad-txt-faint)" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl p-3" style={{ border: "1px solid var(--ad-line)" }}>
              <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--ad-txt-soft)" }}>
                {row.label}
              </p>
              <p className="font-ticket-display text-sm font-bold capitalize truncate" style={{ color: row.color }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {/* Activation code */}
        {payment.activation_code && (
          <div className="rounded-xl p-3 mb-4 flex items-center justify-between gap-3" style={{ border: "1px solid var(--ad-line)" }}>
            <div className="min-w-0">
              <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--ad-txt-soft)" }}>
                Activation Code
              </p>
              <p className="font-ticket-display text-sm font-bold font-mono tracking-wider" style={{ color: "var(--ad-txt)" }}>
                {payment.activation_code}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold"
              style={{
                border: `1px solid ${copiedCode ? "#16A34A" : "var(--ad-line-str)"}`,
                color: copiedCode ? "#16A34A" : "var(--ad-txt-soft)",
              }}
            >
              {copiedCode ? <><FaCheck className="text-[9px]" /> Copied</> : <><FaCopy className="text-[9px]" /> Copy</>}
            </button>
          </div>
        )}

        {/* Receipt */}
        {payment.receipt_url ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--ad-txt-soft)" }}>
                Receipt
              </p>
              <a
                href={payment.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-ticket-body text-[10px] font-bold"
                style={{ color: "var(--ad-amber)" }}
              >
                <FaExternalLinkAlt className="text-[8px]" />
                Open full size
              </a>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full rounded-xl overflow-hidden relative group"
              style={{ border: "1px solid var(--ad-line)", maxHeight: 340 }}
            >
              <img
                src={payment.receipt_url}
                alt="Receipt"
                className="w-full h-auto block"
                style={{ maxHeight: 340, objectFit: "contain", background: "#000" }}
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.4)" }}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-md" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                  <FaEye className="text-[11px]" />
                  View receipt
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ background: "var(--ad-card-2)", border: "1px dashed var(--ad-line-str)" }}>
            <FaImage className="text-lg" style={{ color: "var(--ad-txt-faint)" }} />
            <p className="font-ticket-body text-[11px]" style={{ color: "var(--ad-txt-soft)" }}>
              No receipt image uploaded
            </p>
          </div>
        )}

        {/* Actions */}
        {payment.status === "pending" && (
          <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: "1px solid var(--ad-line)" }}>
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-xs font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", minWidth: 140 }}
            >
              <FaCheckDouble className="text-[12px]" />
              Approve & Credit User
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-xs font-bold transition-colors disabled:opacity-60"
              style={{ background: "transparent", border: "1px solid var(--ad-danger)", color: "var(--ad-danger)", minWidth: 120 }}
            >
              <FaTimesCircle className="text-[12px]" />
              Reject
            </button>
            {!confirmingRemove ? (
              <button
                onClick={() => setConfirmingRemove(true)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-ticket-body text-xs font-bold disabled:opacity-60"
                style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt-soft)" }}
              >
                <FaTrashAlt className="text-[11px]" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ border: "1px solid var(--ad-danger)" }}>
                <FaExclamationTriangle className="text-[11px] shrink-0" style={{ color: "var(--ad-danger)" }} />
                <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>Delete?</span>
                <button onClick={onDelete} disabled={isLoading} className="px-2.5 py-1 rounded-lg text-white font-ticket-body text-[10px] font-bold" style={{ background: "var(--ad-danger)" }}>Yes</button>
                <button onClick={() => setConfirmingRemove(false)} className="px-2.5 py-1 rounded-lg font-ticket-body text-[10px] font-bold" style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt)" }}>No</button>
              </div>
            )}
          </div>
        )}

        {payment.status !== "pending" && (
          <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--ad-line)" }}>
            <span className="font-ticket-body text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-2" style={{ color: statusMeta.color }}>
              {payment.status === "approved" ? (<><FaCheckDouble className="text-[11px]" /> Approved</>) : (<><FaTimesCircle className="text-[11px]" /> Rejected</>)}
              {payment.reviewed_at && (
                <span className="font-ticket-body text-[10px] font-medium normal-case tracking-normal" style={{ color: "var(--ad-txt-faint)" }}>
                  · {formatDateTime(payment.reviewed_at)}
                </span>
              )}
            </span>
            <button
              onClick={onDelete}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold disabled:opacity-60"
              style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt-soft)" }}
            >
              <FaTrashAlt className="text-[9px]" />
              Delete
            </button>
          </div>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && payment.receipt_url && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 z-[10000] flex items-center justify-center pointer-events-none"
            >
              <img src={payment.receipt_url} alt="Receipt" className="max-w-full max-h-full object-contain rounded-2xl pointer-events-auto" />
              <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-auto">
                <a
                  href={payment.receipt_url} download
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  <FaDownload className="text-sm" />
                </a>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══ AdminOrderCard — FULL IMPLEMENTATION ═══ */
const AdminOrderCard = ({ order, isOpen, onToggle, onStatusChange, onRemove }) => {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const stepIndex = getStepIndex(order);
  const stepId = ORDER_STEPS[stepIndex]?.id;
  const meta = getStepMeta(stepId);
  const StepIcon = meta.icon;
  const trackingNumber = getTrackingNumber(order);

  const customer = order.customer || {};
  const items = order.items || [];

  const handleCopyTracking = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 1600);
    } catch {}
  };

  const nextStep = stepIndex < ORDER_STEPS.length - 1 ? stepIndex + 1 : null;
  const prevStep = stepIndex > 0 ? stepIndex - 1 : null;

  return (
    <>
      <motion.div
        layout
        className="ad-card rounded-[22px] overflow-hidden"
        style={{
          borderWidth: "2px",
          borderColor: `${meta.color}55`,
        }}
      >
        {/* Header — clickable */}
        <button
          onClick={onToggle}
          className="w-full flex items-start gap-3 p-4 sm:p-5 text-left transition-colors"
          style={{ background: "transparent" }}
        >
          {/* Step Icon */}
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: meta.bg, color: meta.color }}
          >
            <StepIcon className="text-base" />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-ticket-display text-sm sm:text-base font-bold truncate">
                #{String(order.id).slice(-8).toUpperCase()}
              </p>
              <span
                className="font-ticket-body text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.pill}
              </span>
            </div>
            <p className="font-ticket-body text-[11px] mt-1" style={{ color: "var(--ad-txt-soft)" }}>
              <FaUser className="inline text-[8px] mr-1" />
              {customer.fullName || "Guest"}
              {customer.phone && <> · {customer.phone}</>}
            </p>
          </div>

          {/* Amount + Date */}
          <div className="text-right shrink-0">
            <p className="font-ticket-display text-sm font-black" style={{ color: "var(--ad-amber)" }}>
              {formatRs(order.total)}
            </p>
            <p className="font-ticket-body text-[10px] mt-0.5" style={{ color: "var(--ad-txt-faint)" }}>
              {order.placedAt ? formatDateTime(order.placedAt) : ""}
            </p>
          </div>

          {/* Chevron */}
          <FaChevronDown
            className="text-[11px] shrink-0 mt-1 transition-transform"
            style={{
              color: "var(--ad-txt-soft)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Expanded body */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-5 space-y-4" style={{ borderTop: "1px solid var(--ad-line)" }}>
                {/* Tracking + copy */}
                <div
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 mt-4"
                  style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}
                >
                  <div className="min-w-0">
                    <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--ad-txt-soft)" }}>
                      Tracking
                    </p>
                    <p className="font-ticket-body text-xs font-bold font-mono truncate" style={{ color: "var(--ad-txt)" }}>
                      {trackingNumber}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyTracking}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-ticket-body text-[10px] font-bold"
                    style={{
                      border: `1px solid ${copiedTracking ? "#16A34A" : "var(--ad-line-str)"}`,
                      color: copiedTracking ? "#16A34A" : "var(--ad-txt-soft)",
                    }}
                  >
                    {copiedTracking ? <><FaCheck className="text-[9px]" /> Copied</> : <><FaCopy className="text-[9px]" /> Copy</>}
                  </button>
                </div>

                {/* Customer details */}
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    { label: "Customer", value: customer.fullName || "—" },
                    { label: "Phone", value: customer.phone || "—" },
                    { label: "Address", value: customer.address || "—" },
                    { label: "City", value: customer.city || "—" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-lg px-3 py-2"
                      style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}
                    >
                      <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--ad-txt-soft)" }}>
                        {row.label}
                      </p>
                      <p className="font-ticket-body text-[11px] font-bold truncate" style={{ color: "var(--ad-txt)" }}>
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Items */}
                {items.length > 0 && (
                  <div>
                    <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ad-txt-soft)" }}>
                      Items ({items.length})
                    </p>
                    <div className="space-y-2">
                      {items.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg p-2"
                          style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}
                        >
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.title}
                              className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                              style={{ border: "1px solid var(--ad-line)" }}
                            />
                          ) : (
                            <div
                              className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: "var(--ad-card)", border: "1px solid var(--ad-line)" }}
                            >
                              <FaBoxOpen className="text-sm" style={{ color: "var(--ad-txt-faint)" }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-ticket-body text-xs font-bold truncate" style={{ color: "var(--ad-txt)" }}>
                              {it.title || "Item"}
                            </p>
                            <p className="font-ticket-body text-[10px]" style={{ color: "var(--ad-txt-soft)" }}>
                              Qty {it.qty || 1} × {formatRs(it.price || 0)}
                            </p>
                          </div>
                          <p className="font-ticket-body text-xs font-bold shrink-0" style={{ color: "var(--ad-txt)" }}>
                            {formatRs((it.price || 0) * (it.qty || 1))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total breakdown */}
                <div className="rounded-xl p-3 space-y-1.5" style={{ background: "var(--ad-card-2)", border: "1px solid var(--ad-line)" }}>
                  <div className="flex items-center justify-between">
                    <span className="font-ticket-body text-[11px]" style={{ color: "var(--ad-txt-soft)" }}>Subtotal</span>
                    <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>{formatRs(order.subtotal || order.total)}</span>
                  </div>
                  {order.shipping != null && (
                    <div className="flex items-center justify-between">
                      <span className="font-ticket-body text-[11px]" style={{ color: "var(--ad-txt-soft)" }}>Shipping</span>
                      <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>{formatRs(order.shipping)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1.5" style={{ borderTop: "1px solid var(--ad-line)" }}>
                    <span className="font-ticket-body text-xs font-bold" style={{ color: "var(--ad-txt)" }}>Total</span>
                    <span className="font-ticket-display text-sm font-black" style={{ color: "var(--ad-amber)" }}>{formatRs(order.total)}</span>
                  </div>
                </div>

                {/* Status timeline */}
                <div>
                  <p className="font-ticket-body text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--ad-txt-soft)" }}>
                    Status Timeline
                  </p>
                  <div className="flex items-center gap-1">
                    {ORDER_STEPS.map((s, i) => {
                      const sMeta = getStepMeta(s.id);
                      const done = i <= stepIndex;
                      return (
                        <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                          <div
                            className="h-2 w-full rounded-full transition-colors"
                            style={{ background: done ? sMeta.color : "var(--ad-line)" }}
                          />
                          <span
                            className="font-ticket-body text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-center"
                            style={{ color: done ? sMeta.color : "var(--ad-txt-faint)" }}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid var(--ad-line)" }}>
                  {prevStep !== null && (
                    <button
                      onClick={() => onStatusChange(prevStep)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                      style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt)" }}
                    >
                      <FaUndo className="text-[10px]" />
                      {ORDER_STEPS[prevStep].label}
                    </button>
                  )}
                  {nextStep !== null && (
                    <button
                      onClick={() => onStatusChange(nextStep)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold text-white transition-all hover:scale-[1.01] min-w-[140px]"
                      style={{ background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}dd 100%)` }}
                    >
                      <FaCheck className="text-[10px]" />
                      Mark as {ORDER_STEPS[nextStep].label}
                    </button>
                  )}
                  {nextStep === null && (
                    <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold"
                      style={{ background: "var(--ad-success-soft)", color: "var(--ad-success)" }}>
                      <FaCheckDouble className="text-[10px]" />
                      Order Complete
                    </div>
                  )}

                  {!confirmingRemove ? (
                    <button
                      onClick={() => setConfirmingRemove(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold"
                      style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt-soft)" }}
                    >
                      <FaTrashAlt className="text-[10px]" />
                      Delete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ border: "1px solid var(--ad-danger)" }}>
                      <FaExclamationTriangle className="text-[11px] shrink-0" style={{ color: "var(--ad-danger)" }} />
                      <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ad-txt)" }}>Delete?</span>
                      <button
                        onClick={onRemove}
                        className="px-2.5 py-1 rounded-lg text-white font-ticket-body text-[10px] font-bold"
                        style={{ background: "var(--ad-danger)" }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmingRemove(false)}
                        className="px-2.5 py-1 rounded-lg font-ticket-body text-[10px] font-bold"
                        style={{ border: "1px solid var(--ad-line-str)", color: "var(--ad-txt)" }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};  
export default AdminDashboard;