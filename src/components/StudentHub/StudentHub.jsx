// src/components/StudentHub/StudentHub.jsx - Clean Modern Design with Section Labels
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaBook,
  FaVideo,
  FaUsers,
  FaStar,
  FaPlay,
  FaDownload,
  FaShare,
  FaEye,
  FaTimes,
  FaGlobe,
  FaChartLine,
  FaLightbulb,
  FaCode,
  FaBrain,
  FaThumbsUp,
  FaComments,
  FaCircle,
  FaGraduationCap,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// ─── Book Detail Modal ──────────────────────────────────────────────────
const BookDetailModal = ({ book, onClose }) => {
  if (!book) return null;

  const handleReadOnline = () => {
    if (!book.pdfUrl) {
      return;
    }
    window.open(book.pdfUrl, '_blank');
  };

  const handleDownload = () => {
    if (!book.pdfUrl) {
      return;
    }
    window.open(book.pdfUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out this book: ${book.title} by ${book.author}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <FaBook className="text-white text-sm" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-stone-900 dark:text-white text-sm sm:text-lg truncate">
                {book.title}
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                by {book.author}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all">
            <FaTimes className="text-stone-500 text-lg" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0 mx-auto md:mx-0 max-w-[180px] md:max-w-none">
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <img src={book.cover} alt={book.title} className="w-full h-auto rounded-lg" loading="lazy" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-extrabold text-stone-900 dark:text-white">{book.title}</h3>
              <p className="text-stone-500 dark:text-stone-400">by {book.author}</p>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{book.category}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{book.level}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">{book.pages} pg</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{book.year}</span>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">{book.description}</p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-sm ${i < Math.floor(book.rating) ? 'text-amber-400' : 'text-stone-300'}`} />
                  ))}
                  <span className="font-bold text-stone-900 dark:text-white">{book.rating}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">({book.reviews.toLocaleString()})</span>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">{book.price}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button onClick={handleReadOnline} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <FaBook className="text-sm" /> Read
                </button>
                <button onClick={handleDownload} className="flex-1 min-w-[100px] px-4 py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
                  <FaDownload className="text-sm" /> Download
                </button>
                <button onClick={handleShare} className="px-4 py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 transition-all">
                  <FaShare className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StudentHub = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("books");
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── User Data ──────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    avatar: "",
    premium: false,
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCurrentUser({
        name: settingsData?.full_name || user.email?.split('@')[0] || 'User',
        email: settingsData?.email || user.email || '',
        avatar: settingsData?.avatar || null,
        premium: settingsData?.premium || false,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
 
// ─── Books Data with Correct PDF Filenames ──────────────────────────
  const books = [
    {
      id: 1,
      title: "The Healthy Work Environments",
      author: "Thomas H. Cormen",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR__d0HLQ449NyFU5x3CDo9rwb45s7wjPo_JEA-Yig0lA&s=10",
      description: "This project will result in six Healthy Work Environments Best Practice Guidelines This pocket guide resource has been summarized from the Registered Nurses’ Association of Ontario (RNAO) six foundational Healthy Work Environments Best Practice Guidelines (HWE BPGs): ",
      category: "The Healthy",
      pages: 1312,
      rating: 4.8,
      reviews: 2847,
      price: "Free",
      pdfUrl: "/books/Clean_Code.pdf",
      year: 2009,
    },
    {
      id: 2,
      title: "Medical Biochemistry (4th Edition)",
      author: "Stuart Russell",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqubn-o-MPUoTpNrF5FRS_eq8eNZ2yd_VNI6QuVfg1yw&s=10",
      description: "Limited permission is granted free of charge to print or photocopy all pages of this publication for educational, not-for-profit use by health care workers , students or faculty. All copies must retain all author credits and copyright notices included",
      category: "AI & Machine Learning",
      pages: 1136,
      rating: 4.9,
      reviews: 789,
      price: "Free",
      pdfUrl: "/books/Medical Biochemistry.pdf",
      year: 2020,
    },
    {
      id: 3,
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxbWru4NN_VEQ_0_IwWBlgu-cgdo5ZQ8jyjLiZgI9LPw&s=10",
      description: "edition and related web site are NOT prepared, approved, licensed, endorsed or sponsored or otherwise affiliated with Napoleon Hill; his family and heirs; the Napoleon Hill Foundation; the Ralstom.",
      category: "Self-Help",
      pages: 256,
      rating: 4.9,
      reviews: 1234,
      price: "Free",
      pdfUrl: "/books/Art_of_Computer_Programming.pdf",
      year: 2011,
      level: "Advanced"
    },
    {
      id: 4,
      title: "Physics Volume 3",
      author: "Robert C. Martin",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxC3iYoTs5ccxqZx4KYFo5-mFJq4lKDbdq0E1bqJ2x0g&s=10",
      description: "OpenStax book covers, OpenStax CNX name, OpenStax CNX logo, OpenStax Tutor name, Openstax Tutor logo, Connexions name, Connexions logo, Rice University name, and Rice University logo are not subject to the license and may not be reproduced without the prior.",
      category: "Programming",
      pages: 464,
      rating: 4.7,
      reviews: 5234,
      price: "Free",
      pdfUrl: "/books/Physics Volume 3.pdf",
      year: 2008,
    },
    {
      id: 5,
      title: "The Colour Out of Space ",
      author: "James F. Kurose",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD2d7_0MVOfCmWdQS0sEsws15WQDGPKBpejL55eH3Y1w&s",
      description: "West of Arkham the hills rise wild, and there are valleys with deep woods that no axe has ever cut. There are dark narrow glens where the trees slope fantastically, and where thin brooklets tricklecky.",
      category: "Networking",
      pages: 862,
      rating: 4.8,
      reviews: 456,
      price: "Free",
      pdfUrl: "/books/The Colour Out of Space.pdf",
      year: 2021,
    },
    {
      id: 6,
      title: "CHEMISTRY AN ATOMS FIRST",
      author: "Narasimha Karumanchi",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPRuYhbDrkLqQVPyDMedsStDeYM6xwKY8SNuM3UXz26Q&s=10",
      description: "First Lecture: Mathematical review, units significant figures SI units length: Mass, time, temperature, derived units: Volume, density Uncertainty in measurement Units and dimensional analysis (Factor label method)",
      category: "Computer Science",
      pages: 800,
      rating: 4.6,
      reviews: 1567,
      price: "Free",
      pdfUrl: "/books/Intro_Machine_Learning.pdf",
      year: 2017,
    },
    {
      id: 7,
      title: "The Black Moth",
      author: "Raghu Ramakrishnan",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2YL22uq_gq5juxaDk4nec5qNZIchIg20Uf-rcHrrByA&s=10",
      description: "Solely within the walls of the Chequers lay his world, that inn having been acquired by his greatgrandfather as far back as the year 1667, when the jovial Stuart King sat on the English throne, and the Hanoverian Electors were not yet dreamed of.",
      category: "Database",
      pages: 1068,
      rating: 4.6,
      reviews: 567,
      price: "Free",
      pdfUrl: "/books/The Black Moth.pdf",
      year: 2019,
    },
    {
      id: 8,
      title: "Python Codes for the Travelling",
      author: "Ian Goodfellow",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3C-te8brAN0G3RaSM6v0NUxuNIkTu5qGhzozJcQcToQ&s=10",
      description: "similar initiatives in other territories, the volumes in this series offer an overview of mathematical methods for post-master students and researchers in Operations Research.",
      category: "AI & Machine Learning",
      pages: 800,
      rating: 4.9,
      reviews: 1956,
      price: "Free",
      pdfUrl: "/books/Python_Running.pdf",
      year: 2016,
      level: "Advanced"
    },
    {
      id: 9,
      title: "Russian society",
      author: "Erich Gamma",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx3aXyehuxKSwvn2y2xp4gNH9TjER8_Kn5LUZmTSWs7Q&s=10",
      description: "Love in Russian society at the end of the 19th century was not exactly a simple matter. A mistake made within marriage could  be very expensive.",
      category: "Programming",
      pages: 395,
      rating: 4.9,
      reviews: 6789,
      price: "Free",
      pdfUrl: "/books/Russian society.pdf",
      year: 1994,
    },
    {
      id: 10,
      title: "Linux_Command_Line",
      author: "Ethem Alpaydin",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd6bNX7DxOw5ZNJWMZIFcOlr_rtFxvNLydEPA8pYZQJg&s=10",
      description: "book is compiled from Stack Overflow Documentation, the content is written by the beautiful people at Stack Overflow. Text content is released under Creative Commons BY-SA, see credits at the end of their respective owners unless otherwise specified",
      category: "AI & Machine Learning",
      pages: 584,
      rating: 4.4,
      reviews: 765,
      price: "Free",
      pdfUrl: "/books/Linux_Command_Line.pdf",
      year: 2014,
    },
    {
      id: 11,
      title: "The Ye llow Wa llpapar",
      author: "Douglas Crockford",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLYhmTyJGaqnf8OvirzU-mdOsPuyzuafTBSay8TTZiwA&s=10",
      description: "It is very seldom that mere ordinary people like John and myself secure ancestral halls for the summer. A colonial mansion, a hereditary estate, I would say a haunted house, and fate!",
      category: "Web Development",
      pages: 176,
      rating: 4.4,
      reviews: 2345,
      price: "Free",
      pdfUrl: "/books/JavaScript_Good_Parts.pdf",
      year: 2008,
    },

    {
      id: 13,
      title: "height of romantic felicity",
      author: "Andrew Ng",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq3o1cjuhjhpxZJjHI0Wo8J2FcX96fOs4B_wK1awlXrg&s",
      description: "reach the height of romantic felicity—but that would be asking too much of reach the height of romantic felicity—but that would be asking too much",
      category: "AI & Machine Learning",
      pages: 320,
      rating: 4.5,
      reviews: 876,
      price: "Free",
      pdfUrl: "/books/Machine_Learning_for_Beginners.pdf",
      year: 2020,
      level: "Beginner"
    },
    {
      id: 14,
      title: "THE $30,000 BEQUEST",
      author: "Charu Aggarwal",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbcbwKVjv_zWwFYqbKg6w9thU_OGn27XRgua0qB32xVw&s",
      description: "First published in 1906. This ebook edition was created and published by Global Grey on the 17th November 2021, and updated on the 10th October 2022. The artwork used for the cover is ‘Suburban Villa.",
      category: "AI & Machine Learning",
      pages: 496,
      rating: 4.7,
      reviews: 654,
      price: "Free",
      pdfUrl: "/books/Neural_Networks_Deep_Learning.pdf",
      year: 2018,
    },

    {
      id: 16,
      title: "SYNOPSIS OF PRIDE AND PREJUDICE",
      author: "Eric Matthes",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnNWgEPvYZGZLMeTS6Dl1L6eG05rdD30EK9zZcWh0_hg&s=10",
      description: "his book arises from a deep knowledge of domestic life and  the human condition. It is a book full of satire, sharp, profound  and anti-romantic at the same time Pride and Prejudice has captivated several generations thanks contradictory. ",
      category: "Programming",
      pages: 544,
      rating: 4.6,
      reviews: 3124,
      price: "Free",
      pdfUrl: "/books/SYNOPSIS OF PRIDE.pdf",
      year: 2019,
    },
    {
      id: 17,
      title: "Building a Healthy",
      author: "Stoyan Stefanov",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvZeOlOzhxezUB_NG8Bf6BUucLyNnUla5JNNtQ7gqm9g&s",
      description: "Build A Toolkit for Implementing Healthy Work Environmentsfor the Community Sector",
      category: "Web Development",
      pages: 316,
      rating: 4.5,
      reviews: 987,
      price: "Free",
      pdfUrl: "/books/Building a Healthy Workplace.pdf",
      year: 2021,
    },
    {
      id: 18,
      title: "Pharmacology for nurses",
      author: "James D. Miller",
      cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYjc5FWo1v1Nkp4Ob3nGkt_BwZ9HH9aokMHnW7YIQAaA&s=10",
      description: "Essential statistics Pharmacology for nurses and fully Detials comprehensive medical study and Brenner.",
      category: "Data Science",
      pages: 456,
      rating: 4.3,
      reviews: 543,
      price: "Free",
      pdfUrl: "/books/Pharmacology.pdf",
      year: 2020,
      level: "Intermediate"
    }
  ];


// ─── Videos Data ──────────────────────────────────────────────────────
const videos = [
  {
    id: 1,
    title: "Introduction to AI",
    description: "Learn the fundamentals of Artificial Intelligence from scratch.",
    thumbnail: "https://img.youtube.com/vi/2ePf9rue1Ao/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=2ePf9rue1Ao",
    category: "AI & Machine Learning",
    duration: "45:30",
    views: 125000,
    instructor: "Stanford University",
    likes: 4300,        // ✅ Added
    comments: 289       // ✅ Added
  },
  {
    id: 2,
    title: "Machine Learning Crash Course",
    description: "Quick and comprehensive ML tutorial.",
    thumbnail: "https://img.youtube.com/vi/GwIo3gDZCVQ/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=GwIo3gDZCVQ",
    category: "AI & Machine Learning",
    duration: "32:15",
    views: 89000,
    instructor: "Google Developers",
    likes: 3200,        // ✅ Added
    comments: 156       // ✅ Added
  },
  {
    id: 3,
    title: "React Tutorial for Beginners",
    description: "Build modern React applications from scratch.",
    thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
    category: "Web Development",
    duration: "52:45",
    views: 210000,
    instructor: "freeCodeCamp",
    likes: 5600,        // ✅ Added
    comments: 423       // ✅ Added
  },
  {
    id: 4,
    title: "Node.js & Express.js Crash Course",
    description: "Build REST APIs with Node.js and Express.js.",
    thumbnail: "https://img.youtube.com/vi/Oe421EPjeBE/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
    category: "Backend",
    duration: "1:20:15",
    views: 312000,
    instructor: "freeCodeCamp",
    likes: 7800,        // ✅ Added
    comments: 567       // ✅ Added
  },
  {
    id: 5,
    title: "Python Django Full Course",
    description: "Build web applications with Django framework.",
    thumbnail: "https://img.youtube.com/vi/F5mRW0jo-U4/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=F5mRW0jo-U4",
    category: "Backend",
    duration: "2:10:30",
    views: 187000,
    instructor: "Django Software Foundation",
    likes: 4500,        // ✅ Added
    comments: 312       // ✅ Added
  }
];

  // ─── Community Data ──────────────────────────────────────────────────
  const communities = [
    { id: 1, name: "Global Study Group", icon: FaGlobe, members: 2345, online: 89, category: "General", status: "active" },
    { id: 2, name: "AI Enthusiasts", icon: FaBrain, members: 1567, online: 234, category: "AI", status: "active" },
    { id: 3, name: "Web Developers Hub", icon: FaCode, members: 2341, online: 156, category: "Programming", status: "coming" },
    { id: 4, name: "Data Science Club", icon: FaChartLine, members: 1890, online: 67, category: "Data Science", status: "coming" },
    { id: 5, name: "Study Tips & Tricks", icon: FaLightbulb, members: 1234, online: 45, category: "Study", status: "coming" },
    { id: 6, name: "Book Club", icon: FaBook, members: 987, online: 23, category: "Reading", status: "coming" }
  ];
  const tabs = [
    { id: "books", label: "Books", icon: FaBook, count: books.length },
    { id: "videos", label: "Videos", icon: FaVideo, count: videos.length },
    { id: "community", label: "Community", icon: FaUsers, count: communities.length },
  ];

  // ─── Books Tab ─────────────────────────────────────────────────────
  const BooksTab = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <FaBook className="text-amber-500" />
          Books Collection
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Explore our curated collection of free books</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {books.map(book => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedBook(book)}
            className="group bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 cursor-pointer transition-all hover:border-amber-300 dark:hover:border-amber-700"
          >
            <div className="relative aspect-[3/4] bg-stone-50 dark:bg-stone-800">
              <img src={book.cover} alt={book.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-medium rounded-full bg-amber-500 text-white">{book.level}</span>
            </div>
            <div className="p-2.5">
              <h3 className="font-bold text-stone-900 dark:text-white text-xs line-clamp-1 group-hover:text-amber-600">{book.title}</h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{book.author}</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-0.5">
                  <FaStar className="text-amber-400 text-[10px]" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{book.rating}</span>
                </div>
                <button className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">View</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Videos Tab ─────────────────────────────────────────────────────
  const VideosTab = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <FaVideo className="text-amber-500" />
          Video Library
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Watch free educational videos from top instructors</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map(video => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => window.open(video.url, '_blank')}
            className="group bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 cursor-pointer transition-all hover:border-amber-300 dark:hover:border-amber-700"
          >
            <div className="relative aspect-video bg-stone-50 dark:bg-stone-800">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <FaPlay className="text-white text-lg" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full">{video.duration}</span>
              <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-medium px-2 py-0.5 rounded-full">{video.category}</span>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm line-clamp-1">{video.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">{video.instructor}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5 text-xs text-stone-500 dark:text-stone-400"><FaEye className="text-[10px]" /> {video.views.toLocaleString()}</span>
                  <span className="flex items-center gap-0.5 text-xs text-stone-500 dark:text-stone-400"><FaThumbsUp className="text-[10px]" /> {video.likes.toLocaleString()}</span>
                </div>
                <span className="text-xs font-medium text-amber-500 group-hover:text-amber-600">Watch →</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Community Tab ─────────────────────────────────────────────────
  const CommunityTab = () => (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <FaUsers className="text-amber-500" />
          Community Hub
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Join communities and connect with fellow learners</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map(community => {
          const Icon = community.icon;
          return (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-stone-900 rounded-xl p-4 border border-stone-200 dark:border-stone-800 transition-all hover:border-amber-300 dark:hover:border-amber-700"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-base flex-shrink-0">
                  <Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 dark:text-white text-sm truncate">{community.name}</h3>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{community.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-500 dark:text-stone-400"><FaUsers className="inline mr-0.5" /> {community.members.toLocaleString()}</span>
                    <span className="text-xs text-emerald-500 flex items-center"><FaCircle className="inline mr-0.5 text-[6px]" /> {community.online}</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-amber-50 transition-all">
                <FaComments className="inline mr-1" /> Join
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <FaSpinner className="text-4xl text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-stone-500 dark:text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-6 px-4 sm:px-6 overflow-x-hidden">
      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>

      {/* ─── Logo ────────────────────────────────────────────────────── */}
      <div className="text-center mb-4">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <span className="text-3xl font-black">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">AI</span>
            <span className="text-stone-900 dark:text-white">Study</span>
          </span>
        </Link>
        {currentUser.name && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Welcome back, {currentUser.name}
          </p>
        )}
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex justify-center gap-1 mb-6 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 max-w-md mx-auto overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all min-w-[60px] ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="text-sm sm:text-base" />
              <span className="hidden xs:inline">{tab.label}</span>
              <span className={`text-[9px] px-1.5 rounded-full ${isActive ? 'bg-white/25' : 'bg-stone-100 dark:bg-stone-800'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "books" && (
            <motion.div key="books" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <BooksTab />
            </motion.div>
          )}
          {activeTab === "videos" && (
            <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <VideosTab />
            </motion.div>
          )}
          {activeTab === "community" && (
            <motion.div key="community" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <CommunityTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentHub;