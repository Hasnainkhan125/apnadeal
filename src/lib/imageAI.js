// src/lib/imageAI.js
// ═══════════════════════════════════════════════════════════════
// APNa Deal · AI Image Toolkit
// Modern, provider-agnostic image AI client (remove.bg + Gemini)
// ═══════════════════════════════════════════════════════════════
import { supabase } from "./supabase";

/* ────────────────────────────────────────────────────────────
   CONFIG
   ──────────────────────────────────────────────────────────── */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://emlwucoqzgvpelontklt.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const FN_URL = `${SUPABASE_URL}/functions/v1/image-ai`;

const DEFAULTS = {
  timeoutMs: 90_000,        // hard timeout per request
  maxRetries: 2,            // retry on network hiccups
  retryDelayMs: 800,        // exponential: 800 → 1600
  maxInputBytes: 15 * 1024 * 1024, // 15 MB
  supportedMimes: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/avif",
  ],
};

/* ────────────────────────────────────────────────────────────
   PUBLIC API
   ──────────────────────────────────────────────────────────── */

/**
 * Remove background — returns a Blob URL of the transparent PNG.
 *
 * @param {string} imageUrl              Publicly reachable image URL
 * @param {object} [opts]
 * @param {(stage:string)=>void} [opts.onProgress]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string>}            Blob URL (revoke when done)
 */
export async function removeBgWithAPI(imageUrl, opts = {}) {
  if (!imageUrl) throw new Error("Image URL is required.");

  opts.onProgress?.("uploading");

  const body = { provider: "removebg", imageUrl };

  const res = await fetchWithRetry(
    FN_URL,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: opts.signal,
    },
    opts
  );

  if (!res.ok) {
    throw await humanizeError(res, "Background removal failed");
  }

  opts.onProgress?.("processing");
  const blob = await res.blob();
  opts.onProgress?.("done");

  return URL.createObjectURL(blob);
}

/**
 * Edit image with Gemini — returns a Blob URL of the edited image.
 *
 * @param {object} args
 * @param {string} args.imageUrl         Source image URL
 * @param {string} args.prompt           Natural language edit prompt
 * @param {object} [args.options]        { temperature, style, aspectRatio }
 * @param {(stage:string)=>void} [opts.onProgress]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<string>}            Blob URL
 */
export async function editWithGemini(args, opts = {}) {
  const { imageUrl, prompt, options = {} } = args || {};
  if (!imageUrl) throw new Error("Image URL is required.");
  if (!prompt?.trim()) throw new Error("Edit prompt is required.");

  opts.onProgress?.("loading");

  const { base64, mimeType } = await urlToBase64(imageUrl);

  opts.onProgress?.("uploading");

  const { data, error } = await supabase.functions.invoke("image-ai", {
    body: {
      provider: "gemini",
      base64Image: base64,
      mimeType,
      prompt: prompt.trim(),
      options,
    },
  });

  if (error) throw new Error(error.message || "Gemini edit failed.");
  if (data?.error) throw new Error(data.error);

  opts.onProgress?.("processing");

  const outBlob = base64ToBlob(data.base64, data.mimeType || "image/png");
  opts.onProgress?.("done");

  return URL.createObjectURL(outBlob);
}

/**
 * Batch remove backgrounds from multiple images (parallel).
 *
 * @param {string[]} imageUrls
 * @param {object} [opts]
 * @param {number} [opts.concurrency=3]
 * @returns {Promise<Array<{url:string, result?:string, error?:string}>>}
 */
export async function removeBgBatch(imageUrls = [], opts = {}) {
  const concurrency = Math.max(1, opts.concurrency || 3);
  const results = new Array(imageUrls.length);
  let cursor = 0;

  async function worker() {
    while (cursor < imageUrls.length) {
      const i = cursor++;
      const url = imageUrls[i];
      try {
        const result = await removeBgWithAPI(url, opts);
        results[i] = { url, result };
      } catch (err) {
        results[i] = { url, error: err.message };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, imageUrls.length) }, worker)
  );

  return results;
}

/**
 * Convert a Blob URL → File (useful for uploads).
 */
export async function blobUrlToFile(blobUrl, filename = "output.png") {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

/**
 * Trigger a browser download from a Blob URL.
 */
export function downloadBlobUrl(blobUrl, filename = "image.png") {
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ────────────────────────────────────────────────────────────
   INTERNAL HELPERS
   ──────────────────────────────────────────────────────────── */

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

async function fetchWithRetry(url, init, opts = {}) {
  const maxRetries = opts.maxRetries ?? DEFAULTS.maxRetries;
  const baseDelay = opts.retryDelayMs ?? DEFAULTS.retryDelayMs;
  let lastErr;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, init, opts.timeoutMs);
    } catch (err) {
      lastErr = err;
      // Don't retry on abort or client errors
      if (err.name === "AbortError") throw err;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

async function fetchWithTimeout(url, init, timeoutMs = DEFAULTS.timeoutMs) {
  if (!timeoutMs) return fetch(url, init);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  // Merge user's signal with our timeout
  if (init?.signal) {
    init.signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function urlToBase64(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to load source image.");

  let blob = await res.blob();

  if (blob.size > DEFAULTS.maxInputBytes) {
    throw new Error(
      `Image too large (${(blob.size / 1024 / 1024).toFixed(1)} MB). Max 15 MB.`
    );
  }

  if (!DEFAULTS.supportedMimes.includes(blob.type)) {
    blob = await convertToPng(blob);
  }

  const base64 = await blobToBase64(blob);
  return { base64, mimeType: blob.type || "image/png" };
}

async function humanizeError(res, fallback) {
  let detail = "";
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      detail = json?.error || json?.message || text;
    } catch {
      detail = text;
    }
  } catch {}

  const map = {
    400: "Invalid request — please check the image and try again.",
    401: "Authentication failed — please refresh and try again.",
    403: "Access denied — check your API credits.",
    413: "Image is too large to process.",
    429: "Too many requests — please wait a moment.",
    500: "Server error — please try again shortly.",
    502: "AI service temporarily unavailable.",
    503: "AI service is busy — please retry.",
  };

  const msg = map[res.status] || `${fallback} (${res.status})`;
  return new Error(detail ? `${msg} · ${detail.slice(0, 160)}` : msg);
}

/* ───── Encoding helpers ───── */

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64, mimeType = "image/png") {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

async function convertToPng(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG conversion failed."))),
        "image/png"
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Failed to load image."));
    i.src = src;
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));