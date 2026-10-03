// pages/Home.jsx — Modern Design System (brand orange · dark + light)
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Hero from "../components/Hero/Hero";
import {
  FaArrowRight,
  FaStar,
  FaCar,
  FaMobileAlt,
  FaHome,
  FaLaptop,
  FaStore,
  FaShieldAlt,
  FaHandshake,
  FaMoneyBillWave,
  FaCamera,
  FaCommentDots,
  FaImages,
  FaClock,
  FaFire,
  FaBolt,
  FaGem,
  FaWallet,
  FaTruck,
  FaHeadset,
  FaCheckCircle,
  FaRobot,
  FaBullhorn,
  FaUserPlus,
  FaTag,
  FaPlus,
  FaMinus,
  FaQuestionCircle,
  FaGamepad,
  FaMotorcycle,
  FaVolumeUp,
  FaVolumeMute,
  FaBrain,
  FaPalette,
  FaEraser,
  FaComments,
  FaUsers,
  FaVideo,
  FaMicrochip,
  FaGlobe,
  FaMagic,
  FaLayerGroup,
  FaExchangeAlt,
  FaCreditCard,
  FaChartLine,
  FaHeart,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PricingPlans from "./Premium";

/* ═══════════════════════════════════════════════════════════════
   THEME HOOK
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
  const [theme, setTheme] = useState(getTheme);
  useEffect(() => {
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
   FONTS + THEME TOKENS
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    html { scroll-behavior: smooth; }

    .theme-dark {
      --home-bg:        #0A0A12;
      --home-bg-2:      #0F0F1A;
      --home-card:      rgba(255,255,255,0.045);
      --home-card-2:    rgba(255,255,255,0.02);
      --home-line:      rgba(255,255,255,0.08);
      --home-line-str:  rgba(255,255,255,0.15);
      --home-txt:       #FFFFFF;
      --home-txt-soft:  rgba(255,255,255,0.65);
      --home-txt-faint: rgba(255,255,255,0.45);
      --home-dot:       rgba(255,255,255,0.06);
      --home-orb-1:     rgba(252,157,3,0.25);
      --home-orb-2:     rgba(200,99,31,0.20);
      --home-primary:   #fc9d03;
      --home-primary-2: #f59e0b;
      --home-primary-3: #c8631f;
      --home-primary-soft: rgba(252,157,3,0.14);
      --home-primary-glow: rgba(252,157,3,0.45);
      --home-emerald:   #4ADE80;
      --home-emerald-soft: rgba(74,222,128,0.14);
    }

    .theme-light {
      --home-bg:        #FFFFFF;
      --home-bg-2:      #FAF7F3;
      --home-card:      rgba(255,255,255,0.85);
      --home-card-2:    rgba(255,255,255,0.95);
      --home-line:      rgba(20,20,30,0.08);
      --home-line-str:  rgba(20,20,30,0.15);
      --home-txt:       #1A1613;
      --home-txt-soft:  rgba(26,22,19,0.62);
      --home-txt-faint: rgba(26,22,19,0.42);
      --home-dot:       rgba(20,20,30,0.08);
      --home-orb-1:     rgba(252,157,3,0.18);
      --home-orb-2:     rgba(200,99,31,0.12);
      --home-primary:   #c8631f;
      --home-primary-2: #fc9d03;
      --home-primary-3: #f59e0b;
      --home-primary-soft: rgba(200,99,31,0.10);
      --home-primary-glow: rgba(200,99,31,0.35);
      --home-emerald:   #059669;
      --home-emerald-soft: rgba(5,150,105,0.10);
    }

    .home-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--home-orb-1), transparent 60%),
        radial-gradient(900px 500px at 100% 25%, var(--home-orb-2), transparent 60%),
        linear-gradient(180deg, var(--home-bg) 0%, var(--home-bg-2) 100%);
      color: var(--home-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }

    .home-card {
      background: linear-gradient(180deg, var(--home-card), var(--home-card-2));
      border: 1px solid var(--home-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer-text {
      background: linear-gradient(90deg, var(--home-primary) 0%, var(--home-primary-2) 25%, var(--home-primary-3) 50%, var(--home-primary-2) 75%, var(--home-primary) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 5s linear infinite;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   SHOWCASE VIDEOS
   ═══════════════════════════════════════════════════════════════ */
const SHOWCASE_VIDEOS = [
  { src: "/ad5.mp4", label: "Live Preview", tagline: "Post once. Reach every platform." },
];

const ROTATE_INTERVAL = 5000;

/* ═══════════════════════════════════════════════════════════════
   VIDEO SHOWCASE CARD
   ═══════════════════════════════════════════════════════════════ */
const VideoShowcaseCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("theme-light")
      ? "light"
      : "dark"
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() =>
      setTheme(
        document.documentElement.classList.contains("theme-light")
          ? "light"
          : "dark"
      )
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SHOWCASE_VIDEOS.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  const active = SHOWCASE_VIDEOS[activeIndex];

  return (
    <div
      className="relative w-full max-w-[590px] mx-auto lg:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-8 rounded-[40px] blur-[80px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--home-primary-glow) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[28px] overflow-hidden group"
        style={{
          background: "var(--home-card)",
          border: "1px solid var(--home-line-str)",
        }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "16 / 10" }}
        >
          <AnimatePresence mode="wait">
            <motion.video
              key={active.src}
              src={active.src}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          <div
            className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ticket-body text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                  style={{ background: "var(--home-primary-2)" }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: "var(--home-primary-2)" }}
                />
              </span>
              {active.label}
            </span>
          </div>
        </div>

        <div
          className="px-5 sm:px-6 py-5 flex items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--home-line)" }}
        >
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={active.tagline}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="font-ticket-body text-sm sm:text-[15px] font-semibold text-[var(--home-txt)] leading-snug"
              >
                {active.tagline}
              </motion.p>
            </AnimatePresence>
            <p className="font-ticket-body text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--home-txt-faint)] mt-1">
              Everything · one app
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   OUR SERVICES SECTION
   ═══════════════════════════════════════════════════════════════ */
const SERVICES = [
  {
    id: 1,
    title: "Marketplace",
    desc: "Buy & sell vehicles, mobiles, property and more with real photos and videos.",
    icon: FaStore,
    accent: "var(--home-primary-2)",
    link: "/feed",
  },
  {
    id: 2,
    title: "Live Chat",
    desc: "Real-time messaging with sellers. Share images and close deals instantly.",
    icon: FaComments,
    accent: "var(--home-primary-2)",
    link: "/chat",
  },
  {
    id: 3,
    title: "Social Feed",
    desc: "Post reels, photos and updates. Like, comment, and share with your network.",
    icon: FaImages,
    accent: "var(--home-primary-2)",
    link: "/study-posts",
  },
  {
    id: 4,
    title: "AI Studio",
    desc: "Generate product images with NanoBanana and remove backgrounds in one click.",
    icon: FaMagic,
    accent: "var(--home-primary-2)",
    link: "/image-generator",
  },
  {
    id: 5,
    title: "Escrow Payments",
    desc: "Safe payments until both sides confirm — money held securely until delivery.",
    icon: FaShieldAlt,
    accent: "var(--home-primary-2)",
    link: "/premium",
  },
  {
    id: 6,
    title: "24/7 Support",
    desc: "Real humans ready to help. Chat with our team any time, any day.",
    icon: FaHeadset,
    accent: "var(--home-primary-2)",
    link: "/support",
  },
];
const OurServicesSection = () => {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      className="relative w-full pt-4 sm:pt-6 md:pt-8 pb-14 sm:pb-16 md:pb-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--nav-bg) 0%, var(--nav-bg-2) 100%)",
        borderRadius: 24,
        border: "1px solid var(--nav-line)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative">
        {/* Top block: text left, card image right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 sm:gap-12 lg:gap-16 items-center mb-16 sm:mb-20 md:mb-24">
          {/* LEFT: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
       

            {/* Massive headline */}
            <h2
              className="font-ticket-display text-[34px] sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[76px] font-bold leading-[1.02] tracking-[-0.03em] mb-6"
              style={{
                color: "var(--nav-txt)",
                textShadow: "0 4px 40px rgba(0,0,0,0.10)",
              }}
            >
              BUILT FOR PEOPLE
              <br />
              WHO MOVE FORWARD
            </h2>

            {/* Subtitle */}
            <p
              className="font-ticket-body text-[14px] sm:text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: "var(--nav-txt-soft)" }}
            >
              We're a modern all-in-one platform designed for your everyday life and bigger
              goals. Simple. Secure. Connected.
            </p>
          </motion.div>

          {/* RIGHT: Card image */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            <div
              className="pointer-events-none absolute -inset-16 rounded-full opacity-40 blur-[120px]"
              style={{
                background:
                  "radial-gradient(circle, var(--nav-primary-glow) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
            <motion.img
              src="https://cdn.dribbble.com/userupload/44376395/file/d72f1d2894ee2f4fdc79cacd1cd67e16.png?resize=2048x1536&vertical=center"
              alt="APNa Deal card"
              className="relative w-full max-w-[460px] rounded-3xl"
              style={{
                border: "1px solid var(--nav-line-str)",
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </motion.div>
        </div>

        {/* "Our services" heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <h3
            className="font-ticket-display text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "var(--nav-txt)" }}
          >
            Our services
          </h3>
        </motion.div>

        {/* Services grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.id} variants={rise}>
                <Link
                  to={service.link}
                  className="group relative flex flex-col w-full h-full rounded-2xl p-6 sm:p-7 transition-all duration-300 overflow-hidden"
                  style={{
                    background: "var(--nav-surface)",
                    border: "1px solid var(--nav-line)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--nav-primary)";
                    e.currentTarget.style.background = "var(--nav-primary-soft)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--nav-line)";
                    e.currentTarget.style.background = "var(--nav-surface)";
                  }}
                >
                  {/* Subtle glow on hover */}
                  <div
                    className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(circle, var(--nav-primary-glow) 0%, transparent 70%)",
                    }}
                    aria-hidden="true"
                  />

                  {/* Icon circle */}
                  <div className="relative mb-6">
                    <div
                      className="relative inline-flex items-center justify-center h-14 w-14 rounded-full transition-transform duration-500 group-hover:scale-110"
                      style={{
                        border: "1.5px solid var(--nav-primary)",
                        background: "var(--nav-primary-soft)",
                      }}
                    >
                      <Icon
                        className="text-[18px] transition-colors duration-300"
                        style={{ color: "var(--nav-primary-2)" }}
                      />
                      <span
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: "0 0 30px 4px var(--nav-primary-glow)",
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Title + arrow row */}
                  <div className="relative flex items-center justify-between gap-4 mb-2">
                    <h4
                      className="font-ticket-display text-xl sm:text-2xl font-bold tracking-tight"
                      style={{ color: "var(--nav-txt)" }}
                    >
                      {service.title}
                    </h4>
                    <div
                      className="flex-shrink-0 inline-flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <FaArrowRight
                        className="text-base"
                        style={{ color: "var(--nav-txt-soft)" }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="relative font-ticket-body text-[14px] sm:text-[15px] leading-relaxed max-w-[90%]"
                    style={{ color: "var(--nav-txt-soft)" }}
                  >
                    {service.desc}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════ */
const Home = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const theme = useTheme();


  const aiTools = [
    {
      id: 1,
      name: "ChatGPT-5",
      platform: "AI Assistant",
      icon: FaBrain,
      description: "Chat, draft listings, reply to buyers, write captions — a full AI brain built into your feed.",
      stat: "24/7",
      statLabel: "Live Assistant",
      accent: "var(--home-primary-2)",
    },
    {
      id: 2,
      name: "NanoBanana",
      platform: "Image Generation",
      icon: FaMagic,
      description: "Turn any photo into stunning product visuals. Generate, restyle, and enhance in one tap.",
      stat: "∞",
      statLabel: "Generations",
      accent: "var(--home-primary)",
    },
    {
      id: 3,
      name: "BG Remover",
      platform: "Visual Studio",
      icon: FaEraser,
      description: "One-click background removal + clean studio backgrounds for any item you're selling.",
      stat: "1-Click",
      statLabel: "Clean Cut",
      accent: "var(--home-primary-2)",
    },
  ];


  const whyFeatures = [
    { icon: FaComments,    title: "Live Chat",         desc: "Real-time messaging with buyers & sellers." },
    { icon: FaShieldAlt,   title: "Escrow",            desc: "Safe payments until both sides confirm." },
    { icon: FaRobot,       title: "AI Tools",          desc: "ChatGPT-5, NanoBanana & BG remover built-in." },
    { icon: FaVideo,       title: "Reels & Video",     desc: "Post short videos right in your feed." },
    { icon: FaStore,       title: "Marketplace",       desc: "Vehicles, property, mobiles & more." },
    { icon: FaUsers,       title: "Social Feed",       desc: "Follow, comment, share — everything social." },
  ];

  const faqs = [
    {
      id: 1,
      question: "What is everything-in-one exactly?",
      answer:
        "It's your all-in-one app: a social feed (posts, images, short videos, comments, likes), real-time live chat with sellers and buyers, a marketplace for vehicles, bikes, mobiles, property and electronics, plus built-in AI tools like ChatGPT-5 chat, NanoBanana image generation, and one-click background removal.",
    },
    {
      id: 2,
      question: "How does the live chat with sellers work?",
      answer:
        "Open any listing or post, tap Chat, and start talking instantly — real-time messaging with typing indicators and image sharing. No waiting, no middlemen. Your messages sync across devices the moment they're sent.",
    },
    {
      id: 3,
      question: "What AI tools are included?",
      answer:
        "You get ChatGPT-5 for chat, drafting, captions and buyer replies; NanoBanana for generating product images from a prompt or photo; and a one-click background remover that turns any phone snap into a studio-quality listing image.",
    },
    {
      id: 4,
      question: "Can I post images and videos on the feed?",
      answer:
        "Yes. Your social feed supports photos, short videos (with auto-play on scroll), polls, hashtags, mentions, likes, comments and bookmarks. Post it once — it appears everywhere your followers are.",
    },
    {
      id: 5,
      question: "What can I buy and sell on the marketplace?",
      answer:
        "Anything — vehicles and bikes, mobiles and tablets, property and land, laptops and electronics, plus a general marketplace for everything else. Every listing supports real photos, videos, price, and location.",
    },
    {
      id: 6,
      question: "Is my payment safe?",
      answer:
        "Yes. Our escrow service holds funds securely until both sides confirm the deal. Money is only released when the buyer receives what they paid for — and sellers get paid instantly after confirmation.",
    },
    {
      id: 7,
      question: "Can I run my whole business from this app?",
      answer:
        "Absolutely. Create listings, generate AI images, chat with buyers in real time, post on your social feed, run polls, and close deals — all from one dashboard. No more juggling five different apps.",
    },
    {
      id: 8,
      question: "How fast can I get started?",
      answer:
        "Under a minute. Sign up, snap a photo, let our AI clean it, write the listing for you, and publish — either to the marketplace, your social feed, or both at the same time.",
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden home-bg theme-${theme} relative`}>
      <FontStyles />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(var(--home-dot) 0.6px, transparent 0.6px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Hero />

{/* ═══════════ 2. AI POWER TOOLS — #features ═══════════ */}
<section id="features" className="py-14 sm:py-16 md:py-20 relative scroll-mt-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10 sm:mb-12 md:mb-14"
    >
      <h2 className="font-ticket-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--home-txt)] mb-3 tracking-tight">
        The AI that <span className="text-[var(--home-primary-2)]">does it all</span>
      </h2>
      <p className="font-ticket-body text-[var(--home-txt-soft)] max-w-2xl mx-auto text-sm sm:text-base px-4">
        ChatGPT-5, NanoBanana image generation, and one-click background removal — inside every post, every listing, every chat.
      </p>
    </motion.div>

    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
    >
      {aiTools.map((tool) => {
        const Icon = tool.icon;
        return (
          <motion.div
            key={tool.id}
            variants={rise}
            className="relative rounded-[26px] p-[1.5px] overflow-hidden"
          >
            <div className="relative home-card rounded-[24.5px] p-6 sm:p-7 md:p-8 h-full overflow-hidden">
              <div className="absolute -top-4 -right-2 font-ticket-display text-[100px] sm:text-[120px] font-bold text-[var(--home-txt)]/5 leading-none select-none pointer-events-none">
                {tool.id}
              </div>

              <div className="relative">
                <div
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border-2 flex items-center justify-center mb-5"
                  style={{ borderColor: tool.accent, color: tool.accent, background: "var(--home-primary-soft)" }}
                >
                  <Icon className="text-xl sm:text-2xl" />
                </div>

                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-ticket-body text-[10px] font-bold uppercase tracking-wider mb-3"
                  style={{ borderColor: tool.accent, color: tool.accent }}
                >
                  {tool.platform}
                </span>

                <h3 className="font-ticket-display text-xl sm:text-2xl font-bold text-[var(--home-txt)] mb-3 leading-tight">
                  {tool.name}
                </h3>
                <p className="font-ticket-body text-sm text-[var(--home-txt-soft)] leading-relaxed mb-5">
                  {tool.description}
                </p>

                <div className="pt-4 border-t border-[var(--home-line)] flex items-center justify-between">
                  <div>
                    <p className="font-ticket-display text-2xl sm:text-3xl font-bold text-[var(--home-txt)] leading-none">
                      {tool.stat}
                    </p>
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-wider text-[var(--home-txt-faint)] mt-1">
                      {tool.statLabel}
                    </p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl border flex items-center justify-center"
                    style={{ borderColor: tool.accent, color: tool.accent }}
                  >
                    <FaBolt className="text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="text-center mt-8 sm:mt-10"
    >
      <span
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-ticket-body text-xs sm:text-sm font-semibold"
        style={{
          border: "1px solid var(--home-primary)",
          color: "var(--home-primary-2)",
          background: "var(--home-primary-soft)",
        }}
      >
        <FaRobot className="text-[10px]" />
        AI chat · image generation · background removal — all included
      </span>
    </motion.div>
  </div>
</section>

        {/* ═══════════ 2b. HERO + VIDEO SHOWCASE — #assets ═══════════ */}
        <section id="assets" className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-14 sm:pb-18 md:pb-22 overflow-hidden scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative text-center lg:text-left order-2 lg:order-1"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.4]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--home-line) 1px, transparent 1px), linear-gradient(90deg, var(--home-line) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage: "radial-gradient(circle at 30% 40%, black 0%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(circle at 30% 40%, black 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />

                <div className="relative">
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full font-ticket-body text-xs sm:text-sm font-semibold mb-5 relative"
                    style={{
                      border: "1px solid var(--home-primary)",
                      color: "var(--home-primary-2)",
                      background: "var(--home-primary-soft)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "var(--home-primary-2)" }} />
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--home-primary-2)" }} />
                    </span>
                    <FaMagic className="text-[10px]" />
                    Everything in one app
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="font-ticket-display text-[34px] leading-[1.05] sm:text-5xl md:text-5xl lg:text-[52px] xl:text-[80px] font-bold text-[var(--home-txt)] mb-5 tracking-[-0.03em]"
                  >
                    Social. Market.{" "}
                    <span className="relative inline-block">
                      <span
                        className="relative z-10"
                        style={{
                          background:
                            "linear-gradient(120deg, var(--home-primary-2) 0%, var(--home-primary) 50%, var(--home-primary-3) 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        AI. All-in-one.
                      </span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full origin-left"
                        style={{ background: "linear-gradient(90deg, var(--home-primary-2), transparent)" }}
                      />
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="font-ticket-body text-[var(--home-txt-soft)] text-sm sm:text-base md:text-[17px] leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0"
                  >
                    A social feed, live seller chat, marketplace for vehicles & more, plus AI tools — ChatGPT-5, NanoBanana image generation, and background removal. Everything you need, in one place.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25, duration: 0.6 }}
                    className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 mb-8"
                  >
                    {[
                      { icon: FaComments,  label: "Live Chat" },
                      { icon: FaStore,     label: "Marketplace" },
                      { icon: FaRobot,     label: "AI Tools" },
                      { icon: FaVideo,     label: "Reels" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                          whileHover={{ y: -2, scale: 1.04 }}
                          className="group/chip inline-flex items-center gap-2 px-3.5 py-2 rounded-full font-ticket-body text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-default transition-all duration-300"
                          style={{
                            background: "var(--home-primary-soft)",
                            border: "1px solid var(--home-line-str)",
                            color: "var(--home-txt-soft)",
                            boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
                          }}
                        >
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 group-hover/chip:scale-110"
                            style={{ background: "linear-gradient(135deg, var(--home-primary-2), var(--home-primary))" }}
                          >
                            <Icon className="text-black text-[10px]" />
                          </span>
                          {item.label}
                        </motion.span>
                      );
                    })}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-7"
                  >
                    <Link
                      to="/feed"
                      className="group relative inline-flex items-center justify-center gap-3 pl-7 pr-3 py-3 rounded-2xl overflow-hidden font-ticket-body font-bold text-sm sm:text-base transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, var(--home-primary-2) 0%, var(--home-primary) 100%)",
                        color: "#000",
                        boxShadow: "0 12px 32px -8px var(--home-primary-glow), 0 4px 12px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      <span
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                        aria-hidden="true"
                      />
                      <span className="relative">Open the app</span>
                      <span
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
                        style={{ background: "rgba(0,0,0,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}
                      >
                        <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </Link>

                    <Link
                      to="/post-ad"
                      className="group/ghost relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-ticket-body font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        color: "var(--home-txt)",
                        border: "1px solid var(--home-line-str)",
                        background: "var(--home-card)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span className="transition-colors group-hover/ghost:text-[var(--home-primary-2)]">
                        Post an ad
                      </span>
                      <FaArrowRight className="text-[10px] transition-all duration-300 group-hover/ghost:translate-x-1 group-hover/ghost:text-[var(--home-primary-2)]" />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex items-center justify-center lg:justify-start gap-3"
                  >
                    <div className="flex -space-x-2">
                      {[
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80",
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
                      ].map((src, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full border-2 overflow-hidden transition-transform hover:scale-110 hover:z-10"
                          style={{ borderColor: "var(--home-bg)" }}
                        >
                          <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="text-left">
                      <p className="font-ticket-body text-xs sm:text-[13px] font-bold text-[var(--home-txt)] leading-tight">
                        Thousands of real users
                      </p>
                      <p className="font-ticket-body text-[10.5px] sm:text-xs text-[var(--home-txt-faint)] leading-tight">
                        chatting, posting & selling right now
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="relative w-full order-1 lg:order-2 flex items-center justify-center lg:justify-end"
              >
                <VideoShowcaseCard />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════ 3. WHAT YOU UPLOAD ═══════════ */}
        <section className="py-14 sm:py-16 md:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16 md:mb-20"
            >
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-ticket-body text-xs sm:text-sm font-semibold mb-4"
                style={{ border: "1px solid var(--home-primary)", color: "var(--home-primary-2)", background: "var(--home-primary-soft)" }}
              >
                <FaBolt className="text-[10px]" />
                4 quick steps
              </span>
              <h2 className="font-ticket-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--home-txt)] mb-3 tracking-tight">
                Just upload <span className="shimmer-text">photo + details</span>
              </h2>
              <p className="font-ticket-body text-[var(--home-txt-soft)] max-w-2xl mx-auto text-sm sm:text-base px-4">
                4 quick steps · 60 seconds · AI + live chat + marketplace do the rest.
              </p>
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {[
                { number: "01", label: "Clear Photo",   hint: "Of your item from any angle",           desc: "Just snap it — AI cleans the background automatically",       icon: FaCamera,      accent: "var(--home-primary-2)" },
                { number: "02", label: "Name & Model",  hint: "e.g., Honda CD 70, iPhone 13 Pro",      desc: "Tell us what it is — AI writes the full title & description", icon: FaTag,         accent: "var(--home-primary)" },
                { number: "03", label: "Condition",     hint: "New, like-new, used, or needs repair",  desc: "We use this to suggest a fair market price for you",          icon: FaCheckCircle, accent: "var(--home-primary-2)" },
                { number: "04", label: "Your Location", hint: "So we target local buyers in your city", desc: "Your ad reaches real buyers near you — not random people",    icon: FaHome,        accent: "var(--home-primary)" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={rise}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="group relative home-card rounded-[26px] p-6 sm:p-7 transition-all duration-200 overflow-hidden h-full flex flex-col"
                    style={{ borderColor: "var(--home-line)" }}
                  >
                    <div className="absolute -top-6 -right-3 font-ticket-display text-[120px] sm:text-[140px] font-bold text-[var(--home-txt)]/5 leading-none select-none pointer-events-none">{item.number}</div>
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle, ${item.accent}, transparent 70%)` }} aria-hidden="true" />
                    <div className="absolute inset-x-6 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }} aria-hidden="true" />

                    <div className="relative flex flex-col h-full">
                      <div className="relative mb-5 w-fit">
                        <div className="relative inline-flex">
                          <div
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6"
                            style={{ borderColor: item.accent, color: item.accent, background: "var(--home-primary-soft)" }}
                          >
                            <Icon className="text-2xl sm:text-3xl" />
                          </div>
                          <span className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" style={{ borderColor: item.accent }} aria-hidden="true" />
                        </div>
                      </div>

                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-ticket-body text-[10px] font-bold uppercase tracking-wider mb-3 w-fit transition-all duration-300 group-hover:scale-105"
                        style={{ borderColor: item.accent, color: item.accent }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.accent }} />
                        Step {i + 1}
                      </span>

                      <h3 className="font-ticket-display text-xl sm:text-2xl font-bold text-[var(--home-txt)] mb-2 leading-tight">{item.label}</h3>
                      <p className="font-ticket-body text-sm sm:text-base font-semibold text-[var(--home-txt-soft)] mb-3 leading-snug">{item.hint}</p>
                      <p className="font-ticket-body text-xs sm:text-sm text-[var(--home-txt-faint)] leading-relaxed mt-auto pt-3 border-t border-[var(--home-line)]">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ PRICING — #pricing ═══════════ */}
        <section id="pricing" className="scroll-mt-24">
          <PricingPlans />
        </section>

        {/* ═══════════ NEW: OUR SERVICES (About-style, dark) ═══════════ */}
        <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <OurServicesSection />
        </section>

      
        {/* ═══════════ 6. WHY CHOOSE US — #protection ═══════════ */}
        <section id="protection" className="py-14 sm:py-16 md:py-20 relative scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-12 md:mb-14"
            >
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-ticket-body text-xs sm:text-sm font-semibold mb-4"
                style={{ border: "1px solid var(--home-primary)", color: "var(--home-primary-2)", background: "var(--home-primary-soft)" }}
              >
                <FaShieldAlt className="text-[10px]" />
                Built for everything
              </span>
              <h2 className="font-ticket-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--home-txt)] mb-3 tracking-tight">
                Everything <span className="shimmer-text">you need</span>
              </h2>
              <p className="font-ticket-body text-[var(--home-txt-soft)] max-w-2xl mx-auto text-sm sm:text-base px-4">
                Live chat, social feed, marketplace, AI tools, escrow payments — all built into one seamless experience.
              </p>
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {whyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={rise}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="group relative home-card rounded-[22px] p-4 sm:p-5 text-center overflow-hidden transition-all duration-200"
                    style={{ borderColor: "var(--home-line)" }}
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle, var(--home-primary-2), transparent 70%)" }} aria-hidden="true" />
                    <div className="absolute inset-x-4 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, var(--home-primary-2), transparent)" }} aria-hidden="true" />

                    <div className="relative">
                      <div className="relative mx-auto mb-3 w-fit">
                        <div
                          className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
                          style={{ border: "1px solid var(--home-primary)", background: "var(--home-primary-soft)" }}
                        >
                          <Icon className="text-[var(--home-primary-2)] text-lg sm:text-xl" />
                        </div>
                        <span className="absolute inset-0 rounded-xl border border-[var(--home-primary-2)] opacity-0 group-hover:opacity-100 group-hover:animate-ping" aria-hidden="true" />
                      </div>

                      <h3 className="font-ticket-display text-sm sm:text-base font-bold text-[var(--home-txt)] mb-1">{feature.title}</h3>
                      <p className="font-ticket-body text-xs sm:text-sm text-[var(--home-txt-faint)] leading-snug">{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ 7. FAQ — #faq ═══════════ */}
        <section id="faq" className="py-14 sm:py-16 md:py-20 relative scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-12 md:mb-14"
            >
              <span
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full font-ticket-body text-xs sm:text-sm font-semibold mb-3"
                style={{ border: "1px solid var(--home-primary)", color: "var(--home-primary-2)", background: "var(--home-primary-soft)" }}
              >
                <FaQuestionCircle className="text-[10px]" />
                Got questions?
              </span>
              <h2 className="font-ticket-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--home-txt)] mb-3 tracking-tight">
                Frequently asked <span className="text-[var(--home-primary-2)]">questions</span>
              </h2>
              <p className="font-ticket-body text-[var(--home-txt-soft)] max-w-2xl mx-auto text-sm sm:text-base px-4">
                Everything you need to know about the all-in-one app.
              </p>
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    variants={rise}
                    className="group home-card rounded-[22px] transition-all duration-200 overflow-hidden"
                    style={{
                      borderColor: isOpen ? "var(--home-primary-2)" : "var(--home-line)",
                    }}
                  >
                    <button onClick={() => setOpenFaq(isOpen ? null : faq.id)} className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors"
                          style={
                            isOpen
                              ? { background: "var(--home-primary-2)", borderColor: "var(--home-primary-2)" }
                              : { borderColor: "var(--home-primary)", background: "var(--home-primary-soft)" }
                          }
                        >
                          <FaQuestionCircle className={`text-sm sm:text-base ${isOpen ? "text-white" : "text-[var(--home-primary-2)]"}`} />
                        </div>
                        <h3 className="font-ticket-display text-sm sm:text-base font-bold leading-snug pt-1.5 text-[var(--home-txt)]">
                          {faq.question}
                        </h3>
                      </div>

                      <div
                        className="h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={
                          isOpen
                            ? { background: "var(--home-primary-2)", borderColor: "var(--home-primary-2)", transform: "rotate(180deg)" }
                            : { borderColor: "var(--home-line-str)" }
                        }
                      >
                        {isOpen ? (
                          <FaMinus className="text-white text-xs" />
                        ) : (
                          <FaPlus className="text-[var(--home-txt)] text-xs" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[72px] sm:pl-[80px]">
                            <p className="font-ticket-body text-sm text-[var(--home-txt-soft)] leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══════════ 8. CLOSING CTA ═══════════ */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[32px] bg-black px-4 py-20 sm:py-24 md:py-28 lg:py-32 text-center">
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 0.7px, transparent 0.7px)", backgroundSize: "22px 22px" }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] blur-[120px] opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(252,157,3,0.7), transparent 70%)" }} aria-hidden="true" />

              <div className="absolute top-10 left-6 sm:left-10 text-white/15 text-4xl sm:text-5xl animate-pulse"><FaHandshake /></div>
              <div className="absolute bottom-10 right-6 sm:right-10 text-white/15 text-4xl sm:text-5xl animate-pulse [animation-delay:700ms]"><FaHandshake /></div>
              <div className="absolute top-1/3 right-12 hidden md:block text-white/10 text-3xl animate-pulse [animation-delay:400ms]"><FaCamera /></div>
              <div className="absolute bottom-1/3 left-12 hidden md:block text-white/10 text-3xl animate-pulse [animation-delay:1000ms]"><FaStore /></div>

              <div className="relative flex flex-col items-center justify-center max-w-4xl mx-auto px-4">
                <h2 className="font-ticket-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-5 sm:mb-6">
                  <span className="block">Social. Market.</span>
                  <span className="block mt-1 sm:mt-2 text-[#fc9d03]">AI. All-in-one.</span>
                </h2>

                <p className="font-ticket-body text-white/70 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium">
                  Chat live, post on the feed, buy & sell on the marketplace, and create with AI — every feature you need, right here.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <Link
                    to={user ? "/post-ad" : "/signup"}
                    className="group relative inline-flex items-center justify-center gap-2 pl-3 pr-6 py-3 rounded-2xl overflow-hidden bg-white text-black font-ticket-body font-bold text-sm sm:text-base transition-all duration-300 hover:scale-[1.04] active:scale-95 w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fc9d03]/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-[#fc9d03]/60 transition-all duration-300" />
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-black/10 group-hover:rotate-12 transition-transform">
                      <FaCamera className="text-xs" />
                    </span>
                    <span className="relative">{user ? "Start posting" : "Get started free"}</span>
                    <FaArrowRight className="text-xs relative group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/feed"
                    className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl overflow-hidden border border-white/30 font-ticket-body font-bold text-sm sm:text-base text-white transition-all duration-300 hover:scale-[1.04] active:scale-95 w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 bg-[#fc9d03] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <FaStore className="text-xs relative z-10 transition-transform group-hover:scale-110" />
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-black">Open the app</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;