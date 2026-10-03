// src/components/AIPageShell.jsx — Wraps any AI page with the shared rail sidebar
import React, { useState, useEffect } from "react";
import AIRailSidebar from "../pages/AIRailSidebar";

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

const AIPageShell = ({ children }) => {
  const isMobile = useMediaQuery("(max-width: 900px)");

  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
  });

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

  const isLight = theme === "light";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        /* ═══ Full viewport height ═══ */
        minHeight: "100vh",
        height: isMobile ? "auto" : "100vh",
        background: isLight ? "#FFFFFF" : "#0A0A12",
        /* ═══ Only hide overflow on desktop; allow mobile body scroll ═══ */
        overflow: isMobile ? "visible" : "hidden",
        position: "relative",
      }}
    >
      <AIRailSidebar theme={theme} onToggleTheme={toggleTheme} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          /* ═══ Desktop: fixed height + vertical scroll ═══
             Mobile: natural flow (browser handles scroll)  */
          height: isMobile ? "auto" : "100vh",
          overflowY: isMobile ? "visible" : "auto",
          overflowX: "hidden",
          position: "relative",
          WebkitOverflowScrolling: "touch",
          /* ═══ Smooth scroll on all browsers ═══ */
          scrollBehavior: "smooth",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AIPageShell;