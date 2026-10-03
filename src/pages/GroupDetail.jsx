// pages/GroupDetail.jsx — Modern Premium Group Detail
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaArrowLeft,
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserPlus,
  FaComments,
  FaShieldAlt,
  FaSpinner,
  FaTimesCircle,
  FaCopy,
  FaWhatsapp,
  FaEnvelope,
  FaShareAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlus,
  FaNewspaper,
  FaTrash,
  FaEdit,
  FaImage,
  FaUpload,
  FaCamera,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaPaperPlane,
  FaSmile,
  FaGlobe,
  FaLock,
  FaUserFriends,
  FaBullhorn,
  FaLanguage,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaBolt,
  FaRegCommentDots,
  FaCheckCircle,
  FaEllipsisH,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   THEME STYLES
   ═══════════════════════════════════════════════════════════════ */
const GroupStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    /* ── DARK THEME ── */
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
      --grp-pill-bg:     #1E1E1E;
    }

    /* ── LIGHT THEME ── */
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
      --grp-pill-bg:     #FFFFFF;
    }

    .grp-bg { background: var(--grp-bg); color: var(--grp-txt); }
    .grp-card { background: var(--grp-card); border: 1px solid var(--grp-line); border-radius: 24px; }
    .grp-card-2 { background: var(--grp-card-2); border: 1px solid var(--grp-line); border-radius: 16px; }
    .grp-input { background: var(--grp-input-bg); color: var(--grp-txt); border: 1px solid var(--grp-line); }
    .grp-input:focus { border-color: var(--grp-primary); outline: none; }
  `}</style>
);

const ACCENT = '#FF5C28';
const ACCENT_DEEP = '#FF8C42';
const INK = '#1B1815';

// ═══ Category color map ═══
const CATEGORY_COLORS = {
  "Gaming":              { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Movies & Cinema":     { fg: "#B23A2E", bg: "rgba(178,58,46,0.12)" },
  "Music Lovers":        { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "Comedy & Humor":      { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Art & Creativity":    { fg: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  "Coffee & Chat":       { fg: "#8B5E3C", bg: "rgba(139,94,60,0.12)" },
  "Wellness & Health":   { fg: "#0F8A66", bg: "rgba(15,138,102,0.12)" },
  "Travel & Adventure":  { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "Nature & Outdoors":   { fg: "#164B3B", bg: "rgba(22,75,59,0.12)" },
  "Sports & Fitness":    { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Coding & Tech":       { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "AI & Robotics":       { fg: "#6B4A8A", bg: "rgba(107,74,138,0.12)" },
  "Entrepreneurship":    { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Book Club":           { fg: "#8B5E3C", bg: "rgba(139,94,60,0.12)" },
  "Study & Learning":    { fg: "#2A6FB8", bg: "rgba(42,111,184,0.12)" },
  "Motivation & Growth": { fg: "#E8A33D", bg: "rgba(232,163,61,0.14)" },
  "Fun & Games":         { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  "Photography":         { fg: "#2A4A6B", bg: "rgba(42,74,107,0.12)" },
  "Fashion & Style":     { fg: "#C24B7A", bg: "rgba(194,75,122,0.12)" },
  "Cooking & Recipes":   { fg: "#E26A2C", bg: "rgba(226,106,44,0.14)" },
  __default:             { fg: "#B9791E", bg: "rgba(185,121,30,0.12)" },
};

const getCategoryColor = (name) =>
  CATEGORY_COLORS[name] || CATEGORY_COLORS.__default;

// ═══ Group type + language labels ═══
const GROUP_TYPE_META = {
  public:        { label: 'Public',       Icon: FaGlobe,       fg: '#0F8A66', bg: 'rgba(15,138,102,0.12)' },
  private:       { label: 'Private',      Icon: FaLock,        fg: '#6B4A8A', bg: 'rgba(107,74,138,0.12)' },
  'invite-only': { label: 'Invite Only',  Icon: FaUserFriends, fg: '#C24B7A', bg: 'rgba(194,75,122,0.12)' },
};

const LANGUAGE_META = {
  english: { label: 'English',  flag: '🇬🇧' },
  urdu:    { label: 'اردو',     flag: '🇵🇰' },
  both:    { label: 'English + اردو', flag: '🌐' },
};

// ═══ Helper: get the best display name for a user row ═══
const getDisplayName = (profile, fallback = 'User') => {
  if (!profile) return fallback;
  return (
    profile.full_name ||
    profile.name ||
    profile.username ||
    profile.email?.split('@')[0] ||
    fallback
  );
};

// ═══ Helper: get the best avatar for a user row ═══
const getAvatarUrl = (profile) => {
  if (!profile) return null;
  return profile.avatar_url || profile.avatar || profile.picture || null;
};

// ═══ Reusable Avatar component ═══
const Avatar = ({
  profile,
  fallbackName = 'U',
  size = 'h-10 w-10',
  textSize = 'text-sm',
  ring = false,
}) => {
  const url = getAvatarUrl(profile);
  const name = getDisplayName(profile, fallbackName);
  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 font-ticket-body overflow-hidden ${
        ring ? 'ring-2 ring-white dark:ring-[#121212]' : ''
      }`}
      style={{
        background: url
          ? `url(${url}) center/cover`
          : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
      }}
    >
      {!url && <span className={textSize}>{initial}</span>}
    </div>
  );
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postImageFile, setPostImageFile] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    image_url: '',
  });
  const [processing, setProcessing] = useState(false);
  const [deletePostModal, setDeletePostModal] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const postFileInputRef = useRef(null);

  // ═══ Best-effort current user profile ═══
  const currentUserProfile = {
    id: user?.id,
    full_name:
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0],
    email: user?.email,
    avatar_url:
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.avatar ||
      user?.user_metadata?.picture ||
      null,
  };

  useEffect(() => {
    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Group
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        setError('Group not found');
        setLoading(false);
        return;
      }
      setGroup(groupData);

      // 2. Members
      const { data: memberRows, error: membersError } = await supabase
        .from('study_group_members')
        .select('user_id, role, joined_at')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (membersError) console.error('Error fetching members:', membersError);

      let rawMembers = memberRows || [];

      // 🩹 Self-heal: add creator if none exist
      if (rawMembers.length === 0 && groupData.created_by) {
        await supabase.from('study_group_members').insert({
          group_id: groupId,
          user_id: groupData.created_by,
          role: 'admin',
        });
        const { data: refreshed } = await supabase
          .from('study_group_members')
          .select('user_id, role, joined_at')
          .eq('group_id', groupId)
          .order('joined_at', { ascending: true });
        rawMembers = refreshed || rawMembers;
      }

      // 3. Member profiles
      const userIds = rawMembers.map((m) => m.user_id);
      let usersMap = {};
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, full_name, username, email, avatar_url')
          .in('id', userIds);
        if (!usersError && usersData) {
          usersData.forEach((u) => { usersMap[u.id] = u; });
        } else if (usersError) {
          console.warn('Could not load user profiles:', usersError.message);
        }
      }

      const enrichedMembers = rawMembers.map((m) => ({
        ...m,
        users: usersMap[m.user_id] || null,
      }));
      setMembers(enrichedMembers);

      // 4. Membership status
      if (user) {
        const me = enrichedMembers.find((m) => m.user_id === user.id);
        setIsMember(!!me);
        setIsAdmin(me?.role === 'admin');
      } else {
        setIsMember(false);
        setIsAdmin(false);
      }

      // 5. Posts + post author profiles
      const { data: postsData, error: postsError } = await supabase
        .from('study_group_posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (!postsError && postsData) {
        const authorIds = [...new Set(postsData.map((p) => p.user_id))];
        let postAuthorsMap = {};
        if (authorIds.length > 0) {
          const { data: authors, error: authorsError } = await supabase
            .from('users')
            .select('id, name, full_name, username, email, avatar_url')
            .in('id', authorIds);
          if (!authorsError && authors) {
            authors.forEach((a) => { postAuthorsMap[a.id] = a; });
          }
        }
        setPosts(
          postsData.map((p) => ({
            ...p,
            users: postAuthorsMap[p.user_id] || null,
          }))
        );
      } else if (postsError) {
        console.warn('Could not load posts:', postsError.message);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from('study-group-images').upload(filePath, file);
    if (error) { console.error('Error uploading image:', error); return null; }
    const { data: urlData } = supabase.storage.from('study-group-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isMember) { alert('You must be a member of this group to create posts.'); return; }
    if (!postData.content.trim()) { alert('Please write something to share.'); return; }

    setProcessing(true);
    try {
      let imageUrl = null;
      if (postImageFile) imageUrl = await uploadImage(postImageFile, 'post-images');

      const { data, error } = await supabase
        .from('study_group_posts')
        .insert({
          title: postData.title || postData.content.slice(0, 60),
          content: postData.content,
          group_id: groupId,
          user_id: user.id,
          image_url: imageUrl,
          likes: 0,
          comments: 0,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) { alert('Failed to create post: ' + error.message); setProcessing(false); return; }

      if (data && data.length > 0) {
        const newPost = {
          ...data[0],
          users: currentUserProfile,
        };
        setPosts((prev) => [newPost, ...prev]);
      }
      setShowCreatePost(false);
      setPostData({ title: '', content: '', image_url: '' });
      setPostImageFile(null);
      setPostImagePreview(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('study_group_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) { alert('Failed to delete post: ' + error.message); return; }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeletePostModal(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleLike = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = likedPosts[postId];
          return {
            ...post,
            likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
          };
        }
        return post;
      })
    );
  };

  const fetchComments = async (postId) => {
    try {
      const { data: rows, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) { console.error('Error fetching comments:', error); return; }

      const rawComments = rows || [];
      const commenterIds = [...new Set(rawComments.map((c) => c.user_id))];
      let commentersMap = {};
      if (commenterIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, full_name, username, email, avatar_url')
          .in('id', commenterIds);
        if (!usersError && usersData) {
          usersData.forEach((u) => { commentersMap[u.id] = u; });
        }
      }

      const enriched = rawComments.map((c) => ({
        ...c,
        users: commentersMap[c.user_id] || null,
      }));
      setComments((prev) => ({ ...prev, [postId]: enriched }));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const toggleComments = async (postId) => {
    const isOpen = showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen && !comments[postId]) await fetchComments(postId);
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText[postId],
          created_at: new Date().toISOString(),
        })
        .select();
      if (error) { console.error('Error submitting comment:', error); alert('Failed to submit comment'); return; }

      // Optimistic append with the current user profile
      const newComment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        user_id: user.id,
        content: commentText[postId],
        created_at: new Date().toISOString(),
        users: currentUserProfile,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));

      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: (post.comments || 0) + 1 } : post
        )
      );

      // Silent refresh
      setTimeout(() => fetchComments(postId), 400);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = `Join this group: ${group?.name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' — ' + url)}`, '_blank');
  };
  const shareEmail = () => {
    const url = window.location.href;
    const subject = `Join: ${group?.name}`;
    const body = `Hey!\n\nI'd like to invite you to join "${group?.name}" on APNa Deal.\n\n${group?.description || ''}\n\nJoin here: ${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // ═══ Composer Avatar — uses group identity as fallback ═══
  const ComposerAvatar = ({
    userProfile,
    group,
    catColor,
    size = 'h-10 w-10',
    textSize = 'text-sm',
  }) => {
    const url = getAvatarUrl(userProfile);

    // If the user has a real avatar, use it
    if (url) {
      return (
        <div
          className={`${size} rounded-full overflow-hidden flex-shrink-0`}
          style={{ background: `url(${url}) center/cover` }}
          aria-label={getDisplayName(userProfile, 'You')}
        />
      );
    }

    // Fallback — use the group logo if it exists, otherwise the group's first letter
    const groupLogo = group?.image_url;
    const groupInitial = group?.name?.charAt(0).toUpperCase() || 'G';
    const gradient = catColor
      ? `linear-gradient(135deg, ${catColor.fg}, ${catColor.fg}bb)`
      : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`;

    return (
      <div
        className={`${size} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold font-ticket-body`}
        style={{ background: groupLogo ? undefined : gradient }}
        aria-label={group?.name || 'Group'}
      >
        {groupLogo ? (
          <img
            src={groupLogo}
            alt={group?.name || 'Group'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={textSize}>{groupInitial}</span>
        )}
      </div>
    );
  };

  const handleJoin = async () => {
    if (!user) { navigate('/signin'); return; }
    if (isMember) { fetchGroupDetails(); return; }
    try {
      const { data: existing } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing) { setIsMember(true); fetchGroupDetails(); return; }

      const { error } = await supabase
        .from('study_group_members')
        .insert({ group_id: groupId, user_id: user.id, role: 'member' });
      if (error) {
        if (error.code === '23505') { setIsMember(true); fetchGroupDetails(); return; }
        alert('Failed to join: ' + error.message);
        return;
      }
      fetchGroupDetails();
    } catch (err) {
      console.error('Error joining group:', err);
      alert('Failed to join. Please try again.');
    }
  };

  const handleLeave = async () => {
    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      if (error) { alert('Failed to leave group: ' + error.message); return; }
      alert('You have left the group.');
      setShowLeaveConfirm(false);
      navigate('/study-groups');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to leave group. Please try again.');
    }
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPostImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen w-full grp-bg flex items-center justify-center relative">
        <GroupStyles />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: "radial-gradient(var(--grp-primary) 0.6px, transparent 0.6px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div className="text-center relative z-10">
          <FaSpinner className="text-3xl text-[var(--grp-primary)] animate-spin mx-auto mb-3" />
          <p className="font-ticket-body text-[var(--grp-txt-soft)] text-sm">
            Loading group...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error || !group) {
    return (
      <div className="min-h-screen w-full grp-bg flex items-center justify-center relative">
        <GroupStyles />
        <div className="text-center relative z-10 px-4">
          <FaExclamationTriangle className="text-4xl text-[var(--grp-danger)] mx-auto mb-4" />
          <p className="font-ticket-body text-[var(--grp-txt-soft)]">
            {error || 'Group not found'}
          </p>
          <Link
            to="/study-groups"
            className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-2xl bg-[var(--grp-primary)] text-white font-ticket-body font-bold text-sm hover:scale-[1.04] transition-all"
          >
            <FaArrowLeft className="text-xs" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  const catColor = getCategoryColor(group.subject);
  const typeMeta = GROUP_TYPE_META[group.meeting_type || 'public'];
  const langMeta = LANGUAGE_META[group.location || 'both'];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden grp-bg relative font-ticket-body">
      <GroupStyles />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2] z-0"
        style={{
          backgroundImage: "radial-gradient(var(--grp-primary) 0.6px, transparent 0.6px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 py-4 md:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Back */}
          <Link
            to="/study-groups"
            className="inline-flex items-center gap-2 font-ticket-body text-sm font-semibold text-[var(--grp-txt-soft)] hover:text-[var(--grp-primary)] transition-colors mb-4 md:mb-6"
          >
            <FaArrowLeft className="text-xs" />
            Back to Groups
          </Link>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grp-card overflow-hidden"
          >
            {/* Cover */}
            <div className="relative h-40 sm:h-48 md:h-56 bg-black">
              {group.cover_image_url ? (
                <img
                  src={group.cover_image_url}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${catColor.fg}dd, ${catColor.fg}88)` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {group.subject && (
                <span
                  className="absolute top-3 right-3 px-3 py-1 rounded-full font-ticket-body text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm"
                  style={{ backgroundColor: `${catColor.fg}ee`, color: '#fff' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {group.subject}
                </span>
              )}

              {isAdmin && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[var(--grp-primary)] text-white font-ticket-body text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FaShieldAlt className="text-[9px]" /> Admin
                </span>
              )}

              <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-[var(--grp-card)] flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden font-ticket-body"
                  style={{ background: `linear-gradient(135deg, ${catColor.fg}, ${catColor.fg}bb)` }}
                >
                  {group.image_url ? (
                    <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                  ) : (
                    group.name?.charAt(0).toUpperCase() || 'G'
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 pt-12 sm:pt-14">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-ticket-display text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--grp-txt)] tracking-tight">
                    {group.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="font-ticket-body text-sm font-semibold" style={{ color: catColor.fg }}>
                      {group.subject}
                    </span>
                    <span className="text-[var(--grp-txt-faint)]">•</span>
                    <span className="font-ticket-body text-xs text-[var(--grp-txt-soft)]">
                      {group.level}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full font-ticket-body text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ backgroundColor: catColor.bg, color: catColor.fg }}
                  >
                    <FaUsers className="text-[10px]" />
                    {members.length}/{group.max_members || '∞'} members
                  </span>
                </div>
              </div>

              {/* Description */}
              {group.description && (
                <p className="font-ticket-body text-sm text-[var(--grp-txt-soft)] leading-relaxed mt-3">
                  {group.description}
                </p>
              )}

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--grp-line)] bg-[var(--grp-card-2)]">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeMeta.bg, color: typeMeta.fg }}
                  >
                    <typeMeta.Icon className="text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-wider text-[var(--grp-txt-soft)]">
                      Group Type
                    </p>
                    <p className="font-ticket-body text-sm font-semibold text-[var(--grp-txt)]">
                      {typeMeta.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--grp-line)] bg-[var(--grp-card-2)]">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg bg-[var(--grp-hover)]">
                    {langMeta.flag}
                  </div>
                  <div className="min-w-0">
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-wider text-[var(--grp-txt-soft)]">
                      Language
                    </p>
                    <p className="font-ticket-body text-sm font-semibold text-[var(--grp-txt)]">
                      {langMeta.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--grp-line)] bg-[var(--grp-card-2)]">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--grp-primary-soft)] text-[var(--grp-primary)]">
                    <FaClock className="text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-wider text-[var(--grp-txt-soft)]">
                      Best Time
                    </p>
                    <p className="font-ticket-body text-sm font-semibold text-[var(--grp-txt)] truncate">
                      {group.schedule || 'Anytime'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rules */}
              {group.meeting_link && (
                <div className="mt-3 flex items-start gap-3 p-4 rounded-2xl border border-[var(--grp-primary)]/25 bg-[var(--grp-primary-soft)]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--grp-primary)]/15 text-[var(--grp-primary)]">
                    <FaBullhorn className="text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-ticket-body text-[10px] font-bold uppercase tracking-wider text-[var(--grp-primary)] mb-1">
                      Group Rules
                    </p>
                    <p className="font-ticket-body text-xs text-[var(--grp-txt-soft)] leading-relaxed whitespace-pre-line">
                      {group.meeting_link}
                    </p>
                  </div>
                </div>
              )}

              {/* Composer */}
              {isMember && (
                <div className="mt-6 p-4 rounded-2xl border border-[var(--grp-line)] bg-[var(--grp-card-2)]">
                  <div className="flex items-center gap-3">
                    <ComposerAvatar
                      userProfile={currentUserProfile}
                      group={group}
                      catColor={catColor}
                      size="h-10 w-10"
                      textSize="text-sm"
                    />
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 text-left px-4 py-2.5 bg-[var(--grp-input-bg)] rounded-full border border-[var(--grp-line)] font-ticket-body text-sm text-[var(--grp-txt-faint)] hover:border-[var(--grp-primary)] transition-colors truncate"
                    >
                      Share something with the group…
                    </button>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="p-2.5 rounded-full hover:bg-[var(--grp-primary-soft)] transition-colors flex-shrink-0"
                    >
                      <FaImage className="text-lg" style={{ color: '#22C55E' }} />
                    </button>
                  </div>
                </div>
              )}

              {/* Posts */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-ticket-display text-base font-bold text-[var(--grp-txt)] flex items-center gap-2">
                    <FaNewspaper style={{ color: ACCENT }} />
                    Posts ({posts.length})
                  </h3>
                </div>

                {posts.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-[var(--grp-line)] bg-[var(--grp-card-2)]">
                    <FaNewspaper className="text-4xl mx-auto mb-3 text-[var(--grp-txt-faint)]" />
                    <p className="font-ticket-body text-sm text-[var(--grp-txt-soft)]">
                      {isMember ? 'No posts yet. Be the first to share something!' : 'No posts yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        user={user}
                        currentUserProfile={currentUserProfile}
                        isMember={isMember}
                        onDelete={() => setDeletePostModal(post)}
                        onLike={() => handleLike(post.id)}
                        isLiked={likedPosts[post.id]}
                        onToggleComments={() => toggleComments(post.id)}
                        showComments={showComments[post.id]}
                        comments={comments[post.id] || []}
                        commentText={commentText[post.id] || ''}
                        onCommentChange={(text) =>
                          setCommentText((prev) => ({ ...prev, [post.id]: text }))
                        }
                        onCommentSubmit={() => handleCommentSubmit(post.id)}
                        submittingComment={submittingComment[post.id]}
                        formatTimeAgo={formatTimeAgo}
                        catColor={catColor}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Share */}
              <div className="mt-6 pt-5 border-t border-[var(--grp-line)]">
                <h3 className="font-ticket-display text-base font-bold text-[var(--grp-txt)] mb-3 flex items-center gap-2">
                  <FaShareAlt className="text-sm" style={{ color: ACCENT }} />
                  Invite people
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--grp-line)] bg-[var(--grp-card-2)] font-ticket-body text-sm font-semibold text-[var(--grp-txt)] hover:border-[var(--grp-primary)] transition-colors"
                  >
                    <FaCopy className="text-sm" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={shareWhatsApp}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-ticket-body text-sm font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] transition-colors"
                  >
                    <FaWhatsapp className="text-sm" />
                    WhatsApp
                  </button>
                  <button
                    onClick={shareEmail}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-ticket-body text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
                  >
                    <FaEnvelope className="text-sm" />
                    Email
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="mt-6 pt-5 border-t border-[var(--grp-line)]">
                <h3 className="font-ticket-display text-base font-bold text-[var(--grp-txt)] mb-3 flex items-center gap-2">
                  <FaUsers className="text-sm" style={{ color: ACCENT }} />
                  Members ({members.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const displayName = getDisplayName(member.users, 'User');
                    const avatarUrl = getAvatarUrl(member.users);
                    const isThisUser = member.user_id === user?.id;
                    const isThisAdmin = member.role === 'admin';

                    return (
                      <div
                        key={member.user_id}
                        className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors ${
                          isThisUser
                            ? 'border-[var(--grp-primary)]/60 bg-[var(--grp-primary-soft)]'
                            : 'border-[var(--grp-line)] bg-[var(--grp-card-2)]'
                        }`}
                      >
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold font-ticket-body flex-shrink-0 overflow-hidden"
                          style={{
                            background: avatarUrl
                              ? `url(${avatarUrl}) center/cover`
                              : `linear-gradient(135deg, ${catColor.fg}, ${catColor.fg}bb)`,
                          }}
                        >
                          {!avatarUrl && displayName.charAt(0).toUpperCase()}
                        </div>

                        <span className="font-ticket-body text-xs font-semibold text-[var(--grp-txt)] whitespace-nowrap">
                          {displayName}
                        </span>

                        {isThisUser && (
                          <span className="font-ticket-body text-[9px] font-bold text-[var(--grp-primary)] uppercase tracking-wider">
                            You
                          </span>
                        )}

                        {isThisAdmin && (
                          <FaShieldAlt
                            className="text-[10px]"
                            style={{ color: ACCENT }}
                            title="Admin"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="mt-6 pt-5 border-t border-[var(--grp-line)]">
                {isMember ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/chat`}
                      className="flex-1 min-w-[140px] px-6 py-3 rounded-2xl font-ticket-body font-bold text-sm text-center text-white transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{ background: ACCENT }}
                    >
                      <FaComments className="text-sm" />
                      Open Chat
                    </Link>
                    {!isAdmin && (
                      <button
                        onClick={() => setShowLeaveConfirm(true)}
                        className="px-6 py-3 rounded-2xl font-ticket-body font-bold text-sm text-[var(--grp-danger)] bg-[var(--grp-danger-soft)] hover:bg-[var(--grp-danger)]/20 transition-colors"
                      >
                        Leave Group
                      </button>
                    )}
                  </div>
                ) : group.status === 'full' || (group.max_members && members.length >= group.max_members) ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 rounded-2xl font-ticket-body font-bold text-sm bg-[var(--grp-hover)] text-[var(--grp-txt-faint)] cursor-not-allowed"
                  >
                    Group is Full
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="w-full px-6 py-3 rounded-2xl font-ticket-body font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DEEP})` }}
                  >
                    <FaUserPlus className="text-sm" />
                    Join Group
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="grp-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[var(--grp-card)] border-b border-[var(--grp-line)] px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Avatar
                    profile={currentUserProfile}
                    fallbackName="U"
                    size="h-10 w-10"
                    textSize="text-sm"
                  />
                  <div>
                    <h2 className="font-ticket-display text-lg font-bold text-[var(--grp-txt)]">
                      Create Post
                    </h2>
                    <p className="font-ticket-body text-xs text-[var(--grp-txt-soft)]">
                      Share with {group.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setPostData({ title: '', content: '', image_url: '' });
                    setPostImageFile(null);
                    setPostImagePreview(null);
                  }}
                  className="p-2 rounded-full hover:bg-[var(--grp-primary-soft)] transition-all"
                >
                  <FaTimes className="text-[var(--grp-txt-soft)] text-lg" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-4 sm:p-6 space-y-4">
                <input
                  type="text"
                  value={postData.title}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--grp-line)] bg-[var(--grp-input-bg)] focus:border-[var(--grp-primary)] outline-none transition-all font-ticket-body text-sm text-[var(--grp-txt)] placeholder:text-[var(--grp-txt-faint)]"
                  placeholder="Title (optional)"
                />

                <textarea
                  value={postData.content}
                  onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--grp-line)] bg-[var(--grp-input-bg)] focus:border-[var(--grp-primary)] outline-none transition-all font-ticket-body text-sm text-[var(--grp-txt)] placeholder:text-[var(--grp-txt-faint)] resize-none"
                  placeholder="What's on your mind?"
                />

                <div
                  className="relative h-40 rounded-xl overflow-hidden border-2 border-dashed border-[var(--grp-line-str)] hover:border-[var(--grp-primary)] transition-all cursor-pointer group bg-[var(--grp-input-bg)]"
                  onClick={() => postFileInputRef.current?.click()}
                >
                  {postImagePreview ? (
                    <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FaCamera className="text-3xl group-hover:scale-110 transition-transform" style={{ color: `${ACCENT}80` }} />
                      <p className="font-ticket-body text-xs text-[var(--grp-txt-soft)] mt-2">
                        Add a photo (optional)
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-ticket-body text-white text-sm font-semibold flex items-center gap-2">
                      <FaUpload /> {postImagePreview ? 'Change Image' : 'Upload Image'}
                    </span>
                  </div>
                  <input
                    ref={postFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageChange}
                    className="hidden"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--grp-line)]">
                  <button
                    type="button"
                    onClick={() => postFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--grp-primary-soft)] transition-colors font-ticket-body text-sm font-semibold text-[var(--grp-txt-soft)]"
                  >
                    <FaImage style={{ color: '#22C55E' }} />
                    Photo
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--grp-primary-soft)] transition-colors font-ticket-body text-sm font-semibold text-[var(--grp-txt-soft)]"
                  >
                    <FaSmile style={{ color: '#EAB308' }} />
                    Feeling
                  </button>
                  <span className="ml-auto font-ticket-body text-xs text-[var(--grp-txt-soft)] flex items-center gap-1">
                    <FaGlobe className="text-[10px]" /> Visible to group
                  </span>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--grp-line)]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePost(false);
                      setPostData({ title: '', content: '', image_url: '' });
                      setPostImageFile(null);
                      setPostImagePreview(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[var(--grp-line)] font-ticket-body font-semibold text-sm text-[var(--grp-txt)] hover:border-[var(--grp-primary)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing || !postData.content.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl font-ticket-body font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DEEP})` }}
                  >
                    {processing ? (
                      <FaSpinner className="animate-spin text-lg" />
                    ) : (
                      <>
                        <FaPaperPlane className="text-sm" /> Post
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Post Modal */}
      <AnimatePresence>
        {deletePostModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grp-card p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 border-[var(--grp-danger)]/50 bg-[var(--grp-danger-soft)]">
                  <FaExclamationTriangle className="text-2xl text-[var(--grp-danger)]" />
                </div>
                <h3 className="font-ticket-display text-xl font-bold text-[var(--grp-txt)] mb-2">
                  Delete Post
                </h3>
                <p className="font-ticket-body text-sm text-[var(--grp-txt-soft)] mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletePostModal(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--grp-line)] font-ticket-body font-semibold text-sm text-[var(--grp-txt)] hover:border-[var(--grp-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePost(deletePostModal.id)}
                    className="flex-1 px-4 py-2.5 bg-[var(--grp-danger)] text-white font-ticket-body font-semibold text-sm rounded-xl hover:opacity-90 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Group Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grp-card p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 border-[var(--grp-danger)]/50 bg-[var(--grp-danger-soft)]">
                  <FaExclamationTriangle className="text-2xl text-[var(--grp-danger)]" />
                </div>
                <h3 className="font-ticket-display text-xl font-bold text-[var(--grp-txt)] mb-2">
                  Leave Group
                </h3>
                <p className="font-ticket-body text-sm text-[var(--grp-txt-soft)] mb-6">
                  Are you sure you want to leave this group? You can always rejoin later if space is available.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--grp-line)] font-ticket-body font-semibold text-sm text-[var(--grp-txt)] hover:border-[var(--grp-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeave}
                    className="flex-1 px-4 py-2.5 bg-[var(--grp-danger)] text-white font-ticket-body font-semibold text-sm rounded-xl hover:opacity-90 transition-colors"
                  >
                    Leave
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

/* ─── Post Card ─── */
const PostCard = ({
  post,
  user,
  currentUserProfile,
  isMember,
  onDelete,
  onLike,
  isLiked,
  onToggleComments,
  showComments,
  comments,
  commentText,
  onCommentChange,
  onCommentSubmit,
  submittingComment,
  formatTimeAgo,
  catColor,
}) => {
  const isOwner = user?.id === post.user_id;

  // Use the passed user row, fall back to current user if this post belongs to them
  const authorProfile =
    post.users || (isOwner ? currentUserProfile : null);
  const displayName = getDisplayName(authorProfile, 'Anonymous');
  const avatarUrl = getAvatarUrl(authorProfile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grp-card overflow-hidden hover:border-[var(--grp-primary)]/60 transition-colors duration-200"
    >
      {/* Header */}
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 font-ticket-body overflow-hidden"
              style={{
                background: avatarUrl
                  ? `url(${avatarUrl}) center/cover`
                  : `linear-gradient(135deg, ${catColor.fg}, ${catColor.fg}bb)`,
              }}
            >
              {!avatarUrl && displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-ticket-body text-xs font-bold text-[var(--grp-txt)]">
                  {displayName}
                </span>
                {isOwner && (
                  <span
                    className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: catColor.bg, color: catColor.fg }}
                  >
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 font-ticket-body text-[10px] text-[var(--grp-txt-soft)]">
                <span>{formatTimeAgo(post.created_at)}</span>
                <span>•</span>
                <FaGlobe className="text-[8px]" />
              </div>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full hover:bg-[var(--grp-danger-soft)] text-[var(--grp-txt-soft)] hover:text-[var(--grp-danger)] transition-colors"
              title="Delete"
            >
              <FaTrash className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-2">
        {post.title && post.title !== post.content?.slice(0, 60) && (
          <h4 className="font-ticket-display text-sm font-bold text-[var(--grp-txt)]">
            {post.title}
          </h4>
        )}
        <p className="font-ticket-body text-sm text-[var(--grp-txt-soft)] mt-1 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
        {post.image_url && (
          <div className="mt-2 rounded-xl overflow-hidden bg-[var(--grp-hover)]">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full object-contain max-h-80"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--grp-line)] mt-2">
        <div className="flex items-center gap-1.5 font-ticket-body text-[10px] text-[var(--grp-txt-soft)]">
          <span className="h-4 w-4 rounded-full bg-[#C24B7A]/15 flex items-center justify-center">
            <FaHeart className="text-[7px] text-[#C24B7A]" />
          </span>
          <span className="font-semibold">{post.likes || 0}</span>
        </div>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1 font-ticket-body text-[10px] text-[var(--grp-txt-soft)] hover:text-[var(--grp-primary)] transition-colors"
        >
          <span className="font-semibold">{post.comments || 0}</span>
          <span>comments</span>
        </button>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-around">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-ticket-body text-xs font-semibold transition-all duration-200 ${
            isLiked
              ? 'text-[#C24B7A] bg-[#C24B7A]/10'
              : 'text-[var(--grp-txt-soft)] hover:bg-[#C24B7A]/10 hover:text-[#C24B7A]'
          }`}
        >
          {isLiked ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
          <span>Like</span>
        </button>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-ticket-body text-xs font-semibold text-[var(--grp-txt-soft)] hover:bg-[var(--grp-primary-soft)] hover:text-[var(--grp-primary)] transition-colors"
        >
          <FaComments className="text-sm" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-ticket-body text-xs font-semibold text-[var(--grp-txt-soft)] hover:bg-[#2A8FBD]/10 hover:text-[#2A8FBD] transition-colors">
          <FaShareAlt className="text-sm" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[var(--grp-line)] p-3 bg-[var(--grp-card-2)]"
          >
            {isMember && (
              <div className="flex gap-2 mb-3">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 font-ticket-body overflow-hidden"
                  style={{
                    background: getAvatarUrl(currentUserProfile)
                      ? `url(${getAvatarUrl(currentUserProfile)}) center/cover`
                      : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
                  }}
                >
                  {!getAvatarUrl(currentUserProfile) &&
                    getDisplayName(currentUserProfile, 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => onCommentChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onCommentSubmit()}
                    className="flex-1 px-4 py-2 bg-[var(--grp-input-bg)] border border-[var(--grp-line)] rounded-full font-ticket-body text-sm text-[var(--grp-txt)] focus:border-[var(--grp-primary)] outline-none transition-colors placeholder:text-[var(--grp-txt-faint)]"
                  />
                  <button
                    onClick={onCommentSubmit}
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-2 rounded-full font-ticket-body text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DEEP})` }}
                  >
                    {submittingComment ? (
                      <FaSpinner className="animate-spin text-xs" />
                    ) : (
                      <FaPaperPlane className="text-xs" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center font-ticket-body text-xs text-[var(--grp-txt-faint)] py-3">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => {
                  const cProfile = comment.users;
                  const cName = getDisplayName(cProfile, 'Anonymous');
                  const cAvatar = getAvatarUrl(cProfile);

                  return (
                    <div key={comment.id} className="flex gap-2">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 font-ticket-body overflow-hidden"
                        style={{
                          background: cAvatar
                            ? `url(${cAvatar}) center/cover`
                            : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
                        }}
                      >
                        {!cAvatar && cName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="bg-[var(--grp-card)] rounded-2xl px-3 py-2 border border-[var(--grp-line)]">
                          <div className="flex items-center gap-2">
                            <span className="font-ticket-body text-[11px] font-bold text-[var(--grp-txt)]">
                              {cName}
                            </span>
                            <span className="font-ticket-body text-[9px] text-[var(--grp-txt-faint)]">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className="font-ticket-body text-xs text-[var(--grp-txt-soft)] mt-0.5 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GroupDetail;