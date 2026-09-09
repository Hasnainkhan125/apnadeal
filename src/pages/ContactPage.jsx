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
  // FaMessage,  ← REMOVE THIS LINE
  FaMailBulk,
  FaWhatsapp
} from "react-icons/fa";
import { motion } from "framer-motion";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Contact info
  const contactInfo = [
    {
      icon: FaEnvelope,
      title: "Email Us",
      details: "hello@aistudy.com",
      link: "snachart1122@gmail.com",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      icon: FaPhone,
      title: "Call Us",
      details: "+92 3140972575",
      link: "tel:+923140972575",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Visit Us",
      details: "San Francisco, CA 94105",
      link: "#",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      icon: FaClock,
      title: "Working Hours",
      details: "Mon-Fri: 9:00 AM - 6:00 PM",
      link: "#",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30"
    }
  ];

  // Social links
  const socialLinks = [
    { icon: FaTwitter, href: "#", label: "Twitter", color: "hover:bg-[#1DA1F2]" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn", color: "hover:bg-[#0A66C2]" },
    { icon: FaGithub, href: "#", label: "GitHub", color: "hover:bg-[#333]" },
    { icon: FaYoutube, href: "#", label: "YouTube", color: "hover:bg-[#FF0000]" },
    { icon: FaInstagram, href: "#", label: "Instagram", color: "hover:bg-[#E4405F]" },
    { icon: FaFacebook, href: "#", label: "Facebook", color: "hover:bg-[#1877F2]" }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does AI Study Assistant work?",
      answer: "AI Study Assistant uses advanced AI to analyze your study materials and generate summaries, flashcards, and quizzes automatically."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use industry-standard encryption and never share your data. Your privacy is our top priority."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely! You can cancel your subscription at any time with no questions asked."
    },
    {
      question: "What file formats do you support?",
      answer: "We support PDF, DOCX, TXT, and many more formats. Simply upload your file and we'll handle the rest."
    }
  ];

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
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

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  // Container animation
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-4"
          >
            <FaArrowLeft className="text-xs" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
              <FaHeadset className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
                Get in Touch
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1">
                We'd love to hear from you. Reach out with any questions or feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-5 gap-8"
        >
          {/* Left - Contact Form */}
          <motion.div variants={item} className="lg:col-span-3">
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-3">
  <FaComment className="text-amber-500" />  {/* ← Changed from FaMessage */}
                    Send a Message
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center"
                >
                  <FaCheckCircle className="text-5xl text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Message Sent!</h3>
                  <p className="text-stone-600 dark:text-stone-400 mt-2">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.name ? 'border-red-500' : 'border-stone-200 dark:border-stone-700'
                        } bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.email ? 'border-red-500' : 'border-stone-200 dark:border-stone-700'
                        } bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.subject ? 'border-red-500' : 'border-stone-200 dark:border-stone-700'
                      } bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <FaComment className="absolute left-3 top-3 text-stone-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        rows="5"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.message ? 'border-red-500' : 'border-stone-200 dark:border-stone-700'
                        } bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors resize-none`}
                      />
                    </div>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                    )}
                    <p className="mt-1 text-xs text-stone-400 text-right">
                      {formData.message.length}/500 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Right - Contact Info */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${info.bg} flex-shrink-0`}>
                        <div className={`h-6 w-6 rounded-lg bg-gradient-to-r ${info.color} flex items-center justify-center shadow-md`}>
                          <Icon className="text-white text-sm" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
                          {info.title}
                        </h3>
                        <a
                          href={info.link}
                          className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          {info.details}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
              <h3 className="font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                <FaGlobe className="text-amber-500" />
                Connect With Us
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 ${social.color} transition-all duration-300`}
                    >
                      <Icon className="text-lg" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Live Chat Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <FaWhatsapp className="text-xl" />
              Start Live Chat
            </motion.button>
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-sm font-medium mb-3">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-stone-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2">
              Find quick answers to common questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <h3 className="font-semibold text-stone-900 dark:text-white mb-2 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 pl-5">
                  <span className="text-amber-500">A:</span> {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;