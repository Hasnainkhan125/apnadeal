import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaCamera, FaSpinner, FaSave, FaUser,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe,
  FaBriefcase, FaBuilding, FaGraduationCap, FaHeart, FaCode,
  FaLink, FaCalendarAlt, FaVenusMars, FaTwitter, FaLinkedin, FaGithub, FaInstagram,
  FaUserEdit, FaCheck, FaExclamationTriangle
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const EditProfileModal = ({ isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    bio: "",
    website: "",
    occupation: "",
    company: "",
    education: "",
    interests: [],
    skills: [],
    dateOfBirth: "",
    gender: "",
    avatar: null,
    socialLinks: {
      twitter: "",
      linkedin: "",
      github: "",
      instagram: ""
    }
  });

  // Load user data
  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          fullName: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          bio: data.bio || "",
          website: data.website || "",
          occupation: data.occupation || "",
          company: data.company || "",
          education: data.education || "",
          interests: data.interests || [],
          skills: data.skills || [],
          dateOfBirth: data.date_of_birth || "",
          gender: data.gender || "",
          avatar: data.avatar_url || null,
          socialLinks: data.social_links || {
            twitter: "",
            linkedin: "",
            github: "",
            instagram: ""
          }
        });

        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
          setOriginalAvatar(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // ⭐ IMPROVED: Upload avatar with better error handling
  const uploadAvatar = async (file) => {
    if (!file) return null;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file.');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image must be less than 5MB.');
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      console.log('📤 Uploading file:', fileName);
      console.log('📊 File size:', file.size);
      console.log('📁 File type:', file.type);

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        
        // Check if error is due to bucket not existing
        if (uploadError.message.includes('bucket not found')) {
          setUploadError('Storage bucket "avatars" not found. Please create it in Supabase.');
        } else {
          setUploadError(`Upload failed: ${uploadError.message}`);
        }
        return null;
      }

      console.log('✅ Upload success:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', publicUrl);

      return publicUrl;
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      setFormData({ ...formData, avatar: avatarUrl });
      setUploadError(null);
    } else {
      // Revert preview if upload failed
      setAvatarPreview(originalAvatar);
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData({ ...formData, avatar: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      alert('Full name is required');
      return;
    }

    setLoading(true);
    setSaveSuccess(false);
    
    try {
      const updateData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || null,
        bio: formData.bio || null,
        website: formData.website || null,
        occupation: formData.occupation || null,
        company: formData.company || null,
        education: formData.education || null,
        interests: formData.interests || [],
        skills: formData.skills || [],
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        avatar_url: formData.avatar || null,
        social_links: formData.socialLinks || {},
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      await supabase
        .from('users')
        .update({
          name: formData.fullName,
          email: formData.email
        })
        .eq('id', user.id);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      if (onUpdate) onUpdate();
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <FaUserEdit className="text-amber-500" />
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <FaTimes className="text-stone-500 dark:text-stone-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center py-4">
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-amber-300/20"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {formData.fullName?.charAt(0) || "U"}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? <FaSpinner className="animate-spin" /> : <FaCamera className="text-sm" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <p className="text-xs text-stone-500 mt-2 flex items-center gap-2">
                  <FaSpinner className="animate-spin" /> Uploading...
                </p>
              )}
              {uploadError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  {uploadError}
                </p>
              )}
              {avatarPreview && !uploading && (
                <button
                  onClick={removeAvatar}
                  className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="john@example.com"
                  readOnly
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm"
                >
                  <FaCheck className="text-emerald-500" />
                  Profile updated successfully! 🎉
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;