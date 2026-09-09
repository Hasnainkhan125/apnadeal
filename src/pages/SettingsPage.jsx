import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUser, 
  FaBell, 
  FaLock, 
  FaPalette,
  FaMoon,
  FaSun,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaUserCircle,
  FaCog,
  FaShieldAlt,
  FaDesktop,
  FaFont,
  FaUpload,
  FaTimes,
  FaKey,
  FaFingerprint,
  FaPlus,
  FaTrash,
  FaInfoCircle,
  FaCheck,
  FaChevronDown  ,
  FaExclamationTriangle,
  FaBars
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const SettingsPage = () => {
  const { user, passkeys, registerPasskey, signInWithPasskey, deletePasskey, isPasskeySupported, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  // ─── Password Change States ─────────────────────────────────────────
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Weak",
    color: "red",
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  // Profile Settings
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    avatar: null
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    weeklyReports: true,
    newFeatures: true,
    marketingEmails: false,
    quizReminders: true,
    flashcardReminders: false
  });

  // ─── Appearance Settings ────────────────────────────────────────────
  const [appearance, setAppearance] = useState({
    theme: "light",
    fontSize: "medium",
    compactMode: false,
    animations: true,
    accentColor: "amber",
    sidebarStyle: "modern"
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showActivity: true,
    showProgress: true,
    dataSharing: false,
    cookies: true
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginAlerts: true,
    deviceManagement: true,
    passwordLastChanged: ""
  });

  // Tabs configuration
  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "appearance", label: "Appearance", icon: FaPalette },
    { id: "privacy", label: "Privacy", icon: FaLock },
    { id: "security", label: "Security", icon: FaShieldAlt }
  ];

  // Load settings from Supabase
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  // ─── Apply Appearance Settings Globally ────────────────────────────
  useEffect(() => {
    const applyAppearance = () => {
      const root = document.documentElement;
      
      if (appearance.theme === 'dark') {
        root.classList.add('dark');
      } else if (appearance.theme === 'light') {
        root.classList.remove('dark');
      } else if (appearance.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      
      root.setAttribute('data-accent', appearance.accentColor);
      root.setAttribute('data-font-size', appearance.fontSize);
      
      if (appearance.compactMode) {
        root.classList.add('compact');
      } else {
        root.classList.remove('compact');
      }
      
      if (!appearance.animations) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    };

    applyAppearance();
  }, [appearance.theme, appearance.accentColor, appearance.fontSize, appearance.compactMode, appearance.animations]);

  // ─── Listen for System Theme Changes ──────────────────────────────
  useEffect(() => {
    if (appearance.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [appearance.theme]);

  // ─── Check Password Strength ────────────────────────────────────────
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    let label, color;

    if (passedCount <= 2) {
      label = "Weak";
      color = "red";
    } else if (passedCount === 3) {
      label = "Fair";
      color = "orange";
    } else if (passedCount === 4) {
      label = "Good";
      color = "green";
    } else {
      label = "Strong";
      color = "emerald";
    }

    setPasswordStrength({
      score: passedCount,
      label,
      color,
      checks
    });
  };

  // ─── Password Strength Indicator ────────────────────────────────────
  const PasswordStrengthIndicator = () => {
    const { score, label, color, checks } = passwordStrength;
    const percentage = (score / 5) * 100;

    return (
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
            Password Strength: <span className={`text-${color}-500 font-bold`}>{label}</span>
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">{score}/5</span>
        </div>
        <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${color}-500 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(checks).map(([key, passed]) => {
            const labels = {
              length: "8+ characters",
              uppercase: "Uppercase",
              lowercase: "Lowercase",
              number: "Number",
              special: "Special char"
            };
            return (
              <div key={key} className="flex items-center gap-1">
                {passed ? (
                  <FaCheck className="text-emerald-500 text-[10px]" />
                ) : (
                  <FaTimes className="text-red-400 text-[10px]" />
                )}
                <span className={`text-[10px] ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                  {labels[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Handle Password Change ────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError("Current password is incorrect.");
        setPasswordLoading(false);
        return;
      }

      const result = await updatePassword(newPassword);
      
      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setPasswordError("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength({ score: 0, label: "Weak", color: "red", checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } });

        setSecurity(prev => ({
          ...prev,
          passwordLastChanged: new Date().toLocaleString()
        }));

        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordSuccess(false);
        }, 3000);
      }
    } catch (error) {
      setPasswordError(error.message || "Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Load settings from Supabase
  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
      }

      if (data) {
        setProfile({
          fullName: data.full_name || user?.user_metadata?.full_name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          avatar: data.avatar || null
        });

        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }

        setNotifications(data.notifications || {
          emailNotifications: true,
          pushNotifications: true,
          studyReminders: true,
          weeklyReports: true,
          newFeatures: true,
          marketingEmails: false,
          quizReminders: true,
          flashcardReminders: false
        });

        setAppearance(data.appearance || {
          theme: "light",
          fontSize: "medium",
          compactMode: false,
          animations: true,
          accentColor: "amber",
          sidebarStyle: "modern"
        });

        setPrivacy(data.privacy || {
          profileVisibility: "public",
          showActivity: true,
          showProgress: true,
          dataSharing: false,
          cookies: true
        });

        setSecurity(data.security || {
          twoFactorAuth: false,
          sessionTimeout: "30",
          loginAlerts: true,
          deviceManagement: true,
          passwordLastChanged: data.password_last_changed || "Not set"
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Passkey Handlers ──────────────────────────────────────────────

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('⚠️ Please sign in first before registering a passkey.');
        return;
      }

      const result = await registerPasskey();
      if (result.error) {
        setPasskeyError(result.error);
        alert(`❌ ${result.error}`);
      } else {
        alert('✅ Passkey registered successfully!');
      }
    } catch (err) {
      setPasskeyError(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSignInWithPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    try {
      const result = await signInWithPasskey();
      if (result.error) {
        setPasskeyError(result.error);
        alert(`❌ ${result.error}`);
      } else {
        alert(`✅ Welcome ${result.data.user.email}!`);
      }
    } catch (err) {
      setPasskeyError(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeletePasskey = async (passkeyId) => {
    if (!window.confirm('Are you sure you want to delete this passkey?')) return;
    
    setPasskeyLoading(true);
    try {
      const result = await deletePasskey(passkeyId);
      if (result.error) {
        alert(`❌ ${result.error}`);
      } else {
        alert('✅ Passkey deleted successfully!');
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setPasskeyLoading(false);
    }
  };

  // ─── Avatar Upload Functions ─────────────────────────────────────────

  const uploadAvatar = async (file) => {
    if (!file) return null;

    setUploading(true);
    try {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB.');
        return null;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image (JPEG, PNG, GIF, or WebP).');
        return null;
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${timestamp}_${random}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('profile-pics')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert(`Error: ${error.message || 'Unknown error occurred'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      setProfile({ ...profile, avatar: avatarUrl });
    } else {
      setAvatarPreview(null);
      e.target.value = '';
    }
  };

  const removeAvatar = async () => {
    setAvatarPreview(null);
    setProfile({ ...profile, avatar: null });
  };

  // ─── Save Settings ──────────────────────────────────────────────────

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const settingsData = {
        user_id: user.id,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone || null,
        bio: profile.bio || null,
        location: profile.location || null,
        website: profile.website || null,
        avatar: profile.avatar || null,
        notifications: notifications,
        appearance: appearance,
        privacy: privacy,
        security: security,
        updated_at: new Date().toISOString()
      };

      const { data: existingData, error: checkError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing settings:', checkError);
        throw new Error(checkError.message);
      }

      let result;
      if (existingData) {
        result = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_settings')
          .insert([settingsData]);
      }

      if (result.error) {
        console.error('❌ Save error:', result.error);
        throw new Error(result.error.message);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setSaveError(error.message || 'Failed to save settings');
      alert(`Error saving settings: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-3 sm:mb-4"
          >
            <FaArrowLeft className="text-[10px] sm:text-xs" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500">
              <FaCog className="text-xl sm:text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 dark:text-white">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5 sm:mt-1">
                Manage your account preferences and settings
              </p>
            </div>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar Tabs - Mobile Dropdown */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 p-2 sm:p-3 sticky top-24">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 font-medium text-sm"
              >
                <span className="flex items-center gap-2">
                  {tabs.find(t => t.id === activeTab)?.icon && (
                    <span className="text-amber-500">{React.createElement(tabs.find(t => t.id === activeTab)?.icon || FaUser)}</span>
                  )}
                  {tabs.find(t => t.id === activeTab)?.label || "Profile"}
                </span>
                <FaChevronDown className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Dropdown */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="lg:hidden mt-2 space-y-1"
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-400"
                              : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                          }`}
                        >
                          <Icon className={`text-sm sm:text-base ${isActive ? 'text-amber-500' : ''}`} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop Tabs */}
              <div className="hidden lg:block space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-400"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-amber-600 dark:hover:text-amber-400"
                      }`}
                    >
                      <Icon className={`text-sm sm:text-base ${isActive ? 'text-amber-500' : ''}`} />
                      {tab.label}
                      {isActive && (
                        <span className="ml-auto w-1 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Save Button - Mobile */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <FaSpinner className="animate-spin text-sm sm:text-base" />
                  ) : (
                    <FaSave className="text-sm sm:text-base" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                {saveSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mt-2 flex items-center justify-center gap-1"
                  >
                    <FaCheckCircle className="text-xs sm:text-sm" /> Settings saved successfully!
                  </motion.p>
                )}
                {saveError && (
                  <p className="text-center text-red-600 dark:text-red-400 text-xs sm:text-sm mt-2">
                    ❌ {saveError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 lg:p-8"
            >
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 sm:gap-3">
                      <FaUserCircle className="text-amber-500 text-lg sm:text-xl" />
                      Profile Settings
                    </h2>

                    {/* Avatar Upload Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                      <div className="relative group shrink-0">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Profile"
                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-amber-300/20"
                          />
                        ) : (
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold ring-4 ring-amber-500/20">
                            {profile.fullName.charAt(0) || "U"}
                          </div>
                        )}
                        
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-white text-center"
                          >
                            <FaUpload className="text-xl sm:text-2xl mx-auto" />
                            <span className="text-[10px] sm:text-xs mt-1 block">Upload</span>
                          </button>
                        </div>
                        
                        {avatarPreview && (
                          <button
                            onClick={removeAvatar}
                            className="absolute -top-1 -right-1 p-1 sm:p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <FaTimes className="text-[10px] sm:text-xs" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-stone-900 dark:text-white text-sm sm:text-base">
                          {profile.fullName || "User"}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 break-all">
                          {profile.email}
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors disabled:opacity-50 flex items-center gap-1.5 sm:gap-2"
                          >
                            {uploading ? (
                              <>
                                <FaSpinner className="animate-spin text-xs sm:text-sm" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <FaUpload className="text-xs sm:text-sm" /> Change Avatar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm" />
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Phone
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm" />
                          <input
                            type="text"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows="3"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 sm:gap-3">
                      <FaBell className="text-amber-500 text-lg sm:text-xl" />
                      Notification Preferences
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(notifications).map(([key, value]) => {
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase());
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                            <div>
                              <p className="text-sm sm:text-base font-medium text-stone-900 dark:text-white">{label}</p>
                              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                                Receive notifications for {key}
                              </p>
                            </div>
                            <button
                              onClick={() => setNotifications({ ...notifications, [key]: !value })}
                              className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 shrink-0 ${
                                value ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                              }`}
                            >
                              <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white transition-transform duration-300 ${
                                value ? 'translate-x-5 sm:translate-x-6' : ''
                              }`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Appearance Tab */}
                {activeTab === "appearance" && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 sm:gap-3">
                      <FaPalette className="text-amber-500 text-lg sm:text-xl" />
                      Appearance Settings
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                      {/* Theme Selection */}
                      <div className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 sm:mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {[
                            { id: 'light', label: 'Light', icon: FaSun },
                            { id: 'dark', label: 'Dark', icon: FaMoon },
                            { id: 'system', label: 'System', icon: FaDesktop }
                          ].map((theme) => {
                            const Icon = theme.icon;
                            const isActive = appearance.theme === theme.id;
                            return (
                              <button
                                key={theme.id}
                                onClick={() => {
                                  setAppearance({ ...appearance, theme: theme.id });
                                  const root = document.documentElement;
                                  if (theme.id === 'dark') {
                                    root.classList.add('dark');
                                  } else if (theme.id === 'light') {
                                    root.classList.remove('dark');
                                  } else {
                                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    if (prefersDark) {
                                      root.classList.add('dark');
                                    } else {
                                      root.classList.remove('dark');
                                    }
                                  }
                                }}
                                className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${
                                  isActive
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg shadow-amber-500/20'
                                    : 'border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700'
                                }`}
                              >
                                <Icon className={`text-xl sm:text-2xl mx-auto ${isActive ? 'text-amber-500' : 'text-stone-500 dark:text-stone-400'}`} />
                                <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-600 dark:text-stone-400'}`}>
                                  {theme.label}
                                </p>
                                <div className="mt-1 sm:mt-2 flex justify-center gap-0.5 sm:gap-1">
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white border border-stone-200" />
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-stone-800" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-1.5 sm:mt-2 text-center">
                          {appearance.theme === 'system' ? 'Follows your system preference' : `${appearance.theme.charAt(0).toUpperCase() + appearance.theme.slice(1)} theme active`}
                        </p>
                      </div>

                      {/* Font Size */}
                      <div className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 sm:mb-3">
                          Font Size
                        </label>
                        <div className="flex gap-2 sm:gap-3">
                          {['small', 'medium', 'large'].map((size) => {
                            const isActive = appearance.fontSize === size;
                            const sizeClasses = {
                              small: "text-xs",
                              medium: "text-sm",
                              large: "text-lg"
                            };
                            return (
                              <button
                                key={size}
                                onClick={() => {
                                  setAppearance({ ...appearance, fontSize: size });
                                  document.documentElement.setAttribute('data-font-size', size);
                                }}
                                className={`flex-1 p-2 sm:p-3 rounded-xl border-2 transition-all ${
                                  isActive
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg shadow-amber-500/20'
                                    : 'border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700'
                                }`}
                              >
                                <FaFont className={`mx-auto ${size === 'small' ? 'text-xs sm:text-sm' : size === 'large' ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'} ${isActive ? 'text-amber-500' : 'text-stone-500 dark:text-stone-400'}`} />
                                <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 capitalize font-medium ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-600 dark:text-stone-400'}`}>
                                  {size}
                                </p>
                                <p className={`mt-0.5 sm:mt-1 text-stone-500 dark:text-stone-400 ${sizeClasses[size]}`}>
                                  Aa
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                        <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 sm:mb-3">
                          Accent Color
                        </label>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {[
                            { id: 'amber', color: '#f59e0b' },
                            { id: 'blue', color: '#3b82f6' },
                            { id: 'purple', color: '#8b5cf6' },
                            { id: 'green', color: '#22c55e' },
                            { id: 'red', color: '#ef4444' },
                            { id: 'pink', color: '#ec4899' },
                            { id: 'indigo', color: '#6366f1' }
                          ].map(({ id, color }) => {
                            const isActive = appearance.accentColor === id;
                            return (
                              <button
                                key={id}
                                onClick={() => {
                                  setAppearance({ ...appearance, accentColor: id });
                                  document.documentElement.setAttribute('data-accent', id);
                                }}
                                className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full transition-all ${
                                  isActive
                                    ? 'ring-2 ring-offset-2 ring-stone-400 dark:ring-stone-600 scale-110 shadow-lg'
                                    : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Compact Mode Toggle */}
                      <div className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-sm sm:text-base font-medium text-stone-900 dark:text-white">Compact Mode</p>
                            <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">Reduce spacing between elements</p>
                          </div>
                          <button
                            onClick={() => {
                              setAppearance({ ...appearance, compactMode: !appearance.compactMode });
                              if (!appearance.compactMode) {
                                document.documentElement.classList.add('compact');
                              } else {
                                document.documentElement.classList.remove('compact');
                              }
                            }}
                            className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 shrink-0 ${
                              appearance.compactMode ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                            }`}
                          >
                            <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white transition-transform duration-300 ${
                              appearance.compactMode ? 'translate-x-5 sm:translate-x-6' : ''
                            }`} />
                          </button>
                        </div>
                      </div>

                      {/* Animations Toggle */}
                      <div className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-sm sm:text-base font-medium text-stone-900 dark:text-white">Animations</p>
                            <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">Enable smooth animations and transitions</p>
                          </div>
                          <button
                            onClick={() => {
                              setAppearance({ ...appearance, animations: !appearance.animations });
                              if (!appearance.animations) {
                                document.documentElement.classList.add('reduce-motion');
                              } else {
                                document.documentElement.classList.remove('reduce-motion');
                              }
                            }}
                            className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 shrink-0 ${
                              appearance.animations ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                            }`}
                          >
                            <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white transition-transform duration-300 ${
                              appearance.animations ? 'translate-x-5 sm:translate-x-6' : ''
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 sm:gap-3">
                      <FaLock className="text-amber-500 text-lg sm:text-xl" />
                      Privacy Settings
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(privacy).map(([key, value]) => {
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase());
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                            <div>
                              <p className="text-sm sm:text-base font-medium text-stone-900 dark:text-white">{label}</p>
                              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                                {typeof value === 'boolean' 
                                  ? value ? 'Enabled' : 'Disabled'
                                  : value}
                              </p>
                            </div>
                            {typeof value === 'boolean' ? (
                              <button
                                onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                                className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 shrink-0 ${
                                  value ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                                }`}
                              >
                                <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white transition-transform duration-300 ${
                                  value ? 'translate-x-5 sm:translate-x-6' : ''
                                }`} />
                              </button>
                            ) : (
                              <select
                                value={value}
                                onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.value })}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                              >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="friends">Friends</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <FaShieldAlt className="text-amber-500 mt-0.5 text-sm sm:text-base" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">Privacy Tip</p>
                          <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400">
                            Keep your profile private if you want to limit visibility to only trusted users.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 sm:gap-3">
                      <FaShieldAlt className="text-amber-500 text-lg sm:text-xl" />
                      Security Settings
                    </h2>

                    {/* Password Change Section */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/30">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <FaLock className="text-2xl sm:text-3xl" />
                        </div>
                        <div className="flex-1 w-full">
                          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex flex-wrap items-center gap-2">
                            <FaKey className="text-blue-500 text-xs sm:text-sm" />
                            Change Password
                            {security.passwordLastChanged && security.passwordLastChanged !== "Not set" && (
                              <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-stone-400">
                                Last changed: {security.passwordLastChanged}
                              </span>
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5 sm:mt-1">
                            Keep your account secure by changing your password regularly.
                          </p>

                          <button
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="mt-2 sm:mt-3 px-4 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-xs sm:text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                          >
                            {showChangePassword ? "Cancel" : "Change Password"}
                          </button>

                          <AnimatePresence>
                            {showChangePassword && (
                              <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handlePasswordChange}
                                className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 overflow-hidden"
                              >
                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    Current Password
                                  </label>
                                  <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm" />
                                    <input
                                      type={showCurrentPassword ? 'text' : 'password'}
                                      value={currentPassword}
                                      onChange={(e) => setCurrentPassword(e.target.value)}
                                      placeholder="Enter current password"
                                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                                    >
                                      {showCurrentPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    New Password
                                  </label>
                                  <div className="relative">
                                    <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm" />
                                    <input
                                      type={showNewPassword ? 'text' : 'password'}
                                      value={newPassword}
                                      onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        checkPasswordStrength(e.target.value);
                                      }}
                                      placeholder="Enter new password"
                                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                                    >
                                      {showNewPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                                    </button>
                                  </div>
                                  {newPassword && <PasswordStrengthIndicator />}
                                </div>

                                <div>
                                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    Confirm New Password
                                  </label>
                                  <div className="relative">
                                    <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs sm:text-sm" />
                                    <input
                                      type={showConfirmPassword ? 'text' : 'password'}
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      placeholder="Confirm new password"
                                      className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                                    >
                                      {showConfirmPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                                    </button>
                                  </div>
                                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-[10px] sm:text-xs text-red-500 mt-1">⚠️ Passwords do not match</p>
                                  )}
                                </div>

                                <AnimatePresence>
                                  {passwordError && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="p-2 sm:p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2"
                                    >
                                      <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
                                      <span>{passwordError}</span>
                                    </motion.div>
                                  )}
                                  {passwordSuccess && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-start gap-2"
                                    >
                                      <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
                                      <span>✅ Password changed successfully!</span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                                  <button
                                    type="submit"
                                    disabled={passwordLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs sm:text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    {passwordLoading ? (
                                      <>
                                        <FaSpinner className="animate-spin text-xs sm:text-sm" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <FaSave className="text-xs sm:text-sm" />
                                        Update Password
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowChangePassword(false);
                                      setCurrentPassword("");
                                      setNewPassword("");
                                      setConfirmPassword("");
                                      setPasswordError("");
                                      setPasswordSuccess(false);
                                    }}
                                    className="w-full sm:px-6 py-2 sm:py-2.5 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-semibold text-xs sm:text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Passkey Authentication Section */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800/30">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <FaFingerprint className="text-2xl sm:text-3xl" />
                        </div>
                        <div className="flex-1 w-full">
                          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex flex-wrap items-center gap-2">
                            <FaKey className="text-purple-500 text-xs sm:text-sm" />
                            Passkey Authentication
                            {!isPasskeySupported() && (
                              <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                Not Supported
                              </span>
                            )}
                            {passkeys && passkeys.length > 0 && (
                              <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                {passkeys.length} Active
                              </span>
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5 sm:mt-1">
                            Sign in securely using Face ID, Fingerprint, or PIN. 
                            Passkeys are more secure than passwords and phishing-resistant.
                          </p>

                          {!isPasskeySupported() && (
                            <div className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/30">
                              <div className="flex items-start gap-2">
                                <FaInfoCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 text-xs sm:text-sm" />
                                <p className="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400">
                                  Passkeys are not supported on this device or browser. 
                                  Please use a supported browser like Chrome, Safari, or Edge.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                            <button
                              onClick={handleRegisterPasskey}
                              disabled={!isPasskeySupported() || passkeyLoading}
                              className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-xs sm:text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
                            >
                              {passkeyLoading ? (
                                <FaSpinner className="animate-spin text-xs sm:text-sm" />
                              ) : (
                                <FaPlus className="text-xs sm:text-sm" />
                              )}
                              {passkeyLoading ? "Processing..." : "Register New Passkey"}
                            </button>

                            {passkeys && passkeys.length > 0 && (
                              <button
                                onClick={() => window.open('https://accounts.google.com/signin/v2/passkeys', '_blank')}
                                className="px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-semibold text-xs sm:text-sm hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all flex items-center gap-1.5 sm:gap-2"
                              >
                                <FaEye className="text-xs sm:text-sm" />
                                Manage Passkeys
                              </button>
                            )}
                          </div>

                          {passkeys && passkeys.length > 0 && (
                            <div className="mt-3 sm:mt-4 space-y-2">
                              <p className="text-[10px] sm:text-xs font-medium text-stone-600 dark:text-stone-400">
                                Registered Passkeys:
                              </p>
                              {passkeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                      <FaKey className="text-[10px] sm:text-sm" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs sm:text-sm font-medium text-stone-900 dark:text-white truncate">
                                        {key.friendlyName || `Passkey ${key.id.slice(0, 8)}`}
                                      </p>
                                      <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                                        Added {new Date(key.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeletePasskey(key.id)}
                                    disabled={passkeyLoading}
                                    className="p-1 sm:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all disabled:opacity-50 shrink-0"
                                  >
                                    <FaTrash className="text-xs sm:text-sm" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30">
                            <p className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5 sm:gap-2">
                              <FaInfoCircle className="text-xs sm:text-sm" />
                              Passkeys are stored securely on your device and never shared with us.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Existing Security Settings */}
                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(security).map(([key, value]) => {
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase());
                        const isToggle = typeof value === 'boolean';
                        const isSelect = key === 'sessionTimeout';
                        const isText = key === 'passwordLastChanged';

                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                            <div>
                              <p className="text-sm sm:text-base font-medium text-stone-900 dark:text-white">{label}</p>
                              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                                {isText ? `Last changed: ${value}` : value ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                            {isToggle ? (
                              <button
                                onClick={() => setSecurity({ ...security, [key]: !value })}
                                className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 shrink-0 ${
                                  value ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                                }`}
                              >
                                <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white transition-transform duration-300 ${
                                  value ? 'translate-x-5 sm:translate-x-6' : ''
                                }`} />
                              </button>
                            ) : isSelect ? (
                              <select
                                value={value}
                                onChange={(e) => setSecurity({ ...security, [key]: e.target.value })}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                              >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                              </select>
                            ) : (
                              <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">{value}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <FaShieldAlt className="text-red-500 mt-0.5 text-sm sm:text-base" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">Security Tip</p>
                          <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-400">
                            Use a strong, unique password and enable two-factor authentication for extra security.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;