// components/Timer/PremiumBadge.jsx
import React from 'react';
import { FaCrown, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PremiumBadge = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
    xl: 'text-lg px-5 py-2',
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold rounded-full shadow-lg shadow-amber-500/30 ${sizes[size] || sizes.md}`}
    >
      <span className="relative">
        <FaCrown className={`${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-sm'}`} />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      </span>
      {showText && (
        <span className="tracking-wide">Premium</span>
      )}
      {size !== 'sm' && (
        <FaCheckCircle className={`${size === 'lg' ? 'text-sm' : 'text-[10px]'} opacity-80`} />
      )}
    </motion.div>
  );
};

export default PremiumBadge;