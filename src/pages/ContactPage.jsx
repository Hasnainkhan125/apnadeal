// pages/ContactPage.jsx — Simple, modern contact page (black / white / gray)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaComment,
  FaPaperPlane,
  FaCheckCircle,
  FaSpinner,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaGlobe,
  FaHeadset,
  FaWhatsapp,
  FaChevronDown,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   GOOGLE MAPS CONFIG
   ═══════════════════════════════════════════════════════════════ */
const OFFICE = {
  name: "Apex Office",
  address: "Bahria Town Phase 4, Islamabad, Pakistan",
  query: "Bahria Town Phase 4, Islamabad, Pakistan",
  zoom: 14,
};

const buildMapEmbedUrl = () =>
  `https://maps.google.com/maps?q=${encodeURIComponent(OFFICE.query)}&t=&z=${OFFICE.zoom}&ie=UTF8&iwloc=&output=embed`;

const buildMapExternalUrl = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE.query)}`;

const buildDirectionsUrl = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICE.query)}`;

/* ═══════════════════════════════════════════════════════════════
   FONTS + THEME TOKENS — black / white / gray
   ═══════════════════════════════════════════════════════════════ */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .cp-font { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

    /* ═══ DARK ═══ */
    .theme-dark {
      --cp-bg:           #0B0B0B;
      --cp-bg-2:         #121212;
      --cp-panel:        #171717;
      --cp-panel-2:      #1E1E1E;
      --cp-line:         rgba(255,255,255,0.08);
      --cp-line-str:     rgba(255,255,255,0.16);
      --cp-txt:          #FFFFFF;
      --cp-txt-soft:     rgba(255,255,255,0.66);
      --cp-txt-faint:    rgba(255,255,255,0.42);
      --cp-input-bg:     rgba(255,255,255,0.04);
      --cp-accent:       #FFFFFF;
      --cp-accent-soft:  rgba(255,255,255,0.06);
      --cp-danger:       #F87171;
      --cp-success:      #4ADE80;
      --cp-map-bg:       #121212;
    }

    /* ═══ LIGHT ═══ */
    .theme-light {
      --cp-bg:           #FFFFFF;
      --cp-bg-2:         #FAFAFA;
      --cp-panel:        #FFFFFF;
      --cp-panel-2:      #F4F4F5;
      --cp-line:         rgba(0,0,0,0.08);
      --cp-line-str:     rgba(0,0,0,0.16);
      --cp-txt:          #0B0B0B;
      --cp-txt-soft:     rgba(11,11,11,0.66);
      --cp-txt-faint:    rgba(11,11,11,0.42);
      --cp-input-bg:     rgba(0,0,0,0.03);
      --cp-accent:       #0B0B0B;
      --cp-accent-soft:  rgba(0,0,0,0.04);
      --cp-danger:       #DC2626;
      --cp-success:      #16A34A;
      --cp-map-bg:       #F4F4F5;
    }

    .cp-bg {
      background: var(--cp-bg);
      color: var(--cp-txt);
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* ═══ CTA BUTTON — simple solid ═══ */
    .cp-cta {
      background: var(--cp-txt);
      color: var(--cp-bg);
      font-weight: 700;
      transition: transform 0.18s ease, opacity 0.18s ease;
    }
    .cp-cta:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
    .cp-cta:active:not(:disabled) { transform: scale(0.98); }
    .cp-cta:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ═══ WhatsApp CTA — solid dark/green ═══ */
    .cp-cta-wa {
      background: var(--cp-panel-2);
      color: var(--cp-txt);
      border: 1px solid var(--cp-line-str);
      font-weight: 700;
      transition: transform 0.18s ease, border-color 0.18s ease;
    }
    .cp-cta-wa:hover {
      transform: translateY(-2px);
      border-color: var(--cp-txt);
    }

    /* ═══ PANELS & CARDS — flat, minimal ═══ */
    .cp-panel {
      background: var(--cp-panel);
      border: 1px solid var(--cp-line);
      border-radius: 14px;
    }
    .cp-card {
      background: var(--cp-panel);
      border: 1px solid var(--cp-line);
      border-radius: 12px;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .cp-card:hover {
      border-color: var(--cp-line-str);
      transform: translateY(-2px);
    }

    /* ═══ INPUTS ═══ */
    .cp-input {
      width: 100%;
      padding: 12px 16px 12px 40px;
      border-radius: 10px;
      background: var(--cp-input-bg);
      color: var(--cp-txt);
      border: 1px solid var(--cp-line);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .cp-input::placeholder { color: var(--cp-txt-faint); }
    .cp-input:focus {
      border-color: var(--cp-txt);
      box-shadow: 0 0 0 3px var(--cp-accent-soft);
    }
    .cp-input.cp-input-error {
      border-color: var(--cp-danger);
    }

    /* ═══ SOCIAL ICON — simple square ═══ */
    .cp-social {
      background: var(--cp-panel-2);
      border: 1px solid var(--cp-line);
      color: var(--cp-txt-soft);
      transition: all 0.2s ease;
    }
    .cp-social:hover {
      color: var(--cp-txt);
      border-color: var(--cp-line-str);
      transform: translateY(-2px);
    }

    /* Shimmer */
    @keyframes cp-sweep {
      0%   { transform: translateX(-120%); }
      100% { transform: translateX(220%); }
    }
    .cp-sweep { animation: cp-sweep 1.1s ease-in-out infinite; }

    /* ═══ MAP ═══ */
    .cp-map-card {
      position: relative;
      width: 100%;
      border-radius: 14px;
      overflow: hidden;
      background: var(--cp-map-bg);
      border: 1px solid var(--cp-line);
    }
    .cp-map-frame {
      position: relative;
      width: 100%;
      height: 320px;
    }
    @media (min-width: 640px) { .cp-map-frame { height: 380px; } }
    .cp-map-frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      filter: saturate(0.9);
    }
    .theme-dark .cp-map-frame iframe {
      filter: saturate(0.7) brightness(0.92);
    }
    .cp-map-overlay {
      position: absolute;
      top: 14px;
      left: 14px;
      z-index: 5;
      background: var(--cp-panel);
      border: 1px solid var(--cp-line);
      border-radius: 10px;
      padding: 12px 14px;
      backdrop-filter: saturate(160%) blur(14px);
      -webkit-backdrop-filter: saturate(160%) blur(14px);
      max-width: 340px;
    }
    .cp-map-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 4;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 6px;
      background: var(--cp-panel);
      border: 1px solid var(--cp-line);
      font-size: 10px;
      font-weight: 600;
      color: var(--cp-txt-soft);
      text-decoration: none;
    }
    .cp-map-badge:hover { color: var(--cp-txt); border-color: var(--cp-line-str); }
  `}</style>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: "Email Us",
      details: "hello@apexdeal.pk",
      link: "mailto:hello@apexdeal.pk",
    },
    {
      icon: FaPhone,
      title: "Call Us",
      details: "+92 314 0972575",
      link: "tel:+923140972575",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Visit Us",
      details: "Bahria Town, Islamabad",
      link: buildMapExternalUrl(),
    },
    {
      icon: FaClock,
      title: "Working Hours",
      details: "Mon–Sat · 9 AM – 8 PM PKT",
      link: "#",
    },
  ];

  const socialLinks = [
    { icon: FaTwitter,   href: "#", label: "Twitter" },
    { icon: FaLinkedin,  href: "#", label: "LinkedIn" },
    { icon: FaGithub,    href: "#", label: "GitHub" },
    { icon: FaYoutube,   href: "#", label: "YouTube" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaFacebook,  href: "#", label: "Facebook" },
  ];

  const faqs = [
    {
      question: "How does Apex work?",
      answer:
        "Apex connects buyers and sellers in one place. Post your ad, get verified, and sell within 3–4 days. Buyers can browse, chat, and purchase safely.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. We use industry-standard encryption and never share your personal data. Your privacy and safety are our top priority.",
    },
    {
      question: "Can I cancel my Premium subscription anytime?",
      answer:
        "Absolutely. You can cancel your Premium subscription at any time from Settings with no questions asked — you'll keep access until the end of your billing cycle.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We support all major cards, bank transfers, and popular mobile wallets. All payments are processed through secure, PCI-compliant providers.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <>
      <FontStyles />
      <div className="min-h-screen cp-bg cp-font">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Header */}
          <div className="mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[13px] font-medium mb-6 transition-colors"
              style={{ color: "var(--cp-txt-faint)" }}
            >
              <FaArrowLeft className="text-[10px]" />
              Back
            </Link>

            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--cp-panel-2)", border: "1px solid var(--cp-line)", color: "var(--cp-txt)" }}
              >
                <FaHeadset className="text-[16px]" />
              </div>
              <div>
                <h1
                  className="font-bold leading-tight mb-2"
                  style={{ fontSize: "clamp(26px, 4vw, 34px)", letterSpacing: "-0.02em", color: "var(--cp-txt)" }}
                >
                  Get in Touch
                </h1>
                <p className="text-[14.5px] max-w-xl leading-relaxed" style={{ color: "var(--cp-txt-soft)" }}>
                  We'd love to hear from you. Reach out with any questions, feedback, or partnership ideas.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Grid */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid lg:grid-cols-5 gap-6 mb-12">
            {/* LEFT — Form */}
            <motion.div variants={item} className="lg:col-span-3">
              <div className="cp-panel p-6 sm:p-7">
                <h2 className="font-bold text-[16px] mb-5 flex items-center gap-2" style={{ color: "var(--cp-txt)" }}>
                  <FaComment className="text-[13px]" style={{ color: "var(--cp-txt-soft)" }} />
                  Send a Message
                </h2>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="p-8 rounded-xl text-center"
                      style={{ background: "var(--cp-panel-2)", border: "1px solid var(--cp-line)" }}
                    >
                      <div
                        className="h-14 w-14 mx-auto rounded-full flex items-center justify-center mb-4"
                        style={{ background: "var(--cp-txt)", color: "var(--cp-bg)" }}
                      >
                        <FaCheckCircle className="text-2xl" />
                      </div>
                      <h3 className="font-bold text-[16px] mb-2" style={{ color: "var(--cp-txt)" }}>
                        Message Sent
                      </h3>
                      <p className="text-[13.5px]" style={{ color: "var(--cp-txt-soft)" }}>
                        Thank you for reaching out. We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      {/* Name */}
                      <div>
                        <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "var(--cp-txt)" }}>
                          Full Name
                        </label>
                        <div className="relative">
                          <FaUser
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none z-10"
                            style={{ color: "var(--cp-txt-faint)" }}
                          />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`cp-input ${errors.name ? "cp-input-error" : ""}`}
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-[11.5px]" style={{ color: "var(--cp-danger)" }}>{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "var(--cp-txt)" }}>
                          Email Address
                        </label>
                        <div className="relative">
                          <FaEnvelope
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none z-10"
                            style={{ color: "var(--cp-txt-faint)" }}
                          />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={`cp-input ${errors.email ? "cp-input-error" : ""}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-[11.5px]" style={{ color: "var(--cp-danger)" }}>{errors.email}</p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "var(--cp-txt)" }}>
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What's this about?"
                          className={`cp-input ${errors.subject ? "cp-input-error" : ""}`}
                          style={{ paddingLeft: 16 }}
                        />
                        {errors.subject && (
                          <p className="mt-1 text-[11.5px]" style={{ color: "var(--cp-danger)" }}>{errors.subject}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-[12.5px] font-semibold mb-1.5" style={{ color: "var(--cp-txt)" }}>
                          Message
                        </label>
                        <div className="relative">
                          <FaComment
                            className="absolute left-4 top-4 text-[11px] pointer-events-none z-10"
                            style={{ color: "var(--cp-txt-faint)" }}
                          />
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us how we can help..."
                            rows="5"
                            maxLength={500}
                            className={`cp-input ${errors.message ? "cp-input-error" : ""}`}
                            style={{ paddingLeft: 40, resize: "none", minHeight: 120 }}
                          />
                        </div>
                        {errors.message ? (
                          <p className="mt-1 text-[11.5px]" style={{ color: "var(--cp-danger)" }}>{errors.message}</p>
                        ) : (
                          <p className="mt-1 text-[11px] text-right tabular-nums" style={{ color: "var(--cp-txt-faint)" }}>
                            {formData.message.length}/500
                          </p>
                        )}
                      </div>

                      {/* Submit */}
                      <motion.button
                        whileHover={isSubmitting ? {} : { y: -1 }}
                        whileTap={isSubmitting ? {} : { scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="cp-cta relative w-full py-3.5 rounded-xl text-[13.5px] flex items-center justify-center gap-2.5 overflow-hidden"
                      >
                        {isSubmitting && (
                          <span
                            className="absolute inset-y-0 w-1/2 pointer-events-none cp-sweep"
                            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                          />
                        )}
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin relative z-10" />
                            <span className="relative z-10">Sending…</span>
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="relative z-10" />
                            <span className="relative z-10">Send Message</span>
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* RIGHT — Info */}
            <motion.div variants={item} className="lg:col-span-2 space-y-5">
              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.a
                      key={index}
                      href={info.link}
                      target={info.link.startsWith("http") ? "_blank" : undefined}
                      rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      whileHover={{ y: -2 }}
                      className="cp-card block p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--cp-panel-2)", border: "1px solid var(--cp-line)", color: "var(--cp-txt)" }}
                        >
                          <Icon className="text-[12px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "var(--cp-txt-faint)" }}>
                            {info.title}
                          </p>
                          <p className="text-[13.5px] font-semibold truncate" style={{ color: "var(--cp-txt)" }}>
                            {info.details}
                          </p>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Socials */}
              <div className="cp-panel p-5">
                <h3 className="font-bold text-[13px] mb-3.5 flex items-center gap-2" style={{ color: "var(--cp-txt)" }}>
                  <FaGlobe className="text-[11px]" style={{ color: "var(--cp-txt-soft)" }} />
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="cp-social h-9 w-9 rounded-lg flex items-center justify-center"
                      >
                        <Icon className="text-[13px]" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/923140972575"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="cp-cta-wa w-full py-3.5 rounded-xl text-[13.5px] flex items-center justify-center gap-2.5"
              >
                <FaWhatsapp className="text-[16px]" />
                <span>Start Live Chat</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ⭐ GOOGLE MAPS */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--cp-txt-faint)" }}>
                Find us
              </span>
              <h2 className="font-bold text-[20px] mt-1.5" style={{ color: "var(--cp-txt)" }}>
                Visit Our Office
              </h2>
            </div>

            <div className="cp-map-card">
              <div className="cp-map-frame">
                <iframe
                  title={`${OFFICE.name} — Google Maps`}
                  src={buildMapEmbedUrl()}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                <div className="cp-map-overlay">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--cp-panel-2)", border: "1px solid var(--cp-line)", color: "var(--cp-txt)" }}
                    >
                      <FaMapMarkerAlt className="text-[11px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "var(--cp-txt-faint)" }}>
                        Our Office
                      </p>
                      <p className="text-[13px] font-semibold leading-tight mb-0.5" style={{ color: "var(--cp-txt)" }}>
                        {OFFICE.name}
                      </p>
                      <p className="text-[11.5px] leading-snug mb-2" style={{ color: "var(--cp-txt-soft)" }}>
                        {OFFICE.address}
                      </p>
                      <a
                        href={buildDirectionsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"
                        style={{ color: "var(--cp-txt)" }}
                      >
                        <FaMapMarkerAlt className="text-[9px]" />
                        Get directions
                      </a>
                    </div>
                  </div>
                </div>

                <a href={buildMapExternalUrl()} target="_blank" rel="noopener noreferrer" className="cp-map-badge">
                  <FaExternalLinkAlt className="text-[8px]" />
                  Google Maps
                </a>
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="mb-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--cp-txt-faint)" }}>
                FAQ
              </span>
              <h2 className="font-bold text-[22px] mt-2 mb-2" style={{ color: "var(--cp-txt)", letterSpacing: "-0.02em" }}>
                Frequently Asked Questions
              </h2>
              <p className="text-[13.5px]" style={{ color: "var(--cp-txt-soft)" }}>
                Find quick answers to common questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3 max-w-4xl">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.06 * index }}
                    className="cp-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors"
                      style={{ background: "transparent" }}
                    >
                      <h3 className="font-semibold text-[13.5px] flex items-start gap-2 pr-2" style={{ color: "var(--cp-txt)" }}>
                        <span style={{ color: "var(--cp-txt-faint)" }} className="flex-shrink-0 font-bold">Q:</span>
                        {faq.question}
                      </h3>
                      <span
                        className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          background: isOpen ? "var(--cp-txt)" : "var(--cp-panel-2)",
                          color: isOpen ? "var(--cp-bg)" : "var(--cp-txt-faint)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          border: "1px solid var(--cp-line)",
                        }}
                      >
                        <FaChevronDown className="text-[9px]" />
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p
                            className="px-4 pb-4 text-[13px] leading-relaxed"
                            style={{ color: "var(--cp-txt-soft)" }}
                          >
                            <span className="font-bold" style={{ color: "var(--cp-txt-faint)" }}>A:</span>{" "}
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Footer note */}
          <div className="pt-8 border-t" style={{ borderColor: "var(--cp-line)" }}>
            <p className="text-center text-[12px] font-medium" style={{ color: "var(--cp-txt-faint)" }}>
              Apex — We usually reply within 24 hours
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;