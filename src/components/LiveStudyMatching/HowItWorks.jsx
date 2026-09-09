import React from "react";
import { Link } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaMagic,
  FaClipboardCheck,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
  FaBookOpen,
  FaLightbulb,
  FaRocket,
} from "react-icons/fa";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Upload Your Material",
      description: "Drop in any study material — PDFs, lecture slides, notes, or even paste text. AI Study Assistant accepts all formats you already use.",
      icon: FaCloudUploadAlt,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      shadow: "shadow-amber-500/20",
      points: [
        "Supports PDF, DOCX, TXT, and images",
        "Paste text directly from any source",
        "Drag & drop or click to upload"
      ]
    },
    {
      id: 2,
      title: "AI Processes Everything",
      description: "Our advanced AI reads, analyzes, and breaks down your material into key concepts — creating a structured knowledge base just for you.",
      icon: FaMagic,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      shadow: "shadow-blue-500/20",
      points: [
        "Smart concept extraction",
        "Automatic summarization",
        "Key point identification"
      ]
    },
    {
      id: 3,
      title: "Practice & Test Yourself",
      description: "Generate custom quizzes and flashcards from your own material. Test what you've learned and identify areas that need more attention.",
      icon: FaClipboardCheck,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      shadow: "shadow-purple-500/20",
      points: [
        "AI-generated quizzes",
        "Smart flashcards with spaced repetition",
        "Real-time performance tracking"
      ]
    },
    {
      id: 4,
      title: "Track Your Progress",
      description: "See your learning journey come to life with detailed analytics. Know exactly what you've mastered and what needs more review.",
      icon: FaChartLine,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      shadow: "shadow-emerald-500/20",
      points: [
        "Visual progress dashboard",
        "Strength & weakness analysis",
        "Personalized study recommendations"
      ]
    },
  ];


  const benefits = [
    {
      icon: FaBookOpen,
      title: "Study Smarter",
      desc: "Focus on what matters most with AI-guided learning"
    },
    {
      icon: FaLightbulb,
      title: "Learn Faster",
      desc: "Cut study time in half with intelligent summarization"
    },
    {
      icon: FaRocket,
      title: "Achieve More",
      desc: "Master complex topics with personalized practice"
    }
  ];

  return (
    <section className="relative py-16 sm:py-20 md:py-28 bg-white dark:bg-stone-950 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
        
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
        
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white leading-[1.1] mb-3 sm:mb-4">
            From upload to{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              mastery
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Transform your study materials into an interactive learning experience in 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="group relative bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-600 flex items-center justify-center text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 shadow-lg">
                  {step.id}
                </div>

                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Icon */}
                  <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg ${step.shadow} flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="text-white text-xl sm:text-2xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 dark:text-white mb-1 sm:mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                      {step.description}
                    </p>
                    
                    {/* Points */}
                    <ul className="space-y-1.5">
                      {step.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                          <span className={`text-${step.color.split(' ')[0].replace('from-', '')} mt-0.5`}>
                            <FaCheckCircle className="text-[10px] sm:text-xs" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-amber-500/30 to-transparent" />
                )}
              </div>
            );
          })}
        </div>

      
        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-amber-200/50 dark:border-amber-800/20 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="text-white text-base sm:text-lg" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white mb-1">
                  {benefit.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;