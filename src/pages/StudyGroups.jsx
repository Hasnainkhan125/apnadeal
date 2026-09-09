// pages/StudyGroups.jsx - Modern Version with Click-to-Show Categories & Clock Picker
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
  FaLightbulb,
  FaBookOpen,
  FaGraduationCap,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaLink,
  FaImage,
  FaUpload,
  FaCamera,
  FaFileAlt,
  FaFilter,
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
  FaTree,
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
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const StudyGroups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // ─── Form State ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    level: 'All Levels',
    max_members: 20,
    meeting_type: 'virtual',
    meeting_link: '',
    location: '',
    schedule: '',
    image_url: '',
    cover_image_url: '',
  });

  // ─── Modern Category Suggestions - All Icons ──────────────────────
  const categorySuggestions = [
    // Gaming & Entertainment
    { icon: FaGamepad, name: 'Gaming', color: 'from-purple-500 to-indigo-600' },
    { icon: FaFilm, name: 'Movies & Cinema', color: 'from-rose-500 to-pink-600' },
    { icon: FaMusic, name: 'Music Lovers', color: 'from-indigo-500 to-purple-600' },
    { icon: FaTheaterMasks, name: 'Comedy & Humor', color: 'from-yellow-500 to-amber-600' },
    { icon: FaPalette, name: 'Art & Creativity', color: 'from-pink-500 to-rose-600' },
    { icon: FaMagic, name: 'Magic & Illusion', color: 'from-violet-500 to-purple-600' },
    { icon: FaMicrophone, name: 'Podcast & Voice', color: 'from-amber-500 to-orange-600' },
    
    // Food & Lifestyle
    { icon: FaUtensils, name: 'Cooking & Recipes', color: 'from-orange-500 to-amber-600' },
    { icon: FaCoffee, name: 'Coffee & Chat', color: 'from-amber-500 to-orange-600' },
    { icon: FaHeart, name: 'Wellness & Health', color: 'from-rose-500 to-pink-600' },
    { icon: FaCompass, name: 'Travel & Adventure', color: 'from-cyan-500 to-blue-600' },
    { icon: FaLeaf, name: 'Nature & Outdoors', color: 'from-green-500 to-emerald-600' },
    { icon: FaDumbbell, name: 'Sports & Fitness', color: 'from-green-500 to-teal-600' },
    { icon: FaMountain, name: 'Hiking & Trekking', color: 'from-emerald-500 to-green-600' },
    
    // Tech & Learning
    { icon: FaCode, name: 'Coding & Tech', color: 'from-blue-500 to-cyan-600' },
    { icon: FaLaptop, name: 'Web Development', color: 'from-cyan-500 to-blue-600' },
    { icon: FaMobileAlt, name: 'App Development', color: 'from-purple-500 to-pink-600' },
    { icon: FaRobot, name: 'AI & Robotics', color: 'from-indigo-500 to-purple-600' },
    { icon: FaServer, name: 'Cloud & DevOps', color: 'from-blue-500 to-indigo-600' },
    { icon: FaRocket, name: 'Entrepreneurship', color: 'from-purple-500 to-indigo-600' },
    { icon: FaBookOpen, name: 'Book Club', color: 'from-amber-500 to-orange-600' },
    { icon: FaGraduationCap, name: 'Study & Learning', color: 'from-emerald-500 to-teal-600' },
    { icon: FaPuzzlePiece, name: 'Puzzles & Brain Games', color: 'from-cyan-500 to-blue-600' },
    { icon: FaBrain, name: 'Psychology & Mind', color: 'from-violet-500 to-purple-600' },
    { icon: FaUniversity, name: 'Academic Research', color: 'from-blue-500 to-indigo-600' },
    { icon: FaChalkboardTeacher, name: 'Teaching & Tutoring', color: 'from-amber-500 to-orange-600' },
    
    // Social & Fun
    { icon: FaSmile, name: 'Fun & Games', color: 'from-yellow-500 to-amber-600' },
    { icon: FaFire, name: 'Motivation & Growth', color: 'from-red-500 to-orange-600' },
    { icon: FaStar, name: 'Personal Development', color: 'from-amber-500 to-yellow-600' },
    { icon: FaGlobe, name: 'Culture & Diversity', color: 'from-teal-500 to-cyan-600' },
    { icon: FaBullhorn, name: 'Community Service', color: 'from-green-500 to-emerald-600' },
    { icon: FaCrown, name: 'Leadership & Clubs', color: 'from-amber-500 to-orange-600' },
    { icon: FaUserFriends, name: 'Social Networking', color: 'from-blue-500 to-cyan-600' },
    { icon: FaHandshake, name: 'Business & Networking', color: 'from-emerald-500 to-green-600' },
    
    // Hobbies & Interests
    { icon: FaCar, name: 'Automotive & Cars', color: 'from-stone-500 to-stone-600' },
    { icon: FaCamera, name: 'Photography', color: 'from-blue-500 to-indigo-600' },
    { icon: FaGem, name: 'Fashion & Style', color: 'from-pink-500 to-rose-600' },
    { icon: FaMeteor, name: 'Science & Space', color: 'from-indigo-500 to-purple-600' },
    { icon: FaHashtag, name: 'Social Media', color: 'from-blue-500 to-purple-600' },
    { icon: FaUsers, name: 'Networking', color: 'from-emerald-500 to-blue-600' },
    { icon: FaTrophy, name: 'Competitions & Events', color: 'from-amber-500 to-yellow-600' },
    { icon: FaMedal, name: 'Sports & Achievements', color: 'from-blue-500 to-cyan-600' },
    { icon: FaAward, name: 'Certifications & Skills', color: 'from-purple-500 to-indigo-600' },
    
    // Nature & Weather
    { icon: FaSun, name: 'Sunshine & Beach', color: 'from-yellow-500 to-orange-600' },
    { icon: FaMoon, name: 'Night Owls', color: 'from-indigo-500 to-purple-600' },
    { icon: FaCloudSun, name: 'Weather Enthusiasts', color: 'from-blue-500 to-cyan-600' },
    { icon: FaWater, name: 'Water Sports & Swimming', color: 'from-cyan-500 to-blue-600' },
    { icon: FaSnowflake, name: 'Winter Sports', color: 'from-blue-500 to-indigo-600' },
    { icon: FaWind, name: 'Wind Sports & Kites', color: 'from-teal-500 to-cyan-600' },
    
    // Professional
    { icon: FaIndustry, name: 'Business & Finance', color: 'from-stone-500 to-stone-600' },
    { icon: FaLandmark, name: 'Law & Politics', color: 'from-blue-500 to-indigo-600' },
    { icon: FaCloud, name: 'Tech & Innovation', color: 'from-cyan-500 to-blue-600' },
    { icon: FaTablet, name: 'Design & UX', color: 'from-purple-500 to-pink-600' },
    { icon: FaPaintBrush, name: 'Interior Design', color: 'from-rose-500 to-pink-600' },
    { icon: FaBolt, name: 'Energy & Environment', color: 'from-green-500 to-emerald-600' },
  ];

  // ─── Filtered Categories ────────────────────────────────────────────
  const filteredCategories = categorySuggestions.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const levelOptions = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const meetingOptions = [
    { value: 'virtual', label: 'Virtual', icon: FaVideo },
    { value: 'in-person', label: 'In-Person', icon: FaMapMarkerAlt },
    { value: 'hybrid', label: 'Hybrid', icon: FaUsers },
  ];

  // ─── Schedule Options - Clock Based ───────────────────────────────
  const scheduleOptions = [
    { label: 'Weekends', icon: FaCalendarAlt },
    { label: 'Weekdays', icon: FaCalendarAlt },
    { label: 'Evenings 6-8 PM', icon: FaClock },
    { label: 'Morning Sessions 9-11 AM', icon: FaClock },
    { label: 'Night Sessions 9-11 PM', icon: FaClock },
    { label: 'Daily 5-7 PM', icon: FaClock },
    { label: 'Flexible', icon: FaClock },
    { label: 'Bi-Weekly', icon: FaCalendarAlt },
    { label: 'Monthly Meetups', icon: FaCalendarAlt },
    { label: 'Afternoon 2-4 PM', icon: FaClock },
    { label: 'Late Night 11 PM - 1 AM', icon: FaClock },
    { label: 'Weekend Mornings', icon: FaCalendarAlt },
  ];

  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const scheduleDropdownRef = useRef(null);

  const filteredSchedules = scheduleOptions.filter(opt =>
    opt.label.toLowerCase().includes(scheduleSearch.toLowerCase())
  );

  // ─── Click outside handler ──────────────────────────────────────────
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

  // ─── Fetch Groups ─────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        setError('Failed to load groups');
        setLoading(false);
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('study_group_members')
        .select('group_id, role')
        .eq('user_id', user.id);

      if (!memberError) {
        setUserGroups(memberData.map(m => m.group_id));
      }

      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count, error: countError } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { count: postCount, error: postCountError } = await supabase
            .from('study_group_posts')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            member_count: countError ? 0 : count || 0,
            post_count: postCountError ? 0 : postCount || 0,
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

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ─── Upload Image ──────────────────────────────────────────────────
  const uploadImage = async (file, folder) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('study-group-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('study-group-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // ─── Create Group ────────────────────────────────────────────────────
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      let imageUrl = null;
      let coverImageUrl = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'group-logos');
      }

      if (coverImageFile) {
        coverImageUrl = await uploadImage(coverImageFile, 'group-covers');
      }

      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert({
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          level: formData.level,
          max_members: parseInt(formData.max_members),
          meeting_type: formData.meeting_type,
          meeting_link: formData.meeting_link || null,
          location: formData.location || null,
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
        alert('Failed to create group: ' + error.message);
        setProcessing(false);
        return;
      }

      await supabase
        .from('study_group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin',
        });

      alert('✅ Group created successfully!');
      setShowCreateModal(false);
      resetForm();
      navigate(`/study-groups/${newGroup.id}`);
      fetchGroups();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create group. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ─── Edit Group ──────────────────────────────────────────────────────
  const handleEditGroup = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      let imageUrl = formData.image_url;
      let coverImageUrl = formData.cover_image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'group-logos');
      }

      if (coverImageFile) {
        coverImageUrl = await uploadImage(coverImageFile, 'group-covers');
      }

      const { error } = await supabase
        .from('study_groups')
        .update({
          name: formData.name,
          subject: formData.subject,
          description: formData.description,
          level: formData.level,
          max_members: parseInt(formData.max_members),
          meeting_type: formData.meeting_type,
          meeting_link: formData.meeting_link || null,
          location: formData.location || null,
          schedule: formData.schedule,
          image_url: imageUrl,
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', showEditModal.id)
        .eq('created_by', user.id);

      if (error) {
        console.error('Error updating group:', error);
        alert('Failed to update group: ' + error.message);
        setProcessing(false);
        return;
      }

      alert('✅ Group updated successfully!');
      setShowEditModal(null);
      resetForm();
      fetchGroups();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update group. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ─── Reset Form ──────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      description: '',
      level: 'All Levels',
      max_members: 20,
      meeting_type: 'virtual',
      meeting_link: '',
      location: '',
      schedule: '',
      image_url: '',
      cover_image_url: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setSelectedCategory(null);
    setCategorySearch('');
    setScheduleSearch('');
  };

  // ─── Open Edit Modal ────────────────────────────────────────────────
  const openEditModal = (group) => {
    setFormData({
      name: group.name || '',
      subject: group.subject || '',
      description: group.description || '',
      level: group.level || 'All Levels',
      max_members: group.max_members || 20,
      meeting_type: group.meeting_type || 'virtual',
      meeting_link: group.meeting_link || '',
      location: group.location || '',
      schedule: group.schedule || '',
      image_url: group.image_url || '',
      cover_image_url: group.cover_image_url || '',
    });
    setImagePreview(group.image_url || null);
    setCoverImagePreview(group.cover_image_url || null);
    setSelectedCategory(null);
    setShowEditModal(group);
  };

  // ─── Delete Group ────────────────────────────────────────────────────
  const handleDeleteGroup = async (groupId) => {
    setConfirmModal({
      title: 'Delete Group',
      message: 'Are you sure you want to delete this group? This action cannot be undone.',
      action: async () => {
        try {
          const { error } = await supabase
            .from('study_groups')
            .delete()
            .eq('id', groupId)
            .eq('created_by', user.id);

          if (error) {
            alert('Failed to delete group: ' + error.message);
            return;
          }

          alert('Group deleted successfully.');
          setConfirmModal(null);
          fetchGroups();
        } catch (err) {
          console.error('Error:', err);
          alert('Failed to delete group. Please try again.');
        }
      },
      cancel: () => setConfirmModal(null),
      type: 'danger',
    });
  };

  // ─── Filtered Groups ─────────────────────────────────────────────────
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'my-groups') {
      return matchesSearch && userGroups.includes(group.id);
    }
    if (filter === 'available') {
      return matchesSearch && !userGroups.includes(group.id) && group.status === 'active';
    }
    return matchesSearch && group.status === 'active';
  });

  // ─── Get Meeting Type Icon ──────────────────────────────────────────
  const getMeetingIcon = (type) => {
    switch (type) {
      case 'virtual': return <FaVideo className="text-blue-500" />;
      case 'in-person': return <FaMapMarkerAlt className="text-amber-500" />;
      case 'hybrid': return <FaUsers className="text-purple-500" />;
      default: return <FaVideo className="text-blue-500" />;
    }
  };

  // ─── Handle Image Change ────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 pt-4 sm:pt-6 pb-12">
      <div className="max-w-8xl px-3 sm:px-4 md:px-6 lg:px-8">
        {/* ─── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Top Row - Title & Create Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Premium Logo / Icon */}
              <div className="hidden xs:flex h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <FaUsers className="text-white text-base sm:text-xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  Groups
              
                </h1>
                <p className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 hidden xs:block">
                  Connect with people who share your interests
                </p>
              </div>
            </div>

            {/* Create Group Button - Mobile Optimized */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-95"
            >
              <FaPlus className="text-[10px] sm:text-sm" />
              <span className="hidden xs:inline">Create Group</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>

          {/* Bottom Row - Filters & Search */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
            {/* Filter Buttons - Scrollable on Mobile */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl overflow-x-auto flex-nowrap scrollbar-hide min-w-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  filter === 'all'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('my-groups')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  filter === 'my-groups'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                My Groups
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  filter === 'available'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                Available
              </button>
            </div>

            {/* Search - Flexible Width */}
            <div className="relative flex-1 min-w-[120px] xs:min-w-[140px] sm:min-w-[180px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] sm:text-xs" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>

            {/* Results Count - Hidden on small screens */}
          </div>

          {/* Mobile Results Count */}
          <div className="flex sm:hidden items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500">
            <span className="font-medium text-amber-600 dark:text-amber-400">{filteredGroups.length}</span>
            <span>groups found</span>
          </div>
        </div>

        {/* ─── CONTENT ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-10 w-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
            <p className="text-stone-500 dark:text-stone-400">{error}</p>
            <button onClick={fetchGroups} className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-full">
              Try Again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaUsers className="text-5xl text-amber-300 dark:text-amber-600 mb-4" />
            <h3 className="text-xl font-semibold text-stone-700 dark:text-stone-300">
              {searchTerm ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 max-w-md">
              {searchTerm ? 'Try adjusting your search' : 'Be the first to create a group!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-full"
              >
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                user={user}
                onDelete={() => handleDeleteGroup(group.id)}
                onEdit={() => openEditModal(group)}
                onViewDetails={() => navigate(`/study-groups/${group.id}`)}
                getMeetingIcon={getMeetingIcon}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────── */}
      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title="Create Group"
            subtitle="Connect with people who share your interests"
            icon={<FaPlus className="text-white text-lg" />}
            onClose={() => { setShowCreateModal(false); resetForm(); }}
            onSubmit={handleCreateGroup}
            submitLabel="Create Group"
            submitIcon={<FaPlus className="text-sm" />}
            processing={processing}
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            coverImagePreview={coverImagePreview}
            handleImageChange={handleImageChange}
            handleCoverImageChange={handleCoverImageChange}
            fileInputRef={fileInputRef}
            coverFileInputRef={coverFileInputRef}
            categorySuggestions={categorySuggestions}
            filteredCategories={filteredCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showCategoryDropdown={showCategoryDropdown}
            setShowCategoryDropdown={setShowCategoryDropdown}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            categoryDropdownRef={categoryDropdownRef}
            levelOptions={levelOptions}
            meetingOptions={meetingOptions}
            scheduleOptions={scheduleOptions}
            filteredSchedules={filteredSchedules}
            showScheduleDropdown={showScheduleDropdown}
            setShowScheduleDropdown={setShowScheduleDropdown}
            scheduleSearch={scheduleSearch}
            setScheduleSearch={setScheduleSearch}
            scheduleDropdownRef={scheduleDropdownRef}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <Modal
            title="Edit Group"
            subtitle="Update your group details"
            icon={<FaEdit className="text-white text-lg" />}
            onClose={() => { setShowEditModal(null); resetForm(); }}
            onSubmit={handleEditGroup}
            submitLabel="Update Group"
            submitIcon={<FaEdit className="text-sm" />}
            processing={processing}
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            coverImagePreview={coverImagePreview}
            handleImageChange={handleImageChange}
            handleCoverImageChange={handleCoverImageChange}
            fileInputRef={fileInputRef}
            coverFileInputRef={coverFileInputRef}
            categorySuggestions={categorySuggestions}
            filteredCategories={filteredCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showCategoryDropdown={showCategoryDropdown}
            setShowCategoryDropdown={setShowCategoryDropdown}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            categoryDropdownRef={categoryDropdownRef}
            levelOptions={levelOptions}
            meetingOptions={meetingOptions}
            scheduleOptions={scheduleOptions}
            filteredSchedules={filteredSchedules}
            showScheduleDropdown={showScheduleDropdown}
            setShowScheduleDropdown={setShowScheduleDropdown}
            scheduleSearch={scheduleSearch}
            setScheduleSearch={setScheduleSearch}
            scheduleDropdownRef={scheduleDropdownRef}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-stone-900 p-6 rounded-2xl max-w-md w-full"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-100 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/30' : 'bg-amber-100 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800/30'}`}>
                  {confirmModal.type === 'danger' ? <FaExclamationTriangle className="text-2xl text-red-500" /> : <FaInfoCircle className="text-2xl text-amber-500" />}
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">{confirmModal.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">{confirmModal.message}</p>
                <div className="flex gap-3">
                  <button onClick={confirmModal.cancel} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmModal.action} className={`flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-all ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
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

// ─── Modal Component ──────────────────────────────────────────────────
const Modal = ({ 
  title, subtitle, icon, onClose, onSubmit, submitLabel, submitIcon, processing,
  formData, setFormData, imagePreview, coverImagePreview, handleImageChange, 
  handleCoverImageChange, fileInputRef, coverFileInputRef,
  categorySuggestions, filteredCategories, selectedCategory, setSelectedCategory,
  showCategoryDropdown, setShowCategoryDropdown, categorySearch, setCategorySearch,
  categoryDropdownRef, levelOptions, meetingOptions,
  scheduleOptions, filteredSchedules, showScheduleDropdown, setShowScheduleDropdown,
  scheduleSearch, setScheduleSearch, scheduleDropdownRef
}) => {
  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setFormData({...formData, subject: category.name});
    setShowCategoryDropdown(false);
    setCategorySearch('');
  };

  const handleScheduleSelect = (schedule) => {
    setFormData({...formData, schedule: schedule.label});
    setShowScheduleDropdown(false);
    setScheduleSearch('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-stone-200/50 dark:border-stone-800/50"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">{title}</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300"
          >
            <FaTimes className="text-stone-500 dark:text-stone-400 text-lg" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
              <FaImage className="inline mr-1.5 text-amber-500 text-xs" />
              Cover Image
            </label>
            <div
              className="relative h-40 rounded-2xl overflow-hidden border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-amber-400 transition-all cursor-pointer group bg-stone-50 dark:bg-stone-800/50"
              onClick={() => coverFileInputRef.current?.click()}
            >
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FaCamera className="text-4xl text-stone-400 dark:text-stone-500 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Click to upload cover image</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium flex items-center gap-2"><FaUpload /> Change Cover</span>
              </div>
              <input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              <FaInfoCircle className="inline mr-1.5 text-amber-500 text-xs" />
              Group Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
              placeholder="e.g., Gaming Squad, Book Club, Coffee Lovers"
            />
          </div>

          {/* Category - Click to Show Dropdown */}
          <div ref={categoryDropdownRef} className="relative">
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              <FaHashtag className="inline mr-1.5 text-amber-500 text-xs" />
              Category / Interest <span className="text-amber-500">*</span>
            </label>
            <div
              className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className={`text-sm ${formData.subject ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-500'}`}>
                {formData.subject || 'Click to select a category...'}
              </span>
              {showCategoryDropdown ? (
                <FaChevronUp className="text-stone-400 text-sm" />
              ) : (
                <FaChevronDown className="text-stone-400 text-sm" />
              )}
            </div>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl z-50 max-h-64 overflow-hidden"
                >
                  <div className="p-2 sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 outline-none transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48 p-2 space-y-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.name || formData.subject === category.name;
                        return (
                          <button
                            key={category.name}
                            type="button"
                            onClick={() => handleCategorySelect(category)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                              isSelected
                                ? `bg-gradient-to-r ${category.color} text-white`
                                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            <Icon className="text-sm" />
                            <span>{category.name}</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-4">No categories found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              <FaComments className="inline mr-1.5 text-amber-500 text-xs" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 resize-none"
              placeholder="Describe what this group is about, goals, and expectations..."
            />
          </div>

          {/* Level & Max Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                <FaGraduationCap className="inline mr-1.5 text-amber-500 text-xs" />
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white appearance-none cursor-pointer"
              >
                {levelOptions.map(level => (<option key={level} value={level}>{level}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                <FaUsers className="inline mr-1.5 text-amber-500 text-xs" />
                Max Members
              </label>
              <input
                type="number"
                value={formData.max_members}
                onChange={(e) => setFormData({...formData, max_members: e.target.value})}
                min="2" max="100"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white"
              />
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              <FaVideo className="inline mr-1.5 text-amber-500 text-xs" />
              Meeting Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {meetingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.meeting_type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({...formData, meeting_type: option.value})}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-stone-50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-2 border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-600'
                    }`}
                  >
                    <Icon className={`text-sm ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {formData.meeting_type !== 'in-person' && (
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                <FaVideo className="inline mr-1.5 text-amber-500 text-xs" />
                Meeting Link
              </label>
              <input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {formData.meeting_type !== 'virtual' && (
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                <FaMapMarkerAlt className="inline mr-1.5 text-amber-500 text-xs" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                placeholder="Cafe, Library, Park, etc."
              />
            </div>
          )}

          {/* Schedule - Clock Based Dropdown */}
          <div ref={scheduleDropdownRef} className="relative">
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              <FaClock className="inline mr-1.5 text-amber-500 text-xs" />
              Schedule
            </label>
            <div
              className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-2xl cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300"
              onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
            >
              <span className={`text-sm ${formData.schedule ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-500'}`}>
                {formData.schedule ? (
                  <span className="flex items-center gap-2">
                    <FaClock className="text-amber-500 text-xs" />
                    {formData.schedule}
                  </span>
                ) : (
                  'Click to select schedule...'
                )}
              </span>
              {showScheduleDropdown ? (
                <FaChevronUp className="text-stone-400 text-sm" />
              ) : (
                <FaChevronDown className="text-stone-400 text-sm" />
              )}
            </div>

            <AnimatePresence>
              {showScheduleDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl z-50 max-h-64 overflow-hidden"
                >
                  <div className="p-2 sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search schedule..."
                        value={scheduleSearch}
                        onChange={(e) => setScheduleSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 outline-none transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-48 p-2 space-y-1">
                    {filteredSchedules.length > 0 ? (
                      filteredSchedules.map((schedule) => {
                        const Icon = schedule.icon;
                        const isSelected = formData.schedule === schedule.label;
                        return (
                          <button
                            key={schedule.label}
                            type="button"
                            onClick={() => handleScheduleSelect(schedule)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            <Icon className="text-sm" />
                            <span>{schedule.label}</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-4">No schedules found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Group Logo */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
              <FaImage className="inline mr-1.5 text-amber-500 text-xs" />
              Group Logo
            </label>
            <div className="flex items-center gap-4">
              <div
                className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-amber-400 transition-all cursor-pointer group bg-stone-50 dark:bg-stone-800/50 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FaCamera className="text-xl text-stone-400 dark:text-stone-500 group-hover:scale-110 transition-transform" />
                    <p className="text-[8px] text-stone-400 dark:text-stone-500 mt-1">Upload</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500">Upload a logo for your group (recommended: square image)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30"
            >
              {processing ? <FaSpinner className="animate-spin text-lg" /> : <>{submitIcon} {submitLabel}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Group Card Component ─────────────────────────────────────────────
const GroupCard = ({ group, user, onDelete, onEdit, onViewDetails, getMeetingIcon }) => {
  const isAdmin = group.is_admin || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 transition-all duration-300 cursor-pointer group hover:border-amber-300 dark:hover:border-amber-700"
      onClick={onViewDetails}
    >
      {/* Cover Image */}
      <div className="relative h-24 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
        {group.cover_image_url ? (
          <img src={group.cover_image_url} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Logo */}
        <div className="absolute -bottom-6 left-3">
          <div className="h-12 w-12 rounded-xl border-4 border-white dark:border-stone-900 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-base font-bold overflow-hidden">
            {group.image_url ? (
              <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              group.name?.charAt(0).toUpperCase() || 'G'
            )}
          </div>
        </div>
        
        {/* Badges */}
        {isAdmin && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-medium rounded-full flex items-center gap-0.5">
            <FaShieldAlt className="text-[6px]" /> Admin
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 pt-7">
        <div className="flex items-start justify-between mb-0.5">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {group.name}
            </h3>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{group.subject}</p>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-start ml-1">
            {group.member_count || 0}/{group.max_members}
          </span>
        </div>

        <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 mb-1.5">
          {group.description || 'No description provided'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[8px] rounded-full">{group.level}</span>
          <span className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[8px] rounded-full flex items-center gap-0.5">
            {getMeetingIcon(group.meeting_type)} {group.meeting_type}
          </span>
          {group.schedule && (
            <span className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[8px] rounded-full flex items-center gap-0.5">
              <FaClock className="text-[6px]" /> {group.schedule}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-stone-400 hover:text-amber-500 transition-colors"
                  title="Edit"
                >
                  <FaEdit className="text-xs" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <FaTrash className="text-xs" />
                </button>
              </>
            )}
            
            {/* Post Count */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
              <FaFileAlt className="text-[10px]" />
              <span className="text-[10px] font-medium">{group.post_count || 0} posts</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
              <FaUsers className="text-[8px]" />
              {group.member_count || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyGroups;