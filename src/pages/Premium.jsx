// pages/Premium.jsx - Fixed with Auto-Create User
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaBrain,
  FaRocket,
  FaStar,
  FaCrown,
  FaShieldAlt,
  FaClock,
  FaInfinity,
  FaBookOpen,
  FaVideo,
  FaUsers,
  FaComments,
  FaBookReader,
  FaGraduationCap,
  FaNetworkWired,
  FaPodcast,
  FaMicrophone,
  FaUserGraduate,
  FaGlobe,
  FaCalendarCheck,
  FaTrophy,
  FaKey,
  FaLockOpen,
  FaWhatsapp,
  FaEnvelope,
  FaUniversity,
  FaMobileAlt,
  FaPaypal,
  FaTimes as FaTimesIcon,
  FaLock,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const Premium = () => {
  const { user, isPremium, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  const userIsPremium = isPremium();

  // ─── Helper: Ensure user exists in public.users table ──────────────
  const ensureUserExists = async () => {
    if (!user) return false;

    try {
      // Check if user exists in public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id);

      if (userError) {
        console.error("Error checking user:", userError);
        return false;
      }

      // If user doesn't exist, create them
      if (!userData || userData.length === 0) {
        console.log("User not found in public.users, creating...");
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            is_premium: false,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error creating user:", insertError);
          return false;
        }

        console.log("User created successfully in public.users");
        return true;
      }

      console.log("User exists in public.users");
      return true;
    } catch (error) {
      console.error("Error in ensureUserExists:", error);
      return false;
    }
  };

  // ─── Handle Upgrade with Proper SQL Queries ──────────────────────
  const handleUpgrade = async () => {
    if (!user) {
      navigate("/signup");
      return;
    }

    if (showCodeInput) {
      if (upgradeCode === "12345") {
        setIsUpgrading(true);
        setCodeError("");
        
        try {
          console.log("Starting upgrade for user:", user.id);

          // 1. Ensure user exists in public.users
          const userExists = await ensureUserExists();
          if (!userExists) {
            setCodeError("Unable to create user profile. Please try again.");
            setIsUpgrading(false);
            return;
          }

          // 2. Update user to premium
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              is_premium: true,
              premium_since: new Date().toISOString(),
              premium_code: upgradeCode
            })
            .eq('id', user.id);

          if (updateError) {
            console.error("Update error:", updateError);
            setCodeError("Error activating premium: " + updateError.message);
            setIsUpgrading(false);
            return;
          }

          console.log("User updated to premium");

          // 3. Handle subscription (optional)
          try {
            // Check if subscription table exists first
            const { error: tableCheckError } = await supabase
              .from('subscriptions')
              .select('id')
              .limit(1);

            // Only proceed if subscriptions table exists
            if (!tableCheckError) {
              const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('user_id', user.id);

              if (existingSub && existingSub.length > 0) {
                await supabase
                  .from('subscriptions')
                  .update({
                    plan: selectedPlan,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    payment_method: 'code',
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', user.id);
              } else {
                await supabase
                  .from('subscriptions')
                  .insert({
                    user_id: user.id,
                    plan: selectedPlan,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    payment_method: 'code',
                    created_at: new Date().toISOString()
                  });
              }
            }
          } catch (subError) {
            console.error("Subscription error (non-critical):", subError);
            // Continue with upgrade even if subscription fails
          }

          // 4. Refresh user data
          await refreshUser();
          
          // 5. Close modal and navigate
          setShowPaymentModal(false);
          setShowCodeInput(false);
          setUpgradeCode("");
          navigate("/dashboard");
          
        } catch (error) {
          console.error("Upgrade error:", error);
          setCodeError("An unexpected error occurred: " + error.message);
        } finally {
          setIsUpgrading(false);
        }
      } else {
        setCodeError("❌ Invalid code. Please use the correct upgrade code.");
      }
      return;
    }

    setShowPaymentModal(true);
  };

  // ─── Pricing Plans ──────────────────────────────────────────────────
  const plans = {
    free: {
      name: "Free",
      icon: FaBookOpen,
      price: isAnnual ? "$0" : "$0",
      period: isAnnual ? "/year" : "/month",
      description: "Perfect for getting started",
      features: [
        "Access to 5 free books",
        "Join public communities",
        "Watch 10 video lessons",
        "Basic chat support",
        "Community forums access",
      ],
      notFeatures: [
        "Premium book library",
        "Live video sessions",
        "Private communities",
        "1-on-1 mentoring",
        "Advanced analytics",
      ],
      color: "from-stone-500 to-stone-600",
      border: "border-stone-200 dark:border-stone-700",
      buttonColor: "bg-stone-600 hover:bg-stone-700",
      popular: false,
      isFree: true,
    },
    pro: {
      name: "Pro",
      icon: FaRocket,
      price: isAnnual ? "$99" : "$9",
      period: isAnnual ? "/year" : "/month",
      description: "Best for serious learners",
      features: [
        "Access to 50+ premium books",
        "Unlimited video lessons",
        "Live study sessions",
        "Private communities access",
        "1-on-1 mentoring",
        "Advanced analytics",
        "Priority support",
        "Certificate of completion",
      ],
      notFeatures: [],
      color: "from-amber-500 to-orange-500",
      border: "border-amber-500/50 dark:border-amber-500/30",
      buttonColor: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600",
      popular: true,
      isFree: false,
    },
    enterprise: {
      name: "Enterprise",
      icon: FaCrown,
      price: isAnnual ? "$299" : "$29",
      period: isAnnual ? "/year" : "/month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team management",
        "Custom learning paths",
        "Dedicated support team",
        "White-label options",
        "Advanced security",
        "API access",
        "Custom integrations",
        "Bulk user management",
      ],
      notFeatures: [],
      color: "from-purple-500 to-purple-600",
      border: "border-purple-500/50 dark:border-purple-500/30",
      buttonColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      popular: false,
      isFree: false,
    },
  };

  // ─── If user is already premium ──────────────────────────────────────
  if (userIsPremium) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border-2 border-emerald-500/30">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <FaCrown className="text-emerald-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
              🎉 You're a Premium Member!
            </h2>
            <p className="text-stone-600 dark:text-stone-400">
              All features are unlocked. Enjoy unlimited access!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link to="/dashboard">
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Go to Dashboard →
                </button>
              </Link>
              <Link to="/services">
                <button className="px-6 py-3 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-white rounded-xl font-semibold hover:bg-stone-300 dark:hover:bg-stone-700 transition-all">
                  Explore Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Premium Upgrade Page ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            💎 Premium Membership
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Upgrade to{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Premium
            </span>
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Unlock all features, connect with students, and start earning by selling your services
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <span className={`text-xs sm:text-sm font-medium ${!isAnnual ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 sm:w-14 h-7 sm:h-8 rounded-full bg-stone-200 dark:bg-stone-700 transition-colors duration-300 flex-shrink-0"
          >
            <div
              className={`absolute top-1 left-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-transform duration-300 shadow-lg ${
                isAnnual ? 'translate-x-5 sm:translate-x-6' : ''
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-medium ${isAnnual ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
            Annual <span className="text-emerald-500 text-[10px] sm:text-xs font-bold">Save 20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {Object.keys(plans).map((key) => {
            const plan = plans[key];
            const Icon = plan.icon;
            const isActive = selectedPlan === key;
            const isFreePlan = plan.isFree;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl border ${
                  plan.border
                } p-5 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''
                } ${isActive ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}`}
                onClick={() => setSelectedPlan(key)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/30 whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r ${plan.color} text-white shadow-lg mb-3 sm:mb-4`}>
                    <Icon className="text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">{plan.name}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{plan.description}</p>
                  <div className="mt-3 sm:mt-4">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">{plan.price}</span>
                    <span className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">{plan.period}</span>
                  </div>
                  {key === 'pro' && (
                    <div className="mt-1.5 sm:mt-2 inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold">
                      Save 20% with annual billing
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                      <FaCheck className="text-emerald-500 text-[10px] sm:text-xs flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.notFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-400 dark:text-stone-500">
                      <FaTimes className="text-red-400 text-[10px] sm:text-xs flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                {isFreePlan ? (
                  <div className="w-full mt-5 sm:mt-8">
                    {user ? (
                      <button
                        disabled
                        className="w-full py-2.5 sm:py-3 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 font-semibold text-sm sm:text-base cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <FaLock className="text-xs" />
                        Current Plan
                      </button>
                    ) : (
                      <Link to="/signup">
                        <button className="w-full py-2.5 sm:py-3 rounded-full bg-stone-600 hover:bg-stone-700 text-white font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2">
                          Get Started
                          <FaArrowRight className="text-xs sm:text-sm" />
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(key);
                      handleUpgrade();
                    }}
                    className={`w-full mt-5 sm:mt-8 py-2.5 sm:py-3 rounded-full ${plan.buttonColor} text-white font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2`}
                  >
                    Subscribe Now
                    <FaArrowRight className="text-xs sm:text-sm" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="mt-12 sm:mt-16">
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white text-center mb-2 sm:mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Succeed</span>
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-center text-sm mb-6 sm:mb-8">
            All plans include access to our core learning features
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { icon: FaBookOpen, label: '50+ Books', desc: 'Access premium book library' },
              { icon: FaVideo, label: 'Video Lessons', desc: 'Watch unlimited video content' },
              { icon: FaUsers, label: 'Communities', desc: 'Join private study groups' },
              { icon: FaComments, label: 'Live Chat', desc: 'Real-time conversations' },
              { icon: FaUserGraduate, label: 'Mentoring', desc: '1-on-1 expert guidance' },
              { icon: FaNetworkWired, label: 'Networking', desc: 'Connect with peers' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-stone-200 dark:border-stone-800 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300">
                    <Icon className="text-xl sm:text-2xl text-amber-500 group-hover:text-white transition-all duration-300" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white mt-1.5 sm:mt-2">{feature.label}</h4>
                  <p className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Upgrade Code Hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            🔑 Demo code: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">12345</span>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            <FaShieldAlt className="text-emerald-500 text-xs sm:text-sm" />
            <span>Secure payment</span>
          </div>
          <div className="hidden sm:block w-px h-5 sm:h-6 bg-stone-300 dark:bg-stone-700" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            <FaClock className="text-amber-500 text-xs sm:text-sm" />
            <span>Cancel anytime</span>
          </div>
          <div className="hidden sm:block w-px h-5 sm:h-6 bg-stone-300 dark:bg-stone-700" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            <FaInfinity className="text-purple-500 text-xs sm:text-sm" />
            <span>Unlimited access</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 sm:mt-8 text-center border-t border-stone-200 dark:border-stone-800 pt-6 sm:pt-8">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Have questions?{" "}
            <a
              href="mailto:support@yourplatform.com"
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              Contact our team
            </a>
          </p>
        </div>
      </div>

      {/* ─── MODERN PAYMENT MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                    <FaCrown className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white">
                      Upgrade to Premium
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {selectedPlan === "pro" ? "Pro Plan" : "Enterprise Plan"} • ${selectedPlan === "pro" ? (isAnnual ? "99" : "9") : (isAnnual ? "299" : "29")}/{isAnnual ? "year" : "month"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setShowCodeInput(false);
                    setCodeError("");
                    setUpgradeCode("");
                  }}
                  className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                >
                  <FaTimesIcon className="text-stone-500 dark:text-stone-400 text-lg" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {!showCodeInput ? (
                  <>
                    <p className="text-sm text-stone-600 dark:text-stone-300 text-center mb-4 font-medium">
                      Choose your payment method
                    </p>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => setShowCodeInput(true)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FaWhatsapp className="text-green-500 text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-stone-900 dark:text-white">WhatsApp</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">Pay via WhatsApp</p>
                        </div>
                        <FaArrowRight className="text-stone-400 text-sm group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setShowCodeInput(true)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FaEnvelope className="text-amber-500 text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-stone-900 dark:text-white">Email</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">Pay via Email</p>
                        </div>
                        <FaArrowRight className="text-stone-400 text-sm group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setShowCodeInput(true)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FaUniversity className="text-blue-500 text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-stone-900 dark:text-white">Bank Transfer</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">Direct bank transfer</p>
                        </div>
                        <FaArrowRight className="text-stone-400 text-sm group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setShowCodeInput(true)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FaKey className="text-amber-500 text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-stone-900 dark:text-white">Upgrade Code</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">Use a premium code</p>
                        </div>
                        <FaArrowRight className="text-stone-400 text-sm group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setShowCodeInput(false);
                      }}
                      className="w-full mt-4 py-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center justify-center">
                        <FaLockOpen className="text-amber-500 text-2xl" />
                      </div>
                      <h4 className="text-lg font-bold text-stone-900 dark:text-white mt-3">Enter Upgrade Code</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Enter your premium upgrade code to unlock all features
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Enter upgrade code..."
                          value={upgradeCode}
                          onChange={(e) => {
                            setUpgradeCode(e.target.value);
                            setCodeError("");
                          }}
                          className="w-full px-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-center text-lg font-mono tracking-widest focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpgrade();
                            }
                          }}
                        />
                        {codeError && (
                          <p className="text-xs text-red-500 mt-1.5">{codeError}</p>
                        )}
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1.5 text-center">
                          💡 Contact admin to get your upgrade code
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowCodeInput(false);
                            setCodeError("");
                            setUpgradeCode("");
                          }}
                          className="flex-1 px-4 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all text-sm"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleUpgrade}
                          disabled={isUpgrading}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                        >
                          {isUpgrading ? (
                            <>
                              <FaSpinner className="animate-spin" /> Activating...
                            </>
                          ) : (
                            <>
                              <FaCheck className="text-sm" /> Activate Premium
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Premium;