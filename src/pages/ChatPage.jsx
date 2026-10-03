// pages/ChatPage.jsx — Modern 3-panel chat (Chats · Messages · Details)
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaPaperPlane, FaUser, FaUsers, FaTimes, FaSearch, FaBell,
  FaUserPlus, FaPhone, FaVideo as FaVideoCall,
  FaCheck, FaSpinner, FaBan, FaUndo,
  FaTrash, FaCheckDouble, FaComment, FaSmile,
  FaArrowLeft as FaBack, FaMicrophone, FaMicrophoneSlash,
  FaPhoneSlash, FaClipboardList, FaVolumeUp, FaImage, FaReply,
  FaVolumeOff, FaStop, FaPlay, FaPause, FaDownload, FaExpand,
  FaCompress, FaExclamationCircle, FaMapMarkerAlt, FaBriefcase,
  FaEllipsisH, FaLink, FaPalette, FaStickyNote, FaChevronDown,
  FaChevronRight, FaPlus, FaCamera, FaSmileBeam, FaHeart,
  FaCat, FaUtensils, FaFutbol, FaPlane, FaMusic, FaPalette as FaPaletteIcon,
  FaTrashAlt, FaCheckCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { supabase } from "../lib/supabase";
import io from "socket.io-client";
import Peer from "simple-peer";

const SOCKET_URL = "http://localhost:5000";

/* ═══════════════════════════════════════════════════════════════
   STICKER CATEGORIES
   ═══════════════════════════════════════════════════════════════ */
const STICKER_CATEGORIES = {
  Smileys: {
    icon: FaSmileBeam,
    stickers: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
      "😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙",
      "😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔",
      "🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥",
      "😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮",
      "🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","🧐","😕",
    ],
  },
  Love: {
    icon: FaHeart,
    stickers: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️",
      "😍","🥰","😘","💋","💌","🌹","💐","🌸","💒","💍",
      "😻","😽","🫶","🫰","🤗","😚","😙","💑","💏","👩‍❤️‍👨",
    ],
  },
  Animals: {
    icon: FaCat,
    stickers: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔",
      "🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴",
      "🦄","🐝","🐛","🦋","🐌","🐞","🐜","🕷️","🦂","🐢",
      "🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡",
      "🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓",
    ],
  },
  Food: {
    icon: FaUtensils,
    stickers: [
      "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈",
      "🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦",
      "🥬","🥒","🌶️","🌽","🥕","🧄","🧅","🥔","🍠","🥐",
      "🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓",
      "🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥙","🧆","🥘",
      "🍝","🍜","🍲","🍛","🍣","🍱","🥟","🍤","🍙","🍚",
    ],
  },
  Activities: {
    icon: FaFutbol,
    stickers: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
      "🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳",
      "🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷",
      "⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️",
      "🤺","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗",
    ],
  },
  Travel: {
    icon: FaPlane,
    stickers: [
      "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐",
      "🛻","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🛺","🚨",
      "🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞",
      "🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️",
      "🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵",
      "🚤","🛥️","🛳️","⛴️","🚢","🗺️","🗿","🗽","🗼","🏰",
    ],
  },
  Symbols: {
    icon: FaHeart,
    stickers: [
      "✨","⭐","🌟","💫","⚡","🔥","💥","💢","💦","💨",
      "🎉","🎊","🎈","🎁","🎀","🎗️","🎟️","🎫","🏆","🥇",
      "🥈","🥉","🏅","🎖️","🎨","🎭","🎪","🎤","🎧","🎼",
      "🎵","🎶","🎷","🎸","🎹","🎺","🎻","🥁","🎬","📸",
      "💡","🔔","🔕","📣","📢","💬","💭","🗯️","♠️","♣️",
    ],
  },
  Music: {
    icon: FaMusic,
    stickers: [
      "🎵","🎶","🎼","🎤","🎧","🎷","🎸","🎹","🎺","🎻",
      "🥁","🪘","📯","🎙️","🎚️","🎛️","📻","🎬","🎭","🎨",
      "💿","📀","💽","📼","📷","📸","📹","🎥","📽️","🎞️",
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   CHAT THEMES
   ═══════════════════════════════════════════════════════════════ */
const CHAT_THEMES = [
  { id: "default", name: "Default",    bg: null,                          bubbleMe: null,                            bubbleThem: null },
  { id: "midnight", name: "Midnight",  bg: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", bubbleMe: "linear-gradient(135deg, #6366f1, #8b5cf6)", bubbleThem: "rgba(255,255,255,0.08)" },
  { id: "sunset",   name: "Sunset",    bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)", bubbleMe: "linear-gradient(135deg, #f97316, #ef4444)", bubbleThem: "rgba(255,255,255,0.85)" },
  { id: "ocean",    name: "Ocean",     bg: "linear-gradient(135deg, #2193b0, #6dd5ed)", bubbleMe: "linear-gradient(135deg, #0284c7, #0369a1)", bubbleThem: "rgba(255,255,255,0.85)" },
  { id: "forest",   name: "Forest",    bg: "linear-gradient(135deg, #134e5e, #71b280)", bubbleMe: "linear-gradient(135deg, #16a34a, #15803d)", bubbleThem: "rgba(255,255,255,0.85)" },
  { id: "lavender", name: "Lavender",  bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", bubbleMe: "linear-gradient(135deg, #8b5cf6, #7c3aed)", bubbleThem: "rgba(255,255,255,0.9)" },
  { id: "peach",    name: "Peach",     bg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", bubbleMe: "linear-gradient(135deg, #f97316, #ea580c)", bubbleThem: "rgba(255,255,255,0.9)" },
  { id: "mono",     name: "Mono",      bg: "linear-gradient(135deg, #232526, #414345)", bubbleMe: "linear-gradient(135deg, #525252, #404040)", bubbleThem: "rgba(255,255,255,0.1)" },
];

/* ═══════════════════════════════════════════════════════════════
   THEME TOKENS — Light cream + dark charcoal
   ═══════════════════════════════════════════════════════════════ */
const ChatStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    .theme-dark {
      --ch-app-bg:        #0A0A12;
      --ch-sidebar:       #0F0F1A;
      --ch-middle:        #13131C;
      --ch-right:         #0F0F1A;
      --ch-panel:         #16161F;
      --ch-panel-2:       #1C1C28;
      --ch-card:          #1A1A24;
      --ch-line:          rgba(255,255,255,0.06);
      --ch-line-str:      rgba(255,255,255,0.14);
      --ch-txt:           #FFFFFF;
      --ch-txt-soft:      rgba(255,255,255,0.62);
      --ch-txt-faint:     rgba(255,255,255,0.38);
      --ch-primary:       #eb7d34;
      --ch-primary-2:     #f59e0b;
      --ch-primary-soft:  rgba(235,125,52,0.14);
      --ch-primary-glow:  rgba(235,125,52,0.45);
      --ch-sage-bg:       rgba(235,125,52,0.15);
      --ch-sage-fg:       #f59e0b;
      --ch-mint:          #7BAE9A;
      --ch-mint-soft:     rgba(123,174,154,0.16);
      --ch-danger:        #E2795F;
      --ch-danger-soft:   rgba(226,121,95,0.14);
      --ch-bubble-me:     linear-gradient(135deg, #eb7d34 0%, #d76a20 100%);
      --ch-bubble-them:   #1C1C28;
    }

    .theme-light {
      --ch-app-bg:        #F7F5F0;
      --ch-sidebar:       #FFFFFF;
      --ch-middle:        #FFFFFF;
      --ch-right:         #FAF8F3;
      --ch-panel:         #FFFFFF;
      --ch-panel-2:       #F7F5F0;
      --ch-card:          #FFFFFF;
      --ch-line:          rgba(20,20,30,0.06);
      --ch-line-str:      rgba(20,20,30,0.12);
      --ch-txt:           #1A1A22;
      --ch-txt-soft:      rgba(26,26,34,0.6);
      --ch-txt-faint:     rgba(26,26,34,0.4);
      --ch-primary:       #4C7C5A;
      --ch-primary-2:     #7BAE9A;
      --ch-primary-soft:  rgba(76,124,90,0.10);
      --ch-primary-glow:  rgba(76,124,90,0.30);
      --ch-sage-bg:       #E8F0E8;
      --ch-sage-fg:       #4C7C5A;
      --ch-mint:          #7BAE9A;
      --ch-mint-soft:     rgba(123,174,154,0.14);
      --ch-danger:        #B23A2E;
      --ch-danger-soft:   rgba(178,58,46,0.10);
      --ch-bubble-me:     linear-gradient(135deg, #4C7C5A 0%, #3F6A4B 100%);
      --ch-bubble-them:   #FFFFFF;
    }

    .ch-app {
      background: var(--ch-app-bg);
      color: var(--ch-txt);
      font-family: 'Manrope', system-ui, sans-serif;
      transition: background 0.3s ease, color 0.3s ease;
    }
    .ch-sidebar { background: var(--ch-sidebar); border-right: 1px solid var(--ch-line); }
    .ch-middle  { background: var(--ch-middle); }
    .ch-right   { background: var(--ch-right); border-left: 1px solid var(--ch-line); }
    .ch-panel   { background: var(--ch-panel); border: 1px solid var(--ch-line); }
    .ch-panel-2 { background: var(--ch-panel-2); }

    .ch-input {
      background: var(--ch-panel);
      color: var(--ch-txt);
      border: 1px solid var(--ch-line);
    }
    .ch-input::placeholder { color: var(--ch-txt-faint); }

    .ch-conv-row {
      transition: background 0.15s ease;
      border-radius: 14px;
    }
    .ch-conv-row:hover { background: var(--ch-primary-soft); }
    .ch-conv-row--active {
      background: var(--ch-sage-bg);
      border: 1px solid transparent;
    }

    .ch-bubble-them {
      background: var(--ch-bubble-them);
      color: var(--ch-txt);
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .ch-bubble-me {
      background: var(--ch-sage-bg);
      color: var(--ch-sage-fg);
      border-radius: 18px 18px 4px 18px;
    }
    .theme-dark .ch-bubble-me {
      background: var(--ch-bubble-me);
      color: #FFFFFF;
    }

    .ch-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .ch-scroll::-webkit-scrollbar-track { background: transparent; }
    .ch-scroll::-webkit-scrollbar-thumb {
      background: var(--ch-line-str);
      border-radius: 4px;
    }
    .ch-scroll::-webkit-scrollbar-thumb:hover { background: var(--ch-primary); }

    /* Sticker / emoji grid */
    .ch-sticker-btn {
      font-size: 24px;
      line-height: 1;
      padding: 6px;
      border-radius: 10px;
      transition: transform 0.12s ease, background 0.12s ease;
      cursor: pointer;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ch-sticker-btn:hover { background: var(--ch-primary-soft); transform: scale(1.15); }

    /* Theme card */
    .ch-theme-card {
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border: 2px solid transparent;
    }
    .ch-theme-card:hover { transform: scale(1.03); }
    .ch-theme-card--active { border-color: var(--ch-primary); }
  `}</style>
);

/* ────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────── */
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AvatarWithFallback = ({
  seed, name, avatarUrl,
  size = "h-10 w-10", textSize = "text-sm",
  className = "", rounded = "rounded-full",
}) => {
  const displayName = name || seed || "User";
  const initials = getInitials(displayName);
  const imageUrl = avatarUrl || seed?.avatar_url || null;

  return (
    <div
      className={`${size} ${rounded} text-white font-ticket-body font-bold ${textSize} overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{
        background: imageUrl ? undefined : "linear-gradient(135deg, var(--ch-mint), var(--ch-primary-2))",
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className="h-full w-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        initials
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   TOAST
   ──────────────────────────────────────────────────────────── */
const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isError = toast.type === "error";
  const accent = isError ? "var(--ch-danger)" : "var(--ch-primary)";

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -20, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        onClick={onDismiss}
        className="fixed top-20 right-4 z-[200] cursor-pointer"
      >
        <div
          className="rounded-xl border shadow-lg w-[280px] px-3 py-2.5 flex items-center gap-2.5"
          style={{ background: "var(--ch-panel)", borderColor: accent }}
        >
          <span
            className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center"
            style={{ background: isError ? "var(--ch-danger-soft)" : "var(--ch-primary-soft)", color: accent }}
          >
            {isError ? <FaExclamationCircle className="text-[10px]" /> : <FaCheck className="text-[10px]" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-ticket-body text-[11px] font-extrabold truncate" style={{ color: "var(--ch-txt)" }}>
              {toast.title}
            </p>
            {toast.message && (
              <p className="font-ticket-body text-[9.5px] truncate mt-0.5" style={{ color: "var(--ch-txt-soft)" }}>
                {toast.message}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────
   IMAGE VIEWER
   ──────────────────────────────────────────────────────────── */
const ImageViewer = ({ imageUrl, onClose }) => {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const download = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
          <FaTimes size={18} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <FaCompress size={16} />
          </button>
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-white font-ticket-body text-xs font-bold border border-white/20">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <FaExpand size={16} />
          </button>
          <button onClick={download}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <FaDownload size={16} />
          </button>
        </div>
      </div>
      <motion.img
        src={imageUrl} alt=""
        className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl"
        style={{ transform: `scale(${zoom})` }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────
   STICKER PICKER
   ──────────────────────────────────────────────────────────── */
const StickerPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("Smileys");
  const categories = Object.keys(STICKER_CATEGORIES);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="absolute bottom-full mb-3 left-0 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden z-50"
      style={{ background: "var(--ch-panel)", border: "1px solid var(--ch-line-str)" }}
    >
      {/* Category tabs */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto ch-scroll"
        style={{ borderBottom: "1px solid var(--ch-line)" }}>
        {categories.map((cat) => {
          const catData = STICKER_CATEGORIES[cat];
          const Icon = catData.icon;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 p-2 rounded-lg transition-colors"
              style={{
                background: isActive ? "var(--ch-primary-soft)" : "transparent",
                color: isActive ? "var(--ch-primary)" : "var(--ch-txt-soft)",
              }}
              title={cat}
            >
              <Icon size={14} />
            </button>
          );
        })}
        <button
          onClick={onClose}
          className="ml-auto flex-shrink-0 p-2 rounded-lg"
          style={{ color: "var(--ch-txt-soft)" }}
        >
          <FaTimes size={12} />
        </button>
      </div>

      {/* Category label */}
      <div className="px-3 pt-2.5 pb-1">
        <span className="font-ticket-body text-[10px] font-extrabold uppercase tracking-widest"
          style={{ color: "var(--ch-txt-faint)" }}>
          {activeCategory}
        </span>
      </div>

      {/* Stickers grid */}
      <div className="grid grid-cols-8 gap-1 px-3 py-3 max-h-[280px] overflow-y-auto ch-scroll">
        {STICKER_CATEGORIES[activeCategory].stickers.map((sticker, i) => (
          <button
            key={`${activeCategory}-${i}`}
            onClick={() => onSelect(sticker)}
            className="ch-sticker-btn"
            type="button"
          >
            {sticker}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────
   CHAT THEME CUSTOMIZER MODAL
   ──────────────────────────────────────────────────────────── */
const ChatThemeModal = ({ isOpen, onClose, currentTheme, onApply }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme?.id || "default");
  const [customBg, setCustomBg] = useState(currentTheme?.customBg || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme?.id || "default");
      setCustomBg(currentTheme?.customBg || null);
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomBg(ev.target?.result || null);
      setSelectedTheme("custom");
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (selectedTheme === "custom" && customBg) {
      onApply({ id: "custom", name: "Custom", bg: customBg, customBg, bubbleMe: null, bubbleThem: null });
    } else {
      const theme = CHAT_THEMES.find((t) => t.id === selectedTheme);
      if (theme) onApply({ ...theme, customBg: null });
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "var(--ch-panel)", border: "1px solid var(--ch-line-str)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--ch-line)" }}>
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--ch-primary-soft)", color: "var(--ch-primary)" }}>
              <FaPaletteIcon size={13} />
            </span>
            <h3 className="font-ticket-display text-lg font-bold" style={{ color: "var(--ch-txt)" }}>
              Chat Theme
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: "var(--ch-txt-soft)" }}>
            <FaTimes size={14} />
          </button>
        </div>

        {/* Themes grid */}
        <div className="p-5 max-h-[60vh] overflow-y-auto ch-scroll">
          <p className="font-ticket-body text-[10px] font-extrabold uppercase tracking-widest mb-3"
            style={{ color: "var(--ch-txt-faint)" }}>
            Preset Themes
          </p>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {CHAT_THEMES.map((theme) => {
              const isActive = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`ch-theme-card ${isActive ? "ch-theme-card--active" : ""}`}
                  style={{
                    aspectRatio: "1",
                    background: theme.bg || "linear-gradient(135deg, var(--ch-panel-2), var(--ch-panel))",
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-1.5 gap-0.5">
                    <div
                      className="h-1.5 w-3/4 rounded-full self-start"
                      style={{ background: theme.bubbleMe || "var(--ch-bubble-me)" }}
                    />
                    <div
                      className="h-1.5 w-2/3 rounded-full self-end"
                      style={{ background: theme.bubbleThem || "var(--ch-bubble-them)" }}
                    />
                  </div>
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: "var(--ch-primary)" }}>
                      <FaCheck size={9} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom image */}
          <p className="font-ticket-body text-[10px] font-extrabold uppercase tracking-widest mb-3"
            style={{ color: "var(--ch-txt-faint)" }}>
            Custom Background
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-ticket-body text-[12px] font-bold"
              style={{ background: "var(--ch-panel-2)", color: "var(--ch-txt)", border: "1px solid var(--ch-line)" }}
            >
              <FaImage size={12} /> Upload Image
            </button>
            {customBg && (
              <button
                onClick={() => {
                  setCustomBg(null);
                  if (selectedTheme === "custom") setSelectedTheme("default");
                }}
                className="px-4 py-3 rounded-xl font-ticket-body text-[12px] font-bold"
                style={{ background: "var(--ch-danger-soft)", color: "var(--ch-danger)" }}
              >
                <FaTrashAlt size={12} />
              </button>
            )}
          </div>
          {customBg && (
            <div
              className={`ch-theme-card mt-3 ${selectedTheme === "custom" ? "ch-theme-card--active" : ""}`}
              onClick={() => setSelectedTheme("custom")}
              style={{ aspectRatio: "16/9", backgroundImage: `url(${customBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              {selectedTheme === "custom" && (
                <span className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: "var(--ch-primary)" }}>
                  <FaCheck size={11} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--ch-line)" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-ticket-body text-[12px] font-bold"
            style={{ background: "var(--ch-panel-2)", color: "var(--ch-txt)", border: "1px solid var(--ch-line)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl font-ticket-body text-[12px] font-bold text-white"
            style={{ background: "var(--ch-primary)" }}
          >
            Apply Theme
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────
   VOICE CALL MODAL
   ──────────────────────────────────────────────────────────── */
const VoiceCallModal = ({ isOpen, onClose, callerName, callerAvatar, onAccept, onReject, onEndCall, callStatus }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let i;
    if (callStatus === "active") i = setInterval(() => setDuration((p) => p + 1), 1000);
    else setDuration(0);
    return () => clearInterval(i);
  }, [callStatus]);

  if (!isOpen) return null;

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="ch-panel rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="relative inline-block mb-6">
          {callerAvatar ? (
            <img src={callerAvatar} alt={callerName} className="h-24 w-24 rounded-full object-cover"
              style={{ border: "2px solid var(--ch-primary)" }} />
          ) : (
            <div className="h-24 w-24 rounded-full flex items-center justify-center text-white font-ticket-display text-3xl font-bold"
              style={{ background: "linear-gradient(135deg, var(--ch-mint), var(--ch-primary-2))" }}>
              {callerName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <h3 className="font-ticket-display text-xl font-bold mb-1" style={{ color: "var(--ch-txt)" }}>
          {callerName}
        </h3>
        <p className="font-ticket-body text-sm mb-6" style={{ color: "var(--ch-txt-soft)" }}>
          {callStatus === "incoming" && "Incoming call..."}
          {callStatus === "outgoing" && "Calling..."}
          {callStatus === "active" && fmt(duration)}
          {callStatus === "ended" && "Call ended"}
        </p>
        <div className="flex items-center justify-center gap-4">
          {callStatus === "incoming" && (
            <>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onReject}
                className="p-4 rounded-full text-white" style={{ background: "var(--ch-danger)" }}>
                <FaPhoneSlash className="text-xl" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onAccept}
                className="p-4 rounded-full text-white" style={{ background: "var(--ch-primary)" }}>
                <FaPhone className="text-xl" />
              </motion.button>
            </>
          )}
          {(callStatus === "outgoing" || callStatus === "active") && (
            <>
              {callStatus === "active" && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsMuted(!isMuted)}
                  className="p-4 rounded-full"
                  style={{
                    background: isMuted ? "var(--ch-primary)" : "var(--ch-panel-2)",
                    color: isMuted ? "#fff" : "var(--ch-txt)",
                    border: "1px solid var(--ch-line)",
                  }}>
                  {isMuted ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
                </motion.button>
              )}
              <motion.button whileTap={{ scale: 0.9 }} onClick={onEndCall}
                className="p-4 rounded-full text-white" style={{ background: "var(--ch-danger)" }}>
                <FaPhoneSlash className="text-xl" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN CHAT PAGE
   ═══════════════════════════════════════════════════════════════ */
const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserList, setShowUserList] = useState(true);
  const [viewingImage, setViewingImage] = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* Call states */
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [callerInfo, setCallerInfo] = useState(null);

  /* Voice recording */
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  /* ⭐ NEW: Chat theme */
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [chatTheme, setChatTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("chat-theme");
      return saved ? JSON.parse(saved) : { id: "default", name: "Default", bg: null, bubbleMe: null, bubbleThem: null, customBg: null };
    } catch {
      return { id: "default", name: "Default", bg: null, bubbleMe: null, bubbleThem: null, customBg: null };
    }
  });

  /* Persist theme */
  useEffect(() => {
    try {
      localStorage.setItem("chat-theme", JSON.stringify(chatTheme));
    } catch {}
  }, [chatTheme]);

  const deepLinkHandledRef = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const streamRef = useRef(null);

  const userProfile = useMemo(
    () => ({
      full_name: profile?.fullName,
      avatar_url: profile?.avatar,
      avatar: profile?.avatar,
      email: profile?.email,
    }),
    [profile]
  );

  const pushToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToast({ id, type, title, message });
    setTimeout(() => setToast(null), 2600);
  };
  const showNotification = (message, variant = "info") => {
    pushToast(variant === "error" ? "error" : "success", message);
  };

  const getUserDisplayName = (u) => u?.full_name || u?.name || u?.email || "User";
  const getUserAvatar = (u) => u?.avatar_url || u?.avatar || null;

  /* ═══════════════════════════════════════════════════════════
     DATA FETCHING
     ═══════════════════════════════════════════════════════════ */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, phone, city")
        .neq("id", user.id);

      const profileIds = (profilesData || []).map((p) => p.id);
      if (profileIds.length === 0) { setAllUsers([]); setLoading(false); return; }

      const [usersRes, settingsRes, statusRes, approvedRes, blockedRes] = await Promise.all([
        supabase.from("users").select("id, name, full_name, username, email, avatar_url").in("id", profileIds),
        supabase.from("user_settings").select("user_id, full_name, avatar, avatar_url, bio, status_message, location, occupation").in("user_id", profileIds),
        supabase.from("user_status").select("*"),
        supabase.from("chat_requests").select("*").eq("status", "accepted").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from("blocked_users").select("blocked_user_id").eq("user_id", user.id),
      ]);

      const usersById = {};
      (usersRes.data || []).forEach((u) => { usersById[u.id] = u; });
      const settingsByUserId = {};
      (settingsRes.data || []).forEach((s) => { settingsByUserId[s.user_id] = s; });
      const statusByUserId = {};
      (statusRes.data || []).forEach((s) => { statusByUserId[s.user_id] = s; });
      const blockedIds = new Set((blockedRes.data || []).map((b) => b.blocked_user_id));
      setBlockedUsers([...blockedIds]);

      const users = (profilesData || []).map((p) => {
        const u = usersById[p.id] || {};
        const s = settingsByUserId[p.id] || {};
        const status = statusByUserId[p.id];
        const isApproved = (approvedRes.data || []).some((c) => c.sender_id === p.id || c.receiver_id === p.id);

        const displayName =
          s.full_name || u.full_name || u.name || u.username || p.full_name ||
          (p.email ? p.email.split("@")[0] : null) || "User";

        const avatarUrl = s.avatar || s.avatar_url || u.avatar_url || p.avatar_url || null;

        return {
          id: p.id,
          email: p.email || u.email,
          full_name: displayName,
          avatar_url: avatarUrl,
          bio: s.bio || "",
          status_message: s.status_message || "",
          location: s.location || p.city || "",
          occupation: s.occupation || "",
          online: status?.status === "online" || false,
          lastSeen: status?.updated_at || null,
          isApproved: isApproved || false,
          isBlocked: blockedIds.has(p.id),
        };
      });

      setAllUsers(users);
    } catch (e) {
      console.error("loadUsers failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadChatRequests = async () => {
    try {
      const { data } = await supabase
        .from("chat_requests").select("*")
        .eq("receiver_id", user.id).eq("status", "pending");
      setChatRequests(data || []);
    } catch {}
  };

  const loadPendingRequests = async () => {
    try {
      const { data } = await supabase
        .from("chat_requests").select("*")
        .eq("sender_id", user.id).eq("status", "pending");
      setPendingRequests(data || []);
    } catch {}
  };

  const loadBlockedUsers = async () => {
    try {
      const { data } = await supabase.from("blocked_users").select("blocked_user_id").eq("user_id", user.id);
      setBlockedUsers((data || []).map((b) => b.blocked_user_id));
    } catch {}
  };

  const loadMessages = async (otherUserId, scrollToMsgId = null) => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("messages").select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order("created_at", { ascending: true });

      const formatted = (data || []).map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === user.id ? "user" : "other",
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: msg.read || false,
        type: msg.message_type || "text",
        replyTo: msg.reply_to || null,
        duration: msg.duration || 0,
      }));
      setMessages(formatted);

      if (scrollToMsgId) {
        setTimeout(() => {
          const el = document.querySelector(`[data-msg-id="${scrollToMsgId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.background = "var(--ch-primary-soft)";
            setTimeout(() => { el.style.background = ""; }, 1600);
          }
        }, 400);
      }
    } catch {} finally { setLoading(false); }
  };

  /* ═══════════════════════════════════════════════════════════
     INITIAL LOAD
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (user) {
      loadUsers();
      loadChatRequests();
      loadPendingRequests();
      loadBlockedUsers();
    }
  }, [user]);

  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Deep link: ?user=<id> */
  useEffect(() => {
    if (deepLinkHandledRef.current || allUsers.length === 0) return;
    const targetUserId = searchParams.get("user");
    const targetMsgId = searchParams.get("msg");
    if (!targetUserId) return;
    const target = allUsers.find((u) => u.id === targetUserId);
    if (!target) return;
    setSelectedUser(target);
    loadMessages(target.id, targetMsgId);
    setShowUserList(false);
    deepLinkHandledRef.current = true;
    const np = new URLSearchParams(searchParams);
    np.delete("user"); np.delete("msg");
    setSearchParams(np, { replace: true });
  },
  
  [allUsers, searchParams, setSearchParams]);

  /* Realtime */
  useEffect(() => {
    if (!user) return;
    const reqChannel = supabase
      .channel("chat_requests_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_requests", filter: `receiver_id=eq.${user.id}` }, (payload) => {
        setChatRequests((prev) => [...prev, payload.new]);
        showNotification(`New chat request from ${payload.new.sender_name || "a user"}`);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_requests" }, () => {
        loadChatRequests(); loadPendingRequests(); loadUsers();
      })
      .subscribe();

    const msgChannel = supabase
      .channel("messages_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, (payload) => {
        if (selectedUser && selectedUser.id === payload.new.sender_id) {
          setMessages((prev) => [...prev, {
            id: payload.new.id,
            sender: "other",
            text: payload.new.content,
            timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: false,
            type: payload.new.message_type || "text",
            duration: payload.new.duration || 0,
          }]);
        } else {
          loadUsers();
        }
      })
      .subscribe();

    return () => {
      reqChannel.unsubscribe();
      msgChannel.unsubscribe();
    };
  }, [user, selectedUser]);

  /* Socket for calls */
  useEffect(() => {
    if (!user || socket) return;
    const newSocket = io(SOCKET_URL, { transports: ["websocket"], reconnectionAttempts: 5 });

    newSocket.on("connect", () => { newSocket.emit("register-user", user.id); });
    newSocket.on("online-users", (onlineUsers) => {
      setAllUsers((prev) => prev.map((u) => ({ ...u, online: onlineUsers.includes(u.id) })));
    });
    newSocket.on("user-online", (uid) => {
      setAllUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, online: true } : u)));
    });
    newSocket.on("user-offline", (uid) => {
      setAllUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, online: false } : u)));
    });

    newSocket.on("incoming-call", ({ from, signal }) => {
      const callerUser = allUsers.find((u) => u.id === from);
      if (callerUser) {
        setCallerInfo({ id: from, name: getUserDisplayName(callerUser), avatar: getUserAvatar(callerUser) });
        setCallStatus("incoming");
        setCallModalOpen(true);
        window._incomingSignal = signal;
        window._callerId = from;
      }
    });

    newSocket.on("call-accepted", ({ signal }) => {
      if (peer) { peer.signal(signal); setCallStatus("active"); }
    });
    newSocket.on("call-rejected", () => {
      setCallStatus("ended");
      if (peer) { peer.destroy(); setPeer(null); }
      showNotification("Call rejected", "info");
    });
    newSocket.on("call-ended", () => {
      setCallStatus("ended");
      if (peer) { peer.destroy(); setPeer(null); }
      showNotification("Call ended", "info");
    });

    setSocket(newSocket);
    return () => {
      newSocket.emit("unregister-user", user.id);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  /* ═══════════════════════════════════════════════════════════
     ACTIONS
     ═══════════════════════════════════════════════════════════ */
  const sendChatRequest = async (receiverId, receiverName) => {
    try {
      if (blockedUsers.includes(receiverId)) { showNotification("User blocked", "info"); return; }
      if (pendingRequests.find((r) => r.receiver_id === receiverId)) { showNotification("Already sent", "info"); return; }
      await supabase.from("chat_requests").insert([{
        sender_id: user.id,
        sender_name: userProfile?.full_name || user?.email || "User",
        receiver_id: receiverId,
        receiver_name: receiverName || "User",
        status: "pending",
        created_at: new Date().toISOString(),
      }]);
      showNotification("Request sent!");
      loadPendingRequests(); loadUsers();
    } catch { showNotification("Failed to send", "error"); }
  };

  const acceptRequest = async (requestId) => {
    try {
      await supabase.from("chat_requests").update({ status: "accepted" }).eq("id", requestId);
      showNotification("Accepted!");
      loadChatRequests(); loadUsers();
    } catch {}
  };

  const rejectRequest = async (requestId) => {
    try {
      await supabase.from("chat_requests").update({ status: "rejected" }).eq("id", requestId);
      showNotification("Rejected", "info");
      loadChatRequests();
    } catch {}
  };

  const blockUser = async (userId) => {
    try {
      await supabase.from("blocked_users").insert([{ user_id: user.id, blocked_user_id: userId }]);
      setBlockedUsers((p) => [...p, userId]);
      showNotification("User blocked");
      if (selectedUser?.id === userId) { setSelectedUser(null); setMessages([]); setShowUserList(true); }
      loadUsers();
    } catch { showNotification("Failed to block", "error"); }
  };

  const unblockUser = async (userId) => {
    try {
      await supabase.from("blocked_users").delete().eq("user_id", user.id).eq("blocked_user_id", userId);
      setBlockedUsers((p) => p.filter((id) => id !== userId));
      showNotification("User unblocked");
      loadUsers();
    } catch {}
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await supabase.from("messages").delete().eq("id", messageId);
      setMessages((p) => p.filter((m) => m.id !== messageId));
      showNotification("Message deleted");
    } catch { showNotification("Failed to delete", "error"); }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedUser) return;
    if (blockedUsers.includes(selectedUser.id)) { showNotification("User blocked", "info"); return; }

    const userMessage = inputText.trim();
    const tempId = Date.now();
    const newMessage = {
      id: tempId, sender: "user", text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true, type: "text",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null,
    };
    setMessages((p) => [...p, newMessage]);
    setInputText("");

    try {
      const { data, error } = await supabase.from("messages").insert([{
        sender_id: user.id, receiver_id: selectedUser.id,
        content: userMessage, created_at: new Date().toISOString(),
        read: false, message_type: "text",
        reply_to: replyingTo ? replyingTo.id : null,
      }]).select();
      if (error) throw error;
      if (data?.length > 0)
        setMessages((p) => p.map((m) => (m.id === tempId ? { ...m, id: data[0].id } : m)));
      setReplyingTo(null);
    } catch {
      showNotification("Failed to send", "error");
      setMessages((p) => p.filter((m) => m.id !== tempId));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showNotification("Image < 5MB", "error"); return; }
    if (!file.type.startsWith("image/")) { showNotification("Upload an image", "error"); return; }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Image = ev.target?.result;
      if (!base64Image) { setUploadingImage(false); return; }
      if (!selectedUser || blockedUsers.includes(selectedUser.id)) { setUploadingImage(false); return; }

      const tempId = Date.now();
      setMessages((p) => [...p, {
        id: tempId, sender: "user", text: base64Image,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true, type: "image",
      }]);

      try {
        const { data, error } = await supabase.from("messages").insert([{
          sender_id: user.id, receiver_id: selectedUser.id,
          content: base64Image, created_at: new Date().toISOString(),
          read: false, message_type: "image",
        }]).select();
        if (error) throw error;
        if (data?.length > 0)
          setMessages((p) => p.map((m) => (m.id === tempId ? { ...m, id: data[0].id } : m)));
      } catch { showNotification("Failed to send image", "error"); }
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        sendVoiceMessage(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((p) => {
          if (p >= 60) { stopRecording(); return p; }
          return p + 1;
        });
      }, 1000);
    } catch { showNotification("Failed to access mic", "error"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const sendVoiceMessage = async (blob) => {
    if (!selectedUser) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Audio = e.target?.result;
      if (!base64Audio) return;
      const tempId = Date.now();
      setMessages((p) => [...p, {
        id: tempId, sender: "user", text: base64Audio,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true, type: "voice", duration: recordingDuration,
      }]);
      try {
        const { data, error } = await supabase.from("messages").insert([{
          sender_id: user.id, receiver_id: selectedUser.id,
          content: base64Audio, created_at: new Date().toISOString(),
          read: false, message_type: "voice", duration: recordingDuration,
        }]).select();
        if (error) throw error;
        if (data?.length > 0)
          setMessages((p) => p.map((m) => (m.id === tempId ? { ...m, id: data[0].id } : m)));
      } catch {}
    };
    reader.readAsDataURL(blob);
  };

  const playVoiceMessage = (message) => {
    if (playingMessageId === message.id) {
      audioPlayerRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }
    if (audioPlayerRef.current) { audioPlayerRef.current.pause(); audioPlayerRef.current = null; }
    const audio = new Audio(message.text);
    audioPlayerRef.current = audio;
    audio.onended = () => { setPlayingMessageId(null); audioPlayerRef.current = null; };
    audio.onplay = () => setPlayingMessageId(message.id);
    audio.play().catch(() => showNotification("Failed to play", "error"));
  };

  const sendSticker = async (sticker) => {
    if (!selectedUser) return;
    const tempId = Date.now();
    setMessages((p) => [...p, {
      id: tempId, sender: "user", text: sticker,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true, type: "sticker",
    }]);
    setShowStickerPicker(false);
    try {
      const { data } = await supabase.from("messages").insert([{
        sender_id: user.id, receiver_id: selectedUser.id,
        content: sticker, created_at: new Date().toISOString(),
        read: false, message_type: "sticker",
      }]).select();
      if (data?.length > 0)
        setMessages((p) => p.map((m) => (m.id === tempId ? { ...m, id: data[0].id } : m)));
    } catch {}
  };

  const startCall = async (receiverId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const newPeer = new Peer({ initiator: true, stream, trickle: false });
      newPeer.on("signal", (data) => {
        if (socket && selectedUser) socket.emit("call-user", { from: user.id, to: receiverId, signalData: data });
      });
      newPeer.on("stream", (remote) => {
        if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = remote; remoteAudioRef.current.play(); }
      });
      newPeer.on("connect", () => setCallStatus("active"));
      setPeer(newPeer);
      setCallStatus("outgoing");
      setCallModalOpen(true);
    } catch { showNotification("Failed to start call", "error"); }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const newPeer = new Peer({ initiator: false, stream, trickle: false });
      newPeer.on("signal", (data) => {
        if (socket && window._callerId) socket.emit("accept-call", { to: window._callerId, signalData: data });
      });
      newPeer.on("stream", (remote) => {
        if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = remote; remoteAudioRef.current.play(); }
      });
      if (window._incomingSignal) newPeer.signal(window._incomingSignal);
      setPeer(newPeer);
      setCallStatus("active");
    } catch {}
  };

  const rejectCall = () => {
    if (socket && window._callerId) socket.emit("reject-call", { to: window._callerId });
    setCallStatus("ended");
    setCallModalOpen(false);
  };

  const endCall = () => {
    if (socket && selectedUser) socket.emit("end-call", { to: selectedUser.id });
    if (peer) { peer.destroy(); setPeer(null); }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setCallStatus("ended");
    setCallModalOpen(false);
  };

  /* ⭐ NEW: Apply chat theme */
  const applyChatTheme = (theme) => {
    setChatTheme(theme);
    showNotification(`Theme applied: ${theme.name}`);
  };

  /* Computed: background style for messages area */
  const messagesBgStyle = useMemo(() => {
    if (!chatTheme || chatTheme.id === "default") {
      return { background: "var(--ch-middle)" };
    }
    if (chatTheme.id === "custom" && chatTheme.customBg) {
      return {
        backgroundImage: `url(${chatTheme.customBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "local",
      };
    }
    if (chatTheme.bg) {
      return { background: chatTheme.bg };
    }
    return { background: "var(--ch-middle)" };
  }, [chatTheme]);

  /* Computed: bubble overrides for custom themes */
  const bubbleStyles = useMemo(() => {
    const isDefault = !chatTheme || chatTheme.id === "default";
    if (isDefault) return { me: undefined, them: undefined };
    return {
      me: chatTheme.bubbleMe ? { background: chatTheme.bubbleMe, color: "#fff" } : undefined,
      them: chatTheme.bubbleThem ? { background: chatTheme.bubbleThem, color: "var(--ch-txt)", backdropFilter: "blur(8px)" } : undefined,
    };
  }, [chatTheme]);

  /* ═══════════════════════════════════════════════════════════
     FILTERS
     ═══════════════════════════════════════════════════════════ */
  const filteredUsers = allUsers.filter(
    (u) => !u.isBlocked && getUserDisplayName(u).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (u) => {
    if (u.isApproved) {
      setSelectedUser(u);
      loadMessages(u.id);
      setShowUserList(false);
    } else if (pendingRequests.some((r) => r.receiver_id === u.id)) {
      showNotification("Request pending...", "info");
    } else {
      setSelectedUser(u);
      setShowUserList(false);
    }
    setShowStickerPicker(false);
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (authLoading || profileLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center ch-app">
        <ChatStyles />
        <FaSpinner className="text-3xl animate-spin" style={{ color: "var(--ch-primary)" }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  const isUserBlocked = (id) => blockedUsers.includes(id);

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden ch-app flex flex-col">
      <ChatStyles />
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <AnimatePresence>
        {viewingImage && <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showThemeModal && (
          <ChatThemeModal
            isOpen={showThemeModal}
            onClose={() => setShowThemeModal(false)}
            currentTheme={chatTheme}
            onApply={applyChatTheme}
          />
        )}
      </AnimatePresence>

      <VoiceCallModal
        isOpen={callModalOpen}
        onClose={() => { setCallModalOpen(false); setCallStatus("idle"); }}
        callerName={callerInfo?.name || "Unknown"}
        callerAvatar={callerInfo?.avatar}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEndCall={endCall}
        callStatus={callStatus}
      />

      {/* ═══════ 3-PANEL LAYOUT ═══════ */}
      <div className="flex-1 min-h-0 flex">

        {/* ═══════════════════════════════════════
            LEFT: CHATS SIDEBAR
            ═══════════════════════════════════════ */}
        <aside
          className={`${showUserList ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-[360px] xl:w-[380px] flex-shrink-0 ch-sidebar`}
        >
          <div className="px-5 pt-5 pb-3">
            <button className="inline-flex items-center gap-1.5 font-ticket-body text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--ch-txt-faint)" }}>
              All Chats
              <FaChevronDown className="text-[8px]" />
            </button>
            <div className="flex items-baseline gap-2">
              <h1 className="font-ticket-display text-[34px] font-black leading-none" style={{ color: "var(--ch-txt)" }}>
                Messages
              </h1>
              <span className="font-ticket-display text-[22px] font-bold"
                style={{ color: "var(--ch-sage-fg)" }}>
                ({filteredUsers.length})
              </span>
            </div>
          </div>

          <div className="px-5 pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="font-ticket-body w-full px-4 py-3 pr-11 rounded-2xl text-sm outline-none ch-input"
                style={{ background: "var(--ch-panel-2)", borderColor: "var(--ch-line)" }}
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px]"
                style={{ color: "var(--ch-txt-faint)" }} />
            </div>
          </div>

          <div className="px-5 pb-2">
            <span className="font-ticket-body text-[10px] font-extrabold uppercase tracking-widest"
              style={{ color: "var(--ch-txt-faint)" }}>
              Messages
            </span>
          </div>

          <div className="flex-1 overflow-y-auto ch-scroll px-3 pb-4">
            {loading ? (
              <div className="text-center py-12">
                <FaSpinner className="text-2xl animate-spin mx-auto mb-3" style={{ color: "var(--ch-primary)" }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full ch-panel-2 mb-3">
                  <FaUsers size={26} style={{ color: "var(--ch-txt-faint)" }} />
                </div>
                <p className="font-ticket-body text-sm font-bold" style={{ color: "var(--ch-txt-soft)" }}>
                  No contacts
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const displayName = getUserDisplayName(u);
                const preview = u.status_message || u.bio || (u.online ? "Online now" : u.occupation || u.location || "");

                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full flex items-center gap-3 p-3 mb-1 text-left ch-conv-row ${
                      isSelected ? "ch-conv-row--active" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <AvatarWithFallback
                        seed={u.id}
                        name={displayName}
                        avatarUrl={u.avatar_url}
                        size="h-12 w-12"
                        textSize="text-sm font-bold"
                        className="rounded-full"
                      />
                      {u.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full"
                          style={{ background: "var(--ch-mint)", border: "2px solid var(--ch-sidebar)" }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-ticket-body text-[14px] font-bold truncate" style={{ color: "var(--ch-txt)" }}>
                          {displayName}
                        </p>
                      </div>
                      <p className="font-ticket-body text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ch-txt-soft)" }}>
                        {preview}
                      </p>
                    </div>
                  </button>
                );
              })
            )}

            {chatRequests.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--ch-line)" }}>
                <p className="font-ticket-body text-[10px] font-extrabold uppercase tracking-widest mb-2 px-2"
                  style={{ color: "var(--ch-txt-faint)" }}>
                  Requests ({chatRequests.length})
                </p>
                {chatRequests.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-2xl mb-1.5"
                    style={{ background: "var(--ch-primary-soft)" }}>
                    <AvatarWithFallback seed={r.sender_id} name={r.sender_name} size="h-10 w-10" textSize="text-xs" />
                    <div className="flex-1 min-w-0">
                      <p className="font-ticket-body text-[12px] font-bold truncate" style={{ color: "var(--ch-txt)" }}>
                        {r.sender_name}
                      </p>
                      <p className="font-ticket-body text-[10px]" style={{ color: "var(--ch-txt-soft)" }}>
                        Wants to connect
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => acceptRequest(r.id)}
                        className="p-1.5 rounded-lg text-white"
                        style={{ background: "var(--ch-primary)" }}>
                        <FaCheck size={10} />
                      </button>
                      <button onClick={() => rejectRequest(r.id)}
                        className="p-1.5 rounded-lg text-white"
                        style={{ background: "var(--ch-danger)" }}>
                        <FaTimes size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ═══════════════════════════════════════
            MIDDLE: MESSAGES
            ═══════════════════════════════════════ */}
        <main className={`${showUserList ? "hidden" : "flex"} lg:flex flex-1 flex-col min-w-0 ch-middle`}>
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--ch-line)", background: "var(--ch-middle)" }}>
                <button onClick={() => setShowUserList(true)} className="lg:hidden p-2 -ml-2 rounded-xl">
                  <FaBack size={16} style={{ color: "var(--ch-txt)" }} />
                </button>

                <AvatarWithFallback
                  seed={selectedUser.id}
                  name={getUserDisplayName(selectedUser)}
                  avatarUrl={selectedUser.avatar_url}
                  size="h-11 w-11"
                  textSize="text-sm font-bold"
                  className="rounded-2xl"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-ticket-display text-[15px] font-bold truncate" style={{ color: "var(--ch-txt)" }}>
                    {getUserDisplayName(selectedUser)}
                  </h2>
                  <p className="font-ticket-body text-[11.5px]" style={{ color: "var(--ch-txt-soft)" }}>
                    {selectedUser.online ? "Online" : "Offline"}
                  </p>
                </div>

                {/* ⭐ Theme button in header */}
                <button
                  onClick={() => setShowThemeModal(true)}
                  className="p-2.5 rounded-xl"
                  style={{ color: "var(--ch-txt-soft)" }}
                  title="Chat theme"
                >
                  <FaPalette size={15} />
                </button>
              </div>

              {/* Messages area — with dynamic background */}
              <div
                className="flex-1 overflow-y-auto ch-scroll px-5 py-4 space-y-4"
                style={messagesBgStyle}
              >
                {!selectedUser.isApproved ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: "var(--ch-primary-soft)" }}>
                      <FaUserPlus size={28} style={{ color: "var(--ch-primary)" }} />
                    </div>
                    <h3 className="font-ticket-display text-lg font-bold mb-1" style={{ color: "var(--ch-txt)" }}>
                      Send a request
                    </h3>
                    <p className="font-ticket-body text-sm mb-4" style={{ color: "var(--ch-txt-soft)" }}>
                      Connect to start chatting
                    </p>
                    <button
                      onClick={() => sendChatRequest(selectedUser.id, getUserDisplayName(selectedUser))}
                      className="px-6 py-2.5 rounded-2xl font-ticket-body font-bold text-sm text-white"
                      style={{ background: "var(--ch-primary)" }}>
                      Send Request
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ border: "1px solid var(--ch-line-str)" }}>
                      <FaComment size={28} style={{ color: "var(--ch-txt-faint)" }} />
                    </div>
                    <h3 className="font-ticket-display text-lg font-bold mb-1" style={{ color: "var(--ch-txt)" }}>
                      No messages yet
                    </h3>
                    <p className="font-ticket-body text-sm" style={{ color: "var(--ch-txt-soft)" }}>
                      Say hello to start
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isUser = message.sender === "user";
                    const isVoice = message.type === "voice";
                    const isImage = message.type === "image";
                    const isSticker = message.type === "sticker";
                    const hasReply = message.replyTo;
                    const isPlaying = playingMessageId === message.id;

                    return (
                      <motion.div
                        key={message.id}
                        data-msg-id={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                      >
                        <div className={`flex items-center gap-2 mb-1 px-3 ${isUser ? "flex-row-reverse" : ""}`}>
                          <span className="font-ticket-body text-[11.5px] font-bold"
                            style={{ color: "var(--ch-txt)" }}>
                            {isUser ? "You" : getUserDisplayName(selectedUser)}
                          </span>
                          <span className="font-ticket-body text-[10px]" style={{ color: "var(--ch-txt-faint)" }}>
                            {message.timestamp}
                          </span>
                        </div>

                        <div
                          className={`max-w-[75%] ${isUser ? "ch-bubble-me" : "ch-bubble-them"} px-4 py-3`}
                          style={isUser ? bubbleStyles.me : bubbleStyles.them}
                        >
                          {hasReply && (
                            <div className="mb-2 pb-2 text-[10px] font-ticket-body"
                              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", color: "var(--ch-txt-soft)" }}>
                              Replying to {hasReply.sender === "user" ? "yourself" : getUserDisplayName(selectedUser)}
                            </div>
                          )}

                          {isImage ? (
                            <img
                              src={message.text}
                              alt="Shared"
                              className="max-w-[220px] rounded-xl cursor-pointer"
                              onClick={() => setViewingImage(message.text)}
                            />
                          ) : isSticker ? (
                            <span className="text-5xl block">{message.text}</span>
                          ) : isVoice ? (
                            <div className="flex items-center gap-3 min-w-[180px]">
                              <button onClick={() => playVoiceMessage(message)}
                                className="p-2 rounded-full"
                                style={{
                                  background: isUser ? "rgba(0,0,0,0.15)" : "var(--ch-primary-soft)",
                                  color: isUser ? "#fff" : "var(--ch-primary)",
                                }}>
                                {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                              </button>
                              <div className="flex-1">
                                <div className="h-1 rounded-full overflow-hidden"
                                  style={{ background: isUser ? "rgba(0,0,0,0.15)" : "var(--ch-line)" }}>
                                  <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: isPlaying ? "100%" : "0%" }}
                                    transition={{ duration: isPlaying ? message.duration || 3 : 0 }}
                                    className="h-full rounded-full"
                                    style={{ background: isUser ? "#fff" : "var(--ch-primary)" }}
                                  />
                                </div>
                                <span className="font-ticket-body text-[10px] font-bold mt-1 block"
                                  style={{ color: isUser ? "rgba(255,255,255,0.75)" : "var(--ch-txt-soft)" }}>
                                  {formatDuration(message.duration || 0)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="font-ticket-body text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">
                              {message.text}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedUser.isApproved && !isUserBlocked(selectedUser.id) && (
                <div className="px-4 py-3 flex-shrink-0 relative"
                  style={{ borderTop: "1px solid var(--ch-line)", background: "var(--ch-middle)" }}>

                  {/* ⭐ Sticker picker */}
                  <AnimatePresence>
                    {showStickerPicker && (
                      <StickerPicker
                        onSelect={sendSticker}
                        onClose={() => setShowStickerPicker(false)}
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2">
                    {/* ⭐ Sticker button */}
                    <button
                      onClick={() => setShowStickerPicker((s) => !s)}
                      className="p-2.5 rounded-full flex-shrink-0 transition-colors"
                      style={{
                        background: showStickerPicker ? "var(--ch-primary-soft)" : "var(--ch-panel-2)",
                        color: showStickerPicker ? "var(--ch-primary)" : "var(--ch-txt-soft)",
                      }}
                      title="Stickers & emojis"
                    >
                      <FaSmile size={15} />
                    </button>

                    {/* ⭐ Image button — proper image icon */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--ch-panel-2)", color: "var(--ch-txt-soft)" }}
                      title="Send image"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? <FaSpinner className="animate-spin" size={14} /> : <FaImage size={15} />}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        className="font-ticket-body w-full px-5 py-3 rounded-full text-sm outline-none"
                        style={{ background: "var(--ch-panel-2)", color: "var(--ch-txt)", border: "1px solid transparent" }}
                      />
                    </div>

                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className="p-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: isRecording ? "var(--ch-danger)" : "var(--ch-panel-2)",
                        color: isRecording ? "#fff" : "var(--ch-txt-soft)",
                      }}>
                      {isRecording ? <FaStop size={12} /> : <FaMicrophone size={14} />}
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={sendMessage}
                      disabled={!inputText.trim()}
                      className="p-3 rounded-full flex-shrink-0 text-white disabled:opacity-40"
                      style={{ background: "var(--ch-primary)" }}>
                      <FaPaperPlane size={14} />
                    </motion.button>
                  </div>

                  {isRecording && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--ch-danger)" }} />
                      <span className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--ch-danger)" }}>
                        Recording… {formatDuration(recordingDuration)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isUserBlocked(selectedUser.id) && (
                <div className="p-3 text-center" style={{ background: "var(--ch-danger-soft)" }}>
                  <p className="font-ticket-body text-sm font-bold flex items-center justify-center gap-2"
                    style={{ color: "var(--ch-danger)" }}>
                    <FaBan /> You have blocked this user
                    <button onClick={() => unblockUser(selectedUser.id)}
                      className="text-xs text-white px-3 py-1 rounded-full"
                      style={{ background: "var(--ch-primary)" }}>
                      Unblock
                    </button>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--ch-primary-soft)" }}>
                <FaComment size={32} style={{ color: "var(--ch-primary)" }} />
              </div>
              <h2 className="font-ticket-display text-xl font-bold mb-2" style={{ color: "var(--ch-txt)" }}>
                Select a conversation
              </h2>
              <p className="font-ticket-body text-sm max-w-xs" style={{ color: "var(--ch-txt-soft)" }}>
                Choose a contact from the list to start chatting
              </p>
            </div>
          )}
        </main>

        {/* ═══════════════════════════════════════
            RIGHT: CONTACT DETAILS
            ═══════════════════════════════════════ */}
        <aside className="hidden xl:flex flex-col w-[300px] flex-shrink-0 ch-right overflow-y-auto ch-scroll">
          {selectedUser ? (
            <>
              <div className="p-6 flex flex-col items-center text-center relative">
                <button className="absolute top-4 right-4 p-2 rounded-full"
                  style={{ color: "var(--ch-txt-soft)" }}>
                  <FaEllipsisH size={14} />
                </button>

                <AvatarWithFallback
                  seed={selectedUser.id}
                  name={getUserDisplayName(selectedUser)}
                  avatarUrl={selectedUser.avatar_url}
                  size="h-24 w-24"
                  textSize="text-3xl font-bold"
                  className="rounded-full"
                />
                <h3 className="font-ticket-display text-[20px] font-bold mt-4" style={{ color: "var(--ch-txt)" }}>
                  {getUserDisplayName(selectedUser)}
                </h3>
                <p className="font-ticket-body text-[12px]" style={{ color: "var(--ch-txt-soft)" }}>
                  {selectedUser.online ? "Online" : "Offline"}
                </p>

                <div className="flex items-center gap-2 mt-5 w-full">
                  <button
                    onClick={() => startCall(selectedUser.id)}
                    disabled={!selectedUser.isApproved}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl font-ticket-body text-[12px] font-bold disabled:opacity-40"
                    style={{ background: "var(--ch-panel-2)", color: "var(--ch-txt)", border: "1px solid var(--ch-line)" }}>
                    <FaPhone size={11} /> Voice chat
                  </button>
                  <button
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl font-ticket-body text-[12px] font-bold opacity-40"
                    style={{ background: "var(--ch-panel-2)", color: "var(--ch-txt)", border: "1px solid var(--ch-line)" }}>
                    <FaVideoCall size={11} /> Video chat
                  </button>
                </div>
              </div>

              {/* Actions list */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowThemeModal(true)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors hover:bg-[var(--ch-primary-soft)]"
                >
                  <span className="font-ticket-body text-[13px] font-semibold" style={{ color: "var(--ch-txt)" }}>
                    Change Color
                  </span>
                  <FaPalette size={13} style={{ color: "var(--ch-txt-faint)" }} />
                </button>
                {[
                  { icon: FaSearch, label: "Search in Conversation" },
                  { icon: FaSmile, label: "Change Emoji" },
                  { icon: FaLink, label: "Links" },
                ].map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <button key={i}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors hover:bg-[var(--ch-primary-soft)]">
                      <span className="font-ticket-body text-[13px] font-semibold" style={{ color: "var(--ch-txt)" }}>
                        {row.label}
                      </span>
                      <Icon size={13} style={{ color: "var(--ch-txt-faint)" }} />
                    </button>
                  );
                })}
              </div>

              {/* Shared media */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaImage size={11} style={{ color: "var(--ch-txt-soft)" }} />
                  <span className="font-ticket-body text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--ch-txt-soft)" }}>
                    Shared photo
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {messages.filter((m) => m.type === "image").slice(-12).map((m, i) => (
                    <button
                      key={m.id || i}
                      onClick={() => setViewingImage(m.text)}
                      className="aspect-square rounded-lg overflow-hidden"
                      style={{ background: "var(--ch-panel-2)" }}
                    >
                      <img src={m.text} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {messages.filter((m) => m.type === "image").length === 0 && (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg"
                        style={{ background: "var(--ch-panel-2)" }} />
                    ))
                  )}
                </div>
                {messages.filter((m) => m.type === "image").length > 0 && (
                  <button className="w-full text-center mt-3 font-ticket-body text-[12px] font-bold"
                    style={{ color: "var(--ch-mint)" }}>
                    View More
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <p className="font-ticket-body text-[12px]" style={{ color: "var(--ch-txt-faint)" }}>
                Select a chat to see details
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ChatPage;