// src/lib/emailjs.js
import emailjs from "@emailjs/browser";

/* ⚠️ REPLACE THESE 3 VALUES */
export const EMAILJS_SERVICE_ID  = "service_t087puf";
export const EMAILJS_TEMPLATE_ID = "template_mrztxcs";
export const EMAILJS_PUBLIC_KEY  = "cLFeKOF3a_P2FN5qp";

const APP_URL = "https://apnadeal-70b37.web.app";
const HERO_IMAGE_URL = `${APP_URL}/hero2.webp`;
const LOGO_URL = `${APP_URL}/logo.png`;

/* ⭐ Brand color */
const BRAND = "#e66b00";
const BRAND_DARK = "#b85200";
const BRAND_SOFT = "#FFF4EC";
const BRAND_SOFT_BORDER = "#FFE0C8";

const escapeHtml = (s) =>
  String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

/* ── Build bullet groups + paragraphs HTML (simple, no boxes) ── */
const buildBodyHtml = ({ paragraphs = [], bulletGroups = [], closingParagraphs = [] }) => {
  const paragraphsHtml = paragraphs
    .map((p) => `<p style="font-size:15.5px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.65;">${escapeHtml(p)}</p>`)
    .join("");

  const bulletGroupsHtml = bulletGroups.map((group) => `
    <p style="font-size:15.5px;font-weight:700;color:#1A1A1A;margin:24px 0 10px 0;line-height:1.5;">
      ${escapeHtml(group.title)}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
      ${(group.items || []).map((item) => `
        <tr>
          <td style="vertical-align:top;padding:4px 0;width:16px;">
            <span style="display:inline-block;width:5px;height:5px;background:#1A1A1A;border-radius:50%;margin-top:8px;"></span>
          </td>
          <td style="padding:4px 0;">
            <span style="font-size:15px;color:#1A1A1A;line-height:1.6;">${escapeHtml(item)}</span>
          </td>
        </tr>
      `).join("")}
    </table>
  `).join("");

  const closingHtml = closingParagraphs
    .map((p) => `<p style="font-size:15.5px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.65;">${escapeHtml(p)}</p>`)
    .join("");

  return paragraphsHtml + bulletGroupsHtml + closingHtml;
};

/* ── Build CTA button HTML ── */
const buildCtaHtml = ({ ctaLabel, ctaUrl }) => {
  if (!ctaLabel) return "";
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 24px 0;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(ctaUrl || APP_URL)}"
             style="display:inline-block;padding:16px 44px;background:${BRAND};color:#FFFFFF;text-decoration:none;font-weight:800;font-size:16px;border-radius:8px;letter-spacing:0.2px;box-shadow:0 4px 12px rgba(230,107,0,0.25);">
            ${escapeHtml(ctaLabel)}
          </a>
        </td>
      </tr>
    </table>`;
};

/* ── Templates ── */
const TEMPLATES = {
  welcome: (d) => ({
    subject: `Welcome to APNa Deal, ${d.firstName}!`,
    greeting: `Dear ${d.firstName},`,

    paragraphs: [
      `Welcome to APNa Deal — Pakistan's modern AI-powered marketplace built for buyers, sellers, and creators.`,
      `APNa Deal is a full ecosystem where you can list anything, generate stunning product photos with AI, and share your listings across a social feed to reach thousands of buyers.`,
      `Here's what you can do on APNa Deal:`,
    ],

    bulletGroups: [
      {
        title: "Sell anything you want",
        items: [
          "Property — houses, plots, apartments, commercial",
          "Mobiles — phones, tablets, laptops, accessories",
          "Electronics — TVs, cameras, audio, gaming",
          "Vehicles — cars, bikes, and more categories",
          "Home & Furniture — appliances, decor, essentials",
          "Fashion & Beauty — clothing, shoes, watches, cosmetics",
        ],
      },
      {
        title: "Powerful AI tools built in",
        items: [
          "AI Background Removal — make your photos look professional in one click",
          "AI Image Generation — create stunning product visuals from a prompt",
          "AI Video Generation — turn your listing into a short video ad",
          "AI Title & Description Writer — write listings that sell in seconds",
          "AI Price Suggestions — get fair market pricing for your item",
          "Total AI Automation — post an ad in seconds with AI assistance",
        ],
      },
      {
        title: "Social Feed (Momento-style)",
        items: [
          "Share your listings to a live social feed",
          "Get likes, comments, and direct messages",
          "Follow sellers you trust and discover their latest drops",
          "Boost visibility and sell faster than ever",
          "Discover trending items across Pakistan",
          "Save posts and come back to them anytime",
        ],
      },
      {
        title: "Safe & secure trading",
        items: [
          "Verified user profiles and secure sign-in",
          "In-app chat so you never share your number publicly",
          "Seller ratings and reviews to build trust",
          "Report & block tools to keep the marketplace clean",
          "Ad moderation so buyers only see quality listings",
          "Your data is encrypted and never shared without consent",
        ],
      },
      {
        title: "Built for Pakistan",
        items: [
          "Available in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, and more",
          "Prices shown in PKR with local market understanding",
          "Urdu-friendly interface for easy browsing",
          "Support for Easypaisa, JazzCash, Meezan Bank, and cash on delivery",
          "Fast loading even on slow connections",
          "Designed for both individual sellers and business accounts",
        ],
      },
      {
        title: "Grow your seller profile",
        items: [
          "Track views, saves, and messages on every listing",
          "See which items are trending in your city",
          "Promote listings to reach more buyers",
          "Build a verified seller badge with consistent good ratings",
          "Manage multiple listings from one clean dashboard",
          "Get notified the moment a buyer messages you",
        ],
      },
    ],

    closingParagraphs: [
      `Whether you're selling a single phone or managing a full property portfolio, APNa Deal gives you the tools to succeed — from AI-generated photos to a social feed that puts your listing in front of real buyers.`,
      `Getting started takes less than a minute. Post your first listing, or just browse what's trending near you.`,
      `Ready to start? Click the button below to explore the marketplace.`,
      `If you have any questions, just reply to this email — we read every message.`,
    ],

    ctaLabel: "Start exploring APNa Deal",
    ctaUrl: `${APP_URL}/feed`,
  }),

  registration: (d) => ({
    subject: `Verify your APNa Deal account`,
    greeting: `Hello ${d.firstName},`,
    paragraphs: [
      `Welcome to APNa Deal!`,
      `To complete your registration and access the marketplace, please verify your email address by clicking the button below.`,
      `Once verified, you'll be able to:`,
    ],
    bulletGroups: [
      {
        title: "What unlocks after verification",
        items: [
          "Post unlimited listings across all categories",
          "Use AI tools — background removal, image generation, video ads",
          "Share listings to the social feed",
          "Chat securely with buyers and sellers",
          "Save favourite listings and follow top sellers",
          "Track your views, messages, and listing performance",
        ],
      },
    ],
    closingParagraphs: [
      `If you didn't create an APNa Deal account, you can safely ignore this email — no action is needed.`,
    ],
    ctaLabel: "Verify Email Address",
    ctaUrl: d.verifyUrl || `${APP_URL}/verify`,
  }),

  passwordReset: (d) => ({
    subject: `Reset your APNa Deal password`,
    greeting: `Hi ${d.firstName},`,
    paragraphs: [
      `Someone requested a password reset for your APNa Deal account.`,
      `If this was you, click the button below to set a new password.`,
      `If you didn't request this, you can safely ignore this email — your account stays secure and your current password will keep working.`,
    ],
    bulletGroups: [
      {
        title: "Security tips",
        items: [
          "Never share your password with anyone",
          "Use a unique password you don't use on other sites",
          "APNa Deal will never ask for your password by email or chat",
          "If you suspect suspicious activity, reset your password immediately",
        ],
      },
    ],
    closingParagraphs: [
      `For your safety, this reset link expires in 30 minutes.`,
    ],
    ctaLabel: "Reset Password",
    ctaUrl: d.resetUrl || `${APP_URL}/reset-password`,
  }),

  custom: (d) => ({
    subject: d.subject || "Message from APNa Deal",
    greeting: d.greeting || `Dear ${d.firstName},`,
    paragraphs: d.paragraphs || [d.body || ""],
    bulletGroups: d.bulletGroups || [],
    closingParagraphs: d.closingParagraphs || [],
    ctaLabel: d.ctaLabel || "",
    ctaUrl: d.ctaUrl || APP_URL,
  }),
};

export async function sendEmailJS({
  to,
  template = "custom",
  firstName = "there",
  subject,
  greeting,
  paragraphs,
  bulletGroups,
  closingParagraphs,
  ctaLabel,
  ctaUrl,
  verifyUrl,
  resetUrl,
  heroImage,
  logoImage,          // ⭐ NEW
}) {
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("Valid recipient email is required");
  }

  const fn = TEMPLATES[template] || TEMPLATES.custom;
  const tpl = fn({
    firstName, subject, greeting, paragraphs, bulletGroups,
    closingParagraphs, ctaLabel, ctaUrl, verifyUrl, resetUrl,
  });

  const params = {
    to_email: to,
    recipient_email: to,
    subject: tpl.subject,
    greeting: tpl.greeting,
    body_html: buildBodyHtml(tpl),
    cta_html: buildCtaHtml(tpl),
    hero_image: heroImage || HERO_IMAGE_URL,
    logo_url: logoImage || LOGO_URL,   // ⭐ uses uploaded logo if provided
    app_url: APP_URL,
    brand_color: BRAND,
    brand_color_dark: BRAND_DARK,
    brand_color_soft: BRAND_SOFT,
  };

  const result = await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    params,
    EMAILJS_PUBLIC_KEY
  );

  return { ok: true, text: result.text, subject: tpl.subject };
}