// src/lib/shareUtils.js
// Universal share link generator + sharer for posts, shorts, images, videos

/**
 * Get the base URL of your deployed app
 * Falls back to env var if window isn't available
 */
const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }
  return process.env.REACT_APP_SITE_URL || "https://apnadeal.store";
};

/**
 * Build a shareable URL for any content type
 * @param {string} type - "post" | "short" | "image" | "video" | "listing"
 * @param {string} id - the item ID
 * @returns {string} full URL
 */
export const buildShareUrl = (type, id) => {
  if (!id) return getBaseUrl();
  const base = getBaseUrl();

  switch (type) {
    case "short":
    case "video":
      return `${base}/momento/short/${id}`;
    case "image":
    case "post":
    default:
      return `${base}/momento/post/${id}`;
    case "listing":
      return `${base}/listing/${id}`;
  }
};

/**
 * Generate a nicely formatted share payload
 */
export const buildSharePayload = (item) => {
  const type = item?.is_short
    ? "short"
    : item?.media_type === "video"
    ? "video"
    : "post";

  const url = buildShareUrl(type, item.id);
  const title = item?.title || item?.content?.slice(0, 80) || "Check this out on ApnaDeal";
  const text = `Check out this listing on ApnaDeal: ${item?.title || item?.content?.slice(0, 80) || "New item"}`;

  return { url, title, text, type };
};

/**
 * Universal share function — uses native share on mobile,
 * copies to clipboard on desktop
 * @param {object} item - post/short/listing object
 * @param {function} onToast - optional callback for toast messages
 * @returns {Promise<boolean>} success
 */
export const shareContent = async (item, onToast) => {
  if (!item?.id) return false;

  const { url, title, text } = buildSharePayload(item);

  try {
    // Try native share first (mobile / modern browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text, url });
      onToast?.("success", "Shared successfully", "");
      return true;
    }

    // Fallback: copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      onToast?.("success", "Link copied", "Paste it anywhere");
      return true;
    }

    // Last resort: prompt
    window.prompt("Copy this link:", url);
    return true;
  } catch (err) {
    // User cancelled the share sheet — not an error
    if (err?.name === "AbortError") return false;

    console.warn("Share failed:", err);
    onToast?.("error", "Couldn't share", "Try again");
    return false;
  }
};

/**
 * Copy link only (no native share)
 */
export const copyContentLink = async (item, onToast) => {
  if (!item?.id) return false;
  const { url } = buildSharePayload(item);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      onToast?.("success", "Link copied", "Paste it anywhere");
      return true;
    }
    window.prompt("Copy this link:", url);
    return true;
  } catch (err) {
    console.error("Copy failed:", err);
    onToast?.("error", "Copy failed", "");
    return false;
  }
};