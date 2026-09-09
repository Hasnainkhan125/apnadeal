import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowRight, FaGraduationCap, FaBrain, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Slideshow images
  const slides = [
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/image1.png",
    },
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/Image2.png",
    },
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/Image3.png",
    },
    {
      image: "https://pictory-static.pictorycontent.com/static/images/auth/Image4.png",
    }
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error);
      } else {
        setSuccess('Password reset link sent to your email!');
        setIsSent(true);
        setEmail('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex w-screen h-screen bg-white dark:bg-stone-950">
      {/* Left Column - Full Height with Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-black/20">
              <FaGraduationCap className="text-white text-[26px] sm:text-[29px]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight">
                <span className="text-white/90">AI</span>
                <span className="text-black/75">Study</span>
              </span>
              <span className="block text-[10px] font-medium text-white/90 -mt-1.5">
                Assistant
              </span>
            </div>
          </Link>
        </div>

        {/* Slideshow */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <img
                      src={slides[currentImageIndex].image}
                      alt="Auth"
                      className="w-full aspect-[5/5] object-contain"
                    />
                  </motion.div>
                </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center px-6 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center">
                <FaGraduationCap className="text-white text-[26px] sm:text-[29px] " />
              </div>
              <span className="text-xl font-black">
                <span className="text-amber-500">AI</span>
                <span className="text-stone-900 dark:text-white">Study</span>
              </span>
            </Link>
          </div>

           {/* Header - Centered with no line break */}
                       <motion.div
                         initial="hidden"
                         animate="visible"
                         className="mb-6 sm:mb-8 text-center"
                       > <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight">Reset 
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500">Password </span></h2>
                         <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base mt-2 font-medium">
              Enter your email to receive a reset link
                         </p>
                       </motion.div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm">
              {success}
            </div>
          )}

          {/* Success State */}
          {isSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-emerald-500 text-5xl" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                Check Your Email
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                We've sent a password reset link to your email address.
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold  transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <FaArrowLeft className="text-xs" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Features */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure reset
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              24/7 support
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;