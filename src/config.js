// src/config.js
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isNetlify = window.location.hostname === 'studyassistants.netlify.app';

// Get from environment or use fallback
// ✅ CORRECT
const RECAPTCHA_SITE_KEY = isLocalhost 
  ? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // ← Test key (no space)
  : '6LcnoKQtAAAAAMKUrHXMJld-foaFWoXwHssKDjN8';

export { RECAPTCHA_SITE_KEY };