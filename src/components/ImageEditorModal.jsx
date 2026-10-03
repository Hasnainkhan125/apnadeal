// components/EditImageModal.jsx — Inline image editor modal
import React, { useState, useRef, useMemo } from "react";
import AvatarEditor from "react-avatar-editor";
import {
  FaArrowLeft, FaSave, FaSpinner, FaPaintBrush,
  FaSearchPlus, FaSearchMinus, FaUndo, FaSyncAlt,
  FaSun, FaAdjust, FaTint, FaMagic, FaEyeDropper, FaTimes,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    input[type="range"].filter-slider {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 999px;
      background: rgba(0,0,0,0.08);
      outline: none;
      cursor: pointer;
    }
    .dark input[type="range"].filter-slider { background: rgba(255,255,255,0.1); }
    input[type="range"].filter-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #eb7d34;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(235,125,52,0.4);
      cursor: pointer;
      transition: transform 0.15s;
    }
    input[type="range"].filter-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
    input[type="range"].filter-slider::-moz-range-thumb {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #eb7d34;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(235,125,52,0.4);
      cursor: pointer;
    }
  `}</style>
);

const PRESETS = [
  { id: "original", label: "Original", values: {} },
  { id: "bright", label: "Bright", values: { brightness: 115, contrast: 105 } },
  { id: "vivid", label: "Vivid", values: { saturation: 140, contrast: 110 } },
  { id: "warm", label: "Warm", values: { sepia: 25, brightness: 105 } },
  { id: "cool", label: "Cool", values: { hueRotate: 180, saturation: 120 } },
  { id: "bw", label: "B&W", values: { grayscale: 100, contrast: 110 } },
  { id: "faded", label: "Faded", values: { brightness: 110, contrast: 85, saturation: 80 } },
  { id: "dramatic", label: "Dramatic", values: { contrast: 130, brightness: 95, saturation: 110 } },
];

const buildFilterString = (f) => {
  const parts = [];
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  return parts.length ? parts.join(" ") : "none";
};

const applyFiltersToCanvas = (sourceCanvas, filters) => {
  const out = document.createElement("canvas");
  out.width = sourceCanvas.width;
  out.height = sourceCanvas.height;
  const ctx = out.getContext("2d");
  ctx.filter = buildFilterString(filters);
  ctx.drawImage(sourceCanvas, 0, 0);
  return out;
};

const FilterSlider = ({ icon: Icon, label, value, min, max, step = 1, onChange, suffix = "" }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="text-[#c8631f] dark:text-[#eb7d34] text-[10px]" />
        <span className="font-ticket-body text-[11px] font-bold text-black dark:text-white">
          {label}
        </span>
      </div>
      <span className="font-ticket-body text-[10px] font-bold text-[#666] dark:text-[#999] tabular-nums">
        {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
        {suffix}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="filter-slider w-full"
    />
  </div>
);

const EditImageModal = ({ imageUrl, onClose, onSave }) => {
  const { user } = useAuth();
  const editorRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    blur: 0,
  });
  const [activePreset, setActivePreset] = useState("original");

  const cssFilter = useMemo(() => buildFilterString(filters), [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActivePreset("custom");
  };

  const applyPreset = (preset) => {
    setFilters({
      brightness: 100, contrast: 100, saturation: 100,
      grayscale: 0, sepia: 0, hueRotate: 0, blur: 0,
      ...preset.values,
    });
    setActivePreset(preset.id);
  };

  const resetAll = () => {
    setScale(1);
    setRotate(0);
    setFilters({
      brightness: 100, contrast: 100, saturation: 100,
      grayscale: 0, sepia: 0, hueRotate: 0, blur: 0,
    });
    setActivePreset("original");
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    try {
      const croppedCanvas = editorRef.current.getImageScaledToCanvas();
      const finalCanvas = applyFiltersToCanvas(croppedCanvas, filters);

      const blob = await new Promise((resolve) =>
        finalCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Failed to export image");

      const fileName = `edited/${user?.id || "guest"}/${Date.now()}-${Math.random()
        .toString(36).slice(2, 9)}.jpg`;

      const { error: upErr } = await supabase.storage
        .from("listing-images")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      // Hand the new URL back to the parent
      onSave(urlData.publicUrl);
    } catch (error) {
      console.error("Save error:", error);
      alert("Could not save edited image: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0d0a05] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <FontStyles />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#eb7d34]/15 border border-[#eb7d34]/40 flex items-center justify-center flex-shrink-0">
              <FaPaintBrush className="text-[#c8631f] dark:text-[#eb7d34] text-sm" />
            </div>
            <div className="min-w-0">
              <p className="font-ticket-display text-sm sm:text-base font-bold text-black dark:text-white truncate">
                Edit Photo
              </p>
              <p className="font-ticket-body text-[10px] text-[#666] dark:text-[#999] truncate">
                Crop · Zoom · Rotate · Filters
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="h-9 w-9 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-xs" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 sm:px-5 py-2 rounded-xl font-ticket-body text-xs font-bold text-white bg-[#eb7d34] hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all inline-flex items-center gap-2 shadow-md"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="text-[10px] animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <FaSave className="text-[10px]" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-[#F7F1E4] dark:bg-[#0a0806]">
            <div
              className="bg-white dark:bg-[#0d0a05] rounded-2xl p-3 shadow-2xl border border-black/10 dark:border-white/10"
              style={{ filter: cssFilter }}
            >
              <AvatarEditor
                ref={editorRef}
                image={imageUrl}
                width={420}
                height={420}
                border={25}
                color={[247, 241, 228, 0.6]}
                scale={scale}
                rotate={rotate}
                borderRadius={0}
                className="rounded-xl max-w-full"
              />
            </div>
          </div>

          {/* Controls panel */}
          <div className="lg:w-[320px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#0d0a05] overflow-y-auto">

            {/* Crop / rotate */}
            <div className="p-4 border-b border-black/8 dark:border-white/8">
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[#666] dark:text-[#999] mb-3">
                Crop & Rotate
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaSearchMinus className="text-[#c8631f] dark:text-[#eb7d34] text-xs flex-shrink-0" />
                  <input
                    type="range" min="0.5" max="3" step="0.01" value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="filter-slider flex-1"
                  />
                  <FaSearchPlus className="text-[#c8631f] dark:text-[#eb7d34] text-xs flex-shrink-0" />
                  <span className="font-ticket-body text-xs font-bold text-black dark:text-white w-10 text-right flex-shrink-0">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRotate((r) => r + 90)}
                    className="flex items-center justify-center gap-2 bg-[#F7F1E4] dark:bg-[#0a0806] rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 hover:border-[#eb7d34] text-black dark:text-white font-ticket-body text-xs font-bold transition-colors"
                  >
                    <FaSyncAlt className="text-[#c8631f] dark:text-[#eb7d34] text-xs" />
                    Rotate
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex items-center justify-center gap-2 bg-[#F7F1E4] dark:bg-[#0a0806] rounded-xl px-3 py-2.5 border border-black/10 dark:border-white/10 hover:border-[#eb7d34] text-black dark:text-white font-ticket-body text-xs font-bold transition-colors"
                  >
                    <FaUndo className="text-[#c8631f] dark:text-[#eb7d34] text-xs" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="p-4 border-b border-black/8 dark:border-white/8">
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[#666] dark:text-[#999] mb-3">
                Quick Presets
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-ticket-body font-bold transition-all border ${
                      activePreset === p.id
                        ? "bg-[#eb7d34] border-[#eb7d34] text-white"
                        : "bg-[#F7F1E4] dark:bg-[#0a0806] border-black/10 dark:border-white/10 text-black dark:text-white hover:border-[#eb7d34]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fine tune */}
            <div className="p-4 space-y-3.5">
              <p className="font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[#666] dark:text-[#999]">
                Fine Tune
              </p>
              <FilterSlider icon={FaSun} label="Brightness" value={filters.brightness} min={50} max={150} onChange={(v) => updateFilter("brightness", v)} suffix="%" />
              <FilterSlider icon={FaAdjust} label="Contrast" value={filters.contrast} min={50} max={150} onChange={(v) => updateFilter("contrast", v)} suffix="%" />
              <FilterSlider icon={FaTint} label="Saturation" value={filters.saturation} min={0} max={200} onChange={(v) => updateFilter("saturation", v)} suffix="%" />
              <FilterSlider icon={FaEyeDropper} label="Sepia" value={filters.sepia} min={0} max={100} onChange={(v) => updateFilter("sepia", v)} suffix="%" />
              <FilterSlider icon={FaMagic} label="Grayscale" value={filters.grayscale} min={0} max={100} onChange={(v) => updateFilter("grayscale", v)} suffix="%" />
              <FilterSlider icon={FaSyncAlt} label="Hue" value={filters.hueRotate} min={0} max={360} onChange={(v) => updateFilter("hueRotate", v)} suffix="°" />
              <FilterSlider icon={FaPaintBrush} label="Blur" value={filters.blur} min={0} max={10} step={0.1} onChange={(v) => updateFilter("blur", v)} suffix="px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditImageModal;