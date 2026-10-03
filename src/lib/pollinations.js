// src/lib/pollinations.js
const PROXY_URL = "https://floral-bush-c3e1.hasnainwebdeveloper1122.workers.dev";

/* IMAGE GENERATION — FLUX.1 schnell */
export async function generateWithPollinations({ prompt }) {
  if (!prompt) throw new Error("Prompt is required");
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);

  let base64Image = null;
  if (typeof data.result === "string") base64Image = data.result;
  else if (data.result?.image) base64Image = data.result.image;
  else if (data.result?.[0]?.image) base64Image = data.result[0].image;

  if (!base64Image) throw new Error("Worker returned no image");
  return `data:image/jpeg;base64,${base64Image}`;
}

/* LLM CHAT — Llama 3.1 8B */
export async function generateWithChat({ message, system }) {
  if (!message) throw new Error("Message is required");
  const response = await fetch(`${PROXY_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, system }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  if (!data.result?.response) throw new Error("Worker returned no response");
  return data.result.response;
}

/* VISION — single image */
export async function generateWithVision({ imageUrl, prompt, system }) {
  if (!imageUrl) throw new Error("imageUrl is required");
  const response = await fetch(`${PROXY_URL}/vision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageUrl, prompt, system }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  const text = data.result?.response ?? (typeof data.result === "string" ? data.result : null);
  if (!text) throw new Error("Worker returned no vision response");
  return text;
}

/* VISION CHAT — multi-turn with images */
export async function generateWithVisionChat({ messages = [], system }) {
  if (!messages.length) throw new Error("messages array is required");
  const response = await fetch(`${PROXY_URL}/vision-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  const text = data.result?.response ?? (typeof data.result === "string" ? data.result : null);
  if (!text) throw new Error("Worker returned no vision-chat response");
  return text;
}

/* HELPER — file → base64 data URL */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}