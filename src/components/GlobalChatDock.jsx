// src/components/GlobalChatDock.jsx
// — Facebook-Messenger-style floating chat dock
//   + quick reply suggestions for buyers
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCommentDots, FaTimes, FaExpand, FaCompress, FaPaperPlane,
  FaChevronLeft, FaCircle, FaTrash, FaCheck, FaTag,
  FaExternalLinkAlt, FaMapMarkerAlt,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   HOOK — mobile
   ═══════════════════════════════════════════════════════════════ */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

/* ═══════════════════════════════════════════════════════════════
   ⭐ QUICK REPLY SUGGESTIONS (buyer's perspective)
   ═══════════════════════════════════════════════════════════════ */
const BUYER_SUGGESTIONS = [
  { id: "interested",  label: "I'm interested",           icon: "" },
  { id: "available",   label: "Is it still available?",   icon: "✅" },
  { id: "price",       label: "Is price negotiable?",     icon: "" },
  { id: "location",    label: "Where are you located?",   icon: "" },
  { id: "condition",   label: "Any damage or issues?",    icon: "" },
  { id: "delivery",    label: "Do you deliver?",          icon: "" },
  { id: "meetup",      label: "Can we meet to see it?",   icon: "🤝" },
  { id: "final_price", label: "What's your final price?", icon: "" },
];

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
    .gcd-body { font-family: 'Manrope', system-ui, sans-serif; }

    .theme-dark {
      --gcd-bg: #16161F;
      --gcd-bg-2: #1C1C28;
      --gcd-glass: rgba(22,22,31,0.85);
      --gcd-line: rgba(255,255,255,0.08);
      --gcd-txt: #FFFFFF;
      --gcd-txt-soft: rgba(255,255,255,0.62);
      --gcd-txt-faint: rgba(255,255,255,0.4);
      --gcd-primary: #fc9d03;
      --gcd-primary-2: #f59e0b;
      --gcd-primary-soft: rgba(252,157,3,0.14);
      --gcd-primary-glow: rgba(252,157,3,0.45);
      --gcd-bubble-me: linear-gradient(135deg, #fc9d03 0%, #d76a20 100%);
      --gcd-bubble-them: #23232F;
      --gcd-online: #22c55e;
      --gcd-shadow: 0 24px 60px -20px rgba(0,0,0,0.65);
      --gcd-chip-bg: rgba(255,255,255,0.05);
      --gcd-chip-border: rgba(255,255,255,0.1);
    }
    .theme-light {
      --gcd-bg: #FFFFFF;
      --gcd-bg-2: #FAF8F3;
      --gcd-glass: rgba(255,255,255,0.85);
      --gcd-line: rgba(20,20,30,0.06);
      --gcd-txt: #1A1A22;
      --gcd-txt-soft: rgba(26,26,34,0.6);
      --gcd-txt-faint: rgba(26,26,34,0.4);
      --gcd-primary: #c8631f;
      --gcd-primary-2: #eb7d34;
      --gcd-primary-soft: rgba(200,99,31,0.1);
      --gcd-primary-glow: rgba(200,99,31,0.35);
      --gcd-bubble-me: linear-gradient(135deg, #c8631f 0%, #a04f16 100%);
      --gcd-bubble-them: #F5F2EC;
      --gcd-online: #16a34a;
      --gcd-shadow: 0 24px 60px -20px rgba(0,0,0,0.2);
      --gcd-chip-bg: rgba(20,20,30,0.04);
      --gcd-chip-border: rgba(20,20,30,0.08);
    }

    .gcd-scroll::-webkit-scrollbar { width: 6px; }
    .gcd-scroll::-webkit-scrollbar-track { background: transparent; }
    .gcd-scroll::-webkit-scrollbar-thumb {
      background: var(--gcd-line);
      border-radius: 6px;
    }
    .gcd-chips::-webkit-scrollbar { display: none; }
    .gcd-chips { scrollbar-width: none; -ms-overflow-style: none; }

    .gcd-input {
      background: var(--gcd-bg-2);
      color: var(--gcd-txt);
      border: 1px solid transparent;
      transition: border-color 0.2s ease;
    }
    .gcd-input:focus { border-color: var(--gcd-primary); outline: none; }
    .gcd-input::placeholder { color: var(--gcd-txt-faint); }

    .gcd-bubble-them {
      background: var(--gcd-bubble-them);
      color: var(--gcd-txt);
      border: 1px solid var(--gcd-line);
      border-radius: 16px 16px 16px 4px;
    }
    .gcd-bubble-me {
      background: var(--gcd-bubble-me);
      color: #fff;
      border-radius: 16px 16px 4px 16px;
    }

    @keyframes gcd-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50%      { transform: scale(1.6); opacity: 0; }
    }
    .gcd-ping {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid var(--gcd-primary);
      animation: gcd-pulse 1.6s ease-out infinite;
      pointer-events: none;
    }

    .gcd-icon-btn {
      height: 36px; width: 36px;
      border-radius: 999px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s ease, color 0.2s ease;
      color: var(--gcd-txt-soft);
      flex-shrink: 0;
    }
    .gcd-icon-btn:hover { background: var(--gcd-primary-soft); color: var(--gcd-primary); }
    .gcd-icon-btn.danger:hover { background: rgba(239,68,68,0.14); color: #ef4444; }
    .gcd-icon-btn.confirm { background: rgba(239,68,68,0.16); color: #ef4444; }
    .gcd-icon-btn.cancel  { background: rgba(34,197,94,0.16);  color: #22c55e; }

    .gcd-listing {
      transition: background 0.18s ease, transform 0.18s ease;
    }
    .gcd-listing:hover { background: var(--gcd-primary-soft) !important; }
    .gcd-listing:active { transform: scale(0.995); }

    /* ⭐ Suggestion chip */
    .gcd-suggestion {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 999px;
      background: var(--gcd-chip-bg);
      border: 1px solid var(--gcd-chip-border);
      color: var(--gcd-txt);
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.18s ease;
      flex-shrink: 0;
    }
    .gcd-suggestion:hover {
      background: var(--gcd-primary-soft);
      border-color: var(--gcd-primary);
      color: var(--gcd-primary);
      transform: translateY(-1px);
    }
    .gcd-suggestion:active {
      transform: scale(0.96);
    }
    .gcd-suggestion-icon {
      font-size: 12px;
      line-height: 1;
    }

    @media (max-width: 767px) {
      .gcd-icon-btn { height: 32px; width: 32px; }
      .gcd-bubble-them, .gcd-bubble-me { max-width: 85% !important; }
      .gcd-suggestion { padding: 6px 10px; font-size: 11.5px; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const getInitials = (name) => {
  if (!name) return "U";
  const p = String(name).trim().split(/\s+/);
  return p.length === 1
    ? p[0][0]?.toUpperCase() || "U"
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const categoryPath = (rawCat) => {
  const cat = String(rawCat || "").toLowerCase().trim();
  switch (cat) {
    case "vehicles":
    case "vehicle":
    case "cars":
    case "car":
      return "vehicle";
    case "bikes":
    case "bike":
    case "motorcycles":
    case "motorcycle":
      return "bike";
    case "mobiles":
    case "mobile":
    case "phones":
    case "phone":
      return "mobile";
    case "property":
    case "properties":
    case "real estate":
    case "realestate":
      return "property";
    case "electronics":
    case "electronic":
      return "electronic";
    case "toys":
    case "toy":
      return "toy";
    default:
      return "listing";
  }
};

const listingUrl = (listing) => {
  if (!listing?.id) return null;
  const seg = categoryPath(listing.category);
  return `/${seg}/${listing.id}`;
};

const playBellSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain1.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.18);
    gain2.gain.setValueAtTime(0.0001, ctx.currentTime + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.09);
    osc2.stop(ctx.currentTime + 0.5);

    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch (err) {
    console.warn("Bell sound blocked:", err?.message);
  }
};

const LS_LISTING_ID = "gcd_last_listing_id";
const LS_PEER_ID = "gcd_last_peer_id";

const readLS = (key) => {
  try { return localStorage.getItem(key) || null; } catch { return null; }
};
const writeLS = (key, val) => {
  try {
    if (val) localStorage.setItem(key, val);
    else localStorage.removeItem(key);
  } catch {}
};

const normalizeListing = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || "Untitled item",
    price: row.price ?? null,
    cover_image:
      row.cover_image ||
      (Array.isArray(row.images) && row.images[0]) ||
      null,
    category: row.category || null,
    city: row.city || null,
    area: row.area || null,
    condition: row.condition || null,
  };
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const GlobalChatDock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen]       = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peer, setPeer]           = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  /* 🖼️ Listing state */
  const [listing, setListing] = useState(null);
  const [listingIdFromEvent, setListingIdFromEvent] = useState(null);
  const [listingIdFromLS, setListingIdFromLS] = useState(() => readLS(LS_LISTING_ID));
  const [listingIdFromMessage, setListingIdFromMessage] = useState(null);

  /* ⭐ Peer id persisted */
  const [peerIdFromLS, setPeerIdFromLS] = useState(() => readLS(LS_PEER_ID));

  /* 🗑️ Clear-chat UI */
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing]         = useState(false);

  /* ⭐ Buyer-side suggestions */
  const isBuyer = !!listing; /* if we know the listing, user is likely the buyer */
  const [showSuggestions, setShowSuggestions] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const confirmTimerRef = useRef(null);
  const lastBellRef = useRef(0);

  /* ⭐ Listing source chain */
  const listingIdFromUrl = searchParams.get("listing");
  const listingId =
    listingIdFromUrl ||
    listingIdFromEvent ||
    listingIdFromMessage ||
    listingIdFromLS;

  /* Audio unlock */
  const audioUnlockedRef = useRef(false);
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          ctx.resume().then(() => ctx.close()).catch(() => {});
        }
        audioUnlockedRef.current = true;
      } catch {}
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const hideDock =
    location.pathname.startsWith("/marketplace-chat") ||
    location.pathname.startsWith("/chat") ||
    location.pathname.startsWith("/study-group-chat") ||
    location.pathname.startsWith("/signin") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/admin");

  /* ── Persist listingId from URL ── */
  useEffect(() => {
    if (listingIdFromUrl) {
      writeLS(LS_LISTING_ID, listingIdFromUrl);
      setListingIdFromLS(listingIdFromUrl);
    }
  }, [listingIdFromUrl]);

  /* ── 🖼️ Fetch the listing ── */
  useEffect(() => {
    let cancelled = false;

    const fetchListing = async () => {
      if (!listingId) {
        setListing(null);
        return;
      }
      try {
        const { data } = await supabase
          .from("listings")
          .select("id, title, price, cover_image, images, category, city, area, condition")
          .eq("id", listingId)
          .maybeSingle();
        if (!cancelled) setListing(normalizeListing(data));
      } catch (err) {
        console.error("Dock listing fetch error:", err);
        if (!cancelled) setListing(null);
      }
    };

    fetchListing();
    return () => { cancelled = true; };
  }, [listingId]);

  /* ── ⭐ Show suggestions when the buyer opens the chat with a listing ── */
  useEffect(() => {
    if (isOpen && isBuyer && messages.length === 0 && !loadingMsgs) {
      setShowSuggestions(true);
    } else if (!isOpen) {
      setShowSuggestions(false);
    }
  }, [isOpen, isBuyer, messages.length, loadingMsgs]);

  /* ── ⭐ SELLER: derive listing from messages ── */
  useEffect(() => {
    if (!peer?.id || !user?.id) return;
    if (listingId) return;

    let cancelled = false;

    const deriveFromMessages = async () => {
      try {
        const { data } = await supabase
          .from("messages")
          .select("listing_id, created_at")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${peer.id}),and(sender_id.eq.${peer.id},receiver_id.eq.${user.id})`
          )
          .not("listing_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && data?.listing_id) {
          setListingIdFromMessage(data.listing_id);
          setListingIdFromLS(data.listing_id);
          writeLS(LS_LISTING_ID, data.listing_id);
        }
      } catch (err) {
        console.debug("Listing derivation skipped:", err?.message);
      }
    };

    deriveFromMessages();
    return () => { cancelled = true; };
  }, [peer?.id, user?.id, listingId]);

  /* ── Fetch full conversation ── */
  const loadConversation = useCallback(async (peerId) => {
    if (!user?.id || !peerId) return;

    writeLS(LS_PEER_ID, peerId);
    setPeerIdFromLS(peerId);

    setLoadingMsgs(true);
    try {
      const { data: profile } = await supabase
        .from("user_settings")
        .select("user_id, full_name, avatar, email")
        .eq("user_id", peerId)
        .maybeSingle();

      setPeer({
        id: peerId,
        name:
          profile?.full_name ||
          (profile?.email ? profile.email.split("@")[0] : "Seller"),
        avatar: profile?.avatar || null,
      });

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
        .limit(200);

      const formatted = (data || []).map((m) => ({
        id: m.id,
        fromMe: m.sender_id === user.id,
        text: m.content,
        type: m.message_type || "text",
        createdAt: m.created_at,
        read: m.read,
        listing_id: m.listing_id || null,
      }));
      setMessages(formatted);

      if (!listingId) {
        const lastWithListing = [...(data || [])]
          .reverse()
          .find((m) => m.listing_id);
        if (lastWithListing?.listing_id) {
          setListingIdFromMessage(lastWithListing.listing_id);
          setListingIdFromLS(lastWithListing.listing_id);
          writeLS(LS_LISTING_ID, lastWithListing.listing_id);
        }
      }

      const unreadIds = (data || [])
        .filter((m) => m.receiver_id === user.id && !m.read)
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ read: true }).in("id", unreadIds);
      }
      setUnread(0);
    } catch (err) {
      console.error("loadConversation error:", err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [user?.id, listingId]);

  /* ⭐ Auto-restore last conversation */
  useEffect(() => {
    if (!user?.id) return;
    if (peer?.id) return;
    if (!peerIdFromLS) return;
    loadConversation(peerIdFromLS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, peerIdFromLS]);

  /* ⭐ Unread count */
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("read", false);

        if (error) throw error;
        if (!cancelled) setUnread(count || 0);
      } catch (err) {
        console.error("Unread count fetch failed:", err);
      }
    };

    fetchUnreadCount();
    return () => { cancelled = true; };
  }, [user?.id]);

  /* ── 🔔 AI event ── */
  useEffect(() => {
    const onOpenFromAI = (e) => {
      const prefill = e?.detail?.prefill || "";
      if (peer?.id) {
        if (prefill) setInput(prefill);
        setIsOpen(true);
        return;
      }
      const params = new URLSearchParams();
      if (prefill) params.set("text", prefill);
      navigate(
        `/marketplace-chat${params.toString() ? `?${params.toString()}` : ""}`
      );
    };
    window.addEventListener("ai-open-chat-dock", onOpenFromAI);
    return () => window.removeEventListener("ai-open-chat-dock", onOpenFromAI);
  }, [peer?.id, navigate]);

  /* ── 🔔 open-chat-dock ── */
  useEffect(() => {
    const onOpenDock = (e) => {
      const peerId      = e?.detail?.peerId;
      const prefill     = e?.detail?.prefill || "";
      const listingIdEv = e?.detail?.listingId || null;

      if (!peerId) return;

      if (listingIdEv) {
        setListingIdFromEvent(listingIdEv);
        setListingIdFromLS(listingIdEv);
        writeLS(LS_LISTING_ID, listingIdEv);
      }

      if (peer?.id === peerId) {
        if (prefill) setInput(prefill);
        setIsOpen(true);
        return;
      }

      loadConversation(peerId).then(() => {
        if (prefill) setInput(prefill);
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 300);
      });
    };

    window.addEventListener("open-chat-dock", onOpenDock);
    return () => window.removeEventListener("open-chat-dock", onOpenDock);
  }, [peer?.id, loadConversation]);

  /* ── Realtime listener ── */
  useEffect(() => {
    if (!user?.id) return;

    const ch = supabase
      .channel(`gcd-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const m = payload.new;
          if (m.sender_id === user.id) return;

          const isOpenPeerMessage = peer?.id === m.sender_id && isOpen;
          const now = Date.now();

          if (!isOpenPeerMessage && now - lastBellRef.current > 1200) {
            playBellSound();
            lastBellRef.current = now;
          }

          if (!listingId && m.listing_id) {
            setListingIdFromMessage(m.listing_id);
            setListingIdFromLS(m.listing_id);
            writeLS(LS_LISTING_ID, m.listing_id);
          }

          if (peer?.id === m.sender_id) {
            setMessages((prev) => {
              if (prev.some((x) => x.id === m.id)) return prev;
              return [
                ...prev,
                {
                  id: m.id,
                  fromMe: false,
                  text: m.content,
                  type: m.message_type || "text",
                  createdAt: m.created_at,
                  read: false,
                  listing_id: m.listing_id || null,
                },
              ];
            });
            await supabase.from("messages").update({ read: true }).eq("id", m.id);
            return;
          }

          setUnread((u) => u + 1);

          if (!peer?.id) {
            await loadConversation(m.sender_id);
            setIsOpen(true);
          }
        }
      )
      .subscribe();

    return () => { ch.unsubscribe(); };
  }, [user?.id, peer?.id, isOpen, loadConversation, listingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loadingMsgs]);

  useEffect(() => {
    if (isOpen && peer) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen, peer]);

  useEffect(() => {
    setConfirmClear(false);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, [peer?.id, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setIsFullscreen(false);
    setConfirmClear(false);
  };

  const handleOpenFullPage = () => {
    if (!peer?.id) return;
    const params = new URLSearchParams();
    params.set("user", peer.id);
    if (listingId) params.set("listing", listingId);
    setIsOpen(false);
    setIsFullscreen(false);
    navigate(`/marketplace-chat?${params.toString()}`);
  };

  const handleOpenItemDetail = () => {
    const url = listingUrl(listing);
    if (!url) return;
    navigate(url);
  };

  const resetDock = useCallback(() => {
    setIsOpen(false);
    setIsFullscreen(false);
    setPeer(null);
    setMessages([]);
    setInput("");
    setUnread(0);
    setConfirmClear(false);
    setListingIdFromEvent(null);
    setListing(null);
    setListingIdFromLS(null);
    setListingIdFromMessage(null);
    setPeerIdFromLS(null);
    setShowSuggestions(false);
    writeLS(LS_LISTING_ID, null);
    writeLS(LS_PEER_ID, null);
  }, []);

  useEffect(() => {
    if (!user) resetDock();
  }, [user, resetDock]);

  const clearChat = async () => {
    if (!user?.id || !peer?.id || clearing) return;
    setClearing(true);
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${peer.id}),and(sender_id.eq.${peer.id},receiver_id.eq.${user.id})`
        );
      if (error) throw error;
      setMessages([]);
      setConfirmClear(false);
    } catch (err) {
      console.error("clearChat error:", err);
    } finally {
      setClearing(false);
    }
  };

  const handleClearClick = () => {
    if (confirmClear) return;
    setConfirmClear(true);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 4000);
  };

  /* ⭐ Core send (used by both typed + suggested) */
  const sendText = useCallback(async (textToSend) => {
    const text = String(textToSend || "").trim();
    if (!text || !peer || sending) return;

    setSending(true);
    setShowSuggestions(false);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        fromMe: true,
        text,
        type: "text",
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
    setInput("");

    try {
      const insertPayload = {
        sender_id: user.id,
        receiver_id: peer.id,
        content: text,
        message_type: "text",
        read: false,
      };
      if (listingId) insertPayload.listing_id = listingId;

      const { data, error } = await supabase
        .from("messages")
        .insert([insertPayload])
        .select()
        .single();
      if (error) throw error;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, id: data.id, pending: false, createdAt: data.created_at } : m
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [user?.id, peer, sending, listingId]);

  const sendMessage = () => sendText(input);

  /* ⭐ Buyer suggestion tap — sends directly */
  const handleSuggestion = (label) => {
    if (!peer) return;
    sendText(label);
  };

  if (hideDock || !user) return null;

  const headerImage =
    listing?.cover_image || (listing ? null : peer?.avatar) || null;

  const headerTitle =
    listing?.title || peer?.name || "Messages";

  return (
    <>
      <Styles />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dock"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="gcd-body fixed z-[9998] flex flex-col overflow-hidden"
            style={{
              bottom: isFullscreen ? 0 : (isMobile ? 148 : 96),
              right: isFullscreen ? 0 : (isMobile ? 12 : 24),
              left: isFullscreen ? 0 : (isMobile ? 12 : "auto"),
              width: isFullscreen
                ? "100vw"
                : (isMobile ? "calc(100vw - 24px)" : "min(400px, calc(100vw - 32px))"),
              height: isFullscreen
                ? "100vh"
                : (isMobile ? "min(500px, calc(100vh - 200px))" : "min(560px, calc(100vh - 140px))"),
              borderRadius: isFullscreen ? 0 : 20,
              background: "var(--gcd-bg)",
              border: isFullscreen ? "none" : "1px solid var(--gcd-line)",
              boxShadow: isFullscreen ? "none" : "var(--gcd-shadow)",
              color: "var(--gcd-txt)",
            }}
          >
            {/* HEADER */}
            <div
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5"
              style={{
                borderBottom: "1px solid var(--gcd-line)",
                background: "var(--gcd-glass)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <button onClick={handleClose} className="gcd-icon-btn" title="Close">
                <FaChevronLeft size={13} />
              </button>

              <div className="relative flex-shrink-0" style={{ width: 38, height: 38 }}>
                <div
                  className="w-full h-full overflow-hidden flex items-center justify-center text-white font-bold"
                  style={{
                    borderRadius: listing ? 10 : "50%",
                    background: headerImage
                      ? "#000"
                      : "linear-gradient(135deg, var(--gcd-primary), var(--gcd-primary-2))",
                    fontSize: 14,
                  }}
                >
                  {headerImage ? (
                    <img
                      src={headerImage}
                      alt={headerTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    getInitials(headerTitle)
                  )}
                </div>
                {peer && (
                  <span
                    className="absolute bottom-0 right-0 rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      background: "var(--gcd-online)",
                      border: "2px solid var(--gcd-bg)",
                    }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-bold truncate"
                  style={{ color: "var(--gcd-txt)" }}
                  title={headerTitle}
                >
                  {headerTitle}
                </p>
                {peer ? (
                  <p
                    className="text-[10.5px] flex items-center gap-1 truncate"
                    style={{ color: "var(--gcd-online)" }}
                  >
                    <FaCircle size={5} />
                    <span style={{ color: "var(--gcd-txt-soft)" }}>
                      {peer.name}
                    </span>
                    <span style={{ color: "var(--gcd-online)" }}>
                      · Active now
                    </span>
                  </p>
                ) : (
                  <p className="text-[10.5px]" style={{ color: "var(--gcd-txt-soft)" }}>
                    No conversation selected
                  </p>
                )}
              </div>

              {peer && (
                <button
                  onClick={handleOpenFullPage}
                  className="gcd-icon-btn"
                  title="Open in full view"
                >
                  <FaExternalLinkAlt size={12} />
                </button>
              )}

              {!confirmClear ? (
                <button
                  onClick={handleClearClick}
                  disabled={clearing || !peer || messages.length === 0}
                  className="gcd-icon-btn danger"
                  title={peer ? "Clear chat" : "No conversation to clear"}
                  style={{
                    opacity: !peer || messages.length === 0 ? 0.35 : 1,
                    cursor: !peer || messages.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <FaTrash size={12} />
                </button>
              ) : (
                <>
                  <button
                    onClick={clearChat}
                    disabled={clearing}
                    className="gcd-icon-btn confirm"
                    title="Confirm delete"
                  >
                    {clearing ? <FaCircle size={12} /> : <FaCheck size={13} />}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    disabled={clearing}
                    className="gcd-icon-btn cancel"
                    title="Cancel"
                  >
                    <FaTimes size={13} />
                  </button>
                </>
              )}

              <button
                onClick={() => setIsFullscreen((f) => !f)}
                className="gcd-icon-btn"
                title={isFullscreen ? "Exit full screen" : "Expand"}
              >
                {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
              </button>

              <button onClick={handleClose} className="gcd-icon-btn" title="Close">
                <FaTimes size={13} />
              </button>
            </div>

            {/* LISTING STRIP */}
            {listing && (
              <button
                onClick={handleOpenItemDetail}
                className="gcd-listing flex-shrink-0 flex items-center gap-2.5 px-3 py-2 text-left w-full"
                style={{
                  borderBottom: "1px solid var(--gcd-line)",
                  background: "var(--gcd-bg-2)",
                  cursor: "pointer",
                }}
                title="Open item detail"
              >
                <div
                  className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{
                    width: 42,
                    height: 42,
                    background: "var(--gcd-primary-soft)",
                    color: "var(--gcd-primary)",
                    border: "1px solid var(--gcd-line)",
                  }}
                >
                  {listing.cover_image ? (
                    <img
                      src={listing.cover_image}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <FaTag size={13} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1"
                    style={{ color: "var(--gcd-primary)" }}
                  >
                    <FaTag size={7} /> Chatting about
                  </p>
                  <p
                    className="text-[12px] font-bold truncate mt-0.5"
                    style={{ color: "var(--gcd-txt)" }}
                  >
                    {listing.title}
                  </p>
                  {listing.price != null && (
                    <p
                      className="text-[11px] font-extrabold mt-0.5"
                      style={{ color: "var(--gcd-primary)" }}
                    >
                      Rs {Number(listing.price).toLocaleString("en-US")}
                    </p>
                  )}
                </div>

                <span
                  className="text-[10px] font-bold flex-shrink-0"
                  style={{ color: "var(--gcd-primary)" }}
                >
                  Open →
                </span>
              </button>
            )}

            {/* MESSAGES */}
            <div
              className="flex-1 gcd-scroll overflow-y-auto px-3 py-4"
              style={{ background: "var(--gcd-bg-2)" }}
            >
              {!peer ? (
                <div className="py-12 text-center">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{ background: "var(--gcd-primary-soft)" }}
                  >
                    <FaCommentDots size={22} style={{ color: "var(--gcd-primary)" }} />
                  </div>
                  <p className="text-[13px] font-bold mb-1.5" style={{ color: "var(--gcd-txt)" }}>
                    No conversation selected
                  </p>
                  <p className="text-[11.5px] leading-relaxed max-w-[240px] mx-auto" style={{ color: "var(--gcd-txt-soft)" }}>
                    Open a chat from a listing, or click a seller's <b>Chat</b> button to start.
                  </p>
                </div>
              ) : loadingMsgs ? (
                <div className="py-10 text-center text-[12px]" style={{ color: "var(--gcd-txt-faint)" }}>
                  Loading…
                </div>
              ) : messages.length === 0 ? (
                <div className="py-10 text-center">
                  <div
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{ background: "var(--gcd-primary-soft)" }}
                  >
                    <FaCommentDots size={18} style={{ color: "var(--gcd-primary)" }} />
                  </div>
                  <p className="text-[12.5px] font-bold mb-1" style={{ color: "var(--gcd-txt)" }}>
                    Say hi to {peer.name.split(" ")[0]}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--gcd-txt-soft)" }}>
                    Start the conversation below
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3.5 py-2 ${
                          m.fromMe ? "gcd-bubble-me" : "gcd-bubble-them"
                        }`}
                      >
                        {m.type === "image" ? (
                          <img
                            src={m.text}
                            alt="Shared"
                            className="rounded-lg max-w-[200px] max-h-[240px] object-cover"
                          />
                        ) : (
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                            {m.text}
                          </p>
                        )}
                        <div
                          className={`mt-0.5 text-[9.5px] ${m.fromMe ? "text-right" : "text-left"}`}
                          style={{ opacity: 0.7 }}
                        >
                          {fmtTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ⭐ BUYER SUGGESTIONS STRIP */}
            <AnimatePresence>
              {showSuggestions && peer && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 overflow-hidden"
                  style={{
                    borderTop: "1px solid var(--gcd-line)",
                    background: "var(--gcd-bg-2)",
                  }}
                >
                  <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5">
                    <FaMapMarkerAlt size={9} style={{ color: "var(--gcd-primary)" }} />
                    <span
                      className="text-[9.5px] font-extrabold uppercase tracking-widest"
                      style={{ color: "var(--gcd-txt-soft)" }}
                    >
                      Quick replies
                    </span>
                  </div>
                  <div className="gcd-chips px-3 pb-2.5 flex gap-2 overflow-x-auto">
                    {BUYER_SUGGESTIONS.map((s) => (
                      <motion.button
                        key={s.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestion(s.label)}
                        disabled={sending}
                        className="gcd-suggestion"
                        title={`Send: ${s.label}`}
                      >
                        <span className="gcd-suggestion-icon">{s.icon}</span>
                        <span>{s.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* COMPOSER */}
            <div
              className="flex-shrink-0 flex items-end gap-2 px-3 py-2.5"
              style={{
                borderTop: "1px solid var(--gcd-line)",
                background: "var(--gcd-glass)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (peer) sendMessage();
                  }
                }}
                placeholder={peer ? "Write a message…" : "Select a conversation first"}
                rows={1}
                disabled={!peer}
                className="gcd-input flex-1 px-3.5 py-2.5 rounded-2xl text-[13px] resize-none"
                style={{
                  maxHeight: 100,
                  opacity: peer ? 1 : 0.55,
                  cursor: peer ? "text" : "not-allowed",
                }}
              />
              <motion.button
                whileTap={peer ? { scale: 0.92 } : {}}
                onClick={sendMessage}
                disabled={!peer || !input.trim() || sending}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, var(--gcd-primary), var(--gcd-primary-2))",
                  boxShadow: "0 8px 20px -8px var(--gcd-primary-glow)",
                }}
                title={peer ? "Send" : "Select a conversation first"}
              >
                <FaPaperPlane size={13} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOGGLE */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={async () => {
            if (peer?.id) {
              setIsOpen(true);
              return;
            }

            try {
              const { data } = await supabase
                .from("messages")
                .select("sender_id, receiver_id, created_at")
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (data) {
                const lastPeerId =
                  data.sender_id === user.id ? data.receiver_id : data.sender_id;
                await loadConversation(lastPeerId);
              }
              setIsOpen(true);
            } catch (err) {
              console.error("Pill open failed:", err);
              setIsOpen(true);
            }
          }}
          className="gcd-body fixed z-[9999]"
          style={{
            bottom: isMobile ? 84 : 24,
            right: isMobile ? 12 : 24,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, var(--gcd-primary), var(--gcd-primary-2))",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 14px 34px -10px var(--gcd-primary-glow), 0 8px 24px -6px rgba(0,0,0,0.35)",
          }}
          aria-label="Open chat"
        >
          {unread > 0 && <span className="gcd-ping" />}
          <FaCommentDots size={22} />

          {unread > 0 && (
            <span
              className="absolute flex items-center justify-center text-white text-[10px] font-extrabold"
              style={{
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                padding: "0 6px",
                borderRadius: 999,
                background: "#EF4444",
                border: "2px solid var(--gcd-bg)",
                boxShadow: "0 4px 10px rgba(239,68,68,0.5)",
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </motion.button>
      )}
    </>
  );
};

export default GlobalChatDock;