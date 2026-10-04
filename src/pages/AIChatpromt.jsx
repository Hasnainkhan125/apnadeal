// src/pages/AIChatpromt.jsx — ApexDeal AI · Responsive + collapsible sidebar
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone, FaStop, FaCopy, FaCheck, FaTrash, FaBars,
  FaTimes, FaThumbsUp, FaCrown, FaStore, FaPaperclip,
  FaVolumeUp, FaVolumeMute, FaArrowLeft, FaMagic, FaPenFancy,
  FaCode, FaGraduationCap, FaImage, FaUser, FaSignOutAlt,
  FaKeyboard, FaExpand, FaMoon, FaSun, FaPaperPlane, FaPlus,
  FaSearch, FaFilter, FaEllipsisV, FaHeart, FaShareAlt,
  FaLink, FaChartLine, FaLightbulb, FaBullhorn,
} from "react-icons/fa";
import {
  FaPenToSquare, FaBookOpen, FaWandMagicSparkles, FaImages,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { generateWithChat } from "../lib/pollinations";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  loadConversationsFromDB, saveConversationToDB,
  deleteConversationFromDB, clearAllConversationsFromDB,
} from "../lib/chatStorage";
import AIRailSidebar from "./AIRailSidebar";
import VoicelyOrb from "../components/VoicelyOrb";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */
const BRAND_NAME = "ApexDeal AI";
const BRAND_SHORT = "ApexDeal";
const SIDEBAR_STATE_KEY = "apexdeal_ai_sidebar_collapsed";
const VOICE_LANG_KEY = "apexdeal_voice_lang";
const VOICE_OUT_KEY = "apexdeal_voice_out";

const WELCOME_TEXT = "Welcome to ApexDeal. How can I assist you today?";

/* ⭐ BRAND COLORS */
const BRAND = {
  orange: "#eb7d34",
  orangeDeep: "#d96a22",
  orangeSoft: "rgba(235,125,52,0.12)",
  purple: "#7C3AED",
  purpleLight: "#A78BFA",
};

/* ⭐ APEXDEAL SUGGESTION CARDS */
const APEXDEAL_SUGGESTIONS = [
  {
    id: "sell",
    icon: FaStore,
    title: "Start selling",
    desc: "Post your first ad in minutes and reach thousands of buyers.",
    prompt: "How do I post an ad on ApexDeal and start selling?",
  },
  {
    id: "images",
    icon: FaImage,
    title: "AI image tools",
    desc: "Enhance, clean up, and optimize your product photos instantly.",
    prompt: "Tell me about the AI image tools on ApexDeal and how to use them.",
  },
  {
    id: "plans",
    icon: FaCrown,
    title: "Choose a plan",
    desc: "Compare Starter, Seller, and Pro Seller plans to grow faster.",
    prompt: "Compare the ApexDeal plans — Starter, Seller and Pro Seller — and tell me which one suits me.",
  },
  {
    id: "escrow",
    icon: FaCheck,
    title: "Safe escrow checkout",
    desc: "Learn how protected payments and refunds keep you secure.",
    prompt: "How does ApexDeal escrow checkout work and how do refunds work?",
  },
];

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPT
   ═══════════════════════════════════════════════════════════════ */
const APEXDEAL_SYSTEM_PROMPT = `
You are ApexDeal AI — the official voice assistant for ApexDeal, Pakistan's fastest-growing online marketplace.

VOICE MODE:
- Keep replies to 1–3 short sentences.
- NO markdown, NO bullets, NO asterisks, NO emojis in voice replies.
- Speak like a warm human assistant.

TEXT MODE:
- Use markdown (**bold**, *italic*, code, ## headings, - bullets) when helpful.
- Keep replies concise.

LANGUAGE:
- Match the user's language EVERY reply. English → English. Urdu → Urdu. Roman Urdu → Roman Urdu.

ABOUT APEXDEAL:
Pakistan's fastest-growing online marketplace. Owner: Hasnain Khan. WhatsApp support: 03140972575.

You help with:
- Posting ads, buying, plans (Starter Free, Seller Rs 500/mo, Pro Seller Rs 1,500/mo).
- Escrow checkout, refunds, boosting, AI image tools.
- Categories: Mobiles, Electronics, Vehicles, Property, Fashion, Home, Sports, Collectibles.

BEHAVIOR:
- Warm, brief, confident.
- Never invent features. No loans or lending. Proudly Pakistani.
- If unsure: "Message us on WhatsApp at 03140972575 — we'll help you right away."
`.trim();

/* ═══════════════════════════════════════════════════════════════
   THEMES
   ═══════════════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    pageBg: "#0A0A0F",
    surface: "rgba(20,20,25,0.72)",
    surfaceSolid: "#141418",
    surface2: "rgba(30,30,36,0.65)",
    card: "rgba(255,255,255,0.04)",
    cardSolid: "#0F0F12",
    cardBorder: "rgba(255,255,255,0.06)",
    pill: "rgba(255,255,255,0.06)",
    line: "rgba(255,255,255,0.08)",
    lineSoft: "rgba(255,255,255,0.04)",
    txt: "#FFFFFF",
    txtMid: "rgba(255,255,255,0.65)",
    txtSoft: "rgba(255,255,255,0.45)",
    txtFaint: "rgba(255,255,255,0.28)",
    primary: "#FFFFFF",
    accent: BRAND.orange,
    purple: BRAND.purpleLight,
    danger: "#EF4444",
    success: "#22C55E",
    shadowSm: "0 2px 8px rgba(0,0,0,0.4)",
    shadowMd: "0 8px 32px -12px rgba(0,0,0,0.6)",
    shadowLg: "0 20px 60px -24px rgba(0,0,0,0.85)",
    glowRing: "rgba(235,125,52,0.5)",
    sidebarBg: "#0F0F14",
    sidebarActive: "rgba(255,255,255,0.06)",
    sidebarHover: "rgba(255,255,255,0.04)",
  },
  light: {
    pageBg: "#F8F7F9",
    surface: "#FFFFFF",
    surfaceSolid: "#FFFFFF",
    surface2: "#FFFFFF",
    card: "#FFFFFF",
    cardSolid: "#FFFFFF",
    cardBorder: "rgba(20,20,30,0.06)",
    pill: "rgba(20,20,30,0.04)",
    line: "rgba(20,20,30,0.08)",
    lineSoft: "rgba(20,20,30,0.04)",
    txt: "#0D0D0D",
    txtMid: "rgba(20,20,30,0.62)",
    txtSoft: "rgba(20,20,30,0.45)",
    txtFaint: "rgba(20,20,30,0.28)",
    primary: "#0A0A0F",
    accent: BRAND.orange,
    purple: BRAND.purple,
    danger: "#EF4444",
    success: "#16A34A",
    shadowSm: "0 2px 8px rgba(20,20,30,0.06)",
    shadowMd: "0 8px 32px -12px rgba(20,20,30,0.14)",
    shadowLg: "0 20px 60px -24px rgba(20,20,30,0.20)",
    glowRing: "rgba(235,125,52,0.4)",
    sidebarBg: "#FFFFFF",
    sidebarActive: "rgba(20,20,30,0.06)",
    sidebarHover: "rgba(20,20,30,0.04)",
  },
};

/* ═══════════════════════════════════════════════════════════════
   HOOKS
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
   VOICE HELPERS
   ═══════════════════════════════════════════════════════════════ */
const pickVoice = (langCode) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices?.length) return null;
  const want = String(langCode || "en").toLowerCase();
  const prefixes =
    want.startsWith("ur") ? ["ur", "hi", "en-in", "en"] :
    want.startsWith("hi") ? ["hi", "en-in", "en"] :
    ["en-us", "en-gb", "en"];
  for (const p of prefixes) {
    const v = voices.find((vo) => String(vo.lang || "").toLowerCase().startsWith(p));
    if (v) return v;
  }
  return voices.find((v) => /female|zira|samantha|google us english/i.test(v.name)) || voices[0];
};

const detectLang = (text, fallback = "en") => {
  if (!text) return fallback;
  if (/[\u0600-\u06FF]/.test(text)) return "ur";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  const roman = /\b(hai|hain|ka|ki|ke|ko|mein|aur|kya|kaise|kahan|nahi|haan|aap|bhai|kitna|paisa|abhi|kal|aaj|chahiye|mujhe|karo|karna|batao|madad)\b/i;
  if (roman.test(text)) return "ur";
  return fallback;
};

const cleanForSpeech = (text) =>
  String(text || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+?)`/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_`#>-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

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
          background: T.line, color: T.txt,
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
    if (line.trim() === "") { flushList(); elements.push(<div key={`sp-${idx}`} style={{ height: 8 }} />); return; }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const sizes = { 1: 20, 2: 17, 3: 15 };
      elements.push(
        <div key={`h-${idx}`} style={{
          fontSize: sizes[level] || 15, fontWeight: 700,
          margin: "14px 0 6px", color: T.txt,
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
        fontSize: 15, lineHeight: 1.75, margin: "4px 0",
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
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const AIChatpromt = () => {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmallMobile = useMediaQuery("(max-width: 520px)");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  /* Theme */
  const [themeName, setThemeName] = useState(() => {
    try { return localStorage.getItem("theme") === "light" ? "light" : "dark"; }
    catch { return "dark"; }
  });
  const T = THEMES[themeName];
  useEffect(() => {
    try { localStorage.setItem("theme", themeName); } catch {}
    try {
      const html = document.documentElement;
      html.classList.remove("theme-dark", "theme-light");
      html.classList.add(`theme-${themeName}`);
    } catch {}
  }, [themeName]);
  const toggleTheme = () => setThemeName((t) => (t === "dark" ? "light" : "dark"));

  /* Sidebar — desktop collapse + mobile drawer */
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
      return saved == null ? false : saved === "true";
    } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  /* Auto-close mobile drawer on resize to desktop */
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  /* View */
  const [viewMode, setViewMode] = useState("home");

  /* Chat */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [newestAIId, setNewestAIId] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [hoveredHistoryId, setHoveredHistoryId] = useState(null);

  /* Image */
  const [attachedImage, setAttachedImage] = useState(null);
  const fileInputRef = useRef(null);

  /* Voice */
  const [voiceLang, setVoiceLang] = useState(() => {
    try { return localStorage.getItem(VOICE_LANG_KEY) || "en-US"; }
    catch { return "en-US"; }
  });
  const [voiceOut, setVoiceOut] = useState(() => {
    try { return localStorage.getItem(VOICE_OUT_KEY) !== "false"; }
    catch { return true; }
  });
  useEffect(() => { try { localStorage.setItem(VOICE_LANG_KEY, voiceLang); } catch {} }, [voiceLang]);
  useEffect(() => { try { localStorage.setItem(VOICE_OUT_KEY, String(voiceOut)); } catch {} }, [voiceOut]);

  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [phase, setPhase] = useState("idle");

  /* Profile */
  const [userProfile, setUserProfile] = useState({
    name: "there", email: "", avatar: null, plan: "Free",
  });

  /* Refs */
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const phaseRef = useRef("idle");
  const voiceLangRef = useRef(voiceLang);
  const voiceOutRef = useRef(voiceOut);
  const continuousRef = useRef(true);
  const shouldReListenRef = useRef(false);
  const messagesRef = useRef([]);
  const activeConvIdRef = useRef(null);
  const handleUserSaidRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { voiceLangRef.current = voiceLang; }, [voiceLang]);
  useEffect(() => { voiceOutRef.current = voiceOut; }, [voiceOut]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { activeConvIdRef.current = activeConversationId; }, [activeConversationId]);

  /* Load profile */
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) {
          if (!cancelled) setUserProfile({ name: "there", email: "", avatar: null, plan: "Free" });
          return;
        }
        const meta = u.user_metadata || {};
        const fallback = meta.full_name || meta.name || (u.email || "").split("@")[0] || "there";
        let savedName = null, savedAvatar = null, isPremium = false;
        try {
          const { data: s } = await supabase.from("user_settings").select("full_name, avatar")
            .eq("user_id", u.id).maybeSingle();
          if (s) { savedName = s.full_name || null; savedAvatar = s.avatar || null; }
        } catch {}
        try {
          const { data: row } = await supabase.from("users").select("is_premium")
            .eq("id", u.id).maybeSingle();
          isPremium = row?.is_premium === true;
        } catch {}
        if (!cancelled) {
          setUserProfile({
            name: savedName || fallback,
            email: u.email || "",
            avatar: savedAvatar,
            plan: isPremium ? "Plus" : "Free",
          });
        }
      } catch {}
    };
    loadProfile();
    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, []);

  /* Load history */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadConversationsFromDB();
      if (!cancelled) setHistory(list);
    })();
    return () => { cancelled = true; };
  }, []);

  /* Warm voices */
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.onvoiceschanged = warm;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch {} };
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 120);
    return () => clearTimeout(t);
  }, [messages, isSending, viewMode]);

  /* SPEAK */
  const speak = useCallback((text, { onDone } = {}) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setPhase("idle"); onDone?.(); return;
    }
    const clean = cleanForSpeech(text);
    if (!clean) { setPhase("idle"); onDone?.(); return; }
    try { window.speechSynthesis.cancel(); } catch {}

    const utter = new SpeechSynthesisUtterance(clean);
    const lang = detectLang(clean, voiceLangRef.current || "en");
    const langCode =
      lang === "ur" ? "ur-PK"
      : lang === "hi" ? "hi-IN"
      : voiceLangRef.current || "en-US";

    utter.lang = langCode;
    const v = pickVoice(langCode);
    if (v) utter.voice = v;
    utter.rate = 1.0; utter.pitch = 1.05; utter.volume = 1.0;

    utter.onstart = () => setPhase("speaking");
    utter.onend = () => { setPhase("idle"); onDone?.(); };
    utter.onerror = () => { setPhase("idle"); onDone?.(); };

    if (!voiceOutRef.current) {
      setPhase("speaking");
      const ms = Math.min(6000, Math.max(1200, clean.length * 55));
      setTimeout(() => { setPhase("idle"); onDone?.(); }, ms);
      return;
    }
    try { window.speechSynthesis.speak(utter); setPhase("speaking"); }
    catch { setPhase("idle"); onDone?.(); }
  }, []);

  const stopSpeaking = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch {}
    setSpeakingId(null);
    if (phaseRef.current === "speaking") setPhase("idle");
  }, []);

  /* LISTEN */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice isn't supported. Try Chrome."); setPhase("idle"); return; }
    try { window.speechSynthesis.cancel(); } catch {}

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = voiceLangRef.current || "en-US";

    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      if (final) {
        setInterimText(""); recognitionRef.current = null;
        handleUserSaidRef.current?.(final.trim());
      } else setInterimText(interim);
    };
    rec.onerror = () => {
      recognitionRef.current = null;
      if (phaseRef.current === "listening") setPhase("idle");
    };
    rec.onend = () => {
      recognitionRef.current = null;
      if (phaseRef.current === "listening") setPhase("idle");
    };
    try {
      rec.start();
      recognitionRef.current = rec;
      setPhase("listening");
      setError(null);
    } catch { setPhase("idle"); }
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    if (phaseRef.current === "listening") setPhase("idle");
  }, []);

  /* Core voice flow */
  const handleUserSaid = useCallback(async (text) => {
    const clean = String(text || "").trim();
    if (!clean) { setPhase("idle"); return; }
    setError(null); setInterimText("");

    const userMsg = { id: `u_${Date.now()}`, role: "user", content: clean };
    const nextMessages = [...(messagesRef.current || []), userMsg];
    setMessages(nextMessages);
    messagesRef.current = nextMessages;
    setPhase("thinking");

    try {
      const reply = await generateWithChat({
        system: APEXDEAL_SYSTEM_PROMPT, message: clean,
      });
      const aiMsg = { id: `a_${Date.now()}`, role: "assistant", content: reply };
      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);
      messagesRef.current = finalMessages;
      setNewestAIId(aiMsg.id);

      if (finalMessages.length >= 2) {
        const firstUser = finalMessages.find((m) => m.role === "user");
        const title = firstUser?.content?.slice(0, 50) || "Voice chat";
        try {
          const saved = await saveConversationToDB({
            id: activeConvIdRef.current || null, title, messages: finalMessages,
          });
          if (saved) {
            setActiveConversationId(saved.id);
            activeConvIdRef.current = saved.id;
            setHistory((h) => [
              { id: saved.id, title: saved.title, ts: new Date(saved.updated_at).getTime(), messages: saved.messages },
              ...h.filter((x) => x.id !== saved.id),
            ].slice(0, 50));
          }
        } catch {}
      }
      speak(reply, {
        onDone: () => {
          if (continuousRef.current) {
            shouldReListenRef.current = true;
            setTimeout(() => {
              if (shouldReListenRef.current) {
                shouldReListenRef.current = false;
                startListening();
              }
            }, 400);
          }
        },
      });
    } catch (err) {
      const errMsg = {
        id: `e_${Date.now()}`, role: "assistant",
        content: "Sorry, I couldn't reach the server. Please try again.",
      };
      const errMessages = [...nextMessages, errMsg];
      setMessages(errMessages);
      messagesRef.current = errMessages;
      setError(err?.message || "Failed to get a response");
      speak("Sorry, I couldn't reach the server just now. Please try again.", {
        onDone: () => { if (continuousRef.current) setTimeout(() => startListening(), 400); },
      });
    }
  }, [speak, startListening]);

  useEffect(() => { handleUserSaidRef.current = handleUserSaid; }, [handleUserSaid]);

  /* Enter / exit siri */
  const enterSiriMode = useCallback(() => {
    setViewMode("siri");
    setPhase("idle");
    const welcomeMsg = { id: `g_${Date.now()}`, role: "assistant", content: WELCOME_TEXT };
    setMessages([welcomeMsg]);
    messagesRef.current = [welcomeMsg];
    setTimeout(() => {
      speak(WELCOME_TEXT, {
        onDone: () => {
          if (continuousRef.current) {
            shouldReListenRef.current = true;
            setTimeout(() => {
              if (shouldReListenRef.current) {
                shouldReListenRef.current = false;
                startListening();
              }
            }, 400);
          }
        },
      });
    }, 300);
  }, [speak, startListening]);

  const exitSiriMode = useCallback(() => {
    shouldReListenRef.current = false;
    stopListening(); stopSpeaking();
    setPhase("idle"); setViewMode("home");
  }, [stopListening, stopSpeaking]);

  const handleOrbTap = useCallback(() => {
    const p = phaseRef.current;
    if (p === "listening") { stopListening(); return; }
    if (p === "speaking") { stopSpeaking(); setTimeout(() => startListening(), 250); return; }
    if (p === "thinking") return;
    startListening();
  }, [startListening, stopListening, stopSpeaking]);

  /* Image + send */
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

  const persistConversation = useCallback(async (msgs) => {
    if (msgs.length < 2) return;
    const firstUser = msgs.find((m) => m.role === "user");
    const title = firstUser?.content?.slice(0, 50) || "New chat";
    const saved = await saveConversationToDB({
      id: activeConvIdRef.current || null, title, messages: msgs,
    });
    if (saved) {
      setActiveConversationId(saved.id);
      activeConvIdRef.current = saved.id;
      const entry = { id: saved.id, title: saved.title, ts: new Date(saved.updated_at).getTime(), messages: saved.messages };
      setHistory((prev) => [entry, ...prev.filter((h) => h.id !== entry.id)].slice(0, 50));
    }
  }, []);

  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    const hasImage = !!attachedImage;
    if ((!text && !hasImage) || isSending) return;

    stopSpeaking();
    setError(null); setInput(""); setNewestAIId(null);

    const userMsg = { id: `u_${Date.now()}`, role: "user", content: text, image: attachedImage || null };
    setAttachedImage(null);

    const next = [...(messagesRef.current || []), userMsg];
    setMessages(next);
    messagesRef.current = next;
    setIsSending(true);

    try {
      const reply = await generateWithChat({
        system: APEXDEAL_SYSTEM_PROMPT,
        message: text || "What do you think of this image?",
      });
      const aiId = `a_${Date.now()}`;
      const finalMsgs = [...next, { id: aiId, role: "assistant", content: reply }];
      setMessages(finalMsgs);
      messagesRef.current = finalMsgs;
      setNewestAIId(aiId);
      await persistConversation(finalMsgs);
    } catch (err) {
      console.error("Send error:", err);
      setError(err?.message || "Failed to get a response");
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [input, isSending, persistConversation, attachedImage, voiceOut, speak, stopSpeaking]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1400);
    } catch {}
  };

  const speakFromMessage = useCallback((id, text) => {
    if (speakingId === id && window.speechSynthesis?.speaking) { stopSpeaking(); return; }
    speak(text);
    setSpeakingId(id);
  }, [speak, speakingId, stopSpeaking]);

  /* New + history */
  const handleNewChat = async () => {
    stopListening(); stopSpeaking();
    const currentMessages = messagesRef.current || [];
    if (currentMessages.length >= 2) {
      const firstUser = currentMessages.find((m) => m.role === "user");
      const title = firstUser?.content?.slice(0, 50) || "New chat";
      try {
        const saved = await saveConversationToDB({ id: activeConvIdRef.current || null, title, messages: currentMessages });
        if (saved) {
          setHistory((h) => [
            { id: saved.id, title: saved.title, ts: new Date(saved.updated_at).getTime(), messages: saved.messages },
            ...h.filter((x) => x.id !== saved.id),
          ].slice(0, 50));
        }
      } catch {}
    }
    setMessages([]); messagesRef.current = [];
    setError(null); setInput(""); setAttachedImage(null);
    setNewestAIId(null); setActiveConversationId(null); activeConvIdRef.current = null;
    setViewMode("home");
    if (isMobile) setSidebarOpen(false);
  };

  const handleLoadHistory = (entry) => {
    stopListening(); stopSpeaking();
    setMessages(entry.messages);
    messagesRef.current = entry.messages;
    setNewestAIId(null);
    setActiveConversationId(entry.id);
    activeConvIdRef.current = entry.id;
    setViewMode("chat");
    if (isMobile) setSidebarOpen(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (activeConvIdRef.current === id) {
      setActiveConversationId(null); activeConvIdRef.current = null;
      setMessages([]); messagesRef.current = [];
    }
    await deleteConversationFromDB(id);
  };

  const handleClearAll = async () => {
    setHistory([]); setActiveConversationId(null); activeConvIdRef.current = null;
    setMessages([]); messagesRef.current = [];
    await clearAllConversationsFromDB();
  };

  const handleLogout = async () => {
    try { await signOut(); } catch {}
    navigate("/");
  };

  /* Greeting */
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  /* ══════════════════════════════════════════════════════════════
     SIDEBAR CONTENT
     ══════════════════════════════════════════════════════════════ */
  const SidebarContent = () => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: T.sidebarBg, color: T.txt,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 14px 12px", gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.txt }}>
          {BRAND_SHORT} AI
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" title="Toggle theme" onClick={toggleTheme}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              color: T.txtMid,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {themeName === "dark" ? <FaSun style={{ fontSize: 12 }} /> : <FaMoon style={{ fontSize: 12 }} />}
          </button>
          <button type="button" title="Close"
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
              else setSidebarCollapsed(true);
            }}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              color: T.txtMid,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {isMobile ? <FaTimes style={{ fontSize: 12 }} /> : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3a1 1 0 0 1 1-1h2v12H3a1 1 0 0 1-1-1V3Zm5-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7V2Z" opacity="0.85" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
        <SidebarBtn icon={<FaPenToSquare style={{ fontSize: 14 }} />} label="New chat" onClick={handleNewChat} active={viewMode === "home"} T={T} />
        <SidebarBtn icon={<FaMicrophone style={{ fontSize: 14 }} />} label="Voice mode" onClick={enterSiriMode} T={T} />
        <SidebarBtn icon={<FaImages style={{ fontSize: 14 }} />} label="Images" onClick={() => { if (isMobile) setSidebarOpen(false); }} T={T} />
        <SidebarBtn icon={<FaBookOpen style={{ fontSize: 14 }} />} label="Library" onClick={() => { if (isMobile) setSidebarOpen(false); navigate("/library"); }} T={T} />
        <SidebarBtn icon={<FaStore style={{ fontSize: 14 }} />} label="Browse" onClick={() => { if (isMobile) setSidebarOpen(false); navigate("/library"); }} T={T} />
        <SidebarBtn icon={<FaCrown style={{ fontSize: 14 }} />} label="Plans" onClick={() => { if (isMobile) setSidebarOpen(false); navigate("/plans"); }} T={T} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 8px 0" }} className="apexdeal-scroll">
        {history.length > 0 && (
          <>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 6px 4px",
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.txtFaint, letterSpacing: "0.04em" }}>
                Recents
              </span>
              <button type="button" onClick={handleClearAll} title="Clear all"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.txtFaint, padding: 2 }}>
                <FaTrash style={{ fontSize: 10 }} />
              </button>
            </div>
            {history.map((h) => {
              const active = activeConversationId === h.id && viewMode === "chat";
              const hovered = hoveredHistoryId === h.id;
              return (
                <div key={h.id}
                  onMouseEnter={() => setHoveredHistoryId(h.id)}
                  onMouseLeave={() => setHoveredHistoryId(null)}
                  style={{ position: "relative" }}>
                  <button type="button" onClick={() => handleLoadHistory(h)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "8px 30px 8px 10px", borderRadius: 8,
                      background: active ? T.sidebarActive : hovered ? T.sidebarHover : "transparent",
                      border: "none", color: T.txt, fontSize: 13.5,
                      fontFamily: "inherit", cursor: "pointer",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                    {h.title}
                  </button>
                  {hovered && (
                    <button type="button" onClick={(e) => handleDelete(e, h.id)} title="Delete"
                      style={{
                        position: "absolute", right: 6, top: "50%",
                        transform: "translateY(-50%)",
                        width: 22, height: 22, borderRadius: 6,
                        background: "transparent", border: "none",
                        color: T.txtFaint, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      <FaTrash style={{ fontSize: 10 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      <div style={{ padding: 10, flexShrink: 0, borderTop: `1px solid ${T.lineSoft}` }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10,
          background: "rgba(235,125,52,0.08)",
          border: "1px solid rgba(235,125,52,0.20)",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(235,125,52,0.15)",
            color: BRAND.orange,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 14, fontWeight: 800,
          }}>
            <FaCheck />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.orange }}>Free for everyone</div>
            <div style={{ fontSize: 11, color: T.txtFaint, marginTop: 1 }}>No credits · No login</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginTop: 2 }}>
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt="" style={{
              width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
            }} />
          ) : (
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: BRAND.orange, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{(userProfile.name || "U").charAt(0).toUpperCase()}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: T.txt,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{userProfile.name}</div>
            <div style={{
              fontSize: 11, color: T.txtFaint, marginTop: 1,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{userProfile.plan}</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex", width: "100%", height: "100vh",
        boxSizing: "border-box",
        background: T.pageBg,
        color: T.txt,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* RAIL SIDEBAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90 }}>
        <AIRailSidebar theme={themeName} onToggleTheme={toggleTheme} />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SIRI / VOICE MODE
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewMode === "siri" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: T.pageBg,
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "relative", zIndex: 10,
              padding: "20px 24px 0",
              paddingTop: "max(20px, env(safe-area-inset-top, 20px))",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <button type="button" onClick={exitSiriMode}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "transparent", border: "none",
                  color: T.txt, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                aria-label="Back">
                <FaBars style={{ fontSize: 18 }} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: `1.5px solid ${T.txt}`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: T.txt,
                  letterSpacing: "0.02em",
                }}>AD</span>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: T.txt,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                }}>{BRAND_SHORT}</span>
              </div>

              <button type="button" onClick={() => setVoiceOut((v) => !v)}
                title={voiceOut ? "Voice ON" : "Voice OFF"}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "transparent", border: "none",
                  color: T.txt, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                {voiceOut ? <FaMagic style={{ fontSize: 16 }} /> : <FaVolumeMute style={{ fontSize: 16 }} />}
              </button>
            </div>

            <div style={{
              flex: 1, minHeight: 0,
              position: "relative", zIndex: 5,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "20px 28px 24px",
              gap: 32,
              overflowY: "auto",
            }} className="apexdeal-scroll">

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <VoicelyOrb
                  size={isSmallMobile ? 200 : isMobile ? 260 : 320}
                  active={phase === "listening" || phase === "speaking"}
                />
              </motion.div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                color: T.txtMid,
                fontSize: isMobile ? 14 : 16,
                fontWeight: 500,
              }}>
                <motion.span
                  animate={{
                    opacity: phase === "listening" ? [0.4, 1, 0.4] : 0.35,
                    scale: phase === "listening" ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: BRAND.orange,
                    boxShadow: `0 0 12px ${BRAND.orange}`,
                    display: "inline-block",
                  }}
                />
                <span>
                  {phase === "listening" ? "Listening…"
                    : phase === "thinking" ? "Thinking…"
                    : phase === "speaking" ? "Speaking…"
                    : "Tap the mic to speak"}
                </span>
              </div>

              {(interimText || messages.length > 0) && (
                <div style={{
                  maxWidth: 460, textAlign: "center",
                  fontSize: isMobile ? 14 : 15,
                  lineHeight: 1.55,
                  color: T.txtSoft,
                  padding: "0 12px",
                }}>
                  {interimText ? (
                    <em style={{ color: T.txt }}>{interimText}</em>
                  ) : (
                    <>
                      {messages[messages.length - 1]?.content?.slice(0, 200)}
                      {(messages[messages.length - 1]?.content || "").length > 200 ? "…" : ""}
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{
              position: "relative", zIndex: 10,
              padding: "16px 24px 28px",
              paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 24,
            }}>
              <button type="button"
                onClick={() => { exitSiriMode(); setTimeout(() => inputRef.current?.focus(), 200); }}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "transparent",
                  border: `1px solid ${T.line}`,
                  color: T.txtMid, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <FaKeyboard style={{ fontSize: 17 }} />
              </button>

              <motion.button type="button" onClick={handleOrbTap} whileTap={{ scale: 0.94 }}
                style={{
                  position: "relative",
                  width: 76, height: 76, borderRadius: "50%",
                  background: `radial-gradient(circle at 30% 30%, ${BRAND.orange} 0%, ${BRAND.orangeDeep} 60%, #a8551a 100%)`,
                  color: "#fff",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 12px 32px -8px ${BRAND.orange}cc, inset 0 2px 4px rgba(255,255,255,0.3)`,
                }}>
                {phase === "listening" ? (
                  <motion.div animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ display: "flex" }}>
                    <FaStop style={{ fontSize: 26 }} />
                  </motion.div>
                ) : phase === "thinking" ? (
                  <div style={{ display: "flex", gap: 5 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "#fff", display: "inline-block",
                        }} />
                    ))}
                  </div>
                ) : (
                  <FaMicrophone style={{ fontSize: 26 }} />
                )}
              </motion.button>

              <button type="button" onClick={() => setVoiceOut((v) => !v)}
                style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "transparent",
                  border: `1px solid ${T.line}`,
                  color: T.txtMid, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <FaExpand style={{ fontSize: 15 }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (collapsible) + floating open button
          ═══════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.aside
                key="desktop-sidebar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  flexShrink: 0, height: "100vh", overflow: "hidden",
                  borderRight: `1px solid ${T.lineSoft}`,
                  background: T.sidebarBg,
                  marginTop: 64,
                  position: "relative",
                  zIndex: 20,
                }}
              >
                <div style={{ width: 260, height: "calc(100vh - 64px)" }}>
                  <SidebarContent />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Floating sidebar toggle (when collapsed) */}
          {sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              title="Open sidebar"
              style={{
                position: "fixed",
                top: 76,
                left: 12,
                zIndex: 95,
                width: 40,
                height: 40,
                borderRadius: 12,
                background: T.surface,
                border: `1px solid ${T.line}`,
                color: T.txtMid,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: T.shadowMd,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3a1 1 0 0 1 1-1h2v12H3a1 1 0 0 1-1-1V3Zm5-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7V2Z" opacity="0.9" />
              </svg>
            </motion.button>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MOBILE DRAWER (with backdrop)
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              key="mask"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.55)", zIndex: 100,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0,
                width: 280, maxWidth: "85vw", zIndex: 101,
                background: T.sidebarBg,
                borderRight: `1px solid ${T.lineSoft}`,
                boxShadow: "12px 0 40px -12px rgba(0,0,0,0.5)",
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div style={{
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        background: T.pageBg, position: "relative",
        height: "100vh", paddingTop: 64,
        boxSizing: "border-box",
        minHeight: 0,
      }}>
        {/* ⭐ MOBILE TOP BAR — menu + title + new */}
        {isMobile && (
          <div style={{
            position: "sticky",
            top: 64,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: T.pageBg,
            borderBottom: `1px solid ${T.lineSoft}`,
            flexShrink: 0,
          }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: T.surface,
                border: `1px solid ${T.line}`,
                color: T.txt,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.shadowSm,
              }}
            >
              <FaBars style={{ fontSize: 16 }} />
            </button>

            <span style={{
              fontSize: 15, fontWeight: 700, color: T.txt,
              letterSpacing: "-0.01em",
            }}>
              {BRAND_SHORT} AI
            </span>

            <button
              type="button"
              onClick={handleNewChat}
              aria-label="New chat"
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: T.surface,
                border: `1px solid ${T.line}`,
                color: T.txt,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.shadowSm,
              }}
            >
              <FaPlus style={{ fontSize: 14 }} />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            HOME VIEW
            ═══════════════════════════════════════════════════════════ */}
        {viewMode === "home" && (
          <div className="apexdeal-scroll" style={{
            flex: 1, minHeight: 0, overflowY: "auto",
            padding: isSmallMobile
              ? "24px 16px 40px"
              : isMobile
                ? "36px 22px 56px"
                : "72px 48px 88px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              width: "100%", maxWidth: 1080,
              display: "flex", flexDirection: "column",
            }}>

              {/* GREETING */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  textAlign: "center",
                  paddingTop: isMobile ? 4 : 12,
                  paddingBottom: isMobile ? 20 : 36,
                }}
              >
                <h1 style={{
                  margin: 0,
                  fontSize: isSmallMobile
                    ? "clamp(24px, 8vw, 30px)"
                    : isMobile
                      ? "clamp(28px, 7vw, 36px)"
                      : "clamp(34px, 3.6vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.12,
                  color: T.txt,
                }}>
                  <span style={{ color: T.txtSoft, fontWeight: 300 }}>{greeting}, </span>
                  <span style={{ fontWeight: 800 }}>{userProfile.name}</span>
                </h1>

                <p style={{
                  margin: "14px auto 0",
                  maxWidth: 600,
                  fontSize: isMobile ? 13 : 15,
                  lineHeight: 1.65,
                  color: T.txtMid,
                  fontWeight: 400,
                }}>
                  Share ideas, manage tasks, and stay connected — all in one place.
                  Boost your productivity with ApexDeal AI.
                </p>

              </motion.div>

              {/* PROMPT BOX */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                style={{
                  position: "relative",
                  width: "100%",
                  padding: isMobile ? "18px 18px 14px" : "22px 26px 18px",
                  borderRadius: isMobile ? 22 : 28,
                  background: T.surface,
                  border: `1.5px solid ${themeName === "dark" ? "rgba(235,125,52,0.35)" : "rgba(235,125,52,0.28)"}`,
                  boxShadow: themeName === "light"
                    ? "0 20px 60px -30px rgba(235,125,52,0.20), 0 4px 14px -6px rgba(20,20,30,0.06)"
                    : "0 20px 60px -30px rgba(0,0,0,0.85)",
                  marginBottom: isMobile ? 18 : 22,
                }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: isMobile ? 12 : 16,
                }}>
                  <FaWandMagicSparkles style={{
                    fontSize: 15,
                    color: BRAND.purple,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: isMobile ? 14 : 15.5,
                    fontWeight: 600,
                    color: T.txt,
                    letterSpacing: "-0.01em",
                  }}>
                    Your <span style={{ color: BRAND.orange }}>AI assistant</span> is ready to help!
                  </span>
                </div>

                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  marginBottom: 14,
                }}>
                  <textarea
                    ref={inputRef}
                    value={input + (interimText ? (input ? " " : "") + interimText : "")}
                    onChange={(e) => { setInput(e.target.value); setInterimText(""); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() || attachedImage) {
                          setViewMode("chat");
                          setTimeout(() => handleSend(), 80);
                        }
                      }
                    }}
                    placeholder="Ask anything…"
                    rows={2}
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      color: T.txt, fontSize: isMobile ? 14.5 : 15.5, fontFamily: "inherit",
                      resize: "none", lineHeight: 1.55, minHeight: 44, maxHeight: 200,
                      padding: 0, minWidth: 0,
                    }}
                  />
                </div>

                {attachedImage && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12 }}>
                    <div style={{ position: "relative" }}>
                      <img src={attachedImage} alt="" style={{
                        width: 56, height: 56, borderRadius: 12, objectFit: "cover",
                        border: `1px solid ${T.line}`,
                      }} />
                      <button onClick={removeAttachment} style={{
                        position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                        background: T.txt, color: T.pageBg, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}><FaTimes style={{ fontSize: 9 }} /></button>
                    </div>
                    <span style={{ fontSize: 12, color: T.txtSoft }}>Image attached</span>
                  </div>
                )}

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <RefChip
                      icon={<FaLink style={{ fontSize: 11 }} />}
                      label="Add Files"
                      T={T}
                      onClick={() => fileInputRef.current?.click()}
                    />

                    <SiriChip T={T} onClick={enterSiriMode} isDark={themeName === "dark"} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => { if (isRecording) stopListening(); else startListening(); }}
                      title={isRecording ? "Stop" : "Voice input"}
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: isRecording ? T.danger : T.pill,
                        border: "none", cursor: "pointer",
                        color: isRecording ? "#fff" : T.txtMid,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.15s ease",
                      }}>
                      {isRecording ? <FaStop style={{ fontSize: 12 }} /> : <FaMicrophone style={{ fontSize: 14 }} />}
                    </button>
                    <button type="button"
                      onClick={() => {
                        if (!input.trim() && !attachedImage) return;
                        setViewMode("chat");
                        setTimeout(() => handleSend(), 80);
                      }}
                      disabled={!input.trim() && !attachedImage}
                      style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: (input.trim() || attachedImage)
                          ? BRAND.orange
                          : T.pill,
                        border: "none",
                        cursor: (input.trim() || attachedImage) ? "pointer" : "not-allowed",
                        color: (input.trim() || attachedImage) ? "#fff" : T.txtFaint,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: (input.trim() || attachedImage)
                          ? `0 10px 24px -8px ${BRAND.orange}cc`
                          : "none",
                        transition: "all 0.15s ease",
                      }}>
                      <FaArrowUpIcon />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ⭐ SUGGESTION CARDS — ApexDeal marketplace */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isSmallMobile
                    ? "1fr"
                    : isMobile
                      ? "repeat(2, minmax(0, 1fr))"
                      : "repeat(4, minmax(0, 1fr))",
                  gap: isSmallMobile ? 10 : 14,
                  width: "100%",
                }}
              >
                {APEXDEAL_SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <SuggestionCard
                      key={s.id}
                      icon={<Icon style={{ fontSize: 15 }} />}
                      title={s.title}
                      desc={s.desc}
                      T={T}
                      themeName={themeName}
                      index={i}
                      onClick={() => {
                        setInput(s.prompt);
                        setViewMode("chat");
                        setTimeout(() => handleSend(s.prompt), 80);
                      }}
                    />
                  );
                })}
              </motion.div>

              {error && (
                <div style={{
                  marginTop: 24, padding: "10px 16px", borderRadius: 12,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.22)",
                  color: T.danger, fontSize: 13,
                }}>{error}</div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CHAT VIEW
            ═══════════════════════════════════════════════════════════ */}
        {viewMode === "chat" && (
          <>
            <div ref={scrollRef} className="apexdeal-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              <div style={{
                maxWidth: 800, width: "100%", margin: "0 auto",
                padding: isSmallMobile
                  ? "12px 14px 20px"
                  : isMobile
                    ? "16px 18px 24px"
                    : "24px 32px 32px",
                display: "flex", flexDirection: "column", gap: 24,
              }}>
                {messages.length === 0 && isSending && (
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: BRAND.orange, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}><FaWandMagicSparkles style={{ fontSize: 12 }} /></div>
                    <div style={{ paddingTop: 8, display: "flex", gap: 5 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                          style={{ width: 7, height: 7, borderRadius: "50%", background: T.txtSoft }} />
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  if (isUser) {
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", maxWidth: "80%" }}>
                          {msg.image && (
                            <img src={msg.image} alt="" style={{
                              maxWidth: 240, maxHeight: 240, borderRadius: 14, objectFit: "cover",
                              border: `1px solid ${T.line}`,
                            }} />
                          )}
                          {msg.content && (
                            <div style={{
                              padding: "12px 18px", borderRadius: 20,
                              background: BRAND.orange, color: "#fff",
                              fontSize: 15, lineHeight: 1.6,
                              wordBreak: "break-word", whiteSpace: "pre-wrap",
                            }}>{msg.content}</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                        background: BRAND.orange, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                      }}>
                        <FaWandMagicSparkles style={{ fontSize: 12 }} />
                      </div>
                      <div style={{
                        flex: 1, minWidth: 0,
                        padding: "16px 18px", borderRadius: 18,
                        background: T.card, border: `1px solid ${T.cardBorder}`,
                        boxShadow: T.shadowSm,
                      }}>
                        <FormattedText text={msg.content} T={T} />
                        <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
                          <ChatIconBtn onClick={() => handleCopy(msg.id, msg.content)} T={T}>
                            {copiedId === msg.id ? <><FaCheck style={{ fontSize: 10 }} /> Copied</> : <><FaCopy style={{ fontSize: 10 }} /> Copy</>}
                          </ChatIconBtn>

                          <ChatIconBtn T={T}><FaThumbsUp style={{ fontSize: 10 }} /> Helpful</ChatIconBtn>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {messages.length > 0 && isSending && (
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: BRAND.orange, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}><FaWandMagicSparkles style={{ fontSize: 12 }} /></div>
                    <div style={{ paddingTop: 8, display: "flex", gap: 5 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                          style={{ width: 7, height: 7, borderRadius: "50%", background: T.txtSoft }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: isSmallMobile
                ? "8px 12px 14px"
                : isMobile
                  ? "8px 14px 18px"
                  : "8px 32px 24px",
              flexShrink: 0,
            }}>
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <div style={{
                  display: "flex", alignItems: "flex-end", gap: 10,
                  padding: "10px 10px 10px 20px", borderRadius: 22,
                  background: T.surface, border: `1.5px solid ${BRAND.orange}55`,
                  boxShadow: T.shadowMd,
                }}>
                  <FaPaperclip onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: 14, color: T.txtSoft, cursor: "pointer", marginBottom: 10 }} />
                  <textarea
                    ref={inputRef}
                    value={input + (interimText ? (input ? " " : "") + interimText : "")}
                    onChange={(e) => { setInput(e.target.value); setInterimText(""); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask ApexDeal AI…"
                    rows={1}
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      color: T.txt, fontSize: 15, fontFamily: "inherit",
                      resize: "none", lineHeight: 1.5, maxHeight: 140, minHeight: 28,
                      padding: "10px 0", minWidth: 0,
                    }}
                  />
                  <button type="button" onClick={enterSiriMode} title="Voice mode"
                    style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: T.pill, border: "none",
                      color: T.txtMid, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                    <FaMicrophone style={{ fontSize: 13 }} />
                  </button>
                  <button type="button" onClick={() => handleSend()}
                    disabled={!input.trim() && !attachedImage}
                    style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: (input.trim() || attachedImage) ? BRAND.orange : T.pill,
                      border: "none",
                      cursor: (input.trim() || attachedImage) ? "pointer" : "not-allowed",
                      color: (input.trim() || attachedImage) ? "#fff" : T.txtFaint,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                    <FaArrowUpIcon />
                  </button>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
            </div>
          </>
        )}
      </div>

      <style>{`
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.2); border-radius: 999px; }
        *::-webkit-scrollbar-thumb:hover { background: ${BRAND.orange}55; }
        .apexdeal-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      `}</style>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

const FaArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 20V4M12 4l-6 6M12 4l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SidebarBtn = ({ icon, label, onClick, active, T }) => {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "9px 12px", borderRadius: 9,
        background: active ? T.sidebarActive : hover ? T.sidebarHover : "transparent",
        border: "none", color: T.txt, fontSize: 13.5, fontWeight: 500,
        fontFamily: "inherit", cursor: "pointer", textAlign: "left",
        width: "100%", transition: "background 0.12s",
      }}>
      <span style={{ display: "flex", alignItems: "center", color: T.txtMid }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

const RefChip = ({ icon, label, rightIcon, onClick, T }) => {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "9px 16px", borderRadius: 999,
        background: hover ? T.pill : "transparent",
        border: `1px solid ${T.line}`,
        color: T.txt, fontSize: 13, fontWeight: 500,
        fontFamily: "inherit", cursor: "pointer",
        transition: "background 0.15s ease",
        whiteSpace: "nowrap",
      }}>
      <span style={{ display: "inline-flex", color: T.txtMid }}>{icon}</span>
      <span>{label}</span>
      {rightIcon && <span style={{ display: "inline-flex", color: T.txtFaint }}>{rightIcon}</span>}
    </button>
  );
};

/* ⭐ SUGGESTION CARD — ApexDeal marketplace quick-starts */
const SuggestionCard = ({ icon, title, desc, onClick, T, themeName, index = 0 }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 * index }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        textAlign: "left",
        padding: "16px 16px 18px",
        borderRadius: 18,
        background: hover ? T.card : T.surface,
        border: `1px solid ${
          hover
            ? `${BRAND.orange}66`
            : themeName === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(20,20,30,0.06)"
        }`,
        boxShadow: hover ? T.shadowMd : T.shadowSm,
        cursor: "pointer",
        fontFamily: "inherit",
        color: T.txt,
        transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
        minHeight: 132,
        width: "100%",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: hover ? BRAND.orange : "rgba(235,125,52,0.12)",
          color: hover ? "#fff" : BRAND.orange,
          flexShrink: 0,
          transition: "background 0.18s ease, color 0.18s ease",
        }}
      >
        {icon}
      </span>

      <span style={{
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: T.txt,
      }}>
        {title}
      </span>

      <span style={{
        fontSize: 12.5,
        lineHeight: 1.55,
        color: T.txtMid,
        fontWeight: 400,
      }}>
        {desc}
      </span>
    </motion.button>
  );
};

/* ⭐ SIRI CHIP — voice-mode launcher */
const SiriChip = ({ onClick, T, isDark }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Open Siri voice mode"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 18px",
        borderRadius: 999,
        background: hover
          ? `linear-gradient(135deg, ${BRAND.orange} 0%, ${BRAND.orangeDeep} 100%)`
          : `linear-gradient(135deg, ${BRAND.orange}22 0%, ${BRAND.orange}11 100%)`,
        border: `1px solid ${hover ? BRAND.orange : `${BRAND.orange}55`}`,
        color: hover ? "#fff" : BRAND.orange,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
        boxShadow: hover ? `0 10px 24px -8px ${BRAND.orange}cc` : "none",
      }}
    >
      <span style={{
        position: "relative",
        width: 10,
        height: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <motion.span
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: hover ? "#fff" : BRAND.orange,
          }}
        />
        <span style={{
          position: "relative",
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: hover ? "#fff" : BRAND.orange,
        }} />
      </span>

      <FaMicrophone style={{ fontSize: 12 }} />
      <span>Siri</span>
    </button>
  );
};

const RoundIconBtn = ({ children, onClick, title, T }) => {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 42, height: 42, borderRadius: "50%",
        background: hover ? T.pill : "transparent",
        border: `1px solid ${T.line}`,
        color: T.txtMid,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}>
      {children}
    </button>
  );
};

const ChatIconBtn = ({ onClick, children, T }) => {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? T.pill : "transparent",
        border: "none", color: T.txtFaint, fontSize: 12,
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 8px", fontFamily: "inherit", borderRadius: 6,
      }}>
      {children}
    </button>
  );
};

export default AIChatpromt;