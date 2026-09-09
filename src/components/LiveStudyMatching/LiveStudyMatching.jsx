// components/LiveStudyMatching/LiveStudyMatching.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  FaCheckCircle,
  FaComments,
  FaBrain,
  FaRocket,
  FaHandshake,
  FaClock,
  FaShieldAlt,
  FaArrowRight,
  FaPaperPlane,
  FaStar,
  FaCrown,
  FaUserPlus,
  FaEye,
  FaReply,
  FaImage,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaGlobe,
  FaLightbulb,
  FaGraduationCap,
  FaBookOpen,
  FaLaptop,
  FaCode,
  FaPalette,
  FaMusic,
  FaGamepad,
  FaFilm,
  FaTheaterMasks,
  FaChevronRight,
} from "react-icons/fa";

const LiveStudyMatching = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("matching");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Live Requests ──────────────────────────────────────────────
  const liveRequests = [
    {
      id: 1,
      name: "Hania Abbase",
      subject: "I need a study partner — Final review",
      initial: "H",
      color: "from-amber-500 to-orange-500",
    },
    {
      id: 2,
      name: "Umar Khan",
      subject: "AI Department — paper discussion",
      initial: "U",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 3,
      name: "Zainab Aftab",
      subject: "Data Science — Project collaboration",
      initial: "Z",
      color: "from-purple-500 to-pink-500",
    },
  ];

  // ─── Chat Preview ──────────────────────────────────────────
  const chatPreview = [
    { id: 1, from: "them", text: "Are you also stuck on question 4?" },
    {
      id: 2,
      from: "me",
      text: "Yes — let's split the paper in half and compare notes",
    },
    { id: 3, from: "them", text: "Deal. Sharing my outline now" },
  ];

  // ─── Fetch Services ──────────────────────────────────────────────────
  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setServices(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Subscribe to Real-time Changes ──────────────────────────────
  useEffect(() => {
    fetchServices();

    const subscription = supabase
      .channel('services-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Helper: Check if service is new ────────────────────────────
  const isNewService = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = (now - created) / (6000 * 60);
    return diffMinutes < 20;
  };

  // ─── Helper: Get time ago string ────────────────────────────────────
  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffSeconds = Math.floor((now - created) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return created.toLocaleDateString();
  };

  const displayServices = services.slice(0, 10);

  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-white dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 transition-colors duration-300">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-stone-200/10 dark:bg-stone-800/10 blur-3xl" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-200/5 dark:bg-amber-900/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-200/5 dark:bg-orange-900/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Main Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* ─── LEFT SIDE - Header & Features ──────────────────────── */}
          <div>
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-stone-700 mb-3">
                <FaUsers className="inline mr-1.5 text-amber-500" />
                Connect & Collaborate
              </span>
              <h2 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white mb-3 leading-[1.1] tracking-tight">
                Study{" "}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Together
                </span>
              </h2>
              <p className="text-[11px] sm:text-[13px] text-stone-500 dark:text-stone-400 max-w-md leading-relaxed">
  Discover study partners who match your learning style, share resources, 
  and collaborate on projects in real-time. Join a thriving community of 
  students dedicated to academic excellence and mutual growth.
</p>
            </div>

            {/* Features Grid - Fully Responsive */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-6">
              {/* Card 1 - Post & Connect */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 sm:p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-all group">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaCheckCircle className="text-amber-600 dark:text-amber-400 text-base sm:text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-stone-900 dark:text-white font-semibold text-xs sm:text-sm mb-0.5">
                      Post & Connect
                    </h4>
                    <p className="text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs leading-relaxed">
                      Share what you're studying
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Chat & Collaborate */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 sm:p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaComments className="text-blue-600 dark:text-blue-400 text-base sm:text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-stone-900 dark:text-white font-semibold text-xs sm:text-sm mb-0.5">
                      Chat & Collaborate
                    </h4>
                    <p className="text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs leading-relaxed">
                      Real-time discussions
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 - AI-Powered Insights */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 sm:p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FaBrain className="text-purple-600 dark:text-purple-400 text-base sm:text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-stone-900 dark:text-white font-semibold text-xs sm:text-sm mb-0.5">
                      AI-Powered Insights
                    </h4>
                    <p className="text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs leading-relaxed">
                      Smart study suggestions
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mb-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-amber-400 text-[10px] sm:text-sm" />
                  ))}
                </div>
                <span className="text-stone-900 dark:text-white font-semibold text-xs sm:text-sm">
                  4.8/5
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs">
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-[6px] sm:text-[7px] md:text-[8px] font-bold border-2 border-white dark:border-stone-950">
                    M
                  </div>
                  <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[6px] sm:text-[7px] md:text-[8px] font-bold border-2 border-white dark:border-stone-950">
                    J
                  </div>
                  <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-[6px] sm:text-[7px] md:text-[8px] font-bold border-2 border-white dark:border-stone-950">
                    S
                  </div>
                  <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[6px] sm:text-[7px] md:text-[8px] font-bold border-2 border-white dark:border-stone-950">
                    A
                  </div>
                </div>
                <span>1,200+ students</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <Link
                to="/study-groups"
                className="inline-flex items-center justify-center w-full xs:w-auto gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm transition-all duration-300 hover:bg-stone-700 dark:hover:bg-stone-200 group"
              >
                Find Study Partner
                <FaArrowRight className="text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center w-full xs:w-auto gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs sm:text-sm hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300"
              >
                Explore Services
              </Link>
            </div>
          </div>

          {/* ─── RIGHT SIDE - Tabs ──────────────────────────────────── */}
          <div className="w-full">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white dark:bg-stone-900 rounded-xl p-1 border border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setActiveTab("matching")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "matching"
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <FaComments className="inline mr-1.5" /> Live Matching
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "services"
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <FaRocket className="inline mr-1.5" /> Services
              </button>
            </div>

            {/* ─── Live Matching Tab ────────────────────────────────── */}
            {activeTab === "matching" && (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 md:p-6 overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <FaHandshake className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-stone-900 dark:text-white font-semibold text-sm">
                        Study Match
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        3 active requests
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-600 dark:text-stone-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="space-y-2.5 mb-4">
                  {liveRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 px-3.5 py-2.5 cursor-pointer group hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300"
                    >
                      <div
                        className={`h-9 w-9 rounded-full bg-gradient-to-r ${req.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {req.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                            {req.name}
                          </p>
                          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-emerald-500" />
                          <span className="hidden sm:inline text-[9px] text-emerald-500">Active</span>
                        </div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {req.subject}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1 whitespace-nowrap hover:shadow-lg transition-all hover:scale-105">
                        Accept
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chat Preview */}
                <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 mb-2">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <FaComments className="text-white text-[8px]" />
                    </div>
                    <span className="font-medium text-stone-900 dark:text-white">
                      Zainab Aftab
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">·</span>
                    <span>Active now</span>
                    <span className="ml-auto flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-stone-400 dark:text-stone-500">
                        typing
                      </span>
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-2">
                    {chatPreview.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.from === "me" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-1.5 text-[10px] leading-relaxed ${
                            msg.from === "me"
                              ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-br-sm"
                              : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-bl-sm border border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3.5 py-1.5 hover:border-stone-400 dark:hover:border-stone-600 transition-all">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 flex-1">
                      Type a message…
                    </span>
                    <div className="bg-stone-900 dark:bg-white rounded-full p-1.5 cursor-pointer hover:scale-110 transition-transform">
                      <FaPaperPlane className="text-white dark:text-stone-900 text-[8px]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    47 active matches
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-stone-400 dark:text-stone-500 text-[9px]" />
                    Avg. response: 2 sec
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <FaShieldAlt className="text-stone-400 dark:text-stone-500 text-[9px]" />
                    100% free
                  </span>
                </div>
              </div>
            )}

            {/* ─── Services Tab ────────────────────────────────────── */}
            {activeTab === "services" && (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      Recent Services
                    </h3>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {loading ? 'Loading...' : `${services.length} services available`}
                    </p>
                  </div>
                  <Link to="/services">
                    <button className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors">
                      View All →
                    </button>
                  </Link>
                </div>

                <div className="max-h-[340px] overflow-y-auto pr-1">
                  {loading && (
                    <div className="text-center py-6">
                      <div className="inline-block h-6 w-6 border-2 border-stone-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-2">
                        Loading services...
                      </p>
                    </div>
                  )}

                  {!loading && services.length === 0 && (
                    <div className="text-center py-6">
                      <FaRocket className="text-3xl text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        No services posted yet
                      </p>
                      <Link to="/services">
                        <button className="mt-2 text-xs text-stone-700 dark:text-stone-300 font-semibold hover:text-stone-900 dark:hover:text-white transition-colors">
                          Be the first to post →
                        </button>
                      </Link>
                    </div>
                  )}

                  {!loading && services.length > 0 && (
                    <div className="space-y-2.5">
                      {displayServices.map((service) => {
                        const priceValue = service.price?.replace(/[^0-9.]/g, '') || '0';
                        const isNew = isNewService(service.created_at);
                        const timeAgo = getTimeAgo(service.created_at);

                        return (
                          <div
                            key={service.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-all group cursor-pointer relative"
                            onClick={() => window.location.href = `/service/${service.id}`}
                          >
                            <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200 dark:bg-stone-700 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                              {service.image_url ? (
                                <img
                                  src={service.image_url}
                                  alt={service.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FaImage className="text-stone-400 dark:text-stone-500 text-xl" />
                              )}
                              {isNew && (
                                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[8px] font-bold rounded-full animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-medium text-stone-900 dark:text-white group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors truncate">
                                      {service.title}
                                    </h4>
                                    {isNew && (
                                      <span className="text-[8px] font-bold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <Link 
                                    to={`/user-services/${service.user_id}`}
                                    className="text-[10px] text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FaUser className="inline mr-1 text-[8px]" />
                                    by {service.posted_by}
                                  </Link>
                                </div>
                                <span className="text-sm font-light text-stone-900 dark:text-white flex items-start flex-shrink-0 ml-2">
                                  <span className="text-[10px] font-medium mt-0.5">$</span>
                                  {priceValue}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-[9px] text-stone-400 dark:text-stone-500">
                                <span className="flex items-center gap-1">
                                  <FaEye /> {service.views || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaUserPlus /> {service.interested || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaReply /> {service.replies || 0}
                                </span>
                                <span className="flex items-center gap-1 text-[8px] text-stone-400 dark:text-stone-500">
                                  <FaClock className="text-[8px]" />
                                  {timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link to="/services">
                  <button className="w-full mt-4 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-semibold text-sm hover:bg-stone-700 dark:hover:bg-stone-200 transition-all">
                    Post Your Service →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveStudyMatching;