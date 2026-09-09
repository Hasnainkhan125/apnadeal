// pages/UserServices.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaEye,
  FaMousePointer,
  FaUserPlus,
  FaReply,
  FaRocket,
  FaComments,
  FaBrain,
  FaBook,
  FaStar,
  FaImage,
  FaArrowLeft,
  FaCrown,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaBriefcase,
  FaGraduationCap,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaThLarge,
  FaList,
} from 'react-icons/fa';

const UserServices = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isFollowing, setIsFollowing] = useState(false);

  // ─── Fetch User Profile ─────────────────────────────────────────────
  const fetchUserProfile = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return null;
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError);
      }

      return {
        ...userData,
        ...(settingsData || {}),
        full_name: settingsData?.full_name || userData?.name || 'User',
        bio: settingsData?.bio || 'No bio yet',
        location: settingsData?.location || 'Not specified',
        website: settingsData?.website || null,
        phone: settingsData?.phone || null,
      };
    } catch (err) {
      console.error('Error:', err);
      return null;
    }
  };

  // ─── Fetch User's Services ──────────────────────────────────────────
  const fetchUserServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await fetchUserProfile();
      setUserProfile(profile);

      if (!profile) {
        setError('User not found');
        setLoading(false);
        return;
      }

      // ✅ Fetch ONLY services from this specific user
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', userId)  // ← Only this user's services
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user services:', error);
        setError('Failed to load services');
        return;
      }

      console.log(`📊 Found ${data?.length || 0} services for user ${userId}`);
      setServices(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserServices();
  }, [userId]);

  const isOwnProfile = user?.id === userId;

  // ─── Navigate to Service Detail ─────────────────────────────────────
  const handleViewService = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  // Extract numeric value from price
  const getPriceValue = (price) => {
    return price?.replace(/[^0-9.]/g, '') || '0';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-6 text-sm font-light"
        >
          <FaArrowLeft className="text-xs" />
          Back to Services
        </Link>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-4 font-light">Loading profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-stone-500 dark:text-stone-400 text-sm">{error}</p>
            <button
              onClick={fetchUserServices}
              className="mt-4 px-6 py-2 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ─── User Profile Header ────────────────────────────────────── */}
        {!loading && !error && userProfile && (
          <div className="mb-10">
            {/* Cover / Banner */}
            <div className="relative h-20 sm:h-20 md:h20 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            </div>

            {/* Profile Info - Overlapping */}
            <div className="relative px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-light overflow-hidden">
                    {userProfile.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={userProfile.full_name} className="h-full w-full object-cover" />
                    ) : (
                      userProfile.full_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  {userProfile.is_premium && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-1 rounded-full border-2 border-white dark:border-stone-950">
                      <FaCrown className="text-[10px] sm:text-xs" />
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl font-light text-stone-900 dark:text-white tracking-tight">
                      {userProfile.full_name}
                    </h1>
                    {userProfile.is_premium && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-3 py-0.5 rounded-full">
                        Premium
                      </span>
                    )}
                    {isOwnProfile && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-3 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-400 dark:text-stone-500 font-light mt-0.5">
                    {userProfile.bio || 'Student'}
                  </p>
                </div>

              
              </div>

              {/* Details Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                {userProfile.email && (
                  <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-light">
                    <FaEnvelope className="text-[10px]" />
                    {userProfile.email}
                  </span>
                )}
                {userProfile.location && (
                  <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-light">
                    <FaMapMarkerAlt className="text-[10px]" />
                    {userProfile.location}
                  </span>
                )}
                {userProfile.website && (
                  <a 
                    href={userProfile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-light"
                  >
                    <FaGlobe className="text-[10px]" />
                    {userProfile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {userProfile.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-light">
                    <FaBriefcase className="text-[10px]" />
                    {userProfile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-light">
                  <FaCalendarAlt className="text-[10px]" />
                  Joined {new Date(userProfile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Services Section ────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-light text-stone-900 dark:text-white tracking-tight">
                  Services
                  <span className="text-sm font-light text-stone-400 dark:text-stone-500 ml-2">
                    ({services.length})  {/* ✅ Only this user's services count */}
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
                >
                  <FaThLarge className="text-sm" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    viewMode === 'list'
                      ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                  }`}
                >
                  <FaList className="text-sm" />
                </button>
              </div>
            </div>

            {/* No Services */}
            {services.length === 0 && (
              <div className="text-center py-16 border-t border-stone-100 dark:border-stone-800">
                <FaRocket className="text-3xl text-amber-300 dark:text-amber-600 mx-auto mb-3" />
                <h3 className="text-lg font-light text-stone-600 dark:text-stone-400">No services posted yet</h3>
                <p className="text-sm text-stone-400 dark:text-stone-500 font-light mt-1">
                  {isOwnProfile ? 'You haven\'t posted any services yet.' : `${userProfile?.full_name || 'This user'} hasn't posted any services yet.`}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => window.location.href = '/services'}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-full hover:shadow-lg transition-all duration-300"
                  >
                    Post a Service
                  </button>
                )}
              </div>
            )}

            {/* Service Grid - Only this user's services */}
            {services.length > 0 && (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {services.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    isOwnProfile={isOwnProfile}
                    viewMode={viewMode}
                    onView={handleViewService}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Service Card Component ──────────────────────────────────────────
const ServiceCard = ({ service, isOwnProfile, viewMode, onView }) => {
  const [isInterested, setIsInterested] = useState(false);
  const priceValue = service.price?.replace(/[^0-9.]/g, '') || '0';

  const handleCardClick = () => {
    onView(service.id);
  };

  // List view
  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors duration-300 group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          {service.image_url ? (
            <img src={service.image_url} alt={service.title} className="h-full w-full object-cover" />
          ) : (
            <FaImage className="text-stone-300 dark:text-stone-600 text-xl" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-light">
                {new Date(service.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="text-lg font-light text-amber-600 dark:text-amber-400 flex items-start">
              <span className="text-sm font-medium mt-0.5">$</span>
              {priceValue}
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-0.5 line-clamp-1">
            {service.description}
          </p>
        </div>
        <div className="flex items-center gap-3 text-stone-400 dark:text-stone-500">
          <span className="flex items-center gap-1 text-[10px]">
            <FaEye /> {service.views || 0}
          </span>
          <span className="flex items-center gap-1 text-[10px]">
            <FaUserPlus /> {service.interested || 0}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full hover:shadow-lg transition-all duration-300"
        >
          View
        </button>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-stone-50 dark:bg-stone-800/50 overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaImage className="text-stone-300 dark:text-stone-600 text-4xl" />
          </div>
        )}
        {service.is_premium && (
          <span className="absolute top-3 right-3 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium tracking-wider rounded-full">
            Premium
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <h3 className="text-base font-medium text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
              {service.title}
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-light">
              {new Date(service.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className="text-xl font-light text-amber-600 dark:text-amber-400 flex items-start whitespace-nowrap">
            <span className="text-sm font-medium mt-0.5">$</span>
            {priceValue}
          </span>
        </div>

        <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-2 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
       
         <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
                    <FaCalendarAlt className="text-sm" />
                    <span className="text-sm">{new Date(service.created_at).toLocaleDateString()}</span>
                  </div>
          <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500">
            <FaReply className="text-[10px]" />
            <span className="text-[10px]">{service.replies || 0}</span>
          </div>
        </div>

  
      </div>
    </div>
  );
};

export default UserServices;