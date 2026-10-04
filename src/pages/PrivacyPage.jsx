// pages/PrivacyPage.jsx — Full editorial Privacy Policy (long-form + Google Maps)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaLock,
  FaCookieBite,
  FaUserShield,
  FaDatabase,
  FaGlobe,
  FaFileAlt,
  FaCheckCircle,
  FaChevronRight,
  FaArrowUp,
  FaPrint,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { motion, useScroll, useSpring } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   GOOGLE MAPS CONFIG
   ═══════════════════════════════════════════════════════════════ */
const OFFICE = {
  name: "Apex Office",
  address: "Bahria Town Phase 4, Islamabad, Pakistan",
  query: "Bahria Town Phase 4, Islamabad, Pakistan",
  lat: null,
  lng: null,
  zoom: 14,
};

const buildMapEmbedUrl = () => {
  const base = "https://maps.google.com/maps";
  const q = encodeURIComponent(OFFICE.query);
  return `${base}?q=${q}&t=&z=${OFFICE.zoom}&ie=UTF8&iwloc=&output=embed`;
};

const buildMapExternalUrl = () => {
  const q = encodeURIComponent(OFFICE.query);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
};

const buildDirectionsUrl = () => {
  const q = encodeURIComponent(OFFICE.query);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
};

/* ═══════════════════════════════════════════════════════════════
   FONTS + THEME TOKENS — black / white / gray only
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .pp-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    /* ═══ DARK THEME ═══ */
    .theme-dark {
      --pp-bg:          #0B0B0B;
      --pp-bg-2:        #121212;
      --pp-panel:       #171717;
      --pp-panel-2:     #1E1E1E;
      --pp-line:        rgba(255,255,255,0.08);
      --pp-line-str:    rgba(255,255,255,0.16);
      --pp-txt:         #FFFFFF;
      --pp-txt-soft:    rgba(255,255,255,0.66);
      --pp-txt-faint:   rgba(255,255,255,0.42);
      --pp-accent:      #FFFFFF;
      --pp-accent-soft: rgba(255,255,255,0.06);
      --pp-accent-txt:  #FFFFFF;
      --pp-divider:     rgba(255,255,255,0.06);
      --pp-badge-bg:    rgba(255,255,255,0.06);
      --pp-badge-bd:    rgba(255,255,255,0.16);
      --pp-map-bg:      #121212;
    }

    /* ═══ LIGHT THEME ═══ */
    .theme-light {
      --pp-bg:          #FFFFFF;
      --pp-bg-2:        #FAFAFA;
      --pp-panel:       #FFFFFF;
      --pp-panel-2:     #F4F4F5;
      --pp-line:        rgba(0,0,0,0.08);
      --pp-line-str:    rgba(0,0,0,0.16);
      --pp-txt:         #0B0B0B;
      --pp-txt-soft:    rgba(11,11,11,0.66);
      --pp-txt-faint:   rgba(11,11,11,0.42);
      --pp-accent:      #0B0B0B;
      --pp-accent-soft: rgba(0,0,0,0.04);
      --pp-accent-txt:  #0B0B0B;
      --pp-divider:     rgba(0,0,0,0.06);
      --pp-badge-bg:    rgba(0,0,0,0.04);
      --pp-badge-bd:    rgba(0,0,0,0.14);
      --pp-map-bg:      #F4F4F5;
    }

    .pp-bg {
      background: var(--pp-bg);
      color: var(--pp-txt);
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* ═══ BODY TYPOGRAPHY — editorial & dense ═══ */
    .pp-body {
      color: var(--pp-txt-soft);
      line-height: 1.75;
      font-size: 14.5px;
    }
    .pp-body p { margin-bottom: 14px; }
    .pp-body p + p { margin-top: 0; }
    .pp-body a {
      color: var(--pp-txt);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-thickness: 1px;
      font-weight: 600;
      transition: opacity 0.15s ease;
    }
    .pp-body a:hover { opacity: 0.7; }
    .pp-body strong { color: var(--pp-txt); font-weight: 700; }

    /* Numbered + bulleted lists */
    .pp-body ol {
      list-style-type: decimal;
      padding-left: 22px;
      margin-bottom: 16px;
    }
    .pp-body ol li {
      margin-bottom: 6px;
      padding-left: 4px;
    }
    .pp-body ul {
      list-style-type: disc;
      padding-left: 22px;
      margin-bottom: 16px;
    }
    .pp-body ul li {
      margin-bottom: 6px;
      padding-left: 2px;
    }

    /* ═══ LAYOUT ═══ */
    .pp-shell {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding-left: max(16px, env(safe-area-inset-left, 16px));
      padding-right: max(16px, env(safe-area-inset-right, 16px));
    }

    .pp-topbar {
      backdrop-filter: saturate(140%) blur(12px);
      -webkit-backdrop-filter: saturate(140%) blur(12px);
    }
    .theme-dark .pp-topbar { background: rgba(11,11,11,0.86); }
    .theme-light .pp-topbar { background: rgba(255,255,255,0.86); }

    /* ═══ SIDEBAR TOC ═══ */
    .pp-toc-link {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--pp-txt-faint);
      text-decoration: none;
      transition: all 0.18s ease;
      line-height: 1.4;
    }
    .pp-toc-link:hover { color: var(--pp-txt); background: var(--pp-accent-soft); }
    .pp-toc-link.pp-toc-active { color: var(--pp-txt); background: var(--pp-accent-soft); font-weight: 600; }
    .pp-toc-num {
      flex-shrink: 0;
      font-size: 10.5px;
      font-weight: 700;
      opacity: 0.5;
      margin-top: 2px;
      min-width: 16px;
      font-variant-numeric: tabular-nums;
    }

    /* ═══ SECTION ROW ═══ */
    .pp-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 32px 0;
      border-top: 1px solid var(--pp-divider);
    }
    @media (min-width: 900px) {
      .pp-row {
        grid-template-columns: 220px 1fr;
        gap: 48px;
        padding: 40px 0;
      }
    }

    .pp-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--pp-txt-faint);
    }

    .pp-h2 {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: 1.25;
      color: var(--pp-txt);
      margin-top: 6px;
    }

    /* ⭐ Editorial H3 for subsections inside long content */
    .pp-h3 {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--pp-txt);
      margin-top: 26px;
      margin-bottom: 10px;
    }

    .pp-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      background: var(--pp-badge-bg);
      color: var(--pp-txt-soft);
      border: 1px solid var(--pp-badge-bd);
      font-variant-numeric: tabular-nums;
    }

    .pp-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--pp-txt-faint);
      text-decoration: none;
      transition: color 0.2s ease, gap 0.2s ease;
    }
    .pp-back:hover { color: var(--pp-txt); gap: 10px; }
    .pp-back-arrow { transition: transform 0.2s ease; }
    .pp-back:hover .pp-back-arrow { transform: translateX(-2px); }

    /* ═══════════════════════════════════════════════════════════════
       ⭐ GOOGLE MAPS VIEW
       ═══════════════════════════════════════════════════════════════ */
    .pp-map-card {
      position: relative;
      width: 100%;
      border-radius: 14px;
      overflow: hidden;
      background: var(--pp-map-bg);
      border: 1px solid var(--pp-line);
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    .pp-map-frame {
      position: relative;
      width: 100%;
      height: 340px;
    }
    @media (min-width: 640px) {
      .pp-map-frame { height: 420px; }
    }
    @media (min-width: 900px) {
      .pp-map-frame { height: 480px; }
    }

    .pp-map-frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      filter: saturate(0.9);
    }
    .theme-dark .pp-map-frame iframe {
      filter: saturate(0.7) brightness(0.92);
    }

    .pp-map-overlay {
      position: absolute;
      top: 14px;
      left: 14px;
      right: 14px;
      z-index: 5;
      background: var(--pp-panel);
      border: 1px solid var(--pp-line);
      border-radius: 12px;
      padding: 12px 14px;
      backdrop-filter: saturate(160%) blur(14px);
      -webkit-backdrop-filter: saturate(160%) blur(14px);
      box-shadow: 0 10px 24px -12px rgba(0,0,0,0.35);
      pointer-events: auto;
      max-width: 380px;
    }
    @media (min-width: 640px) {
      .pp-map-overlay { top: 18px; left: 18px; right: auto; padding: 14px 16px; }
    }

    .pp-map-overlay-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .pp-map-pin-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--pp-panel-2);
      border: 1px solid var(--pp-line);
      color: var(--pp-txt);
    }

    .pp-map-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .pp-map-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      background: var(--pp-panel-2);
      border: 1px solid var(--pp-line);
      color: var(--pp-txt);
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .pp-map-action:hover {
      border-color: var(--pp-line-str);
      transform: translateY(-1px);
    }
    .pp-map-action svg { font-size: 9px; opacity: 0.7; }

    .pp-map-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 4;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 6px;
      background: var(--pp-panel);
      border: 1px solid var(--pp-line);
      font-size: 10px;
      font-weight: 600;
      color: var(--pp-txt-soft);
      letter-spacing: 0.02em;
      text-decoration: none;
      backdrop-filter: saturate(160%) blur(10px);
      -webkit-backdrop-filter: saturate(160%) blur(10px);
    }
    .pp-map-badge:hover { color: var(--pp-txt); border-color: var(--pp-line-str); }

    /* ═══════════════════════════════════════════════════════════════
       ⭐ LONG-FORM EDITORIAL CONTENT BLOCK
       ═══════════════════════════════════════════════════════════════ */
    .pp-editorial {
      color: var(--pp-txt-soft);
      line-height: 1.75;
      font-size: 14.5px;
    }
    .pp-editorial p { margin-bottom: 14px; }
    .pp-editorial strong { color: var(--pp-txt); font-weight: 700; }
    .pp-editorial ol {
      list-style: decimal;
      padding-left: 22px;
      margin-bottom: 16px;
    }
    .pp-editorial ol li { margin-bottom: 6px; padding-left: 4px; }
    .pp-editorial ul {
      list-style: disc;
      padding-left: 22px;
      margin-bottom: 16px;
    }
    .pp-editorial ul li { margin-bottom: 6px; }

    @media print {
      .pp-no-print { display: none !important; }
      .pp-bg { background: #fff !important; color: #000 !important; }
      .pp-row { padding: 16px 0; }
      .pp-map-frame { height: 260px; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   SECTIONS DATA (TOC)
   ═══════════════════════════════════════════════════════════════ */
const PRIVACY_SECTIONS = [
  { id: "introduction",       num: "01", label: "Introduction",                   icon: FaFileAlt,     short: "Introduction" },
  { id: "information-collect", num: "02", label: "Information That We Collect",   icon: FaDatabase,    short: "Information We Collect" },
  { id: "purpose",            num: "03", label: "Purpose of Collection",          icon: FaUserShield,  short: "Purpose of Collection" },
  { id: "principles",         num: "04", label: "Principles of Processing",       icon: FaShieldAlt,   short: "Principles of Processing" },
  { id: "disclosures",        num: "05", label: "Disclosures",                    icon: FaGlobe,       short: "Disclosures" },
  { id: "protection",         num: "06", label: "How We Protect Information",     icon: FaLock,        short: "How We Protect Information" },
  { id: "third-party-access", num: "07", label: "Access to Third-Party",          icon: FaUserShield,  short: "Access to Third-Party" },
  { id: "cookies",            num: "08", label: "Cookies & Web Beacons",          icon: FaCookieBite,  short: "Cookies" },
  { id: "contact",            num: "09", label: "Contact",                        icon: FaEnvelope,    short: "Contact" },
];

/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left pointer-events-none pp-no-print"
      style={{ scaleX, background: "var(--pp-txt)", opacity: 0.6 }}
      aria-hidden="true"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   BACK-TO-TOP
   ═══════════════════════════════════════════════════════════════ */
const BackToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.85, y: show ? 0 : 20 }}
      transition={{ duration: 0.22 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-[150] h-10 w-10 rounded-full flex items-center justify-center pp-no-print"
      style={{
        background: "var(--pp-txt)",
        color: "var(--pp-bg)",
        boxShadow: "0 8px 22px -8px rgba(0,0,0,0.4)",
        pointerEvents: show ? "auto" : "none",
      }}
      aria-label="Back to top"
    >
      <FaArrowUp className="text-[12px]" />
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CONTACT CARD
   ═══════════════════════════════════════════════════════════════ */
const ContactCard = ({ icon: Icon, label, value, sub, href, action, copyText, index = 0 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-xl p-5 flex flex-col"
      style={{ background: "var(--pp-panel)", border: "1px solid var(--pp-line)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--pp-panel-2)", border: "1px solid var(--pp-line)", color: "var(--pp-txt)" }}
        >
          <Icon className="text-[13px]" />
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md transition-all"
          style={{
            background: "var(--pp-panel-2)",
            border: "1px solid var(--pp-line)",
            color: copied ? "var(--pp-txt)" : "var(--pp-txt-faint)",
          }}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <FaCheckCircle className="text-[10px]" />
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "var(--pp-txt-faint)" }}>
        {label}
      </p>
      <p className="text-[14.5px] font-semibold leading-tight mb-1 break-words" style={{ color: "var(--pp-txt)" }}>
        {value}
      </p>
      <p className="text-[12px] leading-snug mb-4 flex-1" style={{ color: "var(--pp-txt-soft)" }}>
        {sub}
      </p>

      {href && (
        <a href={href} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold self-start" style={{ color: "var(--pp-txt)" }}>
          {action}
          <FaChevronRight className="text-[9px]" />
        </a>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ GOOGLE MAP VIEW
   ═══════════════════════════════════════════════════════════════ */
const MapView = () => {
  const embedUrl = buildMapEmbedUrl();
  const externalUrl = buildMapExternalUrl();
  const directionsUrl = buildDirectionsUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="pp-map-card"
    >
      <div className="pp-map-frame">
        <iframe
          title={`${OFFICE.name} — Google Maps`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        <div className="pp-map-overlay">
          <div className="pp-map-overlay-row">
            <div className="pp-map-pin-icon">
              <FaMapMarkerAlt className="text-[12px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "var(--pp-txt-faint)" }}>
                Our Office
              </p>
              <p className="text-[13.5px] font-semibold leading-tight mb-0.5" style={{ color: "var(--pp-txt)" }}>
                {OFFICE.name}
              </p>
              <p className="text-[12px] leading-snug" style={{ color: "var(--pp-txt-soft)" }}>
                {OFFICE.address}
              </p>
            </div>
          </div>

          <div className="pp-map-actions">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="pp-map-action">
              <FaMapMarkerAlt /> Get directions
            </a>
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="pp-map-action">
              <FaExternalLinkAlt /> Open in Maps
            </a>
          </div>
        </div>

        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="pp-map-badge">
          Google Maps
        </a>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PRIVACY PAGE
   ═══════════════════════════════════════════════════════════════ */
const PrivacyPage = () => {
  const lastUpdated = "October 24, 2026";
  const [activeId, setActiveId] = useState(PRIVACY_SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.scrollY + 160;
      let current = PRIVACY_SECTIONS[0].id;
      for (const s of PRIVACY_SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= scrollPos) current = s.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePrint = () => window.print();

  const CONTACT_CARDS = [
    {
      icon: FaEnvelope,
      label: "Email",
      value: "privacy@apexdeal.pk",
      sub: "Best for detailed questions",
      href: "mailto:privacy@apexdeal.pk",
      action: "Send email",
      copyText: "privacy@apexdeal.pk",
    },
    {
      icon: FaPhone,
      label: "Phone",
      value: "+92 (314) 0972575",
      sub: "Mon–Sat · 9 AM – 8 PM PKT",
      href: "tel:+923140972575",
      action: "Call now",
      copyText: "+923140972575",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Office",
      value: "Islamabad, Bahria Town",
      sub: "Bahria Town Phase 4, Pakistan",
      href: null,
      action: null,
      copyText: "Islamabad, Bahria Town, Pakistan",
    },
  ];

  const SOCIALS = [
    { Icon: FaTwitter, href: "#", label: "Twitter" },
    { Icon: FaFacebook, href: "#", label: "Facebook" },
    { Icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { Icon: FaInstagram, href: "#", label: "Instagram" },
    { Icon: FaTiktok, href: "#", label: "TikTok" },
    { Icon: FaYoutube, href: "#", label: "YouTube" },
  ];

  return (
    <>
      <FontStyles />
      <ScrollProgressBar />

      <div className="min-h-screen pp-bg pp-font relative">
        {/* ═══ STICKY TOP BAR ═══ */}
        <header className="pp-topbar sticky top-0 z-40 border-b pp-no-print" style={{ borderColor: "var(--pp-line)" }}>
          <div className="pp-shell flex items-center justify-between gap-4 py-3">
            <Link to="/" className="pp-back" aria-label="Back to Home">
              <FaArrowLeft className="pp-back-arrow text-[10px]" />
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                style={{ color: "var(--pp-txt-soft)", background: "var(--pp-panel-2)", border: "1px solid var(--pp-line)" }}
                aria-label="Print this page"
              >
                <FaPrint className="text-[9px]" />
                Print
              </button>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold"
                style={{ background: "var(--pp-panel-2)", color: "var(--pp-txt-soft)", border: "1px solid var(--pp-line)" }}
              >
                <FaShieldAlt className="text-[9px]" />
                Privacy
              </span>
            </div>
          </div>
        </header>

        {/* ═══ HEADER ═══ */}
        <section className="pp-shell pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="pp-label">Legal</span>
              <span style={{ color: "var(--pp-txt-faint)" }}>·</span>
              <span className="pp-label">Apex</span>
            </div>

            <h1
              className="font-bold leading-tight mb-4"
              style={{ fontSize: "clamp(26px, 4vw, 36px)", letterSpacing: "-0.02em", color: "var(--pp-txt)" }}
            >
              Privacy Policy
            </h1>

            <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: "var(--pp-txt-soft)" }}>
              At Apex, one of our main priorities is the privacy of our visitors. This
              Privacy Policy document explains the types of information we collect, how
              we use it, and the rights you have over your data.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[11.5px] font-medium"
                style={{ background: "var(--pp-panel-2)", color: "var(--pp-txt-soft)", border: "1px solid var(--pp-line)" }}
              >
                Last updated: {lastUpdated}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: "var(--pp-txt-faint)" }}>
                <FaCheckCircle className="text-[10px]" />
                GDPR &amp; CCPA aware
              </span>

              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: "var(--pp-txt-faint)" }}>
                <FaCheckCircle className="text-[10px]" />
                {PRIVACY_SECTIONS.length} sections
              </span>
            </div>
          </div>
        </section>

        {/* ═══ MAIN CONTENT ═══ */}
        <section className="pp-shell pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
            {/* ─── SIDEBAR TOC ─── */}
            <aside className="hidden lg:block pp-no-print">
              <div className="sticky top-24">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] mb-3" style={{ color: "var(--pp-txt-faint)" }}>
                  On this page
                </p>
                <nav className="space-y-0.5">
                  {PRIVACY_SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`pp-toc-link ${activeId === s.id ? "pp-toc-active" : ""}`}
                    >
                      <span className="pp-toc-num">{s.num}</span>
                      <span>{s.short}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-6 p-4 rounded-xl" style={{ background: "var(--pp-panel)", border: "1px solid var(--pp-line)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--pp-txt-faint)" }}>
                    Privacy questions?
                  </p>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--pp-txt-soft)" }}>
                    We're here to help. Reach out anytime.
                  </p>
                  <a href="mailto:privacy@apexdeal.pk" className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--pp-txt)" }}>
                    <FaEnvelope className="text-[10px]" />
                    privacy@apexdeal.pk
                  </a>
                </div>
              </div>
            </aside>

            {/* ─── MAIN SECTIONS ─── */}
            <div className="min-w-0">

              {/* ═══ 01 · INTRODUCTION ═══ */}
              <motion.section
                id="introduction"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileAlt className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">01</span>
                  </div>
                  <h2 className="pp-h2">Introduction</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    We, <strong>Apex</strong> (hereinafter referred to as the "Company", "our", "us", or "we"),
                    through our website available at <strong>www.apexdeal.pk</strong> (the "Website") and
                    associated mobile device application (the "App"), provide certain services, including
                    content or information, in the genre of e-commerce and marketplace (hereinafter referred
                    to as the "user", "you", "end-user"). For the ease of reading, (i) the Website and the
                    App shall collectively be called the "Site", owned and managed by the Company, and (ii)
                    making available the Site, including any content or information provided as part of the
                    Site, shall collectively be called as our "Services".
                  </p>

                  <p>
                    This Privacy Policy applies to all who access, register for, or use our Services and
                    does not apply to the practices of companies or third-party entities that we do not own
                    or control, or to individuals that we do not employ or manage.
                  </p>

                  <p>
                    This Privacy Policy explains (a) the types of information that we may collect and (b)
                    our practices and procedures on the collection, use, processing, storage, transfer, and
                    disclosure of such information that you consequentially provide us when you access,
                    register for, or use our Services.
                  </p>

                  <p>
                    <strong>"Non-Personal Information"</strong> refers to any non-personal information
                    collected from users pursuant to their use of the Services, including but not limited
                    to the browser name, the type of computer and technical information about users, means
                    of connection to the Services such as the operating system, the internet service
                    providers utilized and other similar information.
                  </p>

                  <p>
                    <strong>"Personal Information"</strong> refers to any information that identifies or
                    can be used to identify, contact or locate the person, to whom such information
                    pertains to including, but not limited to when users register, conclude a transaction,
                    respond to a survey, fill out a form, and anything else in connection with the Services.
                  </p>

                  <p>
                    <strong>Sensitive Personal Data or Information ("SPDI")</strong> includes information
                    relating to the following:
                  </p>

                  <ol>
                    <li>current education status, including details of your college, university and year of study;</li>
                    <li>if employed/self-employed, details of the company/college/university that you work with;</li>
                    <li>financial information such as bank account or credit card or debit card or other payment instrument details, only for the purpose of subscribing to the services;</li>
                    <li>any detail relating to the above sub-clauses or any other sensitive personal data or information as provided to us for providing the Services; and</li>
                    <li>any of the information received under above sub-clauses by us under lawful contract or otherwise.</li>
                  </ol>

                  <p>
                    Personal Information, Non-Personal Information, and Sensitive Personal Data or any other
                    information shall collectively be referred to as the <strong>'Information'</strong>. By
                    accessing, registering for our Services, you agree to the terms and conditions of this
                    Privacy Policy. You also expressly consent to our collection, processing, use, and/or
                    disclosure of your Information in such manner as described in this Privacy Policy, and
                    further signify your assent to this Privacy Policy and Terms of Services (being
                    incorporated by reference herein), and any other terms and conditions for accessing and
                    using the Services, as may be issued and notified by us from time to time.
                  </p>

                  <p>
                    <strong>'Third-Party'</strong> refers to any person or entity other than you or us.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 02 · INFORMATION THAT WE COLLECT ═══ */}
              <motion.section
                id="information-collect"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaDatabase className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">02</span>
                  </div>
                  <h2 className="pp-h2">Information That We Collect</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    For the purpose of creation of a user account ("User Account") to use the Services,
                    users may be required to disclose certain Personal Information including but not
                    limited to name, e-mails, gender, date of birth, college/university, year of study,
                    city location, personal contact details and certain personal information about your
                    bank account details or any related information.
                  </p>

                  <p>
                    You may also register for a User Account using your existing Google account, social
                    media account (such as Facebook and Instagram, as applicable; upcoming feature), and
                    log-in credentials (your "Third-Party Site Accounts"). As part of the functionality
                    of the Services, you may link your User Account with Third Party Site Accounts, by
                    either: (i) providing your Third Party Site Account login information to us through
                    the Services; or (ii) allowing us to access your Third Party Site Account, as is
                    permitted under the applicable terms and conditions that govern your use of each
                    Third Party Site Account. In the event you are registering for a User Account using
                    your Third Party Site Account, you represent that you are entitled to disclose your
                    Third Party Site Account login information to us and/or grant us access to your
                    Third Party Site Account (including, but not limited to, for the purposes described
                    herein), without breach by you of any of the terms and conditions that govern your
                    use of the applicable Third-Party Site Account and without obligating us to pay any
                    fees or making us subject to any usage limitations imposed by the applicable
                    Third-Party Site Account service provider.
                  </p>

                  <p>
                    We may also collect certain Personal Information that our users provide such as inter
                    alia e-mail addresses of users who communicate with us via e-mails and their
                    locations including the IP addresses.
                  </p>

                  <p>
                    If you access the features of the Site, we may still gather and store certain
                    Non-Personal Information about your visit. This information does not identify you
                    personally and cannot be linked back to you unless you decide to identify yourself.
                    We may collect the following Non-Personal Information: the type of browser and
                    operating system used to access our Site, the date and time you accessed our Site and
                    if you were linked to our Site from another website, the address of that website, as
                    well as additional information related to your visit may be collected.
                  </p>

                  <p>
                    We collect SPDI only voluntarily and knowingly provided by our users. In order to
                    assess and customize user experience, we may collect other information from our users
                    as our Services are further developed. You can choose not to provide us with certain
                    information, but then you may not be able to take advantage of some of our features.
                  </p>

                  <p>
                    Users may also be required to make a digital or offline payment to subscribe to our
                    Services, as per our policies. In order to collect the subscription fee from our users
                    to access and use the premium Services, either we may directly collect debit/credit
                    card information or other sensitive financial information or our authorized
                    third-party payment processors may assist us in processing your payment information
                    securely. We undertake to protect the SPDI provided by you in accordance with
                    reasonable security practices and procedures and undertake not to transfer or disclose
                    your SPDI to a Third Party for any purpose not authorized in this Privacy Policy
                    without your prior consent. However, Third-party processors' use of your information
                    is governed by their respective privacy policies which may or may not contain privacy
                    protections as protective as this Privacy Policy and we suggest that you review their
                    respective privacy policies.
                  </p>

                  <p>
                    The type of Information collected from a user may vary based on the interaction with
                    the Site and preferred use of the Services.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 03 · PURPOSE OF COLLECTION ═══ */}
              <motion.section
                id="purpose"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUserShield className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">03</span>
                  </div>
                  <h2 className="pp-h2">Purpose of Collection</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    We collect and use the Information to deliver the Services, to identify and
                    troubleshoot problems with the Services, and to improve the Services.
                  </p>

                  <p>
                    We make all efforts to ensure that we collect only such Information that we believe
                    to be relevant in order to support and facilitate provision of Services, including
                    but not limited to:
                  </p>

                  <ol>
                    <li>Process and respond to the users queries;</li>
                    <li>Understand the user requirements;</li>
                    <li>Diagnose technical glitches;</li>
                    <li>Provide users with customer support;</li>
                    <li>Allow users to access or participate in interactive features offered through the Services and send them related information, including confirmations and reminders;</li>
                    <li>In any other way that the Company specifies at the time of seeking information from the users;</li>
                    <li>For processing of statistics for advertising, affiliate marketing, analytics;</li>
                    <li>We may periodically send emails (including marketing emails) about upgrades to our existing products and services, our other similar products and services, special offers or other information which we reasonably believe you may find relevant and interesting using the email address which you have provided. You may choose to opt out of receiving promotional emails via the "Unsubscribe" link in every such promotional email communication. Once you unsubscribe, we will no longer send you promotional/marketing emails however you will continue to receive servicing and transactional emails;</li>
                    <li>To investigate fraud or abuse;</li>
                    <li>For any other purpose with the user's prior consent.</li>
                  </ol>
                </div>
              </motion.section>

              {/* ═══ 04 · PRINCIPLES OF PROCESSING ═══ */}
              <motion.section
                id="principles"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaShieldAlt className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">04</span>
                  </div>
                  <h2 className="pp-h2">Principles of Processing</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    We will not process Information in a way that is incompatible with the purposes for
                    which it has been collected or subsequently authorized by you or collect any
                    Information that is not needed for the mentioned purposes. For any new purpose, we
                    will ask your separate explicit consent. To the extent necessary for those purposes,
                    we will take all reasonable steps to ensure that Information is reliable for its
                    intended use, accurate, complete, and current. We also undertake to collect only
                    such Information that is strictly needed for the mentioned purposes.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 05 · DISCLOSURES ═══ */}
              <motion.section
                id="disclosures"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaGlobe className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">05</span>
                  </div>
                  <h2 className="pp-h2">Disclosures</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    We may disclose Information when we respond to valid legal processes. In the event
                    we are required to respond to subpoenas, court orders or other legal process, your
                    Information may be disclosed pursuant to such subpoena, court order or legal process,
                    which may be without notice to you. We may also disclose Information when
                    reasonably necessary to preserve our legal rights.
                  </p>

                  <p>
                    We share Information with companies that provide Services on our behalf, such as
                    website hosting, data storage, software services, email services, marketing,
                    fulfilling customer orders, providing payment related services including payment
                    aggregation, data analytics, data mining, providing customer services, and
                    conducting surveys, as permitted by applicable law. These companies may be located
                    within or outside Pakistan, but in any case, are obligated to protect your data. We
                    may also share information with employees, data processors, consultants, business
                    partners and technology partners on a need to know basis. Such entities would be
                    contractually obligated to maintain confidentiality in relation to your Information.
                  </p>

                  <p>
                    We may disclose or transfer some of your Information to Company group entities,
                    affiliates, associates, subsidiary, holding company of the Company, associates and
                    subsidiary of holding company of the Company including foreign entities, and in
                    particular group companies and affiliates who are involved in the provision of
                    Services, to the extent permitted by applicable law.
                  </p>

                  <p>
                    In the event of a merger, reorganization, acquisition, joint venture, assignment,
                    spin-off, transfer, asset sale, or sale or disposition of all or any portion of our
                    business, including in connection with any bankruptcy or similar proceedings, we may
                    transfer any and all personal information to the relevant third party with the same
                    rights of access and use.
                  </p>

                  <p>
                    We may disclose Information to any Third Party if necessary to provide or improve our
                    Services, fulfill any lawful contractual obligation we are bound by, and any other
                    activity related to the purposes identified in this Privacy Policy and the terms and
                    conditions you agree to when you use our Services.
                  </p>

                  <p>
                    Anonymized, aggregated data may be shared with advertisers, research firms and other
                    partners.
                  </p>

                  <p>
                    Any Personal Information or SPDI you share in any online community area or online
                    discussion is by design open to other users of the Services. You should think
                    carefully before posting any Personal Information or SPDI in any public forum. What
                    you post can be seen, disclosed to, or collected by Third-Parties and may be used by
                    others in ways we cannot control or predict, including to contact you for
                    unauthorized purposes. If you mistakenly post Personal Information or SPDI in our
                    community areas and would like it removed, you can send us an email as listed below
                    to request that we remove it.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 06 · HOW WE PROTECT INFORMATION ═══ */}
              <motion.section
                id="protection"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaLock className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">06</span>
                  </div>
                  <h2 className="pp-h2">How We Protect Information</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    We maintain appropriate administrative, technical, and physical safeguards to
                    protect your Information from accidental, unlawful, or unauthorized destruction,
                    loss, alteration, access, disclosure, or use and other unlawful forms of processing.
                    For when we collect debit card, credit card or other sensitive payment details, we
                    will ensure compliance with the payment card industry standard (PCI standard) and
                    also use SSL secured communication channels, encryption, passwords and physical
                    security measures in order to protect the financial information of users.
                  </p>

                  <p>
                    However, we cannot guarantee absolute security as no method of protection and
                    transmission of Information is completely secure. We are also not responsible for
                    any breach of security or for any actions of any Third-Parties that receive your
                    Information. The Services may also be linked to other sites and we are not/shall be
                    not responsible for their privacy policies or practices as it is beyond our control.
                    Notwithstanding anything contained in this Privacy Policy or elsewhere, we shall not
                    be held responsible for any loss, damage or misuse of your Information, if such
                    loss, damage or misuse is attributable to any event that is beyond our reasonable
                    control.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 07 · ACCESS TO THIRD-PARTY ═══ */}
              <motion.section
                id="third-party-access"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaUserShield className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">07</span>
                  </div>
                  <h2 className="pp-h2">Access to Third-Party</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    We do not sell or share your Information to any Third-Party including but not
                    limited to marketing companies, agencies, advertisers or any similar companies in
                    exchange of fees/charges. We do not share or allow any Third-Party to use your
                    Information stored with us, for any other purpose except consented by you or if
                    required under any legal obligation.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 08 · COOKIES & WEB BEACONS ═══ */}
              <motion.section
                id="cookies"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaCookieBite className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">08</span>
                  </div>
                  <h2 className="pp-h2">Cookies &amp; Web Beacons</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    Like any other website, Apex uses <strong>cookies</strong>. These cookies are
                    used to store information including visitors' preferences, and the pages on the
                    website that the visitor accessed or visited.
                  </p>

                  <p>
                    The information is used to optimize the users' experience by customizing our web
                    page content based on visitors' browser type and/or other information. Cookies
                    help us:
                  </p>

                  <ul>
                    <li>Keep you signed in across sessions</li>
                    <li>Remember your search filters and preferences</li>
                    <li>Improve the overall buying and selling experience</li>
                    <li>Detect and prevent fraudulent activity</li>
                  </ul>

                  <p>You can disable cookies through your individual browser options.</p>

                  <h3 className="pp-h3">Third-Party Privacy Policies</h3>
                  <p>
                    Apex's Privacy Policy does not apply to other advertisers or websites. Thus, we
                    are advising you to consult the respective Privacy Policies of these third-party
                    ad servers for more detailed information. It may include their practices and
                    instructions about how to opt-out of certain options.
                  </p>
                  <p>
                    To know more detailed information about cookie management with specific web
                    browsers, it can be found at the browsers' respective websites.
                  </p>
                </div>
              </motion.section>

              {/* ═══ 09 · CONTACT ═══ */}
              <motion.section
                id="contact"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4 }}
                className="pp-row scroll-mt-24"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaEnvelope className="text-[11px]" style={{ color: "var(--pp-txt-faint)" }} />
                    <span className="pp-num">09</span>
                  </div>
                  <h2 className="pp-h2">Contact</h2>
                </div>

                <div className="pp-editorial">
                  <p>
                    If you have additional questions or require more information about our Privacy
                    Policy, do not hesitate to contact us through email or by mail. Our privacy team
                    is available to answer any question you might have about your data, our
                    practices, or anything else. We typically respond within{" "}
                    <strong>24 hours</strong>.
                  </p>

                  <ul>
                    <li><strong>Email:</strong> <a href="mailto:privacy@apexdeal.pk">privacy@apexdeal.pk</a></li>
                    <li><strong>Phone:</strong> <a href="tel:+923140972575">+92 (314) 0972575</a></li>
                    <li><strong>Address:</strong> Pakistan, Islamabad, Bahria Town</li>
                  </ul>
                </div>
              </motion.section>

              {/* ═══ GOOGLE MAPS + CONTACT CARDS ═══ */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mt-12 pt-10"
                style={{ borderTop: "1px solid var(--pp-divider)" }}
              >
                <div className="mb-6 max-w-2xl">
                  <span className="pp-label">Find us</span>
                  <h2
                    className="font-bold leading-tight mt-2 mb-3"
                    style={{ fontSize: "clamp(20px, 3vw, 26px)", letterSpacing: "-0.02em", color: "var(--pp-txt)" }}
                  >
                    Our Office
                  </h2>
                </div>

                {/* ⭐ GOOGLE MAPS */}
                <div className="mb-8">
                  <MapView />
                </div>

                {/* Contact cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CONTACT_CARDS.map((c, i) => (
                    <ContactCard
                      key={i}
                      icon={c.icon}
                      label={c.label}
                      value={c.value}
                      sub={c.sub}
                      href={c.href}
                      action={c.action}
                      copyText={c.copyText}
                      index={i}
                    />
                  ))}
                </div>

                {/* Social row */}
                <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] flex-shrink-0 pt-2"
                    style={{ color: "var(--pp-txt-faint)" }}
                  >
                    Follow Apex
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {SOCIALS.map(({ Icon, href, label }, i) => (
                      <a
                        key={i}
                        href={href}
                        aria-label={label}
                        className="h-9 w-9 rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: "var(--pp-panel-2)",
                          border: "1px solid var(--pp-line)",
                          color: "var(--pp-txt-soft)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--pp-txt)";
                          e.currentTarget.style.borderColor = "var(--pp-line-str)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--pp-txt-soft)";
                          e.currentTarget.style.borderColor = "var(--pp-line)";
                        }}
                      >
                        <Icon className="text-[11px]" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* ═══ FOOTER NOTE ═══ */}
              <p className="mt-10 text-[12.5px] leading-relaxed" style={{ color: "var(--pp-txt-faint)" }}>
                This policy will be updated as Apex evolves. We encourage you to review it
                periodically. Continued use of our services after any changes constitutes acceptance
                of the updated policy.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t py-10" style={{ borderColor: "var(--pp-divider)" }}>
          <div className="pp-shell">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold tracking-tight" style={{ color: "var(--pp-txt)" }}>
                  Apex
                </span>
              </div>

              <div className="flex items-center gap-2">
                {SOCIALS.map(({ Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    aria-label={label}
                    className="h-8 w-8 rounded-md flex items-center justify-center transition-all"
                    style={{ border: "1px solid var(--pp-line)", color: "var(--pp-txt-soft)" }}
                  >
                    <Icon className="text-[10px]" />
                  </a>
                ))}
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 text-[12px]"
              style={{ borderTop: "1px solid var(--pp-divider)", color: "var(--pp-txt-faint)" }}
            >
              <span>© {new Date().getFullYear()} Apex. All rights reserved.</span>
              <div className="flex items-center gap-5 flex-wrap justify-center">
                <Link to="/privacy" style={{ color: "var(--pp-txt)" }} className="font-medium">Privacy</Link>
                <Link to="/terms" className="font-medium hover:text-[var(--pp-txt)]">Terms</Link>
                <Link to="/cookies" className="font-medium hover:text-[var(--pp-txt)]">Cookies</Link>
                <Link to="/contact" className="font-medium hover:text-[var(--pp-txt)]">Contact</Link>
              </div>
            </div>
          </div>
        </footer>

        <BackToTop />
      </div>
    </>
  );
};

export default PrivacyPage;