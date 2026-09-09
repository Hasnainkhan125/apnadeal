import React from "react";
import { Link } from "react-router-dom";
import { 
  FaBrain, 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaYoutube, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaPhone,
  FaGraduationCap,
  FaHeart,
  FaShieldAlt,
  FaArrowRight
} from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  const footerLinks = {
    "Product": [
      { name: "Summarize", path: "/summarize" },
      { name: "Quiz Generator", path: "/quiz-generator" },
      { name: "Flashcards", path: "/flashcards" },
      { name: "Chat", path: "/chat" },
    ],
    "Company": [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "/careers" },
      { name: "Blog", path: "/blog" },
      { name: "Contact", path: "/contact" },
    ],
    "Legal": [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Disclaimer", path: "/disclaimer" },
    ],
  };

  const socialLinks = [
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: FaGithub, href: "#", label: "GitHub" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-stone-950 to-black text-white overflow-hidden">
      {/* Premium Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10">
        {/* Main Grid - Product & Company in row on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <FaGraduationCap className="text-white text-base sm:text-lg" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight">
                  <span className="text-amber-500">AI</span>
                  <span className="text-white">Study</span>
                </span>
                <span className="block text-[10px] font-medium text-stone-400 -mt-0.5">
                  Assistant
                </span>
              </div>
            </Link>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              AI-powered study tools to help you learn faster, retain more, and achieve better results.
            </p>
            <div className="flex gap-3 mt-5">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="h-9 w-9 rounded-full bg-stone-800/80 hover:bg-amber-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-500/30"
                  >
                    <Icon className="text-stone-400 hover:text-white transition-colors text-sm" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.Product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-stone-400 hover:text-amber-400 text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-stone-400 hover:text-amber-400 text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.Legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-stone-400 hover:text-amber-400 text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Clean with separator */}
        <div className="border-t border-stone-800/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            © {year} <span className="text-amber-400 font-medium">AI Study</span> Assistant. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-sm">
            <Link 
              to="/privacy" 
              className="text-stone-500 hover:text-amber-400 transition-colors duration-200 hover:underline"
            >
              Privacy
            </Link>
            <span className="text-stone-700">|</span>
            <Link 
              to="/terms" 
              className="text-stone-500 hover:text-amber-400 transition-colors duration-200 hover:underline"
            >
              Terms
            </Link>
            <span className="text-stone-700">|</span>
            <Link 
              to="/cookies" 
              className="text-stone-500 hover:text-amber-400 transition-colors duration-200 hover:underline"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;