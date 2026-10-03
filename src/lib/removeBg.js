// src/lib/removeBg.js
import { supabase } from "./supabase";
import { removeBackground as imglyRemove } from "@imgly/background-removal";

/* ═══════════════════════════════════════════════════════════════
   PROGRESS STAGES — friendly labels for the AI pipeline
   ═══════════════════════════════════════════════════════════════ */
const STAGE_LABELS = {
  "fetch":         "Fetching image",
  "compute:inference": "Analyzing subject",
  "compute:decode":    "Decoding mask",
  "compute:encode":    "Encoding result",
  "compute":       "Processing",
  "download":      "Downloading AI model",
  "image":         "Preparing image",
  "mask":          "Building mask",
  "onnx":          "Initializing engine",
  "load":          "Loading",
  "post-process":  "Polishing edges",
  "default":       "Working",
};

const prettyKey = (key = "") => {
  if (!key) return STAGE_LABELS.default;
  const k = String(key).toLowerCase();
  for (const [needle, label] of Object.entries(STAGE_LABELS)) {
    if (k.includes(needle)) return label;
  }
  return STAGE_LABELS.default;
};

/* ═══════════════════════════════════════════════════════════════
   MAIN: REMOVE BACKGROUND
   - Fetches source image with CORS
   - Runs in-browser AI model
   - Reports rich progress { stage, label, pct, detail }
   - Retries once on transient failure
   ═══════════════════════════════════════════════════════════════ */
export async function removeBackground(imageUrl, onProgress) {
  const emit = (payload) => {
    if (typeof onProgress === "function") {
      try { onProgress(payload); } catch {}
    }
  };

  const fetchSource = async () => {
    emit({ stage: "fetch", label: STAGE_LABELS.fetch, pct: 0 });
    // 🔑 CORS-safe fetch → blob (avoids tainted canvas downstream)
    const res = await fetch(imageUrl, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`Failed to fetch source image (${res.status})`);
    const blob = await res.blob();

    if (!blob.size) throw new Error("Source image is empty");
    if (blob.size > 25 * 1024 * 1024) {
      throw new Error("Image is larger than 25MB — please use a smaller photo");
    }

    emit({
      stage: "fetch",
      label: STAGE_LABELS.fetch,
      pct: 5,
      detail: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
    });
    return blob;
  };

  const runModel = async (srcBlob) => {
    let lastKey = "";
    return imglyRemove(srcBlob, {
      device: "cpu",
      model: "small", // "small" is fast; switch to "medium" for higher quality
      output: {
        format: "image/png",
        quality: 0.9,
      },
      progress: (key, current, total) => {
        const rawPct = total > 0 ? (current / total) * 100 : 0;
        // Weight: first 5% was the fetch; scale remaining to 5–99%
        const pct = Math.min(99, Math.max(5, Math.round(5 + rawPct * 0.94)));
        const label = prettyKey(key);

        // Only emit if something meaningful changed
        const sig = `${key}-${pct}`;
        if (sig === lastKey) return;
        lastKey = sig;

        emit({
          stage: key || "compute",
          label,
          pct,
          detail: total > 0 ? `${current}/${total}` : undefined,
          isDownloading: String(key).toLowerCase().includes("download"),
        });
      },
    });
  };

  const withRetry = async (fn, retries = 1) => {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        // Don't retry on user errors
        const msg = String(err?.message || "");
        if (msg.includes("larger than") || msg.includes("empty") || msg.includes("404")) break;
        if (attempt < retries) {
          emit({
            stage: "retry",
            label: "Retrying",
            pct: 3,
            detail: `Attempt ${attempt + 2}/${retries + 1}`,
          });
          // brief backoff
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
    throw lastErr;
  };

  try {
    const srcBlob = await fetchSource();
    const cleanedBlob = await withRetry(() => runModel(srcBlob));
    emit({ stage: "done", label: "Done", pct: 100 });
    return cleanedBlob;
  } catch (err) {
    emit({ stage: "error", label: "Failed", pct: 0, detail: err?.message });
    throw err;
  }
}

export async function uploadCleanedImage(blob, contentType = "image/jpeg") {
  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `cleaned/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error } = await supabase.storage
    .from("listing-images")
    .upload(path, blob, { contentType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("listing-images")
    .getPublicUrl(path);

  return data.publicUrl;
}