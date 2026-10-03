import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

/**
 * CategoryCard — Modern reusable card
 *
 * Props:
 *  - title       : string (e.g., "Vehicles")
 *  - subtitle    : string (e.g., "Cars, bikes & more")
 *  - listings    : string (e.g., "12,500+ listings")
 *  - icon        : React Component (e.g., FaCar)
 *  - path        : string (e.g., "/vehicles")
 *  - gradient    : string (e.g., "from-red-600 via-red-700 to-red-900")
 *  - glowColor   : string (e.g., "bg-red-500/20")
 *  - buttonText  : string (default: "Browse")
 */
const CategoryCard = ({
  title,
  subtitle,
  listings,
  icon: Icon,
  path,
  gradient = "from-red-600 via-red-700 to-red-900",
  glowColor = "bg-red-500/20",
  buttonText = "Browse",
}) => {
  return (
    <div className="group relative h-full">
      <Link
        to={path}
        className="relative block bg-red-50/60 dark:bg-white/5 rounded-3xl border border-red-100 dark:border-red-900/40 hover:border-red-900/60 transition-all duration-500 overflow-hidden h-full"
      >
        {/* Soft glow on hover */}
        <div
          className={`absolute -top-16 -right-16 w-40 h-40 rounded-full ${glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div className="relative p-5 xs:p-6 sm:p-7 md:p-8 flex flex-col h-full">
          {/* Icon */}
          <div
            className={`relative h-14 w-14 xs:h-16 xs:w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 xs:mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            <Icon className="text-white text-xl xs:text-2xl md:text-3xl" />
          </div>

          {/* Title */}
          <h3 className="text-lg xs:text-xl sm:text-2xl md:text-[26px] font-black text-red-900 dark:text-white leading-tight mb-1 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors duration-300">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs xs:text-sm text-red-900/70 dark:text-red-100/60 leading-snug mb-4">
              {subtitle}
            </p>
          )}

          {/* Listings count */}
          {listings && (
            <p className="text-[10px] xs:text-[11px] font-bold uppercase tracking-widest text-red-700/60 dark:text-red-300/50 mb-4">
              {listings}
            </p>
          )}

          {/* Browse row */}
          <div className="mt-auto pt-4 border-t border-red-100 dark:border-red-900/40 flex items-center justify-between">
            <span className="text-xs xs:text-sm font-bold text-red-800 dark:text-red-300 group-hover:text-red-900 dark:group-hover:text-red-200 transition-colors">
              {buttonText}
            </span>
            <div className="h-8 w-8 xs:h-9 xs:w-9 rounded-xl bg-red-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-red-900 transition-all duration-300">
              <FaArrowRight className="text-red-800 dark:text-red-300 text-[10px] xs:text-xs group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CategoryCard;