// src/pages/AIChatpromt.jsx — APNaDeal AI · Minimal ChatGPT-style + Images Gallery
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaSearch, FaPaperPlane, FaMicrophone, FaStop,
  FaCopy, FaCheck, FaTrash, FaCog,
  FaBars, FaTimes, FaThumbsUp,
  FaCoins, FaCrown, FaStore, FaImage, FaTimesCircle,
} from "react-icons/fa";
import { FaPenToSquare, FaImages, FaBookOpen, FaWandMagicSparkles } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { generateWithChat } from "../lib/pollinations";
import { supabase } from "../lib/supabase";
import {
  loadConversationsFromDB,
  saveConversationToDB,
  deleteConversationFromDB,
  clearAllConversationsFromDB,
} from "../lib/chatStorage";
import {
  loadUserCredits,
  deductUserCredits,
  addUserCredits,
} from "../lib/imageStorage";
import PremiumCreditsModal from "../components/PremiumCreditsModal";
import AIRailSidebar from "./AIRailSidebar";
/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */
const BRAND_NAME = "APNaDeal AI";
const BRAND_SHORT = "APNaDeal";
const INITIAL_CREDITS = 30;
const COST_PER_MESSAGE = 10;
const SIDEBAR_STATE_KEY = "apnadeal_chat_sidebar_collapsed";

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPT
   ═══════════════════════════════════════════════════════════════ */
const APNADEAL_SYSTEM_PROMPT = `
You are **APNaDeal AI** — the official AI assistant for APNaDeal, Pakistan's fastest-growing online marketplace.

IDENTITY:
- Friendly, helpful, confident — like a top-tier customer support agent.
- Warm, conversational tone. Short sentences. No corporate jargon.
- Reply in English, Urdu, or Roman Urdu — match the user's language.
- Proud of APNaDeal but never spammy. Honest, useful answers.
- Always guide to the next step (browse, post an ad, contact support).

ABOUT APNADEAL:
Pakistan's fastest-growing online marketplace where buyers and sellers trade new and used products — mobiles, vehicles, property, electronics, fashion, home goods.

Tagline: "Post your ad right now — AI handles everything, and your item sells fast."

Stats: 500K+ users · 2M+ products sold · 50K+ sellers · 4.9★
Cities: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta.

SPECIAL:
- AI-powered ad creation (images, videos, background removal)
- Escrow-protected checkout
- Live seller chat
- Social feed
- 2–4 day delivery across Pakistan

CATEGORIES:
1. Mobiles & Tablets
2. Electronics
3. Vehicles
4. Property
5. Fashion
6. Home & Living
7. Sports & Hobbies
8. Collectibles

PLANS (PKR):
- Starter — Free: 1 listing, 3 AI images/mo, chat, escrow
- Seller — Rs 500/mo or Rs 5,000/yr: 30 listings, 30 AI images/mo, 1 boost/mo, verified badge, priority
- Pro Seller — Rs 1,500/mo or Rs 15,000/yr: unlimited listings, 200 AI images/mo, 4 boosts/mo, analytics, gold badge

SELLING:
1. Free account → 2. Upgrade plan → 3. Post ad (upload or AI images) → 4. Add price/details → 5. Publish → 6. Chat buyers → 7. Ship after payment

BUYING:
1. Browse/search → 2. Filter (city, price, condition) → 3. Chat seller → 4. Pay (COD, Easypaisa, JazzCash, bank) → 5. Track → 6. Receive in 2–4 days → 7. Confirm (escrow releases)

PAYMENT: COD, Easypaisa, JazzCash, Bank (Meezan, HBL, UBL)
DELIVERY: 2–4 business days · free over Rs 5,000 · 7-day returns

AI TOOLS:
- AI Product Images (4K, commercial quality)
- AI Video Generation
- Background Remover
- AI Ad Copywriter
- Smart Pricing
- Boost Optimizer

SUPPORT:
- Email: contact@apnadeal.com
- Phone/WhatsApp: +92 314 0972575
- Location: Islamabad, Bahria, Pakistan
- In-app chat: 24/7

BEHAVIOR:
1. Match language (EN / اردو / Roman Urdu)
2. Be concise — short paragraphs, bullets, no walls of text
3. End with a helpful next step
4. Use markdown: **bold**, *italic*, \`code\`, ## headings, - bullets
5. Never invent facts — if unsure, give support contact
6. Sparing emojis (🎉 ✅ 🚀 💡)
7. Suggest relevant features naturally
8. Direct account-specific issues to in-app support
9. Always add one useful tip

IMPORTANT — Do NOT confuse APNaDeal with any similarly-named P2P lending platform in India. APNaDeal is a product marketplace — we do NOT offer loans, interest, or lending.
`;

/* ═══════════════════════════════════════════════════════════════
   GALLERY DATA (matching the screenshot)
   ═══════════════════════════════════════════════════════════════ */
const IMAGE_TEMPLATES = [
  { id: "sketch",    label: "Sketch",            bg: "#E8E8E8", render: "sketch" },
  { id: "stickers",  label: "Stickers",          bg: "#FCD34D", render: "stickers" },
  { id: "80s",       label: "'80s flashback",    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80" },
  { id: "caricature",label: "Create a caricature", bg: "#F0F0F0" },
  { id: "anime",     label: "Anime",             img: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80" },
  { id: "underwater",label: "Underwater",        bg: "#F0F0F0" },
  { id: "pin",       label: "Pin collection",    bg: "#F0F0F0" },
  { id: "handwriting",label:"Handwritten style", bg: "#F0F0F0" },
  { id: "interior",  label: "Interior",          img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80" },
  { id: "portrait",  label: "Portrait",          bg: "#F0F0F0" },
  { id: "cartoon",   label: "Cartoon",           img: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?auto=format&fit=crop&w=400&q=80" },
];

/* ═══════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   THEME — matches AIRailSidebar colors
   ═══════════════════════════════════════════════════════════════ */
const LIGHT = {
  /* App backgrounds */
  appBg: "#FFFFFF",
  sidebarBg: "#FFFFFF",
  sidebarActive: "rgba(20,20,30,0.06)",
  sidebarHover: "rgba(20,20,30,0.04)",
  chatBg: "#FFFFFF",
  bubbleUser: "rgba(20,20,30,0.05)",

  /* Text — matches navbar light tokens */
  txt: "#0D0D0D",
  txtSoft: "rgba(20,20,30,0.62)",
  txtFaint: "rgba(20,20,30,0.42)",

  /* Lines — matches navbar */
  line: "rgba(20,20,30,0.08)",
  lineSoft: "rgba(20,20,30,0.05)",

  /* Brand — same amber as navbar */
  primary: "#eb7d34",
  primary2: "#f59e0b",
  primarySoft: "rgba(235,125,52,0.10)",
  accent: "#eb7d34",
  danger: "#EF4444",

  /* Inputs */
  inputBg: "#FFFFFF",
  inputBorder: "rgba(20,20,30,0.10)",
  inputShadow: "0 4px 20px rgba(20,20,30,0.06), 0 0 0 1px rgba(255,255,255,0.9) inset",
  btnHover: "rgba(20,20,30,0.05)",
  codeBg: "rgba(20,20,30,0.05)",
  cardBg: "rgba(20,20,30,0.04)",
};

const DARK = {
  /* App backgrounds */
  appBg: "#0A0A12",
  sidebarBg: "#0F0F14",
  sidebarActive: "rgba(255,255,255,0.06)",
  sidebarHover: "rgba(255,255,255,0.04)",
  chatBg: "#0A0A12",
  bubbleUser: "rgba(255,255,255,0.06)",

  /* Text — matches navbar dark tokens */
  txt: "#FFFFFF",
  txtSoft: "rgba(255,255,255,0.70)",
  txtFaint: "rgba(255,255,255,0.45)",

  /* Lines — matches navbar */
  line: "rgba(255,255,255,0.08)",
  lineSoft: "rgba(255,255,255,0.05)",

  /* Brand — same amber as navbar */
  primary: "#eb7d34",
  primary2: "#f59e0b",
  primarySoft: "rgba(235,125,52,0.14)",
  accent: "#eb7d34",
  danger: "#EF4444",

  /* Inputs */
  inputBg: "rgba(20,20,30,0.6)",
  inputBorder: "rgba(255,255,255,0.10)",
  inputShadow: "0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset",
  btnHover: "rgba(255,255,255,0.06)",
  codeBg: "rgba(255,255,255,0.06)",
  cardBg: "rgba(255,255,255,0.04)",
};

/* ═══════════════════════════════════════════════════════════════
   MEDIA QUERY
   ═══════════════════════════════════════════════════════════════ */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    m.addEventListener ? m.addEventListener("change", onChange) : m.addListener(onChange);
    return () => {
      m.removeEventListener ? m.removeEventListener("change", onChange) : m.removeListener(onChange);
    };
  }, [query]);
  return matches;
};

/* ═══════════════════════════════════════════════════════════════
   QUICK PROMPTS
   ═══════════════════════════════════════════════════════════════ */
const QUICK_PROMPTS = [
  { label: "How to sell an item?",      prompt: "Explain how I can post my first ad on APNaDeal. Steps, plan to pick, and one pro tip." },
  { label: "Compare plans",             prompt: "Compare APNaDeal's Starter, Seller, and Pro Seller plans. I sell ~15 items/month — which fits me?" },
  { label: "How does escrow work?",     prompt: "Explain APNaDeal's escrow system and buyer protection. What if I get a wrong or damaged item?" },
  { label: "Generate AI product photo", prompt: "Show me how APNaDeal's AI image generator works. Give steps and a sample prompt for a premium smartphone photo." },
];

/* ═══════════════════════════════════════════════════════════════
   FORMATTED TEXT
   ═══════════════════════════════════════════════════════════════ */
const FormattedText = ({ text, T }) => {
  if (!text) return null;
  const lines = text.split("\n");

  const renderInline = (str, keyPrefix = "") => {
    const parts = [];
    let i = 0, key = 0;
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+?)`)/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > i) parts.push(str.slice(i, match.index));
      if (match[2]) parts.push(<strong key={`${keyPrefix}-b-${key++}`} style={{ fontWeight: 700 }}>{match[2]}</strong>);
      else if (match[4]) parts.push(<em key={`${keyPrefix}-i-${key++}`}>{match[4]}</em>);
      else if (match[6]) parts.push(
        <code key={`${keyPrefix}-c-${key++}`} style={{
          background: T.codeBg, color: T.txt,
          padding: "2px 6px", borderRadius: 5,
          fontSize: "0.9em", fontFamily: "'JetBrains Mono', monospace",
        }}>{match[6]}</code>
      );
      i = match.index + match[0].length;
    }
    if (i < str.length) parts.push(str.slice(i));
    return parts;
  };

  const elements = [];
  let listBuffer = null, key = 0;

  const flushList = () => {
    if (!listBuffer) return;
    const ListTag = listBuffer.type === "ol" ? "ol" : "ul";
    elements.push(
      <ListTag key={`list-${key++}`} style={{
        margin: "8px 0", paddingLeft: 22,
        display: "flex", flexDirection: "column", gap: 6,
        listStyle: listBuffer.type === "ol" ? "decimal" : "disc",
      }}>
        {listBuffer.items.map((item, idx) => (
          <li key={idx} style={{ fontSize: 15, lineHeight: 1.7 }}>{renderInline(item, `li-${key}-${idx}`)}</li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    if (line.trim() === "") { flushList(); elements.push(<div key={`sp-${idx}`} style={{ height: 10 }} />); return; }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const sizes = { 1: 21, 2: 18, 3: 16 };
      elements.push(
        <div key={`h-${idx}`} style={{
          fontSize: sizes[level] || 16, fontWeight: 700,
          margin: "16px 0 8px", color: T.txt,
        }}>{renderInline(headingMatch[2], `h-${idx}`)}</div>
      );
      return;
    }
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (!listBuffer || listBuffer.type !== "ul") { flushList(); listBuffer = { type: "ul", items: [] }; }
      listBuffer.items.push(bulletMatch[1]); return;
    }
    const numMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numMatch) {
      if (!listBuffer || listBuffer.type !== "ol") { flushList(); listBuffer = { type: "ol", items: [] }; }
      listBuffer.items.push(numMatch[1]); return;
    }
    flushList();
    elements.push(
      <p key={`p-${idx}`} style={{
        fontSize: 15, lineHeight: 1.75, margin: "6px 0",
        wordBreak: "break-word", color: T.txt,
      }}>{renderInline(line, `p-${idx}`)}</p>
    );
  });

  flushList();
  return <div style={{ display: "flex", flexDirection: "column" }}>{elements}</div>;
};

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════════════════ */
const useTypewriter = (fullText, enabled, speed = 6) => {
  const [displayed, setDisplayed] = useState(enabled ? "" : fullText);
  useEffect(() => {
    if (!enabled) { setDisplayed(fullText); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [fullText, enabled, speed]);
  return displayed;
};

/* ═══════════════════════════════════════════════════════════════
   AI MESSAGE
   ═══════════════════════════════════════════════════════════════ */
const AIMessage = ({ msg, isNewest, onCopy, copied, T }) => {
  const typed = useTypewriter(msg.content, isNewest, 6);
  return (
    <div style={{ maxWidth: "100%", width: "100%" }}>
      <FormattedText text={typed} T={T} />
      {isNewest && typed.length < msg.content.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            display: "inline-block", width: 2, height: 15,
            background: T.txt, marginLeft: 2, verticalAlign: "middle", borderRadius: 2,
          }}
        />
      )}
      {typed.length >= msg.content.length && (
        <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
          <IconBtn onClick={() => onCopy(msg.id, msg.content)} title="Copy" T={T}>
            {copied ? <><FaCheck style={{ fontSize: 10 }} /> Copied</> : <><FaCopy style={{ fontSize: 10 }} /> Copy</>}
          </IconBtn>
          <IconBtn title="Helpful" T={T}>
            <FaThumbsUp style={{ fontSize: 10 }} /> Helpful
          </IconBtn>
        </div>
      )}
    </div>
  );
};

const IconBtn = ({ onClick, title, children, T }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      background: "transparent", border: "none",
      color: T.txtFaint, fontSize: 12, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 8px", fontFamily: "inherit", borderRadius: 6,
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = T.btnHover)}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    {children}
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const AIChatpromt = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  });
  const T = theme === "light" ? LIGHT : DARK;

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("theme-light") ? "light" : "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

    const toggleTheme = () => {
    const isLight = document.documentElement.classList.contains("theme-light");
    document.documentElement.classList.toggle("theme-light", !isLight);
    setTheme(!isLight ? "light" : "dark");
  };

  /* Sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved == null ? false : saved === "true";
    } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  /* View mode — "chat" or "images" */
  const [viewMode, setViewMode] = useState("chat");

  /* Chat state */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [newestAIId, setNewestAIId] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [hoveredHistoryId, setHoveredHistoryId] = useState(null);

  /* Image attachment */
  const [attachedImage, setAttachedImage] = useState(null); // base64
  const fileInputRef = useRef(null);

  /* Voice */
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);

  /* Credits */
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [creditsLoaded, setCreditsLoaded] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  /* User */
  const [userProfile, setUserProfile] = useState({
    name: "APNaDeal User",
    email: "",
    avatar: null,
    plan: "Free",
  });

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Load profile ── */
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setUserProfile({ name: "Guest", email: "", avatar: null, plan: "Free" });
          return;
        }
        const meta = user.user_metadata || {};
        const fallbackName =
          meta.full_name || meta.name || meta.display_name ||
          (user.email || "").split("@")[0] || "APNaDeal User";

        let savedName = null, savedAvatar = null, isPremium = false;
        try {
          const { data: settings } = await supabase
            .from("user_settings").select("full_name, avatar")
            .eq("user_id", user.id).maybeSingle();
          if (settings) {
            savedName = settings.full_name || null;
            savedAvatar = settings.avatar || null;
          }
        } catch {}
        try {
          const { data: usrRow } = await supabase
            .from("users").select("is_premium").eq("id", user.id).maybeSingle();
          isPremium = usrRow?.is_premium === true;
        } catch {}

        if (!cancelled) {
          setUserProfile({
            name: savedName || fallbackName,
            email: user.email || "",
            avatar: savedAvatar,
            plan: isPremium ? "Plus" : "Free",
          });
        }
      } catch (err) { console.warn("Profile load failed:", err); }
    };
    loadProfile();
    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, []);

  /* ── Load credits ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await loadUserCredits();
      if (!cancelled) { setCredits(c); setCreditsLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Load history ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadConversationsFromDB();
      if (!cancelled) setHistory(list);
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  /* ── ESC closes mobile sidebar ── */
  useEffect(() => {
    if (!isMobile) return;
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile]);

  /* ── Voice ── */
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice not supported. Try Chrome."); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      if (final) {
        setInput((p) => (p ? p + " " : "") + final.trim() + " ");
        setInterimText("");
      } else setInterimText(interim);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => { setIsRecording(false); setInterimText(""); };
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
    setError(null);
  };
  const stopVoice = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsRecording(false);
    setInterimText("");
  };
  const toggleRecording = () => (isRecording ? stopVoice() : startVoice());

  /* ── Image upload ── */
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target?.result || null);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const removeAttachment = () => setAttachedImage(null);

  /* ── Persist ── */
  const persistConversation = useCallback(async (msgs) => {
    if (msgs.length < 2) return;
    const firstUser = msgs.find((m) => m.role === "user");
    const title = firstUser?.content?.slice(0, 50) || "New chat";
    const saved = await saveConversationToDB({
      id: activeConversationId || null, title, messages: msgs,
    });
    if (saved) {
      setActiveConversationId(saved.id);
      const entry = {
        id: saved.id, title: saved.title,
        ts: new Date(saved.updated_at).getTime(),
        messages: saved.messages,
      };
      setHistory((prev) => [entry, ...prev.filter((h) => h.id !== entry.id)].slice(0, 50));
    }
  }, [activeConversationId]);

  /* ── Send ── */
  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    const hasImage = !!attachedImage;

    if ((!text && !hasImage) || isSending) return;

    if (credits < COST_PER_MESSAGE) {
      setError("Out of credits. Top up to continue.");
      setShowPremium(true);
      return;
    }

    setError(null);
    setInput("");
    setNewestAIId(null);

    const newBal = await deductUserCredits(COST_PER_MESSAGE);
    if (newBal === null) { setError("Failed to deduct credits."); return; }
    setCredits(newBal);

    const userMsg = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      image: attachedImage || null,
    };
    setAttachedImage(null);

    const next = [...messages, userMsg];
    setMessages(next);
    setIsSending(true);

    try {
      const promptForAI = text || "What do you think of this image?";
      const reply = await generateWithChat({
        system: APNADEAL_SYSTEM_PROMPT,
        message: promptForAI,
      });
      const aiId = `a_${Date.now()}`;
      const finalMsgs = [...next, { id: aiId, role: "assistant", content: reply }];
      setMessages(finalMsgs);
      setNewestAIId(aiId);
      await persistConversation(finalMsgs);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to get a response");
      const refunded = await addUserCredits(COST_PER_MESSAGE);
      if (refunded !== null) setCredits(refunded);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [input, isSending, messages, persistConversation, credits, attachedImage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    } catch {}
  };

  const handleNewChat = async () => {
    if (isRecording) stopVoice();
    if (messages.length >= 2) {
      const firstUser = messages.find((m) => m.role === "user");
      const title = firstUser?.content?.slice(0, 50) || "New chat";
      const saved = await saveConversationToDB({
        id: activeConversationId || null, title, messages,
      });
      if (saved) {
        const entry = {
          id: saved.id, title: saved.title,
          ts: new Date(saved.updated_at).getTime(),
          messages: saved.messages,
        };
        setHistory((prev) => [entry, ...prev.filter((h) => h.id !== entry.id)].slice(0, 50));
      }
    }
    setMessages([]);
    setError(null);
    setInput("");
    setAttachedImage(null);
    setNewestAIId(null);
    setActiveConversationId(null);
    setViewMode("chat");
    if (isMobile) setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleLoadHistory = (entry) => {
    setMessages(entry.messages);
    setNewestAIId(null);
    setActiveConversationId(entry.id);
    setViewMode("chat");
    if (isMobile) setSidebarOpen(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await deleteConversationFromDB(id);
  };

  const handleClearAll = async () => {
    setHistory([]);
    setActiveConversationId(null);
    setMessages([]);
    await clearAllConversationsFromDB();
  };

  const openImagesView = () => {
    setViewMode("images");
    if (isMobile) setSidebarOpen(false);
  };

  const showWelcome = viewMode === "chat" && messages.length === 0 && !isSending;
  const isLight = theme === "light";
  const isOutOfCredits = creditsLoaded && credits < COST_PER_MESSAGE;

  const toggleSidebar = () => {
    if (isMobile) setSidebarOpen((v) => !v);
    else setSidebarCollapsed((v) => !v);
  };

  /* ═══════════════════════════════════════════════════════════════
     SIDEBAR
     ═══════════════════════════════════════════════════════════════ */
  const SidebarContent = () => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: T.sidebarBg, color: T.txt,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
         {/* Top */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "76px 14px 12px",
        gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: T.txt }}>
          {BRAND_SHORT} AI
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            type="button" title="Search"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              color: T.txtSoft, display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FaSearch style={{ fontSize: 13 }} />
          </button>
          <button
            type="button" title="Collapse"
            onClick={() => isMobile ? setSidebarOpen(false) : setSidebarCollapsed(true)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              color: T.txtSoft, display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3a1 1 0 0 1 1-1h2v12H3a1 1 0 0 1-1-1V3Zm5-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7V2Z" opacity="0.85" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
        <SidebarBtn icon={<FaPenToSquare style={{ fontSize: 14 }} />} label="New chat" onClick={handleNewChat} active={viewMode === "chat" && messages.length === 0} T={T} />
        <SidebarBtn icon={<FaImages style={{ fontSize: 14 }} />} label="Images" onClick={openImagesView} active={viewMode === "images"} T={T} />
        <SidebarBtn icon={<FaBookOpen style={{ fontSize: 14 }} />} label="Library" onClick={() => { if (isMobile) setSidebarOpen(false); navigate("/library"); }} T={T} />
        <SidebarBtn icon={<FaStore style={{ fontSize: 14 }} />} label="Browse" onClick={() => { if (isMobile) setSidebarOpen(false); navigate("/library"); }} T={T} />
        <SidebarBtn icon={<FaCrown style={{ fontSize: 14 }} />} label="Plans" onClick={() => { if (isMobile) setSidebarOpen(false); navigate("/plans"); }} T={T} />
      </div>

      {/* Recents */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 8px 0" }} className="apnadeal-scroll">
        {history.length > 0 && (
          <>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 6px 4px",
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.txtFaint, letterSpacing: "0.04em" }}>
                Recents
              </span>
              <button
                type="button" onClick={handleClearAll} title="Clear all"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: T.txtFaint, fontSize: 11, padding: 2,
                }}
              >
                <FaTrash style={{ fontSize: 10 }} />
              </button>
            </div>
            {history.map((h) => {
              const active = activeConversationId === h.id && viewMode === "chat";
              const hovered = hoveredHistoryId === h.id;
              return (
                <div
                  key={h.id}
                  onMouseEnter={() => setHoveredHistoryId(h.id)}
                  onMouseLeave={() => setHoveredHistoryId(null)}
                  style={{ position: "relative" }}
                >
                  <button
                    type="button"
                    onClick={() => handleLoadHistory(h)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "8px 30px 8px 10px", borderRadius: 8,
                      background: active ? T.sidebarActive : hovered ? T.sidebarHover : "transparent",
                      border: "none", color: T.txt, fontSize: 13.5,
                      fontFamily: "inherit", cursor: "pointer",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      transition: "background 0.12s",
                    }}
                    title={h.title}
                  >
                    {h.title}
                  </button>
                  {hovered && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, h.id)}
                      title="Delete"
                      style={{
                        position: "absolute", right: 6, top: "50%",
                        transform: "translateY(-50%)",
                        width: 22, height: 22, borderRadius: 6,
                        background: "transparent", border: "none",
                        color: T.txtFaint, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <FaTrash style={{ fontSize: 10 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom */}
      <div style={{ padding: 10, flexShrink: 0, borderTop: `1px solid ${T.lineSoft}` }}>
        <button
          type="button"
          onClick={() => setShowPremium(true)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10,
            background: "transparent", border: "none", cursor: "pointer",
            color: T.txt, fontFamily: "inherit", textAlign: "left",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.sidebarHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: isOutOfCredits ? "rgba(239,68,68,0.12)" : "rgba(16,163,127,0.12)",
            color: isOutOfCredits ? T.danger : T.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <FaCoins style={{ fontSize: 12 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.txt }}>
              {creditsLoaded ? credits : "—"} credits
            </div>
            <div style={{ fontSize: 11, color: T.txtFaint, marginTop: 1 }}>
              {isOutOfCredits ? "Top up to continue" : `${COST_PER_MESSAGE} per message`}
            </div>
          </div>
        </button>

        {/* User — click NO LONGER navigates */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10,
            marginTop: 2,
          }}
        >
          {userProfile.avatar ? (
            <img
              src={userProfile.avatar} alt=""
              style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: T.accent, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {(userProfile.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: T.txt,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {userProfile.name}
            </div>
            <div style={{
              fontSize: 11, color: T.txtFaint, marginTop: 1,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {userProfile.plan}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
          <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",
        background: T.appBg,
        color: T.txt,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* ═══ TOP NAVBAR ═══ */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 90,
      }}>
        <AIRailSidebar theme={theme} onToggleTheme={toggleTheme} />
      </div>
      {/* Desktop sidebar */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{
            width: sidebarCollapsed ? 0 : 260,
            opacity: sidebarCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            flexShrink: 0,
            height: "100vh",
            overflow: "hidden",
            borderRight: sidebarCollapsed ? "none" : `1px solid ${T.lineSoft}`,
            background: T.sidebarBg,
          }}
        >
          <div style={{ width: 260, height: "100vh" }}>
            <SidebarContent />
          </div>
        </motion.aside>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              key="mask"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.5)", zIndex: 100,
              }}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0,
                width: 280, maxWidth: "85vw",
                zIndex: 101, background: T.sidebarBg,
                borderRight: `1px solid ${T.lineSoft}`,
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* ═══ MAIN ═══ */}
      <div style={{
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        background: T.chatBg,
        position: "relative",
        height: "100vh",
        paddingTop: 64,
        boxSizing: "border-box",
      }}>
        {/* Top bar — hover-only controls, no text */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "10px 16px", flexShrink: 0, minHeight: 48,
        }}>
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Show chats"
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: "transparent", border: "none", cursor: "pointer",
                color: T.txtFaint,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.btnHover;
                e.currentTarget.style.color = T.txt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = T.txtFaint;
              }}
            >
              <FaBars style={{ fontSize: 15 }} />
            </button>
          )}

          {!isMobile && sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              title="Show sidebar"
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: "transparent", border: "none", cursor: "pointer",
                color: T.txtFaint,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.btnHover;
                e.currentTarget.style.color = T.txt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = T.txtFaint;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3a1 1 0 0 1 1-1h2v12H3a1 1 0 0 1-1-1V3Zm5-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7V2Z" opacity="0.85" />
              </svg>
            </button>
          )}
        </div>

     {viewMode === "images" && (
  <ImagesView
    T={T}
    isMobile={isMobile}
    onBack={() => setViewMode("chat")}
  />
)}
              {/* ═══ CHAT WELCOME ═══ */}
        {showWelcome && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: isMobile ? "0 16px 40px" : "0 24px 60px",
            minHeight: 0,
            overflowY: "auto",
            position: "relative",
          }} className="apnadeal-scroll">

            {/* Ambient glow blobs */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "15%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(700px, 80vw)",
                height: "min(700px, 80vw)",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${T.primarySoft} 0%, transparent 65%)`,
                filter: "blur(80px)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            <div style={{
              width: "100%",
              maxWidth: 760,
              textAlign: "center",
              position: "relative",
              zIndex: 1,
              paddingTop: isMobile ? 20 : 0,
            }}>

              {/* ── Badge ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px 6px 8px",
                  marginBottom: 24,
                  borderRadius: 999,
                  background: T.cardBg,
                  border: `1px solid ${T.line}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaWandMagicSparkles style={{ fontSize: 10, color: "#fff" }} />
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    color: T.txtSoft,
                  }}
                >
                  Powered by APNaDeal AI
                </span>
             
              </motion.div>
              {/* ── Heading ── */}
              <motion.h1
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: isMobile ? "clamp(36px, 10vw, 48px)" : "clamp(52px, 5.5vw, 72px)",
                  fontWeight: 900,
                  letterSpacing: "-0.045em",
                  lineHeight: 0.98,
                  margin: "0 0 20px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: T.txt,
                  textWrap: "balance",
                  WebkitTextStroke: isMobile ? undefined : "0.4px transparent",
                }}
              >
                Ready when{" "}
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 55%, ${T.primary} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontStyle: "italic",
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                    paddingRight: "0.08em",
                  }}
                >
                  you are
                  {/* Soft amber glow under the accent */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      filter: "blur(24px)",
                      opacity: 0.35,
                      zIndex: -1,
                      pointerEvents: "none",
                    }}
                  />
                </span>
                <span
                  style={{
                    color: T.primary,
                    fontWeight: 900,
                  }}
                >
                  .
                </span>
              </motion.h1>
              {/* ── Subtitle ── */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                style={{
                  fontSize: isMobile ? 14 : 15.5,
                  lineHeight: 1.6,
                  color: T.txtSoft,
                  margin: "0 auto 40px",
                  maxWidth: 540,
                  fontWeight: 400,
                }}
              >
                Ask anything about selling, buying, plans, or AI tools on
                Pakistan's fastest-growing marketplace.
              </motion.p>

              {/* ── Input ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  borderRadius: 26,
                }}
              >
                <InputBar
                  T={T}
                  input={input}
                  setInput={setInput}
                  interimText={interimText}
                  setInterimText={setInterimText}
                  inputRef={inputRef}
                  onSend={() => handleSend()}
                  onKeyDown={handleKeyDown}
                  isSending={isSending}
                  isRecording={isRecording}
                  onToggleRecording={toggleRecording}
                  isOutOfCredits={isOutOfCredits}
                  attachedImage={attachedImage}
                  onRemoveAttachment={removeAttachment}
                  onPickImage={() => fileInputRef.current?.click()}
                  large
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  style={{ display: "none" }}
                />
              </motion.div>

              {/* ── Section label ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 36,
                  marginBottom: 14,
                  width: "100%",
                }}
              >
                <div style={{ flex: 1, height: 1, background: T.line }} />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: T.txtFaint,
                  }}
                >
                  Try asking
                </span>
                <div style={{ flex: 1, height: 1, background: T.line }} />
              </motion.div>

              {/* ── Suggestion cards ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                  width: "100%",
                }}
              >
                {QUICK_PROMPTS.map((q, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => handleSend(q.prompt)}
                    disabled={isOutOfCredits}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.35 }}
                    whileHover={!isOutOfCredits ? { y: -2 } : {}}
                    whileTap={!isOutOfCredits ? { scale: 0.98 } : {}}
                    style={{
                      position: "relative",
                      padding: "16px 18px",
                      borderRadius: 16,
                      background: T.cardBg,
                      border: `1px solid ${T.line}`,
                      color: T.txt,
                      fontSize: isMobile ? 13.5 : 14,
                      fontWeight: 500,
                      fontFamily: "inherit",
                      cursor: isOutOfCredits ? "not-allowed" : "pointer",
                      opacity: isOutOfCredits ? 0.5 : 1,
                      textAlign: "left",
                      transition: "background 0.18s, border-color 0.18s, transform 0.18s",
                      lineHeight: 1.4,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.btnHover;
                      e.currentTarget.style.borderColor = `${T.primary}55`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = T.cardBg;
                      e.currentTarget.style.borderColor = T.line;
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: `${T.primary}1A`,
                        border: `1px solid ${T.primary}33`,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: T.primary,
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>{q.label}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: T.txtFaint,
                        flexShrink: 0,
                        transition: "color 0.18s",
                      }}
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ))}
              </motion.div>

              {/* ── Error ── */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 24,
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: T.danger,
                    fontSize: 13,
                    display: "inline-block",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          </div>
        )}
        {/* ═══ CHAT THREAD ═══ */}
        {viewMode === "chat" && !showWelcome && (
          <>
            <div
              ref={scrollRef}
              className="apnadeal-scroll"
              style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
            >
              <div style={{
                maxWidth: 760, width: "100%", margin: "0 auto",
                padding: isMobile ? "16px 16px 24px" : "24px 24px 32px",
                display: "flex", flexDirection: "column", gap: 28,
              }}>
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  const isNewest = msg.id === newestAIId;

                  if (isUser) {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <div style={{
                          display: "flex", flexDirection: "column", gap: 8,
                          alignItems: "flex-end", maxWidth: "80%",
                        }}>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="attachment"
                              style={{
                                maxWidth: 260,
                                maxHeight: 260,
                                borderRadius: 14,
                                objectFit: "cover",
                                border: `1px solid ${T.line}`,
                              }}
                            />
                          )}
                          {msg.content && (
                            <div style={{
                              padding: "12px 18px",
                              borderRadius: 20,
                              background: T.bubbleUser,
                              color: T.txt,
                              fontSize: 15,
                              lineHeight: 1.65,
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              fontFamily: "'Inter', system-ui, sans-serif",
                            }}>
                              {msg.content}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        flexShrink: 0, background: T.accent, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 2,
                      }}>
                        <FaStore style={{ fontSize: 12 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <AIMessage
                          msg={msg} isNewest={isNewest}
                          onCopy={handleCopy} copied={copiedId === msg.id} T={T}
                        />
                      </div>
                    </motion.div>
                  );
                })}

                {isSending && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: T.accent, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <FaStore style={{ fontSize: 12 }} />
                    </div>
                    <div style={{ paddingTop: 8, display: "flex", gap: 5 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                          style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: T.txtSoft, display: "inline-block",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom input */}
            <div style={{
              padding: isMobile ? "8px 12px 16px" : "8px 24px 24px",
              flexShrink: 0,
            }}>
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <InputBar
                  T={T}
                  input={input}
                  setInput={setInput}
                  interimText={interimText}
                  setInterimText={setInterimText}
                  inputRef={inputRef}
                  onSend={() => handleSend()}
                  onKeyDown={handleKeyDown}
                  isSending={isSending}
                  isRecording={isRecording}
                  onToggleRecording={toggleRecording}
                  isOutOfCredits={isOutOfCredits}
                  attachedImage={attachedImage}
                  onRemoveAttachment={removeAttachment}
                  onPickImage={() => fileInputRef.current?.click()}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  style={{ display: "none" }}
                />
                <div style={{
                  textAlign: "center", marginTop: 10,
                  fontSize: 11, color: T.txtFaint,
                }}>
                  {BRAND_NAME} can make mistakes. Verify important info.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Premium modal */}
      <PremiumCreditsModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        userCredits={credits}
        onSubscribe={async (planId) => console.log("Subscribe:", planId)}
        onBuyCredits={async (packId, creditAmount) => {
          const newBal = await addUserCredits(creditAmount);
          if (newBal !== null) setCredits(newBal);
          setShowPremium(false);
        }}
      />

      <style>{`
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.2); border-radius: 999px; }
        *::-webkit-scrollbar-thumb:hover { background: rgba(127,127,127,0.35); }
        .apnadeal-scroll::-webkit-scrollbar { width: 6px; }
      `}</style>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR BUTTON
   ═══════════════════════════════════════════════════════════════ */
const SidebarBtn = ({ icon, label, onClick, active, T }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "9px 12px", borderRadius: 9,
        background: active ? T.sidebarActive : hover ? T.sidebarHover : "transparent",
        border: "none", color: T.txt, fontSize: 13.5, fontWeight: 500,
        fontFamily: "inherit", cursor: "pointer", textAlign: "left",
        width: "100%", transition: "background 0.12s",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", color: T.txtSoft }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   INPUT BAR
   ═══════════════════════════════════════════════════════════════ */
const InputBar = ({
  T, input, setInput, interimText, setInterimText,
  inputRef, onSend, onKeyDown, isSending, isRecording,
  onToggleRecording, isOutOfCredits,
  attachedImage, onRemoveAttachment, onPickImage,
  large = false,
}) => {
  const [focused, setFocused] = useState(false);
  const canSend = (input.trim() || attachedImage) && !isSending && !isOutOfCredits;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      borderRadius: 26,
      background: T.inputBg,
      border: `1px solid ${focused ? T.txtFaint : T.inputBorder}`,
      transition: "border-color 0.15s",
      overflow: "hidden",
    }}>
      {/* Attachment preview */}
      {attachedImage && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px 0",
        }}>
          <div style={{ position: "relative" }}>
            <img
              src={attachedImage} alt="attachment"
              style={{
                width: 60, height: 60, borderRadius: 10,
                objectFit: "cover", border: `1px solid ${T.line}`,
              }}
            />
            <button
              type="button"
              onClick={onRemoveAttachment}
              title="Remove image"
              style={{
                position: "absolute", top: -6, right: -6,
                width: 20, height: 20, borderRadius: "50%",
                background: T.txt, color: T.chatBg,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FaTimes style={{ fontSize: 9 }} />
            </button>
          </div>
          <span style={{ fontSize: 12, color: T.txtFaint }}>Image attached</span>
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "flex-end", gap: 8,
        padding: large ? "14px 16px" : "10px 12px",
      }}>
        {/* Plus / Upload */}
        <button
          type="button"
          onClick={onPickImage}
          title="Upload image"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "transparent", border: "none",
            color: T.txtSoft, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.btnHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <FaPlus style={{ fontSize: 14 }} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input + (interimText ? (input ? " " : "") + interimText : "")}
          onChange={(e) => { setInput(e.target.value); setInterimText(""); }}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            isRecording ? "Listening…"
              : isOutOfCredits ? "Out of credits — top up to continue"
              : large ? "Describe a new image" : "Ask anything"
          }
          disabled={isSending || isOutOfCredits}
          style={{
            flex: 1, background: "transparent",
            border: "none", outline: "none",
            color: T.txt, fontSize: large ? 15.5 : 15,
            fontFamily: "inherit", padding: "8px 4px",
            minWidth: 0, lineHeight: 1.5,
            opacity: isOutOfCredits ? 0.6 : 1,
          }}
        />

        <button
          type="button"
          onClick={onToggleRecording}
          title={isRecording ? "Stop recording" : "Voice input"}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: isRecording ? T.danger : "transparent",
            border: "none", color: isRecording ? "#fff" : T.txtSoft,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s, color 0.15s",
          }}
        >
          {isRecording ? <FaStop style={{ fontSize: 11 }} /> : <FaMicrophone style={{ fontSize: 13 }} />}
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          title="Send"
          style={{
            width: large ? 36 : 34, height: large ? 36 : 34,
            borderRadius: "50%", border: "none",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: canSend ? T.primary : T.bubbleUser,
            color: canSend ? (T.primary === "#FFFFFF" ? "#000" : "#fff") : T.txtFaint,
            flexShrink: 0, transition: "background 0.15s",
          }}
        >
          {isSending ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-flex" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </motion.span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════
   IMAGES VIEW — Coming Soon (simple)
   ═══════════════════════════════════════════════════════════════ */
const ImagesView = ({ T, isMobile, onBack }) => {
  return (
    <div
      className="apnadeal-scroll"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "32px 20px" : "48px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: T.cardBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <FaImages style={{ fontSize: 24, color: T.txtSoft }} />
        </motion.div>

        {/* Heading */}
        <h1
          style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: T.txt,
            margin: "0 0 12px",
          }}
        >
          Coming soon
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: isMobile ? 14 : 15,
            lineHeight: 1.6,
            color: T.txtSoft,
            margin: "0 0 28px",
          }}
        >
          AI-powered image generation is on the way. You'll be able to create
          stunning 4K product photos for your listings with a single prompt.
        </p>
<button
  type="button"
  onClick={onBack}
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 999,
    background: "transparent",
    border: `1px solid ${T.line}`,
    color: T.txt,
    fontSize: 13.5,
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = T.btnHover;
    e.currentTarget.style.borderColor = T.txtFaint;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.borderColor = T.line;
  }}
>
  ← Back to chat
</button>
      </motion.div>
    </div>
  );
};

export default AIChatpromt;