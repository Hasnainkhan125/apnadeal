// src/lib/i18n.jsx — Global i18n provider (Urdu + all languages)
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { TRANSLATIONS, RTL_LANGUAGES } from "./translations";

/* ═══════════════════════════════════════════════════════════════
   Currency config
   ═══════════════════════════════════════════════════════════════ */
export const CURRENCIES = {
  PKR: { code: "PKR", symbol: "Rs",   name: "Pakistani Rupee",   locale: "en-PK" },
  USD: { code: "USD", symbol: "$",    name: "US Dollar",         locale: "en-US" },
  EUR: { code: "EUR", symbol: "€",    name: "Euro",              locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£",    name: "British Pound",     locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ",  name: "UAE Dirham",        locale: "ar-AE" },
  SAR: { code: "SAR", symbol: "﷼",    name: "Saudi Riyal",       locale: "ar-SA" },
  INR: { code: "INR", symbol: "₹",    name: "Indian Rupee",      locale: "en-IN" },
  CNY: { code: "CNY", symbol: "¥",    name: "Chinese Yuan",      locale: "zh-CN" },
  TRY: { code: "TRY", symbol: "₺",    name: "Turkish Lira",      locale: "tr-TR" },
};

export const LANGUAGES = [
  { code: "en", name: "English",  nativeName: "English",  dir: "ltr", flag: "🇬🇧" },
  { code: "ur", name: "Urdu",     nativeName: "اردو",      dir: "rtl", flag: "🇵🇰" },
  { code: "ar", name: "Arabic",   nativeName: "العربية",   dir: "rtl", flag: "🇸🇦" },
  { code: "hi", name: "Hindi",    nativeName: "हिन्दी",    dir: "ltr", flag: "🇮🇳" },
  { code: "zh", name: "Chinese",  nativeName: "中文",      dir: "ltr", flag: "🇨🇳" },
  { code: "es", name: "Spanish",  nativeName: "Español",  dir: "ltr", flag: "🇪🇸" },
  { code: "fr", name: "French",   nativeName: "Français", dir: "ltr", flag: "🇫🇷" },
  { code: "de", name: "German",   nativeName: "Deutsch",  dir: "ltr", flag: "🇩🇪" },
  { code: "tr", name: "Turkish",  nativeName: "Türkçe",   dir: "ltr", flag: "🇹🇷" },
];

/* ═══════════════════════════════════════════════════════════════
   Context
   ═══════════════════════════════════════════════════════════════ */
const I18nContext = createContext(null);

const STORAGE_LANG = "app-language";
const STORAGE_CURRENCY = "app-currency";

const getInitialLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved && TRANSLATIONS[saved]) return saved;
    const browser = (navigator.language || "en").split("-")[0];
    if (TRANSLATIONS[browser]) return browser;
  } catch {}
  return "en";
};

const getInitialCurrency = () => {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENCY);
    if (saved && CURRENCIES[saved]) return saved;
  } catch {}
  return "PKR";
};

/* ═══════════════════════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════════════════════ */
export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(getInitialLang);
  const [currency, setCurrencyState] = useState(getInitialCurrency);

  /* ── Sync <html> attributes when language or currency changes ── */
  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", dir);
    html.setAttribute("data-lang", lang);
    html.setAttribute("data-dir", dir);
    html.setAttribute("data-currency", currency);

    document.body.classList.toggle("is-rtl", dir === "rtl");
    document.body.classList.toggle("is-ltr", dir === "ltr");
  }, [lang, currency]);

  /* ── Persist to localStorage ── */
  const setLang = useCallback((next) => {
    if (!TRANSLATIONS[next]) next = "en";
    setLangState(next);
    try { localStorage.setItem(STORAGE_LANG, next); } catch {}
    window.dispatchEvent(new CustomEvent("app-language-changed", { detail: next }));
  }, []);

  const setCurrency = useCallback((next) => {
    if (!CURRENCIES[next]) next = "PKR";
    setCurrencyState(next);
    try { localStorage.setItem(STORAGE_CURRENCY, next); } catch {}
    window.dispatchEvent(new CustomEvent("app-currency-changed", { detail: next }));
  }, []);

  /* ── Translation function with English fallback ── */
  const t = useCallback((key, vars) => {
    if (!key) return "";
    const dict = TRANSLATIONS[lang] || {};
    const fallback = TRANSLATIONS.en || {};
    let str = dict[key] ?? fallback[key] ?? key;
    if (vars && typeof vars === "object") {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return str;
  }, [lang]);

  /* ── Format currency ── */
  const fmtCurrency = useCallback((amount, opts = {}) => {
    const n = Number(amount) || 0;
    const cur = CURRENCIES[currency] || CURRENCIES.PKR;
    if (opts.compact) {
      if (n >= 10000000) return `${cur.symbol} ${(n / 10000000).toFixed(n % 10000000 ? 2 : 0).replace(/\.?0+$/, "")} Cr`;
      if (n >= 100000)   return `${cur.symbol} ${(n / 100000).toFixed(n % 100000 ? 2 : 0).replace(/\.?0+$/, "")} Lac`;
      if (n >= 1000)     return `${cur.symbol} ${(n / 1000).toFixed(n % 1000 ? 1 : 0).replace(/\.?0+$/, "")}k`;
    }
    try {
      return new Intl.NumberFormat(cur.locale, {
        style: "currency",
        currency: cur.code,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${cur.symbol} ${n.toLocaleString()}`;
    }
  }, [currency]);

  /* ── Format number ── */
  const fmtNumber = useCallback((n, opts = {}) => {
    try {
      const locale = CURRENCIES[currency]?.locale || "en-US";
      return new Intl.NumberFormat(locale, opts).format(Number(n) || 0);
    } catch {
      return String(Number(n) || 0);
    }
  }, [currency]);

  /* ── Format date ── */
  const fmtDate = useCallback((date, opts = {}) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      const cur = CURRENCIES[currency] || CURRENCIES.PKR;
      return new Intl.DateTimeFormat(cur.locale, {
        year: "numeric", month: "short", day: "numeric",
        ...opts,
      }).format(d);
    } catch {
      return String(date);
    }
  }, [currency]);

  const value = useMemo(() => ({
    lang,
    setLang,
    currency,
    setCurrency,
    t,
    fmtCurrency,
    fmtNumber,
    fmtDate,
    isRTL: RTL_LANGUAGES.includes(lang),
    dir: RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr",
    languages: LANGUAGES,
    currencies: CURRENCIES,
  }), [lang, currency, t, fmtCurrency, fmtNumber, fmtDate, setLang, setCurrency]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/* ═══════════════════════════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════════════════════════ */
export const useTranslation = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback if used outside provider
    return {
      lang: "en",
      setLang: () => {},
      currency: "PKR",
      setCurrency: () => {},
      t: (k) => TRANSLATIONS.en[k] ?? k,
      fmtCurrency: (n) => `Rs ${Number(n || 0).toLocaleString()}`,
      fmtNumber: (n) => String(Number(n) || 0),
      fmtDate: (d) => String(d),
      isRTL: false,
      dir: "ltr",
      languages: LANGUAGES,
      currencies: CURRENCIES,
    };
  }
  return ctx;
};

/* Shorthand — just the translator */
export const useT = () => useTranslation().t;