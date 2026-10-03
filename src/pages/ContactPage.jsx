// pages/ContactPage.jsx — Modern contact page with #fc9d03 accent
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
  FaBolt,
  FaCrown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ═══ CONTACT PAGE THEME TOKENS ═══ */
    .theme-dark {
      --cp-bg:           #0A0A12;
      --cp-bg-2:         #0F0F1A;
      --cp-panel:        #13131C;
      --cp-panel-2:      #1A1A24;
      --cp-surface:      rgba(255,255,255,0.045);
      --cp-line:         rgba(255,255,255,0.08);
      --cp-line-str:     rgba(255,255,255,0.15);
      --cp-txt:          #FFFFFF;
      --cp-txt-soft:     rgba(255,255,255,0.65);
      --cp-txt-faint:    rgba(255,255,255,0.42);
      --cp-dot:          rgba(252,157,3,0.08);
      --cp-accent:       #fc9d03;
      --cp-accent-2:     #ffb733;
      --cp-accent-3:     #eb7d34;
      --cp-accent-soft:  rgba(252,157,3,0.14);
      --cp-accent-glow:  rgba(252,157,3,0.45);
      --cp-accent-txt:   #fc9d03;
      --cp-accent-dark:  #0A0A12;
      --cp-danger:       #FF6B6B;
      --cp-success:      #4ADE80;
      --cp-input-bg:     rgba(255,255,255,0.04);
    }
    .theme-light {
      --cp-bg:           #FFFFFF;
      --cp-bg-2:         #FAF7F3;
      --cp-panel:        #FFFFFF;
      --cp-panel-2:      #F6F7F9;
      --cp-surface:      rgba(20,20,30,0.04);
      --cp-line:         rgba(20,20,30,0.08);
      --cp-line-str:     rgba(20,20,30,0.14);
      --cp-txt:          #1A1613;
      --cp-txt-soft:     rgba(26,22,19,0.62);
      --cp-txt-faint:    rgba(26,22,19,0.42);
      --cp-dot:          rgba(224,137,0,0.08);
      --cp-accent:       #e08900;
      --cp-accent-2:     #fc9d03;
      --cp-accent-3:     #eb7d34;
      --cp-accent-soft:  rgba(224,137,0,0.10);
      --cp-accent-glow:  rgba(224,137,0,0.35);
      --cp-accent-txt:   #B87B00;
      --cp-accent-dark:  #0A0A12;
      --cp-danger:       #DC2626;
      --cp-success:      #16A34A;
      --cp-input-bg:     rgba(20,20,30,0.03);
    }

    .cp-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--cp-accent-soft), transparent 60%),
        linear-gradient(180deg, var(--cp-bg) 0%, var(--cp-bg-2) 100%);
      color: var(--cp-txt);
    }

    /* Gradient CTA (amber) */
    .cp-cta {
      background: linear-gradient(135deg, var(--cp-accent) 0%, var(--cp-accent-2) 50%, var(--cp-accent-3) 100%);
      color: var(--cp-accent-dark);
      font-weight: 800;
      box-shadow: 0 15px 40px -15px var(--cp-accent-glow);
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    }
    .cp-cta:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.05);
      box-shadow: 0 20px 50px -15px var(--cp-accent-glow);
    }
    .cp-cta:active:not(:disabled) { transform: scale(0.98); }

    /* Green WhatsApp CTA */
    .cp-cta-green {
      background: linear-gradient(135deg, #164B3B 0%, #1f6b52 100%);
      color: #FFFFFF;
      font-weight: 800;
      box-shadow: 0 15px 40px -15px rgba(22,75,59,0.6);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .cp-cta-green:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 50px -15px rgba(22,75,59,0.8);
    }
    .cp-cta-green:active { transform: scale(0.98); }

    /* Panel */
    .cp-panel {
      background: var(--cp-panel);
      border: 1px solid var(--cp-line);
      box-shadow: 0 20px 60px -25px rgba(0,0,0,0.25);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }

    /* Contact card */
    .cp-card {
      background: var(--cp-panel);
      border: 1px solid var(--cp-line);
      box-shadow: 0 10px 30px -20px rgba(0,0,0,0.3);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .cp-card:hover {
      border-color: var(--cp-accent);
      box-shadow: 0 20px 40px -20px var(--cp-accent-glow);
      transform: translateY(-4px);
    }

    /* Input */
    .cp-input {
      width: 100%;
      padding: 12px 16px 12px 40px;
      border-radius: 12px;
      background: var(--cp-input-bg);
      color: var(--cp-txt);
      border: 1px solid var(--cp-line);
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .cp-input::placeholder { color: var(--cp-txt-faint); }
    .cp-input:focus {
      border-color: var(--cp-accent);
      background: var(--cp-input-bg);
      box-shadow: 0 0 0 3px var(--cp-accent-soft);
    }
    .cp-input.cp-input-error {
      border-color: var(--cp-danger);
      box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
    }

    /* Social icon */
    .cp-social {
      background: var(--cp-surface);
      border: 1px solid var(--cp-line);
      color: var(--cp-txt-soft);
      transition: all 0.25s ease;
    }
    .cp-social:hover {
      color: #FFFFFF;
      border-color: transparent;
      transform: translateY(-3px) scale(1.08);
    }
    .cp-social.tw:hover  { background: #1DA1F2; box-shadow: 0 10px 25px -10px rgba(29,161,242,0.5); }
    .cp-social.li:hover  { background: #0A66C2; box-shadow: 0 10px 25px -10px rgba(10,102,194,0.5); }
    .cp-social.gh:hover  { background: #333333; box-shadow: 0 10px 25px -10px rgba(51,51,51,0.5); }
    .cp-social.yt:hover  { background: #FF0000; box-shadow: 0 10px 25px -10px rgba(255,0,0,0.5); }
    .cp-social.ig:hover  { background: #E4405F; box-shadow: 0 10px 25px -10px rgba(228,64,95,0.5); }
    .cp-social.fb:hover  { background: #1877F2; box-shadow: 0 10px 25px -10px rgba(24,119,242,0.5); }

    /* Shimmer sweep */
    @keyframes cp-sweep {
      0%   { transform: translateX(-120%); }
      100% { transform: translateX(220%); }
    }
    .cp-sweep { animation: cp-sweep 1.1s ease-in-out infinite; }
  `}</style>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  // Contact info
  const contactInfo = [
    {
      icon: FaEnvelope,
      title: "Email Us",
      details: "hello@apnadeal.com",
      link: "mailto:hello@apnadeal.com",
      accent: "var(--cp-accent)",
      gradient: "linear-gradient(135deg, var(--cp-accent) 0%, var(--cp-accent-3) 100%)",
    },
    {
      icon: FaPhone,
      title: "Call Us",
      details: "+92 314 0972575",
      link: "tel:+923140972575",
      accent: "#164B3B",
      gradient: "linear-gradient(135deg, #164B3B 0%, #1f6b52 100%)",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Visit Us",
      details: "San Francisco, CA 94105",
      link: "#",
      accent: "#2A6FB8",
      gradient: "linear-gradient(135deg, #2A6FB8 0%, #2A8FBD 100%)",
    },
    {
      icon: FaClock,
      title: "Working Hours",
      details: "Mon–Fri: 9:00 AM – 6:00 PM",
      link: "#",
      accent: "#6B4A8A",
      gradient: "linear-gradient(135deg, #6B4A8A 0%, #8B5CF6 100%)",
    },
  ];

  // Social links
  const socialLinks = [
    { icon: FaTwitter,   href: "#", label: "Twitter",   cls: "tw" },
    { icon: FaLinkedin,  href: "#", label: "LinkedIn",  cls: "li" },
    { icon: FaGithub,    href: "#", label: "GitHub",    cls: "gh" },
    { icon: FaYoutube,   href: "#", label: "YouTube",   cls: "yt" },
    { icon: FaInstagram, href: "#", label: "Instagram", cls: "ig" },
    { icon: FaFacebook,  href: "#", label: "Facebook",  cls: "fb" },
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does APNa Deal work?",
      answer:
        "APNa Deal connects buyers and sellers in one place. Post your ad, get verified, and sell within 3–4 days. Buyers can browse, chat, and purchase safely.",
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      <FontStyles />
      <div className="min-h-screen pt-20 sm:pt-24 cp-bg font-ticket-body">
        {/* decorative top gradient bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--cp-accent) 50%, transparent 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* ───── Header ───── */}
          <div className="mb-10 sm:mb-14">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[12px] sm:text-sm font-semibold transition-colors mb-5"
              style={{ color: "var(--cp-txt-soft)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--cp-accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--cp-txt-soft)"; }}
            >
              <FaArrowLeft className="text-[10px]" />
              Back to Home
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div
                className="p-4 sm:p-5 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--cp-accent) 0%, var(--cp-accent-3) 100%)",
                  boxShadow: "0 15px 40px -15px var(--cp-accent-glow)",
                }}
              >
                <FaHeadset className="text-2xl sm:text-3xl" style={{ color: "var(--cp-accent-dark)" }} />
              </div>
              <div>
                <h1
                  className="font-ticket-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                  style={{ color: "var(--cp-txt)" }}
                >
                  Get in Touch
                </h1>
                <p
                  className="mt-2 text-sm sm:text-base max-w-xl"
                  style={{ color: "var(--cp-txt-soft)" }}
                >
                  We'd love to hear from you. Reach out with any questions, feedback, or partnership ideas.
                </p>
              </div>
            </div>
          </div>

          {/* ───── Contact Grid ───── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-5 gap-6 sm:gap-8"
          >
            {/* Left — Contact Form */}
            <motion.div variants={item} className="lg:col-span-3">
              <div className="cp-panel relative rounded-3xl p-5 sm:p-7 lg:p-8 overflow-hidden">
                {/* decorative corner glow */}
                <div
                  className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-25"
                  style={{ background: "var(--cp-accent)" }}
                />

                <div className="relative">
                  <h2
                    className="font-ticket-display text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3"
                    style={{ color: "var(--cp-txt)" }}
                  >
                    <FaComment style={{ color: "var(--cp-accent)" }} />
                    Send a Message
                  </h2>

                  <AnimatePresence mode="wait">
                    {isSubmitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 sm:p-8 rounded-2xl text-center"
                        style={{
                          background: "rgba(22,75,59,0.08)",
                          border: "1px solid rgba(22,75,59,0.3)",
                        }}
                      >
                        <div
                          className="h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4"
                          style={{
                            background: "linear-gradient(135deg, #164B3B 0%, #1f6b52 100%)",
                            boxShadow: "0 10px 30px -10px rgba(22,75,59,0.6)",
                          }}
                        >
                          <FaCheckCircle className="text-3xl text-white" />
                        </div>
                        <h3
                          className="font-ticket-display text-xl font-bold"
                          style={{ color: "var(--cp-txt)" }}
                        >
                          Message Sent!
                        </h3>
                        <p className="mt-2 text-sm" style={{ color: "var(--cp-txt-soft)" }}>
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
                        className="space-y-4 sm:space-y-5"
                      >
                        {/* Name */}
                        <div>
                          <label
                            className="block text-[12px] sm:text-sm font-semibold mb-1.5"
                            style={{ color: "var(--cp-txt)" }}
                          >
                            Full Name
                          </label>
                          <div className="relative">
                            <FaUser
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none z-10"
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
                            <p className="mt-1 text-[11px] sm:text-xs" style={{ color: "var(--cp-danger)" }}>
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            className="block text-[12px] sm:text-sm font-semibold mb-1.5"
                            style={{ color: "var(--cp-txt)" }}
                          >
                            Email Address
                          </label>
                          <div className="relative">
                            <FaEnvelope
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none z-10"
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
                            <p className="mt-1 text-[11px] sm:text-xs" style={{ color: "var(--cp-danger)" }}>
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Subject */}
                        <div>
                          <label
                            className="block text-[12px] sm:text-sm font-semibold mb-1.5"
                            style={{ color: "var(--cp-txt)" }}
                          >
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
                            <p className="mt-1 text-[11px] sm:text-xs" style={{ color: "var(--cp-danger)" }}>
                              {errors.subject}
                            </p>
                          )}
                        </div>

                        {/* Message */}
                        <div>
                          <label
                            className="block text-[12px] sm:text-sm font-semibold mb-1.5"
                            style={{ color: "var(--cp-txt)" }}
                          >
                            Message
                          </label>
                          <div className="relative">
                            <FaComment
                              className="absolute left-4 top-4 text-xs pointer-events-none z-10"
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
                            <p className="mt-1 text-[11px] sm:text-xs" style={{ color: "var(--cp-danger)" }}>
                              {errors.message}
                            </p>
                          ) : (
                            <p
                              className="mt-1 text-[11px] text-right tabular-nums"
                              style={{ color: "var(--cp-txt-faint)" }}
                            >
                              {formData.message.length}/500
                            </p>
                          )}
                        </div>

                        {/* Submit */}
                        <motion.button
                          whileHover={isSubmitting ? {} : { y: -2 }}
                          whileTap={isSubmitting ? {} : { scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="cp-cta relative w-full py-3.5 sm:py-4 rounded-2xl text-sm flex items-center justify-center gap-3 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSubmitting && (
                            <span className="absolute inset-y-0 w-1/2 pointer-events-none cp-sweep"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                              }}
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
              </div>
            </motion.div>

            {/* Right — Contact Info */}
            <motion.div variants={item} className="lg:col-span-2 space-y-5 sm:space-y-6">
              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.a
                      key={index}
                      href={info.link}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="cp-card group block rounded-2xl p-4 sm:p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="p-3 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundColor: `${info.accent}15` }}
                        >
                          <div
                            className="h-7 w-7 rounded-lg flex items-center justify-center shadow-md"
                            style={{ background: info.gradient }}
                          >
                            <Icon className="text-white text-xs" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-ticket-display font-bold text-sm"
                            style={{ color: "var(--cp-txt)" }}
                          >
                            {info.title}
                          </h3>
                          <p
                            className="text-[13px] truncate transition-colors"
                            style={{ color: "var(--cp-txt-soft)" }}
                          >
                            {info.details}
                          </p>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="cp-panel rounded-2xl p-5 sm:p-6">
                <h3
                  className="font-ticket-display font-bold mb-4 flex items-center gap-2 text-sm sm:text-base"
                  style={{ color: "var(--cp-txt)" }}
                >
                  <FaGlobe style={{ color: "var(--cp-accent)" }} />
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={index}
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className={`cp-social ${social.cls} p-2.5 sm:p-3 rounded-xl`}
                      >
                        <Icon className="text-base" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* Live Chat Button */}
              <motion.a
                href="https://wa.me/923140972575"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="cp-cta-green group relative w-full py-4 rounded-2xl text-sm flex items-center justify-center gap-3 overflow-hidden"
              >
                <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </span>
                <FaWhatsapp className="text-xl relative z-10" />
                <span className="relative z-10">Start Live Chat</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ───── FAQ Section ───── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 sm:mt-20"
          >
            <div className="text-center mb-8 sm:mb-10">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-3"
                style={{
                  background: "var(--cp-accent-soft)",
                  color: "var(--cp-accent-txt)",
                  border: "1px solid var(--cp-accent)",
                }}
              >
                FAQ
              </span>
              <h2
                className="font-ticket-display text-2xl sm:text-3xl lg:text-4xl font-bold"
                style={{ color: "var(--cp-txt)" }}
              >
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--cp-txt-soft)" }}>
                Find quick answers to common questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * (index + 1) }}
                    className="cp-card rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left transition-colors"
                      style={{ background: "transparent" }}
                    >
                      <h3
                        className="font-ticket-display font-bold text-sm sm:text-[15px] flex items-start gap-2 pr-2"
                        style={{ color: "var(--cp-txt)" }}
                      >
                        <span style={{ color: "var(--cp-accent)" }} className="flex-shrink-0">Q:</span>
                        {faq.question}
                      </h3>
                      <span
                        className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300"
                        style={
                          isOpen
                            ? {
                                background: "var(--cp-accent)",
                                color: "var(--cp-accent-dark)",
                                transform: "rotate(180deg)",
                              }
                            : {
                                background: "var(--cp-surface)",
                                color: "var(--cp-txt-faint)",
                              }
                        }
                      >
                        <FaChevronDown className="text-[10px]" />
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p
                            className="px-4 sm:px-5 pb-4 sm:pb-5 text-[13px] sm:text-sm leading-relaxed"
                            style={{ color: "var(--cp-txt-soft)" }}
                          >
                            <span className="font-bold" style={{ color: "var(--cp-accent)" }}>A:</span>{" "}
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ───── Footer note ───── */}
          <div
            className="mt-16 sm:mt-20 pt-8 border-t"
            style={{ borderColor: "var(--cp-line)" }}
          >
            <div
              className="flex items-center justify-center gap-2"
              style={{ color: "var(--cp-txt-soft)" }}
            >
              <FaBolt className="text-xs" style={{ color: "var(--cp-accent)" }} />
              <p className="font-ticket-body text-[11px] sm:text-xs font-bold tracking-wide">
                APNa Deal — We usually reply within 24 hours
              </p>
              <FaCrown className="text-xs" style={{ color: "var(--cp-accent)" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;