// components/Footer/Footer.jsx — Modern (#fc9d03 amber · dark + light)
import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

/* ═══════════════════════════════════════════════════════════════
   THEME HOOK — reads from <html> class (theme-dark / theme-light)
   ═══════════════════════════════════════════════════════════════ */
const useTheme = () => {
  const getTheme = () => {
    if (typeof document === "undefined") return "dark";
    const html = document.documentElement;
    if (html.classList.contains("theme-light")) return "light";
    if (html.classList.contains("theme-dark")) return "dark";
    if (html.classList.contains("dark")) return "dark";
    try {
      const saved = localStorage.getItem("theme") || localStorage.getItem("app-theme");
      if (saved === "light") return "light";
      if (saved === "dark") return "dark";
    } catch {}
    return "dark";
  };
  const [theme, setTheme] = React.useState(getTheme);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onStorage = () => setTheme(getTheme());
    window.addEventListener("storage", onStorage);
    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return theme;
};

/* ═══════════════════════════════════════════════════════════════
   FONTS + THEME TOKENS (accent: #fc9d03)
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ── DARK THEME ─────────────────────────────────────────── */
    .theme-dark {
      --foot-bg-1:        #0A0A12;
      --foot-bg-2:        #0F0F1A;
      --foot-txt:         #FFFFFF;
      --foot-txt-soft:    rgba(255,255,255,0.6);
      --foot-txt-faint:   rgba(255,255,255,0.5);
      --foot-line:        rgba(255,255,255,0.15);
      --foot-line-faint:  rgba(255,255,255,0.2);
      --foot-dot:         rgba(252,157,3,0.10);
      --foot-orb:         rgba(252,157,3,0.30);

      /* ⭐ Amber accent — #fc9d03 */
      --foot-primary:     #fc9d03;
      --foot-primary-2:   #fc9d03;
      --foot-primary-3:   #eb7d34;
      --foot-primary-soft: rgba(252,157,3,0.14);
      --foot-primary-glow: rgba(252,157,3,0.45);
      --foot-logo-bg:     rgba(255,255,255,0.05);
    }

    /* ── LIGHT THEME ────────────────────────────────────────── */
    .theme-light {
      --foot-bg-1:        #FAF7F3;
      --foot-bg-2:        #F2EDE5;
      --foot-txt:         #1A1613;
      --foot-txt-soft:    rgba(26,22,19,0.62);
      --foot-txt-faint:   rgba(26,22,19,0.5);
      --foot-line:        rgba(20,20,30,0.12);
      --foot-line-faint:  rgba(20,20,30,0.18);
      --foot-dot:         rgba(224,137,0,0.10);
      --foot-orb:         rgba(252,157,3,0.20);

      /* ⭐ Amber accent — darkened for readability on light bg */
      --foot-primary:     #e08900;
      --foot-primary-2:   #e08900;
      --foot-primary-3:   #fc9d03;
      --foot-primary-soft: rgba(224,137,0,0.10);
      --foot-primary-glow: rgba(224,137,0,0.35);
      --foot-logo-bg:     rgba(0,0,0,0.05);
    }

    .foot-bg {
      background: linear-gradient(180deg, var(--foot-bg-1) 0%, var(--foot-bg-2) 100%);
      color: var(--foot-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }

    /* Social icon hover glow */
    .foot-social:hover {
      box-shadow: 0 8px 24px -8px var(--foot-primary-glow);
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   BULLETPROOF LOGO
   ═══════════════════════════════════════════════════════════════ */
const LogoImage = ({ className = "h-full w-full object-contain p-1" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className="h-full w-full flex items-center justify-center font-bold text-lg rounded-xl"
        style={{
          background: "linear-gradient(135deg, var(--foot-primary) 0%, var(--foot-primary-3) 100%)",
          color: "#0B0B12",
        }}
      >
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

const Footer = () => {
  const year = new Date().getFullYear();
  const theme = useTheme();

  const footerLinks = {
    Marketplace: [
      { name: "Vehicles", path: "/vehicles" },
      { name: "Mobiles", path: "/mobiles" },
      { name: "Property", path: "/property" },
      { name: "Electronics", path: "/electronics" },
    ],
    Company: [
      { name: "About Us", path: "/about" },
      { name: "Post Your Ad", path: "/post-ad" },
      { name: "Browse Listings", path: "/browse" },
      { name: "Contact", path: "/contact" },
    ],
    Legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Disclaimer", path: "/disclaimer" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook,  href: "#", label: "Facebook" },
    { icon: FaTiktok,    href: "#", label: "TikTok" },
    { icon: FaYoutube,   href: "#", label: "YouTube" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className={`foot-bg theme-${theme} relative overflow-hidden`}>
      <FontStyles />

      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(var(--foot-dot) 0.6px, transparent 0.6px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      {/* Ambient amber glow at top */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] blur-[120px]"
        style={{
          background: `radial-gradient(circle, var(--foot-orb), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[8deg]"
                style={{ background: "var(--foot-logo-bg)" }}
              >
                <LogoImage />
              </div>
              <div>
                <span className="font-ticket-display text-xl font-bold tracking-tight text-[var(--foot-txt)]">
                  APNa
                  <span className="text-[var(--foot-primary-2)]">Deal</span>
                </span>
                <span className="block font-ticket-body text-[10px] text-[var(--foot-txt-faint)] -mt-0.5 tracking-[0.15em] uppercase">
                  Marketplace
                </span>
              </div>
            </Link>

            <p className="font-ticket-body text-[var(--foot-txt-soft)] text-sm leading-relaxed mb-5">
              Pakistan's fastest-growing marketplace. Post your ad Right now
              — AI handles everything, and your item sells Fast.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 font-ticket-body text-xs text-[var(--foot-txt-soft)]">
                <FaEnvelope className="text-[var(--foot-primary-2)] text-[11px]" />
                <span>contact@apnadeal.com</span>
              </div>
              <div className="flex items-center gap-2 font-ticket-body text-xs text-[var(--foot-txt-soft)]">
                <FaPhone className="text-[var(--foot-primary-2)] text-[11px]" />
                <span>+92 314 0972575</span>
              </div>
              <div className="flex items-center gap-2 font-ticket-body text-xs text-[var(--foot-txt-soft)]">
                <FaMapMarkerAlt className="text-[var(--foot-primary-2)] text-[11px]" />
                <span>Islamabad Bahria, Pakistan</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2.5">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="foot-social group/social h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ border: "2px solid var(--foot-line)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--foot-primary)";
                      e.currentTarget.style.background = "var(--foot-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--foot-line)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon
                      className="text-[var(--foot-txt)] text-sm transition-all duration-300 group-hover/social:scale-110 group-hover/social:!text-[#0B0B12]"
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-ticket-display text-sm font-bold text-[var(--foot-txt)] uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="font-ticket-body text-[var(--foot-txt-soft)] text-sm transition-all duration-200 inline-block hover:translate-x-1"
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foot-primary-2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foot-txt-soft)"; }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "2px dashed var(--foot-line)" }}
        >
          <p className="font-ticket-body text-sm text-[var(--foot-txt-faint)] text-center sm:text-left">
            © {year}{" "}
            <span className="font-ticket-display font-bold text-[var(--foot-txt)]">
              APNa Deal
            </span>{" "}
            Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-3 font-ticket-body text-sm">
            <Link
              to="/privacy"
              className="text-[var(--foot-txt-faint)] transition-colors duration-200 hover:text-[var(--foot-primary-2)]"
            >
              Privacy
            </Link>
            <span className="text-[var(--foot-line-faint)]">|</span>
            <Link
              to="/terms"
              className="text-[var(--foot-txt-faint)] transition-colors duration-200 hover:text-[var(--foot-primary-2)]"
            >
              Terms
            </Link>
            <span className="text-[var(--foot-line-faint)]">|</span>
            <Link
              to="/cookies"
              className="text-[var(--foot-txt-faint)] transition-colors duration-200 hover:text-[var(--foot-primary-2)]"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;