// pages/PrivacyPage.jsx — Full editorial privacy page with TOC + timeline
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
   FONTS + THEME TOKENS
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ═══ DARK THEME ═══ */
    .theme-dark {
      --pp-bg:          #0A0A12;
      --pp-bg-2:        #0F0F1A;
      --pp-panel:       #13131C;
      --pp-panel-2:     #1A1A24;
      --pp-line:        rgba(255,255,255,0.08);
      --pp-line-str:    rgba(255,255,255,0.14);
      --pp-txt:         #FFFFFF;
      --pp-txt-soft:    rgba(255,255,255,0.68);
      --pp-txt-faint:   rgba(255,255,255,0.42);
      --pp-accent:      #fc9d03;
      --pp-accent-2:    #eb7d34;
      --pp-accent-soft: rgba(252,157,3,0.14);
      --pp-accent-glow: rgba(252,157,3,0.4);
      --pp-accent-txt:  #fc9d03;
      --pp-divider:     rgba(255,255,255,0.06);
      --pp-hero-glow:   rgba(252,157,3,0.22);
    }
    .theme-light {
      --pp-bg:          #FFFFFF;
      --pp-bg-2:        #FDFAF5;
      --pp-panel:       #FFFFFF;
      --pp-panel-2:     #F8F4EC;
      --pp-line:        rgba(20,20,30,0.08);
      --pp-line-str:    rgba(20,20,30,0.14);
      --pp-txt:         #1A1613;
      --pp-txt-soft:    rgba(26,22,19,0.65);
      --pp-txt-faint:   rgba(26,22,19,0.42);
      --pp-accent:      #e08900;
      --pp-accent-2:    #eb7d34;
      --pp-accent-soft: rgba(224,137,0,0.10);
      --pp-accent-glow: rgba(224,137,0,0.35);
      --pp-accent-txt:  #B87B00;
      --pp-divider:     rgba(20,20,30,0.06);
      --pp-hero-glow:   rgba(224,137,0,0.15);
    }

    .pp-bg {
      background: var(--pp-bg);
      color: var(--pp-txt);
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* ═══ BODY TYPOGRAPHY ═══ */
    .pp-body {
      color: var(--pp-txt-soft);
      line-height: 1.8;
      font-size: 15.5px;
    }
    .pp-body p + p { margin-top: 16px; }
    .pp-body a {
      color: var(--pp-accent-txt);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-thickness: 1px;
      font-weight: 600;
      transition: opacity 0.15s ease;
    }
    .pp-body a:hover { opacity: 0.75; }
    .pp-body strong { color: var(--pp-txt); font-weight: 700; }
    .pp-body ul { margin-top: 12px; padding-left: 0; list-style: none; }
    .pp-body ul li {
      position: relative;
      padding-left: 22px;
      margin-bottom: 8px;
    }
    .pp-body ul li::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 10px;
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: var(--pp-accent);
    }

    /* ═══ LAYOUT ═══ */
    .pp-shell {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding-left: max(16px, env(safe-area-inset-left, 16px));
      padding-right: max(16px, env(safe-area-inset-right, 16px));
    }

    .pp-topbar {
      background: var(--pp-bg);
      transition: background 0.3s ease;
    }
    .theme-dark .pp-topbar { background: rgba(10,10,18,0.88); }
    .theme-light .pp-topbar { background: rgba(255,255,255,0.88); }
    .pp-topbar {
      backdrop-filter: saturate(140%) blur(14px);
      -webkit-backdrop-filter: saturate(140%) blur(14px);
    }

    /* ═══ SIDEBAR TOC ═══ */
    .pp-toc-link {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--pp-txt-faint);
      text-decoration: none;
      transition: all 0.2s ease;
      line-height: 1.4;
    }
    .pp-toc-link:hover {
      background: var(--pp-accent-soft);
      color: var(--pp-accent-txt);
    }
    .pp-toc-link.pp-toc-active {
      background: var(--pp-accent-soft);
      color: var(--pp-accent-txt);
    }
    .pp-toc-num {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 800;
      opacity: 0.55;
      margin-top: 2px;
      min-width: 16px;
    }

    /* ═══ SECTION ROW ═══ */
    .pp-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 40px 0;
      border-top: 1px solid var(--pp-divider);
    }
    @media (min-width: 900px) {
      .pp-row {
        grid-template-columns: 260px 1fr;
        gap: 60px;
        padding: 52px 0;
      }
    }

    .pp-label {
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--pp-accent-txt);
    }

    .pp-h2 {
      font-family: 'Fraunces', Georgia, serif;
      font-size: clamp(22px, 3vw, 32px);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: var(--pp-txt);
      margin-top: 4px;
    }

    .pp-num-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      background: var(--pp-accent-soft);
      color: var(--pp-accent-txt);
      border: 1px solid var(--pp-accent);
      margin-bottom: 12px;
      font-family: 'Manrope', system-ui, sans-serif;
    }

    .pp-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--pp-txt-faint);
      text-decoration: none;
      transition: color 0.2s ease, gap 0.2s ease;
    }
    .pp-back:hover {
      color: var(--pp-accent-txt);
      gap: 10px;
    }
    .pp-back-arrow { transition: transform 0.2s ease; }
    .pp-back:hover .pp-back-arrow { transform: translateX(-2px); }

    @media print {
      .pp-no-print { display: none !important; }
      .pp-bg { background: #fff !important; color: #000 !important; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   SECTIONS DATA
   ═══════════════════════════════════════════════════════════════ */
const PRIVACY_SECTIONS = [
  {
    id: "log-files",
    num: "01",
    label: "Log Files",
    icon: FaFileAlt,
    short: "Log Files",
    content: (
      <>
        <p>
          APNa Deal follows a standard procedure of using log files. These files
          log visitors when they visit our website. All hosting companies do this
          and a part of hosting services' analytics.
        </p>
        <p>
          The information collected by log files includes internet protocol (IP)
          addresses, browser type, Internet Service Provider (ISP), date and time
          stamp, referring/exit pages, and possibly the number of clicks. These
          are <strong>not linked to any information that is personally identifiable</strong>.
        </p>
        <p>
          The purpose of this information is to analyze trends, administer the
          site, track users' movement on the website, and gather demographic
          information for a safer, more reliable marketplace.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    num: "02",
    label: "Cookies & Web Beacons",
    icon: FaCookieBite,
    short: "Cookies",
    content: (
      <>
        <p>
          Like any other website, APNa Deal uses <strong>'cookies'</strong>. These
          cookies are used to store information including visitors' preferences,
          and the pages on the website that the visitor accessed or visited.
        </p>
        <p>
          The information is used to optimize the users' experience by customizing
          our web page content based on visitors' browser type and/or other
          information. Cookies help us:
        </p>
        <ul>
          <li>Keep you signed in across sessions</li>
          <li>Remember your search filters and preferences</li>
          <li>Improve the overall buying and selling experience</li>
          <li>Detect and prevent fraudulent activity</li>
        </ul>
        <p>You can disable cookies through your individual browser options.</p>
      </>
    ),
  },
  {
    id: "privacy-policies",
    num: "03",
    label: "Privacy Policies",
    icon: FaUserShield,
    short: "Privacy Policies",
    content: (
      <>
        <p>
          Third-party ad servers or ad networks use technologies like cookies,
          JavaScript, or Web Beacons that are used in their respective
          advertisements and links that appear on APNa Deal, which are sent
          directly to users' browser.
        </p>
        <p>
          They automatically receive your IP address when this occurs. These
          technologies are used to <strong>measure the effectiveness of their
          advertising campaigns</strong> and/or to personalize the advertising
          content that you see on websites that you visit.
        </p>
        <p>
          Note that APNa Deal has no access to or control over these cookies that
          are used by third-party advertisers.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    num: "04",
    label: "Third Party Policies",
    icon: FaGlobe,
    short: "Third Party",
    content: (
      <>
        <p>
          APNa Deal's Privacy Policy does not apply to other advertisers or
          websites. Thus, we are advising you to consult the respective Privacy
          Policies of these third-party ad servers for more detailed information.
        </p>
        <p>
          It may include their practices and instructions about how to opt-out
          of certain options. You can choose to disable cookies through your
          individual browser options.
        </p>
        <p>
          To know more detailed information about cookie management with specific
          web browsers, it can be found at the browsers' respective websites.
        </p>
      </>
    ),
  },
  {
    id: "account-data",
    num: "05",
    label: "Account & Listing Data",
    icon: FaDatabase,
    short: "Account Data",
    content: (
      <>
        <p>
          When you create an APNa Deal account, we collect your{" "}
          <strong>name, email address, phone number, and profile details</strong>.
        </p>
        <p>
          When you post a listing, we store the{" "}
          <strong>
            title, description, price, images, category-specific specifications,
            and location
          </strong>{" "}
          you provide.
        </p>
        <p>
          This data is used to display your ads to buyers, power search and
          recommendations, and keep your account secure. We{" "}
          <strong>never sell your personal information</strong> to third parties.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    num: "06",
    label: "Data Security",
    icon: FaLock,
    short: "Security",
    content: (
      <>
        <p>
          We use industry-standard <strong>SSL/TLS encryption</strong> for all
          data in transit and <strong>encryption at rest</strong> for sensitive
          data stored on our servers.
        </p>
        <p>
          Access to your data is strictly controlled and limited to authorized
          personnel. We conduct regular security audits and follow best practices
          for secure software development.
        </p>
        <p>
          While we take strong measures to protect your information, no method of
          transmission over the Internet is 100% secure. We encourage you to use
          a strong password and enable account verification.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    num: "07",
    label: "Your Rights",
    icon: FaShieldAlt,
    short: "Your Rights",
    content: (
      <>
        <p>
          You have the right to <strong>access</strong>, <strong>correct</strong>,{" "}
          <strong>delete</strong>, and <strong>export</strong> your personal data
          at any time from your account settings.
        </p>
        <p>
          If you'd like to request a full copy of your data, delete your account,
          or ask a privacy-related question, email us at{" "}
          <a href="mailto:privacy@apnadeal.com">privacy@apnadeal.com</a>.
        </p>
        <p>
          We aim to respond to all privacy-related requests within{" "}
          <strong>30 days</strong>.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    num: "08",
    label: "Contact",
    icon: FaEnvelope,
    short: "Contact",
    content: (
      <>
        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us through email or by mail.
        </p>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@apnadeal.com">privacy@apnadeal.com</a>
          </li>
          <li>
            <strong>Phone:</strong>{" "}
            <a href="tel:+923140972575">+92 (314) 0972575</a>
          </li>
          <li>
            <strong>Address:</strong> Pakistan, Islamabad, Bahria Town
          </li>
        </ul>
      </>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[200] origin-left pointer-events-none pp-no-print"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--pp-accent) 0%, var(--pp-accent-2) 100%)",
        boxShadow: "0 0 20px var(--pp-accent-glow)",
      }}
      aria-hidden="true"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   BACK-TO-TOP BUTTON
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
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8, y: show ? 0 : 20 }}
      transition={{ duration: 0.25 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-[150] h-11 w-11 rounded-full flex items-center justify-center pp-no-print"
      style={{
        background: "var(--pp-accent)",
        color: "#0A0A12",
        boxShadow: "0 12px 28px -8px var(--pp-accent-glow)",
        pointerEvents: show ? "auto" : "none",
      }}
      aria-label="Back to top"
    >
      <FaArrowUp className="text-[13px]" />
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ CONTACT CARD — Isolated component (hooks at top level)
   ═══════════════════════════════════════════════════════════════ */
const ContactCard = ({
  icon: Icon,
  label,
  value,
  sub,
  href,
  action,
  copyText,
  index = 0,
}) => {
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl p-5 sm:p-6 flex flex-col overflow-hidden"
      style={{
        background: "var(--pp-accent-soft)",
        border: "1px solid var(--pp-line)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--pp-accent)";
        e.currentTarget.style.boxShadow =
          "0 20px 40px -20px var(--pp-accent-glow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--pp-line)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Ambient corner glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: "var(--pp-accent)" }}
        aria-hidden="true"
      />

      {/* Icon + copy row */}
      <div className="relative flex items-start justify-between gap-3 mb-5">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--pp-accent) 0%, var(--pp-accent-2) 100%)",
            boxShadow: "0 10px 24px -8px var(--pp-accent-glow)",
          }}
        >
          <Icon className="text-[15px]" style={{ color: "#0A0A12" }} />
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg transition-all"
          style={{
            background: "var(--pp-panel)",
            border: "1px solid var(--pp-line)",
            color: copied ? "var(--pp-accent-txt)" : "var(--pp-txt-faint)",
          }}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <FaCheckCircle className="text-[11px]" />
          ) : (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      {/* Label */}
      <p
        className="relative text-[10.5px] font-bold uppercase tracking-[0.16em] mb-2"
        style={{ color: "var(--pp-txt-faint)" }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="relative text-[15px] font-bold leading-tight mb-1.5 break-words"
        style={{ color: "var(--pp-txt)" }}
      >
        {value}
      </p>

      {/* Sub */}
      <p
        className="relative text-[12px] leading-snug mb-5 flex-1"
        style={{ color: "var(--pp-txt-soft)" }}
      >
        {sub}
      </p>

      {/* Action link */}
      {href && (
        <a
          href={href}
          className="relative inline-flex items-center gap-1.5 text-[12.5px] font-bold self-start transition-all group-hover:gap-2.5"
          style={{ color: "var(--pp-accent-txt)" }}
        >
          {action}
          <FaChevronRight className="text-[9px] transition-transform group-hover:translate-x-0.5" />
        </a>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PRIVACY PAGE
   ═══════════════════════════════════════════════════════════════ */
const PrivacyPage = () => {
  const lastUpdated = "September 1, 2026";
  const [activeId, setActiveId] = useState(PRIVACY_SECTIONS[0].id);

  /* ── Scroll spy: highlight active TOC item ── */
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
      value: "privacy@apnadeal.com",
      sub: "Best for detailed questions",
      href: "mailto:privacy@apnadeal.com",
      action: "Send email",
      copyText: "privacy@apnadeal.com",
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

  const QUICK_ACTIONS = [
    { label: "WhatsApp", href: "https://wa.me/923140972575" },
    { label: "Live Chat", href: "#" },
    { label: "Help Center", href: "/faq" },
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

      <div className="min-h-screen pp-bg font-ticket-body relative">
        {/* ═══ STICKY TOP BAR ═══ */}
        <header
          className="pp-topbar sticky top-0 z-40 border-b pp-no-print"
          style={{ borderColor: "var(--pp-line)" }}
        >
          <div className="pp-shell flex items-center justify-between gap-4 py-3">
            <Link to="/" className="pp-back" aria-label="Back to Home">
              <FaArrowLeft className="pp-back-arrow text-[11px]" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                style={{
                  color: "var(--pp-txt-soft)",
                  background: "var(--pp-accent-soft)",
                  border: "1px solid var(--pp-line)",
                }}
                aria-label="Print this page"
              >
                <FaPrint className="text-[10px]" />
                Print
              </button>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{
                  background: "var(--pp-accent-soft)",
                  color: "var(--pp-accent-txt)",
                  border: "1px solid var(--pp-accent)",
                }}
              >
                <FaShieldAlt className="text-[9px]" />
                Privacy
              </span>
            </div>
          </div>
        </header>

        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(700px 400px at 20% 20%, var(--pp-hero-glow), transparent 60%),
                          radial-gradient(600px 400px at 85% 60%, var(--pp-hero-glow), transparent 65%)`,
            }}
            aria-hidden="true"
          />

          <div className="pp-shell relative py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pp-accent) 0%, var(--pp-accent-2) 100%)",
                    boxShadow: "0 14px 30px -12px var(--pp-accent-glow)",
                  }}
                >
                  <FaShieldAlt
                    className="text-[18px]"
                    style={{ color: "#0A0A12" }}
                  />
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: "var(--pp-txt-faint)" }}
                >
                  Legal · APNa Deal
                </span>
              </div>

              <h1
                className="font-ticket-display font-black leading-[0.98] mb-3"
                style={{
                  fontSize: "clamp(42px, 7vw, 88px)",
                  letterSpacing: "-0.035em",
                  color: "var(--pp-txt)",
                }}
              >
                Privacy
                <br />
                <span style={{ color: "var(--pp-accent)" }}>Policy</span>
              </h1>

              <p
                className="text-[15px] sm:text-[17px] leading-relaxed mt-5 max-w-2xl"
                style={{ color: "var(--pp-txt-soft)" }}
              >
                At APNa Deal, one of our main priorities is the privacy of our
                visitors. This Privacy Policy document explains the types of
                information we collect, how we use it, and the rights you have
                over your data.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <span
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold"
                  style={{
                    background: "var(--pp-accent-soft)",
                    color: "var(--pp-accent-txt)",
                    border: "1px solid var(--pp-accent)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "var(--pp-accent)",
                      boxShadow: "0 0 8px var(--pp-accent)",
                    }}
                  />
                  Last updated: {lastUpdated}
                </span>

                <span
                  className="inline-flex items-center gap-2 text-[11.5px] font-semibold"
                  style={{ color: "var(--pp-txt-faint)" }}
                >
                  <FaCheckCircle
                    className="text-[10px]"
                    style={{ color: "var(--pp-accent)" }}
                  />
                  GDPR & CCPA aware
                </span>

                <span
                  className="inline-flex items-center gap-2 text-[11.5px] font-semibold"
                  style={{ color: "var(--pp-txt-faint)" }}
                >
                  <FaCheckCircle
                    className="text-[10px]"
                    style={{ color: "var(--pp-accent)" }}
                  />
                  {PRIVACY_SECTIONS.length} sections
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ MAIN CONTENT — SIDEBAR TOC + SECTIONS ═══ */}
        <section className="pp-shell pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
            {/* ─── SIDEBAR: Sticky TOC ─── */}
            <aside className="hidden lg:block pp-no-print">
              <div className="sticky top-24">
                <p
                  className="text-[10.5px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: "var(--pp-txt-faint)" }}
                >
                  On this page
                </p>
                <nav className="space-y-1">
                  {PRIVACY_SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`pp-toc-link ${
                        activeId === s.id ? "pp-toc-active" : ""
                      }`}
                    >
                      <span className="pp-toc-num">{s.num}</span>
                      <span>{s.short}</span>
                    </a>
                  ))}
                </nav>

                <div
                  className="mt-8 p-4 rounded-2xl"
                  style={{
                    background: "var(--pp-accent-soft)",
                    border: "1px solid var(--pp-line)",
                  }}
                >
                  <p
                    className="text-[11px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--pp-accent-txt)" }}
                  >
                    Privacy questions?
                  </p>
                  <p
                    className="text-[12px] leading-relaxed mb-3"
                    style={{ color: "var(--pp-txt-soft)" }}
                  >
                    We're here to help. Reach out anytime.
                  </p>
                  <a
                    href="mailto:privacy@apnadeal.com"
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold"
                    style={{ color: "var(--pp-accent-txt)" }}
                  >
                    <FaEnvelope className="text-[10px]" />
                    privacy@apnadeal.com
                  </a>
                </div>
              </div>
            </aside>

            {/* ─── MAIN SECTIONS ─── */}
            <div className="min-w-0">
              {PRIVACY_SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: idx * 0.03 }}
                    className="pp-row scroll-mt-24"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "var(--pp-accent-soft)",
                            border: "1px solid var(--pp-accent)",
                          }}
                        >
                          <Icon
                            className="text-[12px]"
                            style={{ color: "var(--pp-accent-txt)" }}
                          />
                        </div>
                        <span className="pp-num-dot">{section.num}</span>
                      </div>
                      <h2 className="pp-h2">{section.label}</h2>
                    </div>

                    <div className="pp-body">{section.content}</div>
                  </motion.section>
                );
              })}

              {/* ═══ CONTACT SECTION ═══ */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-16 pt-12"
                style={{ borderTop: "1px solid var(--pp-divider)" }}
              >
                {/* Heading block */}
                <div className="mb-10 max-w-2xl">
                  <span className="pp-label">Still have questions?</span>
                  <h2
                    className="font-ticket-display font-black leading-[1.08] mt-3 mb-4"
                    style={{
                      fontSize: "clamp(28px, 4vw, 44px)",
                      letterSpacing: "-0.03em",
                      color: "var(--pp-txt)",
                    }}
                  >
                    Get in <span style={{ color: "var(--pp-accent)" }}>touch</span>
                  </h2>
                  <p
                    className="text-[14.5px] sm:text-[15.5px] leading-relaxed"
                    style={{ color: "var(--pp-txt-soft)" }}
                  >
                    Our privacy team is available to answer any question you might
                    have about your data, our practices, or anything else. We
                    typically respond within{" "}
                    <strong style={{ color: "var(--pp-txt)" }}>24 hours</strong>.
                  </p>
                </div>

                {/* Live status row */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex flex-wrap items-center gap-3 mb-8"
                >
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-bold"
                    style={{
                      background: "var(--pp-accent-soft)",
                      color: "var(--pp-accent-txt)",
                      border: "1px solid var(--pp-accent)",
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span
                        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                        style={{ background: "var(--pp-accent)" }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-2 w-2"
                        style={{ background: "var(--pp-accent)" }}
                      />
                    </span>
                    Available now
                  </span>

                  <span
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"
                    style={{ color: "var(--pp-txt-faint)" }}
                  >
                    <FaCheckCircle
                      className="text-[10px]"
                      style={{ color: "var(--pp-accent)" }}
                    />
                    Avg. response: 4 hours
                  </span>

                  <span
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"
                    style={{ color: "var(--pp-txt-faint)" }}
                  >
                    <FaCheckCircle
                      className="text-[10px]"
                      style={{ color: "var(--pp-accent)" }}
                    />
                    English · Urdu
                  </span>
                </motion.div>

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

                {/* Quick actions bar */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mt-6 rounded-3xl p-5 sm:p-6"
                  style={{
                    background: "var(--pp-accent-soft)",
                    border: "1px solid var(--pp-line)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className="text-[13.5px] font-bold mb-1"
                        style={{ color: "var(--pp-txt)" }}
                      >
                        Prefer a different way to reach us?
                      </p>
                      <p
                        className="text-[12px] leading-relaxed"
                        style={{ color: "var(--pp-txt-soft)" }}
                      >
                        Choose whichever channel works best for you.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      {QUICK_ACTIONS.map((a, i) => (
                        <a
                          key={i}
                          href={a.href}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold transition-all hover:scale-[1.03]"
                          style={{
                            background: "var(--pp-panel)",
                            border: "1px solid var(--pp-line)",
                            color: "var(--pp-txt)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--pp-accent)";
                            e.currentTarget.style.color = "var(--pp-accent-txt)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--pp-line)";
                            e.currentTarget.style.color = "var(--pp-txt)";
                          }}
                        >
                          {a.label}
                          <FaExternalLinkAlt className="text-[8px] opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Social row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-4"
                >
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.18em] flex-shrink-0"
                    style={{ color: "var(--pp-txt-faint)" }}
                  >
                    Follow APNa Deal
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    {SOCIALS.map(({ Icon, href, label }, i) => (
                      <a
                        key={i}
                        href={href}
                        aria-label={label}
                        className="h-10 w-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: "var(--pp-panel)",
                          border: "1px solid var(--pp-line)",
                          color: "var(--pp-txt-soft)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--pp-accent)";
                          e.currentTarget.style.color = "var(--pp-accent-txt)";
                          e.currentTarget.style.background = "var(--pp-accent-soft)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--pp-line)";
                          e.currentTarget.style.color = "var(--pp-txt-soft)";
                          e.currentTarget.style.background = "var(--pp-panel)";
                        }}
                      >
                        <Icon className="text-[12px]" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              </motion.section>

              {/* ═══ FOOTER NOTE ═══ */}
              <p
                className="mt-12 text-[12.5px] leading-relaxed"
                style={{ color: "var(--pp-txt-faint)" }}
              >
                This policy will be updated as APNa Deal evolves. We encourage you
                to review it periodically. Continued use of our services after any
                changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer
          className="border-t py-10"
          style={{ borderColor: "var(--pp-divider)" }}
        >
          <div className="pp-shell">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="APNa Deal"
                  className="h-8 w-auto object-contain"
                />
                <span
                  className="font-ticket-display text-lg font-bold tracking-tight"
                  style={{ color: "var(--pp-txt)" }}
                >
                  APNa<span style={{ color: "var(--pp-accent)" }}>Deal</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {SOCIALS.map(({ Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    aria-label={label}
                    className="h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      border: "1px solid var(--pp-line-str)",
                      color: "var(--pp-txt-soft)",
                    }}
                  >
                    <Icon className="text-[11px]" />
                  </a>
                ))}
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 text-[12px]"
              style={{
                borderTop: "1px solid var(--pp-divider)",
                color: "var(--pp-txt-faint)",
              }}
            >
              <span>
                © {new Date().getFullYear()} APNa Deal. All rights reserved.
              </span>
              <div className="flex items-center gap-5 flex-wrap justify-center">
                <Link
                  to="/privacy"
                  className="font-semibold transition-colors"
                  style={{ color: "var(--pp-accent-txt)" }}
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="font-semibold transition-colors hover:text-[var(--pp-accent-txt)]"
                >
                  Terms
                </Link>
                <Link
                  to="/cookies"
                  className="font-semibold transition-colors hover:text-[var(--pp-accent-txt)]"
                >
                  Cookies
                </Link>
                <Link
                  to="/contact"
                  className="font-semibold transition-colors hover:text-[var(--pp-accent-txt)]"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* ═══ BACK TO TOP ═══ */}
        <BackToTop />
      </div>
    </>
  );
};

export default PrivacyPage;