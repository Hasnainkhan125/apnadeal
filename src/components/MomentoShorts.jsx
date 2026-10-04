// src/components/MomentoShorts.jsx
// TikTok-style vertical shorts viewer + URL deep-links
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart, FaRegHeart, FaCommentDots, FaShare, FaBookmark,
  FaRegBookmark, FaEllipsisH, FaVolumeUp, FaVolumeMute,
  FaPlay, FaPause, FaTimes, FaEye, FaPaperPlane, FaSpinner,
  FaChevronUp, FaChevronDown, FaTag, FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const formatCount = (n) => {
  if (!n && n !== 0) return "0";
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}K`;
  return `${(n / 1000000).toFixed(2)}M`;
};

const formatPrice = (num) => {
  const n = Number(num) || 0;
  if (n >= 10000000) { const c = n / 10000000; return `Rs.${c % 1 === 0 ? c.toFixed(0) : c.toFixed(2)} Cr`; }
  if (n >= 100000) { const l = n / 100000; return `Rs.${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)} Lac`; }
  return `Rs.${n.toLocaleString("en-US")}`;
};

const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(date).toLocaleDateString();
};

/* ═══════════════════════════════════════════════════════════════
   SINGLE SHORT CARD
   ═══════════════════════════════════════════════════════════════ */
const ShortCard = ({ short, isActive, onLike, isLiked, onOpenComments, savedState, onSave, onShare }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isActive) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleEnded = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) { v.currentTime = 0; v.play().catch(() => {}); }
    else setPlaying(false);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  /* Double-tap = like + heart animation */
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 300) {
          togglePlay();
        }
      }, 300);
    }
  };

  const post = short;
  const seller = post.users || {};
  const sellerName = seller.full_name || seller.name || seller.email?.split("@")[0] || "Seller";
  const linkedListing = post.linkedListing;
  const priceToShow = post.price || linkedListing?.price;

  return (
    <div className="relative w-full h-full flex-shrink-0 flex items-center justify-center overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={post.image_url}
        poster={post.video_thumbnail || undefined}
        className="absolute inset-0 w-full h-full object-contain sm:object-cover bg-black"
        loop={false}
        muted={muted}
        playsInline
        preload={Math.abs(isActive) ? "auto" : "metadata"}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Double-tap area */}
      <div className="absolute inset-0 z-10" onTouchEnd={handleDoubleTap} onDoubleClick={handleDoubleTap} />

      {/* Play/Pause indicator */}
      <AnimatePresence>
        {!playing && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="h-20 w-20 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <FaPlay className="text-white text-2xl ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart pop animation on double-tap like */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <FaHeart className="text-red-500 text-7xl drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 z-20 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-64 z-20 pointer-events-none"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />

      {/* Progress bar */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-30">
          <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
      >
        {muted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}
      </button>

      {/* Play/pause small toggle bottom-left of video */}
      <button
        onClick={togglePlay}
        className="absolute top-4 left-4 z-30 h-10 w-10 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
      >
        {playing ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
      </button>

      {/* Right action rail */}
      <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-5">
        {/* Like */}
        <button onClick={onLike} className="flex flex-col items-center gap-1 group">
          <span className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isLiked ? "bg-red-500" : "bg-black/40"} group-hover:scale-110`}>
            {isLiked ? <FaHeart className="text-white text-lg" /> : <FaRegHeart className="text-white text-lg" />}
          </span>
          <span className="text-white text-[11px] font-bold">{formatCount(post.short_likes || 0)}</span>
        </button>

        {/* Comments */}
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1 group">
          <span className="h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md bg-black/40 group-hover:scale-110 transition">
            <FaCommentDots className="text-white text-lg" />
          </span>
          <span className="text-white text-[11px] font-bold">{formatCount(post.short_comments || 0)}</span>
        </button>

        {/* Save */}
        <button onClick={onSave} className="flex flex-col items-center gap-1 group">
          <span className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${savedState ? "bg-[var(--sp-primary)]" : "bg-black/40"} group-hover:scale-110`}>
            {savedState ? <FaBookmark className="text-white text-base" /> : <FaRegBookmark className="text-white text-base" />}
          </span>
          <span className="text-white text-[11px] font-bold">Save</span>
        </button>

        {/* Share */}
        <button onClick={onShare} className="flex flex-col items-center gap-1 group">
          <span className="h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md bg-black/40 group-hover:scale-110 transition">
            <FaShare className="text-white text-base" />
          </span>
          <span className="text-white text-[11px] font-bold">Share</span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <span className="h-10 w-10 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md">
            <FaEye className="text-white/80 text-xs" />
          </span>
          <span className="text-white/80 text-[10px] font-bold">{formatCount(post.short_views || post.views || 0)}</span>
        </div>
      </div>

      {/* Bottom-left info */}
      <div className="absolute left-4 right-20 bottom-6 z-30 flex flex-col gap-3">
        {/* Seller */}
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 rounded-full overflow-hidden flex items-center justify-center text-white font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))", border: "2px solid #fff" }}>
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{sellerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-black truncate drop-shadow-md">{sellerName}</p>
            <p className="text-white/70 text-[10px] font-semibold drop-shadow-md">
              {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>

        {/* Title / content */}
        {(post.short_title || post.title || post.content) && (
          <p className="text-white text-[13px] font-semibold leading-snug drop-shadow-md line-clamp-2">
            {post.short_title || post.title || post.content}
          </p>
        )}

        {/* Price + location + Buy */}
        {(priceToShow || linkedListing) && (
          <div className="flex items-center gap-2 flex-wrap">
            {priceToShow && (
              <span className="px-3 py-1.5 rounded-full text-white font-black text-sm backdrop-blur-md"
                style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}>
                {formatPrice(priceToShow)}
              </span>
            )}
            {linkedListing?.city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold">
                <FaMapMarkerAlt className="text-[8px]" />
                {linkedListing.city}
              </span>
            )}
            {linkedListing && (
              <Link
                to={`/feed?listing=${linkedListing.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-black hover:scale-105 transition"
              >
                <FaTag className="text-[9px]" />
                View Listing
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMMENTS SHEET
   ═══════════════════════════════════════════════════════════════ */
const CommentsSheet = ({ shortId, onClose, user, myProfile, pushToast }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", shortId)
        .order("created_at", { ascending: true });

      if (!data?.length) { setComments([]); setLoading(false); return; }

      const ids = [...new Set(data.map((c) => c.user_id).filter(Boolean))];
      const { data: users } = await supabase.from("users").select("id, name, full_name, username, email, avatar_url").in("id", ids);
      const { data: settings } = await supabase.from("user_settings").select("user_id, full_name, avatar, avatar_url").in("user_id", ids);

      const usersMap = {}; (users || []).forEach((u) => { usersMap[u.id] = u; });
      const settingsMap = {}; (settings || []).forEach((s) => { settingsMap[s.user_id] = s; });

      setComments(data.map((c) => ({
        ...c,
        users: {
          full_name: settingsMap[c.user_id]?.full_name || usersMap[c.user_id]?.full_name || usersMap[c.user_id]?.name,
          avatar_url: settingsMap[c.user_id]?.avatar || settingsMap[c.user_id]?.avatar_url || usersMap[c.user_id]?.avatar_url,
        },
      })));
    } catch (err) {
      console.error("fetchComments failed:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (shortId) fetchComments(); }, [shortId]);

  const handleSubmit = async () => {
    if (!user) { pushToast?.("info", "Sign in required"); return; }
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: shortId, user_id: user.id, content: text.trim(),
      });
      if (error) throw error;
      setText("");
      await fetchComments();
      try { await supabase.rpc("increment_post_comments", { p_post_id: shortId }); } catch {}
    } catch (err) {
      pushToast?.("error", "Comment failed", err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl flex flex-col max-h-[75vh]"
        style={{ background: "var(--sp-card, #fff)" }}
      >
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "var(--sp-line, #eee)" }}>
          <div>
            <p className="text-sm font-black" style={{ color: "var(--sp-txt, #000)" }}>
              Comments ({comments.length})
            </p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-xl flex items-center justify-center hover:opacity-70">
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10"><FaSpinner className="animate-spin text-2xl mx-auto" /></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <FaCommentDots className="text-3xl mx-auto mb-2" />
              <p className="text-sm font-semibold">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}>
                  {c.users?.avatar_url ? (
                    <img src={c.users.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (c.users?.full_name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="rounded-2xl px-3 py-2" style={{ background: "var(--sp-card-2, #f5f5f5)" }}>
                    <p className="text-xs font-black" style={{ color: "var(--sp-txt, #000)" }}>
                      {c.users?.full_name || "User"}
                    </p>
                    <p className="text-sm mt-1" style={{ color: "var(--sp-txt, #000)" }}>{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--sp-line, #eee)" }}>
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}>
            {myProfile?.avatar_url ? (
              <img src={myProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (myProfile?.full_name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Add a comment…"
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none"
            style={{ background: "var(--sp-card-2, #f5f5f5)", color: "var(--sp-txt, #000)" }}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))", color: "#fff" }}
          >
            {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN SHORTS VIEWER
   ═══════════════════════════════════════════════════════════════ */
const MomentoShorts = ({ onClose, startIndex = 0, onActiveShortChange }) => {
  const { user } = useAuth();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [commentsOpenFor, setCommentsOpenFor] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const containerRef = useRef(null);

  const pushToast = (type, title, message) => {
    console.log(type, title, message);
  };

  /* Fetch shorts */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("study_group_posts")
          .select("*")
          .eq("is_short", true)
          .eq("media_type", "video")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        const authorIds = [...new Set((data || []).map((p) => p.user_id).filter(Boolean))];
        const usersMap = {}, settingsMap = {};
        if (authorIds.length) {
          const [uR, sR] = await Promise.all([
            supabase.from("users").select("id, name, full_name, username, email, avatar_url").in("id", authorIds),
            supabase.from("user_settings").select("user_id, full_name, avatar, avatar_url").in("user_id", authorIds),
          ]);
          (uR.data || []).forEach((u) => { usersMap[u.id] = u; });
          (sR.data || []).forEach((s) => { settingsMap[s.user_id] = s; });
        }

        const listingIds = [...new Set((data || []).map((p) => p.listing_id).filter(Boolean))];
        const listingsMap = {};
        if (listingIds.length) {
          const { data: listings } = await supabase
            .from("listings")
            .select("id, title, price, cover_image, city, area, category, status")
            .in("id", listingIds);
          (listings || []).forEach((l) => { listingsMap[l.id] = l; });
        }

        const enriched = (data || []).map((p) => ({
          ...p,
          users: {
            id: p.user_id,
            full_name: settingsMap[p.user_id]?.full_name || usersMap[p.user_id]?.full_name || usersMap[p.user_id]?.name,
            name: usersMap[p.user_id]?.name,
            avatar_url: settingsMap[p.user_id]?.avatar || settingsMap[p.user_id]?.avatar_url || usersMap[p.user_id]?.avatar_url,
          },
          linkedListing: p.listing_id ? listingsMap[p.listing_id] : null,
        }));

        if (!cancelled) setShorts(enriched);
      } catch (err) {
        console.error("Shorts load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* Load user's likes */
  useEffect(() => {
    if (!user || !shorts.length) return;
    (async () => {
      try {
        const { data } = await supabase.from("short_likes").select("short_id").eq("user_id", user.id);
        const map = {}; (data || []).forEach((r) => { map[r.short_id] = true; });
        setLiked(map);
      } catch {}
    })();
  }, [user, shorts]);

  /* Load my profile */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [uR, sR] = await Promise.all([
          supabase.from("users").select("full_name, name, avatar_url").eq("id", user.id).maybeSingle(),
          supabase.from("user_settings").select("full_name, avatar, avatar_url").eq("user_id", user.id).maybeSingle(),
        ]);
        setMyProfile({
          full_name: sR.data?.full_name || uR.data?.full_name || uR.data?.name,
          avatar_url: sR.data?.avatar || sR.data?.avatar_url || uR.data?.avatar_url,
        });
      } catch {}
    })();
  }, [user]);

  /* Track view when index changes */
  useEffect(() => {
    const shortId = shorts[currentIndex]?.id;
    if (!shortId) return;
    (async () => {
      try { await supabase.rpc("increment_short_views", { p_short_id: shortId }); } catch {}
    })();
  }, [currentIndex, shorts]);

  /* ⭐ NEW — Notify parent so it can update URL to /momento/short/<id> */
  useEffect(() => {
    const currentShort = shorts[currentIndex];
    if (currentShort?.id && typeof onActiveShortChange === "function") {
      onActiveShortChange(currentShort.id);
    }
  }, [currentIndex, shorts, onActiveShortChange]);

  /* Keyboard nav */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        setCurrentIndex((i) => Math.min(i + 1, shorts.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shorts.length, onClose]);

  /* Scroll wheel snap */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastScroll = 0;
    const onWheel = (e) => {
      const now = Date.now();
      if (now - lastScroll < 500) return;
      if (Math.abs(e.deltaY) < 30) return;
      lastScroll = now;
      if (e.deltaY > 0) setCurrentIndex((i) => Math.min(i + 1, shorts.length - 1));
      else setCurrentIndex((i) => Math.max(i - 1, 0));
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [shorts.length]);

  const handleLike = async (shortId) => {
    if (!user) { pushToast("info", "Sign in required"); return; }
    setLiked((prev) => ({ ...prev, [shortId]: !prev[shortId] }));
    setShorts((prev) => prev.map((s) => s.id === shortId
      ? { ...s, short_likes: (s.short_likes || 0) + (liked[shortId] ? -1 : 1) }
      : s));
    try { await supabase.rpc("toggle_short_like", { p_short_id: shortId }); } catch {}
  };

  const handleSave = (shortId) => {
    setSaved((prev) => ({ ...prev, [shortId]: !prev[shortId] }));
  };

  /* ⭐ Share now uses the deep-link URL format /momento/short/<id> */
  const handleShare = async (short) => {
    const url = `${window.location.origin}/momento/short/${short.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: short.title || "Momento Short", url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        pushToast("success", "Link copied");
        return;
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center">
        <FaSpinner className="text-white text-3xl animate-spin" />
      </div>
    );
  }

  if (!shorts.length) {
    return (
      <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center text-white p-6">
        <FaChevronUp className="text-4xl mb-4 opacity-40" />
        <p className="text-lg font-black mb-2">No shorts yet</p>
        <p className="text-sm opacity-60 text-center mb-6">Upload a short video to be the first!</p>
        <button onClick={onClose} className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black" ref={containerRef}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-40 h-11 w-11 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
        aria-label="Close"
      >
        <FaTimes className="text-lg" />
      </button>

      {/* Nav up/down (desktop) */}
      <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-2">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="h-11 w-11 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white hover:bg-black/70 disabled:opacity-30 transition"
        >
          <FaChevronUp className="text-sm" />
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, shorts.length - 1))}
          disabled={currentIndex === shorts.length - 1}
          className="h-11 w-11 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white hover:bg-black/70 disabled:opacity-30 transition"
        >
          <FaChevronDown className="text-sm" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold">
        {currentIndex + 1} / {shorts.length}
      </div>

      {/* Current video only — mounted, others lazy */}
      <div className="absolute inset-0">
        <ShortCard
          short={shorts[currentIndex]}
          isActive={true}
          isLiked={!!liked[shorts[currentIndex].id]}
          onLike={() => handleLike(shorts[currentIndex].id)}
          onOpenComments={() => setCommentsOpenFor(shorts[currentIndex].id)}
          savedState={!!saved[shorts[currentIndex].id]}
          onSave={() => handleSave(shorts[currentIndex].id)}
          onShare={() => handleShare(shorts[currentIndex])}
        />
      </div>

      {/* Comments sheet */}
      <AnimatePresence>
        {commentsOpenFor && (
          <CommentsSheet
            shortId={commentsOpenFor}
            onClose={() => setCommentsOpenFor(null)}
            user={user}
            myProfile={myProfile}
            pushToast={pushToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MomentoShorts;