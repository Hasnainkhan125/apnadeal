// src/components/AIStudioShell.jsx — 4-column AI Studio layout shell
import React from "react";
import { motion } from "framer-motion";
import {
  FaHome, FaCrop, FaPalette, FaSlidersH, FaMagic, FaLayerGroup,
  FaImage, FaCog, FaSearch, FaUpload, FaDownload, FaSave,
  FaSpinner, FaBolt, FaShieldAlt, FaArrowLeft, FaTimes,
} from "react-icons/fa";

/* ═══════════════════════════════════════════════════════════════
   SMALL PARTS
   ═══════════════════════════════════════════════════════════════ */

const BrandMark = () => (
  <div
    className="flex items-center gap-2.5 px-4 py-4 mb-2"
    style={{ borderBottom: "1px solid var(--line)" }}
  >
    <div
      className="h-9 w-9 rounded-xl flex items-center justify-center font-ticket-display font-bold text-white flex-shrink-0"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)",
        boxShadow:
          "0 8px 20px -6px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      A
    </div>
    <div className="min-w-0">
      <p className="font-ticket-display text-[15px] font-bold text-[var(--txt)] leading-none truncate">
        APNa <span className="grad-primary">Studio</span>
      </p>
      <p className="font-ticket-body text-[9px] uppercase tracking-[0.18em] text-[var(--txt-faint)] mt-1">
        Photo AI
      </p>
    </div>
  </div>
);

const RailButton = ({ icon: Icon, label, active, badge, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    className="relative flex flex-col items-center gap-1.5 py-3 px-2 w-[64px] rounded-2xl transition-all"
    style={
      active
        ? {
            background:
              "linear-gradient(180deg, var(--primary-soft), transparent)",
            border: "1px solid var(--primary)",
            color: "var(--txt)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 20px -8px var(--primary-glow)",
          }
        : { border: "1px solid transparent", color: "var(--txt-faint)" }
    }
  >
    <Icon className="text-[18px]" />
    <span className="font-ticket-body text-[9px] font-bold uppercase tracking-wider">
      {label}
    </span>
    {badge && (
      <span
        className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full font-ticket-body text-[7px] font-black uppercase tracking-wider text-white"
        style={{ background: "var(--primary-3)" }}
      >
        {badge}
      </span>
    )}
  </motion.button>
);

/* ═══════════════════════════════════════════════════════════════
   PROMPT BOX
   ═══════════════════════════════════════════════════════════════ */

const PromptBox = ({ value, onChange, onSubmit, disabled }) => (
  <div
    className="rounded-2xl p-3"
    style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
  >
    <div className="flex items-center justify-between mb-2">
      <p className="font-ticket-body text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--txt-faint)]">
        Describe your edit
      </p>
      <span className="font-ticket-body text-[9px] font-bold text-[var(--txt-faint)]">
        Optional
      </span>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder="e.g. warm sunset light, clean studio backdrop, soft portrait blur…"
      className="w-full rounded-xl px-3 py-2.5 font-ticket-body text-[12px] resize-none outline-none"
      style={{
        background: "var(--bg)",
        color: "var(--txt)",
        border: "1px solid var(--line)",
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
    />
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-1.5">
        <FaBolt className="text-[10px] text-[var(--primary-2)]" />
        <span className="font-ticket-body text-[10px] font-bold text-[var(--txt-soft)]">
          Fast mode
        </span>
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={onSubmit}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-ticket-body text-[11px] font-bold disabled:opacity-50"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)",
          boxShadow:
            "0 8px 20px -6px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <FaMagic className="text-[11px]" />
        Generate
      </motion.button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN SHELL
   ═══════════════════════════════════════════════════════════════ */

const AIStudioShell = ({
  // header title
  title = "Edit Photo",
  subtitle = "AI Studio Editor",

  // tool rail
  activeTool,
  onToolChange,
  onOpenAI,
  aiActive,

  // prompt box
  prompt = "",
  onPromptChange,
  onPromptSubmit,

  // header buttons
  onGoBack,
  onUpload,
  onDownload,
  onSave,
  isSaving = false,
  isDownloading = false,
  canSave = true,

  // slots
  leftContent,
  centerContent,
  rightContent,
  mobileBar,
  mobileSheet,
  headerBadge = null,
}) => {
  const tools = [
    { id: "home",    icon: FaHome,       label: "Home" },
    { id: "crop",    icon: FaCrop,       label: "Crop" },
    { id: "preset",  icon: FaPalette,    label: "Styles" },
    { id: "filters", icon: FaSlidersH,   label: "Filters" },
    { id: "ai",      icon: FaMagic,      label: "AI", isAI: true, badge: "New" },
    { id: "layers",  icon: FaLayerGroup, label: "Layers" },
  ];

  return (
    <div className="dvh-screen flex flex-col studio-bg">

      {/* ── TOP HEADER ─────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-3 relative z-20"
        style={{
          background:
            "linear-gradient(180deg, var(--panel) 0%, var(--bg-2) 100%)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {/* Left: back + brand */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onGoBack && (
            <button
              onClick={onGoBack}
              aria-label="Back"
              className="h-10 w-10 rounded-xl flex items-center justify-center text-[var(--txt-soft)] hover:text-[var(--txt)] flex-shrink-0"
              style={{ background: "var(--line)", border: "1px solid var(--line)" }}
            >
              <FaArrowLeft className="text-sm" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-ticket-display text-[16px] font-bold text-[var(--txt)] truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="font-ticket-body text-[11px] text-[var(--txt-faint)] truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: search (desktop) */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl w-[240px]"
          style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
        >
          <FaSearch className="text-[11px] text-[var(--txt-faint)]" />
          <input
            placeholder="Search tools…"
            className="w-full bg-transparent font-ticket-body text-[12px] outline-none"
            style={{ color: "var(--txt)" }}
          />
        </div>

        {/* Right: header badge + upload + download + save */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {headerBadge}

          {onUpload && (
            <button
              type="button"
              onClick={onUpload}
              title="Upload"
              className="h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 text-[var(--txt-soft)] hover:text-[var(--txt)]"
              style={{ background: "var(--line)", border: "1px solid var(--line)" }}
            >
              <FaUpload className="text-[13px]" />
              <span className="hidden sm:inline font-ticket-body text-[12px] font-bold">
                Upload
              </span>
            </button>
          )}

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              title="Download"
              className="h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 text-[var(--txt-soft)] hover:text-[var(--txt)] disabled:opacity-40"
              style={{ background: "var(--line)", border: "1px solid var(--line)" }}
            >
              {isDownloading ? (
                <FaSpinner className="text-[13px] animate-spin" />
              ) : (
                <FaDownload className="text-[13px]" />
              )}
              <span className="hidden sm:inline font-ticket-body text-[12px] font-bold">
                {isDownloading ? "Downloading…" : "Download"}
              </span>
            </button>
          )}

          {onSave && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSave}
              disabled={isSaving || !canSave}
              className="px-3 sm:px-5 h-10 rounded-xl font-ticket-body text-[12px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 50%, var(--primary-3) 100%)",
                boxShadow:
                  "0 8px 24px -6px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="text-[11px] animate-spin" />
                  <span className="hidden sm:inline">Saving…</span>
                </>
              ) : (
                <>
                  <FaSave className="text-[12px]" />
                  <span className="hidden sm:inline">Export</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </header>

      {/* ── MAIN 4-COLUMN GRID ──────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Col 1: Rail (lg+) */}
        <nav
          className="hidden lg:flex flex-col items-center w-[88px] flex-shrink-0 py-4 gap-2 overflow-y-auto scrollbar-thin"
          style={{
            background:
              "linear-gradient(180deg, var(--panel) 0%, var(--bg-2) 100%)",
            borderRight: "1px solid var(--line)",
          }}
        >
          <BrandMark />
          {tools.map((t) => (
            <RailButton
              key={t.id}
              icon={t.icon}
              label={t.label}
              badge={t.badge}
              active={t.isAI ? aiActive : activeTool === t.id}
              onClick={() => (t.isAI ? onOpenAI() : onToolChange(t.id))}
            />
          ))}
          <div className="mt-auto pt-4">
            <RailButton icon={FaCog} label="Settings" />
          </div>
        </nav>

        {/* Col 2: Left panel with prompt + tool controls (lg+) */}
        <aside
          className="hidden lg:flex flex-col w-[340px] xl:w-[360px] flex-shrink-0 overflow-y-auto scrollbar-thin"
          style={{
            background:
              "linear-gradient(180deg, var(--panel) 0%, var(--bg-2) 100%)",
            borderRight: "1px solid var(--line)",
          }}
        >
          <div className="p-5">
            <PromptBox
              value={prompt}
              onChange={onPromptChange}
              onSubmit={onPromptSubmit}
              disabled={!canSave}
            />
          </div>
          <div className="flex-1">{leftContent}</div>
        </aside>

        {/* Col 3: Canvas */}
        <main className="flex-1 relative flex items-center justify-center overflow-hidden studio-canvas min-h-0 p-4 sm:p-7">
          {centerContent}
        </main>

        {/* Col 4: Right panel (xl+) */}
        <aside
          className="hidden xl:flex flex-col w-[300px] flex-shrink-0 p-5 gap-5 overflow-y-auto scrollbar-thin"
          style={{
            background:
              "linear-gradient(180deg, var(--panel) 0%, var(--bg-2) 100%)",
            borderLeft: "1px solid var(--line)",
          }}
        >
          {rightContent}
        </aside>
      </div>

      {/* Mobile bottom bar + sheets (rendered from parent) */}
      {mobileBar}
      {mobileSheet}
    </div>
  );
};

export default AIStudioShell;