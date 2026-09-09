import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaStar,
  FaPlay,
  FaBookOpen,
  FaLayerGroup,
  FaQuestionCircle,
  FaCommentDots,
  FaGraduationCap,
  FaSyncAlt,
  FaCheckCircle,
  FaBrain,
  FaRocket,
  FaMagic,
  FaLightbulb,
  FaStore,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Simple Star Canvas Background - Only in Light Mode
const StarCanvas = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isDarkMode = false;
    let stars = [];
    let animationId = null;

    // Function to check dark mode
    const checkDarkMode = () => {
      return document.documentElement.classList.contains('dark');
    };

    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);

    // Function to create stars
    const createStars = () => {
      stars = [];
      const numStars = 200;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.1,
          speed: Math.random() * 0.005 + 0.002,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    // Animation function
    const animate = () => {
      // Check dark mode on each frame
      isDarkMode = checkDarkMode();
      
      // If dark mode, clear canvas and don't draw stars
      if (isDarkMode) {
        ctx.clearRect(0, 0, width, height);
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      stars.forEach(star => {
        star.phase += star.speed;
        const opacity = star.opacity * (0.5 + 0.5 * Math.sin(star.phase));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    // Initialize
    resize();
    createStars();
    animate();

    // Listen for dark mode changes
    const observer = new MutationObserver(() => {
      // Dark mode changed, animation will handle it
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

// Modern Big Flashcard Component - With Auto Rotation
const ModernFlashcard = ({ 
  flipped, 
  setFlipped, 
  currentCardData, 
  currentCard, 
  totalCards, 
  onNext, 
  allCards 
}) => {
  // Auto-rotate to next card every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      onNext();
    }, 5000); // Change card every 5 seconds

    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <div className="relative w-full max-w-md">
      {/* Card Container */}
      <div 
        className="relative h-80 sm:h-96 md:h-[430px] cursor-pointer group"
        onClick={() => setFlipped(!flipped)}
      >
        <div className="absolute inset-0 rounded-3xl bg-stone-100 dark:bg-stone-800 rotate-[-8deg] shadow-lg transition-all duration-300 group-hover:rotate-[-6deg]" />
        <div className="absolute inset-0 rounded-3xl bg-stone-200 dark:bg-stone-700 rotate-[6deg] shadow-lg transition-all duration-300 group-hover:rotate-[4deg]" />

        {/* Main card with 3D flip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? 'answer' : 'question'}
            initial={{ 
              rotateY: flipped ? -180 : 0, 
              opacity: 0, 
              scale: 0.85,
              rotateX: flipped ? 10 : -10
            }}
            animate={{ 
              rotateY: 0, 
              opacity: 1, 
              scale: 1,
              rotateX: 0
            }}
            exit={{ 
              rotateY: flipped ? 180 : -180, 
              opacity: 0, 
              scale: 0.85,
              rotateX: flipped ? -10 : 10
            }}
            transition={{ 
              duration: 0.7, 
              type: "spring", 
              stiffness: 180, 
              damping: 20 
            }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 p-8 sm:p-10 shadow-2xl shadow-stone-900/30 flex flex-col justify-between border border-stone-700/50"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  {flipped ? (
                    <FaLightbulb className="text-white text-lg" />
                  ) : (
                    <FaQuestionCircle className="text-white text-lg" />
                  )}
                </div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  {flipped ? "Answer" : "Question"}
                </span>
              </div>
              <motion.div 
                animate={{ rotate: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
              >
                <FaSyncAlt className="text-stone-400 text-sm" />
              </motion.div>
            </div>

            {/* Card Content - Using currentCardData */}
            <motion.div 
              className="flex-1 flex items-center justify-center py-4"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 150 }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-serif text-white leading-snug text-center max-w-xs">
                {flipped ? currentCardData.answer : currentCardData.question}
              </p>
            </motion.div>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <FaMagic className="text-amber-400 text-xs" />
                <span>AI Generated</span>
              </div>
              <span className="text-stone-500">
                {currentCard + 1} / {totalCards}
              </span>
            </div>

            {/* Flip indicator - Modern */}
            <motion.div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10"
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-[10px] text-white/60 font-medium flex items-center gap-2">
                <FaSyncAlt className={`text-xs ${flipped ? 'opacity-50' : ''}`} />
                Tap to {flipped ? 'see question' : 'reveal answer'}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
        <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-purple-500/20 blur-xl animate-pulse delay-150" />
      </div>

    </div>
  );
};

// Card data - Updated with short answers
const cardData = [
  {
    id: 1,
    question: "What is the best way to make money as a student?",
    answer: "Sell your skills! Offer Development, design, writing, or coding services."
  },
  {
    id: 2,
    question: "Why should you connect with other students?",
    answer: "Collaboration opens doors — study groups and networking lead to better opportunities."
  },
  {
    id: 3,
    question: "What is the key to balancing study and earning?",
    answer: "Time management! Use calendars, to-do lists, and the Pomodoro Technique."
  }
];

const Hero = () => {
  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);

  // ─── Card Navigation Functions ──────────────────────────────────────
  const nextCard = () => {
    setFlipped(false);
    setCurrentCard((prev) => (prev + 1) % cardData.length);
  };

  // ─── UPDATED FEATURES - Content only ──────────────────────────────
  const features = [
    { label: "Smart Flashcards", icon: FaLayerGroup },
    { label: "Book Library", icon: FaBookOpen },
    { label: "Live Conversation", icon: FaCommentDots },
    { label: "Services Marketplace", icon: FaStore },
    { label: "Feed Shorts Videso", icon: FaUsers },
    { label: "Dashboard Analytics", icon: FaChartLine },
  ];

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  const rise = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 sm:pt-0 pb-8 overflow-hidden bg-white dark:bg-stone-950">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-[-100px] right-[-100px] h-[600px] w-[600px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-100px] h-[500px] w-[500px] rounded-full bg-purple-200/20 dark:bg-purple-900/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-amber-100/10 dark:bg-amber-900/5 blur-3xl" />
      </div>

      {/* Simple Star Canvas Background - Responsive to dark mode */}
      <StarCanvas />

      {/* Grid Pattern - Hidden in dark mode */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(28,32,51,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(28,32,51,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center"
        >
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-7">
            {/* Premium Badge - Updated content */}
            <motion.div variants={rise} className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-sm font-medium border border-amber-200 dark:border-amber-800/30">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Learn, Connect & Sell
            </motion.div>

            {/* Heading - Updated content */}
            <motion.h1
              variants={rise}
              className="text-[39px] sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight text-stone-900 dark:text-white"
            >
              Learn Connect,{" "}
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Sell Together
              </span>
            </motion.h1>

            {/* Description - Updated content */}
            <motion.p
              variants={rise}
              className="text-[13px] sm:text-base md:text-lg text-stone-600 dark:text-stone-300 max-w-md leading-relaxed"
            >
              Create flashcards, access books, connect live with students,
              and buy or sell services in our student marketplace.
            </motion.p>

            {/* Feature list - Updated content */}
            <motion.ul variants={rise} className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
              {features.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                    <Icon className="text-amber-500 text-sm sm:text-base shrink-0" />
                  </div>
                  {label}
                </li>
              ))}
            </motion.ul>

            {/* Buttons - Updated content */}
            <motion.div variants={rise} className="flex flex-wrap items-center gap-4 sm:gap-4 pt-1">
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-3 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-[13px] sm:text-base hover:shadow-amber-500/50 transition-all duration-300 hover:scale-[1.02]"
              >
                Get Started Free
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-6 py-3 sm:py-3.5 rounded-full border-2 border-stone-200 dark:border-stone-700 font-semibold text-[13px] sm:text-base text-stone-700 dark:text-stone-200 hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-400 dark:hover:text-amber-400 transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <FaStore className="text-xs sm:text-sm" />
                Browse Services
              </Link>
            </motion.div>

            {/* Social proof - Same */}
            <motion.div
              variants={rise}
              className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 pt-1"
            >
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-xs" />
                ))}
              </div>
              <span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">4.9</span> from
                over 12,000+ students
              </span>
            </motion.div>
          </div>

          {/* Right Content - Modern Big Flashcard */}
          <motion.div
            variants={rise}
            className="relative mt-6 lg:mt-0 flex justify-center lg:justify-end"
          >
            <ModernFlashcard 
              flipped={flipped} 
              setFlipped={setFlipped}
              currentCardData={cardData[currentCard]}
              currentCard={currentCard}
              totalCards={cardData.length}
              onNext={nextCard}
              allCards={cardData}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;