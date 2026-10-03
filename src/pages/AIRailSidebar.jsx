// src/components/AIRailSidebar.jsx — Bottom mobile nav + hover-only tabs
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCog, FaSun, FaMoon, FaBars, FaTimes,
  FaHome, FaImages, FaMagic, FaComments,
  FaExpand, FaCube,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { supabase } from "../lib/supabase";

/* ═══════════════════════════════════════════════════════════════
   LOGO — plain img, sized by prop, no internal filter
   ═══════════════════════════════════════════════════════════════ */
const LogoImage = ({ size = 24, className = "border rounded-full", alt = "Dealora" }) => {
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"];
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <span
        style={{
          color: "#eb7d34",
          fontWeight: 900,
          fontSize: size * 0.9,
          lineHeight: 1,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        D
      </span>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt={alt}
      className={className}
      onError={() => {
        if (idx < sources.length - 1) setIdx(idx + 1);
        else setFailed(true);
      }}
      style={{
        height: size,
        width: "auto",
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
};

/* ═══════════════════════════════════════════════════════════════
   NAV LINKS
   ═══════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { id: "create",    label: "Home",       path: "/ai-image",         icon: FaHome },
  { id: "library",   label: "Library",    path: "/library",          icon: FaImages },
  { id: "remove-bg", label: "Remove BG",  path: "/remove-bg",        icon: FaMagic },
  { id: "ai-chat",   label: "AI Chat",    path: "/ai-chat",          icon: FaComments },
  { id: "image-gen", label: "Image Gen",  path: "/image-generator",  icon: FaWandMagicSparkles },
  { id: "upscaler",  label: "Upscaler",   path: "/ai-image",         icon: FaExpand },
  { id: "blueprint", label: "Blueprints", path: "/ai-image",         icon: FaCube },
];

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
   MAIN
   ═══════════════════════════════════════════════════════════════ */
const AIRailSidebar = ({ theme = "dark", onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 900px)");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    avatar: null,
  });

  const isLight = theme === "light";

  const T = isLight
    ? {
        pillBg: "rgba(255,255,255,0.80)",
        pillBgScroll: "rgba(255,255,255,0.94)",
        pillBorder: "rgba(20,20,30,0.08)",
        pillBorderScroll: "rgba(20,20,30,0.12)",
        pillShadow: "0 4px 20px rgba(20,20,30,0.06), 0 0 0 1px rgba(255,255,255,0.9) inset",
        pillShadowScroll: "0 12px 32px -8px rgba(20,20,30,0.14), 0 0 0 1px rgba(255,255,255,0.95) inset",
        txt: "#0D0D0D",
        txtSoft: "rgba(20,20,30,0.62)",
        txtFaint: "rgba(20,20,30,0.42)",
        primary: "#eb7d34",
        primary2: "#f59e0b",
        primarySoft: "rgba(235,125,52,0.10)",
        hover: "rgba(20,20,30,0.05)",
        hoverStrong: "rgba(20,20,30,0.08)",
        mobileBg: "rgba(255,255,255,0.98)",
        sheetBg: "rgba(255,255,255,0.92)",
        backdrop: "rgba(20,20,30,0.35)",
      }
    : {
        pillBg: "rgba(20,20,30,0.55)",
        pillBgScroll: "rgba(20,20,30,0.85)",
        pillBorder: "rgba(255,255,255,0.10)",
        pillBorderScroll: "rgba(255,255,255,0.14)",
        pillShadow: "0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset",
        pillShadowScroll: "0 16px 40px -12px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08) inset",
        txt: "#FFFFFF",
        txtSoft: "rgba(255,255,255,0.70)",
        txtFaint: "rgba(255,255,255,0.45)",
        primary: "#eb7d34",
        primary2: "#f59e0b",
        primarySoft: "rgba(235,125,52,0.14)",
        hover: "rgba(255,255,255,0.08)",
        hoverStrong: "rgba(255,255,255,0.12)",
        mobileBg: "rgba(15,15,22,0.98)",
        sheetBg: "rgba(20,20,28,0.92)",
        backdrop: "rgba(0,0,0,0.55)",
      };

  /* ── Load user profile ── */
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setUserProfile({ name: "Guest", email: "", avatar: null });
          return;
        }
        const meta = user.user_metadata || {};
        const fallbackName =
          meta.full_name || meta.name || meta.display_name ||
          (user.email || "").split("@")[0] || "User";

        let savedName = null, savedAvatar = null;
        try {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("full_name, avatar")
            .eq("user_id", user.id)
            .maybeSingle();
          if (settings) {
            savedName = settings.full_name || null;
            savedAvatar = settings.avatar || null;
          }
        } catch {}

        if (!cancelled) {
          setUserProfile({
            name: savedName || fallbackName,
            email: user.email || "",
            avatar: savedAvatar || meta.avatar_url || meta.picture || null,
          });
        }
      } catch (err) {
        console.warn("Navbar profile load failed:", err);
      }
    };
    loadProfile();
    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    const onUpdate = () => loadProfile();
    window.addEventListener("user-profile-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("user-profile-updated", onUpdate);
    };
  }, []);

  /* ── Scroll state ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active route ── */
  const activeId = location.pathname.startsWith("/image-generator")
    ? "image-gen"
    : location.pathname.startsWith("/library")
      ? "library"
      : location.pathname.startsWith("/remove-bg")
        ? "remove-bg"
        : location.pathname.startsWith("/ai-chat")
          ? "ai-chat"
          : location.pathname.startsWith("/ai-image")
            ? "create"
            : "create";

  const handleNavigate = (item) => {
    navigate(item.path);
    if (isMobile) setMobileOpen(false);
  };

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, mobileOpen]);

  /* ═══════════════════════════════════════════════════════════
     AVATAR
     ═══════════════════════════════════════════════════════════ */
  const Avatar = ({ size = 34 }) => {
    const initial = (userProfile.name || "U").charAt(0).toUpperCase();
    return (
      <motion.button
        type="button"
        title={userProfile.name || "Profile"}
        onClick={() => navigate("/settings")}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: userProfile.avatar
            ? "transparent"
            : "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
          color: "#fff",
          border: "none",
          fontWeight: 900,
          fontSize: size * 0.38,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
          boxShadow: `0 4px 12px -4px rgba(249,115,22,0.55)`,
          letterSpacing: "-0.02em",
        }}
      >
        {userProfile.avatar ? (
          <img
            src={userProfile.avatar}
            alt={userProfile.name || "Profile"}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextSibling;
              if (fallback) fallback.style.display = "flex";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}
        <span
          style={{
            display: userProfile.avatar ? "none" : "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
          }}
        >
          {initial}
        </span>
      </motion.button>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     DESKTOP TAB
     ═══════════════════════════════════════════════════════════ */
  const DesktopTab = ({ item }) => {
    const active = activeId === item.id;
    const hovered = hoveredId === item.id;
    const Icon = item.icon;

    return (
      <motion.button
        type="button"
        onClick={() => handleNavigate(item)}
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        style={{
          position: "relative",
          padding: "8px 14px",
          borderRadius: 999,
          background: "transparent",
          border: "none",
          color: active ? T.txt : hovered ? T.txt : T.txtSoft,
          fontSize: 13,
          fontWeight: active ? 700 : 500,
          fontFamily: "inherit",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          transition: "color 0.18s ease",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            background: hovered ? T.hover : "transparent",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "scale(1)" : "scale(0.92)",
            transition: "opacity 0.15s ease, transform 0.15s ease, background 0.15s ease",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        <Icon
          style={{
            fontSize: 11,
            opacity: active ? 1 : 0.75,
            transition: "opacity 0.18s ease",
          }}
        />
        <span>{item.label}</span>
      </motion.button>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ═══ Desktop pill navbar ═══ */}
      {!isMobile && (
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 80,
            width: "100%",
            padding: scrolled ? "12px 16px" : "20px 16px",
            transition: "padding 0.3s ease",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "8px 8px 8px 16px",
              borderRadius: 999,
              background: scrolled ? T.pillBgScroll : T.pillBg,
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              border: `1px solid ${scrolled ? T.pillBorderScroll : T.pillBorder}`,
              boxShadow: scrolled ? T.pillShadowScroll : T.pillShadow,
              transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              pointerEvents: "auto",
            }}
          >
            {/* ⭐ Logo — using .logo-inner wrapper + CSS filter */}
            <motion.button
              type="button"
              onClick={() => navigate("/feed")}
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                height: 28,
              }}
            >
              <span className="logo-inner" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <LogoImage  size={34} />
              </span>
            </motion.button>

            {/* Center nav — hover-only tabs */}
            <nav
              className="dealora-nav-scroll"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                padding: "2px 0",
              }}
            >
              {NAV_LINKS.map((item) => (
                <DesktopTab key={item.id} item={item} />
              ))}
            </nav>

            {/* Right icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <motion.button
                type="button"
                onClick={onToggleTheme}
                title={isLight ? "Switch to dark" : "Switch to light"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  color: T.txtSoft,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {isLight ? <FaMoon style={{ fontSize: 12 }} /> : <FaSun style={{ fontSize: 12 }} />}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate("/settings")}
                title="Settings"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  color: T.txtSoft,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <FaCog style={{ fontSize: 12 }} />
              </motion.button>

              <div style={{ marginLeft: 4 }}>
                <Avatar size={36} />
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* ═══ MOBILE — Top bar + bottom sheet menu ═══ */}
      {isMobile && (
        <>
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 80,
              width: "100%",
              padding: scrolled ? "10px 12px" : "14px 12px",
              transition: "padding 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "8px 8px 8px 14px",
                borderRadius: 999,
                background: scrolled ? T.pillBgScroll : T.pillBg,
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                border: `1px solid ${scrolled ? T.pillBorderScroll : T.pillBorder}`,
                boxShadow: scrolled ? T.pillShadowScroll : T.pillShadow,
                transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {/* ⭐ Logo — using .logo-inner wrapper + CSS filter */}
              <motion.button
                type="button"
                onClick={() => navigate("/feed")}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: 0,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                  height: 24,
                }}
              >
                <span className="logo-inner" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <LogoImage size={32} />
                </span>
              </motion.button>

              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Avatar size={32} />

                <motion.button
                  type="button"
                  onClick={() => setMobileOpen((v) => !v)}
                  title="Menu"
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: mobileOpen ? T.primarySoft : T.hover,
                    border: "none",
                    color: mobileOpen ? T.primary : T.txt,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={mobileOpen ? "close" : "open"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ display: "inline-flex" }}
                    >
                      {mobileOpen ? <FaTimes style={{ fontSize: 14 }} /> : <FaBars style={{ fontSize: 14 }} />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.header>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMobileOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 90,
                  background: T.backdrop,
                  backdropFilter: "blur(16px) saturate(140%)",
                  WebkitBackdropFilter: "blur(16px) saturate(140%)",
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="mobile-sheet"
                initial={{ y: "100%", opacity: 0.6 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0.6 }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                style={{
                  position: "fixed",
                  left: 12,
                  right: 12,
                  bottom: 12,
                  zIndex: 95,
                  borderRadius: 24,
                  background: T.sheetBg,
                  backdropFilter: "saturate(180%) blur(24px)",
                  WebkitBackdropFilter: "saturate(180%) blur(24px)",
                  border: `1px solid ${T.pillBorderScroll}`,
                  boxShadow: T.pillShadowScroll,
                  overflow: "hidden",
                  maxHeight: "80vh",
                }}
              >
                <div style={{ paddingTop: 10, paddingBottom: 6, display: "flex", justifyContent: "center" }}>
                  <div
                    style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      background: T.pillBorderScroll,
                    }}
                  />
                </div>

                <div style={{ padding: "6px 8px 12px", overflowY: "auto", maxHeight: "calc(80vh - 24px)" }}>
                  {NAV_LINKS.map((item, i) => {
                    const active = activeId === item.id;
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.24 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 14,
                          background: "transparent",
                          border: "none",
                          color: active ? T.primary : T.txt,
                          fontSize: 14.5,
                          fontWeight: active ? 700 : 500,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          textAlign: "left",
                          width: "100%",
                          transition: "background 0.15s, color 0.15s",
                          marginBottom: 3,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = T.hover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9,
                            background: active ? T.primarySoft : T.hover,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: active ? T.primary : T.txtSoft,
                          }}
                        >
                          <Icon style={{ fontSize: 12.5 }} />
                        </span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {active && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: T.primary,
                              boxShadow: `0 0 8px 2px ${T.primary}66`,
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}

                  <div
                    style={{
                      height: 1,
                      background: T.pillBorder,
                      margin: "8px 6px",
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px" }}>
                    <button
                      type="button"
                      onClick={() => { navigate("/settings"); setMobileOpen(false); }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 14,
                        background: "transparent",
                        border: "none",
                        color: T.txt,
                        fontSize: 14,
                        fontWeight: 500,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = T.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <FaCog style={{ fontSize: 13, color: T.txtSoft }} />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleTheme}
                      title={isLight ? "Switch to dark" : "Switch to light"}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: T.hover,
                        border: "none",
                        color: T.txt,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isLight ? <FaMoon style={{ fontSize: 13 }} /> : <FaSun style={{ fontSize: 13 }} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ═══ GLOBAL CSS — logo dark-mode filter ═══ */}
      <style>{`
        .dealora-nav-scroll::-webkit-scrollbar { display: none; }

        /* ⭐ Force the logo to look right in dark mode */
        .theme-dark .logo-inner,
        .theme-dark .logo-inner img,
        html.dark .logo-inner,
        html.dark .logo-inner img,
        body.theme-dark .logo-inner,
        body.theme-dark .logo-inner img,
        body.dark .logo-inner,
        body.dark .logo-inner img {
          filter: invert(1) hue-rotate(180deg) brightness(1.1);
        }
      `}</style>
    </>
  );
};

export default AIRailSidebar;