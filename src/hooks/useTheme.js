// src/hooks/useTheme.js
// Single source of truth for theme. Reads/writes localStorage,
// applies BOTH `theme-dark`/`theme-light` (your app's system) AND
// `dark` (Tailwind's `dark:` variant system) to <html>.
import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "theme";

/* Apply the theme classes to <html>. Safe to call anytime. */
function applyThemeToDOM(theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("theme-light", "theme-dark", "dark");
  if (theme === "light") {
    html.classList.add("theme-light");
  } else {
    // Dark is default — add both so Tailwind dark: AND your CSS vars work
    html.classList.add("theme-dark", "dark");
  }
  html.style.colorScheme = theme === "light" ? "light" : "dark";
}

/* Read persisted theme (falls back to dark). */
function readStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStoredTheme);

  // Apply on mount AND every time theme changes.
  // Also keeps localStorage in sync so refresh is consistent.
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  // Sync across tabs / windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}

/* Optional: call once at app boot (outside React) to avoid a flash. */
export function initThemeFromStorage() {
  applyThemeToDOM(readStoredTheme());
}