import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  FaTrophy
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const PricingCard = ({ plan, popular, annual }) => {
  const [isAnnual, setIsAnnual] = useState(annual || false);
  
  const plans = {
    free: {
      name: 'Free',
      icon: FaBookOpen,
      price: isAnnual ? '$0' : '$0',
      period: isAnnual ? '/year' : '/month',
      description: 'Perfect for getting started',
      features: [
        'Access to 5 free books',
        'Join public communities',
        'Watch 10 video lessons',
        'Basic chat support',
        'Community forums access',
      ],
      notFeatures: [
        'Premium book library',
        'Live video sessions',
        'Private communities',
        '1-on-1 mentoring',
        'Advanced analytics',
      ],
      color: 'from-stone-500 to-stone-600',
      border: 'border-stone-200 dark:border-stone-700',
      buttonColor: 'bg-stone-600 hover:bg-stone-700'
    },
    pro: {
      name: 'Pro',
      icon: FaRocket,
      price: isAnnual ? '$99' : '$12',
      period: isAnnual ? '/year' : '/month',
      description: 'Best for serious learners',
      features: [
        'Access to 50+ premium books',
        'Unlimited video lessons',
        'Live study sessions',
        'Private communities access',
        '1-on-1 mentoring',
        'Advanced analytics',
        'Priority support',
        'Certificate of completion',
      ],
      notFeatures: [],
      color: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/50 dark:border-amber-500/30',
      buttonColor: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
    },
    enterprise: {
      name: 'Enterprise',
      icon: FaCrown,
      price: isAnnual ? '$299' : '$29',
      period: isAnnual ? '/year' : '/month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team management',
        'Custom learning paths',
        'Dedicated support team',
        'White-label options',
        'Advanced security',
        'API access',
        'Custom integrations',
        'Bulk user management',
      ],
      notFeatures: [],
      color: 'from-purple-500 to-purple-600',
      border: 'border-purple-500/50 dark:border-purple-500/30',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  };

  const currentPlan = plans[plan];
  const Icon = currentPlan.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl border ${currentPlan.border} p-5 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
        popular ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/30 whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="text-center">
        <div className={`inline-flex p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r ${currentPlan.color} text-white shadow-lg mb-3 sm:mb-4`}>
          <Icon className="text-xl sm:text-2xl" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">{currentPlan.name}</h3>
        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{currentPlan.description}</p>
        <div className="mt-3 sm:mt-4">
          <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">{currentPlan.price}</span>
          <span className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">{currentPlan.period}</span>
        </div>
        {plan === 'pro' && (
          <div className="mt-1.5 sm:mt-2 inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold">
            Save 20% with annual billing
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {currentPlan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
            <FaCheck className="text-emerald-500 text-[10px] sm:text-xs flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
        {currentPlan.notFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-400 dark:text-stone-500">
            <FaTimes className="text-red-400 text-[10px] sm:text-xs flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button className={`w-full mt-5 sm:mt-8 py-2.5 sm:py-3 rounded-full ${currentPlan.buttonColor} text-white font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2`}>
        {plan === 'free' ? 'Get Started' : 'Subscribe Now'}
        <FaArrowRight className="text-xs sm:text-sm" />
      </button>
    </motion.div>
  );
};

const SubscriptionPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

  const features = [
    { icon: FaBookOpen, label: '50+ Books', desc: 'Access premium book library' },
    { icon: FaVideo, label: 'Video Lessons', desc: 'Watch unlimited video content' },
    { icon: FaUsers, label: 'Communities', desc: 'Join private study groups' },
    { icon: FaComments, label: 'Live Chat', desc: 'Real-time conversations' },
    { icon: FaUserGraduate, label: 'Mentoring', desc: '1-on-1 expert guidance' },
    { icon: FaNetworkWired, label: 'Networking', desc: 'Connect with peers' },
  ];

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-br from-stone-50 via-amber-50/20 to-white dark:from-stone-950 dark:via-amber-950/10 dark:to-stone-950 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Plans & Pricing
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Choose Your <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">Learning</span> Path
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Unlock access to premium books, live conversations, and exclusive communities. Upgrade anytime.
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
          <PricingCard plan="free" annual={isAnnual} />
          <PricingCard plan="pro" popular={true} annual={isAnnual} />
          <PricingCard plan="enterprise" annual={isAnnual} />
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
            {features.map((feature, index) => {
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

        {/* Features Comparison Table - FIXED for mobile */}
        <div className="mt-12 sm:mt-16 bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 lg:p-8 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <FaStar className="text-amber-500 text-base sm:text-xl flex-shrink-0" />
            <h3 className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-white">
              Compare Plans
            </h3>
          </div>
          
          {/* Mobile Scrollable Table */}
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-6 lg:px-0">
              <table className="min-w-[600px] sm:min-w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-stone-500 dark:text-stone-400 font-medium text-xs sm:text-sm">Feature</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-4 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm">Free</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-4 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm">Pro</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-4 text-stone-900 dark:text-white font-semibold text-xs sm:text-sm">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Books Access</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-stone-500 dark:text-stone-400 text-xs sm:text-sm">5 books</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">50+ books</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">Unlimited</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Video Lessons</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-stone-500 dark:text-stone-400 text-xs sm:text-sm">10 videos</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">Unlimited</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">Unlimited</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Live Study Sessions</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Private Communities</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">1-on-1 Mentoring</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Priority Support</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Certificates</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Team Management</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-stone-600 dark:text-stone-300 text-xs sm:text-sm">Custom Integrations</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-red-500 text-xs sm:text-sm">✗</td>
                    <td className="text-center py-3 sm:py-4 px-3 sm:px-4 text-emerald-500 font-semibold text-xs sm:text-sm">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Mobile scroll hint */}
          <div className="block sm:hidden text-center text-stone-400 dark:text-stone-500 text-[10px] mt-3">
            ← Scroll to see more →
          </div>
        </div>

        {/* FAQ & CTA */}
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

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Have questions?{' '}
            <Link to="/contact" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
              Contact our team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;