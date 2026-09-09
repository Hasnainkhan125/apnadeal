import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaShieldAlt, 
  FaLock, 
  FaUserSecret,
  FaDatabase,
  FaCookie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaFileContract,
  FaUserLock,
  FaServer,
  FaGlobe,
  FaMobileAlt,
  FaCreditCard,
  FaUserFriends,
  FaClipboardCheck,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaGavel,
  FaHandshake,
  FaBuilding,
  FaShieldVirus,
  FaKey,
    FaBrain,           // ← ADD THIS
  FaChartLine,       // ← ADD THIS
  FaLightbulb,       // ← ADD THIS
  FaDownload  ,
  FaUserShield
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PrivacyPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const privacySections = [
    {
      id: 1,
      icon: FaDatabase,
      title: "Information We Collect",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            We collect information to provide better services to all our users. The types of information we collect include:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Account Information:</span>
                <span className="text-stone-600 dark:text-stone-400"> Name, email address, password, and profile information</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Usage Data:</span>
                <span className="text-stone-600 dark:text-stone-400"> Study sessions, quiz results, flashcards created, and learning progress</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Device Information:</span>
                <span className="text-stone-600 dark:text-stone-400"> Browser type, operating system, IP address, and device identifiers</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Content Data:</span>
                <span className="text-stone-600 dark:text-stone-400"> Study materials, notes, uploaded files, and generated content</span>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 2,
      icon: FaUserShield,
      title: "How We Use Your Information",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            We use your information to provide, improve, and protect our services:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                  <FaBrain className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Personalized Learning</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Tailor study recommendations and content to your needs</p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <FaChartLine className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Progress Tracking</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Monitor your learning progress and achievements</p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                  <FaLightbulb className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">AI Features</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Power AI summarization, quiz generation, and flashcards</p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                  <FaShieldAlt className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Security & Compliance</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Protect your data and ensure service integrity</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      icon: FaLock,
      title: "Data Security",
      color: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            We implement robust security measures to protect your data:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Encryption:</span>
                <span className="text-stone-600 dark:text-stone-400"> All data is encrypted in transit (SSL/TLS) and at rest</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Access Control:</span>
                <span className="text-stone-600 dark:text-stone-400"> Strict access controls and authentication protocols</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Regular Audits:</span>
                <span className="text-stone-600 dark:text-stone-400"> Security assessments and vulnerability testing</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Data Backup:</span>
                <span className="text-stone-600 dark:text-stone-400"> Regular backups to prevent data loss</span>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 4,
      icon: FaCookie,
      title: "Cookies & Tracking",
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            We use cookies and similar technologies to enhance your experience:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🍪</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Essential Cookies</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Necessary for basic functionality and security</p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Analytics Cookies</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Help us understand how you use our service</p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Preference Cookies</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Remember your settings and preferences</p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Performance Cookies</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Improve service performance and speed</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      icon: FaUserFriends,
      title: "Data Sharing & Third Parties",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Service Providers:</span>
                <span className="text-stone-600 dark:text-stone-400"> Trusted partners who help us deliver our services (hosting, analytics, payment processing)</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Legal Compliance:</span>
                <span className="text-stone-600 dark:text-stone-400"> When required by law or to protect our rights</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">Aggregated Data:</span>
                <span className="text-stone-600 dark:text-stone-400"> Anonymous, aggregated data for research and improvement</span>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 6,
      icon: FaUserLock,
      title: "Your Rights",
      color: "from-cyan-500 to-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            You have the following rights regarding your data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <FaEye className="text-blue-500 text-xl" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Right to Access</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">View your personal data</p>
              </div>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <FaEdit className="text-amber-500 text-xl" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Right to Rectify</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Correct inaccurate data</p>
              </div>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <FaTrashAlt className="text-red-500 text-xl" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Right to Delete</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Request data deletion</p>
              </div>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 flex items-center gap-3">
              <FaDownload className="text-emerald-500 text-xl" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Right to Portability</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Download your data</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      icon: FaEnvelope,
      title: "Contact Us",
      color: "from-rose-500 to-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            If you have any questions about our privacy practices, please contact us:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950/30 inline-flex mb-3">
                <FaEnvelope className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">Email</p>
              <a href="mailto:privacy@aistudy.com" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                privacy@aistudy.com
              </a>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950/30 inline-flex mb-3">
                <FaPhone className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">Phone</p>
              <a href="tel:+1234567890" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                +92 (314) 0972575
              </a>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950/30 inline-flex mb-3">
                <FaMapMarkerAlt className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">Address</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Pakistan Islamabad, Bahria Town</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-4"
          >
            <FaArrowLeft className="text-xs" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
              <FaShieldAlt className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1">
                Your privacy matters to us. Learn how we protect your data.
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 mb-6 flex items-center gap-3">
          <FaInfoCircle className="text-amber-500 text-lg" />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Last Updated: <span className="font-semibold text-stone-800 dark:text-stone-200">January 1, 2025</span>
          </span>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-4">
          {privacySections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: section.id * 0.05 }}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${section.bg}`}>
                      <div className={`h-7 w-7 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="text-white text-sm" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 dark:text-white">
                        {section.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <FaChevronUp className="text-stone-400" />
                    ) : (
                      <FaChevronDown className="text-stone-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 pt-0 border-t border-stone-200 dark:border-stone-800">
                        {section.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/50">
              <FaHandshake className="text-amber-600 dark:text-amber-400 text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 dark:text-white mb-1">
                Commitment to Privacy
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                We are committed to protecting your privacy and being transparent about how we handle your data. 
                This policy will be updated as we evolve our services. We encourage you to review it periodically.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400">
                  <FaCheckCircle className="text-emerald-500" />
                  GDPR Compliant
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400">
                  <FaCheckCircle className="text-emerald-500" />
                  CCPA Compliant
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400">
                  <FaCheckCircle className="text-emerald-500" />
                  Data Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;