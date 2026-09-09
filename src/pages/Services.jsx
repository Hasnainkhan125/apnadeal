// pages/Services.jsx - Modern Fiverr-style Cards with Contact Info
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaEye,
  FaUserPlus,
  FaUpload,
  FaCrown,
  FaRocket,
  FaComments,
  FaTimes,
  FaSearch,
  FaTrash,
  FaExclamationTriangle,
  FaImage,
  FaUser,
  FaCamera,
  FaCheck,
  FaSpinner,
  FaThLarge,
  FaList,
  FaHeart,
  FaRegHeart,
  FaCircle,
  FaTag,
  FaDollarSign,
  FaSlidersH,
  FaSortAmountDown,
  FaChevronRight,
  FaChevronLeft,
  FaFilter,
  FaPlus,
  FaPaintBrush,
  FaCode,
  FaVideo,
  FaPenFancy,
  FaChartLine,
  FaEllipsisH,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapPin,
  FaGlobe,
  FaLevelUpAlt,
  FaShieldAlt,
  FaVideo as FaVideoIcon,
  FaClock,
  FaAward,
  FaBriefcase,
  FaGraduationCap,
  FaStore,
  FaLeaf,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaTelegram,
  FaInstagram,
  FaTwitter,
  FaLink,
  FaUserCircle,
  FaAddressCard,
  FaInfoCircle,
  FaArrowRight,
  FaArrowLeft,
  FaCopy,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Services = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [togglingFavorite, setTogglingFavorite] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(null);

  const userIsPremium = isPremium();

  // ─── AUTHENTICATION CHECK ──────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate('/signin', { 
        state: { from: '/services', message: 'Please sign in to view services.' }
      });
    }
  }, [user, navigate]);

  // ─── Load Favorite Services from localStorage ────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('favorite_services');
    if (saved) {
      setFavoriteServices(JSON.parse(saved));
    }
  }, []);

  // ─── Save Favorite Services to localStorage ──────────────────────
  const saveFavorites = (favoriteIds) => {
    localStorage.setItem('favorite_services', JSON.stringify(favoriteIds));
    setFavoriteServices(favoriteIds);
  };

  // ─── Toggle Favorite ──────────────────────────────────────────────
  const toggleFavorite = async (serviceId) => {
    if (!user) {
      alert('Please sign in to add favorites');
      navigate('/signin');
      return;
    }

    if (togglingFavorite === serviceId) return;
    setTogglingFavorite(serviceId);

    try {
      const isCurrentlyFavorited = favoriteServices.includes(serviceId);

      if (isCurrentlyFavorited) {
        const { error: deleteError } = await supabase
          .from('interested_users')
          .delete()
          .eq('service_id', serviceId)
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.error('Error removing interest:', deleteError);
          alert('Failed to remove interest. Please try again.');
          setTogglingFavorite(null);
          return;
        }
        
        const newFavorites = favoriteServices.filter(id => id !== serviceId);
        saveFavorites(newFavorites);

      } else {
        const { error: insertError } = await supabase
          .from('interested_users')
          .insert({
            service_id: serviceId,
            user_id: user.id,
          });

        if (insertError) {
          console.error('Error adding interest:', insertError);
          if (insertError.code === '23505') {
            alert('You are already interested in this service.');
          } else {
            alert('Failed to add interest. Please try again.');
          }
          setTogglingFavorite(null);
          return;
        }
        
        const newFavorites = [...favoriteServices, serviceId];
        saveFavorites(newFavorites);
      }

      await fetchServices();

    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update. Please try again.');
    } finally {
      setTogglingFavorite(null);
    }
  };

  const isFavorited = (serviceId) => {
    return favoriteServices.includes(serviceId);
  };

  // ─── Fetch Services from Supabase ──────────────────────────────────
  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services');
        return;
      }

      setServices(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // ─── Subscribe to Real-time Changes ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    
    fetchServices();

    const subscription = supabase
      .channel('services-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // ─── Delete Service ──────────────────────────────────────────────────
  const deleteService = async (serviceId) => {
    try {
      await supabase
        .from('interested_users')
        .delete()
        .eq('service_id', serviceId);

      await supabase
        .from('replies')
        .delete()
        .eq('service_id', serviceId);

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
        return;
      }

      fetchServices();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete service');
    }
  };

  // ─── Handle Card Click ──────────────────────────────────────────────
  const handleCardClick = async (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  // ─── Filter Services ────────────────────────────────────────────────
  const filteredServices = services.filter(service => {
    if (filter === 'my-services') {
      return service.user_id === user?.id;
    }

    if (filter === 'favorites') {
      return favoriteServices.includes(service.id);
    }

    const matchesCategory = filter === 'all' || service.category === filter;
    const matchesSearch = service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.posted_by?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const priceNum = parseFloat(service.price?.replace(/[^0-9.]/g, '') || 0);
    const matchesPrice = (!priceRange.min || priceNum >= parseFloat(priceRange.min)) &&
                         (!priceRange.max || priceNum <= parseFloat(priceRange.max));
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  // ─── Sort Services ──────────────────────────────────────────────────
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'price-low':
        return parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0) - parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0);
      case 'price-high':
        return parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0) - parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0);
      case 'views':
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'all', label: 'All Services', icon: FaCircle, color: 'text-amber-500' },
    { id: 'my-services', label: 'My Services', icon: FaUser, color: 'text-emerald-500' },
    { id: 'favorites', label: 'Favorites', icon: FaHeart, color: 'text-rose-500' },
    { id: 'design', label: 'Design', icon: FaPaintBrush, color: 'text-purple-500' },
    { id: 'frontend', label: 'Frontend', icon: FaCode, color: 'text-blue-500' },
    { id: 'study', label: 'Study Help', icon: FaGraduationCap, color: 'text-amber-600' },
    { id: 'marketing', label: 'Marketing', icon: FaChartLine, color: 'text-orange-500' },
    { id: 'video', label: 'Video Editing', icon: FaVideoIcon, color: 'text-red-500' },
    { id: 'writing', label: 'Writing', icon: FaPenFancy, color: 'text-indigo-500' },
    { id: 'other', label: 'Other', icon: FaEllipsisH, color: 'text-stone-500' },
  ];

  const getCategoryCount = (catId) => {
    if (catId === 'my-services') {
      return services.filter(s => s.user_id === user?.id).length;
    }
    if (catId === 'all') {
      return services.length;
    }
    if (catId === 'favorites') {
      return services.filter(s => favoriteServices.includes(s.id)).length;
    }
    return services.filter(s => s.category === catId).length;
  };

  // ─── Close sidebar when clicking outside ──────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSidebarOpen]);

  // ─── Prevent body scroll when sidebar is open ─────────────────────
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // ─── If user is not authenticated ──────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="text-center">
          <div className="inline-block h-10 w-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="flex flex-col lg:flex-row">
        {/* ─── MAIN CONTENT ───────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden order-1 lg:order-1">
          {/* ─── Clean Header ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                Services
              </h1>
              <p className="text-sm text-stone-400 dark:text-stone-500">Discover and share skills with the community</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-400 dark:text-stone-500 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 whitespace-nowrap">
                {sortedServices.length} found
              </span>
              
              <div className="flex items-center gap-0.5 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-white'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <FaThLarge className="text-sm" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-amber-500 text-white'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <FaList className="text-sm" />
                </button>
              </div>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                  isSidebarOpen
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <FaFilter className="text-sm" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Premium Upsell Banner */}
          {!userIsPremium && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <FaCrown className="text-amber-500 text-2xl" />
                <div>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    <span className="font-medium text-stone-800 dark:text-stone-200">Premium feature</span>
                    — Upgrade to post and sell your services
                  </p>
                </div>
              </div>
              <Link to="/premium">
                <button className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30">
                  Upgrade Now
                </button>
              </Link>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Loading services...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-stone-500 dark:text-stone-400 text-sm">{error}</p>
              <button
                onClick={fetchServices}
                className="mt-4 px-6 py-2 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Services */}
          {!loading && !error && sortedServices.length === 0 && (
            <div className="text-center py-16 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900">
              <FaRocket className="text-4xl text-amber-300 dark:text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300">No services found</h3>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                {searchTerm ? 'Try adjusting your search or filters' : 'Be the first to post a service'}
              </p>
              {userIsPremium && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full transition-all duration-300"
                >
                  Post a Service
                </button>
              )}
            </div>
          )}

          {/* ─── Service Grid ───────────────────────────────────────────── */}
          {!loading && !error && sortedServices.length > 0 && (
            <motion.div 
              layout
              className={`grid gap-4 sm:gap-5 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence>
                {sortedServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <ServiceCard
                      service={service}
                      user={user}
                      userIsPremium={userIsPremium}
                      onDelete={() => setShowDeleteConfirm(service.id)}
                      viewMode={viewMode}
                      isFavorited={isFavorited(service.id)}
                      onToggleFavorite={toggleFavorite}
                      onCardClick={handleCardClick}
                      onContact={() => setShowContactModal(service)}
                      togglingFavorite={togglingFavorite}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* ─── SIDEBAR - RIGHT SIDE ─────────────────────────────────── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />

              <motion.aside
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed lg:sticky top-0 right-0 z-50 w-80 h-screen bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 p-4 overflow-y-auto shadow-2xl lg:shadow-xl order-2 lg:order-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <FaSlidersH className="text-amber-500 text-sm" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <FaTimes className="text-stone-500 text-lg" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowUpload(true);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <FaUpload className="text-sm group-hover:scale-110 transition-transform" />
                  Post a Service
                </button>

                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                  />
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FaTag className="text-amber-500 text-[10px]" />
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories.map(cat => {
                      const Icon = cat.icon;
                      const isActive = filter === cat.id;
                      const count = getCategoryCount(cat.id);
                      
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setFilter(cat.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <Icon className={`text-xs ${isActive ? 'text-white' : cat.color}`} />
                          <span className="flex-1 text-left">{cat.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FaDollarSign className="text-amber-500 text-[10px]" />
                    Price Range
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        className="w-full pl-6 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                      />
                    </div>
                    <span className="text-stone-400 text-sm">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        className="w-full pl-6 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FaSortAmountDown className="text-amber-500 text-[10px]" />
                    Sort By
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setFilter('all');
                    setPriceRange({ min: '', max: '' });
                    setSortBy('newest');
                    setSearchTerm('');
                    setIsSidebarOpen(false);
                  }}
                  className="w-full px-4 py-2.5 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm font-medium rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors duration-300"
                >
                  Clear All Filters
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={() => deleteService(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <ContactModal
            service={showContactModal}
            onClose={() => setShowContactModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            userIsPremium={userIsPremium}
            user={user}
            onSuccess={fetchServices}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Delete Confirmation Modal ──────────────────────────────────────
const DeleteConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-stone-900 p-6 rounded-2xl max-w-md w-full"
      >
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 flex items-center justify-center">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
            Delete Service
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-6">
            Are you sure you want to delete this service? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
// ─── Contact Modal ──────────────────────────────────────────────────
const ContactModal = ({ service, onClose }) => {
  const [copied, setCopied] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const contactInfo = {
    email: service.contact_email || 'service@example.com',
    phone: service.contact_phone || '+1 (555) 123-4567',
    whatsapp: service.whatsapp || '+1 (555) 123-4567',
    telegram: service.telegram || '@username',
    instagram: service.instagram || '@username',
    twitter: service.twitter || '@username',
    website: service.website || 'https://example.com',
  };

  const copyToClipboard = (text, field, label) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setToastMessage(`📋 ${label} copied!`);
    setShowToast(true);
    setTimeout(() => {
      setCopied(null);
      setShowToast(false);
    }, 2000);
  };

  const hasSocialMedia = contactInfo.instagram || contactInfo.twitter;
  const hasContactMethods = contactInfo.email || contactInfo.phone || contactInfo.whatsapp || contactInfo.telegram;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-stone-800 dark:bg-stone-900 text-white text-sm px-5 py-2.5 rounded-full shadow-2xl border border-stone-700/50 flex items-center gap-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200/50 dark:border-stone-800/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Premium */}
        <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 ">
                <FaUserCircle className="text-white text-xl" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                Contact Seller
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">Active</span>
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                {service.posted_by}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 hover:scale-105 hover:rotate-90"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Service Info Card - Enhanced */}
          <div className="relative bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 dark:from-amber-950/10 dark:via-stone-900/50 dark:to-orange-950/10 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white line-clamp-1">
                  {service.title}
                </h3>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-start">
                  <span className="text-[8px] font-medium mt-0.5">$</span>
                  {service.price?.replace(/[^0-9.]/g, '') || '0'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-amber-200/30 dark:border-amber-800/20">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded-full">
                  <FaTag className="text-[8px]" />
                  {service.category}
                </span>
                {service.location && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-medium rounded-full">
                    <FaMapPin className="text-[8px]" />
                    {service.location}
                  </span>
                )}
                {service.level && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-medium rounded-full">
                    <FaLevelUpAlt className="text-[8px]" />
                    {service.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact - One Click Actions */}
          {hasContactMethods && (
            <div>
              <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Quick Contact
                <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {contactInfo.whatsapp && contactInfo.whatsapp !== '+1 (555) 123-4567' && (
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 p-2.5 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200/50 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-950/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaWhatsapp className="text-green-500 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">WhatsApp</span>
                  </a>
                )}
                {contactInfo.telegram && contactInfo.telegram !== '@username' && (
                  <a
                    href={`https://t.me/${contactInfo.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaTelegram className="text-blue-500 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Telegram</span>
                  </a>
                )}
                {contactInfo.email && contactInfo.email !== 'service@example.com' && (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="group flex items-center justify-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaEnvelope className="text-amber-500 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Email</span>
                  </a>
                )}
                {contactInfo.phone && contactInfo.phone !== '+1 (555) 123-4567' && (
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="group flex items-center justify-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaPhone className="text-emerald-500 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Call</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Contact Details */}
          {hasContactMethods && (
            <div>
              <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Contact Details
                <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              </h4>
              <div className="space-y-2">
                {contactInfo.email && contactInfo.email !== 'service@example.com' && (
                  <div className="flex items-center gap-3 p-3 bg-stone-50/80 dark:bg-stone-800/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 group border border-transparent hover:border-amber-200/30 dark:hover:border-amber-800/20">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500">
                      <FaEnvelope className="text-[10px]" />
                    </div>
                    <span className="flex-1 text-xs text-stone-700 dark:text-stone-300 truncate font-mono">
                      {contactInfo.email}
                    </span>
                    <button
                      onClick={() => copyToClipboard(contactInfo.email, 'email', 'Email')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === 'email' ? (
                        <FaCheck className="text-emerald-500 text-[10px]" />
                      ) : (
                        <FaCopy className="text-[10px]" />
                      )}
                    </button>
                  </div>
                )}

                {contactInfo.phone && contactInfo.phone !== '+1 (555) 123-4567' && (
                  <div className="flex items-center gap-3 p-3 bg-stone-50/80 dark:bg-stone-800/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 group border border-transparent hover:border-green-200/30 dark:hover:border-green-800/20">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500">
                      <FaPhone className="text-[10px]" />
                    </div>
                    <span className="flex-1 text-xs text-stone-700 dark:text-stone-300 font-mono">
                      {contactInfo.phone}
                    </span>
                    <button
                      onClick={() => copyToClipboard(contactInfo.phone, 'phone', 'Phone')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === 'phone' ? (
                        <FaCheck className="text-emerald-500 text-[10px]" />
                      ) : (
                        <FaCopy className="text-[10px]" />
                      )}
                    </button>
                  </div>
                )}

                {contactInfo.whatsapp && contactInfo.whatsapp !== '+1 (555) 123-4567' && (
                  <div className="flex items-center gap-3 p-3 bg-green-50/80 dark:bg-green-950/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/30 transition-all duration-300 group border border-transparent hover:border-green-200/30 dark:hover:border-green-800/20">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500">
                      <FaWhatsapp className="text-[10px]" />
                    </div>
                    <span className="flex-1 text-xs text-stone-700 dark:text-stone-300 font-mono">
                      {contactInfo.whatsapp}
                    </span>
                    <a
                      href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#25D366] text-white text-[10px] font-medium rounded-lg hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300"
                    >
                      Chat
                    </a>
                  </div>
                )}

                {contactInfo.telegram && contactInfo.telegram !== '@username' && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50/80 dark:bg-blue-950/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-all duration-300 group border border-transparent hover:border-blue-200/30 dark:hover:border-blue-800/20">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-500">
                      <FaTelegram className="text-[10px]" />
                    </div>
                    <span className="flex-1 text-xs text-stone-700 dark:text-stone-300 font-mono">
                      {contactInfo.telegram}
                    </span>
                    <a
                      href={`https://t.me/${contactInfo.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#0088cc] text-white text-[10px] font-medium rounded-lg hover:shadow-lg hover:shadow-[#0088cc]/30 transition-all duration-300"
                    >
                      Chat
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {hasSocialMedia && (
            <div>
              <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Social Media
                <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              </h4>
              <div className="flex flex-wrap gap-2">
                {contactInfo.instagram && contactInfo.instagram !== '@username' && (
                  <a
                    href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-xl border border-pink-200/50 dark:border-pink-800/30 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaInstagram className="text-pink-500 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      {contactInfo.instagram}
                    </span>
                    <span className="text-[8px] text-pink-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </a>
                )}
                {contactInfo.twitter && contactInfo.twitter !== '@username' && (
                  <a
                    href={`https://twitter.com/${contactInfo.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaTwitter className="text-blue-400 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      {contactInfo.twitter}
                    </span>
                    <span className="text-[8px] text-blue-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Website */}
          {contactInfo.website && contactInfo.website !== 'https://example.com' && (
            <div>
              <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Website / Portfolio
                <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              </h4>
              <a
                href={contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 bg-stone-50/80 dark:bg-stone-800/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 border border-transparent hover:border-amber-200/30 dark:hover:border-amber-800/20"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500">
                  <FaLink className="text-[10px]" />
                </div>
                <span className="flex-1 text-xs text-amber-600 dark:text-amber-400 truncate font-medium group-hover:underline">
                  {contactInfo.website}
                </span>
                <span className="text-stone-400 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="flex gap-3 pt-4 border-t border-stone-200/50 dark:border-stone-800/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-400 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 hover:scale-[1.02]"
            >
              Close
            </button>
            <Link
              to={`/chat?service=${service.id}&provider=${service.user_id}`}
              className="flex-1"
            >
              <button className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-[1.02] group">
                <FaComments className="text-sm group-hover:scale-110 transition-transform" />
                <span>Open Chat</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Footer - Trust Badges */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1 text-[9px] text-stone-400 dark:text-stone-500">
              <FaShieldAlt className="text-[8px] text-emerald-500" />
              Secure contact
            </span>
            <span className="w-px h-3 bg-stone-200 dark:bg-stone-700" />
            <span className="inline-flex items-center gap-1 text-[9px] text-stone-400 dark:text-stone-500">
              <FaCheckCircle className="text-[8px] text-emerald-500" />
              Verified provider
            </span>
            <span className="w-px h-3 bg-stone-200 dark:bg-stone-700" />
            <span className="inline-flex items-center gap-1 text-[9px] text-stone-400 dark:text-stone-500">
              <FaClock className="text-[8px] text-amber-500" />
              Quick response
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Star Rating Component ──────────────────────────────────────────
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="text-[10px] text-amber-400" />
      ))}
      {hasHalfStar && <FaStarHalfAlt className="text-[10px] text-amber-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="text-[10px] text-stone-300 dark:text-stone-600" />
      ))}
      <span className="text-[10px] font-medium text-stone-600 dark:text-stone-400 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};
// ─── Service Card Component - Modern Fiverr Style with Contact Info ──
const ServiceCard = ({ 
  service, 
  user, 
  userIsPremium, 
  onDelete, 
  viewMode, 
  isFavorited, 
  onToggleFavorite, 
  onCardClick, 
  onContact,
  togglingFavorite 
}) => {
  const isOwner = user?.id === service.user_id;
  const priceValue = service.price?.replace(/[^0-9.]/g, '') || '0';
  const isToggling = togglingFavorite === service.id;
  const rating = service.rating || 4.5 + (Math.random() * 0.5);
  const reviews = service.reviews || Math.floor(Math.random() * 100) + 5;
  const location = service.location || 'Online';
  const level = service.level || 'Level 2';
  const isVerified = service.is_verified || Math.random() > 0.5;
  const hasVideoConsultation = service.video_consultation || Math.random() > 0.6;

  // Contact info for card display
  const hasEmail = service.contact_email && service.contact_email !== '';
  const hasPhone = service.contact_phone && service.contact_phone !== '';
  const hasWhatsapp = service.whatsapp && service.whatsapp !== '';

  const handleClick = () => {
    onCardClick(service.id);
  };

  // List view
  if (viewMode === 'list') {
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 group cursor-pointer" 
        onClick={handleClick}
      >
        <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          {service.image_url ? (
            <img src={service.image_url} alt={service.title} className="h-full w-full object-cover" />
          ) : (
            <FaImage className="text-stone-300 dark:text-stone-600 text-xl" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                {service.title}
              </h3>
              <Link 
                to={`/user-services/${service.user_id}`}
                className="text-xs text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                by {service.posted_by}
              </Link>
            </div>
            <span className="text-base font-semibold text-amber-600 dark:text-amber-400 flex items-start">
              <span className="text-xs font-medium mt-0.5">$</span>
              {priceValue}
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-0.5 line-clamp-1">
            {service.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(service.id); }}
            disabled={isToggling}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isFavorited
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/20'
                : 'text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
            } disabled:opacity-50`}
          >
            {isToggling ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : isFavorited ? (
              <FaHeart className="text-sm" />
            ) : (
              <FaRegHeart className="text-sm" />
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium rounded-full transition-all duration-300 flex items-center gap-1"
          >
            <FaUserCircle className="text-[10px]" />
            Contact
          </button>

          {isOwner && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-stone-400 hover:text-red-500 transition-colors duration-300"
            >
              <FaTrash className="text-sm" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid view - Modern Fiverr Style Card with Contact Info
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="group bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xl transition-all duration-300 cursor-pointer" 
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-44 bg-stone-50 dark:bg-stone-800/50 overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaImage className="text-stone-300 dark:text-stone-600 text-5xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(service.id); }}
          disabled={isToggling}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50"
        >
          {isToggling ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : isFavorited ? (
            <FaHeart className="text-rose-500 text-sm" />
          ) : (
            <FaRegHeart className="text-stone-500 text-sm hover:text-rose-500" />
          )}
        </button>

        {/* Delete Button - Owner Only */}
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-3 left-3 p-1.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-500 hover:text-red-500 rounded-lg transition-colors duration-300"
          >
            <FaTrash className="text-xs" />
          </button>
        )}
        
        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white font-bold rounded-lg flex items-center gap-0.5">
          <span className="text-xs font-medium">$</span>
          <span className="text-sm">{priceValue}</span>
        </div>
      </div>

      {/* Content - Fiverr Style */}
      <div className="p-4">
        {/* Seller Info */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              {service.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {service.posted_by}
              </span>
              {isVerified && (
                <FaCheckCircle className="text-emerald-500 text-[10px]" title="Verified" />
              )}
              <span className="text-[10px] text-stone-400 dark:text-stone-500">•</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">{level}</span>
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={rating} />
          <span className="text-[10px] text-stone-400 dark:text-stone-500">({reviews})</span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1.5 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2 text-[10px] text-stone-400 dark:text-stone-500">
          <FaMapPin className="text-[8px]" />
          <span>{location}</span>
        </div>

        {/* Contact Info - Email, Phone, WhatsApp */}
        {(hasEmail || hasPhone || hasWhatsapp) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {hasEmail && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-full text-[8px] text-stone-600 dark:text-stone-400 font-medium">
                <FaEnvelope className="text-[8px] text-amber-500" />
                {service.contact_email.length > 15 ? service.contact_email.substring(0, 15) + '...' : service.contact_email}
              </span>
            )}
      
            {hasWhatsapp && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 rounded-full text-[8px] text-green-600 dark:text-green-400 font-medium">
                <FaWhatsapp className="text-[8px]" />
                <a 
                  href={`https://wa.me/${service.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.whatsapp}
                </a>
              </span>
            )}
          </div>
        )}

        {/* Tags / Features */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          {hasVideoConsultation && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-medium rounded-full">
              <FaVideoIcon className="text-[6px]" />
              Video Consult
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[8px] font-medium rounded-full">
              <FaCheckCircle className="text-[6px]" />
              Verified
            </span>
          )}
          {service.is_premium && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[8px] font-medium rounded-full">
              <FaCrown className="text-[6px]" />
              Premium
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={(e) => { e.stopPropagation(); onContact(); }}
            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-1.5"
          >
            <FaUserCircle className="text-[9px]" />
            Contact
          </button>
          
        </div>
      </div>
    </motion.div>
  );
};

// ─── Upload Modal Component - Step by Step ──────────────────────────
const UploadModal = ({ onClose, userIsPremium, user, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [serviceData, setServiceData] = useState({
    title: '',
    description: '',
    category: 'design',
    price: '',
    location: 'Online',
    level: 'Level 1',
    video_consultation: false,
    contact_email: '',
    contact_phone: '',
    whatsapp: '',
    telegram: '',
    instagram: '',
    twitter: '',
    website: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!userIsPremium) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-stone-900 p-8 rounded-2xl max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center justify-center">
              <FaCrown className="text-amber-500 text-2xl" />
            </div>
            <h2 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
              Premium Required
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-6">
              Only premium members can post services. Upgrade now to start earning.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-300"
              >
                Close
              </button>
              <Link to="/premium" className="flex-1">
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl transition-all duration-300">
                  Upgrade
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `services/${fileName}`;

    const { error } = await supabase.storage
      .from('service-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('service-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price,
          image_url: imageUrl,
          posted_by: user?.name || 'Anonymous',
          user_id: user?.id,
          is_premium: true,
          location: serviceData.location,
          level: serviceData.level,
          video_consultation: serviceData.video_consultation,
          contact_email: serviceData.contact_email,
          contact_phone: serviceData.contact_phone,
          whatsapp: serviceData.whatsapp,
          telegram: serviceData.telegram,
          instagram: serviceData.instagram,
          twitter: serviceData.twitter,
          website: serviceData.website,
          rating: 0,
          reviews: 0,
          is_verified: false,
          views: 0,
          interested: 0,
          replies: 0,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error posting service:', error);
        alert('Failed to post service. Please try again.');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to post service. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const totalSteps = 4;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200/50 dark:border-stone-800/50"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
              <FaRocket className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Create a Service
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 hover:scale-105"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                  step >= s ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-stone-200 dark:bg-stone-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className={`text-[8px] font-medium transition-colors duration-300 ${step >= 1 ? 'text-amber-500' : 'text-stone-400'}`}>Service</span>
            <span className={`text-[8px] font-medium transition-colors duration-300 ${step >= 2 ? 'text-amber-500' : 'text-stone-400'}`}>Category</span>
            <span className={`text-[8px] font-medium transition-colors duration-300 ${step >= 3 ? 'text-amber-500' : 'text-stone-400'}`}>Contact</span>
            <span className={`text-[8px] font-medium transition-colors duration-300 ${step >= 4 ? 'text-amber-500' : 'text-stone-400'}`}>Media</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Service Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Service Title <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Professional Logo Design"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                    value={serviceData.title}
                    onChange={(e) => setServiceData({...serviceData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Description <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe your service in detail..."
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm resize-none"
                    rows="4"
                    value={serviceData.description}
                    onChange={(e) => setServiceData({...serviceData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!serviceData.title.trim() || !serviceData.description.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Next <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Category & Price */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Category <span className="text-amber-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm appearance-none cursor-pointer"
                      value={serviceData.category}
                      onChange={(e) => setServiceData({...serviceData, category: e.target.value})}
                    >
                      <option value="design">Design</option>
                      <option value="frontend">Frontend</option>
                      <option value="study">Study Help</option>
                      <option value="marketing">Marketing</option>
                      <option value="video">Video Editing</option>
                      <option value="writing">Writing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Price ($) <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-sm">$</span>
                      <input
                        type="text"
                        placeholder="50"
                        className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                        value={serviceData.price}
                        onChange={(e) => setServiceData({...serviceData, price: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      <FaMapPin className="inline mr-1.5 text-amber-500 text-xs" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Online, New York, etc."
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                      value={serviceData.location}
                      onChange={(e) => setServiceData({...serviceData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      <FaLevelUpAlt className="inline mr-1.5 text-amber-500 text-xs" />
                      Level
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm appearance-none cursor-pointer"
                      value={serviceData.level}
                      onChange={(e) => setServiceData({...serviceData, level: e.target.value})}
                    >
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Top Rated">Top Rated</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceData.video_consultation}
                      onChange={(e) => setServiceData({...serviceData, video_consultation: e.target.checked})}
                      className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <FaVideoIcon className="text-amber-500 text-sm" />
                      Offers Video Consultation
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaArrowLeft className="text-xs" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!serviceData.price.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Next <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-start gap-2">
                  <FaInfoCircle className="text-amber-500 text-sm mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Add your contact information so buyers can reach you. All fields are optional.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    <FaEnvelope className="inline mr-1.5 text-amber-500 text-xs" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                    value={serviceData.contact_email}
                    onChange={(e) => setServiceData({...serviceData, contact_email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    <FaPhone className="inline mr-1.5 text-amber-500 text-xs" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                    value={serviceData.contact_phone}
                    onChange={(e) => setServiceData({...serviceData, contact_phone: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      <FaWhatsapp className="inline mr-1.5 text-green-500 text-xs" />
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                      value={serviceData.whatsapp}
                      onChange={(e) => setServiceData({...serviceData, whatsapp: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      <FaTelegram className="inline mr-1.5 text-blue-500 text-xs" />
                      Telegram
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                      value={serviceData.telegram}
                      onChange={(e) => setServiceData({...serviceData, telegram: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      <FaInstagram className="inline mr-1.5 text-pink-500 text-xs" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                      value={serviceData.instagram}
                      onChange={(e) => setServiceData({...serviceData, instagram: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      <FaTwitter className="inline mr-1.5 text-blue-400 text-xs" />
                      Twitter/X
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                      value={serviceData.twitter}
                      onChange={(e) => setServiceData({...serviceData, twitter: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    <FaLink className="inline mr-1.5 text-amber-500 text-xs" />
                    Website / Portfolio
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-portfolio.com"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm"
                    value={serviceData.website}
                    onChange={(e) => setServiceData({...serviceData, website: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaArrowLeft className="text-xs" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Next <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Media Upload */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    <FaImage className="inline mr-1.5 text-amber-500 text-xs" />
                    Service Image <span className="text-stone-400 font-light">(recommended)</span>
                  </label>
                  <div
                    className="relative h-48 rounded-xl overflow-hidden border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-amber-400 transition-all cursor-pointer group bg-stone-50 dark:bg-stone-800/50"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <FaCamera className="text-5xl text-stone-400 dark:text-stone-500 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-stone-400 dark:text-stone-500 mt-3">Click to upload an image</p>
                        <p className="text-[10px] text-stone-300 dark:text-stone-600">PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <FaUpload className="text-xs" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                      </span>
                    </div>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-emerald-500 flex items-center gap-1">
                        <FaCheck className="text-[10px]" /> Image uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                    <FaAddressCard className="text-amber-500" />
                    Summary
                  </h4>
                  <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                    <p><span className="font-medium">Title:</span> {serviceData.title || 'Not set'}</p>
                    <p><span className="font-medium">Category:</span> {serviceData.category}</p>
                    <p><span className="font-medium">Price:</span> ${serviceData.price || '0'}</p>
                    <p><span className="font-medium">Location:</span> {serviceData.location}</p>
                    <p><span className="font-medium">Level:</span> {serviceData.level}</p>
                    {serviceData.contact_email && <p><span className="font-medium">Email:</span> {serviceData.contact_email}</p>}
                    {serviceData.contact_phone && <p><span className="font-medium">Phone:</span> {serviceData.contact_phone}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-3 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaArrowLeft className="text-xs" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <FaRocket className="text-sm" />
                        <span>Create Service</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Services;