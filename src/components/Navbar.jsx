import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaGraduationCap,
  FaFileAlt,
  FaLightbulb,
  FaBook,
  FaSignOutAlt,
  FaCrown,
  FaChartBar,
  FaCommentDots,
  FaNewspaper,
  FaUsers,
  FaUserFriends,
  FaUserCircle,
  FaComments,
  FaChevronDown,
  FaRocket,
  FaCog,
  FaSignInAlt,
  FaUserPlus,
  FaHome,
  FaChartPie,
  FaBell,
  FaGift,
  FaMagic,
  FaServicestack,
  FaSync,
  FaSpinner,
  FaShieldAlt,
  FaLayerGroup,
  FaGem,
  FaWallet,
  FaCreditCard,
  FaHistory,
  FaHeart
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // ─── Real User Data States ──────────────────────────────────────────
  const [userAvatar, setUserAvatar] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPlan, setUserPlan] = useState("Free");
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // ─── Load User Data from Supabase ──────────────────────────────────
  const loadUserData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading user data for:', user.id);
      
      // Get user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error loading user settings:', settingsError);
      }

      if (settingsData) {
        console.log('📋 Settings data loaded:', settingsData);
        
        if (settingsData.avatar) setUserAvatar(settingsData.avatar);
        if (settingsData.full_name) setUserFullName(settingsData.full_name);
        if (settingsData.email) setUserEmail(settingsData.email);
        
        const isPremiumUser = settingsData.premium === true || settingsData.plan === 'Premium';
        setIsPremium(isPremiumUser);
        setUserPlan(isPremiumUser ? 'Premium' : 'Free');
      }

      // Get user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error loading user stats:', statsError);
      }

      if (statsData) {
        console.log('📊 Stats data loaded:', statsData);
        setUserLevel(statsData.level || 1);
        setUserXp(statsData.xp || 0);
        setUserStreak(statsData.streak || 0);
        setIsVerified(statsData.verified || false);
      }

      if (user?.user_metadata?.premium === true || user?.user_metadata?.plan === 'Premium') {
        setIsPremium(true);
        setUserPlan('Premium');
      }

      if (settingsError?.code === 'PGRST116') {
        console.log('Creating default settings for user...');
        const defaultSettings = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          plan: 'Free',
          premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert([defaultSettings]);
          
        if (insertError) {
          console.error('Error creating default settings:', insertError);
        } else {
          console.log('✅ Default settings created');
          setUserFullName(defaultSettings.full_name);
          setUserEmail(defaultSettings.email);
        }
      }

    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Load data on mount and user change ────────────────────────────
  useEffect(() => {
    loadUserData();
  }, [user]);

  // ─── Listen for real-time updates ──────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const settingsSubscription = supabase
      .channel('user-settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 User settings updated:', payload);
          loadUserData();
        }
      )
      .subscribe();

    return () => {
      settingsSubscription.unsubscribe();
    };
  }, [user]);

  // ─── Theme handling ──────────────────────────────────────────────────
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // ─── Scroll handling ─────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ─── Click outside handlers ──────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Close menu on route change ─────────────────────────────────────
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // ─── Body overflow control ──────────────────────────────────────────
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsSearchFocused(false);
      setSearchQuery("");
    }
  };

  // ─── Navigation items - Home hidden when logged in ────────────────
  const getNavItems = () => {
    const allItems = [
      { name: "Home", path: "/", icon: FaHome },
      { name: "Dashboard", path: "/dashboard", icon: FaChartPie },
      { name: "Services", path: "/Services", icon: FaServicestack },
      { name: "StudentHub", path: "/quiz-generator", icon: FaGraduationCap },
      { name: "Flashcards", path: "/flashcards", icon: FaLayerGroup },
      { name: "Chat", path: "/chat", icon: FaCommentDots },
      { name: "Feed", path: "/study-posts", icon: FaNewspaper },
      { name: "Group", path: "/study-groups", icon: FaUsers },
    ];

    // If user is logged in, hide Home
    if (user) {
      return allItems.filter(item => item.name !== "Home");
    }
    return allItems;
  };

  const navItems = getNavItems();

  const isActive = (path) => location.pathname === path;

  // ─── User menu items ────────────────────────────────────────────────
  const userMenuItems = [
    { name: "Subscription", path: "/subscription", icon: FaCrown, badge: isPremium ? "Premium" : "Upgrade" },
    { name: "Settings", path: "/settings", icon: FaCog },
  ];

  // ─── Notifications ───────────────────────────────────────────────────
  const notifications = [
    { id: 1, title: "New feature: AI Summarizer", time: "2 min ago", read: false },
    { id: 2, title: "Your quiz results are ready", time: "1 hour ago", read: false },
    { id: 3, title: "Flashcards updated", time: "3 hours ago", read: false },
    { id: 4, title: "Welcome to AI Study Assistant!", time: "1 day ago", read: true },
  ];

  // ─── Helper functions ────────────────────────────────────────────────
  const getUserInitial = () => {
    if (userFullName) {
      return userFullName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return <FaUser />;
  };

  const getUserName = () => {
    return userFullName || user?.email?.split('@')[0] || 'User';
  };

  // ─── Loading state ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/20 dark:border-stone-800/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <Link to="/" className="flex items-center group flex-shrink-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                <FaGraduationCap className="text-white text-sm sm:text-base" />
              </div>
              <div className="ml-2">
                <span className="text-sm sm:text-base font-black tracking-tight">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">AI</span>
                  <span className="text-stone-900 dark:text-white">Study</span>
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <FaSpinner className="animate-spin text-amber-500 text-sm" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────
  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl shadow-lg border-b border-stone-200/20 dark:border-stone-800/20"
            : "bg-white/70 dark:bg-stone-950/70 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">

    
            {/* ===== LOGO ===== */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center group flex-shrink-0">
              <div className="h-9 w-9 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-md shadow-amber-500/20">
                <FaGraduationCap className="text-white text-[25px] sm:text-[26px]" />
              </div>
              <div className="ml-2.5">
                <span className="text-base sm:text-lg md:text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">AI</span>
                  <span className="text-stone-900 dark:text-white">Study</span>
                </span>
                <span className="block text-[8px] sm:text-[9px] md:text-[10px] font-medium text-stone-400 dark:text-stone-500 -mt-0.5 tracking-wider">
                  ASSISTANT
                </span>
              </div>
            </Link>


            {/* ===== DESKTOP NAV ===== */}
            <ul className="hidden lg:flex items-center gap-0.5 bg-stone-100/60 dark:bg-stone-800/40 rounded-xl p-0.5 border border-stone-200/50 dark:border-stone-700/30">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/20"
                          : "text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400"
                      }`}
                    >
                      <Icon className="text-[11px]" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* ===== RIGHT SECTION ===== */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">

              {/* Search Desktop */}
              <div ref={searchRef} className="hidden md:block relative">
                <motion.div
                  animate={{ width: isSearchFocused ? "200px" : "130px" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative"
                >
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      placeholder="Search..."
                      className="w-full px-3 py-1 rounded-full bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-[11px] border border-transparent focus:border-amber-500/30"
                    />
                    <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <FaSearch className="text-[10px] text-stone-400 dark:text-stone-500" />
                    </button>
                  </form>
                </motion.div>
              </div>

              {/* Search Mobile Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <FaSearch className="text-[10px] sm:text-xs text-stone-600 dark:text-stone-300" />
              </button>

              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
                >
                  <FaBell className="text-[10px] sm:text-xs text-stone-600 dark:text-stone-300" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[6px] sm:text-[8px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-stone-900 shadow-md shadow-red-500/20">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden"
                    >
                      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white">Notifications</span>
                        <button className="text-[8px] sm:text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:underline transition-colors">
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer border-b border-stone-100 dark:border-stone-800 last:border-0 ${
                              !item.read ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                            }`}
                          >
                            <p className="text-[10px] sm:text-xs font-medium text-stone-900 dark:text-white">{item.title}</p>
                            <p className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{item.time}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {isDark ? (
                  <FaSun className="text-[10px] sm:text-xs text-amber-500 hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <FaMoon className="text-[10px] sm:text-xs text-stone-600 hover:rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* ===== USER AUTH ===== */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  {/* Mobile: Avatar opens sidebar */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors group"
                  >
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-white font-bold text-[8px] sm:text-[10px] group-hover:scale-105 transition-transform duration-300 overflow-hidden shadow-md shadow-amber-500/20">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={getUserName()}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>
                    <FaChevronDown className={`text-stone-400 text-[6px] sm:text-[8px] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop: Avatar opens profile dropdown */}
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="hidden lg:flex items-center gap-1 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors group"
                  >
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] group-hover:scale-105 transition-transform duration-300 overflow-hidden shadow-md shadow-amber-500/20">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={getUserName()}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>
                    <FaChevronDown className={`text-stone-400 text-[8px] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-2.5 border-b border-stone-200 dark:border-stone-800">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0 shadow-md shadow-amber-500/20">
                              {userAvatar ? (
                                <img
                                  src={userAvatar}
                                  alt={getUserName()}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center">
                                  {getUserInitial()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-stone-900 dark:text-white truncate">
                                {getUserName()}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                                {userEmail}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                                  {isPremium ? '🌟 Premium' : 'Free Plan'}
                                </span>
                                {isVerified && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Quick Stats */}
                          <div className="flex gap-3 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                            <div className="text-center flex-1">
                              <p className="text-xs font-bold text-stone-900 dark:text-white">{userLevel}</p>
                              <p className="text-[8px] text-stone-400 dark:text-stone-500">Level</p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-xs font-bold text-stone-900 dark:text-white">{userXp}</p>
                              <p className="text-[8px] text-stone-400 dark:text-stone-500">XP</p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-xs font-bold text-stone-900 dark:text-white">🔥 {userStreak}</p>
                              <p className="text-[8px] text-stone-400 dark:text-stone-500">Streak</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {userMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsProfileOpen(false)}
                                className={`flex items-center gap-2.5 px-4 py-1.5 text-xs transition-colors ${
                                  item.badge === 'Premium' 
                                    ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30' 
                                    : 'text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400'
                                }`}
                              >
                                <Icon className="text-xs" />
                                {item.name}
                                {item.badge && (
                                  <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                                    item.badge === 'Premium' 
                                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>

                        <div className="border-t border-stone-200 dark:border-stone-800 my-1" />

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-stone-200 dark:border-stone-800 mt-1"
                        >
                          <FaSignOutAlt className="text-xs" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // ─── Auth Buttons - Responsive for Mobile ──────────────────
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Link
                    to="/signin"
                    className="group relative inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg overflow-hidden bg-transparent border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium text-[10px] sm:text-[11px] transition-all duration-200 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md hover:shadow-amber-500/10"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                    <FaSignInAlt className="text-[8px] sm:text-[10px] relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative z-10 hidden xs:inline">Sign In</span>
                    <span className="relative z-10 inline xs:hidden">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="relative inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-medium text-[10px] sm:text-[11px] transition-all duration-200 hover:shadow-md hover:shadow-amber-500/30 hover:scale-105"
                  >
                    <FaUserPlus className="text-[8px] sm:text-[10px]" />
                    <span className="hidden xs:inline">Sign Up</span>
                    <span className="inline xs:hidden">Join</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <form onSubmit={handleSearch} className="py-2 border-t border-stone-200/20 dark:border-stone-800/20">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-xs"
                      autoFocus
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <FaSearch className="text-stone-400 dark:text-stone-500 text-xs" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ===== MOBILE SIDEBAR ===== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 overflow-y-auto flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-gradient-to-r from-white to-amber-50/50 dark:from-stone-900 dark:to-amber-950/20">
                <Link
                  to={user ? "/dashboard" : "/"}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                    <FaGraduationCap className="text-white text-base" />
                  </div>
                  <div>
                    <span className="text-base font-black tracking-tight">
                      <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">AI</span>
                      <span className="text-stone-900 dark:text-white">Study</span>
                    </span>
                    <span className="block text-[8px] font-medium text-stone-500 dark:text-stone-400 -mt-0.5">
                      Assistant
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <FaTimes className="text-xs text-stone-500 dark:text-stone-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {user && (
                  <div className="flex items-center gap-2.5 mb-5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-gradient-to-r from-amber-50/30 to-transparent dark:from-amber-950/10">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden shadow-md shadow-amber-500/20">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={getUserName()}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-stone-900 dark:text-white truncate">
                        {getUserName()}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                        {userEmail}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                          {isPremium ? '🌟 Premium' : 'Free Plan'}
                        </span>
                        {isVerified && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[8px] text-stone-500">Level {userLevel}</span>
                        <span className="text-[8px] text-stone-500">•</span>
                        <span className="text-[8px] text-stone-500">{userXp} XP</span>
                        <span className="text-[8px] text-stone-500">•</span>
                        <span className="text-[8px] text-stone-500">🔥 {userStreak}</span>
                      </div>
                    </div>
                  </div>
                )}

                <nav>
                  <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 px-2 mb-2 uppercase tracking-wider">Menu</p>
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
                    }}
                    className="space-y-0.5"
                  >
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <motion.div
                          key={item.name}
                          variants={{
                            hidden: { opacity: 0, x: 14 },
                            show: { opacity: 1, x: 0 },
                          }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                              active
                                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/20"
                                : "text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400"
                            }`}
                          >
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs ${active ? "bg-white/15" : "bg-stone-100 dark:bg-stone-800"}`}>
                              <Icon />
                            </span>
                            {item.name}
                            {active && <span className="ml-auto h-1 w-1 rounded-full bg-white" />}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </nav>

                <div className="my-4 border-t border-stone-200 dark:border-stone-800" />

                <div>
                  <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 px-2 mb-2 uppercase tracking-wider">Account</p>
                  {!user ? (
                    <div className="space-y-1.5">
                      <Link to="/signin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                        <FaSignInAlt className="text-xs" /> Sign In
                      </Link>
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs transition-all hover:shadow-md hover:shadow-amber-500/30">
                        <FaUserPlus className="text-xs" /> Get Started Free
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                        <FaUserCircle className="text-xs" /> Settings
                      </Link>
                      <Link to="/subscription" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                        <FaCrown className="text-xs" /> <span className="flex-1">Subscription</span>
                        <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400">
                          {isPremium ? 'Premium' : 'Upgrade'}
                        </span>
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <FaSignOutAlt className="text-xs" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">AI Study Assistant v1.0</p>
                  </div>
                  <div className="flex gap-4 mt-2 justify-center">
                    <a href="#" className="text-[10px] text-stone-400 hover:text-amber-500 transition-colors">Privacy</a>
                    <a href="#" className="text-[10px] text-stone-400 hover:text-amber-500 transition-colors">Terms</a>
                    <a href="#" className="text-[10px] text-stone-400 hover:text-amber-500 transition-colors">Help</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;