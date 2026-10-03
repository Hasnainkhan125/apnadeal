import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaStore, FaCar, FaMobileAlt, FaHome, FaLaptop } from "react-icons/fa";
import { motion } from "framer-motion";
import CategoryCard from "../CategoryCard/CategoryCard";

/**
 * CategoryGrid — Reusable category section with header
 *
 * Props:
 *  - badge       : string (default: "Browse Categories")
 *  - title       : string (default: "What Are You Looking For?")
 *  - titleAccent : string (default: "Looking For?")
 *  - subtitle    : string
 *  - categories  : array of { title, subtitle, listings, icon, path }
 *  - ctaText     : string (default: "View All Categories")
 *  - ctaPath     : string (default: "/browse")
 */
const CategoryGrid = ({
  badge = "Browse Categories",
  title = "What Are You",
  titleAccent = "Looking For?",
  subtitle = "From vehicles and property to phones and gadgets — find it all in one place",
  categories = [],
  ctaText = "View All Categories",
  ctaPath = "/browse",
}) => {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-white dark:bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-900 dark:text-red-300 text-xs sm:text-sm font-semibold border border-red-200 dark:border-red-500/30 mb-3">
            <span className="h-2 w-2 rounded-full bg-red-700 animate-pulse" />
            {badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-red-900 dark:text-white mb-3 tracking-tight">
            {title}{" "}
            <span className="text-black dark:text-red-800">{titleAccent}</span>
          </h2>
          <p className="text-red-900/70 dark:text-red-100/60 max-w-2xl mx-auto text-sm sm:text-base px-4">
            {subtitle}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
        >
          {categories.map((category, i) => (
            <motion.div key={i} variants={rise}>
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        {ctaText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mt-10 sm:mt-12"
          >
            <Link
              to={ctaPath}
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-red-900 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <FaStore className="text-xs sm:text-sm" />
              {ctaText}
              <FaArrowRight className="text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;