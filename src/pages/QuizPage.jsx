import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheckCircle, 
  FaTimesCircle,
  FaClock,
  FaLightbulb,
  FaRedo,
  FaHome,
  FaBrain,
  FaRocket,
  FaChartLine,
  FaQuestionCircle,
  FaSmile,
  FaFrown,
  FaMeh,
  FaTrophy,
  FaStar,
  FaGraduationCap,
  FaFire,
  FaPlay,
  FaBookOpen,
  FaUserGraduate,
  FaMedal,
  FaGem,
  FaSpinner
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// Sample quiz data - In production, this would come from Supabase
const sampleQuestions = [
  {
    id: 1,
    question: "What is React?",
    options: [
      "A JavaScript library for building user interfaces",
      "A programming language",
      "A database management system",
      "A CSS framework"
    ],
    correct: 0,
    explanation: "React is a JavaScript library developed by Facebook for building interactive UI components."
  },
  {
    id: 2,
    question: "What is the virtual DOM in React?",
    options: [
      "A physical DOM stored in memory",
      "A lightweight copy of the actual DOM",
      "A database for React components",
      "A CSS preprocessor"
    ],
    correct: 1,
    explanation: "The virtual DOM is a lightweight JavaScript representation of the actual DOM used for performance optimization."
  },
  {
    id: 3,
    question: "What is JSX in React?",
    options: [
      "A JavaScript extension that allows HTML-like syntax",
      "A new programming language",
      "A database query language",
      "A CSS framework"
    ],
    correct: 0,
    explanation: "JSX (JavaScript XML) allows you to write HTML-like syntax directly in JavaScript files."
  },
  {
    id: 4,
    question: "What is the purpose of useState hook?",
    options: [
      "To manage state in functional components",
      "To create class components",
      "To style components",
      "To handle API calls"
    ],
    correct: 0,
    explanation: "useState is a React Hook that lets you add state management to functional components."
  },
  {
    id: 5,
    question: "What is props in React?",
    options: [
      "Properties passed to components",
      "A CSS property",
      "A JavaScript function",
      "A database field"
    ],
    correct: 0,
    explanation: "Props (short for properties) are read-only data passed from parent to child components."
  }
];

const QuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState({});

  const totalQuestions = sampleQuestions.length;

  // Timer
  useEffect(() => {
    let timer;
    if (isTimerRunning && quizStarted && !showResults) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, quizStarted, showResults]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    const isCorrect = optionIndex === sampleQuestions[currentQuestion].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        selected: optionIndex,
        correct: sampleQuestions[currentQuestion].correct,
        isCorrect
      }
    }));
  };

  // Save quiz results to Supabase
  const saveQuizResults = async () => {
    if (!user) return;

    setIsSaving(true);
    const userId = user.id;
    const correctAnswers = score;
    const total = totalQuestions;
    const percentage = Math.round((correctAnswers / total) * 100);

    try {
      // 1. Update user_stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching stats:', statsError);
      }

      // Calculate new values
      const currentQuizzes = statsData?.quizzes || 0;
      const currentQuizzesChange = statsData?.quizzes_change || 0;
      const newQuizzes = currentQuizzes + 1;
      const newQuizzesChange = currentQuizzesChange + Math.round(percentage / 10);

      // Update or insert user_stats
      const { error: updateStatsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          quizzes: newQuizzes,
          quizzes_change: newQuizzesChange,
          rating: Math.min(5, (statsData?.rating || 0) + 0.1),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateStatsError) {
        console.error('Error updating stats:', updateStatsError);
      }

      // 2. Save activity
      const activityTitle = `Quiz: ${percentage}% - ${correctAnswers}/${total} correct`;
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          type: 'quiz',
          title: activityTitle,
          score: `${percentage}%`,
          time: 'Just now',
          status: 'completed'
        });

      if (activityError) {
        console.error('Error saving activity:', activityError);
      }

      // 3. Update achievements if needed
      if (percentage >= 80) {
        const { error: achievementError } = await supabase
          .from('achievements')
          .upsert({
            user_id: userId,
            icon: 'award',
            label: 'Quiz Master',
            value: `${newQuizzes} badges`,
            color: 'text-purple-500'
          }, {
            onConflict: 'user_id'
          });

        if (achievementError) {
          console.error('Error updating achievement:', achievementError);
        }
      }

      console.log('✅ Quiz results saved successfully!');

    } catch (error) {
      console.error('Error saving quiz results:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async () => {
    setShowResults(true);
    setIsTimerRunning(false);
    await saveQuizResults();
  };

  // Next question
  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleQuizComplete();
    }
  };

  // Previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      const prevAnswer = answers[currentQuestion - 1];
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selected);
        setIsAnswered(true);
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }
  };

  // Start quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setIsTimerRunning(true);
  };

  // Reset quiz
  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setTimeLeft(300);
    setIsTimerRunning(true);
    setQuizStarted(false);
    setAnswers({});
  };

  // Get result emoji
  const getResultEmoji = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return { icon: FaTrophy, text: "Excellent!", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", badge: "Master" };
    if (percentage >= 60) return { icon: FaStar, text: "Good Job!", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", badge: "Skilled" };
    if (percentage >= 40) return { icon: FaRocket, text: "Keep Going!", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", badge: "Learning" };
    return { icon: FaBookOpen, text: "Need Practice!", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", badge: "Beginner" };
  };

  const result = getResultEmoji();
  const ResultIcon = result.icon;

  // Get grade color
  const getGradeColor = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 60) return "text-amber-500";
    if (percentage >= 40) return "text-orange-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-stone-950 dark:via-amber-950/10 dark:to-stone-950">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-6">
          <div className="w-full sm:w-auto">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <FaArrowLeft className="text-[10px] sm:text-xs" />
              <span className="hidden xs:inline">Back to Home</span>
              <span className="xs:hidden">Back</span>
            </Link>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-stone-900 dark:text-white mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-3">
              <span className="text-amber-500">
                <FaBrain className="text-lg sm:text-2xl lg:text-3xl" />
              </span>
              <span className="text-base sm:text-2xl lg:text-3xl">Practice Quiz</span>
            </h1>
          </div>
          
          {/* Timer */}
          {quizStarted && !showResults && (
            <div className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2.5 rounded-full font-semibold text-[10px] sm:text-sm ${
              timeLeft < 60 
                ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 animate-pulse' 
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              <FaClock className="text-[10px] sm:text-sm" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Saving indicator */}
          {isSaving && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
              <FaSpinner className="animate-spin" />
              <span>Saving results...</span>
            </div>
          )}
        </div>

        {/* Quiz Content */}
        {!quizStarted ? (
          // Start Screen
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-5 sm:p-8 lg:p-12 text-center min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center shadow-xl"
          >
            <div className="text-5xl sm:text-7xl lg:text-8xl mb-3 sm:mb-6 text-amber-500">
              <FaBrain />
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-stone-900 dark:text-white mb-2 sm:mb-3">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-lg mx-auto mb-4 sm:mb-8 px-2">
              You'll have 5 minutes to answer {totalQuestions} questions. 
              Take your time and think carefully.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto mb-4 sm:mb-8 w-full">
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-2 sm:p-4">
                <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{totalQuestions}</p>
                <p className="text-[8px] sm:text-[10px] text-stone-500 dark:text-stone-400">Questions</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-2 sm:p-4">
                <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">5:00</p>
                <p className="text-[8px] sm:text-[10px] text-stone-500 dark:text-stone-400">Time</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-2 sm:p-4">
                <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                  <FaLightbulb className="inline" />
                </p>
                <p className="text-[8px] sm:text-[10px] text-stone-500 dark:text-stone-400">Learn</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-2 sm:p-4">
                <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                  <FaGem className="inline" />
                </p>
                <p className="text-[8px] sm:text-[10px] text-stone-500 dark:text-stone-400">Grow</p>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-[1.02]"
            >
              <FaPlay className="text-xs sm:text-sm" /> Start Quiz
            </button>
          </motion.div>
        ) : showResults ? (
          // Results Screen
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-5 sm:p-8 lg:p-12 shadow-xl"
          >
            <div className="text-center">
              <div className={`inline-flex p-3 sm:p-6 rounded-full ${result.bg} mb-3 sm:mb-4`}>
                <ResultIcon className={`text-3xl sm:text-5xl lg:text-6xl ${result.color}`} />
              </div>
              <h2 className={`text-xl sm:text-3xl lg:text-4xl font-black ${result.color} mb-0.5 sm:mb-1`}>
                {result.text}
              </h2>
              <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] sm:text-sm font-medium text-stone-600 dark:text-stone-400 mb-3 sm:mb-4">
                {result.badge}
              </div>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mb-4 sm:mb-8 px-2">
                You scored {score} out of {totalQuestions} questions correctly
              </p>

              {/* Score Circle */}
              <div className="relative inline-flex items-center justify-center mb-4 sm:mb-8">
                <svg className="w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 -rotate-90">
                  <circle
                    className="text-stone-200 dark:text-stone-700"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="56"
                    cy="56"
                  />
                  <circle
                    className="text-amber-500 transition-all duration-1000"
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="56"
                    cy="56"
                    strokeDasharray={`${(score / totalQuestions) * 301.44} 301.44`}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className={`text-xl sm:text-3xl lg:text-4xl font-black ${getGradeColor()}`}>
                    {Math.round((score / totalQuestions) * 100)}%
                  </p>
                  <p className="text-[8px] sm:text-xs text-stone-500 dark:text-stone-400">Score</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 max-w-xs mx-auto mb-4 sm:mb-8">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-1.5 sm:p-3">
                  <p className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{score}</p>
                  <p className="text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400">Correct</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-1.5 sm:p-3">
                  <p className="text-base sm:text-xl font-bold text-red-600 dark:text-red-400">{totalQuestions - score}</p>
                  <p className="text-[8px] sm:text-[10px] text-red-600 dark:text-red-400">Wrong</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-1.5 sm:p-3">
                  <p className="text-base sm:text-xl font-bold text-amber-600 dark:text-amber-400">{totalQuestions}</p>
                  <p className="text-[8px] sm:text-[10px] text-amber-600 dark:text-amber-400">Total</p>
                </div>
              </div>

              {/* Review Answers */}
              <div className="text-left mb-4 sm:mb-8">
                <h3 className="font-semibold text-stone-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">
                  Review Your Answers
                </h3>
                <div className="space-y-1.5 sm:space-y-3 max-h-40 sm:max-h-60 overflow-y-auto pr-1 sm:pr-2">
                  {sampleQuestions.map((q, index) => {
                    const answer = answers[index];
                    return (
                      <div 
                        key={q.id}
                        className="bg-stone-50 dark:bg-stone-800 rounded-xl p-1.5 sm:p-3 border-l-4"
                        style={{
                          borderColor: answer?.isCorrect ? '#10b981' : '#ef4444'
                        }}
                      >
                        <div className="flex items-start gap-1.5 sm:gap-3">
                          <span className="text-[8px] sm:text-xs font-medium text-stone-500 dark:text-stone-400 min-w-[1.5rem] sm:min-w-[2rem]">
                            Q{index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] sm:text-xs font-medium text-stone-900 dark:text-white break-words">
                              {q.question.length > 50 ? q.question.substring(0, 40) + '...' : q.question}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {answer?.isCorrect ? (
                                <FaCheckCircle className="text-emerald-500 text-[6px] sm:text-[10px]" />
                              ) : (
                                <FaTimesCircle className="text-red-500 text-[6px] sm:text-[10px]" />
                              )}
                              <span className="text-[6px] sm:text-[10px] text-stone-500 dark:text-stone-400">
                                {answer?.isCorrect ? 'Correct' : `Correct: ${q.options[q.correct]}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                >
                  <FaRedo className="text-[10px] sm:text-xs" /> Retry
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-stone-200 dark:border-stone-700 font-semibold text-xs sm:text-sm text-stone-700 dark:text-stone-200 hover:border-amber-500 hover:text-amber-600 transition-all"
                >
                  <FaHome className="text-[10px] sm:text-xs" /> Home
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          // Quiz Questions
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-6 lg:p-8 shadow-xl min-h-[50vh] sm:min-h-[60vh] flex flex-col"
            >
              {/* Progress */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-3 mb-3 sm:mb-6">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
                  <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-stone-400">
                    Q{currentQuestion + 1}/{totalQuestions}
                  </span>
                  <div className="flex-1 sm:w-24 lg:w-32 h-1 sm:h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden min-w-[40px] sm:min-w-[60px]">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] sm:text-sm font-semibold text-stone-500 dark:text-stone-400">
                  Score: {score}
                </span>
              </div>

              {/* Question */}
              <div className="mb-3 sm:mb-6 flex-1">
                <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-stone-900 dark:text-white break-words">
                  {sampleQuestions[currentQuestion].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-1.5 sm:space-y-3">
                {sampleQuestions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = index === sampleQuestions[currentQuestion].correct;
                  const showCorrect = isAnswered && isCorrect;
                  const showWrong = isAnswered && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-2 sm:p-3 lg:p-4 rounded-xl border-2 transition-all duration-300 text-sm sm:text-base ${
                        isSelected && !isAnswered
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                          : showCorrect
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : showWrong
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                          : isAnswered && !isSelected && !isCorrect
                          ? 'border-stone-200 dark:border-stone-700 opacity-60'
                          : 'border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-xs sm:text-sm lg:text-base text-stone-800 dark:text-stone-200 break-words flex-1">
                          {option}
                        </span>
                        {showCorrect && (
                          <FaCheckCircle className="text-emerald-500 text-[10px] sm:text-sm flex-shrink-0" />
                        )}
                        {showWrong && (
                          <FaTimesCircle className="text-red-500 text-[10px] sm:text-sm flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 sm:mt-6 p-2.5 sm:p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FaLightbulb className="text-amber-500 mt-0.5 text-xs sm:text-sm flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-stone-900 dark:text-white">
                        Explanation
                      </p>
                      <p className="text-[10px] sm:text-xs text-stone-600 dark:text-stone-300 break-words">
                        {sampleQuestions[currentQuestion].explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-3 sm:mt-6 pt-3 sm:pt-6 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`inline-flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                    currentQuestion === 0
                      ? 'text-stone-400 dark:text-stone-600 cursor-not-allowed'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <FaArrowLeft className="text-[8px] sm:text-[10px]" />
                  <span className="hidden xs:inline">Previous</span>
                  <span className="xs:hidden">Prev</span>
                </button>

                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-[10px] sm:text-xs shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                >
                  {currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                  <FaArrowRight className="text-[8px] sm:text-[10px]" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default QuizPage;