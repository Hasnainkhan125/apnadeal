  // src/pages/Library.jsx — Modern image library matching AI Generator home design
  import React, { useState, useEffect, useMemo } from "react";
  import { useNavigate } from "react-router-dom";
  import { motion, AnimatePresence } from "framer-motion";
  import {
    FaArrowLeft, FaTimes, FaDownload, FaSearch, FaTh,
    FaThLarge, FaTrash, FaImage, FaBars, FaFire,
    FaChevronLeft, FaChevronRight, FaStar, FaMagic, FaSpinner,
    FaHeart, FaRegHeart, FaRegCalendarAlt, FaCube, FaPalette,
    FaUser, FaCopy, FaCheck, FaExpand, FaInfoCircle,
  } from "react-icons/fa";
  import { FaWandMagicSparkles } from "react-icons/fa6";
  import AIRailSidebar from "./AIRailSidebar";
  import {
    loadMyGeneratedImages,
    deleteGeneratedImage,
  } from "../lib/imageStorage";

  /* ═══════════════════════════════════════════════════════════════
    THEME TOKENS
    ═══════════════════════════════════════════════════════════════ */
  const DARK = {
    bg: "#0A0A12",
    rail: "#0F0F1A",
    panel: "#16161F",
    panel2: "#1C1C28",
    panel3: "#232332",
    line: "rgba(255,255,255,0.08)",
    lineStrong: "rgba(255,255,255,0.15)",
    txt: "#FFFFFF",
    txtSoft: "rgba(255,255,255,0.65)",
    txtFaint: "rgba(255,255,255,0.45)",
    txtDim: "rgba(255,255,255,0.25)",
    primary: "#eb7d34",
    primary2: "#f59e0b",
    primary3: "#c8631f",
    primarySoft: "rgba(235,125,52,0.14)",
    primaryGlow: "rgba(235,125,52,0.45)",
    heroOverlay1: "rgba(10,10,18,0.35)",
    heroOverlay2: "rgba(10,10,18,0.95)",
  };

  const LIGHT = {
    bg: "#FFFFFF",
    rail: "#FFFFFF",
    panel: "#FFFFFF",
    panel2: "#F4F1EC",
    panel3: "#EBE7E0",
    line: "rgba(20,20,30,0.08)",
    lineStrong: "rgba(20,20,30,0.15)",
    txt: "#1A1613",
    txtSoft: "rgba(26,22,19,0.62)",
    txtFaint: "rgba(26,22,19,0.42)",
    txtDim: "rgba(26,22,19,0.25)",
    primary: "#c8631f",
    primary2: "#eb7d34",
    primary3: "#f59e0b",
    primarySoft: "rgba(200,99,31,0.10)",
    primaryGlow: "rgba(200,99,31,0.35)",
    heroOverlay1: "rgba(255,255,255,0.30)",
    heroOverlay2: "rgba(255,255,255,0.98)",
  };

  /* HERO BACKGROUND */
  const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1621784563330-caee0b138a00?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80&auto=format&fit=crop",
  ];

  /* FEATURED */
  const FEATURED_SOURCE = [
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s7/59a49269a42ca80335197778b4e7d658.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Leo Agent", tag: "AI Agent" },
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s3/52189ad8aa1863e505e6ed7c6749d17f.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "GPT Sunburst", tag: "Abstract" },
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s2/2ddd6ca605de2d218e0f7ff3963ee7fd.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Seedance Portrait", tag: "Portrait" },
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s7/ab75b49686278eee43c5420c9d9d5c8f.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "MiniMax H3 Scene", tag: "Cinematic" },
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s2/23083d49200aec70308c95046b18986a.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Old Photo Restoration", tag: "Restoration" },
    { url: "https://cdn.leonardo.ai/users/b7a4954c-355c-4734-bc9f-03387b3b0052/generations/1f1ac7e4-f999-6cc0-837e-14da65d44a08/lucid-origin_A_high-fashion_editorial_photo_of_a_full-body_shot_of_a_black_and_white_photo_of-3.jpg", prompt: "Consistent Character", tag: "Portrait" },
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s9/4df4b226e2dd3b8c18faafc83224ccc0.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Cinematic Portrait", tag: "Cinematic" },
    { url: "https://static-third-res.wondershare.cc/Media_io/aicommunity/thumbs/static/s6/7f295b6071418018148043d2ce810f25.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_560%2Fformat%2Cwebp%2Fquality%2Cq_80", prompt: "Abstract Floral", tag: "Abstract" },
  ];

  /* AI ART */
  const AI_PROMPTS = [
    "cyberpunk samurai in neon tokyo street",
    "ethereal forest spirit portrait",
    "crystal dragon flying over ancient castle",
    "astronaut standing on alien planet surface",
    "vaporwave sunset with palm trees",
    "fantasy warrior with glowing sword",
    "steampunk airship in cloudy sky",
    "surreal floating islands landscape",
    "cosmic whale swimming in space",
    "ancient temple overgrown with vines",
    "mecha robot in rainy street",
    "mystical nine-tailed fox",
    "art deco cityscape at night",
    "fantasy elf queen portrait",
    "post-apocalyptic wanderer",
    "underwater city of coral",
    "desert nomad with falcon",
    "bioluminescent jungle at night",
    "ice queen on frozen throne",
    "dragon made of galaxies",
    "gothic cathedral in fog",
    "neon street market at midnight",
    "mountain temple at sunrise",
    "abstract fluid art explosion",
  ];

  const makeAiImages = () =>
    AI_PROMPTS.map((prompt, i) => ({
      id: `ai-${i}`,
      url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=750&nologo=true&seed=${i + 1000}&model=flux`,
      prompt,
      type: "ai-art",
      tag: "AI Art",
    }));

  /* PHOTOGRAPHY */
  const PHOTO_TOPICS = [
    "mountain-landscape", "city-night", "forest-path", "ocean-waves",
    "desert-dunes", "snowy-peak", "tropical-beach", "vintage-car",
    "coffee-shop", "neon-street", "wildflowers", "misty-lake",
    "canyon-rocks", "autumn-forest", "foggy-bridge", "cherry-blossom",
  ];

  const makePhotoImages = () =>
    PHOTO_TOPICS.map((topic, i) => ({
      id: `photo-${i}`,
      url: `https://picsum.photos/seed/${topic}-${i}/600/750`,
      prompt: topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      type: "photography",
      tag: "Photography",
    }));

  /* FILTERS */
  const FILTERS = [
    { id: "all",         label: "All",         icon: FaThLarge },
    { id: "generated",   label: "Yours",       icon: FaMagic },
    { id: "featured",    label: "Featured",    icon: FaStar },
    { id: "photography", label: "Photography", icon: FaImage },
    { id: "ai-art",      label: "AI Art",      icon: FaFire },
  ];

  /* MEDIA QUERY HOOK */
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9, filter: "blur(6px)" },
    visible: {
      opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
  };

  /* ═══════════════════════════════════════════════════════════════
    MODERN LIGHTBOX
    Desktop/Tablet: image left, details panel right
    Mobile: image + bottom sheet with details
    ═══════════════════════════════════════════════════════════════ */
  const ModernLightbox = ({
    lightbox,
    T,
    theme,
    isMobile,
    isTablet,
    currentIndex,
    filteredLength,
    onPrev,
    onNext,
    onClose,
    onDownload,
    onDelete,
    formatDate,
    copyToClipboard,
    copiedId,
  }) => {
    const isRemote = lightbox.url && !lightbox.url.startsWith("data:");
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    const detailRows = [
      lightbox.model && { icon: FaCube,           label: "Model",  value: lightbox.model },
      lightbox.style && { icon: FaPalette,        label: "Style",  value: lightbox.style },
      (lightbox.width && lightbox.height) && {
        icon: FaExpand,
        label: "Size",
        value: `${lightbox.width} × ${lightbox.height}`,
      },
      lightbox.created_at && {
        icon: FaRegCalendarAlt,
        label: "Created",
        value: formatDate(lightbox.created_at),
      },
      (lightbox.user_name || lightbox.user_email) && {
        icon: FaUser,
        label: "By",
        value: lightbox.user_name || lightbox.user_email.split("@")[0],
      },
    ].filter(Boolean);

    const detailRowsContent = (
      <>
        {lightbox.tag && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 9, fontWeight: 900,
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "5px 10px", borderRadius: 999,
                background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                color: "#fff",
                boxShadow: `0 6px 16px -6px ${T.primaryGlow}`,
              }}
            >
              {lightbox.tag}
            </span>
            {lightbox.type === "generated" && (
              <span
                style={{
                  fontSize: 9, fontWeight: 900,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "5px 10px", borderRadius: 999,
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.35)",
                  color: "#4ade80",
                }}
              >
                Yours
              </span>
            )}
          </div>
        )}

        {lightbox.prompt && (
          <div>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 8, gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Prompt
              </span>
              <button
                onClick={() => copyToClipboard(lightbox.prompt, `prompt-${lightbox.id}`)}
                type="button"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 10, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                {copiedId === `prompt-${lightbox.id}` ? (
                  <>
                    <FaCheck style={{ fontSize: 9 }} /> Copied
                  </>
                ) : (
                  <>
                    <FaCopy style={{ fontSize: 9 }} /> Copy
                  </>
                )}
              </button>
            </div>
            <div
              style={{
                padding: "12px 14px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 12.5, fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.85)",
                wordBreak: "break-word",
              }}
            >
              {lightbox.prompt}
            </div>
          </div>
        )}

        {detailRows.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10, fontWeight: 800,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 10,
              }}
            >
              Details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {detailRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: `${T.primary}1A`,
                        border: `1px solid ${T.primary}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: T.primary2, flexShrink: 0,
                      }}
                    >
                      <Icon style={{ fontSize: 10 }} />
                    </span>
                    <span
                      style={{
                        fontSize: 10.5, fontWeight: 700,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        flexShrink: 0, minWidth: 60,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12, fontWeight: 700,
                        color: "#fff", marginLeft: "auto",
                        textAlign: "right",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                      title={row.value}
                    >
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isRemote && (
          <div>
            <div
              style={{
                fontSize: 10, fontWeight: 800,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 8,
              }}
            >
              Link
            </div>
            <button
              onClick={() => copyToClipboard(lightbox.url, `url-${lightbox.id}`)}
              type="button"
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                textAlign: "left", overflow: "hidden",
              }}
            >
              <FaCopy style={{ fontSize: 10, flexShrink: 0, color: T.primary2 }} />
              <span
                style={{
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1, minWidth: 0,
                }}
              >
                {copiedId === `url-${lightbox.id}` ? "Copied to clipboard!" : lightbox.url}
              </span>
              {copiedId === `url-${lightbox.id}` && (
                <FaCheck style={{ fontSize: 10, color: "#4ade80", flexShrink: 0 }} />
              )}
            </button>
          </div>
        )}
      </>
    );

    const actionButtons = (
      <>
        <motion.button
          onClick={() => onDownload(lightbox.url)}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
            border: "none", color: "#fff",
            fontSize: 13, fontWeight: 800,
            fontFamily: "inherit", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 8, letterSpacing: "-0.01em",
            boxShadow: `0 10px 28px -10px ${T.primaryGlow}`,
          }}
        >
          <FaDownload style={{ fontSize: 12 }} />
          Download image
        </motion.button>

        {lightbox.type === "generated" && (
          <motion.button
            onClick={() => onDelete(lightbox)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.30)",
              color: "#f87171",
              fontSize: 13, fontWeight: 700,
              fontFamily: "inherit", cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 8,
            }}
          >
            <FaTrash style={{ fontSize: 11 }} />
            Delete image
          </motion.button>
        )}
      </>
    );

    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />

        {/* IMAGE STAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: isMobile ? 60 : 24,
            left: isMobile ? 12 : 24,
            right: isMobile ? 12 : (isTablet ? 24 : 380),
            bottom: isMobile ? (mobileSheetOpen ? "55vh" : 100) : 24,
            zIndex: 101,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            transition: "bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <img
            src={lightbox.url}
            alt={lightbox.prompt || ""}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 14,
              boxShadow: "0 40px 90px -25px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)",
              pointerEvents: "auto",
            }}
          />
        </motion.div>

        {/* NAV ARROWS */}
        <AnimatePresence>
          {currentIndex > 0 && (
            <motion.button
              key="prev-btn"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              type="button"
              style={{
                position: "fixed",
                left: isMobile ? 8 : 24,
                top: isMobile ? "30%" : "50%",
                transform: "translateY(-50%)",
                width: isMobile ? 38 : 52,
                height: isMobile ? 38 : 52,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.10)",
                color: "#fff",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.20)",
                cursor: "pointer",
                zIndex: 102,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.primary;
                e.currentTarget.style.borderColor = T.primary;
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <FaChevronLeft style={{ fontSize: isMobile ? 12 : 15 }} />
            </motion.button>
          )}

          {currentIndex >= 0 && currentIndex < filteredLength - 1 && (
            <motion.button
              key="next-btn"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              type="button"
              style={{
                position: "fixed",
                right: isMobile ? 8 : (isTablet ? 24 : 380),
                top: isMobile ? "30%" : "50%",
                transform: "translateY(-50%)",
                width: isMobile ? 38 : 52,
                height: isMobile ? 38 : 52,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.10)",
                color: "#fff",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.20)",
                cursor: "pointer",
                zIndex: 102,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.primary;
                e.currentTarget.style.borderColor = T.primary;
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <FaChevronRight style={{ fontSize: isMobile ? 12 : 15 }} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* MOBILE TOP BAR */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0,
              padding: "12px 14px",
              zIndex: 103,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
            }}
          >
            <span
              style={{
                fontSize: 11, fontWeight: 800,
                color: "#fff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              {currentIndex + 1} / {filteredLength}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => onDownload(lightbox.url)}
                type="button"
                aria-label="Download"
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.20)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  cursor: "pointer",
                }}
              >
                <FaDownload style={{ fontSize: 12 }} />
              </button>

              {lightbox.type === "generated" && (
                <button
                  onClick={() => onDelete(lightbox)}
                  type="button"
                  aria-label="Delete"
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(239,68,68,0.22)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.35)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    cursor: "pointer",
                  }}
                >
                  <FaTrash style={{ fontSize: 11 }} />
                </button>
              )}

              <button
                onClick={onClose}
                type="button"
                aria-label="Close"
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.20)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  cursor: "pointer",
                }}
              >
                <FaTimes style={{ fontSize: 12 }} />
              </button>
            </div>
          </motion.div>
        )}

        {/* MOBILE BOTTOM SHEET TRIGGER */}
        {isMobile && !mobileSheetOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => { e.stopPropagation(); setMobileSheetOpen(true); }}
            type="button"
            style={{
              position: "fixed",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 22px",
              borderRadius: 999,
              zIndex: 103,
              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 800,
              fontFamily: "inherit",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "-0.01em",
              boxShadow: `0 12px 32px -8px ${T.primaryGlow}`,
            }}
          >
            <FaInfoCircle style={{ fontSize: 12 }} />
            View details
          </motion.button>
        )}

        {/* DESKTOP / TABLET RIGHT PANEL */}
        <AnimatePresence>
          {!isMobile && (
            <motion.aside
              key="details-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.08 }}
              style={{
                position: "fixed",
                top: 24, right: 24, bottom: 24,
                width: 340,
                zIndex: 102,
                borderRadius: 22,
                background: "linear-gradient(180deg, rgba(28,28,40,0.94) 0%, rgba(16,16,24,0.96) 100%)",
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 40px 90px -25px rgba(0,0,0,0.9)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "18px 20px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span
                    style={{
                      width: 34, height: 34, borderRadius: 11,
                      background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `0 8px 20px -8px ${T.primaryGlow}`,
                    }}
                  >
                    <FaWandMagicSparkles style={{ fontSize: 13, color: "#fff" }} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13, fontWeight: 800, color: "#fff",
                        letterSpacing: "-0.02em", lineHeight: 1.1,
                      }}
                    >
                      Image details
                    </div>
                    <div
                      style={{
                        fontSize: 10, fontWeight: 700,
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {currentIndex + 1} of {filteredLength}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  type="button"
                  aria-label="Close"
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.18)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                    e.currentTarget.style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  <FaTimes style={{ fontSize: 12 }} />
                </button>
              </div>

              {/* Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {detailRowsContent}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "14px 20px 18px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", flexDirection: "column", gap: 10,
                  flexShrink: 0,
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                {actionButtons}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MOBILE BOTTOM SHEET */}
        <AnimatePresence>
          {isMobile && mobileSheetOpen && (
            <>
              <motion.div
                key="sheet-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); setMobileSheetOpen(false); }}
                style={{
                  position: "fixed", inset: 0, zIndex: 104,
                  background: "rgba(0,0,0,0.35)",
                }}
              />

              <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "fixed",
                  left: 0, right: 0, bottom: 0,
                  zIndex: 105,
                  maxHeight: "62vh",
                  borderRadius: "24px 24px 0 0",
                  background: "linear-gradient(180deg, rgba(28,28,40,0.98) 0%, rgba(16,16,24,0.99) 100%)",
                  backdropFilter: "blur(28px) saturate(180%)",
                  WebkitBackdropFilter: "blur(28px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderBottom: "none",
                  boxShadow: "0 -30px 80px -20px rgba(0,0,0,0.9)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 0 4px",
                    display: "flex", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 44, height: 4, borderRadius: 999,
                      background: "rgba(255,255,255,0.25)",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "8px 20px 12px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        width: 30, height: 30, borderRadius: 10,
                        background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 6px 16px -6px ${T.primaryGlow}`,
                      }}
                    >
                      <FaWandMagicSparkles style={{ fontSize: 11, color: "#fff" }} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5, fontWeight: 800, color: "#fff",
                          letterSpacing: "-0.02em", lineHeight: 1.1,
                        }}
                      >
                        Image details
                      </div>
                      <div
                        style={{
                          fontSize: 9, fontWeight: 700,
                          color: "rgba(255,255,255,0.45)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginTop: 2,
                        }}
                      >
                        {currentIndex + 1} of {filteredLength}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileSheetOpen(false)}
                    type="button"
                    aria-label="Close details"
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <FaTimes style={{ fontSize: 10 }} />
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {detailRowsContent}
                </div>

                <div
                  style={{
                    padding: "14px 20px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flexShrink: 0,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  {actionButtons}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
    MAIN LIBRARY PAGE
    ═══════════════════════════════════════════════════════════════ */
  const Library = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");
    const isNarrow = useMediaQuery("(max-width: 600px)");

    const [showSplash, setShowSplash] = useState(() => {
      if (typeof window === "undefined") return false;
      try {
        return !sessionStorage.getItem("leo_library_splash_shown");
      } catch {
        return true;
      }
    });

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

    const [userImages, setUserImages] = useState([]);
    const [loadingMine, setLoadingMine] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [lightbox, setLightbox] = useState(null);
    const [layout, setLayout] = useState("grid");
    const [heroIdx, setHeroIdx] = useState(0);

    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [favorites, setFavorites] = useState(new Set());
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
      const id = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 9000);
      return () => clearInterval(id);
    }, []);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        setLoadingMine(true);
        const mine = await loadMyGeneratedImages(100);
        if (!cancelled) {
          setUserImages(mine || []);
          setLoadingMine(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

    useEffect(() => {
      const refresh = () => {
        loadMyGeneratedImages(100).then((mine) => setUserImages(mine || []));
      };
      const onUpdate = () => refresh();
      window.addEventListener("focus", refresh);
      window.addEventListener("library-updated", onUpdate);
      return () => {
        window.removeEventListener("focus", refresh);
        window.removeEventListener("library-updated", onUpdate);
      };
    }, []);

    const allImages = useMemo(() => {
      const featured = FEATURED_SOURCE.map((img, i) => ({
        id: `feat-${i}`,
        url: img.url,
        prompt: img.prompt,
        type: "featured",
        tag: img.tag,
      }));

      const ai = makeAiImages();
      const photos = makePhotoImages();

      const mine = userImages.map((img) => ({
        id: img.id,
        url: img.url,
        prompt: img.prompt,
        type: "generated",
        tag: "Yours",
        model: img.model,
        style: img.style,
        width: img.width,
        height: img.height,
        created_at: img.created_at,
        user_name: img.user_name,
        user_email: img.user_email,
        user_id: img.user_id,
      }));

      return [...mine, ...featured, ...photos, ...ai];
    }, [userImages]);

    const filtered = useMemo(() => {
      let out = allImages;

      if (filter === "generated")   out = out.filter((i) => i.type === "generated");
      if (filter === "featured")    out = out.filter((i) => i.type === "featured");
      if (filter === "photography") out = out.filter((i) => i.type === "photography");
      if (filter === "ai-art")      out = out.filter((i) => i.type === "ai-art");

      if (search.trim()) {
        const q = search.toLowerCase();
        out = out.filter((i) => (i.prompt || "").toLowerCase().includes(q));
      }
      return out;
    }, [allImages, filter, search]);

    const stats = useMemo(() => ({
      total: allImages.length,
      yours: userImages.length,
      featured: FEATURED_SOURCE.length,
    }), [allImages, userImages]);

    const formatDate = (iso) => {
      if (!iso) return "";
      try {
        const d = new Date(iso);
        return d.toLocaleString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    };

    const copyToClipboard = async (text, id) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1600);
      } catch {}
    };

    const handleDownload = async (url) => {
      if (!url) return;
      try {
        if (url.startsWith("data:image")) {
          const a = document.createElement("a");
          a.href = url;
          a.download = `leonardo-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          return;
        }
        const res = await fetch(url, { mode: "cors" });
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `leonardo-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch {
        window.open(url, "_blank");
      }
    };

    const toggleFavorite = (id) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const requestDelete = (img) => {
      setConfirmDelete({ id: img.id, url: img.url, prompt: img.prompt });
    };

    const handleDelete = async () => {
      if (!confirmDelete) return;
      const id = confirmDelete.id;
      setDeleting(true);
      try {
        setUserImages((prev) => prev.filter((i) => i.id !== id));
        if (lightbox?.id === id) setLightbox(null);
        await deleteGeneratedImage(id);
        window.dispatchEvent(new Event("library-updated"));
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setDeleting(false);
        setConfirmDelete(null);
      }
    };

    const currentIndex = lightbox ? filtered.findIndex((i) => i.id === lightbox.id) : -1;
    const goPrev = () => { if (currentIndex > 0) setLightbox(filtered[currentIndex - 1]); };
    const goNext = () => {
      if (currentIndex >= 0 && currentIndex < filtered.length - 1)
        setLightbox(filtered[currentIndex + 1]);
    };

    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") {
          if (confirmDelete) { setConfirmDelete(null); return; }
          if (lightbox) setLightbox(null);
        }
        if (!lightbox) return;
        if (e.key === "ArrowLeft")  goPrev();
        if (e.key === "ArrowRight") goNext();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [lightbox, confirmDelete, currentIndex, filtered]);

    const cols = useMemo(() => {
      if (layout === "list") return 1;
      if (isNarrow) return 2;
      if (isTablet) return 3;
      return 4;
    }, [layout, isNarrow, isTablet]);

    const showEmptyState = !loadingMine || filter !== "generated";

    const staggerContainer = (stagger = 0.12, delay = 0.1) => ({
      hidden: {},
      visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    });

    const fadeInUp = {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
      <>
        <AnimatePresence>
          {showSplash && (
            <LoadingSplash
              onDone={() => {
                setShowSplash(false);
                try { sessionStorage.setItem("leo_library_splash_shown", "1"); } catch {}
              }}
            />
          )}
        </AnimatePresence>

        <div style={{
          background: T.bg, color: T.txt,
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: "100vh",
        }}>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />

<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%", background: T.bg, position: "relative" }}>
  <AIRailSidebar theme={theme} onToggleTheme={toggleTheme} />

            <main style={{
              flex: 1, minWidth: 0,
              overflowY: "auto",
              height: "100vh",
              position: "relative",
            }}>
              <motion.div
                initial="hidden"
                animate={showSplash ? "hidden" : "visible"}
                variants={staggerContainer(0.15, 0.1)}
              >
                {/* HERO */}
                <motion.section
                  variants={fadeInUp}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: isMobile ? 0 : 24,
                    padding: isMobile
                      ? "70px 16px 24px"
                      : isTablet
                      ? "160px 20px 28px"
                      : "220px 24px 32px",
                    textAlign: "center",
                    isolation: "isolate",
                  }}
                >
                  {HERO_IMAGES.map((src, i) => (
                    <div
                      key={src + i}
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: -2,
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center 30%",
                        opacity: heroIdx === i ? 1 : 0,
                        transition: "opacity 1.4s ease-in-out",
                        pointerEvents: "none",
                      }}
                    />
                  ))}

                  <div style={{
                    position: "absolute", inset: 0, zIndex: -1,
                    background: `linear-gradient(180deg, ${T.heroOverlay1} 0%, ${T.heroOverlay2} 65%, ${T.bg} 100%)`,
                  }} />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <motion.h1
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: isMobile
                          ? "clamp(28px, 8vw, 38px)"
                          : isTablet
                          ? "clamp(44px, 7vw, 64px)"
                          : "clamp(56px, 6.5vw, 92px)",
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        lineHeight: 0.95,
                        textTransform: "uppercase",
                        margin: isMobile ? "0 0 18px" : "0 0 32px",
                        color: T.txt,
                        textShadow: theme === "light"
                          ? "0 2px 8px rgba(0,0,0,0.08)"
                          : "0 6px 24px rgba(0,0,0,0.45)",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: isMobile ? "0 10px" : "0 20px",
                      }}
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "inline-block", position: "relative" }}
                      >
                        Image
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            position: "absolute",
                            left: 0, right: 0,
                            bottom: isMobile ? -4 : -8,
                            height: isMobile ? 3 : 5,
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${T.primary}, ${T.primary2})`,
                            transformOrigin: "left center",
                            boxShadow: `0 4px 20px -2px ${T.primaryGlow}`,
                          }}
                        />
                      </motion.span>

                      <motion.span
                        initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          display: "inline-block",
                          fontSize: "0.5em",
                          fontWeight: 700,
                          color: T.txtSoft,
                          textShadow: "none",
                          transform: "translateY(-0.06em)",
                        }}
                      >
                        ·
                      </motion.span>

                      <motion.span
                        initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          display: "inline-block",
                          position: "relative",
                          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 50%, ${T.primary3} 100%)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Library
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
                          transition={{
                            opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                            scale: { duration: 0.5, delay: 1.2 },
                          }}
                          style={{
                            position: "absolute",
                            top: isMobile ? "-6px" : "-12px",
                            right: isMobile ? "-10px" : "-18px",
                            width: isMobile ? 8 : 12,
                            height: isMobile ? 8 : 12,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, #fff 0%, ${T.primary} 60%, transparent 100%)`,
                            boxShadow: `0 0 20px 4px ${T.primaryGlow}`,
                            pointerEvents: "none",
                          }}
                        />
                      </motion.span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        fontSize: isMobile ? 13.5 : 15,
                        color: T.txtSoft,
                        margin: isMobile ? "0 0 22px" : "0 0 40px",
                        maxWidth: 560,
                        marginLeft: "auto",
                        marginRight: "auto",
                        lineHeight: 1.55,
                        fontWeight: 500,
                      }}
                    >
                      Browse <strong style={{ color: T.txt, fontWeight: 800 }}>{stats.total}+</strong> AI-generated images, featured works, and your personal creations.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: theme === "light"
                          ? "rgba(255,255,255,0.94)"
                          : "linear-gradient(180deg, rgba(28,28,36,0.88) 0%, rgba(22,22,30,0.94) 100%)",
                        backdropFilter: "blur(32px) saturate(180%)",
                        WebkitBackdropFilter: "blur(32px) saturate(180%)",
                        border: theme === "light"
                          ? "1px solid rgba(20,20,30,0.08)"
                          : `1px solid ${T.lineStrong}`,
                        borderRadius: 999,
                        padding: "6px 6px 6px 18px",
                        maxWidth: 620,
                        width: "100%",
                        margin: "0 auto",
                        boxShadow: theme === "light"
                          ? "0 16px 40px -20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)"
                          : "0 16px 40px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                    >
                      <FaSearch style={{
                        fontSize: 13,
                        color: search ? T.primary2 : T.txtFaint,
                        flexShrink: 0,
                        transition: "color 0.25s ease",
                      }} />

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search prompts, tags, styles…"
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: T.txt,
                          fontSize: isMobile ? 13.5 : 14.5,
                          padding: "12px 0",
                          fontFamily: "inherit",
                          minWidth: 0,
                        }}
                      />

                      <AnimatePresence>
                        {search && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSearch("")}
                            type="button"
                            style={{
                              background: theme === "light"
                                ? "rgba(0,0,0,0.05)"
                                : "rgba(255,255,255,0.10)",
                              border: "none",
                              color: T.txtSoft,
                              cursor: "pointer",
                              width: 34, height: 34,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <FaTimes style={{ fontSize: 11 }} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: isMobile ? 8 : 12,
                        marginTop: isMobile ? 24 : 36,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        { label: "Total",    value: stats.total,    accent: true },
                        { label: "Yours",    value: stats.yours,    accent: false },
                        { label: "Featured", value: stats.featured, accent: false },
                      ].map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 24, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 1.05 + i * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          whileHover={{ y: -4, scale: 1.04 }}
                          style={{
                            position: "relative",
                            padding: isMobile ? "10px 16px" : "12px 20px",
                            background: s.accent
                              ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                              : (theme === "light"
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(255,255,255,0.06)"),
                            border: `1px solid ${s.accent
                              ? "transparent"
                              : (theme === "light"
                                  ? "rgba(20,20,30,0.10)"
                                  : "rgba(255,255,255,0.12)")}`,
                            borderRadius: 16,
                            minWidth: isMobile ? 84 : 96,
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            boxShadow: s.accent
                              ? `0 16px 32px -12px ${T.primaryGlow}`
                              : (theme === "light"
                                  ? "0 8px 24px -12px rgba(0,0,0,0.10)"
                                  : "0 8px 24px -12px rgba(0,0,0,0.4)"),
                            overflow: "hidden",
                          }}
                        >
                          {s.accent && (
                            <motion.span
                              animate={{ x: ["-120%", "220%"] }}
                              transition={{
                                duration: 2.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatDelay: 1.5,
                              }}
                              style={{
                                position: "absolute",
                                top: 0, bottom: 0,
                                width: "60%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                                pointerEvents: "none",
                                transform: "skewX(-20deg)",
                              }}
                            />
                          )}
                          <div style={{
                            fontSize: isMobile ? 20 : 24,
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            color: s.accent ? "#fff" : T.txt,
                            position: "relative",
                            zIndex: 1,
                          }}>
                            {s.value}
                          </div>
                          <div style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginTop: 5,
                            color: s.accent
                              ? "rgba(255,255,255,0.85)"
                              : T.txtFaint,
                            position: "relative",
                            zIndex: 1,
                          }}>
                            {s.label}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.section>

                {/* STICKY FILTER BAR */}
                <motion.div
                  variants={fadeInUp}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    background: theme === "light"
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(10,10,18,0.88)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    borderTop: `1px solid ${T.line}`,
                    borderBottom: `1px solid ${T.line}`,
                    padding: isMobile ? "10px 12px" : "12px 24px",
                    marginBottom: 16,
                  }}
                >
                  <div style={{
                    maxWidth: 1400,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      overflowX: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                      flex: 1,
                      minWidth: 0,
                    }}>
                      {FILTERS.map((f) => {
                        const Icon = f.icon;
                        const active = filter === f.id;
                        const showSpinner = f.id === "generated" && loadingMine;
                        return (
                          <motion.button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              padding: isMobile ? "8px 14px" : "9px 16px",
                              borderRadius: 999,
                              fontSize: isMobile ? 12.5 : 13,
                              fontWeight: 700,
                              fontFamily: "inherit",
                              background: active
                                ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                                : (theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)"),
                              color: active ? "#fff" : T.txtSoft,
                              border: active ? "1px solid transparent" : `1px solid ${T.line}`,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              boxShadow: active ? `0 8px 20px -8px ${T.primaryGlow}` : "none",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {showSpinner ? (
                              <FaSpinner style={{ fontSize: 11, animation: "leo-spin 1s linear infinite" }} />
                            ) : (
                              <Icon style={{ fontSize: 11 }} />
                            )}
                            {f.label}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${T.line}`,
                      borderRadius: 999,
                      padding: 3,
                      gap: 2,
                      flexShrink: 0,
                    }}>
                      {[
                        { id: "grid",    icon: FaThLarge },
                        { id: "masonry", icon: FaBars },
                        { id: "list",    icon: FaTh },
                      ].map((l) => {
                        const Icon = l.icon;
                        const active = layout === l.id;
                        return (
                          <button
                            key={l.id}
                            onClick={() => setLayout(l.id)}
                            type="button"
                            style={{
                              width: 32, height: 32,
                              borderRadius: 999,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: active
                                ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                                : "transparent",
                              color: active ? "#fff" : T.txtSoft,
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            title={`${l.id} layout`}
                          >
                            <Icon style={{ fontSize: 11 }} />
                          </button>
                        );
                      })}
                    </div>

                    {!isNarrow && (
                      <span style={{
                        flexShrink: 0,
                        fontSize: 12,
                        color: T.txtFaint,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {filtered.length} {filtered.length === 1 ? "image" : "images"}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* GRID */}
                <div style={{
                  padding: isMobile ? "0 12px 100px" : "0 24px 100px",
                  maxWidth: 1400,
                  margin: "0 auto",
                }}>
                  {filtered.length === 0 && showEmptyState ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "80px 24px",
                        textAlign: "center",
                        background: T.panel,
                        border: `1px dashed ${T.line}`,
                        borderRadius: 20,
                        marginTop: 20,
                      }}
                    >
                      <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: T.panel3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 18,
                      }}>
                        <FaImage style={{ fontSize: 28, color: T.txtFaint }} />
                      </div>
                      <p style={{ fontSize: 17, fontWeight: 800, color: T.txt, margin: "0 0 8px" }}>
                        {filter === "generated" ? "You haven't created anything yet" : "No images found"}
                      </p>
                      <p style={{
                        fontSize: 13.5,
                        color: T.txtSoft,
                        margin: 0,
                        maxWidth: 420,
                        lineHeight: 1.55,
                      }}>
                        {filter === "generated"
                          ? "Generate your first image and it will appear here automatically."
                          : search
                          ? "Try a different search term."
                          : "Try selecting a different filter or generate your own images."}
                      </p>
                      {filter === "generated" && (
                        <motion.button
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => navigate("/image-generator")}
                          type="button"
                          style={{
                            marginTop: 20,
                            padding: "11px 22px",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            color: "#fff",
                            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
                            border: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: `0 10px 28px -10px ${T.primaryGlow}`,
                          }}
                        >
                          <FaWandMagicSparkles style={{ fontSize: 12 }} />
                          Create your first image
                        </motion.button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${layout}-${filter}-${search}`}
                      variants={gridVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        display: layout === "list" ? "flex" : "grid",
                        flexDirection: "column",
                        gridTemplateColumns:
                          layout === "grid"
                            ? `repeat(${cols}, 1fr)`
                            : layout === "masonry"
                            ? `repeat(auto-fill, minmax(${isMobile ? 150 : 220}px, 1fr))`
                            : undefined,
                        gap: isMobile ? 10 : 14,
                      }}
                    >
                      {filtered.map((img) => {
                        const isFav = favorites.has(img.id);
                        return (
                          <div
                            key={img.id}
                            className="lib-card-wrap"
                            style={{ position: "relative" }}
                          >
                            <motion.button
                              variants={cardVariants}
                              whileHover={{
                                y: -6,
                                scale: 1.02,
                                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                              }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setLightbox(img)}
                              type="button"
                              className="lib-card"
                              style={{
                                position: "relative",
                                width: "100%",
                                borderRadius: 16,
                                overflow: "hidden",
                                aspectRatio: layout === "list" ? "16 / 9" : "1 / 1",
                                background: T.panel2,
                                border: `1px solid ${T.line}`,
                                cursor: "pointer",
                                padding: 0,
                                fontFamily: "inherit",
                                textAlign: "left",
                                boxShadow: theme === "light"
                                  ? "0 4px 16px -8px rgba(0,0,0,0.08)"
                                  : "0 4px 16px -8px rgba(0,0,0,0.35)",
                                transition: "box-shadow 0.4s ease, border-color 0.3s ease",
                              }}
                            >
                              <img
                                src={img.url}
                                alt={img.prompt || ""}
                                loading="lazy"
                                className="lib-card-img"
                                onError={(e) => {
                                  e.currentTarget.src = `https://picsum.photos/seed/fallback-${img.id}/600/750`;
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                  transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                              />

                              <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.9) 100%)",
                                pointerEvents: "none",
                              }} />

                              <span style={{
                                position: "absolute",
                                top: 10, right: 10,
                                fontSize: 9,
                                fontWeight: 800,
                                padding: "4px 9px",
                                borderRadius: 999,
                                background: img.type === "generated"
                                  ? `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`
                                  : "rgba(0,0,0,0.55)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                color: "#fff",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                border: "1px solid rgba(255,255,255,0.15)",
                                pointerEvents: "none",
                              }}>
                                {img.tag || "Featured"}
                              </span>

                              <div style={{
                                position: "absolute",
                                left: 0, right: 0, bottom: 0,
                                padding: "12px 12px 10px",
                                pointerEvents: "none",
                              }}>
                                <span style={{
                                  color: "#fff",
                                  fontSize: isMobile ? 11.5 : 12.5,
                                  fontWeight: 700,
                                  lineHeight: 1.3,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                                }}>
                                  {img.prompt || "Untitled"}
                                </span>
                              </div>
                            </motion.button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(img.id);
                              }}
                              type="button"
                              title={isFav ? "Remove from favorites" : "Add to favorites"}
                              className="lib-fav-btn"
                              style={{
                                position: "absolute",
                                top: 10, right: 10,
                                width: 30, height: 30,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0,0,0,0.55)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                cursor: "pointer",
                                zIndex: 4,
                                color: isFav ? T.primary : "#fff",
                                opacity: 0,
                                transition: "opacity 0.2s ease, transform 0.2s ease",
                                transform: "scale(0.85)",
                              }}
                            >
                              {isFav ? <FaHeart style={{ fontSize: 11 }} /> : <FaRegHeart style={{ fontSize: 11 }} />}
                            </button>

                            {img.type === "generated" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDelete(img);
                                }}
                                type="button"
                                title="Delete"
                                className="lib-del-btn"
                                style={{
                                  position: "absolute",
                                  top: 10, left: 10,
                                  width: 30, height: 30,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "rgba(239,68,68,0.92)",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.25)",
                                  backdropFilter: "blur(8px)",
                                  WebkitBackdropFilter: "blur(8px)",
                                  cursor: "pointer",
                                  zIndex: 4,
                                  opacity: 0,
                                  transition: "opacity 0.2s ease, transform 0.2s ease",
                                  transform: "scale(0.85)",
                                }}
                              >
                                <FaTrash style={{ fontSize: 11 }} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </main>
          </div>

          {/* CONFIRM DELETE MODAL */}
          <AnimatePresence>
            {confirmDelete && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !deleting && setConfirmDelete(null)}
                  style={{
                    position: "fixed", inset: 0, zIndex: 200,
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  style={{
                    position: "fixed", inset: 0, zIndex: 201,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    pointerEvents: "none",
                    padding: 20,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "relative",
                      pointerEvents: "auto",
                      width: "100%",
                      maxWidth: 440,
                      background: theme === "light"
                        ? "linear-gradient(180deg, #FFFFFF 0%, #F9F6F2 100%)"
                        : "linear-gradient(180deg, #1C1C28 0%, #14141C 100%)",
                      border: `1px solid ${T.lineStrong}`,
                      borderRadius: 22,
                      padding: 24,
                      boxShadow: theme === "light"
                        ? "0 40px 80px -20px rgba(0,0,0,0.25)"
                        : "0 40px 80px -20px rgba(0,0,0,0.9)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: -100, right: -80,
                      width: 260, height: 260,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)",
                      filter: "blur(50px)",
                      pointerEvents: "none",
                    }} />

                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                      style={{
                        position: "relative",
                        width: 52, height: 52,
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.08) 100%)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        marginBottom: 16,
                      }}
                    >
                      <FaTrash style={{ fontSize: 20, color: "#f87171" }} />
                    </motion.div>

                    <h3 style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: T.txt,
                      margin: "0 0 8px",
                      letterSpacing: "-0.02em",
                    }}>
                      Delete this image?
                    </h3>

                    <p style={{
                      fontSize: 13,
                      color: T.txtSoft,
                      margin: "0 0 18px",
                      lineHeight: 1.55,
                    }}>
                      This will permanently remove the image from your library. This action cannot be undone.
                    </p>

                    {confirmDelete.url && (
                      <div style={{
                        position: "relative",
                        width: "100%",
                        height: 130,
                        borderRadius: 12,
                        overflow: "hidden",
                        marginBottom: 18,
                        border: `1px solid ${T.line}`,
                        background: T.panel2,
                      }}>
                        <img
                          src={confirmDelete.url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)",
                          pointerEvents: "none",
                        }} />
                        {confirmDelete.prompt && (
                          <span style={{
                            position: "absolute",
                            left: 12, right: 12, bottom: 10,
                            color: "#fff",
                            fontSize: 11.5,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                          }}>
                            {confirmDelete.prompt}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        disabled={deleting}
                        type="button"
                        style={{
                          padding: "10px 18px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          background: theme === "light"
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(255,255,255,0.06)",
                          color: T.txtSoft,
                          border: `1px solid ${T.line}`,
                          cursor: deleting ? "not-allowed" : "pointer",
                          opacity: deleting ? 0.5 : 1,
                          transition: "all 0.18s ease",
                        }}
                      >
                        Cancel
                      </button>

                      <motion.button
                        onClick={handleDelete}
                        disabled={deleting}
                        type="button"
                        whileHover={!deleting ? { scale: 1.04, y: -1 } : {}}
                        whileTap={!deleting ? { scale: 0.97 } : {}}
                        style={{
                          position: "relative",
                          padding: "10px 20px",
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          color: "#fff",
                          background: deleting
                            ? "rgba(239,68,68,0.5)"
                            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          border: "none",
                          cursor: deleting ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          overflow: "hidden",
                          boxShadow: deleting ? "none" : "0 8px 24px -8px rgba(239,68,68,0.6)",
                          transition: "background 0.2s ease, box-shadow 0.2s ease",
                        }}
                      >
                        {!deleting && (
                          <motion.span
                            initial={{ x: "-120%" }}
                            animate={{ x: "220%" }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              repeatDelay: 1.2,
                            }}
                            style={{
                              position: "absolute",
                              top: 0, bottom: 0,
                              width: "55%",
                              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                              transform: "skewX(-20deg)",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                        <span style={{
                          position: "relative",
                          zIndex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}>
                          {deleting ? (
                            <>
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                                style={{ display: "inline-flex" }}
                              >
                                <FaSpinner style={{ fontSize: 11 }} />
                              </motion.span>
                              <span>Deleting…</span>
                            </>
                          ) : (
                            <>
                              <FaTrash style={{ fontSize: 11 }} />
                              <span>Delete</span>
                            </>
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MODERN LIGHTBOX */}
          <AnimatePresence>
            {lightbox && (
              <ModernLightbox
                lightbox={lightbox}
                T={T}
                theme={theme}
                isMobile={isMobile}
                isTablet={isTablet}
                currentIndex={currentIndex}
                filteredLength={filtered.length}
                onPrev={goPrev}
                onNext={goNext}
                onClose={() => setLightbox(null)}
                onDownload={handleDownload}
                onDelete={requestDelete}
                formatDate={formatDate}
                copyToClipboard={copyToClipboard}
                copiedId={copiedId}
              />
            )}
          </AnimatePresence>

          <style>{`
            @keyframes leo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            .lib-card:hover {
              box-shadow: 0 28px 56px -18px ${T.primaryGlow} !important;
              border-color: ${T.primary} !important;
            }
            .lib-card:hover .lib-card-img {
              transform: scale(1.08);
            }
            .lib-card-wrap:hover .lib-del-btn,
            .lib-card-wrap:hover .lib-fav-btn {
              opacity: 1 !important;
              transform: scale(1) !important;
            }

            *::-webkit-scrollbar { width: 8px; height: 8px; }
            *::-webkit-scrollbar-track { background: transparent; }
            *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 999px; }
            *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          `}</style>
        </div>
      </>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
    LOADING SPLASH
    ═══════════════════════════════════════════════════════════════ */
  const LoadingSplash = ({ onDone }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      let raf;
      const start = Date.now();
      const duration = 1600;

      const tick = () => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, (elapsed / duration) * 100);
        setProgress(pct);
        if (pct < 100) {
          raf = requestAnimationFrame(tick);
        } else {
          setTimeout(onDone, 300);
        }
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [onDone]);

    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 24, background: "#FFFFFF",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            width: 56, height: 56, borderRadius: 16,
            background: "#eb7d34",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 30px -10px rgba(235,125,52,0.5)",
          }}
        >
          <FaWandMagicSparkles style={{ fontSize: 22, color: "#fff" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 14, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#1A1613",
          }}
        >
          Image Library
        </motion.div>

        <div style={{
          width: 180, height: 3, borderRadius: 999,
          background: "rgba(0,0,0,0.08)", overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "#eb7d34", borderRadius: 999,
            transition: "width 0.1s linear",
          }} />
        </div>

        <div style={{
          fontSize: 12, fontWeight: 600,
          color: "rgba(26,22,19,0.42)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {Math.round(progress)}%
        </div>
      </motion.div>
    );
  };

  export default Library;