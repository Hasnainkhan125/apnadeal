// src/components/MomentoProfile.jsx
// Full-width cover profile — matches dashboard-style reference
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTh, FaVideo, FaBookmark, FaChartBar, FaUser, FaCog,
  FaSpinner, FaEye, FaHeart, FaPlay, FaTag, FaMapMarkerAlt,
  FaArrowLeft, FaUserCheck, FaUsers,
  FaCheckCircle, FaClock, FaStar,
  FaEnvelope, FaPhone, FaUserCircle, FaShieldAlt, FaLock,
  FaCheck, FaCrown, FaStore, FaBoxOpen, FaTruck,
  FaMoneyBillWave, FaBolt, FaGlobe, FaCertificate,
  FaTags, FaBriefcase, FaWhatsapp, FaFacebook, FaInstagram,
  FaYoutube, FaTwitter, FaTiktok, FaInfoCircle,
  FaPlus, FaShieldAlt as FaShield, FaArrowRight,
  FaSearch, FaFilter, FaThLarge, FaSort,
  FaPen, FaBook, FaShareAlt, FaChevronDown,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import FollowButton from "./FollowButton";
import ProfileEditModal from "./ProfileEditModal";

const formatCount = (n) => {
  if (!n && n !== 0) return "0";
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}K`;
  return `${(n / 1000000).toFixed(2)}M`;
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PROFILE
   ═══════════════════════════════════════════════════════════════ */
const MomentoProfile = ({
  onBack,
  onOpenShorts,
  onOpenPost,
  isOwnProfile = true,
  userId,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [contentFilter, setContentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [posts, setPosts] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [premiumSince, setPremiumSince] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [activeAds, setActiveAds] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0, totalShorts: 0, totalViews: 0,
    totalFollowers: 0, totalFollowing: 0, totalListings: 0,
  });

  const targetUserId = userId || user?.id;
  const isOwn = targetUserId === user?.id;

  const refreshProfile = () => setRefreshKey((k) => k + 1);

  /* ─── Load profile ─── */
  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [uR, sR] = await Promise.all([
          supabase.from("users")
            .select("id, name, full_name, username, email, avatar_url, created_at, is_premium, premium_since, email_confirmed_at")
            .eq("id", targetUserId).maybeSingle(),
          supabase.from("user_settings").select("*")
            .eq("user_id", targetUserId).maybeSingle(),
        ]);

        const s = sR.data || {};
        const u = uR.data || {};

        const merged = {
          id: targetUserId,
          full_name: s.full_name || u.full_name || u.name,
          username: u.username,
          email: s.email || u.email || user?.email,
          avatar_url: s.avatar || s.avatar_url || u.avatar_url,
          cover_url: s.cover_url,
          phone: s.phone,
          location: s.location,
          city: s.city,
          bio: s.bio,
          seller_type: s.seller_type,
          experience_level: s.experience_level,
          main_categories: s.main_categories,
          preferred_payment: s.preferred_payment,
          delivery_option: s.delivery_option,
          business_hours: s.business_hours,
          response_time: s.response_time,
          availability: s.availability || "available",
          badges: Array.isArray(s.badges) ? s.badges : [],
          tags: Array.isArray(s.tags) ? s.tags : [],
          social_whatsapp: s.social_whatsapp,
          social_facebook: s.social_facebook,
          social_instagram: s.social_instagram,
          social_tiktok: s.social_tiktok,
          social_youtube: s.social_youtube,
          social_twitter: s.social_twitter,
          plan_tier: s.plan_tier || "free",
          created_at: u.created_at,
        };

        if (!cancelled) {
          setProfile(merged);
          setIsPremiumUser(!!u.is_premium);
          setPremiumSince(u.premium_since);
          setIsVerified(!!(u.email_confirmed_at || user?.email_confirmed_at));
        }

        const [
          { data: postData },
          { data: shortData },
          { count: followersCount },
          { count: followingCount },
          { count: activeAdsCount },
          { count: soldCountData },
        ] = await Promise.all([
          supabase.from("study_group_posts")
            .select("*").eq("user_id", targetUserId).eq("is_short", false)
            .order("created_at", { ascending: false }).limit(60),
          supabase.from("study_group_posts")
            .select("*").eq("user_id", targetUserId).eq("is_short", true)
            .order("created_at", { ascending: false }).limit(60),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", targetUserId),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", targetUserId),
          supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", targetUserId).eq("status", "active"),
          supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", targetUserId).eq("status", "sold"),
        ]);

        if (cancelled) return;

        setPosts(postData || []);
        setShorts(shortData || []);
        setActiveAds(activeAdsCount || 0);
        setSoldCount(soldCountData || 0);

        const totalViews = [...(postData || []), ...(shortData || [])]
          .reduce((acc, p) => acc + (p.short_views || p.views || 0), 0);

        setStats({
          totalPosts: postData?.length || 0,
          totalShorts: shortData?.length || 0,
          totalViews,
          totalFollowers: followersCount || 0,
          totalFollowing: followingCount || 0,
          totalListings: (activeAdsCount || 0) + (soldCountData || 0),
        });
      } catch (err) {
        console.error("Profile load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [targetUserId, user?.email, refreshKey]);

  /* ─── Load groups ─── */
  useEffect(() => {
    if (!targetUserId) return;
    let cancelled = false;

    (async () => {
      setGroupsLoading(true);
      try {
        const { data: memberRows } = await supabase
          .from("study_group_members")
          .select("group_id, role, joined_at")
          .eq("user_id", targetUserId)
          .order("joined_at", { ascending: false });

        const memberGroupIds = (memberRows || []).map((m) => m.group_id).filter(Boolean);
        const roleMap = {};
        (memberRows || []).forEach((m) => { roleMap[m.group_id] = m.role; });

        const { data: createdGroups } = await supabase
          .from("study_groups").select("id").eq("created_by", targetUserId);

        const createdIds = (createdGroups || []).map((g) => g.id).filter(Boolean);
        const allIds = [...new Set([...memberGroupIds, ...createdIds])];
        if (!allIds.length) { if (!cancelled) setMyGroups([]); return; }

        const { data: groupsData } = await supabase
          .from("study_groups")
          .select("id, name, subject, description, cover_image_url, image_url, max_members, created_at, created_by")
          .in("id", allIds)
          .order("created_at", { ascending: false });

        const enriched = await Promise.all((groupsData || []).map(async (g) => {
          const { count } = await supabase
            .from("study_group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", g.id);
          return {
            ...g,
            member_count: count || 0,
            role: roleMap[g.id] || (g.created_by === targetUserId ? "admin" : "member"),
            is_admin: g.created_by === targetUserId || roleMap[g.id] === "admin",
          };
        }));

        if (!cancelled) setMyGroups(enriched);
      } catch (err) {
        console.warn("Load groups failed:", err);
      } finally {
        if (!cancelled) setGroupsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [targetUserId, refreshKey]);

  /* ─── Followers ─── */
  const fetchFollowers = async () => {
    if (!targetUserId) return;
    setFollowersLoading(true);
    try {
      const { data: rows } = await supabase
        .from("follows").select("follower_id, created_at")
        .eq("following_id", targetUserId).order("created_at", { ascending: false });

      const ids = [...new Set((rows || []).map((r) => r.follower_id).filter(Boolean))];
      if (!ids.length) { setFollowers([]); return; }

      const [uR, sR] = await Promise.all([
        supabase.from("users").select("id, name, full_name, username, email, avatar_url").in("id", ids),
        supabase.from("user_settings").select("user_id, full_name, avatar, avatar_url").in("user_id", ids),
      ]);
      const uMap = {}; (uR.data || []).forEach((u) => { uMap[u.id] = u; });
      const sMap = {}; (sR.data || []).forEach((s) => { sMap[s.user_id] = s; });

      setFollowers(ids.map((id) => ({
        id,
        full_name: sMap[id]?.full_name || uMap[id]?.full_name || uMap[id]?.name || "User",
        username: uMap[id]?.username,
        email: uMap[id]?.email,
        avatar_url: sMap[id]?.avatar || sMap[id]?.avatar_url || uMap[id]?.avatar_url,
      })));
    } catch (err) { console.warn(err); }
    finally { setFollowersLoading(false); }
  };

  const fetchFollowing = async () => {
    if (!targetUserId) return;
    setFollowingLoading(true);
    try {
      const { data: rows } = await supabase
        .from("follows").select("following_id, created_at")
        .eq("follower_id", targetUserId).order("created_at", { ascending: false });

      const ids = [...new Set((rows || []).map((r) => r.following_id).filter(Boolean))];
      if (!ids.length) { setFollowing([]); return; }

      const [uR, sR] = await Promise.all([
        supabase.from("users").select("id, name, full_name, username, email, avatar_url").in("id", ids),
        supabase.from("user_settings").select("user_id, full_name, avatar, avatar_url").in("user_id", ids),
      ]);
      const uMap = {}; (uR.data || []).forEach((u) => { uMap[u.id] = u; });
      const sMap = {}; (sR.data || []).forEach((s) => { sMap[s.user_id] = s; });

      setFollowing(ids.map((id) => ({
        id,
        full_name: sMap[id]?.full_name || uMap[id]?.full_name || uMap[id]?.name || "User",
        username: uMap[id]?.username,
        email: uMap[id]?.email,
        avatar_url: sMap[id]?.avatar || sMap[id]?.avatar_url || uMap[id]?.avatar_url,
      })));
    } catch (err) { console.warn(err); }
    finally { setFollowingLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "followers" && followers.length === 0 && !followersLoading) fetchFollowers();
    if (activeTab === "following" && following.length === 0 && !followingLoading) fetchFollowing();
  }, [activeTab]);

  /* ─── Content filtered ─── */
  const combinedContent = useMemo(() => {
    let list = [];
    if (contentFilter === "all" || contentFilter === "posts") list = [...posts];
    if (contentFilter === "all" || contentFilter === "shorts") list = [...list, ...shorts];
    if (contentFilter === "saved") list = [...savedPosts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.content || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return list;
  }, [posts, shorts, savedPosts, contentFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sp-bg)" }}>
        <FaSpinner className="text-3xl animate-spin" style={{ color: "var(--sp-primary)" }} />
      </div>
    );
  }

  const availabilityColor =
    profile?.availability === "unavailable" ? "#EF4444"
    : profile?.availability === "busy" ? "#EAB308"
    : "#10B981";

  const availabilityText =
    profile?.availability === "unavailable" ? "Not Accepting"
    : profile?.availability === "busy" ? "Currently Busy"
    : "Open for Business";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--sp-bg)", color: "var(--sp-txt)" }}>
      {/* ═══════════════════════════════════════════════════════
          COVER — full width with dark overlay
          ═══════════════════════════════════════════════════════ */}
      <div className="relative w-full h-[200px] xs:h-[220px] sm:h-[260px] md:h-[300px] overflow-hidden">
        {/* Background */}
        {profile?.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1a2332 0%, #2c3e50 30%, #34495e 60%, #1a2332 100%)",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md transition hover:scale-105 active:scale-95"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <FaArrowLeft className="text-white text-xs sm:text-sm" />
        </button>

        {/* Dashboard / Create — top-right */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg backdrop-blur-md text-white font-bold text-[11px] transition hover:scale-105"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <FaChartBar className="text-[10px]" />
            Dashboard
          </Link>
          <Link
            to="/post-ad"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg backdrop-blur-md text-white font-bold text-[11px] transition hover:scale-105"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <FaPlus className="text-[9px] sm:text-[10px]" />
            Create
          </Link>
        </div>

        {/* Profile info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-5 md:px-6 pb-3 sm:pb-4 md:pb-5">
          <div className="flex items-end gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="h-14 w-14 xs:h-16 xs:w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden flex items-center justify-center text-white text-xl xs:text-2xl sm:text-3xl font-black"
                style={{
                  background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))",
                  border: "3px solid #0A0A12",
                }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (profile?.full_name || "U").charAt(0).toUpperCase()
                )}
              </div>
              {isVerified && (
                <span
                  className="absolute bottom-0 right-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center"
                  style={{ background: "#10B981", border: "2px solid #0A0A12" }}
                >
                  <FaCheck className="text-white text-[7px] sm:text-[8px]" />
                </span>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0 pb-0.5 sm:pb-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base xs:text-lg sm:text-2xl font-black text-white truncate drop-shadow-md">
                  {profile?.full_name || "User"}
                </h1>
                {isVerified && (
                  <FaCheckCircle className="text-[#3B82F6] text-xs sm:text-base flex-shrink-0" />
                )}
              </div>

              {/* Chips */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                <span
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background: isPremiumUser ? "rgba(245,158,11,0.9)" : "rgba(59,130,246,0.9)",
                    color: "#fff",
                  }}
                >
                  <FaCrown className="text-[7px] sm:text-[8px]" />
                  {isPremiumUser ? "Premium" : "Free"}
                </span>

                <span
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: availabilityColor }}
                  />
                  <span className="hidden xs:inline">{availabilityText}</span>
                  <span className="xs:hidden">Open</span>
                </span>

                <span
                  className="hidden xs:inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <FaUsers className="text-[7px] sm:text-[8px]" />
                  {formatCount(stats.totalFollowers)} Followers
                </span>
              </div>

              {/* Bio — hidden on smallest screens to keep cover compact */}
              {profile?.bio && (
                <p className="hidden xs:block text-[11px] sm:text-[13px] text-white/80 mt-1.5 sm:mt-2 leading-relaxed line-clamp-2 max-w-2xl drop-shadow-sm">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Follow / Edit — desktop only */}
            <div className="hidden sm:flex flex-shrink-0 pb-1">
              {!isOwn ? (
                <FollowButton targetUserId={targetUserId} size="lg" variant="primary" />
              ) : (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white transition hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <FaCog className="text-[10px]" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Mobile follow/edit button */}
          <div className="sm:hidden mt-2.5">
            {!isOwn ? (
              <FollowButton targetUserId={targetUserId} size="md" variant="primary" />
            ) : (
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <FaCog className="text-[10px]" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB NAV
          ═══════════════════════════════════════════════════════ */}
      <div
        className="border-b sticky top-0 z-30 backdrop-blur-md"
        style={{ borderColor: "var(--sp-line)", background: "var(--sp-bg)" }}
      >
        <div className="px-3 sm:px-5 md:px-6 flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
          {[
            { id: "overview", label: "Overview" },
            { id: "posts", label: "Posts", count: stats.totalPosts },
            { id: "groups", label: "Groups", count: myGroups.length },
            { id: "followers", label: "Followers", count: stats.totalFollowers },
            { id: "stats", label: "Stats" },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative flex-shrink-0 flex items-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 px-2.5 sm:px-3 text-[12px] sm:text-[13px] font-bold whitespace-nowrap transition-colors"
                style={{ color: active ? "var(--sp-txt)" : "var(--sp-txt-soft)" }}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className="text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-full tabular-nums"
                    style={{
                      background: active ? "var(--sp-primary-soft)" : "var(--sp-card-2)",
                      color: active ? "var(--sp-primary)" : "var(--sp-txt-soft)",
                    }}
                  >
                    {formatCount(t.count)}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="profile-tab-underline"
                    className="absolute bottom-0 left-2 right-2 sm:left-3 sm:right-3 h-[2px] rounded-full"
                    style={{ background: "var(--sp-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════ */}
      <div className="px-3 sm:px-5 md:px-6 py-4 sm:py-5 w-full max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 sm:space-y-5"
            >
              {/* Stats row */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                {/* Purple accent card */}
                <div
                  className="rounded-xl p-3 sm:p-4 flex flex-col justify-between min-h-[100px] sm:min-h-[110px] col-span-2 xs:col-span-1"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
                >
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white/70">
                    Posts
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none my-1.5">
                    {formatCount(stats.totalPosts)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-white/85 flex items-center gap-1">
                    <span>↗</span> Active this month
                  </p>
                </div>

                <StatTile label="Shorts" value={formatCount(stats.totalShorts)} delta="+6.2%" hint="vs last month" />
                <StatTile label="Followers" value={formatCount(stats.totalFollowers)} delta="+6.2%" hint="vs last month" />
                <StatTile label="Following" value={formatCount(stats.totalFollowing)} delta="+6.2%" hint="vs last month" />
                <StatTile label="Total Views" value={formatCount(stats.totalViews)} delta="+6.2%" hint="vs last month" />
              </div>

              {/* Action Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ActionTile
                  icon={FaPen}
                  title="Create your first Post"
                  subtitle="Share photos or a short video"
                  onClick={() => isOwn ? navigate("/momento") : null}
                  accent="var(--sp-primary)"
                />
                <ActionTile
                  icon={FaBook}
                  title="Explore Marketplace"
                  subtitle="Browse listings and categories"
                  onClick={() => navigate("/feed")}
                  accent="#3B82F6"
                />
              </div>

              {/* Content section */}
              <div>
                <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {[
                      { id: "all", label: "View all" },
                      { id: "shorts", label: "Shorts" },
                      { id: "posts", label: "Posts" },
                      { id: "saved", label: "Saved" },
                    ].map((f) => {
                      const active = contentFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setContentFilter(f.id)}
                          className="flex-shrink-0 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-[11.5px] font-bold whitespace-nowrap transition-all"
                          style={active ? {
                            background: "var(--sp-card-2)",
                            color: "var(--sp-txt)",
                            border: "1px solid var(--sp-line-str)",
                          } : {
                            background: "transparent",
                            color: "var(--sp-txt-soft)",
                            border: "1px solid transparent",
                          }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className="flex-shrink-0 hidden xs:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                    style={{
                      background: "var(--sp-card)",
                      border: "1px solid var(--sp-line)",
                      color: "var(--sp-txt-soft)",
                    }}
                  >
                    <FaSort className="text-[9px]" />
                    <span className="hidden sm:inline">Most recent</span>
                    <FaChevronDown className="text-[8px]" />
                  </div>
                </div>

                {/* Search + Sort row */}
                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-2 mb-4">
                  <button
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                    style={{
                      background: "var(--sp-card)",
                      border: "1px solid var(--sp-line)",
                      color: "var(--sp-txt)",
                    }}
                  >
                    <FaFilter className="text-[10px]" />
                    Filters
                  </button>

                  <div className="relative">
                    <FaSearch
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px]"
                      style={{ color: "var(--sp-txt-faint)" }}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none"
                      style={{
                        background: "var(--sp-card)",
                        border: "1px solid var(--sp-line)",
                        color: "var(--sp-txt)",
                      }}
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    style={{
                      background: "var(--sp-card)",
                      border: "1px solid var(--sp-line)",
                      color: "var(--sp-txt)",
                    }}
                  >
                    <option value="newest">New to Old</option>
                    <option value="oldest">Old to New</option>
                  </select>

                  <button
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                    style={{
                      background: "var(--sp-card)",
                      border: "1px solid var(--sp-line)",
                      color: "var(--sp-txt)",
                    }}
                  >
                    <FaThLarge className="text-[10px]" />
                    Grid
                  </button>
                </div>

                {/* Content grid */}
                {combinedContent.length === 0 ? (
                  <EmptyState icon={FaTh} title="No content yet" subtitle="Nothing here to display" />
                ) : (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {combinedContent.map((p) => (
                      <ContentCard
                        key={p.id}
                        item={p}
                        onOpen={() => {
                          if (p.is_short) onOpenShorts?.();
                          else onOpenPost?.(p);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity heading */}
              <div className="flex items-center justify-between gap-3 pt-2 sm:pt-3">
                <h3 className="text-sm sm:text-base md:text-lg font-black">Recent Activity</h3>
                <button
                  onClick={() => setActiveTab("posts")}
                  className="text-[11px] sm:text-[11.5px] font-bold hover:opacity-70"
                  style={{ color: "var(--sp-txt-soft)" }}
                >
                  See All
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ POSTS ═══ */}
          {activeTab === "posts" && (
            <motion.div
              key="posts-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {posts.length === 0 ? (
                <EmptyState icon={FaTh} title="No posts yet" subtitle="Share your first moment" />
              ) : (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {posts.map((p) => (
                    <ContentCard key={p.id} item={p} onOpen={() => onOpenPost?.(p)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ GROUPS ═══ */}
          {activeTab === "groups" && (
            <motion.div
              key="groups-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {isOwn && (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-black">My Groups</h3>
                    <p className="text-[11px] sm:text-[11.5px]" style={{ color: "var(--sp-txt-soft)" }}>
                      Groups you created or joined
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/study-groups"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: "var(--sp-card)",
                        border: "1px solid var(--sp-line)",
                        color: "var(--sp-txt)",
                      }}
                    >
                      <FaGlobe className="text-[10px]" /> Explore
                    </Link>
                    <Link
                      to="/study-groups?create=1"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black text-white"
                      style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}
                    >
                      <FaPlus className="text-[10px]" /> Create
                    </Link>
                  </div>
                </div>
              )}

              {groupsLoading ? (
                <div className="text-center py-12">
                  <FaSpinner className="text-2xl animate-spin mx-auto" style={{ color: "var(--sp-primary)" }} />
                </div>
              ) : myGroups.length === 0 ? (
                <EmptyState
                  icon={FaUsers}
                  title="No groups yet"
                  subtitle={isOwn ? "Create or join a group to get started" : "Not part of any groups yet"}
                />
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {myGroups.map((g) => (
                    <GroupCard key={g.id} group={g} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ FOLLOWERS ═══ */}
          {activeTab === "followers" && (
            <motion.div
              key="followers-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {followersLoading ? (
                <div className="text-center py-12">
                  <FaSpinner className="text-2xl animate-spin mx-auto" style={{ color: "var(--sp-primary)" }} />
                </div>
              ) : followers.length === 0 ? (
                <EmptyState
                  icon={FaUsers}
                  title="No followers yet"
                  subtitle={isOwn ? "Share your profile to grow" : "Be the first to follow"}
                />
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {followers.map((u) => (
                    <UserRow key={u.id} user={u} currentUserId={user?.id} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STATS ═══ */}
          {activeTab === "stats" && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 sm:space-y-5"
            >
              {/* Stats row */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                <div
                  className="rounded-xl p-3 sm:p-4 flex flex-col justify-between min-h-[100px] sm:min-h-[110px] col-span-2 xs:col-span-1"
                  style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
                >
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white/70">Posts</p>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none my-1.5">
                    {formatCount(stats.totalPosts)}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-white/85">Active this month</p>
                </div>

                <StatTile label="Shorts" value={formatCount(stats.totalShorts)} delta="+6.2%" hint="vs last month" />
                <StatTile label="Followers" value={formatCount(stats.totalFollowers)} delta="+6.2%" hint="vs last month" />
                <StatTile label="Following" value={formatCount(stats.totalFollowing)} delta="+6.2%" hint="vs last month" />
                <StatTile label="Total Views" value={formatCount(stats.totalViews)} delta="+6.2%" hint="vs last month" />
              </div>

              {/* Contact + Seller details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div
                  className="rounded-2xl p-4 sm:p-5"
                  style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
                >
                  <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                    <FaUserCircle className="text-sm" style={{ color: "var(--sp-primary)" }} />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoField icon={FaUserCircle} label="Full Name" value={profile?.full_name} />
                    <InfoField icon={FaEnvelope} label="Email" value={profile?.email} />
                    <InfoField icon={FaPhone} label="Phone" value={profile?.phone} />
                    <InfoField icon={FaMapMarkerAlt} label="Location" value={profile?.location || profile?.city} />
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 sm:p-5"
                  style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
                >
                  <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                    <FaStore className="text-sm" style={{ color: "var(--sp-primary)" }} />
                    Seller Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoField icon={FaUser} label="I Am A" value={profile?.seller_type} />
                    <InfoField icon={FaBriefcase} label="Experience" value={profile?.experience_level} />
                    <InfoField icon={FaBoxOpen} label="Categories" value={profile?.main_categories} />
                    <InfoField icon={FaMoneyBillWave} label="Payment" value={profile?.preferred_payment} />
                    <InfoField icon={FaTruck} label="Delivery" value={profile?.delivery_option} />
                    <InfoField icon={FaClock} label="Hours" value={profile?.business_hours} />
                    <InfoField icon={FaBolt} label="Response" value={profile?.response_time} />
                  </div>

                  {profile?.badges?.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--sp-line)" }}>
                      <p className="text-[10px] font-bold mb-2" style={{ color: "var(--sp-txt-faint)" }}>Badges</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.badges.map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={{ background: "var(--sp-primary-soft)", color: "var(--sp-primary)" }}
                          >
                            <FaCertificate className="text-[8px]" /> {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile?.tags?.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--sp-line)" }}>
                      <p className="text-[10px] font-bold mb-2" style={{ color: "var(--sp-txt-faint)" }}>Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                            style={{ background: "var(--sp-primary-soft)", color: "var(--sp-primary)" }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Socials */}
              {(profile?.social_whatsapp || profile?.social_facebook || profile?.social_instagram ||
                profile?.social_tiktok || profile?.social_youtube || profile?.social_twitter) && (
                <div
                  className="rounded-2xl p-4 sm:p-5"
                  style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
                >
                  <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                    <FaGlobe className="text-sm" style={{ color: "var(--sp-primary)" }} />
                    Social Media
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {profile.social_whatsapp && (
                      <SocialLink
                        href={`https://wa.me/${profile.social_whatsapp.replace(/[^0-9]/g, "")}`}
                        icon={FaWhatsapp}
                        color="#25D366"
                      />
                    )}
                    {profile.social_facebook && <SocialLink href={profile.social_facebook} icon={FaFacebook} color="#1877F2" />}
                    {profile.social_instagram && <SocialLink href={profile.social_instagram} icon={FaInstagram} color="#E1306C" />}
                    {profile.social_tiktok && <SocialLink href={profile.social_tiktok} icon={FaTiktok} color="#000" bg="#fff" />}
                    {profile.social_youtube && <SocialLink href={profile.social_youtube} icon={FaYoutube} color="#FF0000" />}
                    {profile.social_twitter && <SocialLink href={profile.social_twitter} icon={FaTwitter} color="#1DA1F2" />}
                  </div>
                </div>
              )}

              {/* Verification */}
              <div
                className="rounded-2xl p-4 sm:p-5"
                style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
              >
                <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                  <FaShieldAlt className="text-sm" style={{ color: "#10B981" }} />
                  Verification Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: "Email", desc: "Confirm your email address", done: isVerified },
                    { label: "Phone Number", desc: "Verify via SMS code", done: false },
                    { label: "Government ID", desc: "Upload CNIC for full verification", done: false },
                    { label: "Address", desc: "Confirm your delivery address", done: false },
                  ].map((v) => (
                    <div
                      key={v.label}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--sp-card-2)" }}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={v.done
                          ? { background: "#10B981", color: "#fff" }
                          : { background: "var(--sp-card)", color: "var(--sp-txt-soft)" }}
                      >
                        {v.done ? <FaCheck className="text-[10px]" /> : <FaLock className="text-[9px]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{v.label}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--sp-txt-soft)" }}>
                          {v.desc}
                        </p>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
                        style={v.done
                          ? { background: "rgba(16,185,129,0.12)", color: "#10B981" }
                          : { background: "var(--sp-primary)", color: "#fff" }}
                      >
                        {v.done ? "Verified" : "Verify"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      {isOwn && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentProfile={profile}
          userId={targetUserId}
          onSaved={refreshProfile}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─── Stat Tile ─── */
const StatTile = ({ label, value, delta, hint }) => (
  <div
    className="rounded-xl p-3 sm:p-4 flex flex-col justify-between min-h-[100px] sm:min-h-[110px]"
    style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
  >
    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--sp-txt-soft)" }}>
      {label}
    </p>
    <p className="text-2xl sm:text-3xl font-black tabular-nums leading-none my-1.5">
      {value}
    </p>
    {delta && (
      <p className="text-[9px] sm:text-[10px] font-bold flex items-center gap-1" style={{ color: "#22C55E" }}>
        <span>↗</span> {delta}
        <span className="ml-1 font-medium hidden sm:inline" style={{ color: "var(--sp-txt-faint)" }}>{hint}</span>
      </p>
    )}
  </div>
);

/* ─── Action Tile ─── */
const ActionTile = ({ icon: Icon, title, subtitle, onClick, accent }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl text-left transition hover:scale-[1.01] active:scale-[0.99]"
    style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
  >
    <span
      className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: "var(--sp-primary-soft)", color: "var(--sp-primary)", border: `1px solid var(--sp-primary)` }}
    >
      <Icon className="text-base sm:text-lg" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-black truncate">{title}</p>
      <p className="text-[11px] sm:text-[11.5px] mt-0.5 truncate" style={{ color: "var(--sp-txt-soft)" }}>
        {subtitle}
      </p>
    </div>
  </button>
);

/* ─── Content Card ─── */
const ContentCard = ({ item, onOpen }) => {
  const isVideo = item.media_type === "video" || item.is_short;
  const thumb = item.video_thumbnail || item.image_url;
  const hasMedia = !!thumb;

  return (
    <button
      onClick={onOpen}
      className="group aspect-square rounded-xl overflow-hidden relative"
      style={{ background: "var(--sp-card-2)", border: "1px solid var(--sp-line)" }}
    >
      {hasMedia ? (
        <img
          src={thumb}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2.5 sm:p-3">
          <p className="text-[9px] sm:text-[10px] font-semibold text-center line-clamp-4" style={{ color: "var(--sp-txt-soft)" }}>
            {item.content?.slice(0, 80) || "No content"}
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {isVideo && (
        <span
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        >
          <FaPlay className="text-white text-[7px] sm:text-[8px]" />
        </span>
      )}

      <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex items-center justify-between text-white text-[9px] sm:text-[10px] font-bold">
        <span className="flex items-center gap-1">
          <FaEye className="text-[7px] sm:text-[8px]" />
          {formatCount(item.views || item.short_views || 0)}
        </span>
        <span className="flex items-center gap-1">
          <FaHeart className="text-[7px] sm:text-[8px]" />
          {formatCount(item.short_likes || 0)}
        </span>
      </div>
    </button>
  );
};

/* ─── Group Card ─── */
const GroupCard = ({ group }) => {
  const navigate = useNavigate();
  const coverUrl = group.cover_image_url || group.image_url;

  return (
    <button
      onClick={() => navigate(`/study-groups/${group.id}`)}
      className="group text-left rounded-2xl overflow-hidden transition hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
    >
      <div className="relative w-full h-32 sm:h-36">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={group.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {group.is_admin && (
          <span
            className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: "var(--sp-primary)", color: "#fff" }}
          >
            <FaShield className="text-[7px]" /> Admin
          </span>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3">
          <p className="font-black text-white text-sm truncate">{group.name || "Untitled"}</p>
          {group.subject && (
            <span
              className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
              style={{ background: "var(--sp-primary)", color: "#fff" }}
            >
              {group.subject}
            </span>
          )}
        </div>
      </div>

      <div className="p-2.5 sm:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--sp-txt-soft)" }}>
            <FaUsers className="text-[9px]" />
            {group.member_count || 0} member{group.member_count === 1 ? "" : "s"}
          </div>
          <FaArrowRight className="text-[9px]" style={{ color: "var(--sp-txt-faint)" }} />
        </div>
      </div>
    </button>
  );
};

/* ─── Info field ─── */
const InfoField = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-1">
    <span
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ color: "var(--sp-txt-faint)" }}
    >
      <Icon className="text-[10px]" />
      {label}
    </span>
    <span className="text-[12px] sm:text-[13px] font-bold truncate" style={{ color: "var(--sp-txt)" }}>
      {value || <span className="opacity-40">—</span>}
    </span>
  </div>
);

/* ─── Social link ─── */
const SocialLink = ({ href, icon: Icon, color = "#000", bg }) => {
  const url = href?.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      style={{
        background: bg || color,
        border: bg ? "1px solid var(--sp-line)" : "none",
      }}
    >
      <Icon className="text-base sm:text-lg" style={{ color: bg ? "#000" : "#fff" }} />
    </a>
  );
};

/* ─── User row ─── */
const UserRow = ({ user, currentUserId }) => {
  const isSelf = user?.id === currentUserId;
  const initial = (user?.full_name || "U").charAt(0).toUpperCase();

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl"
      style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
    >
      <div
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex items-center justify-center text-white font-black flex-shrink-0 text-sm sm:text-base"
        style={{ background: "linear-gradient(135deg, var(--sp-primary), var(--sp-primary-2))" }}
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-black truncate">{user?.full_name || "User"}</p>
        <p className="text-[10px] sm:text-[11px] truncate" style={{ color: "var(--sp-txt-soft)" }}>
          @{user?.username || user?.email?.split("@")[0] || "user"}
        </p>
      </div>
      {!isSelf && <FollowButton targetUserId={user.id} size="sm" variant="outline" />}
    </div>
  );
};

/* ─── Empty state ─── */
const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="text-center py-12 sm:py-16">
    <div
      className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
      style={{ background: "var(--sp-card)", border: "1px solid var(--sp-line)" }}
    >
      <Icon className="text-lg sm:text-xl" style={{ color: "var(--sp-txt-faint)" }} />
    </div>
    <p className="text-sm font-black">{title}</p>
    <p className="text-xs mt-1" style={{ color: "var(--sp-txt-soft)" }}>{subtitle}</p>
  </div>
);

export default MomentoProfile;