import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaPlus, 
  FaTrash, 
  FaEdit,
  FaCheck,
  FaTimes,
  FaRedo,
  FaHome,
  FaBookOpen,
  FaBrain,
  FaRocket,
  FaStar,
  FaFire,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaQuestionCircle,
  FaLightbulb,
  FaGraduationCap,
  FaChartBar,
  FaListAlt,
  FaTags,
  FaLayerGroup,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMagic,
  FaGem,
  FaCrown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// Spaced repetition intervals (in days)
const reviewIntervals = [1, 3, 7, 14, 30, 60, 90];

const FlashcardsPage = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [newCard, setNewCard] = useState({ question: "", answer: "", category: "General", difficulty: "Medium" });
  const [viewMode, setViewMode] = useState("all");
  const [showStats, setShowStats] = useState(false);

  // Get unique categories
  const categories = ["All", ...new Set(flashcards.map(c => c.category))];

  // Load flashcards from Supabase
  const loadFlashcards = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading flashcards:', error);
      } else {
        setFlashcards(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load flashcards on mount
  useEffect(() => {
    loadFlashcards();
  }, [user]);

  // Filter flashcards
  const getFilteredCards = () => {
    let filtered = flashcards;
    
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== "All") {
      filtered = filtered.filter(card => card.category === filterCategory);
    }
    
    if (viewMode === "due") {
      filtered = filtered.filter(card => {
        if (card.mastered) return false;
        const daysSinceReview = Math.floor((Date.now() - new Date(card.last_reviewed)) / (1000 * 60 * 60 * 24));
        const interval = reviewIntervals[Math.min(card.review_count || 0, reviewIntervals.length - 1)];
        return daysSinceReview >= interval;
      });
    } else if (viewMode === "mastered") {
      filtered = filtered.filter(card => card.mastered);
    } else if (viewMode === "unmastered") {
      filtered = filtered.filter(card => !card.mastered);
    }
    
    return filtered;
  };

  const filteredCards = getFilteredCards();
  const totalFiltered = filteredCards.length;

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [searchTerm, filterCategory, viewMode]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < totalFiltered - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  // Handle review - Update in Supabase
  const handleReview = async (mastered) => {
    const card = filteredCards[currentIndex];
    if (!card) return;

    const updatedCard = {
      last_reviewed: new Date().toISOString().split('T')[0],
      review_count: (card.review_count || 0) + 1,
      mastered: mastered ? true : card.mastered
    };

    try {
      const { error } = await supabase
        .from('flashcards')
        .update(updatedCard)
        .eq('id', card.id);

      if (error) {
        console.error('Error updating card:', error);
        return;
      }

      const updatedCards = flashcards.map(c => {
        if (c.id === card.id) {
          return { ...c, ...updatedCard };
        }
        return c;
      });
      setFlashcards(updatedCards);
      
      if (currentIndex < totalFiltered - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFlipped(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Add Card to Supabase
  const handleAddCard = async () => {
    if (!newCard.question || !newCard.answer) return;
    if (!user) return;

    const card = {
      user_id: user.id,
      question: newCard.question,
      answer: newCard.answer,
      category: newCard.category || "General",
      difficulty: newCard.difficulty || "Medium",
      created_at: new Date().toISOString(),
      last_reviewed: new Date().toISOString().split('T')[0],
      review_count: 0,
      mastered: false
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([card])
        .select();

      if (error) {
        console.error('Error adding card:', error);
        return;
      }

      setFlashcards([...flashcards, data[0]]);
      setNewCard({ question: "", answer: "", category: "General", difficulty: "Medium" });
      setIsAdding(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Edit Card in Supabase
  const handleEditCard = (id) => {
    const card = flashcards.find(c => c.id === id);
    if (card) {
      setNewCard({ 
        question: card.question, 
        answer: card.answer, 
        category: card.category, 
        difficulty: card.difficulty 
      });
      setEditId(id);
      setIsEditing(true);
    }
  };

  // Update Card in Supabase
  const handleUpdateCard = async () => {
    if (!newCard.question || !newCard.answer) return;

    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          question: newCard.question,
          answer: newCard.answer,
          category: newCard.category,
          difficulty: newCard.difficulty
        })
        .eq('id', editId);

      if (error) {
        console.error('Error updating card:', error);
        return;
      }

      const updatedCards = flashcards.map(c => {
        if (c.id === editId) {
          return { ...c, ...newCard };
        }
        return c;
      });
      setFlashcards(updatedCards);
      setNewCard({ question: "", answer: "", category: "General", difficulty: "Medium" });
      setIsEditing(false);
      setEditId(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Delete Card from Supabase
  const handleDeleteCard = async (id) => {
    if (!window.confirm("Delete this flashcard?")) return;

    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting card:', error);
        return;
      }

      setFlashcards(flashcards.filter(c => c.id !== id));
      if (currentIndex >= totalFiltered - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Reset all progress in Supabase
  const handleResetProgress = async () => {

    try {
      const resetData = {
        review_count: 0,
        mastered: false,
        last_reviewed: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('flashcards')
        .update(resetData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting progress:', error);
        return;
      }

      const resetCards = flashcards.map(c => ({
        ...c,
        review_count: 0,
        mastered: false,
        last_reviewed: new Date().toISOString().split('T')[0]
      }));
      setFlashcards(resetCards);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStats = () => {
    const total = flashcards.length;
    const mastered = flashcards.filter(c => c.mastered).length;
    const unmastered = total - mastered;
    const totalReviews = flashcards.reduce((sum, c) => sum + (c.review_count || 0), 0);
    return { total, mastered, unmastered, totalReviews };
  };

  const stats = getStats();
  const currentCard = filteredCards[currentIndex];

  const getReviewInterval = (card) => {
    if (!card) return "";
    if (card.mastered) return "Mastered";
    const daysSinceReview = Math.floor((Date.now() - new Date(card.last_reviewed)) / (1000 * 60 * 60 * 24));
    const interval = reviewIntervals[Math.min(card.review_count || 0, reviewIntervals.length - 1)];
    const daysLeft = interval - daysSinceReview;
    return daysLeft > 0 ? `${daysLeft} days left` : "Due now!";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-4 sm:py-6 px-3 sm:px-4 md:px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <FaArrowLeft className="text-[10px] sm:text-xs" />
              Back to Home
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 dark:text-white mt-1 flex items-center gap-2 sm:gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <FaBookOpen className="text-white text-sm sm:text-base" />
              </div>
              <span>Flashcards</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                showStats
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-600'
              }`}
            >
              <FaChartBar className="text-[10px] sm:text-xs" /> Stats
            </button>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/50 transition-all"
            >
              <FaPlus className="text-[10px] sm:text-xs" /> Add Card
            </button>
          </div>
        </div>

        {/* ─── Stats Bar ────────────────────────────────────────────── */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shadow-sm">
                <div className="text-center p-2 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">Total Cards</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.mastered}</p>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">Mastered</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                  <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.unmastered}</p>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">Learning</p>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20">
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalReviews}</p>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">Reviews</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Filters ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1 w-full sm:w-auto">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm" />
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm"
            >
              <option value="all">All Cards</option>
              <option value="due">Due for Review</option>
              <option value="unmastered">Learning</option>
              <option value="mastered">Mastered</option>
            </select>

            <button
              onClick={handleResetProgress}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-red-500 hover:text-red-500 transition-all text-xs sm:text-sm"
            >
              <FaRedo className="inline mr-1 text-[10px] sm:text-xs" /> Reset
            </button>
          </div>
        </div>

        {/* ─── Flashcard Area ───────────────────────────────────────── */}
        {totalFiltered > 0 ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative cursor-pointer"
                onClick={handleFlip}
              >
                {/* Progress indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                    Card {currentIndex + 1} of {totalFiltered}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className={`text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                      currentCard?.difficulty === "Easy" 
                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" 
                        : currentCard?.difficulty === "Medium" 
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400" 
                        : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
                    }`}>
                      {currentCard?.difficulty}
                    </span>
                    <span className="text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {currentCard?.category}
                    </span>
                    {currentCard?.mastered && (
                      <span className="text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <FaStar className="text-[6px] sm:text-[8px]" /> Mastered
                      </span>
                    )}
                    {!currentCard?.mastered && (
                      <span className="text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                        <FaClock className="text-[6px] sm:text-[8px]" /> {getReviewInterval(currentCard)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex items-center justify-center p-6 sm:p-8 lg:p-12 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center w-full">
                    <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 text-amber-500">
                      {isFlipped ? <FaLightbulb /> : <FaQuestionCircle />}
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-stone-400 dark:text-stone-500 mb-1 sm:mb-2 uppercase tracking-wider">
                      {isFlipped ? "Answer" : "Question"}
                    </h3>
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-stone-900 dark:text-white max-w-2xl mx-auto break-words px-2">
                      {isFlipped ? currentCard?.answer : currentCard?.question}
                    </p>
                    <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-stone-400 dark:text-stone-500">
                      Click to {isFlipped ? "show question" : "reveal answer"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Card Actions */}
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6"
              >
                <button
                  onClick={() => handleReview(false)}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-500 transition-all"
                >
                  <FaThumbsDown className="text-[10px] sm:text-xs" /> Need Review
                </button>
                <button
                  onClick={() => handleReview(true)}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                >
                  <FaThumbsUp className="text-[10px] sm:text-xs" /> Got It!
                </button>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
                  currentIndex === 0
                    ? 'text-stone-400 dark:text-stone-600 cursor-not-allowed'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <FaArrowLeft className="text-[8px] sm:text-[10px]" /> Prev
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleEditCard(currentCard?.id)}
                  className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                >
                  <FaEdit className="text-xs sm:text-sm" />
                </button>
                <button
                  onClick={() => handleDeleteCard(currentCard?.id)}
                  className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <FaTrash className="text-xs sm:text-sm" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalFiltered - 1}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
                    currentIndex === totalFiltered - 1
                      ? 'text-stone-400 dark:text-stone-600 cursor-not-allowed'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  Next <FaArrowRight className="text-[8px] sm:text-[10px]" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 sm:mt-4 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalFiltered) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 sm:p-12 text-center min-h-[280px] sm:min-h-[300px] flex flex-col items-center justify-center shadow-sm">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 text-amber-500">
              <FaBookOpen />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-2">
              No Flashcards Found
            </h3>
            <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 mb-4">
              {searchTerm || filterCategory !== "All" || viewMode !== "all" 
                ? "Try adjusting your filters" 
                : "Start by adding your first flashcard"}
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
            >
              <FaPlus className="text-[10px] sm:text-xs" /> Add Card
            </button>
          </div>
        )}

        {/* ─── Add/Edit Modal ───────────────────────────────────────── */}
        {(isAdding || isEditing) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 lg:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    {isEditing ? <FaEdit className="text-white text-xs sm:text-sm" /> : <FaPlus className="text-white text-xs sm:text-sm" />}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                    {isEditing ? "Edit Flashcard" : "Add New Flashcard"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                    setEditId(null);
                    setNewCard({ question: "", answer: "", category: "General", difficulty: "Medium" });
                  }}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <FaTimes className="text-stone-500 dark:text-stone-400" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Question <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    placeholder="Enter question..."
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Answer <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    placeholder="Enter answer..."
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newCard.category}
                      onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                      placeholder="e.g., Programming"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={newCard.difficulty}
                      onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm"
                    >
                      <option value="Easy">🟢 Easy</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Hard">🔴 Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={isEditing ? handleUpdateCard : handleAddCard}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                >
                  {isEditing ? "Update Card" : "Add Card"}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                    setEditId(null);
                    setNewCard({ question: "", answer: "", category: "General", difficulty: "Medium" });
                  }}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 font-semibold text-sm text-stone-700 dark:text-stone-200 hover:border-red-500 hover:text-red-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;