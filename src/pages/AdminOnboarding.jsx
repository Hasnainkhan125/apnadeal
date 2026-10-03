// src/pages/AdminOnboarding.jsx — Modern Property-Dashboard-style onboarding editor
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaCrown, FaSave, FaSync, FaPlus, FaTrashAlt,
  FaImage, FaFileAlt, FaToggleOn, FaToggleOff, FaUpload,
  FaCheck, FaExclamationTriangle, FaEye, FaSpinner,
  FaGripVertical, FaLayerGroup, FaPaintBrush, FaInfoCircle,
  FaChevronDown, FaLightbulb, FaClock, FaTag, FaAlignLeft,
  FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useOnboarding } from "../contexts/OnboardingContext";
import {
  DEFAULT_SECTIONS,
  saveOnboardingConfig,
  uploadOnboardingImage,
} from "../lib/onboarding";

/* ═══════════════════════════════════════════════════════════════
   STYLES — Reuses the AdminDashboard theme tokens (ad-*)
   ═══════════════════════════════════════════════════════════════ */
const AdminOnboardingStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ── Fallback tokens in case this page is opened standalone ── */
    .theme-dark {
      --ao-bg-1:#0A0A12; --ao-card:#14141E; --ao-card-2:#1A1A24;
      --ao-line:rgba(255,255,255,0.07); --ao-line-str:rgba(255,255,255,0.14);
      --ao-txt:#FFFFFF; --ao-txt-soft:rgba(255,255,255,0.62); --ao-txt-faint:rgba(255,255,255,0.42);
      --ao-amber:#fc9d03; --ao-amber-3:#eb7d34;
      --ao-amber-soft:rgba(252,157,3,0.14); --ao-amber-glow:rgba(252,157,3,0.45);
      --ao-danger:#E2795F; --ao-danger-soft:rgba(226,121,95,0.14);
      --ao-success:#3fa77f; --ao-success-soft:rgba(63,167,127,0.10);
    }
    .theme-light {
      --ao-bg-1:#F5F7F4; --ao-card:#FFFFFF; --ao-card-2:#F8FAF7;
      --ao-line:rgba(20,20,30,0.08); --ao-line-str:rgba(20,20,30,0.14);
      --ao-txt:#0F1115; --ao-txt-soft:rgba(15,17,21,0.62); --ao-txt-faint:rgba(15,17,21,0.42);
      --ao-amber:#e08900; --ao-amber-3:#eb7d34;
      --ao-amber-soft:rgba(224,137,0,0.10); --ao-amber-glow:rgba(224,137,0,0.35);
      --ao-danger:#DC2626; --ao-danger-soft:rgba(220,38,38,0.08);
      --ao-success:#16A34A; --ao-success-soft:rgba(22,163,74,0.10);
    }

    /* If embedded in AdminDashboard, prefer its tokens (ad-*) when available */
    .admin-embedded.theme-dark {
      --ao-bg-1: var(--ad-bg, #0A0A12);
      --ao-card: var(--ad-card, #14141E);
      --ao-card-2: var(--ad-card-2, #1A1A24);
      --ao-line: var(--ad-line, rgba(255,255,255,0.07));
      --ao-line-str: var(--ad-line-str, rgba(255,255,255,0.14));
      --ao-txt: var(--ad-txt, #FFFFFF);
      --ao-txt-soft: var(--ad-txt-soft, rgba(255,255,255,0.62));
      --ao-txt-faint: var(--ad-txt-faint, rgba(255,255,255,0.42));
      --ao-amber: var(--ad-amber, #fc9d03);
      --ao-amber-3: var(--ad-amber-3, #eb7d34);
      --ao-amber-soft: var(--ad-amber-soft, rgba(252,157,3,0.14));
      --ao-amber-glow: var(--ad-amber-glow, rgba(252,157,3,0.45));
      --ao-danger: var(--ad-danger, #E2795F);
      --ao-danger-soft: var(--ad-danger-soft, rgba(226,121,95,0.14));
      --ao-success: var(--ad-success, #3fa77f);
      --ao-success-soft: var(--ad-success-soft, rgba(63,167,127,0.10));
    }
    .admin-embedded.theme-light {
      --ao-bg-1: var(--ad-bg, #F5F7F4);
      --ao-card: var(--ad-card, #FFFFFF);
      --ao-card-2: var(--ad-card-2, #F8FAF7);
      --ao-line: var(--ad-line, rgba(20,20,30,0.08));
      --ao-line-str: var(--ad-line-str, rgba(20,20,30,0.14));
      --ao-txt: var(--ad-txt, #0F1115);
      --ao-txt-soft: var(--ad-txt-soft, rgba(15,17,21,0.62));
      --ao-txt-faint: var(--ad-txt-faint, rgba(15,17,21,0.42));
      --ao-amber: var(--ad-amber, #e08900);
      --ao-amber-3: var(--ad-amber-3, #eb7d34);
      --ao-amber-soft: var(--ad-amber-soft, rgba(224,137,0,0.10));
      --ao-amber-glow: var(--ad-amber-glow, rgba(224,137,0,0.35));
      --ao-danger: var(--ad-danger, #DC2626);
      --ao-danger-soft: var(--ad-danger-soft, rgba(220,38,38,0.08));
      --ao-success: var(--ad-success, #16A34A);
      --ao-success-soft: var(--ad-success-soft, rgba(22,163,74,0.10));
    }

    .ao-bg {
      background: var(--ao-bg-1);
      color: var(--ao-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .ao-card {
      background: var(--ao-card);
      border: 1px solid var(--ao-line);
      border-radius: 22px;
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .ao-card-2 {
      background: var(--ao-card-2);
      border: 1px solid var(--ao-line);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .ao-input {
      background: var(--ao-card-2);
      color: var(--ao-txt);
      border: 1px solid var(--ao-line);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .ao-input:focus {
      border-color: var(--ao-amber);
      box-shadow: 0 0 0 3px var(--ao-amber-soft);
      outline: none;
    }

    .ao-tile {
      border-radius: 22px;
      padding: 20px;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .ao-tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px -20px rgba(0,0,0,0.25);
    }

    .ao-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
    .ao-scroll::-webkit-scrollbar-track { background: transparent; }
    .ao-scroll::-webkit-scrollbar-thumb {
      background: var(--ao-line-str);
      border-radius: 4px;
    }

    @keyframes ao-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--ao-amber-glow); }
      50%      { transform: scale(1.05); box-shadow: 0 0 0 10px transparent; }
    }
    .ao-pulse { animation: ao-pulse 2s ease-in-out infinite; }
  `}</style>
);

const AdminOnboarding = ({ embedded = false, onToast = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { config, refresh, openManually } = useOnboarding();
  const fileRef = useRef(null);

  const [form, setForm] = useState(config || {});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [showPreviewCard, setShowPreviewCard] = useState(false);

  /* Detect theme */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => {
      const h = document.documentElement;
      setIsDark(
        h.classList.contains("theme-dark") ||
        h.classList.contains("dark") ||
        (!h.classList.contains("theme-light") &&
          (localStorage.getItem("theme") || localStorage.getItem("app-theme")) === "dark")
      );
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const showToast = (msg, type = "success") => {
    if (onToast) return onToast(msg, type);
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateSection = (i, key, value) => {
    setForm((f) => {
      const next = [...(f.sections || [])];
      next[i] = { ...next[i], [key]: value };
      return { ...f, sections: next };
    });
  };

  const addSection = () =>
    setForm((f) => ({
      ...f,
      sections: [...(f.sections || []), { heading: "New section", body: "" }],
    }));

  const removeSection = (i) =>
    setForm((f) => ({
      ...f,
      sections: (f.sections || []).filter((_, idx) => idx !== i),
    }));

  const resetSections = () =>
    setForm((f) => ({ ...f, sections: DEFAULT_SECTIONS }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Max 5MB", "error");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadOnboardingImage(file);
      updateField("image_url", url);
      showToast("Image uploaded", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveOnboardingConfig(
        {
          enabled: !!form.enabled,
          mode: form.mode || "text",
          title: form.title || "",
          subtitle: form.subtitle || "",
          sections: form.sections || [],
          image_url: form.image_url || null,
          cta_label: form.cta_label || "I Understand",
          auto_show_delay: Math.max(0, Number(form.auto_show_delay) || 3000),
          version: Number(form.version) || 1,
        },
        user?.id
      );
      await refresh();
      showToast("Saved successfully", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBumpVersion = async () => {
    const nextVersion = (Number(form.version) || 1) + 1;
    updateField("version", nextVersion);
    try {
      await saveOnboardingConfig(
        {
          enabled: !!form.enabled,
          mode: form.mode || "text",
          title: form.title || "",
          subtitle: form.subtitle || "",
          sections: form.sections || [],
          image_url: form.image_url || null,
          cta_label: form.cta_label || "I Understand",
          auto_show_delay: Math.max(0, Number(form.auto_show_delay) || 3000),
          version: nextVersion,
        },
        user?.id
      );
      await refresh();
      showToast(`Version bumped to v${nextVersion} — all users will see it again`, "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed", "error");
    }
  };

  const sectionCount = (form.sections || []).length;
  const mode = form.mode || "text";

  /* ═══════════════════════════════════════════════════════════════
     RENDER — Embedded (inside AdminDashboard) or Standalone
     ═══════════════════════════════════════════════════════════════ */
  const Wrapper = embedded ? React.Fragment : "div";

  const shellProps = embedded
    ? {}
    : { className: `min-h-screen ao-bg theme-${isDark ? "dark" : "light"} relative` };

  const inner = (
    <>
      <AdminOnboardingStyles />

      {!embedded && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(var(--ao-amber) 0.6px, transparent 0.6px)`,
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
      )}

      <div className={embedded ? "relative z-10" : "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10"}>

        {/* ═══ Header ═══ */}
        {!embedded && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ border: "1px solid var(--ao-line)", color: "var(--ao-txt)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ao-amber)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ao-line)"; }}
              aria-label="Back"
            >
              <FaArrowLeft className="text-xs" />
            </button>
          </div>
        )}

        {/* Page title */}
        <div className="mb-6 flex items-start gap-3 flex-wrap">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--ao-amber) 0%, var(--ao-amber-3) 100%)",
              boxShadow: "0 10px 26px -12px var(--ao-amber-glow)",
            }}
          >
            <FaFileAlt className="text-[14px]" style={{ color: "#0A0A12" }} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-ticket-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Onboarding Instructions
            </h1>
            <p className="font-ticket-body text-[13px] mt-1" style={{ color: "var(--ao-txt-soft)" }}>
              Show a policy page to every user · Edit text · Replace with image
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openManually}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl font-ticket-body text-[11px] font-bold transition-all"
              style={{
                background: "var(--ao-amber-soft)",
                border: "1px solid var(--ao-amber)",
                color: "var(--ao-amber)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ao-amber)";
                e.currentTarget.style.color = "#0A0A12";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--ao-amber-soft)";
                e.currentTarget.style.color = "var(--ao-amber)";
              }}
              title="Preview"
            >
              <FaEye className="text-[10px]" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* ═══ 3-Column layout: main editor + right stats panel ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* ═══ LEFT: editor ═══ */}
          <div className="space-y-4 min-w-0">

            {/* Status tile (cream → themed) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="ao-tile"
              style={{
                background: form.enabled
                  ? "linear-gradient(135deg, #F5E6C8 0%, #FADFC0 100%)"
                  : "var(--ao-card)",
                color: form.enabled ? "#1A1613" : "var(--ao-txt)",
                border: form.enabled ? "none" : "1px solid var(--ao-line)",
              }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => updateField("enabled", !form.enabled)}
                    className={`shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${form.enabled ? "ao-pulse" : ""}`}
                    style={
                      form.enabled
                        ? { background: "#16A34A", color: "#fff" }
                        : { background: "var(--ao-card-2)", color: "var(--ao-txt-soft)", border: "1px solid var(--ao-line)" }
                    }
                    aria-label="Toggle"
                  >
                    {form.enabled ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="font-ticket-display text-base sm:text-lg font-black"
                        style={{ color: form.enabled ? "#1A1613" : "var(--ao-txt)" }}
                      >
                        {form.enabled ? "Live — showing to all users" : "Disabled"}
                      </p>
                      {form.enabled && (
                        <span
                          className="inline-flex items-center gap-1 font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "#16A34A", color: "#fff" }}
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                          </span>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p
                      className="font-ticket-body text-[12px] mt-0.5"
                      style={{ color: form.enabled ? "rgba(26,22,19,0.7)" : "var(--ao-txt-soft)" }}
                    >
                      {form.enabled
                        ? `Shows ${Math.round((form.auto_show_delay || 3000) / 1000)}s after page loads · v${form.version || 1}`
                        : "Turn on to show the instruction page to every user."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleBumpVersion}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                    style={
                      form.enabled
                        ? { background: "rgba(26,22,19,0.08)", color: "#1A1613", border: "1px solid rgba(26,22,19,0.15)" }
                        : { background: "transparent", border: "1px solid var(--ao-line)", color: "var(--ao-txt)" }
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = form.enabled ? "rgba(26,22,19,0.16)" : "var(--ao-amber-soft)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = form.enabled ? "rgba(26,22,19,0.08)" : "transparent";
                    }}
                    title="Force everyone to see it again"
                  >
                    <FaSync className="text-[9px]" />
                    Force re-show
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold transition-all disabled:opacity-60 hover:scale-[1.02] active:scale-95"
                    style={{
                      background: "var(--ao-amber)",
                      color: "#0A0A12",
                      boxShadow: "0 10px 26px -12px var(--ao-amber-glow)",
                    }}
                  >
                    {saving ? <FaSpinner className="text-[10px] animate-spin" /> : <FaSave className="text-[10px]" />}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Content Mode card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.03 }}
              className="ao-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaLayerGroup className="text-[12px]" style={{ color: "var(--ao-amber)" }} />
                <p className="font-ticket-body text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--ao-txt-soft)" }}>
                  Content Mode
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "text",  label: "Text",  desc: "Sections with headings & body", icon: FaAlignLeft },
                  { id: "image", label: "Image", desc: "Single poster-style image",      icon: FaImage },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => updateField("mode", m.id)}
                      className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all"
                      style={
                        active
                          ? {
                              background: "var(--ao-amber-soft)",
                              border: "1.5px solid var(--ao-amber)",
                              boxShadow: "0 8px 20px -10px var(--ao-amber-glow)",
                            }
                          : {
                              background: "var(--ao-card-2)",
                              border: "1.5px solid var(--ao-line)",
                            }
                      }
                    >
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={
                          active
                            ? { background: "var(--ao-amber)", color: "#0A0A12" }
                            : { background: "var(--ao-card)", color: "var(--ao-txt-soft)" }
                        }
                      >
                        <Icon className="text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className="font-ticket-display text-sm font-bold"
                            style={{ color: "var(--ao-txt)" }}
                          >
                            {m.label}
                          </p>
                          {active && (
                            <FaCheckCircle className="text-[11px]" style={{ color: "var(--ao-amber)" }} />
                          )}
                        </div>
                        <p className="font-ticket-body text-[11px] mt-0.5" style={{ color: "var(--ao-txt-soft)" }}>
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Common fields card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.06 }}
              className="ao-card p-5 sm:p-6 space-y-5"
            >
              <div className="flex items-center gap-2">
                <FaPaintBrush className="text-[12px]" style={{ color: "var(--ao-amber)" }} />
                <p className="font-ticket-body text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--ao-txt-soft)" }}>
                  Content Details
                </p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-ticket-body text-[11px] font-bold mb-1.5" style={{ color: "var(--ao-txt)" }}>
                  <FaTag className="text-[10px]" style={{ color: "var(--ao-amber)" }} /> Title
                </label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Welcome to APNa Deal"
                  className="w-full px-3.5 py-3 rounded-xl font-ticket-body text-sm outline-none ao-input"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-ticket-body text-[11px] font-bold mb-1.5" style={{ color: "var(--ao-txt)" }}>
                  <FaAlignLeft className="text-[10px]" style={{ color: "var(--ao-amber)" }} /> Subtitle
                </label>
                <textarea
                  value={form.subtitle || ""}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  rows="2"
                  placeholder="A short welcome message shown under the title…"
                  className="w-full px-3.5 py-3 rounded-xl font-ticket-body text-sm outline-none resize-none ao-input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 font-ticket-body text-[11px] font-bold mb-1.5" style={{ color: "var(--ao-txt)" }}>
                    <FaCheckCircle className="text-[10px]" style={{ color: "var(--ao-amber)" }} /> CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={form.cta_label || ""}
                    onChange={(e) => updateField("cta_label", e.target.value)}
                    placeholder="I Understand"
                    className="w-full px-3.5 py-3 rounded-xl font-ticket-body text-sm outline-none ao-input"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-ticket-body text-[11px] font-bold mb-1.5" style={{ color: "var(--ao-txt)" }}>
                    <FaClock className="text-[10px]" style={{ color: "var(--ao-amber)" }} /> Auto-show delay
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={form.auto_show_delay || 3000}
                      onChange={(e) => updateField("auto_show_delay", Number(e.target.value) || 0)}
                      className="w-full px-3.5 pr-14 py-3 rounded-xl font-ticket-body text-sm outline-none ao-input"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-ticket-body text-[10px] font-bold px-2 py-1 rounded-md"
                      style={{ background: "var(--ao-amber-soft)", color: "var(--ao-amber)" }}
                    >
                      ms
                    </span>
                  </div>
                  <p className="font-ticket-body text-[10px] mt-1" style={{ color: "var(--ao-txt-soft)" }}>
                    Default 3000 = 3 seconds
                  </p>
                </div>
              </div>
            </motion.div>

            {/* MODE: IMAGE */}
            {mode === "image" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="ao-card p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaImage className="text-[12px]" style={{ color: "var(--ao-amber)" }} />
                  <p className="font-ticket-body text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--ao-txt-soft)" }}>
                    Onboarding Image
                  </p>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

                {form.image_url ? (
                  <div className="space-y-3">
                    <div
                      className="rounded-2xl overflow-hidden relative group"
                      style={{ border: "1px solid var(--ao-line)" }}
                    >
                      <img src={form.image_url} alt="Onboarding" className="w-full h-auto block" />
                      <span
                        className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md"
                        style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                      >
                        <FaCheckCircle className="text-[9px]" /> Uploaded
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold transition-colors disabled:opacity-50"
                        style={{ border: "1px solid var(--ao-amber)", color: "var(--ao-amber)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--ao-amber)";
                          e.currentTarget.style.color = "#0A0A12";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--ao-amber)";
                        }}
                      >
                        <FaUpload className="text-[9px]" />
                        {uploading ? "Uploading…" : "Replace image"}
                      </button>
                      <button
                        onClick={() => updateField("image_url", null)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-ticket-body text-[11px] font-bold transition-colors"
                        style={{ border: "1px solid var(--ao-danger)", color: "var(--ao-danger)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--ao-danger)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--ao-danger)";
                        }}
                      >
                        <FaTrashAlt className="text-[9px]" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex flex-col items-center justify-center gap-3 py-12 rounded-2xl transition-colors disabled:opacity-50"
                    style={{ border: "2px dashed var(--ao-line-str)", background: "var(--ao-card-2)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ao-amber)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--ao-line-str)")}
                  >
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "var(--ao-amber-soft)" }}
                    >
                      {uploading ? (
                        <FaSpinner className="text-2xl animate-spin" style={{ color: "var(--ao-amber)" }} />
                      ) : (
                        <FaUpload className="text-xl" style={{ color: "var(--ao-amber)" }} />
                      )}
                    </div>
                    <span className="font-ticket-body text-sm font-bold" style={{ color: "var(--ao-txt)" }}>
                      {uploading ? "Uploading…" : "Click to upload image"}
                    </span>
                    <span className="font-ticket-body text-[10px]" style={{ color: "var(--ao-txt-soft)" }}>
                      JPG, PNG, WEBP — max 5MB
                    </span>
                  </button>
                )}
              </motion.div>
            )}

            {/* MODE: TEXT */}
            {mode === "text" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="ao-card p-5 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FaAlignLeft className="text-[12px]" style={{ color: "var(--ao-amber)" }} />
                    <p className="font-ticket-body text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--ao-txt-soft)" }}>
                      Sections
                    </p>
                    <span
                      className="font-ticket-body text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: "var(--ao-amber)", color: "#0A0A12" }}
                    >
                      {sectionCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetSections}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-ticket-body text-[10px] font-bold transition-colors"
                      style={{ border: "1px solid var(--ao-line)", color: "var(--ao-txt-soft)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--ao-amber)";
                        e.currentTarget.style.color = "var(--ao-amber)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--ao-line)";
                        e.currentTarget.style.color = "var(--ao-txt-soft)";
                      }}
                    >
                      <FaSync className="text-[9px]" />
                      Reset
                    </button>
                    <button
                      onClick={addSection}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-ticket-body text-[10px] font-bold hover:scale-[1.03] active:scale-95 transition-all"
                      style={{ background: "var(--ao-amber)", color: "#0A0A12" }}
                    >
                      <FaPlus className="text-[9px]" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(form.sections || []).map((s, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl p-3.5 sm:p-4"
                      style={{ background: "var(--ao-card-2)", border: "1px solid var(--ao-line)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                          <span
                            className="h-7 w-7 rounded-lg flex items-center justify-center font-ticket-body text-[11px] font-black"
                            style={{ background: "var(--ao-amber)", color: "#0A0A12" }}
                          >
                            {i + 1}
                          </span>
                          <FaGripVertical className="text-[10px]" style={{ color: "var(--ao-txt-faint)" }} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            type="text"
                            value={s.heading || ""}
                            onChange={(e) => updateSection(i, "heading", e.target.value)}
                            placeholder="Section heading"
                            className="w-full px-3.5 py-2.5 rounded-lg font-ticket-body text-[13px] font-bold outline-none ao-input"
                          />
                          <textarea
                            value={s.body || ""}
                            onChange={(e) => updateSection(i, "body", e.target.value)}
                            placeholder="Section body text…"
                            rows="2"
                            className="w-full px-3.5 py-2.5 rounded-lg font-ticket-body text-[12.5px] outline-none resize-none ao-input"
                          />
                        </div>

                        <button
                          onClick={() => removeSection(i)}
                          className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "var(--ao-danger)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ao-danger-soft)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                          aria-label="Remove"
                        >
                          <FaTrashAlt className="text-[11px]" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {sectionCount === 0 && (
                    <div className="text-center py-10">
                      <FaFileAlt className="text-3xl mx-auto mb-3" style={{ color: "var(--ao-txt-faint)" }} />
                      <p className="font-ticket-display text-base font-bold mb-1" style={{ color: "var(--ao-txt)" }}>
                        No sections yet
                      </p>
                      <p className="font-ticket-body text-xs" style={{ color: "var(--ao-txt-soft)" }}>
                        Click "Add" or "Reset" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>

          {/* ═══ RIGHT: stats panel ═══ */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">

            {/* Status tile (mint) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="ao-tile relative overflow-hidden"
              style={{
                background: form.enabled ? "var(--ao-success-soft)" : "var(--ao-card)",
                border: form.enabled ? "1px solid var(--ao-success)" : "1px solid var(--ao-line)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FaInfoCircle className="text-[11px]" style={{ color: form.enabled ? "var(--ao-success)" : "var(--ao-txt-soft)" }} />
                <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest" style={{ color: form.enabled ? "var(--ao-success)" : "var(--ao-txt-soft)" }}>
                  Status
                </p>
              </div>
              <p className="font-ticket-display text-2xl font-black leading-tight" style={{ color: "var(--ao-txt)" }}>
                {form.enabled ? "Active" : "Off"}
              </p>
              <p className="font-ticket-body text-[12px] mt-1" style={{ color: "var(--ao-txt-soft)" }}>
                {form.enabled
                  ? "Every user sees this on next page load."
                  : "Nothing is shown to users right now."}
              </p>
            </motion.div>

            {/* Quick stats tile */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="ao-card p-5"
            >
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--ao-txt-soft)" }}>
                Snapshot
              </p>
              <div className="space-y-3">
                <StatRow label="Mode" value={mode === "text" ? "Text" : "Image"} icon={mode === "text" ? FaFileAlt : FaImage} />
                <StatRow label="Sections" value={sectionCount} icon={FaAlignLeft} />
                <StatRow label="Version" value={`v${form.version || 1}`} icon={FaTag} />
                <StatRow label="Delay" value={`${Math.round((form.auto_show_delay || 3000) / 1000)}s`} icon={FaClock} />
              </div>
            </motion.div>

            {/* Tip tile (cream) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="ao-tile"
              style={{ background: "var(--ad-cream, #F5E6C8)", color: "#1A1613" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FFFFFF", color: "#1A1613" }}
                >
                  <FaLightbulb className="text-sm" />
                </div>
                <div className="min-w-0">
                  <p className="font-ticket-display text-sm font-black">Pro tip</p>
                  <p className="font-ticket-body text-[12px] mt-1 opacity-75 leading-relaxed">
                    Use <strong>Force re-show</strong> after editing so every user sees the updated onboarding again — even if they already dismissed it.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick action tile */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="ao-card p-5"
            >
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--ao-txt-soft)" }}>
                Quick actions
              </p>
              <div className="space-y-2">
                <button
                  onClick={openManually}
                  className="w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl font-ticket-body text-[12px] font-bold transition-all"
                  style={{
                    background: "var(--ao-card-2)",
                    border: "1px solid var(--ao-line)",
                    color: "var(--ao-txt)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--ao-amber)";
                    e.currentTarget.style.color = "var(--ao-amber)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--ao-line)";
                    e.currentTarget.style.color = "var(--ao-txt)";
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <FaEye className="text-[11px]" />
                    Preview
                  </span>
                  <FaChevronDown className="text-[9px] rotate-[-90deg]" />
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl font-ticket-body text-[12px] font-bold transition-all disabled:opacity-60"
                  style={{
                    background: "var(--ao-amber)",
                    color: "#0A0A12",
                    boxShadow: "0 10px 26px -12px var(--ao-amber-glow)",
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {saving ? <FaSpinner className="text-[11px] animate-spin" /> : <FaSave className="text-[11px]" />}
                    {saving ? "Saving…" : "Save changes"}
                  </span>
                  <FaChevronDown className="text-[9px] rotate-[-90deg]" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>

      {/* Toast (standalone only) */}
      {!embedded && (
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl font-ticket-body text-xs font-bold text-white max-w-[90vw]"
              style={{
                background: toast.type === "error" ? "var(--ao-danger)" : "var(--ao-success)",
              }}
            >
              {toast.type === "error" ? (
                <FaExclamationTriangle className="text-[11px]" />
              ) : (
                <FaCheck className="text-[11px]" />
              )}
              <span className="truncate">{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );

  return embedded ? inner : <div {...shellProps}>{inner}</div>;
};

/* ═══════════════════════════════════════════════════════════════
   Stat row helper
   ═══════════════════════════════════════════════════════════════ */
const StatRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="inline-flex items-center gap-2 font-ticket-body text-[12px]" style={{ color: "var(--ao-txt-soft)" }}>
      <Icon className="text-[10px]" style={{ color: "var(--ao-amber)" }} />
      {label}
    </span>
    <span className="font-ticket-display text-sm font-bold tabular-nums" style={{ color: "var(--ao-txt)" }}>
      {value}
    </span>
  </div>
);

export default AdminOnboarding;