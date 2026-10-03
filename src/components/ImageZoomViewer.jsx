// src/components/ImageZoomViewer.jsx
// Alibaba-style full-screen image viewer with mouse-follow zoom lens
// (reduced zoom for a subtler feel)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown,
  FaExpand, FaCompress, FaHeart, FaRegHeart, FaSearchPlus,
} from "react-icons/fa";

/* Zoom factor — lower = subtler zoom.
   Previously 220% — now 170% (a little decrease). */
const ZOOM_SCALE = 170; // percent

const ImageZoomViewer = ({
  open,
  images = [],
  activeIndex = 0,
  onClose,
  onIndexChange,
  title = "",
  isFav = false,
  onToggleFav,
  onFindSimilar,
}) => {
  const [index, setIndex] = useState(activeIndex);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(true);
  const [themeClass, setThemeClass] = useState("theme-dark");
  const [imgLoaded, setImgLoaded] = useState(false);

  const stageRef = useRef(null);
  const thumbRailRef = useRef(null);

  /* ── Theme detect ── */
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const body = document.body;
    if (el.classList.contains("theme-light") || body.classList.contains("theme-light")) {
      setThemeClass("theme-light");
    } else if (el.classList.contains("theme-dark") || body.classList.contains("theme-dark")) {
      setThemeClass("theme-dark");
    } else {
      const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
      setThemeClass(prefersLight ? "theme-light" : "theme-dark");
    }
  }, [open]);

  /* ── Sync index ── */
  useEffect(() => {
    if (open) {
      setIndex(activeIndex);
      setZoom(false);
      setImgLoaded(false);
    }
  }, [open, activeIndex]);

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* ── Keyboard nav ── */
  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    const next = (index - 1 + images.length) % images.length;
    setIndex(next);
    onIndexChange?.(next);
    setZoom(false);
    setImgLoaded(false);
  }, [index, images.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    const next = (index + 1) % images.length;
    setIndex(next);
    onIndexChange?.(next);
    setZoom(false);
    setImgLoaded(false);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext, onClose]);

  /* ── Mouse move = zoom follow ── */
  const handleMouseMove = (e) => {
    if (!zoom || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  /* ── Thumb strip scroll ── */
  const scrollThumbs = (dir) => {
    const el = thumbRailRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * 240, behavior: "smooth" });
  };

  const hasMultiple = images.length > 1;

  return (
    <AnimatePresence>
      {open && (
        <div className={themeClass} style={{ position: "fixed", inset: 0, zIndex: 100000 }}>
          {/* ═════ BACKDROP ═════ */}
          <motion.div
            key="zoom-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.92)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* ═════ SHELL ═════ */}
          <motion.div
            key="zoom-shell"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            style={{
              position: "absolute", inset: 0,
              display: "grid",
              gridTemplateColumns: "88px 1fr",
              color: "#fff",
              pointerEvents: "none",
            }}
          >
            {/* ── TOP BAR ── */}
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0,
                zIndex: 5, pointerEvents: "auto",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                {/* Alibaba-style brand */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em",
                }}>
                  <span style={{ color: "#ff6a00" }}>APNa</span>
                  <span style={{ color: "#fff" }}>Deal</span>
                </div>

                {/* Find similar */}
                {onFindSimilar && (
                  <button
                    type="button"
                    onClick={onFindSimilar}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 14px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 999, color: "#fff",
                      fontSize: 13, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <FaSearchPlus style={{ fontSize: 12 }} /> Find similar
                  </button>
                )}
              </div>

              {/* Counter */}
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {index + 1} / {images.length}
              </div>

              {/* Right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {onToggleFav && (
                  <button
                    type="button"
                    onClick={onToggleFav}
                    aria-label="Favorite"
                    style={{
                      width: 38, height: 38, borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: isFav ? "#ef4444" : "#fff",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {isFav ? <FaHeart /> : <FaRegHeart />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFullscreen((f) => !f)}
                  aria-label="Fullscreen"
                  style={{
                    width: 38, height: 38, borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {fullscreen ? <FaCompress /> : <FaExpand />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    width: 42, height: 42, borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 18,
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* ── LEFT THUMB RAIL ── */}
            {hasMultiple && (
              <div
                style={{
                  position: "relative",
                  zIndex: 4,
                  pointerEvents: "auto",
                  paddingTop: 78,
                  paddingBottom: 24,
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => scrollThumbs(-1)}
                  aria-label="Scroll up"
                  style={{
                    width: 30, height: 30, borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaChevronUp style={{ fontSize: 11 }} />
                </button>

                <div
                  ref={thumbRailRef}
                  className="no-scrollbar"
                  style={{
                    flex: 1, minHeight: 0, overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: 8,
                    paddingRight: 2,
                  }}
                >
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        onIndexChange?.(i);
                        setZoom(false);
                        setImgLoaded(false);
                      }}
                      style={{
                        width: 64, height: 64, flexShrink: 0,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: i === index
                          ? "2px solid #ff6a00"
                          : "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(255,255,255,0.05)",
                        cursor: "pointer",
                        padding: 0,
                        opacity: i === index ? 1 : 0.75,
                        transition: "opacity 0.15s ease, border-color 0.15s ease",
                      }}
                    >
                      <img
                        src={img}
                        alt={`thumb-${i}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollThumbs(1)}
                  aria-label="Scroll down"
                  style={{
                    width: 30, height: 30, borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaChevronDown style={{ fontSize: 11 }} />
                </button>
              </div>
            )}

            {/* ── MAIN STAGE ── */}
            <div
              style={{
                position: "relative",
                zIndex: 3,
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: hasMultiple ? "78px 80px 40px 20px" : "78px 80px 40px 80px",
                overflow: "hidden",
              }}
            >
              {/* Prev / Next arrows */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous"
                    style={{
                      position: "absolute", left: hasMultiple ? 100 : 24, top: "50%",
                      transform: "translateY(-50%)",
                      width: 48, height: 48, borderRadius: 999,
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "#fff",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", zIndex: 5,
                    }}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next"
                    style={{
                      position: "absolute", right: 24, top: "50%",
                      transform: "translateY(-50%)",
                      width: 48, height: 48, borderRadius: 999,
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "#fff",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", zIndex: 5,
                    }}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}

              {/* Zoom stage */}
              <div
                ref={stageRef}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                onMouseMove={handleMouseMove}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: zoom ? "zoom-out" : "zoom-in",
                  overflow: "hidden",
                }}
              >
                {/* Base image */}
                <img
                  key={images[index]}
                  src={images[index]}
                  alt={title || `image-${index + 1}`}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: 8,
                    boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)",
                    transition: "opacity 0.25s ease",
                    opacity: imgLoaded ? 1 : 0,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />

                {/* Zoom lens — reduced zoom (was 220%, now uses ZOOM_SCALE) */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    opacity: zoom ? 1 : 0,
                    transition: "opacity 0.15s ease",
                    backgroundImage: `url(${images[index]})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${ZOOM_SCALE}% ${ZOOM_SCALE}%`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    borderRadius: 8,
                  }}
                />

                {/* Zoom hint */}
                {!zoom && imgLoaded && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 20, left: "50%", transform: "translateX(-50%)",
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 14px",
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 999,
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 12, fontWeight: 600,
                      pointerEvents: "none",
                    }}
                  >
                    <FaSearchPlus style={{ fontSize: 11 }} />
                    Hover to zoom
                  </div>
                )}

                {/* Loading shimmer */}
                {!imgLoaded && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 42, height: 42, borderRadius: 999,
                        border: "3px solid rgba(255,255,255,0.15)",
                        borderTopColor: "#ff6a00",
                        animation: "zoomSpin 0.8s linear infinite",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── KEYFRAMES ── */}
            <style>{`
              @keyframes zoomSpin { to { transform: rotate(360deg); } }
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
              @media (max-width: 768px) {
                .no-scrollbar::-webkit-scrollbar { display: none; }
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImageZoomViewer;