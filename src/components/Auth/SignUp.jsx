import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGraduationCap,
  FaGoogle,
  FaGithub,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaRobot,
  FaInfoCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();
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

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    let score = 0;
    let feedback = [];

    if (!pass) {
      return { score: 0, strength: 'Empty', color: 'bg-stone-200', textColor: 'text-stone-400', feedback: [] };
    }

    if (pass.length >= 8) {
      score++;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) {
      score++;
    } else {
      feedback.push('Mix of uppercase and lowercase');
    }

    if (/\d/.test(pass)) {
      score++;
    } else {
      feedback.push('At least one number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      score++;
    } else {
      feedback.push('At least one special character');
    }

    const strengths = [
      { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600', icon: FaTimesCircle, iconColor: 'text-red-500' },
      { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-600', icon: FaExclamationTriangle, iconColor: 'text-orange-500' },
      { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600', icon: FaCheckCircle, iconColor: 'text-blue-500' },
      { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', icon: FaCheckCircle, iconColor: 'text-emerald-500' },
    ];

    let strengthIndex = 0;
    if (score >= 4) strengthIndex = 3;
    else if (score >= 3) strengthIndex = 2;
    else if (score >= 2) strengthIndex = 1;
    else if (score >= 1) strengthIndex = 0;

    return {
      score,
      strength: strengths[strengthIndex].label,
      color: strengths[strengthIndex].color,
      textColor: strengths[strengthIndex].textColor,
      icon: strengths[strengthIndex].icon,
      iconColor: strengths[strengthIndex].iconColor,
      feedback,
      percent: (score / 4) * 100,
    };
  };

  const passwordStrength = checkPasswordStrength(password);

  // Get error color based on type
  const getErrorColor = (type) => {
    switch(type) {
      case 'verification_required':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400';
      case 'auth_error':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
      case 'email_required':
      case 'email_invalid':
      case 'password_required':
      case 'password_short':
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400';
      default:
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setErrorType('');
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error);
        setErrorType('auth_error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setErrorType('');
    setLoading(true);
    
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setError(error);
        setErrorType('auth_error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setSuccess('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      setErrorType('name_required');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      setErrorType('email_required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setErrorType('email_invalid');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setErrorType('password_short');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setErrorType('password_mismatch');
      return;
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service.');
      setErrorType('terms_required');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        setError(error);
        setErrorType('auth_error');
      } else {
        setSuccess('Account created successfully! Please check your email to confirm your account.');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate('/signin'), 4000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setErrorType('unexpected');
    }
    
    setLoading(false);
  };

  // Get error icon based on type
  const getErrorIcon = (type) => {
    switch(type) {
      case 'verification_required':
        return <FaShieldAlt className="text-amber-500 flex-shrink-0" />;
      case 'email_required':
      case 'email_invalid':
        return <FaEnvelope className="text-red-500 flex-shrink-0" />;
      case 'password_required':
      case 'password_short':
      case 'password_mismatch':
        return <FaLock className="text-red-500 flex-shrink-0" />;
      case 'name_required':
        return <FaUser className="text-red-500 flex-shrink-0" />;
      case 'auth_error':
        return <FaExclamationTriangle className="text-red-500 flex-shrink-0" />;
      default:
        return <FaInfoCircle className="text-red-500 flex-shrink-0" />;
    }
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
      {/* Left Column - Full Height with Slideshow */}
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
              <FaGraduationCap className="text-white text-[26px] sm:text-[29px]" />
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

      {/* Right Column - Form with better scrolling on mobile */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-start lg:items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto my-auto"
        >
          {/* Header - Centered with no line break */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 sm:mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center  flex-shrink-0">
                <FaGraduationCap className="text-white text-[26px]" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight">
                  <span className="text-amber-500">AI</span>
                  <span className="text-stone-900 dark:text-white">Study</span>
                </span>
                <span className="block text-[10px] font-medium text-stone-400 dark:text-stone-500 -mt-0.5 tracking-wider">
                  Assistant
                </span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">Account</span>
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">
              Start your AI-powered learning journey
            </p>
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5 sm:space-y-3"
          >
            <motion.button
              variants={itemVariants}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 hover:border-amber-500/50 text-stone-700 dark:text-stone-200 transition-all duration-300 text-sm font-semibold"
            >
              <FaGoogle className="text-red-500" />
              Continue with Google
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 hover:border-amber-500/50 text-stone-700 dark:text-stone-200 transition-all duration-300 text-sm font-semibold"
            >
              <FaGithub className="text-stone-800 dark:text-stone-200" />
              Continue with GitHub
            </motion.button>

            <div className="flex items-center gap-4 my-4 sm:my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent" />
              <span className="text-xs text-stone-400 dark:text-stone-500 font-bold tracking-widest">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent" />
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border ${getErrorColor(errorType)} text-sm font-medium flex items-start gap-2 shadow-sm`}
              >
                {getErrorIcon(errorType)}
                <span className="break-words flex-1 text-xs sm:text-sm">{error}</span>
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
                className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                <span className="break-words text-xs sm:text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
          >
            <motion.div variants={itemVariants}>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1 sm:mb-1.5 tracking-wide">
                Full Name
              </label>
              <div className="relative group">
                <FaUser className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-500 transition-colors text-sm sm:text-base" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1 sm:mb-1.5 tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-500 transition-colors text-sm sm:text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </motion.div>

            {/* Password with Strength Indicator */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1 sm:mb-1.5 tracking-wide">
                Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-500 transition-colors text-sm sm:text-base" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="•••••••• (min 8 characters)"
                  className="w-full pl-9 sm:pl-12 pr-10 sm:pr-14 py-3 sm:py-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-300"
                >
                  {showPassword ? <FaEyeSlash className="text-base sm:text-lg" /> : <FaEye className="text-base sm:text-lg" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 space-y-2"
                  >
                    {/* Strength Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.percent}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`h-full ${passwordStrength.color} rounded-full`}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold ${passwordStrength.textColor} flex items-center gap-1`}>
                        <passwordStrength.icon className={`text-xs sm:text-sm ${passwordStrength.iconColor}`} />
                        {passwordStrength.strength}
                      </span>
                    </div>

                    {/* Feedback Messages */}
                    {passwordStrength.feedback.length > 0 && passwordStrength.score < 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-1"
                      >
                        <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-semibold">
                          Password suggestions:
                        </p>
                        {passwordStrength.feedback.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-1.5 text-[10px] sm:text-xs text-stone-500 dark:text-stone-400"
                          >
                            <span className="text-amber-500 text-[10px]">•</span>
                            {msg}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Strong Password Message */}
                    {passwordStrength.score >= 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                      >
                        <FaCheckCircle className="text-emerald-500" />
                        <span>Great password! Strong and secure.</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 mb-1 sm:mb-1.5 tracking-wide">
                Confirm Password
              </label>
              <div className="relative group">
                <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-500 transition-colors text-sm sm:text-base" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 sm:pl-12 pr-10 sm:pr-14 py-3 sm:py-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors duration-300"
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-base sm:text-lg" /> : <FaEye className="text-base sm:text-lg" />}
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
                    <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-medium ${password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
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

            <motion.div variants={itemVariants} className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 sm:h-5 sm:w-5 min-w-[16px] sm:min-w-[20px] rounded-lg border-2 border-stone-300 dark:border-stone-600 text-amber-500 focus:ring-4 focus:ring-amber-500/20 focus:ring-offset-0 transition-all duration-300 cursor-pointer mt-0.5"
              />
              <label htmlFor="agree" className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold  hover:shadow-amber-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <span className="inline-block h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <FaArrowRight className="text-xs sm:text-sm" />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400"
          >
            Already have an account?{' '}
            <Link to="/signin" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold transition-colors">
              Sign in
            </Link>
          </motion.p>

          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-stone-400 dark:text-stone-500"
          >
            <motion.span variants={itemVariants} className="flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-500 text-xs sm:text-sm" />
              Secure signup
            </motion.span>
            <motion.span variants={itemVariants} className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500 text-xs sm:text-sm" />
              Encrypted data
            </motion.span>
            <motion.span variants={itemVariants} className="flex items-center gap-1.5">
              <FaRobot className="text-emerald-500 text-xs sm:text-sm" />
              24/7 support
            </motion.span>
          </motion.div>

          {/* Security Note */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700"
          >
            <p className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500 text-center leading-relaxed">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;