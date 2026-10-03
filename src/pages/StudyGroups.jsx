// pages/StudyGroups.jsx — Modern "My Leagues" Style Groups Page with Custom Toast
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaSpinner,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUsers,
  FaComments,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrash,
  FaShieldAlt,
  FaBookOpen,
  FaGraduationCap,
  FaCalendarAlt,
  FaEdit,
  FaImage,
  FaUpload,
  FaCamera,
  FaFileAlt,
  FaFire,
  FaStar,
  FaHashtag,
  FaMusic,
  FaGamepad,
  FaFilm,
  FaCode,
  FaPalette,
  FaTheaterMasks,
  FaUtensils,
  FaFutbol,
  FaCar,
  FaHeart,
  FaRocket,
  FaGlobe,
  FaCompass,
  FaSmile,
  FaCoffee,
  FaBullhorn,
  FaMeteor,
  FaCrown,
  FaGem,
  FaMagic,
  FaPuzzlePiece,
  FaPaintBrush,
  FaMicrophone,
  FaDumbbell,
  FaBrain,
  FaLaptop,
  FaMobileAlt,
  FaTablet,
  FaServer,
  FaCloud,
  FaRobot,
  FaIndustry,
  FaLandmark,
  FaUniversity,
  FaChalkboardTeacher,
  FaUserFriends,
  FaHandshake,
  FaTrophy,
  FaMedal,
  FaAward,
  FaLeaf,
  FaMountain,
  FaWater,
  FaSnowflake,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaWind,
  FaUmbrella,
  FaBolt,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaLock,
  FaLockOpen,
  FaEllipsisH,
  FaArrowLeft,
  FaArrowRight,
  FaFlag,
  FaCheckCircle,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   THEME STYLES
   ═══════════════════════════════════════════════════════════════ */
const GroupStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    /* ── DARK THEME ── */
    .theme-dark {
      --grp-bg:          #0A0A0A;
      --grp-card:        #121212;
      --grp-card-2:      #1A1A1A;
      --grp-hover:       #1E1E1E;
      --grp-line:        rgba(255,255,255,0.06);
      --grp-line-str:    rgba(255,255,255,0.12);
      --grp-txt:         #FFFFFF;
      --grp-txt-soft:    rgba(255,255,255,0.6);
      --grp-txt-faint:   rgba(255,255,255,0.35);
      --grp-primary:     #FF5C28;
      --grp-primary-2:   #FF8C42;
      --grp-primary-soft:rgba(255,92,40,0.12);
      --grp-primary-glow:rgba(255,92,40,0.4);
      --grp-danger:      #EF4444;
      --grp-danger-soft: rgba(239,68,68,0.12);
      --grp-success:     #22C55E;
      --grp-success-soft:rgba(34,197,94,0.12);
      --grp-warning:     #F59E0B;
      --grp-warning-soft:rgba(245,158,11,0.12);
      --grp-pill-bg:     #1E1E1E;
      --grp-pill-active: #FFFFFF;
      --grp-pill-txt:    #FFFFFF;
      --grp-input-bg:    #1A1A1A;
    }

    /* ── LIGHT THEME ── */
    .theme-light {
      --grp-bg:          #FFFFFF;
      --grp-card:        #FFFFFF;
      --grp-card-2:      #F9FAFB;
      --grp-hover:       #F3F4F6;
      --grp-line:        #E5E7EB;
      --grp-line-str:    #D1D5DB;
      --grp-txt:         #111827;
      --grp-txt-soft:    #6B7280;
      --grp-txt-faint:   #9CA3AF;
      --grp-primary:     #EA580C;
      --grp-primary-2:   #F97316;
      --grp-primary-soft:rgba(234,88,12,0.08);
      --grp-primary-glow:rgba(234,88,12,0.2);
      --grp-danger:      #DC2626;
      --grp-danger-soft: rgba(220,38,38,0.08);
      --grp-success:     #16A34A;
      --grp-success-soft:rgba(22,163,74,0.08);
      --grp-warning:     #D97706;
      --grp-warning-soft:rgba(217,119,6,0.08);
      --grp-pill-bg:     #FFFFFF;
      --grp-pill-active: #111827;
      --grp-pill-txt:    #FFFFFF;
      --grp-input-bg:    #F9FAFB;
    }

    .grp-bg { background: var(--grp-bg); color: var(--grp-txt); }
    .grp-card { background: var(--grp-card); border: 1px solid var(--grp-line); border-radius: 24px; }
    .grp-card-2 { background: var(--grp-card-2); border: 1px solid var(--grp-line); border-radius: 16px; }
    .grp-input { background: var(--grp-input-bg); color: var(--grp-txt); border: 1px solid var(--grp-line); }
    .grp-input:focus { border-color: var(--grp-primary); outline: none; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   CUSTOM TOAST HOOK & COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

  return { toasts, success, error, info, warning, removeToast: (id) => setToasts((p) => p.filter((t) => t.id !== id)) };
};

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          
          const bgColor = isError ? 'var(--grp-danger)' : isSuccess ? 'var(--grp-success)' : isWarning ? 'var(--grp-warning)' : 'var(--grp-primary)';
          const icon = isError ? <FaExclamationTriangle /> : isSuccess ? <FaCheckCircle /> : isWarning ? <FaExclamationTriangle /> : <FaInfoCircle />;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[280px] max-w-md"
              style={{ 
                background: 'var(--grp-card)', 
                borderColor: bgColor,
                borderLeftWidth: '4px'
              }}
              onClick={() => onDismiss(toast.id)}
            >
              <span className="text-lg flex-shrink-0" style={{ color: bgColor }}>
                {icon}
              </span>
              <p className="text-sm font-bold flex-1" style={{ color: 'var(--grp-txt)' }}>
                {toast.message}
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }} 
                className="text-[var(--grp-txt-soft)] hover:text-[var(--grp-txt)] transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// ═══ Category icon color map ═══
const CATEGORY_COLORS = {
  "Gaming":              { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Movies & Cinema":     { fg: "#B23A2E", bg: "rgba(178,58,46,0.12)" },
  "Music Lovers":        { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "Comedy & Humor":      { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Art & Creativity":    { fg: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  "Magic & Illusion":    { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Podcast & Voice":     { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "Cooking & Recipes":   { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Coffee & Chat":       { fg: "#8B5E3C", bg: "rgba(139,94,60,0.12)" },
  "Wellness & Health":   { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "Travel & Adventure":  { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "Nature & Outdoors":   { fg: "#164B3B", bg: "rgba(22,75,59,0.12)" },
  "Hiking & Trekking":   { fg: "#8B5E3C", bg: "rgba(139,94,60,0.12)" },
  "Sunshine & Beach":    { fg: "#E8A33D", bg: "rgba(232,163,61,0.14)" },
  "Water Sports & Swimming": { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "Winter Sports":       { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "Wind Sports & Kites": { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "Sports & Fitness":    { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Competitions & Events": { fg: "#C9920F", bg: "rgba(201,146,15,0.14)" },
  "Sports & Achievements": { fg: "#E8A33D", bg: "rgba(232,163,61,0.14)" },
  "Coding & Tech":       { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "Web Development":     { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "App Development":     { fg: "#164B3B", bg: "rgba(22,75,59,0.12)" },
  "AI & Robotics":       { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Cloud & DevOps":      { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "Tech & Innovation":   { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "Design & UX":         { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "Entrepreneurship":    { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Business & Networking": { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "Business & Finance":  { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "Leadership & Clubs":  { fg: "#C9920F", bg: "rgba(201,146,15,0.14)" },
  "Certifications & Skills": { fg: "#B9791E", bg: "rgba(185,121,30,0.14)" },
  "Book Club":           { fg: "#8B5E3C", bg: "rgba(139,94,60,0.12)" },
  "Study & Learning":    { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "Puzzles & Brain Games": { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Psychology & Mind":   { fg: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  "Academic Research":   { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "Teaching & Tutoring": { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "Fun & Games":         { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Motivation & Growth": { fg: "#E8A33D", bg: "rgba(232,163,61,0.14)" },
  "Personal Development": { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "Culture & Diversity": { fg: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  "Community Service":   { fg: "#164B3B", bg: "rgba(22,75,59,0.12)" },
  "Social Networking":   { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "Social Media":        { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Networking":          { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "Automotive & Cars":   { fg: "#B23A2E", bg: "rgba(178,58,46,0.12)" },
  "Photography":         { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "Fashion & Style":     { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "Science & Space":     { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Interior Design":     { fg: "#8B5E3C", bg: "rgba(139,94,60,0.12)" },
  "Energy & Environment": { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "Weather Enthusiasts": { fg: "#2A8FBD", bg: "rgba(42,143,189,0.12)" },
  "Night Owls":          { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "Law & Politics":      { fg: "#B23A2E", bg: "rgba(178,58,46,0.12)" },
  __default:             { fg: "#B9791E", bg: "rgba(185,121,30,0.12)" },
};

const getCategoryColor = (name) =>
  CATEGORY_COLORS[name] || CATEGORY_COLORS.__default;

const StudyGroups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [userGroups, setUserGroups] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    level: 'All Levels',
    max_members: 20,
    group_type: 'public',
    language: 'both',
    schedule: '',
    rules: '',
    image_url: '',
    cover_image_url: '',
  });

  const categorySuggestions = [
    { icon: FaGamepad, name: 'Gaming' },
    { icon: FaFilm, name: 'Movies & Cinema' },
    { icon: FaMusic, name: 'Music Lovers' },
    { icon: FaTheaterMasks, name: 'Comedy & Humor' },
    { icon: FaPalette, name: 'Art & Creativity' },
    { icon: FaMagic, name: 'Magic & Illusion' },
    { icon: FaMicrophone, name: 'Podcast & Voice' },
    { icon: FaUtensils, name: 'Cooking & Recipes' },
    { icon: FaCoffee, name: 'Coffee & Chat' },
    { icon: FaHeart, name: 'Wellness & Health' },
    { icon: FaCompass, name: 'Travel & Adventure' },
    { icon: FaLeaf, name: 'Nature & Outdoors' },
    { icon: FaDumbbell, name: 'Sports & Fitness' },
    { icon: FaMountain, name: 'Hiking & Trekking' },
    { icon: FaCode, name: 'Coding & Tech' },
    { icon: FaLaptop, name: 'Web Development' },
    { icon: FaMobileAlt, name: 'App Development' },
    { icon: FaRobot, name: 'AI & Robotics' },
    { icon: FaServer, name: 'Cloud & DevOps' },
    { icon: FaRocket, name: 'Entrepreneurship' },
    { icon: FaBookOpen, name: 'Book Club' },
    { icon: FaGraduationCap, name: 'Study & Learning' },
    { icon: FaPuzzlePiece, name: 'Puzzles & Brain Games' },
    { icon: FaBrain, name: 'Psychology & Mind' },
    { icon: FaUniversity, name: 'Academic Research' },
    { icon: FaChalkboardTeacher, name: 'Teaching & Tutoring' },
    { icon: FaSmile, name: 'Fun & Games' },
    { icon: FaFire, name: 'Motivation & Growth' },
    { icon: FaStar, name: 'Personal Development' },
    { icon: FaGlobe, name: 'Culture & Diversity' },
    { icon: FaBullhorn, name: 'Community Service' },
    { icon: FaCrown, name: 'Leadership & Clubs' },
    { icon: FaUserFriends, name: 'Social Networking' },
    { icon: FaHandshake, name: 'Business & Networking' },
    { icon: FaCar, name: 'Automotive & Cars' },
    { icon: FaCamera, name: 'Photography' },
    { icon: FaGem, name: 'Fashion & Style' },
    { icon: FaMeteor, name: 'Science & Space' },
    { icon: FaHashtag, name: 'Social Media' },
    { icon: FaUsers, name: 'Networking' },
    { icon: FaTrophy, name: 'Competitions & Events' },
    { icon: FaMedal, name: 'Sports & Achievements' },
    { icon: FaAward, name: 'Certifications & Skills' },
    { icon: FaSun, name: 'Sunshine & Beach' },
    { icon: FaMoon, name: 'Night Owls' },
    { icon: FaCloudSun, name: 'Weather Enthusiasts' },
    { icon: FaWater, name: 'Water Sports & Swimming' },
    { icon: FaSnowflake, name: 'Winter Sports' },
    { icon: FaWind, name: 'Wind Sports & Kites' },
    { icon: FaIndustry, name: 'Business & Finance' },
    { icon: FaLandmark, name: 'Law & Politics' },
    { icon: FaCloud, name: 'Tech & Innovation' },
    { icon: FaTablet, name: 'Design & UX' },
    { icon: FaPaintBrush, name: 'Interior Design' },
    { icon: FaBolt, name: 'Energy & Environment' },
  ];

  const filteredCategories = categorySuggestions.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const levelOptions = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const groupTypeOptions = [
    { value: 'public',      label: 'Public',      icon: FaGlobe,       desc: 'Anyone can join & see posts' },
    { value: 'private',     label: 'Private',     icon: FaLock,        desc: 'Admin approves new members' },
    { value: 'invite-only', label: 'Invite Only', icon: FaUserFriends, desc: 'Only via direct invite' },
  ];

  const languageOptions = [
    { value: 'english', label: 'English', flag: '🇬🇧' },
    { value: 'urdu',    label: 'اردو',    flag: '🇵🇰' },
    { value: 'both',    label: 'Both',    flag: '🌐' },
  ];

  const scheduleOptions = [
    { label: 'Mostly Mornings',    icon: FaSun },
    { label: 'Mostly Afternoons',  icon: FaCloudSun },
    { label: 'Mostly Evenings',    icon: FaMoon },
    { label: 'Mostly Nights',      icon: FaMoon },
    { label: 'Throughout the Day', icon: FaClock },
    { label: 'Only Weekends',      icon: FaCalendarAlt },
    { label: 'Random / Whenever',  icon: FaBolt },
  ];

  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const scheduleDropdownRef = useRef(null);

  const filteredSchedules = scheduleOptions.filter(opt =>
    opt.label.toLowerCase().includes(scheduleSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (scheduleDropdownRef.current && !scheduleDropdownRef.current.contains(event.target)) {
        setShowScheduleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) { console.error('Error fetching groups:', groupsError); setError('Failed to load groups'); setLoading(false); return; }

      const { data: memberData, error: memberError } = await supabase
        .from('study_group_members')
        .select('group_id, role')
        .eq('user_id', user.id);

      if (!memberError) setUserGroups(memberData.map(m => m.group_id));

      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { count: postCount } = await supabase
            .from('study_group_posts')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            member_count: count || 0,
            post_count: postCount || 0,
            is_member: memberData?.some(m => m.group_id === group.id) || false,
            is_admin: memberData?.some(m => m.group_id === group.id && m.role === 'admin') || false,
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const uploadImage = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('study-group-images').upload(filePath, file);
    if (error) { console.error('Error uploading image:', error); return null; }
    const { data: urlData } = supabase.storage.from('study-group-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      let imageUrl = null, coverImageUrl = null;
      if (imageFile) imageUrl = await uploadImage(imageFile, 'group-logos');
      if (coverImageFile) coverImageUrl = await uploadImage(coverImageFile, 'group-covers');

      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert({
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          level: formData.level,
          max_members: parseInt(formData.max_members),
          meeting_type: formData.group_type,
          location: formData.language,
          meeting_link: formData.rules || null,
          schedule: formData.schedule,
          image_url: imageUrl,
          cover_image_url: coverImageUrl,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) { 
        console.error('Error creating group:', error); 
        toast.error('Failed to create group: ' + error.message); 
        setProcessing(false); 
        return; 
      }

      await supabase.from('study_group_members').insert({ group_id: newGroup.id, user_id: user.id, role: 'admin' });

      toast.success('Group created successfully!');
      setShowCreateModal(false);
      resetForm();
      navigate(`/study-groups/${newGroup.id}`);
      fetchGroups();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to create group. Please try again.');
    } finally { setProcessing(false); }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      let imageUrl = formData.image_url;
      let coverImageUrl = formData.cover_image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile, 'group-logos');
      if (coverImageFile) coverImageUrl = await uploadImage(coverImageFile, 'group-covers');

      const { error } = await supabase
        .from('study_groups')
        .update({
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          level: formData.level,
          max_members: parseInt(formData.max_members),
          meeting_type: formData.group_type,
          location: formData.language,
          meeting_link: formData.rules || null,
          schedule: formData.schedule,
          image_url: imageUrl,
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', showEditModal.id)
        .eq('created_by', user.id);

      if (error) { 
        toast.error('Failed to update group: ' + error.message); 
        setProcessing(false); 
        return; 
      }
      toast.success('Group updated successfully!');
      setShowEditModal(null);
      resetForm();
      fetchGroups();
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update group. Please try again.');
    } finally { setProcessing(false); }
  };

  const resetForm = () => {
    setFormData({
      name: '', subject: '', description: '', level: 'All Levels', max_members: 20,
      group_type: 'public', language: 'both', schedule: '', rules: '',
      image_url: '', cover_image_url: '',
    });
    setImageFile(null); setImagePreview(null);
    setCoverImageFile(null); setCoverImagePreview(null);
    setSelectedCategory(null); setCategorySearch(''); setScheduleSearch('');
  };

  const openEditModal = (group) => {
    setFormData({
      name: group.name || '',
      subject: group.subject || '',
      description: group.description || '',
      level: group.level || 'All Levels',
      max_members: group.max_members || 20,
      group_type: group.meeting_type || 'public',
      language: group.location || 'both',
      schedule: group.schedule || '',
      rules: group.meeting_link || '',
      image_url: group.image_url || '',
      cover_image_url: group.cover_image_url || '',
    });
    setImagePreview(group.image_url || null);
    setCoverImagePreview(group.cover_image_url || null);
    setSelectedCategory(null);
    setShowEditModal(group);
  };

  const handleDeleteGroup = async (groupId) => {
    setConfirmModal({
      title: 'Delete Group',
      message: 'Are you sure you want to delete this group? This action cannot be undone.',
      action: async () => {
        try {
          const { error } = await supabase.from('study_groups').delete().eq('id', groupId).eq('created_by', user.id);
          if (error) { toast.error('Failed to delete group: ' + error.message); return; }
          toast.success('Group deleted successfully.');
          setConfirmModal(null);
          fetchGroups();
        } catch (err) { console.error('Error:', err); toast.error('Failed to delete group. Please try again.'); }
      },
      cancel: () => setConfirmModal(null),
      type: 'danger',
    });
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'my-groups') return matchesSearch && userGroups.includes(group.id);
    if (filter === 'available') return matchesSearch && !userGroups.includes(group.id) && group.status === 'active';
    return matchesSearch && group.status === 'active';
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen grp-bg font-ticket-body relative">
      <GroupStyles />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.removeToast} />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-[var(--grp-primary)] flex items-center justify-center">
              <FaUsers className="text-[var(--grp-primary)] text-sm" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-[var(--grp-txt)]">
              My Leagues
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="group flex items-center gap-2 px-4 py-2 bg-[var(--grp-primary)] text-white rounded-full font-bold text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-lg shadow-[var(--grp-primary-glow)]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 group-hover:rotate-90 transition-transform">
              <FaPlus className="text-[8px]" />
            </span>
            <span>NEW</span>
          </button>
        </div>

        {/* ─── FILTER PILLS ─── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {[
            { id: 'all', label: 'Active' },
            { id: 'my-groups', label: 'Ambassadors' },
            { id: 'available', label: 'Completed' },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 ${
                  isActive
                    ? 'bg-[var(--grp-primary)] text-white border-[var(--grp-primary)] shadow-md shadow-[var(--grp-primary-glow)]'
                    : 'bg-[var(--grp-card)] text-[var(--grp-txt-soft)] border-[var(--grp-line)] hover:border-[var(--grp-primary)]'
                }`}
              >
                {isActive && <span className="inline-block h-2 w-2 rounded-full bg-white mr-2 align-middle" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── SEARCH ─── */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--grp-txt-faint)] text-xs" />
          <input
            type="text"
            placeholder="Search leagues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl grp-input text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--grp-txt-faint)] hover:text-[var(--grp-primary)] transition-colors"
            >
              <FaTimes className="text-[10px]" />
            </button>
          )}
        </div>

        {/* ─── GROUP LIST ─── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="text-3xl text-[var(--grp-primary)] animate-spin mx-auto mb-3" />
              <p className="text-sm text-[var(--grp-txt-soft)]">Loading leagues...</p>
            </div>
          </div>
        ) : error ? (
          <div className="grp-card py-16 text-center">
            <FaExclamationTriangle className="text-4xl text-[var(--grp-danger)] mx-auto mb-4" />
            <p className="text-[var(--grp-txt)] font-bold">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-4 px-6 py-2 bg-[var(--grp-primary)] text-white rounded-xl text-sm font-bold"
            >
              Try Again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="grp-card py-16 text-center px-4">
            <FaUsers className="text-5xl text-[var(--grp-txt-faint)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--grp-txt)]">
              {searchTerm ? 'No leagues found' : 'No leagues yet'}
            </h3>
            <p className="text-sm text-[var(--grp-txt-soft)] mt-1 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search' : 'Be the first to create a league!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2.5 bg-[var(--grp-primary)] text-white rounded-xl text-sm font-bold hover:scale-[1.03] transition-transform"
              >
                Create League
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <LeagueCard
                key={group.id}
                group={group}
                user={user}
                onDelete={() => handleDeleteGroup(group.id)}
                onEdit={() => openEditModal(group)}
                onViewDetails={() => navigate(`/study-groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateGroupWizard
            onClose={() => { setShowCreateModal(false); resetForm(); }}
            onSubmit={handleCreateGroup}
            processing={processing}
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            coverImagePreview={coverImagePreview}
            handleImageChange={handleImageChange}
            handleCoverImageChange={handleCoverImageChange}
            fileInputRef={fileInputRef}
            coverFileInputRef={coverFileInputRef}
            filteredCategories={filteredCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showCategoryDropdown={showCategoryDropdown}
            setShowCategoryDropdown={setShowCategoryDropdown}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            categoryDropdownRef={categoryDropdownRef}
            levelOptions={levelOptions}
            groupTypeOptions={groupTypeOptions}
            languageOptions={languageOptions}
            filteredSchedules={filteredSchedules}
            showScheduleDropdown={showScheduleDropdown}
            setShowScheduleDropdown={setShowScheduleDropdown}
            scheduleSearch={scheduleSearch}
            setScheduleSearch={setScheduleSearch}
            scheduleDropdownRef={scheduleDropdownRef}
            handleScheduleSelect={(schedule) => {
              setFormData({ ...formData, schedule: schedule.label });
              setShowScheduleDropdown(false);
              setScheduleSearch('');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <EditGroupModal
            group={showEditModal}
            onClose={() => { setShowEditModal(null); resetForm(); }}
            onSubmit={handleEditGroup}
            processing={processing}
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            coverImagePreview={coverImagePreview}
            handleImageChange={handleImageChange}
            handleCoverImageChange={handleCoverImageChange}
            fileInputRef={fileInputRef}
            coverFileInputRef={coverFileInputRef}
            filteredCategories={filteredCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showCategoryDropdown={showCategoryDropdown}
            setShowCategoryDropdown={setShowCategoryDropdown}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            categoryDropdownRef={categoryDropdownRef}
            levelOptions={levelOptions}
            groupTypeOptions={groupTypeOptions}
            languageOptions={languageOptions}
            filteredSchedules={filteredSchedules}
            showScheduleDropdown={showScheduleDropdown}
            setShowScheduleDropdown={setShowScheduleDropdown}
            scheduleSearch={scheduleSearch}
            setScheduleSearch={setScheduleSearch}
            scheduleDropdownRef={scheduleDropdownRef}
            handleScheduleSelect={(schedule) => {
              setFormData({ ...formData, schedule: schedule.label });
              setShowScheduleDropdown(false);
              setScheduleSearch('');
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grp-card p-6 max-w-md w-full shadow-xl"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border ${confirmModal.type === 'danger' ? 'border-[var(--grp-danger)] bg-[var(--grp-danger-soft)]' : 'border-[var(--grp-primary)] bg-[var(--grp-primary-soft)]'}`}>
                  {confirmModal.type === 'danger'
                    ? <FaExclamationTriangle className="text-2xl text-[var(--grp-danger)]" />
                    : <FaInfoCircle className="text-2xl text-[var(--grp-primary)]" />}
                </div>
                <h3 className="text-xl font-bold text-[var(--grp-txt)] mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-sm text-[var(--grp-txt-soft)] mb-6">
                  {confirmModal.message}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmModal.cancel}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--grp-line)] text-[var(--grp-txt)] text-sm font-bold hover:bg-[var(--grp-hover)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmModal.action}
                    className={`flex-1 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all ${confirmModal.type === 'danger' ? 'bg-[var(--grp-danger)] hover:opacity-90' : 'bg-[var(--grp-primary)] hover:opacity-90'}`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── League Card Component ──────────────────────────────────────────────
const LeagueCard = ({ group, user, onDelete, onEdit, onViewDetails }) => {
  const isAdmin = group.is_admin || false;
  const catColor = getCategoryColor(group.subject);
  const [menuOpen, setMenuOpen] = useState(false);

  // Generate dummy agent avatars (in a real app, you'd fetch actual member avatars)
  const dummyAvatars = [
    'https://i.pravatar.cc/100?img=1',
    'https://i.pravatar.cc/100?img=5',
    'https://i.pravatar.cc/100?img=8',
    'https://i.pravatar.cc/100?img=12',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="grp-card overflow-hidden cursor-pointer group relative"
      onClick={onViewDetails}
    >
      {/* Cover Image */}
      <div className="relative h-44 bg-[var(--grp-card-2)] overflow-hidden">
        {group.cover_image_url ? (
          <img src={group.cover_image_url} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${catColor.fg}dd, ${catColor.fg}88)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Admin Badge */}
        {isAdmin && (
          <span className="absolute top-4 left-4 px-2.5 py-1 bg-[var(--grp-primary)] text-white font-bold text-[9px] uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-lg">
            <FaShieldAlt className="text-[8px]" /> Admin
          </span>
        )}

        {/* Author Info */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-[var(--grp-primary)] flex items-center justify-center text-white font-bold text-sm">
            {group.image_url ? (
              <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              group.name?.charAt(0).toUpperCase() || 'G'
            )}
          </div>
          <div>
            <p className="text-[10px] text-white/70 font-semibold">By:</p>
            <p className="text-xs font-bold text-white">
              {group.creator_name || 'Group Admin'}
            </p>
            <p className="text-[9px] text-[var(--grp-primary-2)] font-bold uppercase tracking-wider">
              Ambassador
            </p>
          </div>
        </div>

        {/* More Menu */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <FaEllipsisH className="text-xs" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-14 right-4 w-40 grp-card shadow-xl z-20 py-1"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onViewDetails(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--grp-txt)] hover:bg-[var(--grp-hover)] transition-colors"
              >
                View Details
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--grp-txt)] hover:bg-[var(--grp-hover)] transition-colors"
                  >
                    Edit League
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[var(--grp-danger)] hover:bg-[var(--grp-danger-soft)] transition-colors"
                  >
                    Delete League
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-[var(--grp-txt)] tracking-tight">
              {group.name}
            </h3>
            <FaFlag className="text-[var(--grp-txt-faint)] text-xs" />
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: catColor.bg, color: catColor.fg }}
          >
            {group.subject || 'General'}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex gap-3">
            <span className="text-[var(--grp-txt-faint)] font-semibold w-20 flex-shrink-0">Description:</span>
            <span className="text-[var(--grp-txt)] font-medium line-clamp-2">
              {group.description || 'No description provided'}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--grp-txt-faint)] font-semibold w-20 flex-shrink-0">Categories</span>
            <span className="text-[var(--grp-txt)] font-bold">
              {group.subject || 'All'}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--grp-txt-faint)] font-semibold w-20 flex-shrink-0">Started:</span>
            <span className="text-[var(--grp-primary)] font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--grp-primary)]" />
              {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-[var(--grp-txt-faint)] font-semibold w-20 flex-shrink-0">Goal:</span>
            <span className="text-[var(--grp-txt)] font-bold">
              {group.max_members} MEMBERS
            </span>
          </div>
        </div>

        {/* Members / Avatars */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--grp-line)]">
          <div className="flex -space-x-2">
            {dummyAvatars.slice(0, Math.min(4, group.member_count || 1)).map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt="Member"
                className="h-8 w-8 rounded-full border-2 border-[var(--grp-card)] object-cover"
              />
            ))}
            {(group.member_count || 0) > 4 && (
              <div className="h-8 w-8 rounded-full border-2 border-[var(--grp-card)] bg-[var(--grp-primary)] flex items-center justify-center text-[10px] font-bold text-white">
                +{(group.member_count || 0) - 4}
              </div>
            )}
            {(group.member_count || 0) === 0 && (
              <div className="h-8 w-8 rounded-full border-2 border-[var(--grp-card)] bg-[var(--grp-card-2)] flex items-center justify-center">
                <FaUsers className="text-[10px] text-[var(--grp-txt-faint)]" />
              </div>
            )}
          </div>
          <span className="text-xs text-[var(--grp-txt-soft)] font-medium">
            {group.member_count || 0} members
          </span>
        </div>
      </div>
    </motion.div>
  );
};
// ─── Create Group Wizard ────────────────────────────────────────────────
const CreateGroupWizard = ({
  onClose, onSubmit, processing,
  formData, setFormData,
  imagePreview, coverImagePreview, handleImageChange, handleCoverImageChange,
  fileInputRef, coverFileInputRef,
  filteredCategories, selectedCategory, setSelectedCategory,
  showCategoryDropdown, setShowCategoryDropdown, categorySearch, setCategorySearch,
  categoryDropdownRef, levelOptions, groupTypeOptions, languageOptions,
  filteredSchedules, showScheduleDropdown, setShowScheduleDropdown,
  scheduleSearch, setScheduleSearch, scheduleDropdownRef, handleScheduleSelect,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setFormData({ ...formData, subject: category.name });
    setShowCategoryDropdown(false);
    setCategorySearch('');
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return formData.subject.length > 0;
    if (step === 3) return formData.description.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step === totalSteps) {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="grp-card max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-[var(--grp-line)] relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-[var(--grp-hover)] transition-all"
          >
            <FaTimes className="text-[var(--grp-txt-soft)] text-sm" />
          </button>

          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[var(--grp-primary-soft)] mb-3">
            <FaUsers className="text-2xl text-[var(--grp-primary)]" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider text-[var(--grp-txt)]">
            Create My League
          </h2>
          <p className="text-xs text-[var(--grp-txt-soft)] mt-1">
            Set goals. Compete with friends or relatives.
          </p>

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? 'w-8 bg-[var(--grp-primary)]' : 'w-4 bg-[var(--grp-line)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: NAME */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    1
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  What would you name your league?
                </h3>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Create a league name"
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl grp-input text-base font-medium placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                />
              </motion.div>
            )}

            {/* STEP 2: CATEGORY */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 relative" // Added relative here
                ref={categoryDropdownRef}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    2
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  Choose a category
                </h3>
                <div
                  className="flex items-center justify-between w-full px-5 py-4 rounded-2xl grp-input cursor-pointer hover:border-[var(--grp-primary)] transition-all"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span className={`text-sm font-medium ${formData.subject ? 'text-[var(--grp-txt)]' : 'text-[var(--grp-txt-faint)]'}`}>
                    {formData.subject || 'Select a category...'}
                  </span>
                  {showCategoryDropdown ? (
                    <FaChevronUp className="text-[var(--grp-txt-soft)] text-sm" />
                  ) : (
                    <FaChevronDown className="text-[var(--grp-txt-soft)] text-sm" />
                  )}
                </div>

                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      // FIXED: Removed absolute positioning, now it's relative to the form flow
                      // and constrained to the parent width
                      className="w-full mt-2 grp-card shadow-xl z-50 max-h-64 overflow-hidden"
                    >
                      <div className="p-2 sticky top-0 grp-card">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grp-txt-faint)] text-xs" />
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 grp-input rounded-lg text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-48 p-2 space-y-1">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => {
                            const Icon = category.icon;
                            const isSelected = selectedCategory === category.name || formData.subject === category.name;
                            const catColor = getCategoryColor(category.name);
                            return (
                              <button
                                key={category.name}
                                type="button"
                                onClick={() => handleCategorySelect(category)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-[var(--grp-primary)] text-white'
                                    : 'text-[var(--grp-txt)] hover:bg-[var(--grp-hover)]'
                                }`}
                              >
                                <span
                                  className="flex items-center justify-center h-7 w-7 rounded-lg flex-shrink-0"
                                  style={{
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : catColor.bg,
                                    color: isSelected ? '#fff' : catColor.fg,
                                  }}
                                >
                                  <Icon className="text-[11px]" />
                                </span>
                                <span className="flex-1 text-left">{category.name}</span>
                                {isSelected && <FaCheck className="text-[10px]" />}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-center text-sm text-[var(--grp-txt-faint)] py-4">No categories found</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    3
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  Tell us more
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl grp-input text-sm resize-none placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                    placeholder="Describe what this group is about..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl grp-input text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]"
                    >
                      {levelOptions.map(level => (<option key={level} value={level}>{level}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                      min="2" max="100"
                      className="w-full px-4 py-3 rounded-xl grp-input text-sm focus:border-[var(--grp-primary)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Group Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {groupTypeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.group_type === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, group_type: option.value })}
                          className={`px-2 py-2.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                            isSelected
                              ? 'bg-[var(--grp-primary)] text-white border-[var(--grp-primary)]'
                              : 'grp-input text-[var(--grp-txt-soft)] hover:border-[var(--grp-primary)]'
                          }`}
                        >
                          <Icon className="text-sm" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Language
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {languageOptions.map((option) => {
                      const isSelected = formData.language === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, language: option.value })}
                          className={`px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 border ${
                            isSelected
                              ? 'bg-[var(--grp-primary)] text-white border-[var(--grp-primary)]'
                              : 'grp-input text-[var(--grp-txt-soft)] hover:border-[var(--grp-primary)]'
                          }`}
                        >
                          <span className="text-base leading-none">{option.flag}</span>
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div ref={scheduleDropdownRef} className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Best Time to Post
                  </label>
                  <div
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl grp-input cursor-pointer hover:border-[var(--grp-primary)] transition-all"
                    onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                  >
                    <span className={`text-sm font-medium ${formData.schedule ? 'text-[var(--grp-txt)]' : 'text-[var(--grp-txt-faint)]'}`}>
                      {formData.schedule || 'When does your group usually post?'}
                    </span>
                    {showScheduleDropdown ? (
                      <FaChevronUp className="text-[var(--grp-txt-soft)] text-sm" />
                    ) : (
                      <FaChevronDown className="text-[var(--grp-txt-soft)] text-sm" />
                    )}
                  </div>

                  <AnimatePresence>
                    {showScheduleDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        // FIXED: Constrained width for schedule dropdown too
                        className="absolute left-0 right-0 mt-2 grp-card shadow-xl z-50 max-h-64 overflow-hidden"
                      >
                        <div className="overflow-y-auto max-h-56 p-2 space-y-1">
                          {filteredSchedules.length > 0 ? (
                            filteredSchedules.map((schedule) => {
                              const Icon = schedule.icon;
                              const isSelected = formData.schedule === schedule.label;
                              return (
                                <button
                                  key={schedule.label}
                                  type="button"
                                  onClick={() => handleScheduleSelect(schedule)}
                                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    isSelected
                                      ? 'bg-[var(--grp-primary)] text-white'
                                      : 'text-[var(--grp-txt)] hover:bg-[var(--grp-hover)]'
                                  }`}
                                >
                                  <Icon className="text-sm" />
                                  <span>{schedule.label}</span>
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-center text-sm text-[var(--grp-txt-faint)] py-4">No options found</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Group Rules <span className="text-[var(--grp-txt-faint)] font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.rules || ''}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    rows="2"
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-xl grp-input text-sm resize-none placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                    placeholder="Be kind. No spam. Stay on topic. etc."
                  />
                  <p className="text-[10px] text-[var(--grp-txt-faint)] mt-1 text-right">
                    {(formData.rules || '').length}/300
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: IMAGES */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    4
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  Add visuals
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Cover Image
                  </label>
                  <div
                    className="relative h-40 rounded-xl overflow-hidden border-2 border-dashed border-[var(--grp-line-str)] hover:border-[var(--grp-primary)] transition-all cursor-pointer group bg-[var(--grp-card-2)]"
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    {coverImagePreview ? (
                      <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <FaCamera className="text-4xl text-[var(--grp-txt-faint)] group-hover:scale-110 transition-transform" />
                        <p className="text-xs text-[var(--grp-txt-soft)] mt-2">Click to upload cover image</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-bold flex items-center gap-2">
                        <FaUpload /> Change Cover
                      </span>
                    </div>
                    <input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Group Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-dashed border-[var(--grp-line-str)] hover:border-[var(--grp-primary)] transition-all cursor-pointer group bg-[var(--grp-card-2)] flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <FaCamera className="text-xl text-[var(--grp-txt-faint)] group-hover:scale-110 transition-transform" />
                          <p className="text-[8px] text-[var(--grp-txt-soft)] mt-1">Upload</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                    <p className="text-xs text-[var(--grp-txt-soft)]">
                      Upload a logo for your group (recommended: square image)
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--grp-line)]">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-[var(--grp-line)] text-[var(--grp-txt)] text-sm font-bold hover:bg-[var(--grp-hover)] transition-colors"
              >
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 px-4 py-3.5 bg-[var(--grp-primary)] text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[var(--grp-primary-glow)]"
              >
                Next
                <FaArrowRight className="text-xs" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-3.5 bg-[var(--grp-primary)] text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[var(--grp-primary-glow)]"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create My League
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
// ─── Edit Group Modal ──────────────────────────────────────────────────
const EditGroupModal = ({
  group, onClose, onSubmit, processing,
  formData, setFormData,
  imagePreview, coverImagePreview, handleImageChange, handleCoverImageChange,
  fileInputRef, coverFileInputRef,
  filteredCategories, selectedCategory, setSelectedCategory,
  showCategoryDropdown, setShowCategoryDropdown, categorySearch, setCategorySearch,
  categoryDropdownRef, levelOptions, groupTypeOptions, languageOptions,
  filteredSchedules, showScheduleDropdown, setShowScheduleDropdown,
  scheduleSearch, setScheduleSearch, scheduleDropdownRef, handleScheduleSelect,
}) => {
  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setFormData({ ...formData, subject: category.name });
    setShowCategoryDropdown(false);
    setCategorySearch('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="grp-card max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 grp-card px-6 py-4 flex items-center justify-between z-10 border-b border-[var(--grp-line)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--grp-primary)] flex items-center justify-center">
              <FaEdit className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--grp-txt)]">Edit Group</h2>
              <p className="text-xs text-[var(--grp-txt-soft)]">Update your group details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--grp-hover)] transition-all"
          >
            <FaTimes className="text-[var(--grp-txt-soft)] text-base" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="px-6 pb-6 space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaImage className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Cover Image
            </label>
            <div
              className="relative h-40 rounded-xl overflow-hidden border-2 border-dashed border-[var(--grp-line-str)] hover:border-[var(--grp-primary)] transition-all cursor-pointer group bg-[var(--grp-card-2)]"
              onClick={() => coverFileInputRef.current?.click()}
            >
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FaCamera className="text-4xl text-[var(--grp-txt-faint)] group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-[var(--grp-txt-soft)] mt-2">Click to upload cover image</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-bold flex items-center gap-2">
                  <FaUpload /> Change Cover
                </span>
              </div>
              <input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaInfoCircle className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl grp-input text-sm focus:border-[var(--grp-primary)] transition-colors placeholder-[var(--grp-txt-faint)]"
              placeholder="e.g., Gaming Squad, Book Club, Coffee Lovers"
            />
          </div>

          {/* Category */}
          <div ref={categoryDropdownRef} className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaHashtag className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Category / Interest <span className="text-red-500">*</span>
            </label>
            <div
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl grp-input cursor-pointer hover:border-[var(--grp-primary)] transition-all"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className={`text-sm ${formData.subject ? 'text-[var(--grp-txt)]' : 'text-[var(--grp-txt-faint)]'}`}>
                {formData.subject || 'Click to select a category...'}
              </span>
              {showCategoryDropdown ? (
                <FaChevronUp className="text-[var(--grp-txt-soft)] text-sm" />
              ) : (
                <FaChevronDown className="text-[var(--grp-txt-soft)] text-sm" />
              )}
            </div>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 grp-card shadow-xl z-50 max-h-64 overflow-hidden"
                >
                  <div className="p-2 sticky top-0 grp-card">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--grp-txt-faint)] text-xs" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 grp-input rounded-lg text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48 p-2 space-y-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.name || formData.subject === category.name;
                        const catColor = getCategoryColor(category.name);
                        return (
                          <button
                            key={category.name}
                            type="button"
                            onClick={() => handleCategorySelect(category)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              isSelected
                                ? 'bg-[var(--grp-primary)] text-white'
                                : 'text-[var(--grp-txt)] hover:bg-[var(--grp-hover)]'
                            }`}
                          >
                            <span
                              className="flex items-center justify-center h-7 w-7 rounded-lg flex-shrink-0"
                              style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : catColor.bg,
                                color: isSelected ? '#fff' : catColor.fg,
                              }}
                            >
                              <Icon className="text-[11px]" />
                            </span>
                            <span className="flex-1 text-left">{category.name}</span>
                            {isSelected && <FaCheck className="text-[10px]" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-sm text-[var(--grp-txt-faint)] py-4">No categories found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaComments className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 rounded-xl grp-input text-sm resize-none placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
              placeholder="Describe what this group is about..."
            />
          </div>

          {/* Level & Max */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                <FaGraduationCap className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 rounded-xl grp-input text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]"
              >
                {levelOptions.map(level => (<option key={level} value={level}>{level}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                <FaUsers className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
                Max Members
              </label>
              <input
                type="number"
                value={formData.max_members}
                onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                min="2" max="100"
                className="w-full px-4 py-3 rounded-xl grp-input text-sm focus:border-[var(--grp-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaShieldAlt className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Group Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {groupTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.group_type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, group_type: option.value })}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? 'bg-[var(--grp-primary)] text-white border-[var(--grp-primary)]'
                        : 'grp-input text-[var(--grp-txt-soft)] hover:border-[var(--grp-primary)]'
                    }`}
                  >
                    <Icon className="text-sm" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaGlobe className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map((option) => {
                const isSelected = formData.language === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, language: option.value })}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[var(--grp-primary)] text-white border-[var(--grp-primary)]'
                        : 'grp-input text-[var(--grp-txt-soft)] hover:border-[var(--grp-primary)]'
                    }`}
                  >
                    <span className="text-base leading-none">{option.flag}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Best Time to Post */}
          <div ref={scheduleDropdownRef} className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaClock className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Best Time to Post
            </label>
            <div
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl grp-input cursor-pointer hover:border-[var(--grp-primary)] transition-all"
              onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
            >
              <span className={`text-sm ${formData.schedule ? 'text-[var(--grp-txt)]' : 'text-[var(--grp-txt-faint)]'}`}>
                {formData.schedule || 'When does your group usually post?'}
              </span>
              {showScheduleDropdown ? (
                <FaChevronUp className="text-[var(--grp-txt-soft)] text-sm" />
              ) : (
                <FaChevronDown className="text-[var(--grp-txt-soft)] text-sm" />
              )}
            </div>

            <AnimatePresence>
              {showScheduleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 grp-card shadow-xl z-50 max-h-64 overflow-hidden"
                >
                  <div className="overflow-y-auto max-h-56 p-2 space-y-1">
                    {filteredSchedules.length > 0 ? (
                      filteredSchedules.map((schedule) => {
                        const Icon = schedule.icon;
                        const isSelected = formData.schedule === schedule.label;
                        return (
                          <button
                            key={schedule.label}
                            type="button"
                            onClick={() => handleScheduleSelect(schedule)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              isSelected
                                ? 'bg-[var(--grp-primary)] text-white'
                                : 'text-[var(--grp-txt)] hover:bg-[var(--grp-hover)]'
                            }`}
                          >
                            <Icon className="text-sm" />
                            <span>{schedule.label}</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-sm text-[var(--grp-txt-faint)] py-4">No options found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaBullhorn className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Group Rules
              <span className="text-[var(--grp-txt-faint)] font-normal normal-case tracking-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={formData.rules || ''}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              rows="2"
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl grp-input text-sm resize-none placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
              placeholder="Be kind. No spam. Stay on topic. etc."
            />
            <p className="text-[10px] text-[var(--grp-txt-faint)] mt-1 text-right">
              {(formData.rules || '').length}/300
            </p>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
              <FaImage className="inline mr-1.5 text-[var(--grp-primary)] text-xs" />
              Group Logo
            </label>
            <div className="flex items-center gap-4">
              <div
                className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-dashed border-[var(--grp-line-str)] hover:border-[var(--grp-primary)] transition-all cursor-pointer group bg-[var(--grp-card-2)] flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FaCamera className="text-xl text-[var(--grp-txt-faint)] group-hover:scale-110 transition-transform" />
                    <p className="text-[8px] text-[var(--grp-txt-soft)] mt-1">Upload</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <p className="text-xs text-[var(--grp-txt-soft)]">
                Upload a logo for your group (recommended: square image)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-[var(--grp-line)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-[var(--grp-line)] text-[var(--grp-txt)] text-sm font-bold hover:bg-[var(--grp-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-3 bg-[var(--grp-primary)] text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[var(--grp-primary-glow)]"
            >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  Updating...
                </>
              ) : (
                <>
                  Update Group
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudyGroups;