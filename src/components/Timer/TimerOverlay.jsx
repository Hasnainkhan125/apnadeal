// components/Timer/TimerOverlay.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTimer } from '../../contexts/TimerContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaClock,
  FaCrown,
  FaRocket,
  FaLock,
  FaArrowRight,
  FaSpinner,
  FaHourglassHalf,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TimerOverlay = ({ children, featureName = "This feature" }) => {
  const { 
    timeRemaining, 
    isLocked, 
    userIsPremium, 
    startTimer, 
    formatTime,
    isTimerRunning,
    totalSessions
  } = useTimer();
  const { user } = useAuth();
  const [showTimer, setShowTimer] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // ─── Auto-start timer when component mounts ──────────────────────
  useEffect(() => {
    if (!userIsPremium && !isLocked && !isTimerRunning && !hasAutoStarted) {
      // Auto-start the timer after a small delay
      const autoStartTimeout = setTimeout(() => {
        startTimer();
        setHasAutoStarted(true);
        console.log(`⏱️ Timer auto-started for ${featureName}`);
      }, 1000);
      
      return () => clearTimeout(autoStartTimeout);
    }
  }, [userIsPremium, isLocked, isTimerRunning, hasAutoStarted, startTimer, featureName]);

  // ─── Show timer if not premium and not locked yet ──────────────────
  useEffect(() => {
    if (!userIsPremium && !isLocked) {
      setShowTimer(true);
    } else {
      setShowTimer(false);
    }
  }, [userIsPremium, isLocked]);

  // ─── If user is premium, show children with premium badge ──────────
  if (userIsPremium) {
    return (
      <div className="relative">
        {/* Premium Badge */}
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30"
          >
            <FaCrown className="text-[10px] animate-pulse" />
            <span>Premium</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </motion.div>
        </div>
        {children}
      </div>
    );
  }

  // ─── If locked, show lock overlay ──────────────────────────────────
  if (isLocked) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-6 max-w-sm"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
              <FaLock className="text-amber-400 text-2xl" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              {featureName} Locked
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Your free trial has expired. Upgrade to Premium to continue using {featureName}.
            </p>
            <Link to="/premium">
              <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2 mx-auto">
                <FaCrown /> Upgrade Now <FaArrowRight className="text-xs" />
              </button>
            </Link>
          </motion.div>
        </div>
        <div className="opacity-50 blur-sm pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // ─── Show timer countdown with auto-start status ───────────────────
  const isNearExpiry = timeRemaining < 30; // Less than 30 seconds
  const isExpired = timeRemaining <= 0;

  return (
    <div className="relative">
      {/* Timer Banner */}
      <div className="sticky top-0 z-10 mb-3">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`bg-gradient-to-r ${
            isNearExpiry && !isExpired 
              ? 'from-red-500/20 to-orange-500/20 border-red-200/50 dark:border-red-800/50' 
              : isExpired
                ? 'from-red-600/30 to-red-500/20 border-red-400/50 dark:border-red-700/50'
                : 'from-amber-500/10 to-orange-500/10 border-amber-200/30 dark:border-amber-800/30'
          } border rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 transition-all duration-500`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isExpired ? (
                <FaExclamationTriangle className="text-red-500 text-lg animate-pulse" />
              ) : isNearExpiry ? (
                <FaHourglassHalf className="text-orange-500 text-lg animate-pulse" />
              ) : (
                <FaClock className="text-amber-500 text-lg animate-pulse" />
              )}
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                {isExpired ? 'Trial Expired' : 'Free Trial'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-2xl font-bold font-mono ${
                isExpired 
                  ? 'text-red-600 dark:text-red-400' 
                  : isNearExpiry 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-amber-600 dark:text-amber-400'
              }`}>
                {formatTime(timeRemaining)}
              </span>
              {!isExpired && (
                <span className="text-xs text-stone-400 dark:text-stone-500">remaining</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Timer Status Indicator */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                isTimerRunning && !isExpired
                  ? 'bg-emerald-500 animate-pulse'
                  : isExpired
                    ? 'bg-red-500'
                    : 'bg-amber-500'
              }`} />
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isTimerRunning && !isExpired 
                  ? 'Active' 
                  : isExpired 
                    ? 'Expired' 
                    : 'Ready'}
              </span>
            </div>

            {/* Premium Button - Always visible */}
            <Link to="/premium">
              <button className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all flex items-center gap-1.5">
                <FaCrown className="text-[10px]" />
                <span>Premium</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Warning message when timer is about to expire */}
        {isNearExpiry && !isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              ⚠️ Your trial is about to expire! <Link to="/premium" className="underline font-bold hover:text-orange-700 dark:hover:text-orange-300">Upgrade now</Link>
            </p>
          </motion.div>
        )}

        {/* Expired message */}
        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              ⏰ Your trial has expired. <Link to="/premium" className="underline font-bold hover:text-red-700 dark:hover:text-red-300">Upgrade to Premium</Link> to continue learning!
            </p>
          </motion.div>
        )}
      </div>

      {children}
    </div>
  );
};

export default TimerOverlay;