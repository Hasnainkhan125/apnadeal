import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaGraduationCap,
  FaGoogle,
  FaGithub,
  FaShieldAlt,
  FaRobot,
  FaUserCheck,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSync,
  FaCheck,
  FaMousePointer,
  FaHandPointer
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Real Human Verification States
  const [isHumanVerified, setIsHumanVerified] = useState(false);
  const [showCaptchaDialog, setShowCaptchaDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaTriggered, setCaptchaTriggered] = useState(false);
  
  // Pattern Recognition States
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [patternStarted, setPatternStarted] = useState(false);
  const [patternComplete, setPatternComplete] = useState(false);
  const [mouseTrail, setMouseTrail] = useState([]);
  const [clickTiming, setClickTiming] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [verificationScore, setVerificationScore] = useState(0);
  const canvasRef = useRef(null);

  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();
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

  // Random CAPTCHA trigger on component mount
  useEffect(() => {
    // 30% chance to require CAPTCHA
    const randomChance = Math.random() * 100;
    const shouldShowCaptcha = randomChance < 30; // 30% of the time
    
    setCaptchaRequired(shouldShowCaptcha);
    console.log('🔐 CAPTCHA Required:', shouldShowCaptcha ? 'Yes' : 'No');
    console.log('🎲 Random Chance:', Math.round(randomChance) + '%');
  }, []);

  // Generate random pattern for user to trace
  const generatePattern = () => {
    const points = [];
    const numPoints = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        radius: 8,
        connected: false
      });
    }
    return points;
  };

  // Initialize pattern
  useEffect(() => {
    if (showCaptchaDialog) {
      const newPattern = generatePattern();
      setPattern(newPattern);
      setUserPattern([]);
      setPatternStarted(false);
      setPatternComplete(false);
      setMouseTrail([]);
      setClickTiming([]);
      setStartTime(Date.now());
      setVerificationScore(0);
      drawPattern(newPattern, []);
    }
  }, [showCaptchaDialog]);

  // Draw pattern on canvas
  const drawPattern = (points, userPoints) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < rect.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, rect.height);
      ctx.stroke();
    }
    for (let i = 0; i < rect.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(rect.width, i);
      ctx.stroke();
    }
    
    points.forEach((point, index) => {
      const x = (point.x / 100) * rect.width;
      const y = (point.y / 100) * rect.height;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, point.radius * 1.5);
      gradient.addColorStop(0, '#f59e0b');
      gradient.addColorStop(1, '#d97706');
      
      ctx.beginPath();
      ctx.arc(x, y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(index + 1, x, y);
      
      if (index > 0) {
        const prevX = (points[index - 1].x / 100) * rect.width;
        const prevY = (points[index - 1].y / 100) * rect.height;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    
    if (userPoints.length > 0) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const firstX = (userPoints[0].x / 100) * rect.width;
      const firstY = (userPoints[0].y / 100) * rect.height;
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < userPoints.length; i++) {
        const x = (userPoints[i].x / 100) * rect.width;
        const y = (userPoints[i].y / 100) * rect.height;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    if (mouseTrail.length > 1) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const firstX = mouseTrail[0].x;
      const firstY = mouseTrail[0].y;
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < mouseTrail.length; i++) {
        ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
      }
      ctx.stroke();
    }
  };

  // Handle canvas interaction
  const handleCanvasClick = (e) => {
    if (patternComplete || isVerifying) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    let nearestIndex = -1;
    let nearestDist = Infinity;
    pattern.forEach((point, index) => {
      const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      if (dist < nearestDist && dist < 10) {
        nearestDist = dist;
        nearestIndex = index;
      }
    });
    
    if (nearestIndex !== -1 && !pattern[nearestIndex].connected) {
      const now = Date.now();
      if (startTime) {
        const timeSinceStart = now - startTime;
        setClickTiming([...clickTiming, timeSinceStart]);
      }
      
      const newUserPattern = [...userPattern, pattern[nearestIndex]];
      setUserPattern(newUserPattern);
      
      const newPattern = [...pattern];
      newPattern[nearestIndex].connected = true;
      setPattern(newPattern);
      
      if (newUserPattern.length === pattern.length) {
        setPatternComplete(true);
        analyzeVerification(newUserPattern);
      }
      
      drawPattern(newPattern, newUserPattern);
    }
  };

  // Track mouse movement for behavior analysis
  const handleMouseMove = (e) => {
    if (patternComplete || isVerifying) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mouseTrail.length === 0 || 
        Math.abs(x - mouseTrail[mouseTrail.length - 1].x) > 10 ||
        Math.abs(y - mouseTrail[mouseTrail.length - 1].y) > 10) {
      setMouseTrail([...mouseTrail, { x, y }]);
    }
  };

  // Real verification using multiple factors
  const analyzeVerification = (userPoints) => {
    setIsVerifying(true);
    setVerificationScore(0);
    
    let score = 0;
    let reasons = [];
    
    let correctOrder = true;
    for (let i = 0; i < userPoints.length; i++) {
      if (userPoints[i] !== pattern[i]) {
        correctOrder = false;
        break;
      }
    }
    if (correctOrder) {
      score += 30;
      reasons.push('✅ Correct order');
    } else {
      reasons.push('❌ Wrong order');
    }
    
    const avgClickTime = clickTiming.reduce((a, b) => a + b, 0) / clickTiming.length;
    if (avgClickTime > 300 && avgClickTime < 3000) {
      score += 20;
      reasons.push(`✅ Natural timing: ${Math.round(avgClickTime)}ms`);
    } else {
      reasons.push(`❌ Unnatural timing: ${Math.round(avgClickTime)}ms`);
    }
    
    let totalDistance = 0;
    for (let i = 1; i < mouseTrail.length; i++) {
      const dx = mouseTrail[i].x - mouseTrail[i - 1].x;
      const dy = mouseTrail[i].y - mouseTrail[i - 1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    if (totalDistance > 100) {
      score += 20;
      reasons.push(`✅ Natural movement: ${Math.round(totalDistance)}px`);
    } else {
      reasons.push(`❌ Minimal movement: ${Math.round(totalDistance)}px`);
    }
    
    if (userPoints.length === pattern.length) {
      score += 15;
      reasons.push('✅ All points clicked');
    }
    
    const timeVariance = clickTiming.reduce((a, b) => a + Math.abs(b - avgClickTime), 0) / clickTiming.length;
    if (timeVariance > 50) {
      score += 15;
      reasons.push('✅ Human-like variance');
    } else {
      reasons.push('❌ Too consistent (bot-like)');
    }
    
    console.log('🔍 Verification Analysis:');
    console.log('📊 Score:', score);
    console.log('📝 Reasons:', reasons);
    
    setVerificationScore(score);
    
    setTimeout(() => {
      if (score >= 70) {
        setIsHumanVerified(true);
        setVerificationChecked(true);
        setVerificationError('');
        setShowCaptchaDialog(false);
        setSuccess('✓ Human verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setVerificationError(`Verification failed (${score}%). Please try again.`);
        const newPattern = generatePattern();
        setPattern(newPattern);
        setUserPattern([]);
        setPatternComplete(false);
        setMouseTrail([]);
        setClickTiming([]);
        setStartTime(Date.now());
        drawPattern(newPattern, []);
      }
      setIsVerifying(false);
    }, 1500);
  };

  // Reset verification
  const resetVerification = () => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserPattern([]);
    setPatternStarted(false);
    setPatternComplete(false);
    setMouseTrail([]);
    setClickTiming([]);
    setStartTime(Date.now());
    setVerificationScore(0);
    setVerificationError('');
    drawPattern(newPattern, []);
  };

  // Handle verification like Google reCAPTCHA
  const handleVerifyHuman = () => {
    if (isHumanVerified) {
      setIsHumanVerified(false);
      setVerificationChecked(false);
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    setTimeout(() => {
      setIsVerifying(false);
      setIsHumanVerified(true);
      setVerificationChecked(true);
      setVerificationError('');
      
      setTimeout(() => {
        setShowCaptchaDialog(false);
      }, 1000);
    }, 1500);
  };

  // Open CAPTCHA dialog - Only if required
  const openCaptchaDialog = () => {
    if (!captchaRequired) {
      // If CAPTCHA not required, just verify automatically
      setIsHumanVerified(true);
      setVerificationChecked(true);
      setSuccess('✓ Human verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }
    
    setShowCaptchaDialog(true);
    setError('');
    setErrorType('');
    setVerificationError('');
    setVerificationChecked(false);
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserPattern([]);
    setPatternComplete(false);
    setMouseTrail([]);
    setClickTiming([]);
    setStartTime(Date.now());
    setVerificationScore(0);
  };

  // Force CAPTCHA trigger (for testing)
  const forceCaptcha = () => {
    setCaptchaRequired(true);
    setCaptchaTriggered(true);
    openCaptchaDialog();
  };

  const handleGoogleSignIn = async () => {
    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }

    setError('');
    setErrorType('');
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(typeof error === 'string' ? error : 'Google sign in failed. Please try again.');
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
    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }

    setError('');
    setErrorType('');
    setLoading(true);
    
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setError(typeof error === 'string' ? error : 'GitHub sign in failed. Please try again.');
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

    if (!isHumanVerified) {
      setError('Please complete human verification first.');
      setErrorType('verification_required');
      openCaptchaDialog();
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      setErrorType('email_required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setErrorType('email_invalid');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      setErrorType('password_required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setErrorType('password_short');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(typeof error === 'string' ? error : 'Invalid email or password. Please try again.');
        setErrorType('auth_error');
      } else {
        setSuccess('Welcome back! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
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
        return <FaLock className="text-red-500 flex-shrink-0" />;
      case 'auth_error':
        return <FaExclamationTriangle className="text-red-500 flex-shrink-0" />;
      default:
        return <FaInfoCircle className="text-red-500 flex-shrink-0" />;
    }
  };

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

  // Dialog animation variants
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <>
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
                    <h3 className="text-4xl font-extrabold text-white">
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
        <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-start lg:items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 py-8 sm:py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto my-auto"
          >
            {/* Header - Centered */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 sm:mb-8 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                  <FaGraduationCap className="text-white text-[29px]" />
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
                Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">Back</span>
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">
                Sign in to continue your learning journey
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
                    <FaTimes className="text-xs" />
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
                  <FaUserCheck className="text-emerald-500 flex-shrink-0" />
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
                    placeholder="••••••••"
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
              </motion.div>

              {/* Human Verification Status - Google reCAPTCHA Style */}
              <motion.div variants={itemVariants}>
                {isHumanVerified ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/90 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-950/10 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
                      <FaCheckCircle className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        ✓ Verified Human
                      </p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
                        You passed the verification
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openCaptchaDialog}
                    className="w-full p-4 rounded-xl border-2 border-stone-200/80 dark:border-stone-700/80 bg-white dark:bg-stone-800/50 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-6 w-6 rounded border-2 border-stone-300 dark:border-stone-600 flex items-center justify-center group-hover:border-amber-400 transition-colors flex-shrink-0">
                          <span className="text-xs text-stone-400 group-hover:text-amber-400">✓</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                            I'm not a robot
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">
                            {captchaRequired ? 'Click to verify' : 'Verification skipped'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <FaRobot className="text-stone-400 text-sm" />
                          <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">
                            reCAPTCHA
                          </span>
                        </div>
                        <span className="text-[8px] text-stone-400 dark:text-stone-500 font-medium bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                          {captchaRequired ? 'v2' : 'Skip'}
                        </span>
                      </div>
                    </div>
                  </button>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/reset-password"
                  className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading || !isHumanVerified}
                className={`w-full py-3 sm:py-4 rounded-full text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  !isHumanVerified
                    ? 'bg-stone-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {!isHumanVerified ? 'Verify Human First' : 'Sign In'}
                    {isHumanVerified && <FaArrowRight className="text-xs sm:text-sm" />}
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
              Don't have an account?{' '}
              <Link to="/signup" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold transition-colors">
                Sign up
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
                Secure login
              </motion.span>
              <motion.span variants={itemVariants} className="flex items-center gap-1.5">
                <FaUserCheck className="text-emerald-500 text-xs sm:text-sm" />
                Human verified
              </motion.span>
              <motion.span variants={itemVariants} className="flex items-center gap-1.5">
                <FaRobot className="text-emerald-500 text-xs sm:text-sm" />
                Bot protected
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
                {captchaRequired ? 'This site uses advanced human verification.' : 'Enhanced security for your account.'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ===== GOOGLE reCAPTCHA STYLE DIALOG (Shows randomly) ===== */}
      <AnimatePresence>
        {showCaptchaDialog && captchaRequired && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!isHumanVerified && !isVerifying) {
                  setShowCaptchaDialog(false);
                  setVerificationError('');
                }
              }}
            />

            {/* Dialog */}
            <motion.div
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-200/80 dark:border-stone-800/80">
                {/* Dialog Header - reCAPTCHA Style */}
                <div className="px-5 py-3.5 border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <FaShieldAlt className="text-white text-xs" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        reCAPTCHA
                      </p>
                      <p className="text-[9px] text-stone-500 dark:text-stone-400">
                        Verify you are human
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isHumanVerified && !isVerifying) {
                        setShowCaptchaDialog(false);
                        setVerificationError('');
                      }
                    }}
                    className="p-1.5 rounded hover:bg-stone-200/80 dark:hover:bg-stone-700/80 transition-colors text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    disabled={isHumanVerified || isVerifying}
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>

                {/* Dialog Body - reCAPTCHA Style */}
                <div className="p-5">
                  <div className="flex flex-col items-center justify-center">
                    {/* Verification Icon */}
                    <div className="mb-4 p-4 rounded-full bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-200/60 dark:border-amber-800/30">
                      <FaRobot className="text-3xl text-amber-500" />
                    </div>

                    <p className="text-center text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">
                      I'm not a robot
                    </p>
                    <p className="text-center text-xs text-stone-500 dark:text-stone-400 mb-4">
                      Click the checkbox to verify you are human
                    </p>

                    {/* reCAPTCHA Checkbox */}
                    <div 
                      onClick={handleVerifyHuman}
                      className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        isHumanVerified
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : isVerifying
                          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400/50 dark:hover:border-amber-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isHumanVerified
                            ? 'bg-emerald-500 border-emerald-500'
                            : isVerifying
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                            : 'border-stone-300 dark:border-stone-600'
                        }`}>
                          {isVerifying ? (
                            <FaSpinner className="animate-spin text-amber-500 text-sm" />
                          ) : isHumanVerified ? (
                            <FaCheck className="text-white text-sm" />
                          ) : null}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                            I'm not a robot
                          </p>
                          {isHumanVerified && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ Verification passed
                            </p>
                          )}
                          {isVerifying && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              Verifying...
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <FaRobot className="text-stone-400 text-xs" />
                          <span className="text-[8px] font-medium text-stone-400 dark:text-stone-500">
                            reCAPTCHA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {verificationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="w-full mt-3 p-2.5 rounded-lg bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs flex items-start gap-2"
                        >
                          <FaExclamationTriangle className="text-red-500 text-xs flex-shrink-0 mt-0.5" />
                          <span className="flex-1">{verificationError}</span>
                          <button
                            onClick={() => {
                              setVerificationError('');
                              resetVerification();
                            }}
                            className="p-0.5 rounded hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-400 hover:text-red-600 dark:hover:text-red-300 flex-shrink-0"
                          >
                            <FaTimes className="text-[10px]" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Dialog Footer - reCAPTCHA Style */}
                <div className="px-5 py-3 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-800/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[8px] text-stone-400 dark:text-stone-500 font-medium">
                      Protected by reCAPTCHA
                    </p>
                    <span className="text-[8px] text-stone-400 dark:text-stone-500">|</span>
                    <a 
                      href="#" 
                      className="text-[8px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy
                    </a>
                    <span className="text-[8px] text-stone-400 dark:text-stone-500">·</span>
                    <a 
                      href="#" 
                      className="text-[8px] text-amber-600 dark:text-amber-400 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms
                    </a>
                  </div>
                  <button
                    onClick={() => {
                      if (isHumanVerified) {
                        setShowCaptchaDialog(false);
                      } else {
                        resetVerification();
                      }
                    }}
                    disabled={isVerifying}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      isHumanVerified
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white hover:scale-105 active:scale-95 shadow-md shadow-amber-500/30'
                        : 'bg-stone-200/80 dark:bg-stone-700/80 text-stone-400 dark:text-stone-500 hover:bg-stone-300/80 dark:hover:bg-stone-600/80 transition-colors'
                    }`}
                  >
                    {isHumanVerified ? '✓ Done' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SignIn;