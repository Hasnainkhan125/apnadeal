// pages/Wallet.jsx — Ticket Design System + Live Sales Dashboard (dark/light)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  FaWallet, FaHistory, FaCheckCircle, FaShieldAlt, FaTag,
  FaMapMarkerAlt, FaCar, FaHome, FaLaptop, FaMobileAlt,
  FaUser, FaChevronRight, FaBolt, FaChartLine,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   WALLET — THEME TOKENS — dark + light
   ═══════════════════════════════════════════════════════════════ */
const WalletStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    .font-ticket-display { font-family: 'Inter', system-ui, sans-serif; letter-spacing: -0.02em; font-weight: 700; }
    .font-ticket-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    html, body { overflow-x: hidden; max-width: 100vw; }

    /* ── LIGHT THEME (default) ── */
    .theme-light {
      --wl-bg-1:          #F4F5F7;
      --wl-bg-2:          #EDEEF1;
      --wl-panel:         #FFFFFF;
      --wl-panel-2:       #FAFAFB;
      --wl-card:          #FFFFFF;
      --wl-card-2:        #F7F7F9;
      --wl-line:          #EEEEF1;
      --wl-line-str:      #E3E3E8;
      --wl-txt:           #1A1A1A;
      --wl-txt-soft:      #6B7280;
      --wl-txt-faint:     #9CA3AF;
      --wl-dot:           rgba(20,20,30,0.06);
      --wl-primary:       #E86A22;
      --wl-primary-2:     #FF7A1A;
      --wl-primary-3:     #C8531B;
      --wl-primary-soft:  #FFF2EA;
      --wl-primary-glow:  rgba(232,106,34,0.35);
      --wl-green:         #16A34A;
      --wl-green-soft:    #DCFCE7;
      --wl-danger:        #DC2626;
      --wl-danger-soft:   #FEE2E2;
      --wl-shadow:        0 1px 2px rgba(16,24,40,0.05);
      --wl-shadow-md:     0 4px 12px -2px rgba(16,24,40,0.08), 0 2px 6px -2px rgba(16,24,40,0.04);
    }

    /* ── DARK THEME ── */
    .theme-dark {
      --wl-bg-1:          #0A0A12;
      --wl-bg-2:          #0F0F1A;
      --wl-panel:         #16161F;
      --wl-panel-2:       #1C1C28;
      --wl-card:          #16161F;
      --wl-card-2:        #1C1C28;
      --wl-line:          rgba(255,255,255,0.08);
      --wl-line-str:      rgba(255,255,255,0.15);
      --wl-txt:           #FFFFFF;
      --wl-txt-soft:      rgba(255,255,255,0.65);
      --wl-txt-faint:     rgba(255,255,255,0.45);
      --wl-dot:           rgba(255,255,255,0.06);
      --wl-primary:       #EB7D34;
      --wl-primary-2:     #F59E0B;
      --wl-primary-3:     #C8631F;
      --wl-primary-soft:  rgba(235,125,52,0.14);
      --wl-primary-glow:  rgba(235,125,52,0.45);
      --wl-green:         #34D399;
      --wl-green-soft:    rgba(52,211,153,0.14);
      --wl-danger:        #EF4444;
      --wl-danger-soft:   rgba(239,68,68,0.14);
      --wl-shadow:        0 1px 2px rgba(0,0,0,0.4);
      --wl-shadow-md:     0 8px 24px -12px rgba(0,0,0,0.6);
    }

    /* ── Page wrapper ── */
    .wl-bg {
      background: var(--wl-bg-1);
      color: var(--wl-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }

    /* ── Card surfaces ── */
    .wl-card {
      background: var(--wl-card);
      border: 1px solid var(--wl-line);
      border-radius: 16px;
      box-shadow: var(--wl-shadow);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .wl-card-2 {
      background: var(--wl-card-2);
      border: 1px solid var(--wl-line);
    }

    .wl-txt      { color: var(--wl-txt); }
    .wl-txt-soft { color: var(--wl-txt-soft); }
    .wl-txt-faint{ color: var(--wl-txt-faint); }

    /* ── Row hover ── */
    .wl-row-hover { transition: background 0.15s ease; }
    .wl-row-hover:hover { background: var(--wl-card-2); }

    /* ── Live dot pulse ── */
    @keyframes wl-live-pulse {
      0%, 100% { opacity: 1;   transform: scale(1); }
      50%      { opacity: 0.35; transform: scale(0.85); }
    }
    .wl-live-dot { animation: wl-live-pulse 1.6s ease-in-out infinite; }

    /* ── Dividers ── */
    .wl-divide > * + * { border-top: 1px solid var(--wl-line); }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
const CATEGORY_TO_PATH = {
  vehicles: "vehicle", cars: "vehicle", bikes: "vehicle", trucks: "vehicle",
  mobiles: "mobile", phones: "mobile", tablets: "mobile", laptops: "mobile",
  property: "property", house: "property", apartment: "property", plot: "property",
  commercial: "property", "farm house": "property",
  electronics: "electronic", tvs: "electronic", cameras: "electronic",
  audio: "electronic", gaming: "electronic",
};

const CATEGORY_ICON = {
  vehicles: FaCar, cars: FaCar, bikes: FaCar, trucks: FaCar,
  mobiles: FaMobileAlt, phones: FaMobileAlt, tablets: FaMobileAlt, laptops: FaLaptop,
  property: FaHome, house: FaHome, apartment: FaHome, plot: FaHome,
  commercial: FaHome, "farm house": FaHome,
  electronics: FaLaptop, tvs: FaLaptop, cameras: FaLaptop,
  audio: FaLaptop, gaming: FaLaptop,
};

const formatRs = (num) => `Rs ${Number(num || 0).toLocaleString("en-US")}`;

const formatCompact = (num) => {
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

const timeAgo = (iso) => {
  if (!iso) return "just now";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

/* ═══════════════════════════════════════════════════════════════
   Live Sale Row
   ═══════════════════════════════════════════════════════════════ */
const LiveSaleRow = ({ sale, onClick }) => {
  const catKey = (sale.category || "").toLowerCase().trim();
  const CatIcon = CATEGORY_ICON[catKey] || FaTag;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="w-full text-left px-4 sm:px-6 py-3.5 sm:py-4 flex items-start gap-3 sm:gap-4 wl-row-hover group/row"
    >
      {/* Item thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden"
          style={{ background: "var(--wl-card-2)", border: "1px solid var(--wl-line)" }}>
          <img
            src={sale.image || "/car1.png"}
            alt={sale.title}
            className="w-full h-full object-contain p-1.5"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>

        {/* Sold check badge */}
        <div
          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
          style={{ background: "var(--wl-primary)", border: "2px solid var(--wl-card)" }}
        >
          <FaCheckCircle className="text-white text-[8px]" />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-ticket-body text-[13px] sm:text-sm font-semibold truncate wl-txt">
              {sale.title || "Untitled"}
            </p>

            {/* Seller avatar + name + location */}
            <div className="flex items-center gap-1.5 mt-1 min-w-0">
              <div
                className="h-5 w-5 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: "var(--wl-primary-soft)", border: "1px solid var(--wl-line)" }}
              >
                {sale.sellerAvatar ? (
                  <img
                    src={sale.sellerAvatar}
                    alt={sale.sellerName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <FaUser className="text-[8px]" style={{ color: "var(--wl-primary)" }} />
                )}
              </div>
              <span className="font-ticket-body text-[11px] font-medium truncate wl-txt-soft">
                {sale.sellerName || "Seller"}
              </span>
              <span className="wl-txt-faint">·</span>
              <span className="inline-flex items-center gap-1 font-ticket-body text-[11px] truncate wl-txt-soft">
                <FaMapMarkerAlt className="text-[8px] flex-shrink-0" style={{ color: "var(--wl-primary)" }} />
                <span className="truncate">{sale.location || "—"}</span>
              </span>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--wl-green)",
                  background: "var(--wl-green-soft)",
                }}>
                <CatIcon className="text-[8px]" /> SOLD
              </span>
              <span className="font-ticket-body text-[10.5px] font-medium wl-txt-soft">
                {sale.soldAgo}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0">
            <p className="font-ticket-display text-[14px] sm:text-base font-bold tabular-nums whitespace-nowrap"
              style={{ color: "var(--wl-primary)" }}>
              {formatRs(sale.price)}
            </p>
            <FaChevronRight
              className="text-[10px] sm:opacity-0 sm:group-hover/row:opacity-100 transition-opacity hidden sm:block wl-txt-faint"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WALLET
   ═══════════════════════════════════════════════════════════════ */
const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liveSales, setLiveSales] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  const loadLiveSales = useCallback(async () => {
    try {
      const { data: sold, error: soldErr } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "sold")
        .order("updated_at", { ascending: false })
        .limit(30);

      if (soldErr) throw soldErr;

      if (!sold || sold.length === 0) {
        setLiveSales([]);
        setIsLoadingSales(false);
        return;
      }

      const sellerIds = [...new Set(sold.map((s) => s.user_id).filter(Boolean))];

      let settingsMap = {};
      if (sellerIds.length > 0) {
        const { data: settingsRows } = await supabase
          .from("user_settings")
          .select("user_id, full_name, avatar, avatar_url")
          .in("user_id", sellerIds);

        (settingsRows || []).forEach((row) => { settingsMap[row.user_id] = row; });
      }

      const merged = sold.map((item) => {
        const s = settingsMap[item.user_id] || {};
        const catKey = (item.subcategory || item.category || "").toLowerCase().trim();
        return {
          id: item.id,
          title: item.title || "Untitled",
          category: catKey,
          detailPath: CATEGORY_TO_PATH[catKey] || "listing",
          image: item.cover_image || item.images?.[0] || "/car1.png",
          price: Number(item.price) || 0,
          location: item.area ? `${item.area}, ${item.city}` : item.city || "—",
          sellerName:
            s.full_name || item.seller_name ||
            (item.user_id ? `Seller ${String(item.user_id).slice(0, 4)}` : "Seller"),
          sellerAvatar: s.avatar || s.avatar_url || null,
          soldAt: item.updated_at || item.posted_at,
          soldAgo: timeAgo(item.updated_at || item.posted_at),
        };
      });

      setLiveSales(merged);
    } catch (err) {
      console.error("Load live sales error:", err);
      setLiveSales([]);
    } finally {
      setIsLoadingSales(false);
    }
  }, []);

  useEffect(() => { loadLiveSales(); }, [loadLiveSales]);

  useEffect(() => {
    const channel = supabase
      .channel("wallet-live-sales")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "listings" },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          const status = (row.status || "").toLowerCase().trim();
          if (status === "sold") loadLiveSales();
          else setLiveSales((prev) => prev.filter((s) => s.id !== row.id));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadLiveSales]);

  const handleSaleClick = (sale) => navigate(`/${sale.detailPath}/${sale.id}`);

  const stats = useMemo(() => {
    const total = liveSales.length;
    const sum = liveSales.reduce((s, x) => s + (x.price || 0), 0);
    const avg = total > 0 ? Math.round(sum / total) : 0;
    return { total, sum, avg };
  }, [liveSales]);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden wl-bg theme-light relative">
      <WalletStyles />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 relative z-10 box-border">

        {/* ═══ HEADING ═══ */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{ background: "var(--wl-primary-soft)", color: "var(--wl-primary)" }}>
              <FaWallet className="text-[16px]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-ticket-display text-[24px] sm:text-[30px] leading-tight truncate wl-txt">
                  Live Sales
                </h1>
                <span className="inline-flex items-center gap-1.5 font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ color: "var(--wl-primary)", background: "var(--wl-primary-soft)" }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full wl-live-dot"
                      style={{ background: "var(--wl-primary)" }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                      style={{ background: "var(--wl-primary)" }} />
                  </span>
                  LIVE
                </span>
              </div>
              <p className="font-ticket-body text-[12px] sm:text-[13px] truncate wl-txt-soft mt-0.5">
                Real-time feed of every item sold on APNaDEAL.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ STATS STRIP ═══ */}
        {!isLoadingSales && liveSales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
          >
            {[
              { icon: FaBolt,     label: "Total Sales", value: stats.total },
              { icon: FaTag,      label: "Value Sold",  value: formatCompact(stats.sum) },
              { icon: FaChartLine,label: "Avg. Price",  value: formatCompact(stats.avg) },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="wl-card p-4 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--wl-primary-soft)", color: "var(--wl-primary)" }}>
                    <Icon className="text-[13px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-ticket-display text-[18px] leading-none tabular-nums truncate wl-txt">
                      {s.value}
                    </p>
                    <p className="font-ticket-body text-[11px] font-medium mt-1 truncate wl-txt-soft">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ LIVE SALES FEED ═══ */}
        <div className="wl-card overflow-hidden !rounded-2xl">

          {/* Header */}
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3"
            style={{ borderBottom: "1px solid var(--wl-line)" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 flex-shrink-0 rounded-xl flex items-center justify-center"
                style={{ background: "var(--wl-primary-soft)", color: "var(--wl-primary)" }}>
                <FaHistory className="text-[12px]" />
              </div>
              <div className="min-w-0">
                <h2 className="font-ticket-display text-[15px] sm:text-[16px] leading-tight truncate wl-txt">
                  Recent Sales
                </h2>
                <p className="font-ticket-body text-[11.5px] wl-txt-soft">
                  {isLoadingSales ? "Loading..."
                    : liveSales.length === 0 ? "No sales yet"
                    : `${liveSales.length} items sold`}
                </p>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="wl-divide">
            <AnimatePresence initial={false}>
              {isLoadingSales ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="px-4 sm:px-6 py-3.5 flex items-start gap-3 sm:gap-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl animate-pulse flex-shrink-0"
                      style={{ background: "var(--wl-card-2)" }} />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-3 w-2/3 rounded animate-pulse" style={{ background: "var(--wl-card-2)" }} />
                      <div className="h-2.5 w-1/2 rounded animate-pulse" style={{ background: "var(--wl-card-2)" }} />
                      <div className="h-2.5 w-1/4 rounded animate-pulse" style={{ background: "var(--wl-card-2)" }} />
                    </div>
                  </div>
                ))
              ) : liveSales.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-5 sm:px-6 py-14 sm:py-16 text-center">
                  <FaTag className="text-4xl mx-auto mb-4 wl-txt-faint" />
                  <p className="font-ticket-display text-[16px] font-bold mb-1 wl-txt">No sales yet</p>
                  <p className="font-ticket-body text-[12.5px] mb-5 max-w-sm mx-auto wl-txt-soft">
                    When a seller marks an item as sold, it will appear here in real time.
                  </p>
                  <Link to="/feed"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-ticket-body font-bold text-[13px] hover:scale-[1.02] transition-all"
                    style={{ background: "var(--wl-primary)", boxShadow: "0 8px 20px -8px var(--wl-primary-glow)" }}>
                    <FaChevronRight className="text-[10px]" />
                    Browse marketplace
                  </Link>
                </motion.div>
              ) : (
                liveSales.map((sale) => (
                  <LiveSaleRow key={sale.id} sale={sale} onClick={() => handleSaleClick(sale)} />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3"
            style={{ borderTop: "1px solid var(--wl-line)" }}>
            <div className="flex items-center gap-2 font-ticket-body text-[11.5px] font-medium wl-txt-soft">
              <FaShieldAlt className="text-[12px] flex-shrink-0" style={{ color: "var(--wl-primary)" }} />
              Every sale verified via escrow protection
            </div>
            <Link to="/feed"
              className="group/dl inline-flex items-center gap-1.5 font-ticket-body text-[12px] font-bold hover:underline self-start sm:self-auto"
              style={{ color: "var(--wl-primary)" }}>
              <FaChevronRight className="text-[10px] transition-transform group-hover/dl:translate-x-0.5" />
              Browse marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;