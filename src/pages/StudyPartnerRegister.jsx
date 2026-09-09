// pages/StudyPartnerRegister.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaArrowLeft,
  FaUser,
  FaGraduationCap,
  FaBook,
  FaDollarSign,
  FaClock,
  FaInfoCircle,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaUpload,
  FaTimes,
  FaCrown,
} from 'react-icons/fa';

const StudyPartnerRegister = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    level: 'Intermediate',
    bio: '',
    rate: '15',
    availability: 'Flexible',
    responseTime: '1-2 hours',
  });

  const userIsPremium = isPremium();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user is premium
      if (!userIsPremium) {
        setError('You need a Premium subscription to register as a study partner.');
        setLoading(false);
        return;
      }

      // Check if user already registered
      const { data: existing, error: checkError } = await supabase
        .from('study_partners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing:', checkError);
      }

      if (existing) {
        setError('You are already registered as a study partner!');
        setLoading(false);
        return;
      }

      // Insert new study partner
      const { error: insertError } = await supabase
        .from('study_partners')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          level: formData.level,
          bio: formData.bio,
          rate: parseFloat(formData.rate) || 15,
          availability: formData.availability,
          response_time: formData.responseTime,
          verified: false,
          rating: 4.5,
          reviews: 0,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error registering:', insertError);
        setError('Failed to register. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/study-partners');
      }, 3000);

    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <FaCheckCircle className="text-emerald-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Registration Successful! 🎉
          </h2>
          <p className="text-stone-500 dark:text-stone-400">
            You are now registered as a study partner. Redirecting...
          </p>
          <Link
            to="/study-partners"
            className="mt-6 inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all duration-300"
          >
            Go to Study Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/study-partners"
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <FaArrowLeft className="text-stone-600 dark:text-stone-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              Register as Study Partner
            </h1>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              Share your knowledge and earn by helping others learn
            </p>
          </div>
        </div>

        {/* Premium Check */}
        {!userIsPremium && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl flex items-start gap-3">
            <FaCrown className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-stone-700 dark:text-stone-300 font-medium">
                Premium Feature
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                You need a Premium subscription to register as a study partner. 
                Upgrade to start earning from your knowledge.
              </p>
              <Link to="/premium" className="mt-2 inline-block">
                <button className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full hover:shadow-lg transition-all duration-300">
                  Upgrade Now
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <FaUser className="text-amber-500 text-sm" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Email <span className="text-amber-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Phone Number <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0314-0972575"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-xs" />
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="0314-0972575"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Study Information */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-amber-500 text-sm" />
              Study Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Subject <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <FaBook className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors appearance-none"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Economics">Economics</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Level <span className="text-amber-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Bio / Description <span className="text-amber-500">*</span>
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  placeholder="Tell students about yourself, your teaching style, and what you can help with..."
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white resize-none focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <FaDollarSign className="text-amber-500 text-sm" />
              Pricing & Availability
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Hourly Rate ($) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  <input
                    type="number"
                    name="rate"
                    placeholder="15"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                    min="5"
                    max="100"
                    step="0.5"
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Availability <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors appearance-none"
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                  Response Time
                </label>
                <select
                  name="responseTime"
                  value={formData.responseTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-colors appearance-none"
                >
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="3-4 hours">3-4 hours</option>
                  <option value="5-6 hours">5-6 hours</option>
                  <option value="1 day">1 day</option>
                </select>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-amber-500 text-sm flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  By registering as a study partner, you agree to:
                </p>
                <ul className="text-xs text-stone-500 dark:text-stone-500 mt-1 list-disc pl-4 space-y-0.5">
                  <li>Provide accurate information about your skills</li>
                  <li>Respond to student requests in a timely manner</li>
                  <li>Maintain professional communication</li>
                  <li>Follow the platform's safety guidelines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Link
              to="/study-partners"
              className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !userIsPremium}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  Registering...
                </>
              ) : (
                <>
                  <FaUpload className="text-sm" />
                  Register as Partner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyPartnerRegister;