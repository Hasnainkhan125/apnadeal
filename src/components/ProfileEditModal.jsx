// src/components/ProfileEditModal.jsx
// Profile edit wizard — styled to match StudyGroups CreateGroupWizard
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaArrowRight, FaArrowLeft, FaUser, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaCamera, FaUpload, FaStore,
  FaBoxOpen, FaTruck, FaMoneyBillWave, FaClock, FaBolt,
  FaGlobe, FaTags, FaCertificate, FaWhatsapp, FaFacebook,
  FaInstagram, FaYoutube, FaTwitter, FaTiktok, FaSpinner,
  FaCheck, FaUserCircle, FaInfoCircle, FaBriefcase,
  FaCheckCircle, FaExclamationTriangle,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   STYLES — same tokens as Study Groups
   ═══════════════════════════════════════════════════════════════ */
const ProfileStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* ── Reuse group theme tokens (grp-*) ── */
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
      --grp-input-bg:    #1A1A1A;
    }
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
      --grp-input-bg:    #F9FAFB;
    }
    .grp-card { background: var(--grp-card); border: 1px solid var(--grp-line); border-radius: 24px; }
    .grp-card-2 { background: var(--grp-card-2); border: 1px solid var(--grp-line); border-radius: 16px; }
    .grp-input { background: var(--grp-input-bg); color: var(--grp-txt); border: 1px solid var(--grp-line); }
    .grp-input:focus { border-color: var(--grp-primary); outline: none; }
  `}</style>
);

const TOTAL_STEPS = 4;

const ProfileEditModal = ({ isOpen, onClose, currentProfile, userId, onSaved }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentProfile?.avatar_url || null);
  const avatarInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", location: "", bio: "",
    seller_type: "", experience_level: "", main_categories: "",
    preferred_payment: "", delivery_option: "", business_hours: "",
    response_time: "", availability: "available",
    badges: "", tags: "",
    social_whatsapp: "", social_facebook: "", social_instagram: "",
    social_tiktok: "", social_youtube: "", social_twitter: "",
  });

  /* Reset when modal opens */
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setAvatarPreview(currentProfile?.avatar_url || null);
    setAvatarFile(null);
    setFormData({
      full_name: currentProfile?.full_name || "",
      email: currentProfile?.email || "",
      phone: currentProfile?.phone || "",
      location: currentProfile?.location || currentProfile?.city || "",
      bio: currentProfile?.bio || "",
      seller_type: currentProfile?.seller_type || "",
      experience_level: currentProfile?.experience_level || "",
      main_categories: currentProfile?.main_categories || "",
      preferred_payment: currentProfile?.preferred_payment || "",
      delivery_option: currentProfile?.delivery_option || "",
      business_hours: currentProfile?.business_hours || "",
      response_time: currentProfile?.response_time || "",
      availability: currentProfile?.availability || "available",
      badges: (currentProfile?.badges || []).join(", "),
      tags: (currentProfile?.tags || []).join(", "),
      social_whatsapp: currentProfile?.social_whatsapp || "",
      social_facebook: currentProfile?.social_facebook || "",
      social_instagram: currentProfile?.social_instagram || "",
      social_tiktok: currentProfile?.social_tiktok || "",
      social_youtube: currentProfile?.social_youtube || "",
      social_twitter: currentProfile?.social_twitter || "",
    });
  }, [isOpen, currentProfile]);

  const showToast = (type, message) => {
    const id = Date.now();
    setToast({ id, type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const uploadAvatar = async (file) => {
    if (!file) return null;
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Image must be under 5MB");
      return null;
    }
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${userId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("profile-pics")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });
    if (error) {
      showToast("error", "Upload failed: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("profile-pics").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select an image");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!userId) return;
    setProcessing(true);

    try {
      let avatarUrl = currentProfile?.avatar_url || null;
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);
        if (uploaded) avatarUrl = uploaded;
      }

      const badges = formData.badges.split(",").map((b) => b.trim()).filter(Boolean).slice(0, 3);
      const tags = formData.tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);

      const payload = {
        user_id: userId,
        full_name: formData.full_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        location: formData.location || null,
        city: formData.location || null,
        avatar: avatarUrl,
        avatar_url: avatarUrl,
        bio: formData.bio || null,
        seller_type: formData.seller_type || null,
        experience_level: formData.experience_level || null,
        main_categories: formData.main_categories || null,
        preferred_payment: formData.preferred_payment || null,
        delivery_option: formData.delivery_option || null,
        business_hours: formData.business_hours || null,
        response_time: formData.response_time || null,
        availability: formData.availability || "available",
        badges,
        tags,
        social_whatsapp: formData.social_whatsapp || null,
        social_facebook: formData.social_facebook || null,
        social_instagram: formData.social_instagram || null,
        social_tiktok: formData.social_tiktok || null,
        social_youtube: formData.social_youtube || null,
        social_twitter: formData.social_twitter || null,
        updated_at: new Date().toISOString(),
      };

      const { error: settingsErr } = await supabase
        .from("user_settings")
        .upsert(payload, { onConflict: "user_id" });
      if (settingsErr) throw settingsErr;

      await supabase.from("users").update({
        full_name: formData.full_name || null,
        name: formData.full_name || null,
        avatar_url: avatarUrl,
      }).eq("id", userId);

      showToast("success", "Profile saved successfully!");

      setTimeout(() => {
        onSaved?.();
        onClose?.();
      }, 600);
    } catch (err) {
      console.error("Save profile failed:", err);
      showToast("error", "Save failed: " + (err.message || "Please try again"));
    } finally {
      setProcessing(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.full_name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  const nextStep = () => { if (canProceed() && step < TOTAL_STEPS) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  if (!isOpen) return null;

  return (
    <div className="theme-dark fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <ProfileStyles />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[9999] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[260px] border-l-4"
            style={{
              background: 'var(--grp-card)',
              borderLeftColor: toast.type === 'error' ? 'var(--grp-danger)' : 'var(--grp-success)',
            }}
          >
            {toast.type === 'error'
              ? <FaExclamationTriangle className="text-[var(--grp-danger)]" />
              : <FaCheckCircle className="text-[var(--grp-success)]" />}
            <p className="font-ticket-body text-sm font-bold" style={{ color: 'var(--grp-txt)' }}>
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="grp-card max-w-xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl"
      >
        {/* ═══ HEADER — same style as StudyGroups ═══ */}
        <div className="p-6 text-center border-b border-[var(--grp-line)] relative">
          <button
            onClick={onClose}
            disabled={processing}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-[var(--grp-hover)] transition-all disabled:opacity-50"
          >
            <FaTimes className="text-[var(--grp-txt-soft)] text-sm" />
          </button>

          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[var(--grp-primary-soft)] mb-3">
            <FaUserCircle className="text-2xl text-[var(--grp-primary)]" />
          </div>
          <h2 className="font-ticket-display text-lg font-black uppercase tracking-wider text-[var(--grp-txt)]">
            {currentProfile?.full_name ? "Edit Profile" : "Create Profile"}
          </h2>
          <p className="font-ticket-body text-xs text-[var(--grp-txt-soft)] mt-1">
            Set up your seller profile so buyers can find you.
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? 'w-8 bg-[var(--grp-primary)]' : 'w-4 bg-[var(--grp-line)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ═══ FORM ═══ */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <AnimatePresence mode="wait">

            {/* ─── STEP 1: BASIC ─── */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    1
                  </span>
                </div>
                <h3 className="font-ticket-display text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  Who are you?
                </h3>

                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="h-28 w-28 rounded-full overflow-hidden flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, var(--grp-primary), var(--grp-primary-2))",
                        border: "3px solid var(--grp-card-2)",
                      }}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-4xl font-black font-ticket-body">
                          {(formData.full_name || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 h-9 w-9 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, var(--grp-primary), var(--grp-primary-2))",
                        border: "3px solid var(--grp-card)",
                      }}>
                      <FaCamera className="text-white text-xs" />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <p className="font-ticket-body text-[11px] mt-3 text-[var(--grp-txt-soft)]">
                    Tap camera to change photo
                  </p>
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    autoFocus
                    className="w-full px-5 py-4 rounded-2xl grp-input font-ticket-body text-base font-medium placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Short Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    maxLength={300}
                    placeholder="Tell buyers about yourself…"
                    className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm resize-none placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                  />
                  <p className="font-ticket-body text-[10px] mt-1 text-right text-[var(--grp-txt-faint)]">
                    {formData.bio.length}/300
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: CONTACT ─── */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    2
                  </span>
                </div>
                <h3 className="font-ticket-display text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  How can buyers reach you?
                </h3>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-5 py-4 rounded-2xl grp-input font-ticket-body text-base placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-5 py-4 rounded-2xl grp-input font-ticket-body text-base placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Karachi, Pakistan"
                    className="w-full px-5 py-4 rounded-2xl grp-input font-ticket-body text-base placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: SELLER ─── */}
            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    3
                  </span>
                </div>
                <h3 className="font-ticket-display text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  What do you sell?
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      I Am A
                    </label>
                    <select
                      value={formData.seller_type}
                      onChange={(e) => setFormData({ ...formData, seller_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]">
                      <option value="">Select…</option>
                      <option value="Individual Seller">Individual Seller</option>
                      <option value="Shop / Store">Shop / Store</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Service Provider">Service Provider</option>
                      <option value="Real Estate Agent">Real Estate Agent</option>
                      <option value="Dealer">Dealer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Experience
                    </label>
                    <select
                      value={formData.experience_level}
                      onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]">
                      <option value="">Select…</option>
                      <option value="New Seller">New Seller</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Experienced">Experienced</option>
                      <option value="Pro Seller">Pro Seller</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Main Categories
                  </label>
                  <input type="text"
                    value={formData.main_categories}
                    onChange={(e) => setFormData({ ...formData, main_categories: e.target.value })}
                    placeholder="Mobiles, Vehicles, Property"
                    className="w-full px-5 py-4 rounded-2xl grp-input font-ticket-body text-base placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Payment
                    </label>
                    <select
                      value={formData.preferred_payment}
                      onChange={(e) => setFormData({ ...formData, preferred_payment: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]">
                      <option value="">Select…</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Easypaisa / JazzCash">Easypaisa / JazzCash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Multiple Methods">Multiple Methods</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Delivery
                    </label>
                    <select
                      value={formData.delivery_option}
                      onChange={(e) => setFormData({ ...formData, delivery_option: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]">
                      <option value="">Select…</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Pickup Only">Pickup Only</option>
                      <option value="Home Delivery">Home Delivery</option>
                      <option value="Both Available">Both Available</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Business Hours
                    </label>
                    <input type="text"
                      value={formData.business_hours}
                      onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                      placeholder="Mon-Sat 9am-9pm"
                      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                      Response Time
                    </label>
                    <select
                      value={formData.response_time}
                      onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]">
                      <option value="">Select…</option>
                      <option value="Within 1 hour">Within 1 hour</option>
                      <option value="Within 3 hours">Within 3 hours</option>
                      <option value="Within 24 hours">Within 24 hours</option>
                      <option value="Within 2 days">Within 2 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm font-semibold cursor-pointer focus:border-[var(--grp-primary)]">
                    <option value="available">Open for Business</option>
                    <option value="busy">Currently Busy</option>
                    <option value="unavailable">Not Accepting</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 4: SOCIAL & TAGS ─── */}
            {step === 4 && (
              <motion.div key="s4"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--grp-card-2)] text-[10px] font-bold text-[var(--grp-txt-soft)]">
                    4
                  </span>
                </div>
                <h3 className="font-ticket-display text-2xl font-black text-[var(--grp-txt)] leading-tight">
                  Add your links & tags
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="WhatsApp"
                    value={formData.social_whatsapp}
                    onChange={(v) => setFormData({ ...formData, social_whatsapp: v })}
                    placeholder="+92 300 1234567"
                  />
                  <InputField
                    label="Facebook"
                    value={formData.social_facebook}
                    onChange={(v) => setFormData({ ...formData, social_facebook: v })}
                    placeholder="https://facebook.com/you"
                  />
                  <InputField
                    label="Instagram"
                    value={formData.social_instagram}
                    onChange={(v) => setFormData({ ...formData, social_instagram: v })}
                    placeholder="https://instagram.com/you"
                  />
                  <InputField
                    label="TikTok"
                    value={formData.social_tiktok}
                    onChange={(v) => setFormData({ ...formData, social_tiktok: v })}
                    placeholder="https://tiktok.com/@you"
                  />
                  <InputField
                    label="YouTube"
                    value={formData.social_youtube}
                    onChange={(v) => setFormData({ ...formData, social_youtube: v })}
                    placeholder="https://youtube.com/@you"
                  />
                  <InputField
                    label="Twitter / X"
                    value={formData.social_twitter}
                    onChange={(v) => setFormData({ ...formData, social_twitter: v })}
                    placeholder="https://twitter.com/you"
                  />
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Badges (max 3, comma-separated)
                  </label>
                  <input type="text"
                    value={formData.badges}
                    onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
                    placeholder="Verified Seller, Top Rated, Fast Shipper"
                    className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors" />
                </div>

                <div>
                  <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
                    Tags (comma-separated, no # needed)
                  </label>
                  <input type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Mobiles, Warranty, Karachi"
                    className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── FOOTER ─── */}
          <div className="flex gap-3 pt-4 border-t border-[var(--grp-line)]">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={processing}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-[var(--grp-line)] text-[var(--grp-txt)] font-ticket-body text-sm font-bold hover:bg-[var(--grp-hover)] transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-[var(--grp-line)] text-[var(--grp-txt)] font-ticket-body text-sm font-bold hover:bg-[var(--grp-hover)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed() || processing}
                className="flex-1 px-4 py-3.5 bg-[var(--grp-primary)] text-white font-ticket-body text-sm font-bold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[var(--grp-primary-glow)]"
              >
                Next
                <FaArrowRight className="text-xs" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-3.5 bg-[var(--grp-primary)] text-white font-ticket-body text-sm font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[var(--grp-primary-glow)]"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck className="text-sm" />
                    Save Profile
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

/* ── Small helper ── */
const InputField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest text-[var(--grp-txt-soft)] mb-2">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl grp-input font-ticket-body text-sm placeholder-[var(--grp-txt-faint)] focus:border-[var(--grp-primary)] transition-colors"
    />
  </div>
);

export default ProfileEditModal;