// pages/BoostCheckout.jsx — Boost checkout (full-width desktop, brand #e66000)
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  FaArrowLeft, FaSpinner, FaRocket, FaCheck, FaCheckCircle,
  FaTimes, FaMobileAlt, FaCreditCard, FaUniversity, FaWallet,
  FaUpload, FaImage, FaClock, FaEye, FaChartLine, FaExclamationTriangle,
  FaCopy, FaLock, FaChevronRight, FaQuestionCircle, FaPercent, FaShieldAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   THEME — brand #e66000 palette (dark + light)
   ═══════════════════════════════════════════════════════════════ */
const BoostStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    .theme-dark {
      --bc-bg: #0A0A12;
      --bc-card: #14141D;
      --bc-card-2: #1A1A24;
      --bc-line: rgba(255,255,255,0.08);
      --bc-line-str: rgba(255,255,255,0.14);
      --bc-txt: #FFFFFF;
      --bc-txt-soft: rgba(255,255,255,0.68);
      --bc-txt-faint: rgba(255,255,255,0.42);
      --bc-amber: #e66000;
      --bc-amber-2: #ff7a1a;
      --bc-amber-3: #c75200;
      --bc-amber-soft: rgba(230,96,0,0.14);
      --bc-amber-glow: rgba(230,96,0,0.45);
      --bc-danger: #EF4444;
      --bc-danger-soft: rgba(239,68,68,0.12);
      --bc-success: #10B981;
      --bc-success-soft: rgba(16,185,129,0.12);
      --bc-primary-dark: #0A0A12;
    }
    .theme-light {
      --bc-bg: #FAF7F3;
      --bc-card: #FFFFFF;
      --bc-card-2: #F6F3EE;
      --bc-line: rgba(45,35,25,0.08);
      --bc-line-str: rgba(45,35,25,0.15);
      --bc-txt: #1A1613;
      --bc-txt-soft: rgba(26,22,19,0.62);
      --bc-txt-faint: rgba(26,22,19,0.42);
      --bc-amber: #e66000;
      --bc-amber-2: #ff7a1a;
      --bc-amber-3: #c75200;
      --bc-amber-soft: rgba(230,96,0,0.10);
      --bc-amber-glow: rgba(230,96,0,0.35);
      --bc-danger: #DC2626;
      --bc-danger-soft: rgba(220,38,38,0.08);
      --bc-success: #059669;
      --bc-success-soft: rgba(5,150,105,0.10);
      --bc-primary-dark: #0A0A12;
    }
    .bc-bg { background: var(--bc-bg); color: var(--bc-txt); min-height: 100vh; }
    .bc-card { background: var(--bc-card); border: 1px solid var(--bc-line); border-radius: 16px; }
    .bc-card-2 { background: var(--bc-card-2); border: 1px solid var(--bc-line); border-radius: 12px; }
    .bc-input {
      background: var(--bc-card-2); color: var(--bc-txt);
      border: 1px solid var(--bc-line); border-radius: 10px;
    }
    .bc-input:focus { border-color: var(--bc-amber); outline: none; }

    /* ⭐ BRAND GRADIENTS — #e66000 */
    .bc-brand-gradient {
      background: linear-gradient(135deg, #e66000 0%, #ff7a1a 100%);
    }
    .bc-brand-gradient-3 {
      background: linear-gradient(135deg, #e66000 0%, #ff7a1a 50%, #c75200 100%);
    }
    .bc-brand-text-gradient {
      background: linear-gradient(135deg, #e66000 0%, #ff7a1a 55%, #c75200 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }

    /* Soft circular radio */
    .bc-radio {
      appearance: none;
      width: 20px; height: 20px;
      border-radius: 50%;
      border: 2px solid var(--bc-line-str);
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      background: transparent;
    }
    .bc-radio:checked {
      border-color: var(--bc-amber);
      background: var(--bc-amber);
    }
    .bc-radio:checked::after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      background: #FFFFFF;
    }

    @keyframes bcFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .bc-float { animation: bcFloat 5s ease-in-out infinite; }
    .bc-noscroll::-webkit-scrollbar { display: none; }
    .bc-noscroll { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* ═══ BOOST PACKAGES ═══ */
const BOOST_PACKAGES = [
  { days: 7,  price: 200, label: "Starter",  features: ["Top of search for 7 days", "Featured badge", "≈500 views"] },
  { days: 14, price: 350, label: "Popular",  features: ["Top of search for 14 days", "Featured badge", "Home page rotation", "≈1,200 views"], popular: true },
  { days: 30, price: 600, label: "Best Value", features: ["Top of search for 30 days", "Featured badge", "Home page rotation", "Priority support", "≈3,000 views"] },
];

/* ═══ PAYMENT METHODS ═══ */
const PAYMENT_METHODS = [
  {
    id: "easypaisa",
    label: "Easypaisa",
    number: "03140972575",
    holder: "Hasnain Hamid",
    logo: "/esypaisa.png",
    color: "#5CB85C",
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    number: "03140972575",
    holder: "Hasnain Hamid",
    logo: "/jazcash.png",
    color: "#E85D9E",
  },
  {
    id: "bank",
    label: "Meezan Bank",
    number: "00300116164743",
    holder: "Hasnain Hamid",
    logo: "/meezan.png",
    color: "#2C5E8B",
  },
];

/* ═══ DISCOUNT OFFERS ═══ */
const DISCOUNT_OFFERS = [
  { id: "1", text: "15% off on Citibank credit cards, above buy Rs 10,000, on orders of Rs 1,000 and above." },
  { id: "2", text: "20% off on Dubai Islamic bank credit cards, above buy Rs 15,000, on orders of Rs 1,000 and above." },
  { id: "3", text: "25% off on HSBC bank credit cards, above buy Rs 20,000, on orders of Rs 1,000 and above." },
];

/* ═══════════════════════════════════════════════════════════════
   ⭐ BOOST SUCCESS — auto-redirect to /my-listings
   ═══════════════════════════════════════════════════════════════ */
const BoostSuccessRedirect = ({ isDark }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/my-listings", { replace: true });
    }, 3200);

    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className={`bc-bg font-ticket-body ${isDark ? "theme-dark" : "theme-light"} flex items-center justify-center p-4 min-h-screen`}>
      <BoostStyles />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bc-card p-8 sm:p-10 max-w-md w-full text-center"
      >
        <div className="relative mx-auto w-28 h-28 mb-6">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.9, 1.4, 1], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--bc-amber)", opacity: 0.2 }}
            aria-hidden="true"
          />
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.7, 1.2, 0.9], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
            className="absolute inset-2 rounded-full"
            style={{ background: "var(--bc-amber)", opacity: 0.3 }}
            aria-hidden="true"
          />

          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
            className="absolute inset-6 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #e66000 0%, #ff7a1a 100%)",
              boxShadow: "0 20px 40px -14px var(--bc-amber-glow)",
            }}
          >
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 18 }}
            >
              <FaCheck className="text-white text-3xl" />
            </motion.span>
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="font-ticket-display text-xl sm:text-2xl font-bold mb-3"
          style={{ color: "var(--bc-txt)" }}
        >
          Boost request submitted!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-ticket-body text-sm mb-6"
          style={{ color: "var(--bc-txt-soft)" }}
        >
          Your payment is under review. We'll boost your listing within 1–2 hours of approval.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: "var(--bc-amber-soft)", border: "1px solid var(--bc-line)" }}
        >
          <FaSpinner className="animate-spin text-[12px]" style={{ color: "var(--bc-amber)" }} />
          <span className="font-ticket-body text-[12.5px] font-semibold" style={{ color: "var(--bc-txt)" }}>
            Redirecting to My Listings in {countdown}s…
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ═══ PAYMENT LOGO helper ═══ */
const MethodLogo = ({ method, size = 40, isDark }) => {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{
          width: size, height: size,
          background: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(45,35,25,0.06)"}`,
        }}
      >
        <img
          src={method.logo}
          alt={method.label}
          className="w-full h-full object-contain p-1"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  const Icon = method.id === "bank" ? FaUniversity :
               method.id === "jazzcash" ? FaWallet : FaMobileAlt;
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size,
        background: `${method.color}22`,
        color: method.color,
      }}
    >
      <Icon style={{ fontSize: size * 0.4 }} />
    </div>
  );
};

/* ═══ MAIN ═══ */
const BoostCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const listingId = searchParams.get("boost");
  const daysParam = Number(searchParams.get("days")) || 7;
  const amountParam = Number(searchParams.get("amount")) || 0;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(
    BOOST_PACKAGES.find((p) => p.days === daysParam) || BOOST_PACKAGES[0]
  );
  const [selectedMethod, setSelectedMethod] = useState("easypaisa");
  const [step, setStep] = useState(1);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  /* ── Detect theme ── */
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

  /* ── Load listing ── */
  useEffect(() => {
    if (!listingId) {
      setError("No listing specified for boost.");
      setLoading(false);
      return;
    }
    if (!user) {
      navigate(`/signin?next=/checkout?boost=${listingId}&days=${daysParam}&amount=${amountParam}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("listings")
          .select("id, user_id, title, price, cover_image, images, city, area, category, status")
          .eq("id", listingId)
          .maybeSingle();

        if (cancelled) return;
        if (fetchErr) throw fetchErr;
        if (!data) { setError("Listing not found."); return; }
        if (data.user_id !== user.id) { setError("You can only boost your own listings."); return; }
        if (data.status !== "active") { setError("Only active listings can be boosted."); return; }

        setListing(data);
      } catch (err) {
        console.error("[Boost] load failed:", err);
        setError(err.message || "Failed to load listing.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [listingId, user, navigate, daysParam, amountParam]);

  /* ── Copy helper ── */
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  /* ── Receipt upload ── */
  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Receipt must be under 5MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Please upload an image"); return; }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  /* ── Coupon ── */
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const valid = {
      SAVE10: { code: "SAVE10", rate: 0.10, label: "10% off" },
      SAVE15: { code: "SAVE15", rate: 0.15, label: "15% off" },
      APNA20: { code: "APNA20", rate: 0.20, label: "20% off" },
    }[code];
    if (valid) { setAppliedCoupon(valid); setCouponError(""); }
    else { setAppliedCoupon(null); setCouponError("Invalid coupon code"); }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!user || !listing || !receiptFile) return;
    setSubmitting(true);

    try {
      const ext = receiptFile.name.split(".").pop();
      const fileName = `boost-receipts/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("study-group-images")
        .upload(fileName, receiptFile, { cacheControl: "3600", upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("study-group-images")
        .getPublicUrl(uploadData.path);

      const receiptUrl = urlData.publicUrl;
      const activationCode = `BOOST-${Date.now().toString(36).toUpperCase()}`;

      const { error: insertErr } = await supabase
        .from("manual_payments")
        .insert({
          user_id: user.id,
          pack_name: `Boost ${selectedPackage.days} days`,
          pack_credits: 0,
          final_amount_pkr: selectedPackage.price,
          method: selectedMethod,
          activation_code: activationCode,
          receipt_url: receiptUrl,
          status: "pending",
          payment_type: "boost",
          related_listing_id: listing.id,
          boost_days: selectedPackage.days,
          created_at: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;
      setDone(true);
    } catch (err) {
      console.error("[Boost] submit failed:", err);
      alert(`Failed to submit boost: ${err.message || "Try again."}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className={`bc-bg ${isDark ? "theme-dark" : "theme-light"} flex items-center justify-center`}>
        <BoostStyles />
        <div className="text-center">
          <FaSpinner className="text-3xl animate-spin mx-auto mb-3" style={{ color: "var(--bc-amber)" }} />
          <p className="font-ticket-body text-sm" style={{ color: "var(--bc-txt-soft)" }}>
            Preparing checkout…
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div className={`bc-bg ${isDark ? "theme-dark" : "theme-light"} flex items-center justify-center p-4`}>
        <BoostStyles />
        <div className="bc-card p-6 max-w-md w-full text-center">
          <FaExclamationTriangle className="text-3xl mx-auto mb-3" style={{ color: "var(--bc-danger)" }} />
          <h2 className="font-ticket-display text-lg font-bold mb-2">Can't boost this listing</h2>
          <p className="font-ticket-body text-sm mb-5" style={{ color: "var(--bc-txt-soft)" }}>{error}</p>
          <Link
            to="/my-ads"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-ticket-body text-sm font-bold bc-brand-gradient"
          >
            <FaArrowLeft className="text-xs" /> Back to My Ads
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Success ─── */
  if (done) {
    return <BoostSuccessRedirect isDark={isDark} />;
  }

  /* ─── Helpers ─── */
  const subtotal = selectedPackage.price;
  const vat = 0;
  const deliveryCharge = 0;
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.rate) : 0;
  const total = subtotal + vat + deliveryCharge - discount;

  /* ─── MAIN RENDER ─── */
  return (
    <div className={`bc-bg font-ticket-body ${isDark ? "theme-dark" : "theme-light"}`}>
      <BoostStyles />

      {/* ═══ TOP BRAND BAR ═══ */}
      <div className="bc-brand-gradient sticky top-0 z-30 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link
            to={`/listing/${listing.id}`}
            className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors bg-white/20 hover:bg-white/30"
            aria-label="Back"
          >
            <FaChevronLeft className="text-white text-sm" />
          </Link>
          <h1 className="text-white font-black text-[15px] sm:text-[16px] tracking-tight">
            Boost Checkout · {selectedPackage.days} Days
          </h1>
          <div className="w-9" aria-hidden="true" />
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="w-full mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,420px)] xl:grid-cols-[1fr_460px] gap-5 lg:gap-8 items-start">

          {/* ═══════ LEFT COLUMN ═══════ */}
          <div className="space-y-4 lg:space-y-5">

            {/* ── 1. Boost Package ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bc-card p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-[13px] flex-shrink-0"
                  style={{ background: "var(--bc-amber-soft)", color: "var(--bc-amber)", border: "1px solid var(--bc-amber)" }}
                >
                  1
                </div>
                <h2 className="text-[15px] sm:text-[17px] font-black tracking-tight flex items-center gap-2">
                  Boost Package
                  <FaCheck className="text-[12px]" style={{ color: "var(--bc-success)" }} />
                </h2>
                {step !== 1 && (
                  <button
                    onClick={() => setStep(1)}
                    className="ml-auto px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
                    style={{ background: "transparent", border: "1px solid var(--bc-line-str)", color: "var(--bc-txt)" }}
                  >
                    Change
                  </button>
                )}
              </div>

              {step === 1 ? (
                <div className="pl-0 sm:pl-11">
                  {/* Listing preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
                    style={{ background: "var(--bc-card-2)", border: "1px solid var(--bc-line)" }}>
                    {listing.cover_image && (
                      <img src={listing.cover_image} alt={listing.title}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate">{listing.title}</p>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--bc-txt-soft)" }}>
                        Rs {Number(listing.price || 0).toLocaleString()} · {listing.city}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: "var(--bc-success-soft)", color: "var(--bc-success)" }}>
                      <FaCheck className="text-[8px]" /> Active
                    </span>
                  </div>

                  {/* Package cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {BOOST_PACKAGES.map((pkg) => {
                      const active = selectedPackage.days === pkg.days;
                      return (
                        <button
                          key={pkg.days}
                          onClick={() => setSelectedPackage(pkg)}
                          className="relative rounded-2xl p-4 transition-all text-left flex flex-col"
                          style={{
                            background: active ? "var(--bc-amber-soft)" : "var(--bc-card)",
                            border: `1.5px solid ${active ? "var(--bc-amber)" : "var(--bc-line)"}`,
                          }}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white whitespace-nowrap bc-brand-gradient">
                              MOST POPULAR
                            </span>
                          )}
                          <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5 mt-1"
                            style={{ color: active ? "var(--bc-amber)" : "var(--bc-txt-soft)" }}>
                            {pkg.label}
                          </p>
                          <p className="font-ticket-display font-black leading-none text-[24px]">
                            {pkg.days}
                            <span className="text-[13px] font-medium ml-1" style={{ color: "var(--bc-txt-soft)" }}>
                              days
                            </span>
                          </p>
                          <p className="font-ticket-display font-bold text-[19px] mt-2" style={{ color: "var(--bc-amber)" }}>
                            Rs {pkg.price}
                          </p>
                          <ul className="mt-3 space-y-1.5">
                            {pkg.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-[11.5px]" style={{ color: "var(--bc-txt-soft)" }}>
                                <FaCheck className="text-[8px] mt-1 flex-shrink-0" style={{ color: "var(--bc-success)" }} />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                          {active && (
                            <div className="absolute top-3 right-3">
                              <div className="h-5 w-5 rounded-full flex items-center justify-center"
                                style={{ background: "var(--bc-amber)" }}>
                                <FaCheck className="text-[9px] text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="mt-5 w-full py-4 rounded-xl font-bold text-[14px] text-white bc-brand-gradient transition-transform hover:scale-[1.01]"
                    style={{ boxShadow: "0 12px 30px -14px var(--bc-amber-glow)" }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              ) : (
                <div className="pl-11 space-y-1 text-[13.5px]">
                  <p className="font-bold">Boost {selectedPackage.days} days · {selectedPackage.label}</p>
                  <p style={{ color: "var(--bc-txt-soft)" }}>
                    Rs {selectedPackage.price} · {selectedPackage.features[0]}
                  </p>
                </div>
              )}
            </motion.div>

            {/* ── 2. Payment Method ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bc-card p-4 sm:p-6"
              style={{ opacity: step < 2 ? 0.55 : 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-[13px] flex-shrink-0"
                  style={{
                    background: step >= 2 ? "var(--bc-amber-soft)" : "var(--bc-card-2)",
                    color: step >= 2 ? "var(--bc-amber)" : "var(--bc-txt-soft)",
                    border: `1px solid ${step >= 2 ? "var(--bc-amber)" : "var(--bc-line)"}`,
                  }}
                >
                  2
                </div>
                <h2 className="text-[15px] sm:text-[17px] font-black tracking-tight flex items-center gap-2">
                  Payment Method
                  {step > 2 && <FaCheck className="text-[12px]" style={{ color: "var(--bc-success)" }} />}
                </h2>
                {step > 2 && (
                  <button
                    onClick={() => setStep(2)}
                    className="ml-auto px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
                    style={{ background: "transparent", border: "1px solid var(--bc-line-str)", color: "var(--bc-txt)" }}
                  >
                    Change
                  </button>
                )}
              </div>

              {step === 2 ? (
                <div className="pl-0 sm:pl-11">
                  <div className="space-y-3 mb-5">
                    {PAYMENT_METHODS.map((m) => {
                      const active = selectedMethod === m.id;
                      return (
                        <label
                          key={m.id}
                          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: active ? "var(--bc-amber-soft)" : "var(--bc-card-2)",
                            border: `1.5px solid ${active ? "var(--bc-amber)" : "var(--bc-line)"}`,
                          }}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={active}
                            onChange={() => setSelectedMethod(m.id)}
                            className="bc-radio"
                          />
                          <MethodLogo method={m} size={44} isDark={isDark} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold">{m.label}</p>
                            <p className="text-[12px] mt-0.5 truncate" style={{ color: "var(--bc-txt-soft)" }}>
                              {m.number}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {(() => {
                    const m = PAYMENT_METHODS.find((x) => x.id === selectedMethod);
                    if (!m) return null;
                    return (
                      <div className="p-4 rounded-xl mb-5"
                        style={{ background: "var(--bc-card-2)", border: "1px solid var(--bc-line)" }}>
                        <p className="text-[10.5px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: "var(--bc-txt-soft)" }}>
                          Send Rs {selectedPackage.price} to:
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10.5px] font-bold uppercase tracking-widest"
                              style={{ color: "var(--bc-txt-soft)" }}>
                              {m.label} — {m.holder}
                            </p>
                            <p className="font-ticket-display text-[16px] font-bold font-mono tracking-wide truncate">
                              {m.number}
                            </p>
                          </div>
                          <button
                            onClick={() => copyText(m.number)}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold"
                            style={{
                              border: "1px solid var(--bc-line-str)",
                              color: copied ? "var(--bc-success)" : "var(--bc-txt-soft)",
                            }}
                          >
                            {copied ? <><FaCheck className="text-[9px]" /> Copied</> : <><FaCopy className="text-[9px]" /> Copy</>}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-xl font-bold text-[13px] transition-colors"
                      style={{ border: "1px solid var(--bc-line-str)", color: "var(--bc-txt)" }}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 rounded-xl font-bold text-[13.5px] text-white transition-transform hover:scale-[1.01] bc-brand-gradient"
                      style={{ boxShadow: "0 12px 30px -14px var(--bc-amber-glow)" }}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              ) : (
                step > 2 && (
                  <div className="pl-11 flex items-center gap-3">
                    <input type="radio" checked readOnly className="bc-radio" />
                    <MethodLogo
                      method={PAYMENT_METHODS.find((x) => x.id === selectedMethod)}
                      size={36}
                      isDark={isDark}
                    />
                    <span className="text-[13.5px]" style={{ color: "var(--bc-txt-soft)" }}>
                      <strong style={{ color: "var(--bc-txt)" }}>
                        {PAYMENT_METHODS.find((x) => x.id === selectedMethod)?.label}
                      </strong>{" "}
                      · {PAYMENT_METHODS.find((x) => x.id === selectedMethod)?.number}
                    </span>
                  </div>
                )
              )}
            </motion.div>

            {/* ── 3. Upload Receipt ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bc-card p-4 sm:p-6"
              style={{ opacity: step < 3 ? 0.55 : 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-[13px] flex-shrink-0"
                  style={{
                    background: step >= 3 ? "var(--bc-amber-soft)" : "var(--bc-card-2)",
                    color: step >= 3 ? "var(--bc-amber)" : "var(--bc-txt-soft)",
                    border: `1px solid ${step >= 3 ? "var(--bc-amber)" : "var(--bc-line)"}`,
                  }}
                >
                  3
                </div>
                <h2 className="text-[15px] sm:text-[17px] font-black tracking-tight">
                  Upload Payment Receipt
                </h2>
              </div>

              {step === 3 && (
                <div className="pl-0 sm:pl-11">
                  {receiptPreview ? (
                    <div className="bc-card overflow-hidden mb-4">
                      <img src={receiptPreview} alt="Receipt preview" className="w-full max-h-96 object-contain bg-black" />
                      <div className="p-3 flex items-center justify-between gap-3">
                        <span className="text-xs truncate" style={{ color: "var(--bc-txt-soft)" }}>
                          {receiptFile?.name}
                        </span>
                        <button
                          onClick={removeReceipt}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                          style={{ border: "1px solid var(--bc-danger)", color: "var(--bc-danger)" }}
                        >
                          <FaTimes className="text-[10px]" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className="flex flex-col items-center justify-center gap-3 py-12 cursor-pointer rounded-xl mb-4"
                      style={{ borderStyle: "dashed", borderWidth: 2, borderColor: "var(--bc-line)" }}
                    >
                      <input type="file" accept="image/*" onChange={handleReceiptChange} className="hidden" />
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "var(--bc-amber-soft)" }}>
                        <FaUpload className="text-xl" style={{ color: "var(--bc-amber)" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">Click to upload receipt</p>
                        <p className="text-[11.5px] mt-1" style={{ color: "var(--bc-txt-soft)" }}>
                          JPG, PNG — max 5MB
                        </p>
                      </div>
                    </label>
                  )}

                  <div className="p-3.5 rounded-xl flex items-start gap-2.5 mb-4"
                    style={{ background: "var(--bc-amber-soft)", border: "1px solid var(--bc-amber)" }}>
                    <FaClock className="text-[11px] mt-0.5 flex-shrink-0" style={{ color: "var(--bc-amber)" }} />
                    <p className="text-[11.5px]" style={{ color: "var(--bc-txt-soft)" }}>
                      Our team reviews boost requests within <strong>1–2 hours</strong>. You'll get a notification once approved.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ═══════ RIGHT COLUMN — STICKY SUMMARY ═══════ */}
          <div className="space-y-4 lg:space-y-5 lg:sticky lg:top-20">

            {/* ── Order Summary ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bc-card p-4 sm:p-6"
            >
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
                disabled={submitting || (step === 3 && !receiptFile)}
                className="w-full py-4 rounded-xl font-black text-[14px] text-white bc-brand-gradient-3 transition-transform disabled:opacity-60 flex items-center justify-center gap-2 mb-5"
                style={{ boxShadow: "0 12px 30px -14px var(--bc-amber-glow)" }}
              >
                {submitting ? (
                  <><FaSpinner className="animate-spin text-sm" /> Submitting…</>
                ) : step === 3 ? (
                  <><FaCheck className="text-sm" /> Submit Boost Request</>
                ) : (
                  <><FaShieldAlt className="text-[13px]" /> Continue to {step === 1 ? "Payment" : "Receipt"}</>
                )}
              </motion.button>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-black">Order Summary</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold"
                  style={{ background: "var(--bc-amber-soft)", color: "var(--bc-amber)" }}>
                  {selectedPackage.days} Days
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 mb-3"
                style={{ borderBottom: "1px solid var(--bc-line)" }}>
                <span className="text-[11.5px] font-bold uppercase tracking-wider">Product</span>
                <span className="text-[11.5px] font-bold uppercase tracking-wider">Total</span>
              </div>

              <div className="flex items-start justify-between gap-3 text-[13px] mb-4">
                <span className="flex-1 min-w-0" style={{ color: "var(--bc-txt-soft)" }}>
                  {listing.title.length > 34 ? listing.title.slice(0, 34) + "…" : listing.title} x 1
                </span>
                <span className="font-bold flex-shrink-0">Rs {selectedPackage.price}</span>
              </div>

              <div className="space-y-2.5 pt-3 mb-3 text-[13px]"
                style={{ borderTop: "1px solid var(--bc-line)" }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--bc-txt-soft)" }}>Subtotal</span>
                  <span>Rs {subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--bc-txt-soft)" }}>VAT</span>
                  <span>Rs {vat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--bc-txt-soft)" }}>Delivery Charge</span>
                  <span>Rs {deliveryCharge}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5" style={{ color: "var(--bc-success)" }}>
                      <FaPercent className="text-[10px]" />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span style={{ color: "var(--bc-success)" }}>- Rs {discount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid var(--bc-line)" }}>
                <span className="text-[15px] font-black" style={{ color: "var(--bc-amber)" }}>
                  Order Total
                </span>
                <span className="text-[19px] font-black" style={{ color: "var(--bc-amber)" }}>
                  Rs {total}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Have coupon code? Enter here"
                    className="flex-1 px-3.5 py-2.5 text-[12.5px] outline-none"
                    style={{
                      background: "var(--bc-card-2)",
                      color: "var(--bc-txt)",
                      border: "1px solid var(--bc-line)",
                      borderRadius: 10,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--bc-amber)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--bc-line)")}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 rounded-lg text-[12.5px] font-bold text-white bc-brand-gradient transition-transform hover:scale-[1.02] flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-[11.5px] font-semibold" style={{ color: "var(--bc-danger)" }}>
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="mt-2 text-[11.5px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--bc-success)" }}>
                    <FaCheckCircle className="text-[10px]" />
                    Coupon applied — {appliedCoupon.label}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ── Discount Offers ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bc-card p-4 sm:p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--bc-amber-soft)" }}>
                  <FaPercent className="text-[13px]" style={{ color: "var(--bc-amber)" }} />
                </div>
                <h3 className="text-[15px] font-black">Discount Offers</h3>
              </div>

              <div className="space-y-3">
                {DISCOUNT_OFFERS.map((offer) => (
                  <div
                    key={offer.id}
                    className="text-[12.5px] leading-relaxed pb-3 last:pb-0"
                    style={{ color: "var(--bc-txt-soft)", borderBottom: "1px solid var(--bc-line)" }}
                  >
                    {offer.text}{" "}
                    <button className="font-bold underline underline-offset-2" style={{ color: "var(--bc-amber)" }}>
                      T&C
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoostCheckout;