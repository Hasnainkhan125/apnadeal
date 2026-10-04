import React, { useState } from "react";
import { useTranslation } from "../lib/i18n";
import { FaGlobe, FaCheck, FaChevronDown, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LanguageSwitcher = ({ variant = "dropdown" }) => {
  const { lang, setLang, currency, setCurrency, t, languages, currencies } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("language");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors"
        style={{
          background: "var(--nav-panel)",
          border: "1px solid var(--nav-line)",
          color: "var(--nav-txt)",
        }}
      >
        <FaGlobe className="text-[12px]" style={{ color: "var(--nav-primary, #E86A22)" }} />
        <span>{languages.find((l) => l.code === lang)?.nativeName || "English"}</span>
        <FaChevronDown className="text-[9px] opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[80]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              className="absolute end-0 mt-2 z-[90] w-[280px] rounded-2xl overflow-hidden shadow-[0_16px_48px_-12px_rgba(0,0,0,0.35)]"
              style={{
                background: "var(--nav-panel)",
                border: "1px solid var(--nav-line)",
              }}
            >
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1.5" style={{ borderBottom: "1px solid var(--nav-line)" }}>
                {[
                  { id: "language", label: t("language") },
                  { id: "currency", label: t("currency") },
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTab(tb.id)}
                    className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-colors"
                    style={{
                      background: tab === tb.id ? "var(--nav-primary-soft, #FFF2EA)" : "transparent",
                      color: tab === tb.id ? "var(--nav-primary, #E86A22)" : "var(--nav-txt-soft, #6B7280)",
                    }}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="max-h-[320px] overflow-y-auto py-1">
                {tab === "language"
                  ? languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-[var(--nav-primary-soft)]"
                        style={{ color: "var(--nav-txt)" }}
                      >
                        <span className="text-[18px] flex-shrink-0">{l.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate">{l.nativeName}</p>
                          <p className="text-[10.5px] truncate" style={{ color: "var(--nav-txt-soft)" }}>{l.name} · {l.dir.toUpperCase()}</p>
                        </div>
                        {lang === l.code && <FaCheck className="text-[11px]" style={{ color: "var(--nav-primary, #E86A22)" }} />}
                      </button>
                    ))
                  : Object.values(currencies).map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code); setOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-[var(--nav-primary-soft)]"
                        style={{ color: "var(--nav-txt)" }}
                      >
                        <span className="text-[16px] font-bold w-7 text-center flex-shrink-0" style={{ color: "var(--nav-primary, #E86A22)" }}>{c.symbol}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate">{c.code}</p>
                          <p className="text-[10.5px] truncate" style={{ color: "var(--nav-txt-soft)" }}>{c.name}</p>
                        </div>
                        {currency === c.code && <FaCheck className="text-[11px]" style={{ color: "var(--nav-primary, #E86A22)" }} />}
                      </button>
                    ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;