import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Hero from "../components/Hero/Hero";
import Features from "../components/Features/Features";
import LiveStudyMatching from "../components/LiveStudyMatching/LiveStudyMatching";
import {
  FaBrain,
  FaFileAlt,
  FaLightbulb,
  FaBook,
  FaRocket,
  FaArrowRight,
  FaCloudUploadAlt,
  FaMagic,
  FaClipboardCheck,
  FaChartLine,
  FaQuoteLeft,
  FaStar,
  FaLayerGroup,
  FaGraduationCap,
  FaShieldAlt,
  FaClock,
  FaFire,
  FaTrophy,
  FaAward,
  FaGem,
  FaInfinity,
  FaHands,
  FaUsers,
  FaVideo,
  FaBookOpen,
  FaGlobe,
  FaComments,
  FaShareAlt,
  FaNetworkWired,
  FaCalendarAlt,
  FaPlayCircle,
  FaBookReader,
  FaChalkboardTeacher,
  FaMicrophone,
  FaPodcast,
  FaNewspaper,
  FaRobot,
  FaUserGraduate,
  FaVideo as FaVideoIcon,
  FaCalendarCheck,
  FaMedal,
  FaBolt,
  FaCrown,
  FaUniversity,
  FaLaptop,
  FaMobileAlt,
  FaHeadset,
  FaWifi,
  FaStore,
  FaImages,
} from "react-icons/fa";

const Home = () => {
  const { user } = useAuth();

  // ─── Quick Access Links - Updated for actual features ──────────────
  const quickLinks = [
    {
      id: 1,
      title: "Flashcards",
      description: "Create and study smart flashcards",
      icon: FaLayerGroup,
      path: "/flashcards",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      gradient: "from-purple-400 via-pink-400 to-purple-500",
    },
    {
      id: 2,
      title: "Library",
      description: "Access books & educational resources",
      icon: FaBookOpen,
      path: "/quiz-generator",
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      gradient: "from-amber-400 via-orange-400 to-amber-500",
    },
    {
      id: 3,
      title: "Live Conversation",
      description: "Real-time chat with students",
      icon: FaComments,
      path: "/chat",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      gradient: "from-emerald-400 via-teal-400 to-emerald-500",
    },
    {
      id: 4,
      title: "Services",
      description: "Buy & sell services with students",
      icon: FaStore,
      path: "/services",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      gradient: "from-amber-400 via-orange-400 to-amber-500",
    },
    {
      id: 5,
      title: "Dashboard",
      description: "Track your Chat & Service",
      icon: FaChartLine,
      path: "/dashboard",
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      gradient: "from-indigo-400 via-blue-400 to-indigo-500",
    },
    {
      id: 6,
      title: "Feed Postings",
      description: "Upload & share photos, videos with community",
      icon: FaImages,
      path: "/study-posts",
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      gradient: "from-rose-400 via-pink-400 to-rose-500",
    },
  ];

  // ─── How It Works Steps ──────────────────────────────────────────────
  const steps = [
    {
      id: 1,
      title: "Create Flashcards",
      description: "Create smart flashcards from your study material instantly.",
      icon: FaLayerGroup,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 2,
      title: "Explore Library",
      description: "Access 10+ books and educational resources for learning.",
      icon: FaBookOpen,
      color: "from-amber-500 to-amber-600",
    },
    {
      id: 3,
      title: "Connect Live",
      description: "Join live conversations and study sessions with students.",
      icon: FaComments,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: 4,
      title: "Buy & Sell Services",
      description: "Sell your skills or find services from other students.",
      icon: FaStore,
      color: "from-amber-500 to-orange-500",
    },
  ];

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = [
    { id: 1, value: "5K+", label: "Flashcards created", icon: FaLayerGroup, color: "text-purple-500" },
    { id: 2, value: "10+", label: "Books available", icon: FaBookOpen, color: "text-amber-500" },
    { id: 3, value: "1K+", label: "Active students", icon: FaUsers, color: "text-emerald-500" },
    { id: 4, value: "500+", label: "Services listed", icon: FaStore, color: "text-orange-500" },
    { id: 5, value: "200+", label: "Live conversations", icon: FaComments, color: "text-blue-500" },
    { id: 6, value: "4.6/5", label: "Average rating", icon: FaStar, color: "text-orange-500" },
  ];

  // ─── Testimonials ─────────────────────────────────────────────────────
  const testimonials = [
    {
      id: 1,
      quote: "The flashcards and live study matching have completely transformed how I prepare for exams!",
      name: "Maya R.",
      role: "Biology, Sophomore",
    },
    {
      id: 2,
      quote: "I love the services marketplace! I've been able to earn money by tutoring other students.",
      name: "Daniel O.",
      role: "Computer Science, Junior",
    },
    {
      id: 3,
      quote: "The live conversations and study groups keep me motivated. I've made so many study buddies!",
      name: "Priya S.",
      role: "Pre-Med, Senior",
    },
  ];

  // ─── Premium Features ────────────────────────────────────────────────
  const premiumFeatures = [
    { icon: FaLayerGroup, title: "Smart Flashcards", desc: "Create unlimited flashcards with spaced repetition" },
    { icon: FaBookOpen, title: "Book Library", desc: "Access 10+ premium books and resources" },
    { icon: FaComments, title: "Live Chat", desc: "Real-time conversations with students worldwide" },
    { icon: FaStore, title: "Services Marketplace", desc: "Buy and sell services with other students" },
    { icon: FaUsers, title: "Study Matching", desc: "Find study partners in your area of interest" },
    { icon: FaChartLine, title: "Dashboard Analytics", desc: "Track your learning progress and earnings" },
  ];

  // ─── Communities ──────────────────────────────────────────────────────
  const communities = [
    { name: "Study Group Hub", members: "2.5K", icon: FaUsers, color: "from-amber-500 to-orange-500" },
    { name: "Book Club", members: "1.8K", icon: FaBook, color: "from-blue-500 to-cyan-500" },
    { name: "Flashcard Creators", members: "1.2K", icon: FaLayerGroup, color: "from-purple-500 to-pink-500" },
    { name: "Service Providers", members: "2.1K", icon: FaStore, color: "from-emerald-500 to-teal-500" },
    { name: "Study Notes", members: "3.1K", icon: FaFileAlt, color: "from-indigo-500 to-purple-500" },
    { name: "Live Study Session", members: "720", icon: FaVideoIcon, color: "from-red-500 to-rose-500" },
  ];

  // ─── Advanced Stats ──────────────────────────────────────────────────
  const advancedStats = [
    { icon: FaClock, label: "Study Hours Saved", value: "15K+", color: "text-amber-500" },
    { icon: FaFire, label: "Daily Active Users", value: "8K+", color: "text-red-500" },
    { icon: FaStore, label: "Services Listed", value: "500+", color: "text-emerald-500" },
    { icon: FaUsers, label: "Study Partners Connected", value: "12K+", color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white dark:bg-stone-950">
      <Hero />

      {/* Quick Access Section - 6 Cards Grid */}

      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-stone-950 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full bg-orange-500/5 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-6 sm:mb-10 md:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
              Quick Access
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white mb-1 sm:mb-2">
              Start Learning & Earning
            </h2>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-xs sm:text-base px-4">
              Create flashcards, access library, connect live, share posts, and trade services
            </p>
          </div>

          {/* ─── Responsive Grid: 2 columns on mobile, 3 on tablet, 3 on desktop ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div key={link.id} className="w-full group">
                  <Link
                    to={link.path}
                    className="block bg-white dark:bg-stone-900 p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 text-center relative overflow-hidden h-full"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" style={{ width: "200%" }} />
                    <div className="relative">
                      {/* Icon - Responsive sizing */}
                      <div className={`inline-flex p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl ${link.bg} mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-r ${link.color} flex items-center justify-center shadow-lg group-hover:shadow-amber-500/40 transition-shadow duration-300`}>
                          <Icon className="text-white text-base sm:text-lg md:text-xl lg:text-2xl" />
                        </div>
                      </div>
                      
                      {/* Title - Responsive text */}
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 dark:text-white mb-0.5 sm:mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {link.title}
                      </h3>
                      
                      {/* Description - Hidden on very small screens, shown on sm+ */}
                      <p className="hidden xs:block text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-tight">
                        {link.description}
                      </p>
                      
                      {/* Get Started - Hidden on mobile, shown on sm+ */}
                      <div className="hidden sm:inline-flex mt-2 sm:mt-3 md:mt-4 items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:gap-2 sm:group-hover:gap-3">
                        Get Started <FaArrowRight className="text-[8px] sm:text-[10px]" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Study Matching - Imported Component */}
      <LiveStudyMatching />

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-stone-50 dark:bg-stone-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
       
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-stone-900 dark:text-white mb-2 sm:mb-3">
              From Learning <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                to Earning
              </span>
            </h1>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Four steps to master your studies and monetize your skills
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative bg-white dark:bg-stone-900 p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group">
                  <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-amber-500/30`}>
                    <Icon className="text-white text-xl sm:text-2xl" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-stone-400 dark:text-stone-500 mb-1 block">
                    Step {step.id}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-1 sm:mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-110">
                    <FaArrowRight className="text-amber-500 text-[8px] sm:text-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

  
      {/* Advanced Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-y border-amber-200 dark:border-amber-800/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-orange-500/5 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
        
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-stone-900 dark:text-white mb-2 sm:mb-3">
              Making Learning <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                <br />
                Collaborative & Profitable
              </span>
            </h2>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Thousands of students trust us to make their study sessions more productive
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {advancedStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border border-stone-200 dark:border-stone-800 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <div className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className={`text-3xl sm:text-4xl md:text-5xl mx-auto mb-3 sm:mb-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-stone-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-stone-900 dark:text-white mb-2 sm:mb-3 leading-[1.1] tracking-[-0.03em]">
              Everything You{' '}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Need
              </span>
            </h2>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Powerful features to supercharge your learning and earning experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-amber-500/50">
                    <Icon className="text-white text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-1 sm:mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-amber-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-110">
                    <FaArrowRight className="text-amber-500 text-[8px] sm:text-[10px]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-stone-50 dark:bg-stone-900/40 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] rounded-full bg-gradient-to-r from-amber-500/5 to-orange-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
          
            <h2 className="text-2xl md:text-5xl font-black text-stone-900 dark:text-white mb-4">
              Trusted by students{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              <br />  
            who actually have exams
            </span>
          </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group"
              >
                <div className="group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <FaQuoteLeft className="text-amber-500 text-xl sm:text-2xl mb-3 sm:mb-4" />
                </div>
                <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-4 sm:mb-5 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  {t.quote}
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold group-hover:scale-110 transition-transform duration-300">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">{t.name}</p>
                    <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />  
{/* Closing CTA Section - Full Width No Padding */}
<section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white dark:bg-stone-950">
  <div className="w-full">
    <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 px-0 py-20 sm:py-24 md:py-28 lg:py-32 text-center shadow-2xl shadow-amber-500/30">
      
      {/* Background Decorations - Minimal */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
        {/* Heading */}
        <h2 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 sm:mb-10 md:mb-12">
          Bet on yourself.
        </h2>

        {/* Button */}
        <Link
          to={user ? "/dashboard" : "/signup"}
          className="inline-flex items-center justify-center gap-2.5 px-10 sm:px-12 md:px-14 py-4 sm:py-4.5 md:py-5 rounded-full bg-white text-amber-600 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:shadow-white/30 hover:scale-105 transition-all duration-300 group"
        >
          {user ? "Go to Dashboard" : "Get Started"}
          <FaArrowRight className="text-sm sm:text-base group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default Home;