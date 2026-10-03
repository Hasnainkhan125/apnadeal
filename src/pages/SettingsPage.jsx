// pages/SettingsPage.jsx — Modern Settings (CSS-variable theme + real-time sync)
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaBell,
  FaLock,
  FaPalette,
  FaMoon,
  FaCrown,
  FaStar,
  FaClock,
  FaList,
  FaSun,
  FaSave,
  FaSpinner,
  FaCheckCircle,
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
  FaChevronDown,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";   // ⭐ NEW
import { supabase } from "../lib/supabase";

/* ═══════════════════════════════════════════════════════════════
   SETTINGS — THEME TOKENS (CSS variables)
   ═══════════════════════════════════════════════════════════════ */
const SettingsStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

    /* ── DARK THEME ─────────────────────────────────────────── */
    .theme-dark {
      --st-bg-1:           #0A0A12;
      --st-bg-2:           #0F0F1A;
      --st-panel:          rgba(255,255,255,0.045);
      --st-panel-2:        rgba(255,255,255,0.02);
      --st-line:           rgba(255,255,255,0.08);
      --st-line-str:       rgba(255,255,255,0.15);
      --st-txt:            #FFFFFF;
      --st-txt-soft:       rgba(255,255,255,0.65);
      --st-txt-faint:      rgba(255,255,255,0.45);
      --st-dot:            rgba(255,255,255,0.06);
      --st-primary:        #eb7d34;
      --st-primary-2:      #f59e0b;
      --st-primary-3:      #c8631f;
      --st-primary-soft:   rgba(235,125,52,0.14);
      --st-primary-glow:   rgba(235,125,52,0.45);
      --st-danger:         #E2795F;
      --st-danger-soft:    rgba(226,121,95,0.14);
      --st-success:        #3fa77f;
      --st-success-soft:   rgba(63,167,127,0.10);
    }

    /* ── LIGHT THEME ────────────────────────────────────────── */
    .theme-light {
      --st-bg-1:           #FFFFFF;
      --st-bg-2:           #FAF7F3;
      --st-panel:          rgba(255,255,255,0.85);
      --st-panel-2:        rgba(255,255,255,0.95);
      --st-line:           rgba(20,20,30,0.08);
      --st-line-str:       rgba(20,20,30,0.15);
      --st-txt:            #1A1613;
      --st-txt-soft:       rgba(26,22,19,0.62);
      --st-txt-faint:      rgba(26,22,19,0.42);
      --st-dot:            rgba(20,20,30,0.08);
      --st-primary:        #c8631f;
      --st-primary-2:      #eb7d34;
      --st-primary-3:      #f59e0b;
      --st-primary-soft:   rgba(200,99,31,0.10);
      --st-primary-glow:   rgba(200,99,31,0.35);
      --st-danger:         #B23A2E;
      --st-danger-soft:    rgba(178,58,46,0.10);
      --st-success:        #164B3B;
      --st-success-soft:   rgba(22,75,59,0.08);
    }

    /* ── Reusable utilities ─────────────────────────────────── */
    .st-bg {
      background:
        radial-gradient(1200px 600px at 15% -10%, var(--st-primary-soft), transparent 60%),
        linear-gradient(180deg, var(--st-bg-1) 0%, var(--st-bg-2) 100%);
      color: var(--st-txt);
      transition: background 0.35s ease, color 0.35s ease;
    }
    .st-panel {
      background: var(--st-panel);
      border: 1px solid var(--st-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .st-panel-solid {
      background: var(--st-bg-1);
      border: 1px solid var(--st-line);
      transition: background 0.35s ease, border-color 0.35s ease;
    }
    .st-input {
      background: var(--st-bg-1);
      border: 1px solid var(--st-line-str);
      color: var(--st-txt);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .st-input:focus {
      border-color: var(--st-primary);
      outline: none;
      box-shadow: 0 0 0 2px var(--st-primary-soft);
    }
    .st-hover:hover { background: var(--st-panel); }
  `}</style>
);

const SettingsPage = () => {
  const { user, passkeys, registerPasskey, deletePasskey, isPasskeySupported, updatePassword, isPremium } = useAuth();
  // ⭐ NEW — hook into global real-time profile context
  const { broadcastRefresh, updateProfile } = useProfile();

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [premiumSince, setPremiumSince] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const [myListingsCount, setMyListingsCount] = useState(0);
  const [mySoldCount, setMySoldCount] = useState(0);

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
    score: 0, label: "Weak", color: "red",
    checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
  });

  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "", location: "", avatar: null,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true, pushNotifications: true, studyReminders: true,
    weeklyReports: true, newFeatures: true, marketingEmails: false,
    quizReminders: true, flashcardReminders: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "light", fontSize: "medium", compactMode: false, animations: true,
    accentColor: "amber", sidebarStyle: "modern",
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public", showActivity: true, showProgress: true,
    dataSharing: false, cookies: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false, sessionTimeout: "30", loginAlerts: true,
    deviceManagement: true, passwordLastChanged: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "appearance", label: "Appearance", icon: FaPalette },
    { id: "privacy", label: "Privacy", icon: FaLock },
    { id: "security", label: "Security", icon: FaShieldAlt },
  ];

  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("users")
          .select("is_premium, premium_since")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (data?.is_premium === true) {
          setIsPremiumUser(true);
          setPremiumSince(data.premium_since);
        } else {
          setIsPremiumUser(!!(isPremium && isPremium()));
        }

        setIsVerified(!!user.email_confirmed_at);
      } catch {
        if (!cancelled) setIsPremiumUser(!!(isPremium && isPremium()));
      }
    };
    loadStatus();
    return () => { cancelled = true; };
  }, [user, isPremium]);

  useEffect(() => {
    let cancelled = false;
    const loadListingStats = async () => {
      if (!user) return;
      try {
        const { count: activeCount } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "active");

        const { count: soldCount } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "sold");

        if (cancelled) return;
        setMyListingsCount(activeCount || 0);
        setMySoldCount(soldCount || 0);
      } catch (err) {
        console.error("Failed to load listing stats:", err);
      }
    };
    loadListingStats();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("my-listings-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings", filter: `user_id=eq.${user.id}` },
        async () => {
          const { count: activeCount } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "active");

          const { count: soldCount } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "sold");

          setMyListingsCount(activeCount || 0);
          setMySoldCount(soldCount || 0);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  /* ═══ Apply appearance — now also sets theme-dark / theme-light ═══ */
  useEffect(() => {
    const applyAppearance = () => {
      const root = document.documentElement;

      // Dark/light/system
      root.classList.remove("theme-dark", "theme-light", "dark");
      if (appearance.theme === "dark") {
        root.classList.add("theme-dark", "dark");
      } else if (appearance.theme === "light") {
        root.classList.add("theme-light");
      } else if (appearance.theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) root.classList.add("theme-dark", "dark");
        else root.classList.add("theme-light");
      }

      root.setAttribute("data-accent", appearance.accentColor);
      root.setAttribute("data-font-size", appearance.fontSize);
      if (appearance.compactMode) root.classList.add("compact");
      else root.classList.remove("compact");
      if (!appearance.animations) root.classList.add("reduce-motion");
      else root.classList.remove("reduce-motion");

      // Persist theme key so App.jsx boot effect stays in sync
      try {
        localStorage.setItem("theme", appearance.theme === "light" ? "light" : "dark");
      } catch {}
    };
    applyAppearance();
  }, [appearance.theme, appearance.accentColor, appearance.fontSize, appearance.compactMode, appearance.animations]);

  useEffect(() => {
    if (appearance.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const root = document.documentElement;
        root.classList.remove("theme-dark", "theme-light", "dark");
        if (mediaQuery.matches) root.classList.add("theme-dark", "dark");
        else root.classList.add("theme-light");
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [appearance.theme]);

  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const passedCount = Object.values(checks).filter(Boolean).length;
    let label = "Weak", color = "red";
    if (passedCount === 3) { label = "Fair"; color = "orange"; }
    else if (passedCount === 4) { label = "Good"; color = "green"; }
    else if (passedCount === 5) { label = "Strong"; color = "emerald"; }
    setPasswordStrength({ score: passedCount, label, color, checks });
  };

  const PasswordStrengthIndicator = () => {
    const { score, label, color, checks } = passwordStrength;
    const percentage = (score / 5) * 100;

    const barColor =
      color === "red" ? "var(--st-danger)"
      : color === "orange" ? "var(--st-primary)"
      : "var(--st-success)";
    const textColor = barColor;

    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-ticket-body text-xs font-bold" style={{ color: "var(--st-txt-soft)" }}>
            Password Strength: <span style={{ color: textColor }} className="font-bold">{label}</span>
          </span>
          <span className="font-ticket-body text-xs" style={{ color: "var(--st-txt-soft)" }}>{score}/5</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--st-line)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: barColor }} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(checks).map(([key, passed]) => {
            const labels = {
              length: "8+ characters", uppercase: "Uppercase", lowercase: "Lowercase",
              number: "Number", special: "Special char",
            };
            return (
              <div key={key} className="flex items-center gap-1">
                {passed ? (
                  <FaCheck className="text-[10px]" style={{ color: "var(--st-success)" }} />
                ) : (
                  <FaTimes className="text-[10px]" style={{ color: "var(--st-danger)" }} />
                )}
                <span
                  className="font-ticket-body text-[10px]"
                  style={{ color: passed ? "var(--st-success)" : "var(--st-txt-soft)" }}
                >
                  {labels[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword) return setPasswordError("Please enter your current password.");
    if (!newPassword) return setPasswordError("Please enter a new password.");
    if (newPassword.length < 8) return setPasswordError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match.");
    if (newPassword === currentPassword) return setPasswordError("New password must be different from current password.");

    setPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email, password: currentPassword,
      });
      if (signInError) { setPasswordError("Current password is incorrect."); setPasswordLoading(false); return; }

      const result = await updatePassword(newPassword);
      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        setPasswordStrength({ score: 0, label: "Weak", color: "red", checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } });
        setSecurity((prev) => ({ ...prev, passwordLastChanged: new Date().toLocaleString() }));
        setTimeout(() => { setShowChangePassword(false); setPasswordSuccess(false); }, 3000);
      }
    } catch (error) {
      setPasswordError(error.message || "Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") console.error("Error loading settings:", error);

      if (data) {
        setProfile({
          fullName: data.full_name || user?.user_metadata?.full_name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          location: data.location || "",
          avatar: data.avatar || null,
        });
        if (data.avatar) setAvatarPreview(data.avatar);

        setNotifications({ emailNotifications: true, pushNotifications: true, studyReminders: true, weeklyReports: true, newFeatures: true, marketingEmails: false, quizReminders: true, flashcardReminders: false, ...(data.notifications || {}) });
        setAppearance({ theme: "light", fontSize: "medium", compactMode: false, animations: true, accentColor: "amber", sidebarStyle: "modern", ...(data.appearance || {}) });
        setPrivacy({ profileVisibility: "public", showActivity: true, showProgress: true, dataSharing: false, cookies: true, ...(data.privacy || {}) });
        setSecurity({ twoFactorAuth: false, sessionTimeout: "30", loginAlerts: true, deviceManagement: true, passwordLastChanged: data.password_last_changed || "Not set", ...(data.security || {}) });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("⚠️ Please sign in first before registering a passkey.");
      const result = await registerPasskey();
      if (result.error) alert(`❌ ${result.error}`);
      else alert("✅ Passkey registered successfully!");
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally { setPasskeyLoading(false); }
  };

  const handleDeletePasskey = async (passkeyId) => {
    if (!window.confirm("Are you sure you want to delete this passkey?")) return;
    setPasskeyLoading(true);
    try {
      const result = await deletePasskey(passkeyId);
      if (result.error) alert(`❌ ${result.error}`);
      else alert("✅ Passkey deleted successfully!");
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally { setPasskeyLoading(false); }
  };

  const uploadAvatar = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      if (file.size > 5 * 1024 * 1024) { alert("Image must be less than 5MB."); return null; }
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) { alert("Please select a valid image (JPEG, PNG, GIF, or WebP)."); return null; }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${timestamp}_${random}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pics")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) { console.error("❌ Upload error:", uploadError); alert(`Upload failed: ${uploadError.message}`); return null; }

      const { data: urlData } = supabase.storage.from("profile-pics").getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      alert(`Error: ${error.message || "Unknown error occurred"}`);
      return null;
    } finally { setUploading(false); }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); e.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be less than 5MB."); e.target.value = ""; return; }

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) setProfile({ ...profile, avatar: avatarUrl });
    else { setAvatarPreview(null); e.target.value = ""; }
  };

  const removeAvatar = async () => {
    setAvatarPreview(null);
    setProfile({ ...profile, avatar: null });
  };

  /* ⭐ SAVE — now syncs user_settings + users + profiles and broadcasts refresh */
  const handleSaveSettings = async () => {
    setIsSaving(true); setSaveSuccess(false); setSaveError(null);
    try {
      const settingsData = {
        user_id: user.id,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone || null,
        location: profile.location || null,
        avatar: profile.avatar || null,
        notifications, appearance, privacy, security,
        updated_at: new Date().toISOString(),
      };

      const { data: existingData, error: checkError } = await supabase
        .from("user_settings").select("id").eq("user_id", user.id).maybeSingle();

      if (checkError && checkError.code !== "PGRST116") throw new Error(checkError.message);

      let result;
      if (existingData) {
        result = await supabase.from("user_settings").update(settingsData).eq("user_id", user.id);
      } else {
        result = await supabase.from("user_settings").insert([settingsData]);
      }
      if (result.error) throw new Error(result.error.message);

      // ⭐ ALSO write to users + profiles so every page (feed/chat/groups) reads the same data
      await Promise.all([
        supabase
          .from("users")
          .update({
            full_name: profile.fullName,
            name: profile.fullName,
            avatar_url: profile.avatar || null,
          })
          .eq("id", user.id),
        supabase
          .from("profiles")
          .update({
            full_name: profile.fullName,
            avatar_url: profile.avatar || null,
          })
          .eq("id", user.id),
      ]);

      // ⭐ Push instantly to global context (no wait for realtime)
      updateProfile({
        fullName: profile.fullName,
        avatar: profile.avatar,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
      });

      // ⭐ Broadcast to all tabs + reload from DB
      broadcastRefresh();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      setSaveError(error.message || "Failed to save settings");
      alert(`Error saving settings: ${error.message || "Please try again."}`);
    } finally { setIsSaving(false); }
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen st-bg flex items-center justify-center relative">
        <SettingsStyles />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(var(--st-primary) 0.6px, transparent 0.6px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative text-center">
          <FaSpinner className="text-4xl animate-spin mx-auto mb-4" style={{ color: "var(--st-primary-2)" }} />
          <p className="font-ticket-body text-sm" style={{ color: "var(--st-txt-soft)" }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen st-bg relative overflow-x-hidden">
      <SettingsStyles />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(var(--st-primary) 0.6px, transparent 0.6px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-2 lg:px-4 pt-10 pb-10 sm:pt-14 sm:pb-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 font-ticket-body text-xs sm:text-sm transition-colors mb-4"
            style={{ color: "var(--st-txt-soft)" }}
          >
            <FaArrowLeft className="text-[10px] sm:text-xs" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 rounded-2xl flex items-center justify-center"
              style={{ border: "1px solid var(--st-primary)", background: "var(--st-primary-soft)" }}
            >
              <FaCog className="text-lg sm:text-2xl" style={{ color: "var(--st-primary-2)" }} />
            </div>
            <div>
              <h1
                className="font-ticket-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                style={{ color: "var(--st-txt)" }}
              >
                Settings
              </h1>
              <p className="font-ticket-body text-xs sm:text-sm mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
                Manage your account preferences and settings
              </p>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-[22px] st-panel-solid p-3 sticky top-24">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-2xl st-input font-ticket-body text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  {React.createElement(tabs.find((t) => t.id === activeTab)?.icon || FaUser, {
                    className: "text-sm",
                    style: { color: "var(--st-primary-2)" },
                  })}
                  {tabs.find((t) => t.id === activeTab)?.label || "Profile"}
                </span>
                <FaChevronDown
                  className={`text-xs transition-transform duration-300 ${mobileMenuOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--st-txt-soft)" }}
                />
              </button>

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
                          onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-ticket-body text-sm font-bold transition-all"
                          style={
                            isActive
                              ? { background: "var(--st-primary)", color: "#fff" }
                              : { color: "var(--st-txt)" }
                          }
                        >
                          <Icon
                            className="text-sm"
                            style={{ color: isActive ? "#fff" : "var(--st-primary-2)" }}
                          />
                          {tab.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="hidden lg:block space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-ticket-body text-sm font-bold transition-all st-hover"
                      style={
                        isActive
                          ? { background: "var(--st-primary)", color: "#fff" }
                          : { color: "var(--st-txt)" }
                      }
                    >
                      <Icon
                        className="text-sm"
                        style={{ color: isActive ? "#fff" : "var(--st-primary-2)" }}
                      />
                      {tab.label}
                      {isActive && <span className="ml-auto w-1.5 h-6 rounded-full bg-white/20" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="group/save relative w-full py-3 rounded-2xl overflow-hidden text-white font-ticket-body font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "var(--st-primary)" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-700" />
                  {isSaving ? <FaSpinner className="animate-spin text-sm relative z-10" /> : <FaSave className="text-sm relative z-10" />}
                  <span className="relative z-10">{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
                {saveSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center font-ticket-body text-xs font-bold mt-2 flex items-center justify-center gap-1"
                    style={{ color: "var(--st-success)" }}
                  >
                    <FaCheckCircle className="text-xs" /> Settings saved!
                  </motion.p>
                )}
                {saveError && (
                  <p className="text-center font-ticket-body text-xs font-bold mt-2" style={{ color: "var(--st-danger)" }}>
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
              className="rounded-[22px] st-panel-solid p-2 sm:p-7 lg:p-8"
            >
              <AnimatePresence mode="wait">
                {/* ─── PROFILE ─── */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* PROFILE HERO CARD */}
                    <div className="relative overflow-hidden rounded-[24px] st-panel-solid p-3 sm:p-7">
                      <div
                        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-25"
                        style={{ background: "var(--st-primary)" }}
                      />

                      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                        <div className="relative group shrink-0">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Profile"
                              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover"
                              style={{ border: "2px solid var(--st-primary)" }}
                            />
                          ) : (
                            <div
                              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full flex items-center justify-center font-ticket-display text-4xl sm:text-5xl font-bold"
                              style={{
                                border: "2px solid var(--st-primary)",
                                background: "var(--st-primary-soft)",
                                color: "var(--st-primary-2)",
                              }}
                            >
                              {(profile.fullName || user?.email || "U").charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div
                            className="absolute -bottom-1 -right-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center"
                            style={{
                              background: "var(--st-success)",
                              border: "3px solid var(--st-bg-1)",
                            }}
                          >
                            <FaCheck className="text-white text-xs sm:text-sm" />
                          </div>

                          <div
                            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FaUpload className="text-white text-xl" />
                          </div>
                        </div>

                        <div className="flex-1 text-center sm:text-left min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3
                              className="font-ticket-display text-xl sm:text-2xl font-bold truncate"
                              style={{ color: "var(--st-txt)" }}
                            >
                              {profile.fullName || "Unnamed User"}
                            </h3>

                            {isPremiumUser ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -12, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 240, damping: 14 }}
                                className="relative inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full overflow-hidden self-center sm:self-auto"
                                style={{
                                  background: "linear-gradient(135deg, var(--st-primary-2) 0%, var(--st-primary-3) 50%, var(--st-primary-2) 100%)",
                                }}
                              >
                                <motion.span
                                  animate={{ x: ["-150%", "250%"] }}
                                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
                                  className="absolute inset-y-0 w-1/2 pointer-events-none"
                                  style={{
                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                                    filter: "blur(2px)",
                                  }}
                                />
                                <FaCrown className="relative text-white text-[10px]" />
                                <span className="relative font-ticket-body text-[10px] font-black uppercase tracking-wider text-white">Premium</span>
                                <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
                                <span className="relative font-ticket-body text-[9px] font-bold uppercase tracking-wider text-white/80">Member</span>
                              </motion.div>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-ticket-body text-[10px] font-bold uppercase tracking-wider self-center sm:self-auto"
                                style={{ background: "var(--st-panel)", color: "var(--st-txt-soft)" }}
                              >
                                <FaCrown className="text-[8px]" />
                                Free
                              </span>
                            )}
                          </div>

                          <p className="font-ticket-body text-xs sm:text-sm break-all mb-1" style={{ color: "var(--st-txt-soft)" }}>
                            {profile.email || user?.email || "no-email@example.com"}
                          </p>

                          {isPremiumUser && premiumSince && (
                            <p className="font-ticket-body text-[10px] font-semibold mb-2" style={{ color: "var(--st-primary-2)" }}>
                              ✦ Premium since {new Date(premiumSince).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                            {isVerified && (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-ticket-body text-[10px] font-bold"
                                style={{
                                  border: "1px solid var(--st-success)",
                                  background: "var(--st-success-soft)",
                                  color: "var(--st-success)",
                                }}
                              >
                                <FaCheckCircle className="text-[9px]" /> Email Verified
                              </span>
                            )}
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-ticket-body text-[10px] font-bold"
                              style={{
                                border: "1px solid var(--st-success)",
                                background: "var(--st-success-soft)",
                                color: "var(--st-success)",
                              }}
                            >
                              <FaShieldAlt className="text-[9px]" /> ID Pending
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-ticket-body text-[10px] font-bold"
                              style={{
                                border: "1px solid var(--st-primary)",
                                background: "var(--st-primary-soft)",
                                color: "var(--st-primary-2)",
                              }}
                            >
                              <FaStar className="text-[9px]" /> New Seller
                            </span>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-ticket-body text-xs font-bold transition-colors disabled:opacity-50"
                              style={{ border: "1px solid var(--st-primary)", color: "var(--st-primary-2)" }}
                            >
                              {uploading ? (
                                <>
                                  <FaSpinner className="animate-spin text-xs" /> Uploading...
                                </>
                              ) : (
                                <>
                                  <FaUpload className="text-xs" /> Change Avatar
                                </>
                              )}
                            </button>
                            {avatarPreview && (
                              <button
                                onClick={removeAvatar}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-ticket-body text-xs font-bold transition-colors"
                                style={{ border: "1px solid var(--st-danger)", color: "var(--st-danger)" }}
                              >
                                <FaTrash className="text-xs" /> Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PROFILE COMPLETENESS */}
                      <div className="relative mt-6 pt-5 border-t border-dashed" style={{ borderColor: "var(--st-line-str)" }}>
                        {(() => {
                          const checks = [
                            !!profile.fullName,
                            !!profile.email,
                            !!profile.phone,
                            !!profile.location,
                            !!profile.avatar,
                          ];
                          const completed = checks.filter(Boolean).length;
                          const total = checks.length;
                          const percent = Math.round((completed / total) * 100);

                          const barColor =
                            percent >= 80 ? "var(--st-success)"
                            : percent >= 50 ? "var(--st-primary)"
                            : "var(--st-danger)";

                          return (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className="font-ticket-body text-[10px] font-bold uppercase tracking-widest"
                                  style={{ color: "var(--st-txt-soft)" }}
                                >
                                  Profile Completeness
                                </span>
                                <span className="font-ticket-display text-sm font-bold" style={{ color: "var(--st-txt)" }}>
                                  {completed}/{total} · {percent}%
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--st-line)" }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percent}%` }}
                                  transition={{ duration: 0.7, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ background: barColor }}
                                />
                              </div>
                              <p className="font-ticket-body text-[10px] mt-2" style={{ color: "var(--st-txt-soft)" }}>
                                {percent >= 80
                                  ? "🎉 Your profile is looking great!"
                                  : percent >= 50
                                  ? "Add a few more details to build trust with buyers."
                                  : "Complete your profile to build trust and boost visibility."}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* ACCOUNT STATS STRIP */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Member Since", value: memberSince, icon: FaClock },
                        { label: "Active Ads", value: myListingsCount, icon: FaList },
                        { label: "Total Sold", value: mySoldCount, icon: FaCheckCircle },
                        { label: "Rating", value: "—", icon: FaStar },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <div
                            key={s.label}
                            className="rounded-2xl st-panel-solid p-4 text-center"
                          >
                            <Icon className="text-base mx-auto mb-1.5" style={{ color: "var(--st-primary-2)" }} />
                            <p
                              className="font-ticket-display text-lg font-bold leading-none tabular-nums"
                              style={{ color: "var(--st-txt)" }}
                            >
                              {s.value}
                            </p>
                            <p className="font-ticket-body text-[10px] font-medium mt-1" style={{ color: "var(--st-txt-soft)" }}>
                              {s.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* CONTACT FIELDS */}
                    <div className="rounded-[22px] st-panel-solid p-1 sm:p-6">
                      <h3
                        className="font-ticket-display text-sm sm:text-base font-bold mb-4 flex items-center gap-2"
                        style={{ color: "var(--st-txt)" }}
                      >
                        <FaUserCircle className="text-sm" style={{ color: "var(--st-primary-2)" }} />
                        Contact Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "Full Name", key: "fullName", icon: FaUserCircle, type: "text" },
                          { label: "Email", key: "email", icon: FaEnvelope, type: "email" },
                          { label: "Phone", key: "phone", icon: FaPhone, type: "text" },
                          { label: "Location", key: "location", icon: null, type: "text" },
                        ].map((f) => {
                          const Icon = f.icon;
                          return (
                            <div key={f.key}>
                              <label
                                className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2"
                                style={{ color: "var(--st-txt-soft)" }}
                              >
                                {f.label}
                              </label>
                              <div className="relative">
                                {Icon && (
                                  <Icon
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                                    style={{ color: "var(--st-primary-2)" }}
                                  />
                                )}
                                <input
                                  type={f.type}
                                  value={profile[f.key]}
                                  onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                                  className={`font-ticket-body w-full ${
                                    Icon ? "pl-10" : "pl-4"
                                  } pr-4 py-3 rounded-xl text-sm st-input`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── NOTIFICATIONS ─── */}
                {activeTab === "notifications" && (
                  <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <h2
                      className="font-ticket-display text-lg sm:text-xl font-bold flex items-center gap-3"
                      style={{ color: "var(--st-txt)" }}
                    >
                      <FaBell className="text-lg sm:text-xl" style={{ color: "var(--st-primary-2)" }} />
                      Notification Preferences
                    </h2>

                    <div className="space-y-3">
                      {Object.entries(notifications).map(([key, value]) => {
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                        return (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl st-panel-solid"
                          >
                            <div>
                              <p className="font-ticket-display text-sm sm:text-base font-bold" style={{ color: "var(--st-txt)" }}>
                                {label}
                              </p>
                              <p className="font-ticket-body text-[11px] sm:text-xs mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
                                Receive notifications for {key}
                              </p>
                            </div>
                            <button
                              onClick={() => setNotifications({ ...notifications, [key]: !value })}
                              className="relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0"
                              style={{ background: value ? "var(--st-primary)" : "var(--st-line-str)" }}
                            >
                              <div
                                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                                  value ? "translate-x-6" : ""
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ─── APPEARANCE ─── */}
                {activeTab === "appearance" && (
                  <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <h2
                      className="font-ticket-display text-lg sm:text-xl font-bold flex items-center gap-3"
                      style={{ color: "var(--st-txt)" }}
                    >
                      <FaPalette className="text-lg sm:text-xl" style={{ color: "var(--st-primary-2)" }} />
                      Appearance Settings
                    </h2>

                    <div className="p-4 rounded-2xl st-panel-solid">
                      <label
                        className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                        style={{ color: "var(--st-txt-soft)" }}
                      >
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "light", label: "Light", icon: FaSun },
                          { id: "dark", label: "Dark", icon: FaMoon },
                          { id: "system", label: "System", icon: FaDesktop },
                        ].map((theme) => {
                          const Icon = theme.icon;
                          const isActive = appearance.theme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => {
                                setAppearance({ ...appearance, theme: theme.id });
                                const root = document.documentElement;
                                root.classList.remove("theme-dark", "theme-light", "dark");
                                if (theme.id === "dark") root.classList.add("theme-dark", "dark");
                                else if (theme.id === "light") root.classList.add("theme-light");
                                else {
                                  if (window.matchMedia("(prefers-color-scheme: dark)").matches)
                                    root.classList.add("theme-dark", "dark");
                                  else root.classList.add("theme-light");
                                }
                                try {
                                  localStorage.setItem("theme", theme.id === "light" ? "light" : "dark");
                                } catch {}
                              }}
                              className="p-3 rounded-2xl border transition-all"
                              style={
                                isActive
                                  ? { borderColor: "var(--st-primary)", background: "var(--st-primary-soft)" }
                                  : { borderColor: "var(--st-line)" }
                              }
                            >
                              <Icon
                                className="text-xl mx-auto"
                                style={{ color: isActive ? "var(--st-primary-2)" : "var(--st-txt-soft)" }}
                              />
                              <p
                                className="font-ticket-body text-xs mt-2 font-bold"
                                style={{ color: isActive ? "var(--st-primary-2)" : "var(--st-txt-soft)" }}
                              >
                                {theme.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                      <p className="font-ticket-body text-[11px] mt-3 text-center" style={{ color: "var(--st-txt-soft)" }}>
                        {appearance.theme === "system"
                          ? "Follows your system preference"
                          : `${(appearance.theme || "light").charAt(0).toUpperCase() + (appearance.theme || "light").slice(1)} theme active`}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl st-panel-solid">
                      <label
                        className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                        style={{ color: "var(--st-txt-soft)" }}
                      >
                        Font Size
                      </label>
                      <div className="flex gap-3">
                        {["small", "medium", "large"].map((size) => {
                          const isActive = appearance.fontSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => {
                                setAppearance({ ...appearance, fontSize: size });
                                document.documentElement.setAttribute("data-font-size", size);
                              }}
                              className="flex-1 p-3 rounded-2xl border transition-all"
                              style={
                                isActive
                                  ? { borderColor: "var(--st-primary)", background: "var(--st-primary-soft)" }
                                  : { borderColor: "var(--st-line)" }
                              }
                            >
                              <FaFont
                                className={`mx-auto ${
                                  size === "small" ? "text-sm" : size === "large" ? "text-2xl" : "text-base"
                                }`}
                                style={{ color: isActive ? "var(--st-primary-2)" : "var(--st-txt-soft)" }}
                              />
                              <p
                                className="font-ticket-body text-xs mt-1 capitalize font-bold"
                                style={{ color: isActive ? "var(--st-primary-2)" : "var(--st-txt-soft)" }}
                              >
                                {size}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl st-panel-solid">
                      <label
                        className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-3"
                        style={{ color: "var(--st-txt-soft)" }}
                      >
                        Accent Color
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: "amber", color: "#f59e0b" },
                          { id: "blue", color: "#3b82f6" },
                          { id: "purple", color: "#8b5cf6" },
                          { id: "green", color: "#22c55e" },
                          { id: "red", color: "#ef4444" },
                          { id: "pink", color: "#ec4899" },
                          { id: "indigo", color: "#6366f1" },
                        ].map(({ id, color }) => {
                          const isActive = appearance.accentColor === id;
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setAppearance({ ...appearance, accentColor: id });
                                document.documentElement.setAttribute("data-accent", id);
                              }}
                              className={`h-10 w-10 rounded-full transition-all ${
                                isActive ? "scale-110" : "hover:scale-110"
                              }`}
                              style={{
                                backgroundColor: color,
                                boxShadow: isActive ? "0 0 0 2px var(--st-bg-1), 0 0 0 4px var(--st-primary)" : undefined,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {[
                      { key: "compactMode", label: "Compact Mode", desc: "Reduce spacing between elements" },
                      { key: "animations", label: "Animations", desc: "Enable smooth animations and transitions" },
                    ].map(({ key, label, desc }) => {
                      const value = appearance[key];
                      return (
                        <div
                          key={key}
                          className="p-4 rounded-2xl st-panel-solid flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-ticket-display text-sm sm:text-base font-bold" style={{ color: "var(--st-txt)" }}>
                              {label}
                            </p>
                            <p className="font-ticket-body text-[11px] sm:text-xs mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
                              {desc}
                            </p>
                          </div>
                          <button
                            onClick={() => setAppearance({ ...appearance, [key]: !value })}
                            className="relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0"
                            style={{ background: value ? "var(--st-primary)" : "var(--st-line-str)" }}
                          >
                            <div
                              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                                value ? "translate-x-6" : ""
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {/* ─── PRIVACY ─── */}
                {activeTab === "privacy" && (
                  <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <h2
                      className="font-ticket-display text-lg sm:text-xl font-bold flex items-center gap-3"
                      style={{ color: "var(--st-txt)" }}
                    >
                      <FaLock className="text-lg sm:text-xl" style={{ color: "var(--st-primary-2)" }} />
                      Privacy Settings
                    </h2>

                    <div className="space-y-3">
                      {Object.entries(privacy).map(([key, value]) => {
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                        return (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl st-panel-solid"
                          >
                            <div>
                              <p className="font-ticket-display text-sm sm:text-base font-bold" style={{ color: "var(--st-txt)" }}>
                                {label}
                              </p>
                              <p className="font-ticket-body text-[11px] sm:text-xs mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
                                {typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value}
                              </p>
                            </div>
                            {typeof value === "boolean" ? (
                              <button
                                onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                                className="relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0"
                                style={{ background: value ? "var(--st-primary)" : "var(--st-line-str)" }}
                              >
                                <div
                                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                                    value ? "translate-x-6" : ""
                                  }`}
                                />
                              </button>
                            ) : (
                              <select
                                value={value}
                                onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.value })}
                                className="font-ticket-body px-3 py-2 rounded-xl text-xs font-bold st-input cursor-pointer"
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

                    <div
                      className="p-4 rounded-2xl"
                      style={{ background: "var(--st-primary-soft)", border: "1px solid var(--st-primary)" }}
                    >
                      <div className="flex items-start gap-3">
                        <FaShieldAlt className="mt-0.5 text-base flex-shrink-0" style={{ color: "var(--st-primary-2)" }} />
                        <div>
                          <p className="font-ticket-display text-sm font-bold" style={{ color: "var(--st-primary-2)" }}>
                            Privacy Tip
                          </p>
                          <p className="font-ticket-body text-xs mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
                            Keep your profile private if you want to limit visibility to only trusted users.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── SECURITY ─── */}
                {activeTab === "security" && (
                  <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <h2
                      className="font-ticket-display text-lg sm:text-xl font-bold flex items-center gap-3"
                      style={{ color: "var(--st-txt)" }}
                    >
                      <FaShieldAlt className="text-lg sm:text-xl" style={{ color: "var(--st-primary-2)" }} />
                      Security Settings
                    </h2>

                    <div className="p-5 rounded-[22px] st-panel-solid">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div
                          className="p-3 rounded-2xl"
                          style={{
                            border: "1px solid var(--st-primary)",
                            background: "var(--st-primary-soft)",
                          }}
                        >
                          <FaLock className="text-xl" style={{ color: "var(--st-primary-2)" }} />
                        </div>
                        <div className="flex-1 w-full">
                          <h3
                            className="font-ticket-display text-base sm:text-lg font-bold flex flex-wrap items-center gap-2"
                            style={{ color: "var(--st-txt)" }}
                          >
                            <FaKey className="text-xs" style={{ color: "var(--st-primary-2)" }} />
                            Change Password
                            {security.passwordLastChanged && security.passwordLastChanged !== "Not set" && (
                              <span className="font-ticket-body text-[10px] font-bold" style={{ color: "var(--st-txt-soft)" }}>
                                Last changed: {security.passwordLastChanged}
                              </span>
                            )}
                          </h3>
                          <p className="font-ticket-body text-xs sm:text-sm mt-1" style={{ color: "var(--st-txt-soft)" }}>
                            Keep your account secure by changing your password regularly.
                          </p>

                          <button
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="mt-3 px-5 py-2.5 rounded-2xl text-white font-ticket-body font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-95 transition-all"
                            style={{ background: "var(--st-primary)" }}
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
                                className="mt-4 space-y-4 overflow-hidden"
                              >
                                {[
                                  { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrentPassword, setShow: setShowCurrentPassword, icon: FaLock, placeholder: "Enter current password" },
                                  { label: "New Password", value: newPassword, set: (v) => { setNewPassword(v); checkPasswordStrength(v); }, show: showNewPassword, setShow: setShowNewPassword, icon: FaKey, placeholder: "Enter new password" },
                                  { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword, icon: FaKey, placeholder: "Confirm new password" },
                                ].map((f) => {
                                  const Icon = f.icon;
                                  return (
                                    <div key={f.label}>
                                      <label
                                        className="block font-ticket-body text-[10px] font-bold uppercase tracking-widest mb-2"
                                        style={{ color: "var(--st-txt-soft)" }}
                                      >
                                        {f.label}
                                      </label>
                                      <div className="relative">
                                        <Icon
                                          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs"
                                          style={{ color: "var(--st-primary-2)" }}
                                        />
                                        <input
                                          type={f.show ? "text" : "password"}
                                          value={f.value}
                                          onChange={(e) => f.set(e.target.value)}
                                          placeholder={f.placeholder}
                                          className="font-ticket-body w-full pl-10 pr-10 py-3 rounded-xl text-sm st-input"
                                          required
                                        />
                                        <button
                                          type="button"
                                          onClick={() => f.setShow(!f.show)}
                                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                          style={{ color: "var(--st-txt-soft)" }}
                                        >
                                          {f.show ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                        </button>
                                      </div>
                                      {f.label === "New Password" && newPassword && <PasswordStrengthIndicator />}
                                      {f.label === "Confirm New Password" && newPassword && confirmPassword && newPassword !== confirmPassword && (
                                        <p className="font-ticket-body text-[10px] mt-1 font-bold" style={{ color: "var(--st-danger)" }}>
                                          ⚠️ Passwords do not match
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}

                                <AnimatePresence>
                                  {passwordError && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="p-3 rounded-xl text-xs font-bold flex items-start gap-2"
                                      style={{ background: "var(--st-danger-soft)", border: "1px solid var(--st-danger)", color: "var(--st-danger)" }}
                                    >
                                      <FaExclamationTriangle className="mt-0.5 flex-shrink-0 text-xs" />
                                      <span>{passwordError}</span>
                                    </motion.div>
                                  )}
                                  {passwordSuccess && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="p-3 rounded-xl text-xs font-bold flex items-start gap-2"
                                      style={{ background: "var(--st-success-soft)", border: "1px solid var(--st-success)", color: "var(--st-success)" }}
                                    >
                                      <FaCheckCircle className="mt-0.5 flex-shrink-0 text-xs" />
                                      <span>✅ Password changed successfully!</span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                  <button
                                    type="submit"
                                    disabled={passwordLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                    className="flex-1 px-6 py-3 rounded-2xl text-white font-ticket-body font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                    style={{ background: "var(--st-primary)" }}
                                  >
                                    {passwordLoading ? (
                                      <><FaSpinner className="animate-spin text-xs" /> Updating...</>
                                    ) : (
                                      <><FaSave className="text-xs" /> Update Password</>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowChangePassword(false);
                                      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
                                      setPasswordError(""); setPasswordSuccess(false);
                                    }}
                                    className="sm:px-6 py-3 rounded-2xl font-ticket-body font-bold text-xs sm:text-sm transition-colors"
                                    style={{ border: "1px solid var(--st-line-str)", color: "var(--st-txt)" }}
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

                    <div className="p-5 rounded-[22px] st-panel-solid">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div
                          className="p-3 rounded-2xl"
                          style={{
                            border: "1px solid var(--st-primary)",
                            background: "var(--st-primary-soft)",
                          }}
                        >
                          <FaFingerprint className="text-xl" style={{ color: "var(--st-primary-2)" }} />
                        </div>
                        <div className="flex-1 w-full">
                          <h3
                            className="font-ticket-display text-base sm:text-lg font-bold flex flex-wrap items-center gap-2"
                            style={{ color: "var(--st-txt)" }}
                          >
                            <FaKey className="text-xs" style={{ color: "var(--st-primary-2)" }} />
                            Passkey Authentication
                            {!isPasskeySupported() && (
                              <span
                                className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: "var(--st-danger-soft)",
                                  color: "var(--st-danger)",
                                  border: "1px solid var(--st-danger)",
                                }}
                              >
                                Not Supported
                              </span>
                            )}
                            {passkeys && passkeys.length > 0 && (
                              <span
                                className="font-ticket-body text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: "var(--st-success-soft)",
                                  color: "var(--st-success)",
                                  border: "1px solid var(--st-success)",
                                }}
                              >
                                {passkeys.length} Active
                              </span>
                            )}
                          </h3>
                          <p className="font-ticket-body text-xs sm:text-sm mt-1" style={{ color: "var(--st-txt-soft)" }}>
                            Sign in securely using Face ID, Fingerprint, or PIN. Passkeys are more secure than passwords.
                          </p>

                          {!isPasskeySupported() && (
                            <div
                              className="mt-3 p-3 rounded-xl"
                              style={{ background: "var(--st-primary-soft)", border: "1px solid var(--st-primary)" }}
                            >
                              <p className="font-ticket-body text-xs flex items-start gap-2" style={{ color: "var(--st-primary-2)" }}>
                                <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                                Passkeys not supported on this device. Try Chrome, Safari, or Edge.
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 mt-4">
                            <button
                              onClick={handleRegisterPasskey}
                              disabled={!isPasskeySupported() || passkeyLoading}
                              className="px-4 py-2.5 rounded-2xl text-white font-ticket-body font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                              style={{ background: "var(--st-primary)" }}
                            >
                              {passkeyLoading ? <FaSpinner className="animate-spin text-xs" /> : <FaPlus className="text-xs" />}
                              {passkeyLoading ? "Processing..." : "Register New Passkey"}
                            </button>
                          </div>

                          {passkeys && passkeys.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p
                                className="font-ticket-body text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "var(--st-txt-soft)" }}
                              >
                                Registered Passkeys
                              </p>
                              {passkeys.map((key) => (
                                <div
                                  key={key.id}
                                  className="flex items-center justify-between p-3 rounded-2xl"
                                  style={{ background: "var(--st-panel)", border: "1px solid var(--st-line)" }}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                      style={{
                                        border: "1px solid var(--st-primary)",
                                        color: "var(--st-primary-2)",
                                      }}
                                    >
                                      <FaKey className="text-xs" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-ticket-body text-sm font-bold truncate" style={{ color: "var(--st-txt)" }}>
                                        {key.friendlyName || `Passkey ${key.id.slice(0, 8)}`}
                                      </p>
                                      <p className="font-ticket-body text-[10px]" style={{ color: "var(--st-txt-soft)" }}>
                                        Added {new Date(key.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeletePasskey(key.id)}
                                    disabled={passkeyLoading}
                                    className="p-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                                    style={{ color: "var(--st-danger)" }}
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(security).map(([key, value]) => {
                        if (key === "passwordLastChanged") return null;
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                        const isToggle = typeof value === "boolean";
                        const isSelect = key === "sessionTimeout";
                        return (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl st-panel-solid"
                          >
                            <div>
                              <p className="font-ticket-display text-sm sm:text-base font-bold" style={{ color: "var(--st-txt)" }}>
                                {label}
                              </p>
                              <p className="font-ticket-body text-[11px] sm:text-xs mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
                                {isToggle ? (value ? "Enabled" : "Disabled") : value}
                              </p>
                            </div>
                            {isToggle ? (
                              <button
                                onClick={() => setSecurity({ ...security, [key]: !value })}
                                className="relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0"
                                style={{ background: value ? "var(--st-primary)" : "var(--st-line-str)" }}
                              >
                                <div
                                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                                    value ? "translate-x-6" : ""
                                  }`}
                                />
                              </button>
                            ) : isSelect ? (
                              <select
                                value={value}
                                onChange={(e) => setSecurity({ ...security, [key]: e.target.value })}
                                className="font-ticket-body px-3 py-2 rounded-xl text-xs font-bold st-input cursor-pointer"
                              >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                              </select>
                            ) : (
                              <span className="font-ticket-body text-xs" style={{ color: "var(--st-txt-soft)" }}>
                                {value}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className="p-4 rounded-2xl"
                      style={{ background: "var(--st-danger-soft)", border: "1px solid var(--st-danger)" }}
                    >
                      <div className="flex items-start gap-3">
                        <FaShieldAlt className="mt-0.5 text-base flex-shrink-0" style={{ color: "var(--st-danger)" }} />
                        <div>
                          <p className="font-ticket-display text-sm font-bold" style={{ color: "var(--st-danger)" }}>
                            Security Tip
                          </p>
                          <p className="font-ticket-body text-xs mt-0.5" style={{ color: "var(--st-txt-soft)" }}>
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