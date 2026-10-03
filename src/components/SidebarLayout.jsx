// components/SidebarLayout.jsx — Modern premium marketplace filter sidebar (Category-aware sections)
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFilter } from '../contexts/FilterContext';
import { supabase } from '../lib/supabase';
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaCar,
  FaMoneyBillWave,
  FaTag,
  FaRoad,
  FaCalendarAlt,
  FaGasPump,
  FaCog,
  FaPalette,
  FaUserTie,
  FaShieldAlt,
  FaEllipsisH,
  FaCheck,
  FaGamepad,
  FaMobileAlt,
  FaHome,
  FaLaptop,
  FaMotorcycle,
  FaBatteryFull,
  FaBoxOpen,
  FaChild,
  FaGem,
  FaTools,
  FaUndo,
  FaShippingFast,
  FaCube,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .sidebar-scroll::-webkit-scrollbar { width: 5px; }
    .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
    .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
    .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(235,125,52,0.5); }
    .dark .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
    .dark .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(235,125,52,0.5); }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════
//  BULLETPROOF LOGO
// ═══════════════════════════════════════════════════════════════
const LogoImage = ({ className = "h-full w-full object-contain p-1" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#eb7d34] to-[#c8631f] text-black font-bold text-lg rounded-xl">
        A
      </div>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt="APNa Deal"
      className={className}
      onError={() => {
        if (idx < sources.length - 1) setIdx(idx + 1);
        else setFailed(true);
      }}
    />
  );
};

const fmt = (n) => Number(n || 0).toLocaleString("en-US");

const SIDEBAR_INTRO_KEY = "apna.sidebar.intro.v1";

const CARD_DURATION = 0.55;
const HEADER_DELAY = 0.30;
const FIRST_SECTION_DELAY = 0.55;
const SECTION_STAGGER = 0.15;
const SECTION_DURATION = 0.35;

/* ═══ SECTION ═══ */
const Section = ({ title, icon: Icon, children, defaultOpen = true, activeCount = 0 }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/8 dark:border-white/8 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group/sec"
      >
        {Icon && (
          <span className={`flex items-center justify-center h-7 w-7 rounded-lg flex-shrink-0 transition-colors ${
            activeCount > 0
              ? 'bg-[#eb7d34] text-black'
              : 'bg-[#eb7d34]/12 text-[#c8631f] dark:text-[#eb7d34] group-hover/sec:bg-[#eb7d34]/20'
          }`}>
            <Icon className="text-[11px]" />
          </span>
        )}

        <span className="flex-1 text-left font-ticket-display text-[15px] font-bold text-black dark:text-white tracking-tight">
          {title}
        </span>

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#eb7d34] text-black font-ticket-body text-[10px] font-extrabold"
            >
              {activeCount}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FaChevronDown className="text-[11px] text-[#666] dark:text-[#999] group-hover/sec:text-[#c8631f] dark:group-hover/sec:text-[#eb7d34] transition-colors" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══ LEAF ROW ═══ */
const Row = ({ label, count, indent = 0, highlight = false, active = false, onClick }) => {
  const indentPx = 12 + indent * 14;
  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`relative flex items-center gap-2 py-1.5 pr-2 pl-2 cursor-pointer group rounded-md transition-colors ${
        active ? 'bg-[#eb7d34]/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
      }`}
      style={{ marginLeft: `${indentPx}px` }}
    >
      {active && (
        <motion.span
          layoutId="sidebar-row-indicator"
          className="absolute -left-2 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-[#eb7d34]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <span
        className={`flex-1 min-w-0 font-ticket-body text-[13px] truncate transition-colors ${
          highlight
            ? 'font-bold text-black dark:text-white'
            : active
            ? 'font-bold text-[#c8631f] dark:text-[#eb7d34]'
            : 'text-black/85 dark:text-white/85 group-hover:text-[#c8631f] dark:group-hover:text-[#eb7d34]'
        }`}
      >
        {label}
      </span>

      {count !== null && count !== undefined && (
        <span
          className={`font-ticket-body text-[11px] tabular-nums flex-shrink-0 ${
            active ? 'font-bold text-[#c8631f] dark:text-[#eb7d34]' : 'text-[#666] dark:text-[#999]'
          }`}
        >
          {fmt(count)}
        </span>
      )}
    </motion.div>
  );
};

/* ═══ TREE ═══ */
const Tree = ({ label, indent = 0, defaultOpen = false, count, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const indentPx = 12 + indent * 14;

  return (
    <>
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-1.5 pr-2 pl-2 cursor-pointer rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
        style={{ marginLeft: `${indentPx}px` }}
      >
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FaChevronDown className="text-[9px] text-[#666] dark:text-[#999]" />
        </motion.span>
        <span className="flex-1 font-ticket-body text-[13px] font-semibold text-black dark:text-white truncate">
          {label}
        </span>
        {count !== null && count !== undefined && (
          <span className="font-ticket-body text-[11px] text-[#666] dark:text-[#999] tabular-nums">
            {fmt(count)}
          </span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══ MIN / MAX ═══ */
const MinMax = ({ min, max, onMin, onMax, minPh = 'Min', maxPh = 'Max' }) => (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={min}
      onChange={(e) => onMin(e.target.value)}
      placeholder={minPh}
      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-ticket-body text-[12px] placeholder:text-[#666] dark:placeholder:text-[#999] outline-none focus:border-[#eb7d34] transition-colors"
    />
    <span className="font-ticket-body text-[11px] font-bold text-[#666] dark:text-[#999] flex-shrink-0">—</span>
    <input
      type="text"
      value={max}
      onChange={(e) => onMax(e.target.value)}
      placeholder={maxPh}
      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-ticket-body text-[12px] placeholder:text-[#666] dark:placeholder:text-[#999] outline-none focus:border-[#eb7d34] transition-colors"
    />
  </div>
);

/* ═══ CHECKBOX ═══ */
const Check = ({ label, count, checked, onChange }) => (
  <label className="flex items-center gap-3 py-[6px] cursor-pointer group rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors px-1 -mx-1">
    <motion.span
      whileTap={{ scale: 0.9 }}
      className={`relative flex items-center justify-center h-[18px] w-[18px] rounded-[5px] border-[1.5px] transition-colors flex-shrink-0 ${
        checked
          ? 'border-[#eb7d34] bg-[#eb7d34]'
          : 'border-black/25 dark:border-white/25 group-hover:border-[#eb7d34]'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <FaCheck className="text-black text-[9px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
    <span className="flex-1 min-w-0 font-ticket-body text-[13px] text-black dark:text-white truncate">
      {label}
    </span>
    {count !== null && count !== undefined && count > 0 && (
      <span className="font-ticket-body text-[11px] text-[#666] dark:text-[#999] tabular-nums flex-shrink-0">
        {fmt(count)}
      </span>
    )}
  </label>
);

/* ═══ BRAND ROW ═══ */
const BrandRow = ({ label, count, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 py-[7px] cursor-pointer group rounded-md transition-colors px-1 -mx-1 ${
      active ? 'bg-[#eb7d34]/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
    }`}
  >
    <span
      className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
        active ? 'bg-[#eb7d34]/20' : 'bg-black/5 dark:bg-white/5'
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full transition-colors ${
          active ? 'bg-[#eb7d34]' : 'bg-black/25 dark:bg-white/25'
        }`}
      />
    </span>
    <span
      className={`flex-1 min-w-0 font-ticket-body text-[13px] truncate transition-colors ${
        active
          ? 'font-bold text-[#c8631f] dark:text-[#eb7d34]'
          : 'text-black dark:text-white group-hover:text-[#c8631f] dark:group-hover:text-[#eb7d34]'
      }`}
    >
      {label}
    </span>
    {count !== null && count !== undefined && (
      <span className="font-ticket-body text-[11px] text-[#666] dark:text-[#999] tabular-nums flex-shrink-0">
        {fmt(count)}
      </span>
    )}
  </div>
);

/* ═══ COLOR SWATCH ═══ */
const ColorSwatch = ({ name, hex, active, onClick }) => {
  const isLight = ['White', 'Silver', 'Beige', 'Gold'].includes(name);
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      title={name}
      className={`relative h-8 w-8 rounded-full border-2 transition-colors flex-shrink-0 ${
        active
          ? 'border-[#eb7d34] ring-2 ring-[#eb7d34]/40'
          : 'border-black/15 dark:border-white/15 hover:border-[#eb7d34]'
      }`}
      style={{ backgroundColor: hex }}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <FaCheck
              className="text-[10px]"
              style={{ color: isLight ? '#000' : '#fff' }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR LAYOUT
   ═══════════════════════════════════════════════════════════════ */
const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const filter = useFilter();

  const [categoryCounts, setCategoryCounts] = useState({});
  const [cityCounts, setCityCounts] = useState({});
  const [brandCounts, setBrandCounts] = useState({});
  const [conditionCounts, setConditionCounts] = useState({});
  const [fuelCounts, setFuelCounts] = useState({});
  const [brandSearch, setBrandSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(SIDEBAR_INTRO_KEY) === "true";
      if (!seen) {
        setShowIntro(true);
        const t = setTimeout(() => {
          try { localStorage.setItem(SIDEBAR_INTRO_KEY, "true"); } catch {}
        }, 12000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const publicPages = ['/', '/premium', '/signin', '/signup', '/reset-password'];
  const isPublicPage = publicPages.includes(location.pathname);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("category, subcategory, city, area, specs, condition, status")
          .not("status", "in", "(removed,deleted)");

        if (error) throw error;

        const catCounts = {};
        const cityCounts = {};
        const brandCounts = {};
        const condCounts = {};
        const fuelCounts = {};

        (data || []).forEach((row) => {
          const cat = (row.category || "").trim();
          const sub = (row.subcategory || "").trim();
          const city = (row.city || "").trim();
          const area = (row.area || "").trim();
          const specs = row.specs || {};
          const brand = specs.brand || specs.make || "";
          const cond = row.condition || "";
          const fuel = specs.fuel || "";

          if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
          if (sub) catCounts[sub] = (catCounts[sub] || 0) + 1;
          if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
          if (city.toLowerCase() === "lahore" && area) {
            const key = `Lahore::${area}`;
            cityCounts[key] = (cityCounts[key] || 0) + 1;
          }
          if (brand) brandCounts[brand] = (brandCounts[brand] || 0) + 1;
          if (cond) condCounts[cond] = (condCounts[cond] || 0) + 1;
          if (fuel) fuelCounts[fuel] = (fuelCounts[fuel] || 0) + 1;
        });

        setCategoryCounts(catCounts);
        setCityCounts(cityCounts);
        setBrandCounts(brandCounts);
        setConditionCounts(condCounts);
        setFuelCounts(fuelCounts);
      } catch (err) {
        console.error("❌ Sidebar counts error:", err);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPage) {
      navigate('/signin', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location.pathname, isPublicPage]);

  const pickCategory = (val) => filter.setCategory(filter.category === val ? null : val);
  const pickLocation = (val) => filter.setLocation(filter.location === val ? null : val);
  const pickBrand = (val) => filter.setBrand(filter.brand === val ? null : val);
  const toggleCond = (val) => filter.toggleInArray(filter.setConditions, val);
  const toggleFuel = (val) => filter.toggleInArray(filter.setFuelTypes, val);
  const toggleTrans = (val) => filter.toggleInArray(filter.setTransmissions, val);
  const toggleBody = (val) => filter.toggleInArray(filter.setBodyTypes, val);
  const toggleAssembly = (val) => filter.toggleInArray(filter.setAssembly, val);
  const toggleColor = (val) => filter.toggleInArray(filter.setColors, val);
  const toggleInArray = (setter, val) => filter.toggleInArray(setter, val);

  const topBrands = useMemo(() => {
    const list = Object.entries(brandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12);
    if (!brandSearch.trim()) return list;
    const q = brandSearch.toLowerCase();
    return list.filter(([name]) => name.toLowerCase().includes(q));
  }, [brandCounts, brandSearch]);

  const lahoreAreas = Object.entries(cityCounts)
    .filter(([k]) => k.startsWith("Lahore::"))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const topCities = Object.entries(cityCounts)
    .filter(([k]) => !k.includes("::"))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const activeCategory = String(filter.category || "").trim();

  const showVehicleSections =
    !activeCategory ||
    activeCategory.toLowerCase() === "vehicles" ||
    activeCategory.toLowerCase() === "bikes";

  const showPropertySections =
    !activeCategory || activeCategory.toLowerCase() === "property";

  const showMobileSections =
    !activeCategory || activeCategory.toLowerCase() === "mobiles";

  const showElectronicsSections =
    !activeCategory || activeCategory.toLowerCase() === "electronics";

  const showToySections =
    !activeCategory || activeCategory.toLowerCase() === "toys";

  const totalActiveFilters =
    (filter.category ? 1 : 0) +
    (filter.location ? 1 : 0) +
    (filter.brand ? 1 : 0) +
    (filter.priceMin ? 1 : 0) +
    (filter.priceMax ? 1 : 0) +
    filter.conditions.length +
    filter.fuelTypes.length +
    filter.transmissions.length +
    filter.bodyTypes.length +
    filter.assembly.length +
    filter.colors.length +
    filter.owners.length +
    filter.accidentFree.length +
    filter.sellerType.length +
    (filter.featuredOnly ? 1 : 0) +
    (filter.withPhotos ? 1 : 0);

  const hasActiveFilters = totalActiveFilters > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0d0a05]">
        <FontStyles />
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-[#c8631f] dark:border-[#eb7d34] border-t-transparent rounded-full animate-spin" />
          <p className="font-ticket-body text-[#666] dark:text-[#999] text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublicPage) return null;

  const sidebarWidth = collapsed ? 69 : 320;

  const cardVariants = {
    initial: showIntro
      ? { opacity: 0, x: -60, scale: 0.97 }
      : { opacity: 1, x: 0, scale: 1 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: showIntro
        ? { duration: CARD_DURATION, ease: [0.22, 1, 0.36, 1] }
        : { duration: 0 },
    },
  };

  const headerVariants = {
    initial: showIntro ? { opacity: 0, x: -30 } : { opacity: 1, x: 0 },
    animate: {
      opacity: 1,
      x: 0,
      transition: showIntro
        ? { duration: 0.45, delay: HEADER_DELAY, ease: [0.22, 1, 0.36, 1] }
        : { duration: 0 },
    },
  };

  const sectionVariants = {
    initial: showIntro ? { opacity: 0, x: -30 } : { opacity: 1, x: 0 },
    animate: (i) => ({
      opacity: 1,
      x: 0,
      transition: showIntro
        ? {
            duration: SECTION_DURATION,
            delay: FIRST_SECTION_DELAY + i * SECTION_STAGGER,
            ease: [0.22, 1, 0.36, 1],
          }
        : { duration: 0 },
    }),
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-white dark:bg-[#0d0a05] relative">
      <FontStyles />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.12] z-0"
        style={{
          backgroundImage: 'radial-gradient(#eb7d34 0.6px, transparent 0.6px)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden="true"
      />

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        style={{ width: sidebarWidth }}
        className="hidden md:flex flex-col sticky top-24 h-[calc(100vh-7rem)] transition-[width] duration-300 ease-out relative z-20"
      >
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="flex-1 flex flex-col m-3 mr-0 rounded-3xl bg-[#f8f8f8] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* ═══ LOGO HEADER + COLLAPSE ═══ */}
          <motion.div
            variants={headerVariants}
            initial="initial"
            animate="animate"
            className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'px-4'} py-4 relative flex-shrink-0`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-[#eb7d34]/60 to-transparent" />

            <Link to={user ? '/dashboard' : '/'} className="flex items-center group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#eb7d34]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-[8deg] overflow-hidden bg-black/5 dark:bg-white/5">
                  <LogoImage />
                </div>
              </div>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 overflow-hidden"
                  >
                    <span className="font-ticket-display text-lg font-bold tracking-tight whitespace-nowrap">
                      <span className="text-black dark:text-white">APNa</span>
                      <span className="text-[#eb7d34]">Deal</span>
                    </span>
                    <span className="block font-ticket-body text-[9px] font-bold text-[#666] dark:text-[#999] -mt-0.5 tracking-[0.2em] uppercase whitespace-nowrap">
                      Filters
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {!collapsed ? (
              <motion.button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse filters"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="ml-auto flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-[#666] dark:text-[#999] hover:text-[#c8631f] dark:hover:text-[#eb7d34] hover:bg-[#eb7d34]/12 transition-colors"
              >
                <FaChevronLeft className="text-[11px]" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setCollapsed(false)}
                aria-label="Expand filters"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                title="Expand filters"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[#666] dark:text-[#999] hover:text-[#c8631f] dark:hover:text-[#eb7d34] hover:bg-[#eb7d34]/12 transition-colors border border-black/10 dark:border-white/10"
              >
                <FaChevronRight className="text-[11px]" />
              </motion.button>
            )}
          </motion.div>

          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent flex-shrink-0" />

          {!collapsed && hasActiveFilters && (
            <motion.div
              variants={headerVariants}
              initial="initial"
              animate="animate"
              className="px-4 pt-3 flex-shrink-0"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-ticket-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#666] dark:text-[#999]">
                  {totalActiveFilters} active filter{totalActiveFilters > 1 ? 's' : ''}
                </span>
                <button
                  onClick={filter.resetAll}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[#B23A2E] dark:text-[#E2795F] font-ticket-body text-[10px] font-bold hover:bg-[#B23A2E]/10 transition-colors"
                >
                  <FaTimes className="text-[9px]" />
                  Clear all
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ SCROLLABLE FILTERS ═══ */}
          <div className="sidebar-scroll flex-1 overflow-y-auto">

            <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={0}>
              <Section title="Categories" icon={FaCar} defaultOpen activeCount={filter.category ? 1 : 0}>
                <Row
                  label="All categories"
                  indent={0}
                  count={listingsTotalFromCounts(categoryCounts)}
                  active={!filter.category}
                  onClick={() => filter.setCategory(null)}
                />

                {["Vehicles", "Bikes", "Mobiles", "Property", "Electronics", "Toys"].map((cat) => (
                  <Row
                    key={cat}
                    label={cat}
                    indent={0}
                    count={categoryCounts[cat] || 0}
                    active={filter.category === cat}
                    onClick={() => pickCategory(cat)}
                  />
                ))}
              </Section>
            </motion.div>

            <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={1}>
              <Section title="Location" icon={FaMapMarkerAlt} defaultOpen activeCount={filter.location ? 1 : 0}>
                <Tree label="Pakistan" indent={0} defaultOpen>
                  <Row
                    label="Lahore"
                    indent={1}
                    highlight
                    count={cityCounts["Lahore"] || 0}
                    active={filter.location === "Lahore"}
                    onClick={() => pickLocation("Lahore")}
                  />
                  {lahoreAreas.map(([key, count]) => {
                    const area = key.replace("Lahore::", "");
                    return (
                      <Row
                        key={area}
                        label={area}
                        indent={2}
                        count={count}
                        active={filter.location === area}
                        onClick={() => pickLocation(area)}
                      />
                    );
                  })}
                  {topCities
                    .filter(([city]) => city.toLowerCase() !== "lahore")
                    .map(([city, count]) => (
                      <Row
                        key={city}
                        label={city}
                        indent={1}
                        count={count}
                        active={filter.location === city}
                        onClick={() => pickLocation(city)}
                      />
                    ))}
                </Tree>
              </Section>
            </motion.div>

            <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={2}>
              <Section title="Price" icon={FaMoneyBillWave} defaultOpen activeCount={(filter.priceMin ? 1 : 0) + (filter.priceMax ? 1 : 0)}>
                <MinMax
                  min={filter.priceMin}
                  max={filter.priceMax}
                  onMin={filter.setPriceMin}
                  onMax={filter.setPriceMax}
                />
              </Section>
            </motion.div>

            {topBrands.length > 0 && (
              <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={3}>
                <Section title="Brand and Model" icon={FaTag} defaultOpen activeCount={filter.brand ? 1 : 0}>
                  <div className="mb-3 relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#999] text-[11px] pointer-events-none" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Search brand"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-ticket-body text-[12px] placeholder:text-[#666] dark:placeholder:text-[#999] outline-none focus:border-[#eb7d34] transition-colors"
                    />
                  </div>
                  <div className="-mt-1">
                    {topBrands.map(([name, count]) => (
                      <BrandRow
                        key={name}
                        label={name}
                        count={count}
                        active={filter.brand === name}
                        onClick={() => pickBrand(name)}
                      />
                    ))}
                    {brandSearch && topBrands.length === 0 && (
                      <p className="font-ticket-body text-[11px] text-[#666] dark:text-[#999] text-center py-3">
                        No brands match "{brandSearch}"
                      </p>
                    )}
                  </div>
                </Section>
              </motion.div>
            )}

            <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={4}>
              <Section title="Condition" icon={FaShieldAlt} defaultOpen activeCount={filter.conditions.length}>
                {["Used", "New", "Like New", "Needs Repair"].map((c) => (
                  <Check
                    key={c}
                    label={c}
                    count={conditionCounts[c] || 0}
                    checked={filter.conditions.includes(c)}
                    onChange={() => toggleCond(c)}
                  />
                ))}
              </Section>
            </motion.div>

            {showVehicleSections && (
              <>
                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={5}>
                  <Section title="KM's Driven" icon={FaRoad} defaultOpen={false} activeCount={(filter.kmMin ? 1 : 0) + (filter.kmMax ? 1 : 0)}>
                    <MinMax min={filter.kmMin} max={filter.kmMax} onMin={filter.setKmMin} onMax={filter.setKmMax} />
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={6}>
                  <Section title="Year" icon={FaCalendarAlt} defaultOpen={false} activeCount={(filter.yearMin ? 1 : 0) + (filter.yearMax ? 1 : 0)}>
                    <MinMax
                      min={filter.yearMin} max={filter.yearMax}
                      onMin={filter.setYearMin} onMax={filter.setYearMax}
                      minPh="From" maxPh="To"
                    />
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={7}>
                  <Section title="Engine & Performance" icon={FaGasPump} defaultOpen={false} activeCount={filter.fuelTypes.length}>
                    {["Petrol", "Diesel", "CNG", "Hybrid", "Electric", "LPG"].map((f) => (
                      <Check key={f} label={f} count={fuelCounts[f] || 0} checked={filter.fuelTypes.includes(f)} onChange={() => toggleFuel(f)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={8}>
                  <Section title="Transmission" icon={FaCog} defaultOpen={false} activeCount={filter.transmissions.length}>
                    {["Automatic", "Manual", "CVT", "DCT", "Tiptronic"].map((t) => (
                      <Check key={t} label={t} checked={filter.transmissions.includes(t)} onChange={() => toggleTrans(t)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={9}>
                  <Section title="Body Type" icon={FaCar} defaultOpen={false} activeCount={filter.bodyTypes.length}>
                    {["Sedan", "Hatchback", "SUV", "Crossover", "MPV", "Van", "Coupe", "Convertible", "Pickup", "Truck", "Wagon"].map((b) => (
                      <Check key={b} label={b} checked={filter.bodyTypes.includes(b)} onChange={() => toggleBody(b)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={10}>
                  <Section title="Assembly" icon={FaCog} defaultOpen={false} activeCount={filter.assembly.length}>
                    {["Local", "Imported"].map((a) => (
                      <Check key={a} label={a} checked={filter.assembly.includes(a)} onChange={() => toggleAssembly(a)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={11}>
                  <Section title="Color" icon={FaPalette} defaultOpen={false} activeCount={filter.colors.length}>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'White',  hex: '#F7F1E4' },
                        { name: 'Black',  hex: '#1B1815' },
                        { name: 'Silver', hex: '#B3A793' },
                        { name: 'Grey',   hex: '#7A6F5D' },
                        { name: 'Red',    hex: '#B23A2E' },
                        { name: 'Blue',   hex: '#2A4A6B' },
                        { name: 'Green',  hex: '#164B3B' },
                        { name: 'Amber',  hex: '#eb7d34' },
                        { name: 'Brown',  hex: '#8B5E3C' },
                        { name: 'Beige',  hex: '#D9C9A8' },
                        { name: 'Gold',   hex: '#C9A227' },
                        { name: 'Purple', hex: '#6B4A8A' },
                      ].map((c) => (
                        <ColorSwatch key={c.name} name={c.name} hex={c.hex} active={filter.colors.includes(c.name)} onClick={() => toggleColor(c.name)} />
                      ))}
                    </div>
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={12}>
                  <Section title="Number of Owners" icon={FaUserTie} defaultOpen={false} activeCount={filter.owners.length}>
                    {["1st", "2nd", "3rd", "4th+"].map((o) => (
                      <Check key={o} label={o} checked={filter.owners.includes(o)} onChange={() => filter.toggleInArray(filter.setOwners, o)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={13}>
                  <Section title="Accident Free" icon={FaShieldAlt} defaultOpen={false} activeCount={filter.accidentFree.length}>
                    {["Yes", "No", "Minor"].map((a) => (
                      <Check key={a} label={a} checked={filter.accidentFree.includes(a)} onChange={() => filter.toggleInArray(filter.setAccidentFree, a)} />
                    ))}
                  </Section>
                </motion.div>
              </>
            )}

            {showPropertySections && activeCategory.toLowerCase() === "property" && (
              <>
                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={14}>
                  <Section title="Area" icon={FaHome} defaultOpen={false} activeCount={0}>
                    <MinMax
                      min={filter.areaMin || ""} max={filter.areaMax || ""}
                      onMin={(v) => filter.setAreaMin?.(v)} onMax={(v) => filter.setAreaMax?.(v)}
                      minPh="Min" maxPh="Max"
                    />
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={15}>
                  <Section title="Bedrooms" icon={FaHome} defaultOpen={false} activeCount={filter.beds?.length || 0}>
                    {["1", "2", "3", "4", "5", "6+"].map((b) => (
                      <Check
                        key={b}
                        label={`${b} Bedroom${b === "1" ? "" : "s"}`}
                        checked={filter.beds?.includes(b)}
                        onChange={() => filter.toggleInArray?.(filter.setBeds, b)}
                      />
                    ))}
                  </Section>
                </motion.div>
              </>
            )}

            {showMobileSections && activeCategory.toLowerCase() === "mobiles" && (
              <>
                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={14}>
                  <Section title="Storage" icon={FaMobileAlt} defaultOpen={false} activeCount={filter.storage?.length || 0}>
                    {["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"].map((s) => (
                      <Check key={s} label={s} checked={filter.storage?.includes(s)} onChange={() => filter.toggleInArray?.(filter.setStorage, s)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={15}>
                  <Section title="PTA Approved" icon={FaShieldAlt} defaultOpen={false} activeCount={filter.ptaApproved?.length || 0}>
                    {["Yes", "No"].map((p) => (
                      <Check key={p} label={p} checked={filter.ptaApproved?.includes(p)} onChange={() => filter.toggleInArray?.(filter.setPtaApproved, p)} />
                    ))}
                  </Section>
                </motion.div>
              </>
            )}

            {showElectronicsSections && activeCategory.toLowerCase() === "electronics" && (
              <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={14}>
                <Section title="Device Type" icon={FaLaptop} defaultOpen={false} activeCount={filter.deviceTypes?.length || 0}>
                  {["Laptop", "Desktop", "TV", "Camera", "Audio", "Gaming Console", "Monitor", "Printer"].map((d) => (
                    <Check key={d} label={d} checked={filter.deviceTypes?.includes(d)} onChange={() => filter.toggleInArray?.(filter.setDeviceTypes, d)} />
                  ))}
                </Section>
              </motion.div>
            )}

            {showToySections && activeCategory.toLowerCase() === "toys" && (
              <>
                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={14}>
                  <Section title="Suitable For" icon={FaChild} defaultOpen={false} activeCount={filter.toyGender?.length || 0}>
                    {["Unisex", "Boys", "Girls"].map((g) => (
                      <Check key={g} label={g} checked={filter.toyGender?.includes(g)} onChange={() => filter.toggleInArray?.(filter.setToyGender, g)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={15}>
                  <Section title="Material" icon={FaGem} defaultOpen={false} activeCount={filter.toyMaterial?.length || 0}>
                    {["Plastic", "Wood", "Metal", "Fabric / Plush", "Rubber", "Foam", "Mixed"].map((m) => (
                      <Check key={m} label={m} checked={filter.toyMaterial?.includes(m)} onChange={() => filter.toggleInArray?.(filter.setToyMaterial, m)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={16}>
                  <Section title="Battery Required" icon={FaBatteryFull} defaultOpen={false} activeCount={filter.toyBattery?.length || 0}>
                    {["Yes", "No", "Included"].map((b) => (
                      <Check key={b} label={b} checked={filter.toyBattery?.includes(b)} onChange={() => filter.toggleInArray?.(filter.setToyBattery, b)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={17}>
                  <Section title="Assembly Required" icon={FaTools} defaultOpen={false} activeCount={filter.toyAssembly?.length || 0}>
                    {["Yes", "No"].map((a) => (
                      <Check key={a} label={a} checked={filter.toyAssembly?.includes(a)} onChange={() => filter.toggleInArray?.(filter.setToyAssembly, a)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={18}>
                  <Section title="Packaging" icon={FaBoxOpen} defaultOpen={false} activeCount={filter.toyPackaging?.length || 0}>
                    {["Original Box", "No Box", "Damaged Box"].map((p) => (
                      <Check key={p} label={p} checked={filter.toyPackaging?.includes(p)} onChange={() => filter.toggleInArray?.(filter.setToyPackaging, p)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={19}>
                  <Section title="Delivery" icon={FaShippingFast} defaultOpen={false} activeCount={filter.toyDelivery?.length || 0}>
                    {["Yes", "No", "Pickup Only"].map((d) => (
                      <Check key={d} label={d} checked={filter.toyDelivery?.includes(d)} onChange={() => filter.toggleInArray?.(filter.setToyDelivery, d)} />
                    ))}
                  </Section>
                </motion.div>

                <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={20}>
                  <Section title="Return Policy" icon={FaUndo} defaultOpen={false} activeCount={filter.toyReturn?.length || 0}>
                    {["No Returns", "7 Days", "14 Days"].map((r) => (
                      <Check key={r} label={r} checked={filter.toyReturn?.includes(r)} onChange={() => filter.toggleInArray?.(filter.setToyReturn, r)} />
                    ))}
                  </Section>
                </motion.div>
              </>
            )}

            <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={21}>
              <Section title="Seller Type" icon={FaUserTie} defaultOpen={false} activeCount={filter.sellerType.length}>
                {["Individual", "Dealer", "Verified"].map((s) => (
                  <Check key={s} label={s} checked={filter.sellerType.includes(s)} onChange={() => filter.toggleInArray(filter.setSellerType, s)} />
                ))}
              </Section>
            </motion.div>

            <motion.div variants={sectionVariants} initial="initial" animate="animate" custom={22}>
              <Section title="Other" icon={FaEllipsisH} defaultOpen={false} activeCount={(filter.featuredOnly ? 1 : 0) + (filter.withPhotos ? 1 : 0)}>
                <Check label="Featured only" checked={filter.featuredOnly} onChange={() => filter.setFeaturedOnly((v) => !v)} />
                <Check label="With photos only" checked={filter.withPhotos} onChange={() => filter.setWithPhotos((v) => !v)} />
              </Section>
            </motion.div>

            <div className="h-6" />
          </div>

          {!collapsed && hasActiveFilters && (
            <motion.div
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              custom={23}
              className="px-4 py-3 border-t border-black/8 dark:border-white/8 flex-shrink-0 bg-[#f8f8f8] dark:bg-[#0a0a0a]"
            >
              <button
                onClick={filter.resetAll}
                className="group/reset w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#B23A2E]/40 bg-[#B23A2E]/8 text-[#B23A2E] dark:text-[#E2795F] font-ticket-body text-[11px] font-bold hover:bg-[#B23A2E]/15 transition-colors"
              >
                <FaTimes className="text-[10px] transition-transform group-hover/reset:rotate-90" />
                Clear {totalActiveFilters} filter{totalActiveFilters > 1 ? 's' : ''}
              </button>
            </motion.div>
          )}
        </motion.div>
      </aside>

      <main className="flex-1 min-h-[calc(100vh-5rem)] relative z-10">
        {children}
      </main>
    </div>
  );
};

function listingsTotalFromCounts(counts) {
  const topLevel = ["Vehicles", "Bikes", "Mobiles", "Property", "Electronics", "Toys"];
  return topLevel.reduce((sum, k) => sum + (counts[k] || 0), 0);
}

export default SidebarLayout;