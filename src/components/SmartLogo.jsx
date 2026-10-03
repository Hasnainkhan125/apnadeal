// src/components/SmartLogo.jsx
// ⭐ Drop-in logo with automatic dark-mode filter
import React, { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
   Detect if we're in dark mode — checks <html> AND <body>
   Works with: theme-dark, theme-light, dark, light
   Also checks localStorage as fallback
   ═══════════════════════════════════════════════════════════════ */
export const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    const h = document.documentElement;
    const b = document.body;
    if (h.classList.contains("theme-dark") || h.classList.contains("dark")) return true;
    if (b.classList.contains("theme-dark") || b.classList.contains("dark")) return true;
    if (h.classList.contains("theme-light") || h.classList.contains("light")) return false;
    if (b.classList.contains("theme-light") || b.classList.contains("light")) return false;
    try {
      const saved = localStorage.getItem("theme") || localStorage.getItem("app-theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;
    } catch {}
    return false;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => {
      const h = document.documentElement;
      const b = document.body;
      let dark = false;
      if (h.classList.contains("theme-dark") || h.classList.contains("dark")) dark = true;
      else if (b.classList.contains("theme-dark") || b.classList.contains("dark")) dark = true;
      else if (h.classList.contains("theme-light") || h.classList.contains("light")) dark = false;
      else if (b.classList.contains("theme-light") || b.classList.contains("light")) dark = false;
      else {
        try {
          const saved = localStorage.getItem("theme") || localStorage.getItem("app-theme");
          dark = saved === "dark";
        } catch {}
      }
      setIsDark(dark);
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    obs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
};

/* ═══════════════════════════════════════════════════════════════
   <SmartLogo /> — displays logo + auto dark-mode filter
   Props:
     - size      number  → height in px (default 28)
     - sources   array   → fallback URLs (default ["/logo.png", ...])
     - mode      string  → "invert" (default) | "white" | "none"
     - className string
     - style     object  → extra inline styles
     - alt       string
   ═══════════════════════════════════════════════════════════════ */
const SmartLogo = ({
  size = 28,
  sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg", "/logo.webp"],
  mode = "invert",
  className = "",
  style = {},
  alt = "Logo",
  fallbackText = "Dealora",
}) => {
  const isDark = useIsDarkMode();
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  /* ── Fallback pill ── */
  if (failed) {
    return (
      <div
        className={className}
        style={{
          height: size,
          minWidth: size,
          padding: "0 10px",
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eb7d34, #f59e0b)",
          color: "#fff",
          fontWeight: 900,
          fontSize: Math.max(11, size * 0.55),
          letterSpacing: "-0.02em",
          flexShrink: 0,
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {fallbackText}
      </div>
    );
  }

  /* ── Filter per mode ── */
  const getFilter = () => {
    if (!isDark) return "none";
    if (mode === "white")  return "brightness(0) invert(1)";
    if (mode === "none")   return "none";
    /* default: invert + hue-rotate → same-as-light appearance */
    return "invert(1) hue-rotate(180deg) brightness(1.1)";
  };

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
        filter: getFilter(),
        transition: "filter 0.3s ease",
        ...style,
      }}
    />
  );
};

export default SmartLogo;