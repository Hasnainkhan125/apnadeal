// src/contexts/LocaleContext.jsx — Language & Currency (global, persisted, translated)
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { TRANSLATIONS, RTL_LANGUAGES } from "../lib/translations";

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE + CURRENCY CATALOG
   ═══════════════════════════════════════════════════════════════ */
export const LANGUAGES = [
  { code: "en", label: "English",              flag: "🇬🇧" },
  { code: "ur", label: "اردو (Urdu)",          flag: "🇵🇰", rtl: true },
  { code: "ar", label: "العربية (Arabic)",     flag: "🇸🇦", rtl: true },
  { code: "hi", label: "हिन्दी (Hindi)",       flag: "🇮🇳" },
  { code: "zh", label: "中文 (Chinese)",       flag: "🇨🇳" },
  { code: "es", label: "Español (Spanish)",    flag: "🇪🇸" },
  { code: "fr", label: "Français (French)",    flag: "🇫🇷" },
  { code: "de", label: "Deutsch (German)",     flag: "🇩🇪" },
  { code: "tr", label: "Türkçe (Turkish)",     flag: "🇹🇷" },
];

export const CURRENCIES = [
  { code: "PKR", symbol: "Rs",  label: "PKR - Pakistani Rupee",   flag: "🇵🇰", country: "PK", locale: "en-PK", style: "south-asian" },
  { code: "USD", symbol: "$",   label: "USD - US Dollar",         flag: "🇺🇸", country: "US", locale: "en-US", style: "western" },
  { code: "EUR", symbol: "€",   label: "EUR - Euro",              flag: "🇪🇺", country: "EU", locale: "de-DE", style: "western" },
  { code: "GBP", symbol: "£",   label: "GBP - British Pound",     flag: "🇬🇧", country: "GB", locale: "en-GB", style: "western" },
  { code: "INR", symbol: "₹",   label: "INR - Indian Rupee",      flag: "🇮🇳", country: "IN", locale: "en-IN", style: "south-asian" },
  { code: "AED", symbol: "AED", label: "AED - UAE Dirham",        flag: "🇦🇪", country: "AE", locale: "en-AE", style: "western" },
  { code: "SAR", symbol: "SAR", label: "SAR - Saudi Riyal",       flag: "🇸🇦", country: "SA", locale: "en-SA", style: "western" },
  { code: "CAD", symbol: "C$",  label: "CAD - Canadian Dollar",   flag: "🇨🇦", country: "CA", locale: "en-CA", style: "western" },
  { code: "AUD", symbol: "A$",  label: "AUD - Australian Dollar", flag: "🇦🇺", country: "AU", locale: "en-AU", style: "western" },
  { code: "JPY", symbol: "¥",   label: "JPY - Japanese Yen",      flag: "🇯🇵", country: "JP", locale: "ja-JP", style: "western" },
  { code: "CNY", symbol: "¥",   label: "CNY - Chinese Yuan",      flag: "🇨🇳", country: "CN", locale: "zh-CN", style: "western" },
  { code: "MYR", symbol: "RM",  label: "MYR - Malaysian Ringgit", flag: "🇲🇾", country: "MY", locale: "ms-MY", style: "western" },
  { code: "SGD", symbol: "S$",  label: "SGD - Singapore Dollar",  flag: "🇸🇬", country: "SG", locale: "en-SG", style: "western" },
  { code: "IDR", symbol: "Rp",  label: "IDR - Indonesian Rupiah", flag: "🇮🇩", country: "ID", locale: "id-ID", style: "western" },
  { code: "TRY", symbol: "₺",   label: "TRY - Turkish Lira",      flag: "🇹🇷", country: "TR", locale: "tr-TR", style: "western" },
  { code: "EGP", symbol: "E£",  label: "EGP - Egyptian Pound",    flag: "🇪🇬", country: "EG", locale: "en-EG", style: "western" },
  { code: "NGN", symbol: "₦",   label: "NGN - Nigerian Naira",    flag: "🇳🇬", country: "NG", locale: "en-NG", style: "western" },
  { code: "ZAR", symbol: "R",   label: "ZAR - South African Rand",flag: "🇿🇦", country: "ZA", locale: "en-ZA", style: "western" },
  { code: "BRL", symbol: "R$",  label: "BRL - Brazilian Real",    flag: "🇧🇷", country: "BR", locale: "pt-BR", style: "western" },
  { code: "MXN", symbol: "MX$", label: "MXN - Mexican Peso",      flag: "🇲🇽", country: "MX", locale: "es-MX", style: "western" },
  { code: "RUB", symbol: "₽",   label: "RUB - Russian Ruble",     flag: "🇷🇺", country: "RU", locale: "ru-RU", style: "western" },
];

/* ═══════════════════════════════════════════════════════════════
   AUTO-DETECT helpers
   ═══════════════════════════════════════════════════════════════ */
const TZ_TO_COUNTRY = {
  "Asia/Karachi": "PK", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK", "America/New_York": "US", "America/Chicago": "US",
  "America/Denver": "US", "America/Los_Angeles": "US", "America/Phoenix": "US",
  "America/Anchorage": "US", "Pacific/Honolulu": "US", "America/Toronto": "CA",
  "America/Vancouver": "CA", "Europe/London": "GB", "Europe/Berlin": "EU",
  "Europe/Paris": "EU", "Europe/Rome": "EU", "Europe/Madrid": "EU",
  "Europe/Amsterdam": "EU", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN", "Asia/Kuala_Lumpur": "MY", "Asia/Singapore": "SG",
  "Asia/Jakarta": "ID", "Europe/Istanbul": "TR", "Africa/Cairo": "EG",
  "Africa/Lagos": "NG", "Africa/Johannesburg": "ZA", "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX", "Europe/Moscow": "RU",
};

const detectCountry = () => {
  try {
    if (typeof window === "undefined") return "US";
    const tz = Intl?.DateTimeFormat?.().resolvedOptions?.()?.timeZone;
    if (tz && TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];
    const langs = [...(navigator?.languages || []), navigator?.language].filter(Boolean);
    for (const lang of langs) {
      const m = String(lang).match(/[-_]([A-Z]{2})$/);
      if (m && CURRENCIES.find((c) => c.country === m[1])) return m[1];
    }
    return "US";
  } catch { return "US"; }
};

const detectLanguage = () => {
  try {
    const langs = [...(navigator?.languages || []), navigator?.language].filter(Boolean);
    for (const lang of langs) {
      const base = String(lang).toLowerCase().split(/[-_]/)[0];
      if (LANGUAGES.find((l) => l.code === base)) return base;
    }
    return "en";
  } catch { return "en"; }
};

/* ═══════════════════════════════════════════════════════════════
   STORAGE KEYS + CONTEXT
   ═══════════════════════════════════════════════════════════════ */
const LS_LANG = "apna.locale.language";
const LS_CUR  = "apna.locale.currency";

const readLS = (k, fallback = null) => {
  try { return localStorage.getItem(k) || fallback; } catch { return fallback; }
};
const writeLS = (k, v) => {
  try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch {}
};

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children }) => {
  /* ── Currency: saved → detected → PKR ── */
  const [currency, setCurrencyState] = useState(() => {
    const saved = readLS(LS_CUR);
    if (saved) {
      const found = CURRENCIES.find((c) => c.code === saved);
      if (found) return found;
    }
    const detected = detectCountry();
    const found = CURRENCIES.find((c) => c.country === detected);
    return found || CURRENCIES[0];
  });

  /* ── Language: saved → detected → en ── */
  const [language, setLanguageState] = useState(() => {
    const saved = readLS(LS_LANG);
    if (saved && LANGUAGES.find((l) => l.code === saved)) return saved;
    return detectLanguage();
  });

  /* ── ⭐ Auto-apply `dir` + `lang` to <html> ── */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const isRTL = RTL_LANGUAGES.includes(language);
    html.setAttribute("lang", language);
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.dataset.locale = language;
  }, [language]);

  const setCurrency = useCallback((code) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (!found) return;
    setCurrencyState(found);
    writeLS(LS_CUR, code);
    window.dispatchEvent(new CustomEvent("locale:currency-changed", { detail: found }));
  }, []);

  const setLanguage = useCallback((code) => {
    if (!LANGUAGES.find((l) => l.code === code)) return;
    setLanguageState(code);
    writeLS(LS_LANG, code);
    window.dispatchEvent(new CustomEvent("locale:language-changed", { detail: { code } }));
  }, []);

  /* ── ⭐ Translation function ── */
  const t = useCallback(
    (key, fallback) => {
      const langStrings = TRANSLATIONS[language] || {};
      const enStrings = TRANSLATIONS.en || {};
      return langStrings[key] ?? enStrings[key] ?? fallback ?? key;
    },
    [language]
  );

  const value = useMemo(() => ({
    currency,
    language,
    setCurrency,
    setLanguage,
    t,                                       // ⭐ translation fn
    isRTL: RTL_LANGUAGES.includes(language), // ⭐ rtl flag
    currencyCode: currency?.code,
    currencySymbol: currency?.symbol,
    languageLabel: LANGUAGES.find((l) => l.code === language)?.label || "English",
    languageFlag: LANGUAGES.find((l) => l.code === language)?.flag || "🇬🇧",
    CURRENCIES, LANGUAGES,

    /** Format a number in the current currency (auto Lakh/Crore for PKR/INR) */
    format: (num) => {
      const n = Number(num) || 0;
      if (!currency) return n.toLocaleString("en-US");
      if (currency.style === "south-asian") {
        if (n >= 10000000) { const c = n / 10000000; return `${currency.symbol}.${c % 1 === 0 ? c.toFixed(0) : c.toFixed(2).replace(/\.?0+$/, "")} Cr`; }
        if (n >= 100000)    { const l = n / 100000;    return `${currency.symbol}.${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2).replace(/\.?0+$/, "")} Lac`; }
        return `${currency.symbol}.${n.toLocaleString("en-US")}`;
      }
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: "currency", currency: currency.code, maximumFractionDigits: 0,
        }).format(n);
      } catch {
        return `${currency.symbol}${n.toLocaleString("en-US")}`;
      }
    },
  }), [currency, language, setCurrency, setLanguage, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  // ⭐ Safe fallback if provider isn't mounted
  if (!ctx) {
    return {
      currency: CURRENCIES[0],
      language: "en",
      setCurrency: () => {},
      setLanguage: () => {},
      t: (key, fallback) => TRANSLATIONS.en?.[key] ?? fallback ?? key,
      isRTL: false,
      currencyCode: CURRENCIES[0].code,
      currencySymbol: CURRENCIES[0].symbol,
      languageLabel: "English",
      languageFlag: "🇬🇧",
      CURRENCIES, LANGUAGES,
      format: (num) => `${CURRENCIES[0].symbol}.${Number(num || 0).toLocaleString("en-US")}`,
    };
  }
  return ctx;
};

export default LocaleContext;