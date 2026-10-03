// src/lib/gemini.js
import { supabase } from "./supabase";

/**
 * Send an image + prompt to Gemini 2.5 Flash Image via Supabase Edge Function.
 * Returns a blob URL for direct use in <img src=... />
 */
export async function editImageWithGemini({ imageUrl, prompt }) {
  // 1. Load the source image
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to load source image");
  let blob = await res.blob();

  // 2. Normalize unsupported formats (AVIF, HEIC) → PNG
  const supported = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!supported.includes(blob.type)) {
    blob = await convertToPng(blob);
  }

  const base64 = await blobToBase64(blob);

  // 3. Call the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke("image-ai", {
    body: {
      provider: "gemini",
      base64Image: base64,
      mimeType: blob.type,
      prompt,
    },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Edge function failed");
  }
  if (data?.error) throw new Error(data.error);

  // 4. Convert response → blob URL
  const outBlob = base64ToBlob(data.base64, data.mimeType);
  return URL.createObjectURL(outBlob);
}

/* ───── Helpers ───── */

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType || "image/png" });
}

async function convertToPng(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Failed to load image"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG conversion failed"))),
        "image/png"
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}