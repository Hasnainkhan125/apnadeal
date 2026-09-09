import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaUserCheck,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordUpdate = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Slideshow images
  const slides = [
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/image1.png",
      title: "AI-Powered Learning",
      subtitle: "Personalized education at your fingertips"
    },
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/Image2.png",
      title: "Interactive Courses",
      subtitle: "Engage with cutting-edge content"
    },
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/Image3.png",
      title: "Community & Collaboration",
      subtitle: "Learn together, grow together"
    },
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/Image4.png",
      title: "Track Your Progress",
      subtitle: "Achieve your learning goals"
    }
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check if we have the access token from the URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      setError('Invalid or expired reset link. Please request a new one.');
      setErrorType('token_error');
    }
  }, []);

  // Get error color based on type
  const getErrorColor = (type) => {
    switch(type) {
      case 'token_error':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400';
      case 'auth_error':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
      case 'password_required':
      case 'password_short':
      case 'password_mismatch':
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400';
      default:
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
    }
  };

  // Get error icon based on type
  const getErrorIcon = (type) => {
    switch(type) {
      case 'token_error':
        return <FaExclamationTriangle className="text-amber-500 flex-shrink-0" />;
      case 'auth_error':
        return <FaExclamationTriangle className="text-red-500 flex-shrink-0" />;
      case 'password_required':
      case 'password_short':
      case 'password_mismatch':
        return <FaLock className="text-red-500 flex-shrink-0" />;
      default:
        return <FaInfoCircle className="text-red-500 flex-shrink-0" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setSuccess('');

    if (!password.trim()) {
      setError('Please enter a new password.');
      setErrorType('password_required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setErrorType('password_short');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setErrorType('password_mismatch');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error);
        setErrorType('auth_error');
      } else {
        setSuccess('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    }

    setLoading(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="fixed inset-0 flex w-screen h-screen bg-white dark:bg-stone-950">
      {/* Left Column - Premium Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-32 left-20 w-48 h-48 rounded-full bg-white/10 blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-32 right-20 w-56 h-56 rounded-full bg-white/10 blur-2xl"
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-6 left-6 z-20"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <FaGraduationCap className="text-white text-base sm:text-[29px]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-white/90">AI</span>
                <span className="text-black/75">Study</span>
              </span>
              <span className="block text-[10px] font-medium text-white/90 -mt-1.5 tracking-wider">
                Assistant
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Slideshow */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9, rotateY: 5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -5 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-white/20 to-transparent rounded-3xl blur-2xl" />
                <img
                  src={slides[currentImageIndex].image}
                  alt="Auth"
                  className="relative w-full aspect-[5/5] object-contain drop-shadow-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-1"
                >
                  <h3 className="text-3xl font-semibold text-white">
                    {slides[currentImageIndex].title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {slides[currentImageIndex].subtitle}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentImageIndex 
                    ? 'w-10 bg-white shadow-lg shadow-white/30' 
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center px-6 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Header - Centered with no line break */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <FaGraduationCap className="text-white text-[29px]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-amber-500">AI</span>
                  <span className="text-stone-900 dark:text-white">Study</span>
                </span>
                <span className="block text-[10px] font-medium text-stone-400 dark:text-stone-500 -mt-0.5 tracking-wider">
                  Assistant
                </span>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-white tracking-tight">
              Set <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">New Password</span>
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 font-medium">
              Choose a strong and secure password
            </p>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-lg border ${getErrorColor(errorType)} text-sm font-medium flex items-start gap-2 shadow-sm`}
              >
                {getErrorIcon(errorType)}
                <span className="break-words flex-1">{error}</span>
                <button
                  onClick={() => {
                    setError('');
                    setErrorType('');
                  }}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors flex-shrink-0 mt-0.5"
                >
                  <FaTimesCircle className="text-xs" />
                </button>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <FaUserCheck className="text-emerald-500 flex-shrink-0" />
                <span className="break-words">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5 tracking-wide">
                New Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="•••••••• (min 6 characters)"
                  className="w-full pl-12 pr-14 py-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-300"
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1.5 tracking-wide">
                Confirm Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-500 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-14 py-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-300"
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>

              {/* Confirm Password Match Indicator */}
              <AnimatePresence>
                {confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1.5"
                  >
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {password === confirmPassword ? (
                        <>
                          <FaCheckCircle className="text-emerald-500" />
                          <span>Passwords match ✓</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-red-500" />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <span className="inline-block h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Update Password <FaArrowRight className="text-sm" />
                </>
              )}
            </motion.button>

            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <Link
                to="/signin"
                className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <FaArrowLeft className="text-xs" />
                Back to Sign In
              </Link>
            </motion.div>
          </motion.form>

          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 dark:text-stone-500"
          >
            <motion.span variants={itemVariants} className="flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-500 text-sm" />
              Secure password
            </motion.span>
            <motion.span variants={itemVariants} className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500 text-sm" />
              Encrypted data
            </motion.span>
            <motion.span variants={itemVariants} className="flex items-center gap-1.5">
              <FaLock className="text-emerald-500 text-sm" />
              Protected account
            </motion.span>
          </motion.div>

          {/* Security Note */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700"
          >
            <p className="text-[10px] text-stone-400 dark:text-stone-500 text-center leading-relaxed">
              Your password will be securely encrypted and stored.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordUpdate;