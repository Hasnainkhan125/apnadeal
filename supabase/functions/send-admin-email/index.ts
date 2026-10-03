// supabase/functions/send-admin-email/index.ts
// Admin-sent email — Welcome, Registration, Password Reset, Custom
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://apnadeal-70b37.web.app";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "APNa Deal <onboarding@resend.dev>";

const HERO_IMAGE_URL = "https://cdn.dribbble.com/userupload/46022531/file/ec47d278b3e79ff805c291e262473b74.png?format=webp&resize=700x525&vertical=center";
const LOGO_URL = `${APP_URL}/logo.png`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ── Helpers ── */
const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* ── Prebuilt templates ── */
const TEMPLATES = {
  welcome: (data) => ({
    subject: `Welcome to APNa Deal, ${data.firstName}!`,
    heroImage: HERO_IMAGE_URL,
    greeting: `Dear ${data.firstName},`,
    paragraphs: [
      `Welcome to APNa Deal — Pakistan's modern AI-powered marketplace built for buyers, sellers, and creators.`,
      `We're excited to have you on board! APNa Deal is more than just a classifieds site. It's a full ecosystem where you can list anything, generate stunning product photos with AI, and share your listings across a social feed to reach thousands of buyers.`,
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
        ],
      },
      {
        title: "Powerful AI tools built in",
        items: [
          "AI Background Removal — make your photos look professional in one click",
          "AI Image Generation — create stunning product visuals from a prompt",
          "AI Video Generation — turn your listing into a short video ad",
          "Total AI Automation — post an ad in seconds with AI assistance",
        ],
      },
      {
        title: "Social Feed (Momento-style)",
        items: [
          "Share your listings to a live social feed",
          "Get likes, comments, and direct messages",
          "Boost visibility and sell faster than ever",
          "Discover trending items across Pakistan",
        ],
      },
    ],
    closingParagraphs: [
      `Whether you're selling a single phone or managing a full property portfolio, APNa Deal gives you the tools to succeed. Everything is designed to be fast, safe, and beautiful.`,
      `Ready to start? Click the button below to explore the marketplace.`,
    ],
    ctaLabel: "Start exploring APNa Deal",
    ctaUrl: `${APP_URL}/feed`,
    signOff: {
      line1: "Kind regards,",
      line2: "The APNa Deal Team",
    },
  }),

  registration: (data) => ({
    subject: `Verify your APNa Deal account`,
    heroImage: HERO_IMAGE_URL,
    greeting: `Hello ${data.firstName},`,
    paragraphs: [
      `Welcome to APNa Deal! We're excited to have you on board.`,
      `To complete your registration and access the marketplace, please verify your email address by clicking the button below.`,
      `Once verified, you'll be able to post listings, use our AI tools, share to the social feed, and chat securely with buyers and sellers across Pakistan.`,
    ],
    ctaLabel: "Verify Email Address",
    ctaUrl: data.verifyUrl || `${APP_URL}/verify`,
    signOff: {
      line1: "Kind regards,",
      line2: "The APNa Deal Team",
    },
  }),

  passwordReset: (data) => ({
    subject: `Reset your APNa Deal password`,
    heroImage: HERO_IMAGE_URL,
    greeting: `Hi ${data.firstName},`,
    paragraphs: [
      `Someone requested a password reset for your APNa Deal account.`,
      `If this was you, click the button below to set a new password.`,
      `If you didn't request this, you can safely ignore this email — your account is still secure.`,
    ],
    ctaLabel: "Reset Password",
    ctaUrl: data.resetUrl || `${APP_URL}/reset-password`,
    signOff: {
      line1: "Kind regards,",
      line2: "The APNa Deal Team",
    },
  }),

  custom: (data) => ({
    subject: data.subject || "Message from APNa Deal",
    heroImage: data.heroImage || HERO_IMAGE_URL,
    greeting: data.greeting || `Dear ${data.firstName},`,
    paragraphs: data.paragraphs || [data.body || ""],
    bulletGroups: data.bulletGroups || [],
    closingParagraphs: data.closingParagraphs || [],
    ctaLabel: data.ctaLabel || "",
    ctaUrl: data.ctaUrl || APP_URL,
    signOff: data.signOff || {
      line1: "Kind regards,",
      line2: "The APNa Deal Team",
    },
  }),
};

/* ── HTML builder — matches Corvinus-style layout ── */
const buildEmailHtml = (params) => {
  const {
    heroImage,
    greeting,
    paragraphs = [],
    bulletGroups = [],
    closingParagraphs = [],
    ctaLabel,
    ctaUrl,
    signOff,
    recipientEmail,
  } = params;

  const safeHero = escapeHtml(heroImage);
  const safeGreeting = escapeHtml(greeting);
  const safeCta = escapeHtml(ctaLabel || "");
  const safeCtaUrl = escapeHtml(ctaUrl || APP_URL);
  const safeRecipient = escapeHtml(recipientEmail || "");

  const paragraphsHtml = paragraphs
    .map((p) => `<p style="font-size:15.5px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.65;">${escapeHtml(p)}</p>`)
    .join("");

  const bulletGroupsHtml = bulletGroups
    .map((group) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
        <tr>
          <td style="padding:14px 16px;background:#F4FAF6;border-left:3px solid #00B84A;border-radius:6px;">
            <p style="font-size:14.5px;font-weight:800;color:#0E3D22;margin:0 0 8px 0;letter-spacing:-0.1px;">
              ${escapeHtml(group.title)}
            </p>
            <table cellpadding="0" cellspacing="0">
              ${(group.items || [])
                .map(
                  (item) => `
                <tr>
                  <td style="vertical-align:top;padding:3px 0;">
                    <span style="display:inline-block;width:6px;height:6px;background:#00B84A;border-radius:50%;margin-right:10px;margin-top:7px;"></span>
                  </td>
                  <td style="padding:3px 0;">
                    <span style="font-size:14px;color:#1A1A1A;line-height:1.55;">${escapeHtml(item)}</span>
                  </td>
                </tr>`
                )
                .join("")}
            </table>
          </td>
        </tr>
      </table>
    `)
    .join("");

  const closingHtml = closingParagraphs
    .map((p) => `<p style="font-size:15.5px;color:#1A1A1A;margin:0 0 16px 0;line-height:1.65;">${escapeHtml(p)}</p>`)
    .join("");

  const ctaHtml = safeCta
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 24px 0;">
      <tr>
        <td align="center">
          <a href="${safeCtaUrl}"
             style="display:inline-block;padding:16px 44px;background:#00B84A;color:#FFFFFF;text-decoration:none;font-weight:800;font-size:16px;border-radius:6px;letter-spacing:0.2px;">
            ${safeCta}
          </a>
        </td>
      </tr>
    </table>`
    : "";

  const signOffHtml = signOff
    ? `
    <p style="font-size:15.5px;color:#1A1A1A;margin:24px 0 4px 0;line-height:1.6;">
      ${escapeHtml(signOff.line1)}
    </p>
    <p style="font-size:15.5px;color:#0E3D22;font-weight:800;margin:0 0 8px 0;line-height:1.6;">
      ${escapeHtml(signOff.line2)}
    </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>APNa Deal</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1A1A1A;line-height:1.5;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
  <tr>
    <td align="center" style="padding:0;">

      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;background:#FFFFFF;">

        <tr>
          <td align="center" style="padding:0;">
            <a href="${APP_URL}" style="text-decoration:none;display:block;">
              <img src="${safeHero}" alt="APNa Deal Marketplace" width="720"
                style="display:block;width:100%;max-width:720px;height:auto;border:0;outline:none;" />
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 48px 8px 48px;">

            <p style="font-size:17px;font-weight:700;color:#1A1A1A;margin:0 0 24px 0;line-height:1.5;">
              ${safeGreeting}
            </p>

            ${paragraphsHtml}

            ${bulletGroupsHtml}

            ${closingHtml}

            ${ctaHtml}

            ${signOffHtml}

          </td>
        </tr>

        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E2E1F;">
              <tr>
                <td style="padding:36px 48px 32px 48px;">

                  <a href="${APP_URL}" style="text-decoration:none;display:inline-block;margin-bottom:20px;">
                    <img src="${LOGO_URL}" alt="APNa Deal" width="110"
                      style="display:block;max-width:110px;height:auto;border:0;outline:none;filter:brightness(0) invert(1);" />
                  </a>

                  <p style="font-size:12.5px;color:#D1D9D3;margin:0 0 16px 0;line-height:1.65;">
                    This email was sent to <span style="color:#FFFFFF;font-weight:600;">${safeRecipient}</span> and may contain confidential information intended solely for the designated recipient. You can update your communication preferences
                    <a href="${APP_URL}/settings/notifications" style="color:#4ADE80;text-decoration:underline;">here</a>.
                  </p>

                  <p style="font-size:12.5px;color:#D1D9D3;margin:0;line-height:1.65;">
                    © ${new Date().getFullYear()} APNa Deal. All rights reserved.
                  </p>

                  <p style="font-size:12.5px;color:#D1D9D3;margin:6px 0 0 0;line-height:1.65;">
                    Karachi · Lahore · Islamabad, Pakistan
                  </p>

                  <p style="font-size:12.5px;margin:16px 0 0 0;line-height:1.65;">
                    <a href="${APP_URL}/privacy" style="color:#4ADE80;text-decoration:none;margin-right:12px;">Privacy Policy</a>
                    <span style="color:#4ADE80;">|</span>
                    <a href="${APP_URL}/terms" style="color:#4ADE80;text-decoration:none;margin-left:12px;">Terms of Service</a>
                  </p>

                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
};

/* ── Handler ── */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      to,
      template = "custom",
      firstName = "there",
      subject,
      greeting,
      paragraphs,
      bulletGroups,
      closingParagraphs,
      heroImage,
      ctaLabel,
      ctaUrl,
      signOff,
      verifyUrl,
      resetUrl,
    } = await req.json();

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return json({ error: "Valid recipient email is required" }, 400);
    }

    const tplFn = TEMPLATES[template] || TEMPLATES.custom;
    const tpl = tplFn({
      firstName, subject, greeting, paragraphs, bulletGroups,
      closingParagraphs, heroImage, ctaLabel, ctaUrl, signOff,
      verifyUrl, resetUrl,
    });

    const html = buildEmailHtml({
      heroImage: tpl.heroImage,
      greeting: tpl.greeting,
      paragraphs: tpl.paragraphs,
      bulletGroups: tpl.bulletGroups,
      closingParagraphs: tpl.closingParagraphs,
      ctaLabel: tpl.ctaLabel,
      ctaUrl: tpl.ctaUrl,
      signOff: tpl.signOff,
      recipientEmail: to,
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: tpl.subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return json({ error: "Email send failed", detail: errText }, 500);
    }

    const data = await resendRes.json();
    return json({ ok: true, id: data.id, subject: tpl.subject }, 200);
  } catch (err) {
    console.error("send-admin-email error:", err);
    return json({ error: String(err) }, 500);
  }
});

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}