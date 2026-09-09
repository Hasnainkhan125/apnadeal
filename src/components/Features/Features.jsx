import React from "react";
import { 
  FaUsers,
  FaStore,
  FaLayerGroup,
  FaComments,
  FaNewspaper,
  FaChartLine,
  FaVideo,
  FaBookOpen,
  FaUserFriends,
  FaHandshake,
  FaRocket,
  FaShieldAlt
} from "react-icons/fa";

const features = [
  {
    id: 1,
    icon: FaUsers,
    title: "Study Groups",
    description: "Connect with peers and grow together.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: 2,
    icon: FaStore,
    title: "Services Marketplace",
    description: "Buy and sell skills with other students.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: 3,
    icon: FaLayerGroup,
    title: "Smart Flashcards",
    description: "Learn faster with spaced repetition.",
    color: "from-purple-500 to-indigo-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: 4,
    icon: FaComments,
    title: "Live Chat",
    description: "Real-time conversations with students.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: 6,
    icon: FaVideo,
    title: "Video Sharing",
    description: "Upload and share study videos.",
    color: "from-red-500 to-rose-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  {
    id: 7,
    icon: FaBookOpen,
    title: "Resource Library",
    description: "Access books and study materials.",
    color: "from-amber-500 to-yellow-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    id: 12,
    icon: FaShieldAlt,
    title: "Privacy First",
    description: "Your data is safe and secure.",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    id: 11,
    icon: FaRocket,
    title: "Instant Results",
    description: "Get summaries and quizzes in seconds.",
    color: "from-rose-500 to-orange-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
];

const Features = () => {
  return (
    <section className="relative py-20 sm:py-24 md:py-28 bg-white dark:bg-stone-950">
      {/* Background Decorations - Minimal */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-100px] right-[-100px] h-[600px] w-[600px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-100px] h-[500px] w-[500px] rounded-full bg-purple-200/20 dark:bg-purple-900/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white mb-3 sm:mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Learn & Earn
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-stone-600 dark:text-stone-400">
            Connect, learn, share, and grow with our complete suite of tools.
          </p>
        </div>

        {/* Features Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 hover:-translate-y-1 cursor-default"
              >
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  {/* Icon - Slightly smaller on mobile */}
                  <div className={`inline-flex h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl ${feature.bg} items-center justify-center mb-2 sm:mb-3 md:mb-4`}>
                    <div className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      <Icon className="text-white text-sm sm:text-base md:text-lg" />
                    </div>
                  </div>

                  {/* Title - Responsive */}
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 dark:text-white mb-1 sm:mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description - Responsive */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;