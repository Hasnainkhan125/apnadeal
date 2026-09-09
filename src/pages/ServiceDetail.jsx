// pages/ServiceDetail.jsx - Complete updated with full contact info

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaArrowLeft,
  FaEye,
  FaUserPlus,
  FaReply,
  FaUser,
  FaCrown,
  FaImage,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaTag,
  FaShieldAlt,
  FaClock,
  FaSave,
  FaHeart,
  FaRegHeart,
  FaComments,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaShareAlt,
  FaPaperPlane,
  FaSpinner,
  FaCheck,
  FaArrowRight,
  FaTelegram,
  FaInstagram,
  FaTwitter,
  FaLink,
  FaMapPin,
  FaLevelUpAlt,
  FaVideo as FaVideoIcon,
  FaCheckCircle,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaUserCircle,
  FaAddressCard,
  FaInfoCircle,
  FaCopy,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [favoriteServices, setFavoriteServices] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [providerContact, setProviderContact] = useState({ 
    phone: '', 
    email: '',
    whatsapp: '',
    telegram: '',
    instagram: '',
    twitter: '',
    website: '',
  });
  const [viewsCount, setViewsCount] = useState(0);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [repliesCount, setRepliesCount] = useState(0);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showDeleteReplyConfirm, setShowDeleteReplyConfirm] = useState(null);
  const [isTogglingInterest, setIsTogglingInterest] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const userIsPremium = isPremium();

  // ─── Edit Form State ──────────────────────────────────────────────────
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    image_url: '',
  });

  // ─── Load Favorite Services from localStorage ────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('favorite_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFavoriteServices(parsed);
        if (serviceId && parsed.includes(serviceId)) {
          setIsInterested(true);
        }
      } catch (e) {
        console.error('Error parsing favorites:', e);
        setFavoriteServices([]);
      }
    }
  }, [serviceId]);

  // ─── Save Favorite Services to localStorage ──────────────────────
  const saveFavorites = (favoriteIds) => {
    localStorage.setItem('favorite_services', JSON.stringify(favoriteIds));
    setFavoriteServices(favoriteIds);
  };

  // ─── Fetch Replies ──────────────────────────────────────────────────
  const fetchReplies = async () => {
    if (!serviceId) return;
    
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('replies')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return;
      }

      setReplies(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // ─── Check if user is interested (from database) ──────────────────
  const checkUserInterest = async () => {
    if (!user || !serviceId) return;

    try {
      const { data, error } = await supabase
        .from('interested_users')
        .select('id')
        .eq('service_id', serviceId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking interest:', error);
        return;
      }

      const isInterestedNow = !!data;
      setIsInterested(isInterestedNow);

      if (isInterestedNow) {
        const newFavorites = [...favoriteServices, serviceId];
        const unique = [...new Set(newFavorites)];
        saveFavorites(unique);
      } else {
        const newFavorites = favoriteServices.filter(id => id !== serviceId);
        saveFavorites(newFavorites);
      }

    } catch (err) {
      console.error('Error checking interest:', err);
    }
  };

  // ─── Fetch Service Details ──────────────────────────────────────────
  const fetchServiceDetail = async () => {
    if (!serviceId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) {
        console.error('Error fetching service:', serviceError);
        setError('Service not found');
        setLoading(false);
        return;
      }

      console.log('📊 Service data from DB:', {
        id: serviceData.id,
        title: serviceData.title,
        views: serviceData.views,
        interested: serviceData.interested,
        replies: serviceData.replies
      });

      setViewsCount(serviceData.views || 0);
      setInterestedCount(serviceData.interested || 0);
      setRepliesCount(serviceData.replies || 0);

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, is_premium, avatar_url')
        .eq('id', serviceData.user_id)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
      }

      // Fetch user_settings for phone number
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('phone')
        .eq('user_id', serviceData.user_id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError);
      }

      const serviceWithUser = {
        ...serviceData,
        user: userData || { name: serviceData.posted_by },
      };

      // Set all contact info from service data
      setProviderContact({
        phone: settingsData?.phone || serviceData.contact_phone || '',
        email: userData?.email || serviceData.contact_email || '',
        whatsapp: serviceData.whatsapp || '',
        telegram: serviceData.telegram || '',
        instagram: serviceData.instagram || '',
        twitter: serviceData.twitter || '',
        website: serviceData.website || '',
      });

      setService(serviceWithUser);

      setEditData({
        title: serviceData.title || '',
        description: serviceData.description || '',
        category: serviceData.category || '',
        price: serviceData.price || '',
        image_url: serviceData.image_url || '',
      });

      // ─── VIEWS: Increment views ─────────────────────────────────────
      const sessionKey = `viewed_${serviceId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        const newViews = (serviceData.views || 0) + 1;
        
        const { error: updateError } = await supabase
          .from('services')
          .update({ views: newViews })
          .eq('id', serviceId);

        if (!updateError) {
          setViewsCount(newViews);
          setService(prev => ({ ...prev, views: newViews }));
          sessionStorage.setItem(sessionKey, 'true');
          console.log('✅ Views updated to:', newViews);
        } else {
          console.error('Error updating views:', updateError);
        }
      }

      await fetchReplies();
      await checkUserInterest();

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId]);

  // ─── Handle Edit Service ────────────────────────────────────────────
  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      title: service?.title || '',
      description: service?.description || '',
      category: service?.category || '',
      price: service?.price || '',
      image_url: service?.image_url || '',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: service?.title || '',
      description: service?.description || '',
      category: service?.category || '',
      price: service?.price || '',
      image_url: service?.image_url || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!serviceId) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .update({
          title: editData.title,
          description: editData.description,
          category: editData.category,
          price: editData.price,
          image_url: editData.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (error) {
        console.error('Error updating service:', error);
        alert('Failed to update service');
        return;
      }

      setIsEditing(false);
      await fetchServiceDetail();
      alert('Service updated successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update service');
    }
  };

  // ─── Handle Delete Service ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!serviceId) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
        return;
      }

      sessionStorage.removeItem(`viewed_${serviceId}`);
      setShowDeleteConfirm(false);
      navigate('/services');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete service');
    }
  };

  // ─── Handle Reply Submit ────────────────────────────────────────────
  const handleReplySubmit = async () => {
    if (!replyText.trim() || !serviceId) return;

    if (!user) {
      alert('Please sign in to reply');
      navigate('/signin');
      return;
    }

    setIsSubmittingReply(true);

    try {
      const { data: replyData, error: replyError } = await supabase
        .from('replies')
        .insert({
          service_id: serviceId,
          user_id: user.id,
          user_name: user?.name || user?.email?.split('@')[0] || 'Anonymous',
          content: replyText.trim(),
          created_at: new Date().toISOString(),
        })
        .select();

      if (replyError) {
        console.error('Error saving reply:', replyError);
        alert('Failed to send reply. Please try again.');
        return;
      }

      const { data: updatedService, error: fetchError } = await supabase
        .from('services')
        .select('replies')
        .eq('id', serviceId)
        .single();

      if (!fetchError && updatedService) {
        setRepliesCount(updatedService.replies || 0);
        setService(prev => ({ ...prev, replies: updatedService.replies || 0 }));
      } else {
        const newRepliesCount = (repliesCount || 0) + 1;
        setRepliesCount(newRepliesCount);
        setService(prev => ({ ...prev, replies: newRepliesCount }));
      }
      
      if (replyData && replyData.length > 0) {
        setReplies(prev => [...prev, replyData[0]]);
      }

      setReplyText('');
      setShowReply(false);
      alert('✅ Reply sent successfully!');
      
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // ─── Handle Edit Reply ──────────────────────────────────────────────
  const startEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditingReplyText(reply.content);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyText('');
    setIsSubmittingEdit(false);
  };

  const saveEditReply = async (replyId) => {
    if (!editingReplyText.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const { data, error } = await supabase
        .from('replies')
        .update({
          content: editingReplyText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', replyId)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error updating reply:', error);
        alert('Failed to update reply. Error: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('Reply not found or you do not have permission to edit it.');
        return;
      }

      setReplies(prev => prev.map(r =>
        r.id === replyId
          ? { ...r, content: editingReplyText.trim(), updated_at: new Date().toISOString() }
          : r
      ));

      setEditingReplyId(null);
      setEditingReplyText('');
      alert('✅ Reply updated successfully!');
      
    } catch (err) {
      console.error('Error in saveEditReply:', err);
      alert('Failed to update reply. Please try again.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // ─── Handle Delete Reply ──────────────────────────────────────────────
  const deleteReply = async (replyId) => {
    if (!replyId) return;

    try {
      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting reply:', error);
        alert('Failed to delete reply. Please try again.');
        return;
      }

      setReplies(prev => prev.filter(r => r.id !== replyId));

      const { data: updatedService, error: fetchError } = await supabase
        .from('services')
        .select('replies')
        .eq('id', serviceId)
        .single();

      if (!fetchError && updatedService) {
        setRepliesCount(updatedService.replies || 0);
        setService(prev => ({ ...prev, replies: updatedService.replies || 0 }));
      } else {
        const newRepliesCount = Math.max(0, (repliesCount || 0) - 1);
        setRepliesCount(newRepliesCount);
        setService(prev => ({ ...prev, replies: newRepliesCount }));
      }

      setShowDeleteReplyConfirm(null);
      alert('✅ Reply deleted successfully!');
      
    } catch (err) {
      console.error('Error deleting reply:', err);
      alert('Failed to delete reply. Please try again.');
    }
  };

  // ─── Handle Interested/Favorite Toggle ──────────────────────────────
  const handleInterested = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!serviceId) {
      console.error('❌ No serviceId');
      return;
    }

    setIsTogglingInterest(true);

    try {
      const { data: existingInterest, error: checkError } = await supabase
        .from('interested_users')
        .select('id')
        .eq('service_id', serviceId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking interest:', checkError);
        alert('Failed to check interest status');
        setIsTogglingInterest(false);
        return;
      }

      const isCurrentlyInterested = !!existingInterest;

      if (isCurrentlyInterested) {
        const { error: deleteError } = await supabase
          .from('interested_users')
          .delete()
          .eq('service_id', serviceId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('❌ Error removing interest:', deleteError);
          alert('Failed to remove interest. Please try again.');
          setIsTogglingInterest(false);
          return;
        }

        setIsInterested(false);
        setInterestedCount(prev => Math.max(0, prev - 1));
        
        const newFavorites = favoriteServices.filter(id => id !== serviceId);
        saveFavorites(newFavorites);
        
        setService(prev => ({ 
          ...prev, 
          interested: Math.max(0, (prev?.interested || 0) - 1) 
        }));

      } else {
        const { error: insertError } = await supabase
          .from('interested_users')
          .insert({
            service_id: serviceId,
            user_id: user.id,
          });

        if (insertError) {
          console.error('❌ Error adding interest:', insertError);
          if (insertError.code === '23505') {
            alert('You are already interested in this service.');
          } else {
            alert('Failed to add interest. Please try again.');
          }
          setIsTogglingInterest(false);
          return;
        }

        setIsInterested(true);
        setInterestedCount(prev => prev + 1);
        
        const newFavorites = [...favoriteServices, serviceId];
        const unique = [...new Set(newFavorites)];
        saveFavorites(unique);
        
        setService(prev => ({ 
          ...prev, 
          interested: (prev?.interested || 0) + 1 
        }));
      }

      await fetchServiceDetail();

    } catch (err) {
      console.error('❌ Error in handleInterested:', err);
      alert('Failed to update. Please try again.');
    } finally {
      setIsTogglingInterest(false);
    }
  };

  // ─── Handle Share ────────────────────────────────────────────────────
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const copyToClipboard = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareVia = (platform) => {
    const url = window.location.href;
    const title = service?.title || 'Check out this service';
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this service: ${url}`)}`;
        break;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  // ─── Star Rating Component ──────────────────────────────────────────
  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-xs text-amber-400" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-xs text-amber-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-xs text-stone-300 dark:text-stone-600" />
        ))}
      </div>
    );
  };

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Loading service...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────
  if (error || !service) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 dark:text-stone-400">{error || 'Service not found'}</p>
          <Link to="/services">
            <button className="mt-4 px-6 py-2 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-full text-sm hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
              Back to Services
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === service.user_id;
  const priceValue = service.price?.replace(/[^0-9.]/g, '') || '0';
  const rating = service.rating || 4.5 + (Math.random() * 0.3);
  const reviews = service.reviews || Math.floor(Math.random() * 50) + 5;
  
  const displayViews = viewsCount || service.views || 0;
  const displayInterested = interestedCount || service.interested || 0;
  const displayReplies = repliesCount || service.replies || 0;

  const hasContactInfo = providerContact.email || providerContact.phone || 
                         providerContact.whatsapp || providerContact.telegram ||
                         providerContact.instagram || providerContact.twitter ||
                         providerContact.website;

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-6 text-sm"
        >
          <FaArrowLeft className="text-xs" />
          Back to Services
        </Link>

        {/* Service Detail */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
          {/* Image */}
          <div className="relative h-64 sm:h-80 md:h-96 bg-stone-50 dark:bg-stone-800/50 overflow-hidden">
            {isEditing ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800 p-4">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Image URL</label>
                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={editData.image_url}
                  onChange={(e) => setEditData({...editData, image_url: e.target.value})}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-sm focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                />
                {editData.image_url && (
                  <img src={editData.image_url} alt="Preview" className="mt-2 h-32 w-auto object-cover rounded-lg" />
                )}
              </div>
            ) : service.image_url ? (
              <img
                src={service.image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaImage className="text-stone-300 dark:text-stone-600 text-6xl" />
              </div>
            )}
            {service.is_premium && (
              <span className="absolute top-4 right-4 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium tracking-wider rounded-full">
                Premium
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({...editData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                    >
                      <option value="design">Design</option>
                      <option value="frontend">Frontend</option>
                      <option value="tiktok">TikTok Ads</option>
                      <option value="study">Study Help</option>
                      <option value="marketing">Marketing</option>
                      <option value="video">Video Editing</option>
                      <option value="writing">Writing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                      <input
                        type="text"
                        value={editData.price}
                        onChange={(e) => setEditData({...editData, price: e.target.value})}
                        className="w-full pl-7 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaSave /> Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* View Mode */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-light text-stone-900 dark:text-white tracking-tight">
                      {service.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Link 
                        to={`/user-services/${service.user_id}`}
                        className="text-sm text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
                      >
                        <FaUser className="text-xs" />
                        by {service.posted_by}
                        {service.user?.is_premium && (
                          <FaCrown className="text-amber-500 text-[10px] ml-1" />
                        )}
                      </Link>
                      {service.is_verified && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-medium rounded-full">
                          <FaCheckCircle className="text-[8px]" />
                          Verified
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400">•</span>
                      <span className="text-[10px] text-stone-400">{service.level || 'Level 1'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl font-light text-amber-600 dark:text-amber-400 flex items-start">
                      <span className="text-xl font-medium mt-0.5">$</span>
                      {priceValue}
                    </span>
                    {isOwner && !isEditing && (
                      <>
                        <button
                          onClick={handleEdit}
                          className="p-2 text-stone-400 hover:text-amber-500 transition-colors duration-300"
                          title="Edit Service"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors duration-300"
                          title="Delete Service"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={rating} />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{rating.toFixed(1)}</span>
                  <span className="text-sm text-stone-400">({reviews} reviews)</span>
                </div>

                {/* Description */}
                <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Location & Video Consultation */}
                <div className="flex flex-wrap items-center gap-4 mb-4 py-3 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <FaMapPin className="text-amber-500 text-xs" />
                    <span>{service.location || 'Online'}</span>
                  </div>
                  {service.video_consultation && (
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                      <FaVideoIcon className="text-emerald-500 text-xs" />
                      <span>Video Consultation Available</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <FaLevelUpAlt className="text-amber-500 text-xs" />
                    <span>{service.level || 'Level 1'}</span>
                  </div>
                </div>

             {/* Contact Information Section - Modern */}
{hasContactInfo && (
  <div className="mb-6 overflow-hidden">
    <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 dark:from-amber-950/10 dark:via-stone-900/50 dark:to-orange-950/10 rounded-2xl border border-amber-200/50 dark:border-amber-800/20 shadow-sm hover:shadow-md transition-all duration-300 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
          <FaAddressCard className="text-white text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">
            Contact Information
          </h3>
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            Reach out to the service provider
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[8px] font-medium rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Email */}
        {providerContact.email && (
          <div className="group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-amber-200/50 dark:hover:border-amber-800/30">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500">
              <FaEnvelope className="text-[10px]" />
            </div>
            <span className="flex-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 truncate font-medium">
              {providerContact.email}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(providerContact.email);
                  // Show success feedback
                  const btn = document.getElementById('copy-email');
                  if (btn) {
                    btn.innerHTML = '✅';
                    setTimeout(() => {
                      btn.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>';
                    }, 2000);
                  }
                }}
                className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-stone-400 hover:text-amber-500"
                title="Copy email"
              >
                <FaCopy className="w-3 h-3" />
              </button>
              <a
                href={`mailto:${providerContact.email}`}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-medium rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
              >
                Email
              </a>
            </div>
          </div>
        )}

        {/* Phone */}
        {providerContact.phone && (
          <div className="group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-green-200/50 dark:hover:border-green-800/30">
            <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500">
              <FaPhone className="text-[10px]" />
            </div>
            <span className="flex-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
              {providerContact.phone}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={`tel:${providerContact.phone}`}
                className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] font-medium rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
              >
                Call
              </a>
            </div>
          </div>
        )}

        {/* WhatsApp */}
        {providerContact.whatsapp && (
          <div className="group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-green-200/50 dark:hover:border-green-800/30">
            <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500">
              <FaWhatsapp className="text-[10px]" />
            </div>
            <span className="flex-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
              {providerContact.whatsapp}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={`https://wa.me/${providerContact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#25D366] text-white text-[9px] font-medium rounded-lg hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300"
              >
                <FaWhatsapp className="inline mr-1 text-[8px]" />
                Chat
              </a>
            </div>
          </div>
        )}

        {/* Telegram */}
        {providerContact.telegram && (
          <div className="group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/30">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-500">
              <FaTelegram className="text-[10px]" />
            </div>
            <span className="flex-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
              {providerContact.telegram}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={`https://t.me/${providerContact.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#0088cc] text-white text-[9px] font-medium rounded-lg hover:shadow-lg hover:shadow-[#0088cc]/30 transition-all duration-300"
              >
                <FaTelegram className="inline mr-1 text-[8px]" />
                Chat
              </a>
            </div>
          </div>
        )}

        {/* Instagram */}
        {providerContact.instagram && (
          <div className="group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-pink-200/50 dark:hover:border-pink-800/30">
            <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/30 text-pink-500">
              <FaInstagram className="text-[10px]" />
            </div>
            <span className="flex-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
              {providerContact.instagram}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={`https://instagram.com/${providerContact.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-medium rounded-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
              >
                <FaInstagram className="inline mr-1 text-[8px]" />
                Visit
              </a>
            </div>
          </div>
        )}

        {/* Twitter */}
        {providerContact.twitter && (
          <div className="group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/30">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-400">
              <FaTwitter className="text-[10px]" />
            </div>
            <span className="flex-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
              {providerContact.twitter}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={`https://twitter.com/${providerContact.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#1DA1F2] text-white text-[9px] font-medium rounded-lg hover:shadow-lg hover:shadow-[#1DA1F2]/30 transition-all duration-300"
              >
                <FaTwitter className="inline mr-1 text-[8px]" />
                Visit
              </a>
            </div>
          </div>
        )}

        {/* Website - Full width */}
        {providerContact.website && (
          <div className="col-span-1 sm:col-span-2 group flex items-center gap-2.5 p-2.5 bg-white/60 dark:bg-stone-800/30 rounded-xl hover:bg-white dark:hover:bg-stone-800/60 transition-all duration-300 border border-transparent hover:border-amber-200/50 dark:hover:border-amber-800/30">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500">
              <FaLink className="text-[10px]" />
            </div>
            <a
              href={providerContact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-xs sm:text-sm text-amber-600 dark:text-amber-400 hover:underline truncate font-medium"
            >
              {providerContact.website}
            </a>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-medium rounded-lg">
                <FaLink className="inline mr-1 text-[8px]" />
                Visit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar */}
      <div className="mt-4 pt-3 border-t border-amber-200/30 dark:border-amber-800/20 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-stone-400 dark:text-stone-500">
          <span className="inline-flex items-center gap-1">
            All contact methods are verified
          </span>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-stone-400 dark:text-stone-500">Quick reach:</span>
          {providerContact.whatsapp && (
            <a
              href={`https://wa.me/${providerContact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500 hover:bg-green-200 dark:hover:bg-green-950/50 transition-colors"
              title="WhatsApp"
            >
              <FaWhatsapp className="w-3 h-3" />
            </a>
          )}
          {providerContact.telegram && (
            <a
              href={`https://t.me/${providerContact.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-950/50 transition-colors"
              title="Telegram"
            >
              <FaTelegram className="w-3 h-3" />
            </a>
          )}
          {providerContact.email && (
            <a
              href={`mailto:${providerContact.email}`}
              className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-950/50 transition-colors"
              title="Email"
            >
              <FaEnvelope className="w-3 h-3" />
            </a>
          )}
          {providerContact.phone && (
            <a
              href={`tel:${providerContact.phone}`}
              className="p-1 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500 hover:bg-green-200 dark:hover:bg-green-950/50 transition-colors"
              title="Call"
            >
              <FaPhone className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
)}
                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-t border-stone-100 dark:border-stone-800">
             
             
                  <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
                    <FaReply className="text-sm" />
                    <span className="text-sm">{displayReplies} replies</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
                    <FaCalendarAlt className="text-sm" />
                    <span className="text-sm">{new Date(service.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={handleInterested}
                    disabled={isTogglingInterest}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isInterested
                        ? 'bg-rose-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isTogglingInterest ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-sm" /> Updating...
                      </span>
                    ) : isInterested ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaHeart /> Interested
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaRegHeart /> Interested
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/signin');
                        return;
                      }
                      setShowReply(!showReply);
                    }}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FaReply /> Reply
                    </span>
                  </button>


                  {hasContactInfo && (
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaUserCircle /> Contact Provider
                    </button>
                  )}
                </div>

            
                {/* Reply Section */}
                {showReply && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
                    {user ? (
                      <>
                        <textarea
                          placeholder="Write your reply or question..."
                          className="w-full p-3 bg-white dark:bg-stone-900 rounded-lg border border-amber-200 dark:border-amber-800/30 text-sm resize-none focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                          rows="3"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button
                          onClick={handleReplySubmit}
                          disabled={isSubmittingReply || !replyText.trim()}
                          className="mt-3 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSubmittingReply ? (
                            <>
                              <FaSpinner className="animate-spin text-sm" /> Sending...
                            </>
                          ) : (
                            <>
                              <FaPaperPlane className="text-sm" /> Send Reply
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          Please sign in to reply to this service.
                        </p>
                        <Link to="/signin">
                          <button className="mt-3 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all">
                            Sign In to Reply
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── REPLIES LIST ────────────────────────────────────── */}
                {replies.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                      <FaComments className="text-amber-500" />
                      Replies ({replies.length})
                    </h4>
                    <div className="space-y-3">
                      {replies.map((reply) => {
                        const isReplyOwner = user?.id === reply.user_id;
                        const isEditingThis = editingReplyId === reply.id;

                        return (
                          <div key={reply.id} className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 border border-stone-200 dark:border-stone-700">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                                  {reply.user_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-xs font-medium text-stone-900 dark:text-white">
                                  {reply.user_name || 'Anonymous'}
                                </span>
                                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                  {new Date(reply.created_at).toLocaleDateString()} • {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {reply.updated_at && reply.updated_at !== reply.created_at && (
                                  <span className="text-[8px] text-stone-400 dark:text-stone-500 italic">
                                    (edited)
                                  </span>
                                )}
                              </div>
                              {isReplyOwner && !isEditingThis && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startEditReply(reply)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                                    title="Edit reply"
                                  >
                                    <FaEdit className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteReplyConfirm(reply.id)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    title="Delete reply"
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditingThis ? (
                              <div className="mt-2 pl-8">
                                <textarea
                                  value={editingReplyText}
                                  onChange={(e) => setEditingReplyText(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 text-sm resize-none focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                                  rows="2"
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-1.5">
                                  <button
                                    onClick={() => saveEditReply(reply.id)}
                                    disabled={isSubmittingEdit || !editingReplyText.trim()}
                                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {isSubmittingEdit ? (
                                      <FaSpinner className="animate-spin text-xs" />
                                    ) : (
                                      <FaCheck className="text-xs" />
                                    )}
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditReply}
                                    className="px-3 py-1 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-stone-600 dark:text-stone-300 pl-8">
                                {reply.content}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!loadingReplies && replies.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <p className="text-xs text-stone-400 dark:text-stone-500 text-center">
                      No replies yet. Be the first to reply!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl max-w-md w-full">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 flex items-center justify-center">
                <FaTrash className="text-red-500 text-2xl" />
              </div>
              <h2 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
                Delete Service
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-6">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reply Confirmation Modal */}
      {showDeleteReplyConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl max-w-md w-full">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 flex items-center justify-center">
                <FaTrash className="text-red-500 text-2xl" />
              </div>
              <h2 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
                Delete Reply
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-6">
                Are you sure you want to delete this reply? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteReplyConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteReply(showDeleteReplyConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    {/* Contact Modal - Modern & Advanced */}
<AnimatePresence>
  {showContactModal && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={() => setShowContactModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200/50 dark:border-stone-800/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Modern with gradient accent */}
        <div className="sticky top-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                <FaUserCircle className="text-white text-xl" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                Contact Provider
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">Active</span>
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                {service.posted_by}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowContactModal(false)} 
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-300 hover:scale-105 hover:rotate-90"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Service Info - Enhanced Card */}
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
                  {priceValue}
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
          <div>
            <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              Quick Contact
              <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {providerContact.whatsapp && (
                <a
                  href={`https://wa.me/${providerContact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 p-2.5 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200/50 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-950/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <FaWhatsapp className="text-green-500 text-sm group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">WhatsApp</span>
                </a>
              )}
              {providerContact.telegram && (
                <a
                  href={`https://t.me/${providerContact.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <FaTelegram className="text-blue-500 text-sm group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Telegram</span>
                </a>
              )}
              {providerContact.email && (
                <a
                  href={`mailto:${providerContact.email}`}
                  className="group flex items-center justify-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <FaEnvelope className="text-amber-500 text-sm group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Email</span>
                </a>
              )}
              {providerContact.phone && (
                <a
                  href={`tel:${providerContact.phone}`}
                  className="group flex items-center justify-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <FaPhone className="text-emerald-500 text-sm group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Call</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              Contact Details
              <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
            </h4>
            <div className="space-y-2">
              {providerContact.email && (
                <div className="flex items-center gap-3 p-3 bg-stone-50/80 dark:bg-stone-800/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 group border border-transparent hover:border-amber-200/30 dark:hover:border-amber-800/20">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500">
                    <FaEnvelope className="text-[10px]" />
                  </div>
                  <span className="flex-1 text-xs text-stone-700 dark:text-stone-300 truncate font-mono">
                    {providerContact.email}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(providerContact.email);
                      // Show toast notification
                      const toast = document.createElement('div');
                      toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50';
                      toast.textContent = '📋 Email copied!';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2000);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaCopy className="text-[10px]" />
                  </button>
                </div>
              )}

              {providerContact.phone && (
                <div className="flex items-center gap-3 p-3 bg-stone-50/80 dark:bg-stone-800/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 group border border-transparent hover:border-green-200/30 dark:hover:border-green-800/20">
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-500">
                    <FaPhone className="text-[10px]" />
                  </div>
                  <span className="flex-1 text-xs text-stone-700 dark:text-stone-300 font-mono">
                    {providerContact.phone}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(providerContact.phone);
                      const toast = document.createElement('div');
                      toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50';
                      toast.textContent = '📋 Phone copied!';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2000);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaCopy className="text-[10px]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          {(providerContact.instagram || providerContact.twitter) && (
            <div>
              <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Social Media
                <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              </h4>
              <div className="flex flex-wrap gap-2">
                {providerContact.instagram && (
                  <a
                    href={`https://instagram.com/${providerContact.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-xl border border-pink-200/50 dark:border-pink-800/30 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaInstagram className="text-pink-500 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      {providerContact.instagram}
                    </span>
                    <span className="text-[8px] text-pink-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </a>
                )}
                {providerContact.twitter && (
                  <a
                    href={`https://twitter.com/${providerContact.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FaTwitter className="text-blue-400 text-sm group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      {providerContact.twitter}
                    </span>
                    <span className="text-[8px] text-blue-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Website */}
          {providerContact.website && (
            <div>
              <h4 className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Website / Portfolio
                <span className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
              </h4>
              <a
                href={providerContact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 bg-stone-50/80 dark:bg-stone-800/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-all duration-300 border border-transparent hover:border-amber-200/30 dark:hover:border-amber-800/20"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-500">
                  <FaLink className="text-[10px]" />
                </div>
                <span className="flex-1 text-xs text-amber-600 dark:text-amber-400 truncate font-medium group-hover:underline">
                  {providerContact.website}
                </span>
                <span className="text-stone-400 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="flex gap-3 pt-4 border-t border-stone-200/50 dark:border-stone-800/50">
            <button
              onClick={() => setShowContactModal(false)}
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

          {/* Footer - Trust Badge */}
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
  )}
</AnimatePresence>
    </div>
  );
};

export default ServiceDetail;