// pages/GroupDetail.jsx - With Facebook-style Create Post
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaArrowLeft,
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaCalendarAlt,
  FaUserPlus,
  FaComments,
  FaShieldAlt,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaCopy,
  FaWhatsapp,
  FaEnvelope,
  FaShareAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlus,
  FaNewspaper,
  FaThumbsUp,
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
  FaEllipsisH,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch group details
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

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('study_group_members')
        .select(`
          user_id,
          role,
          joined_at,
          users:user_id (
            name,
            email
          )
        `)
        .eq('group_id', groupId);

      if (!membersError) {
        setMembers(membersData || []);
        
        if (user) {
          const userMember = membersData?.find(m => m.user_id === user.id);
          setIsMember(!!userMember);
          setIsAdmin(userMember?.role === 'admin');
        }
      }

      // Fetch posts for this group
      const { data: postsData, error: postsError } = await supabase
        .from('study_group_posts')
        .select(`
          *,
          users:user_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (!postsError) {
        setPosts(postsData || []);
      }

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload Image ──────────────────────────────────────────────────
  const uploadImage = async (file, folder) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('study-group-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('study-group-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // ─── Create Post ─────────────────────────────────────────────────────
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    // Check if user is a member
    if (!isMember) {
      alert('You must be a member of this group to create posts.');
      return;
    }

    if (!postData.title.trim() || !postData.content.trim()) {
      alert('Please fill in both title and content.');
      return;
    }

    setProcessing(true);

    try {
      let imageUrl = null;

      if (postImageFile) {
        imageUrl = await uploadImage(postImageFile, 'post-images');
      }

      const { data, error } = await supabase
        .from('study_group_posts')
        .insert({
          title: postData.title,
          content: postData.content,
          group_id: groupId,
          user_id: user.id,
          image_url: imageUrl,
          likes: 0,
          comments: 0,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post: ' + error.message);
        setProcessing(false);
        return;
      }

      // Add the new post to the list
      if (data && data.length > 0) {
        const newPost = {
          ...data[0],
          users: {
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url
          }
        };
        setPosts(prev => [newPost, ...prev]);
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

  // ─── Delete Post ─────────────────────────────────────────────────────
  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('study_group_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        alert('Failed to delete post: ' + error.message);
        return;
      }

      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeletePostModal(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  // ─── Like Post ──────────────────────────────────────────────────────
  const handleLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    // Update like count in UI
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = likedPosts[postId];
        return {
          ...post,
          likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1
        };
      }
      return post;
    }));
  };

  // ─── Fetch Comments ──────────────────────────────────────────────────
  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          users:user_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // ─── Toggle Comments ──────────────────────────────────────────────────
  const toggleComments = async (postId) => {
    const isOpen = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !isOpen }));
    
    if (!isOpen && !comments[postId]) {
      await fetchComments(postId);
    }
  };

  // ─── Submit Comment ──────────────────────────────────────────────────
  const handleCommentSubmit = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText[postId],
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Error submitting comment:', error);
        alert('Failed to submit comment');
        return;
      }

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
      
      // Update comment count
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, comments: (post.comments || 0) + 1 };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // ─── Copy Link ──────────────────────────────────────────────────────
  const copyLink = () => {
    const url = `https://studyassistants.netlify.app/study-groups/${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Share via WhatsApp ────────────────────────────────────────────
  const shareWhatsApp = () => {
    const url = `https://studyassistants.netlify.app/study-groups/${groupId}`;
    const text = `Join my study group: ${group?.name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`, '_blank');
  };

  // ─── Share via Email ──────────────────────────────────────────────
  const shareEmail = () => {
    const url = `https://studyassistants.netlify.app/study-groups/${groupId}`;
    const subject = `Join my study group: ${group?.name}`;
    const body = `Hi,\n\nI'd like to invite you to join my study group: ${group?.name}\n\nGroup Details:\nSubject: ${group?.subject}\nLevel: ${group?.level}\nSchedule: ${group?.schedule}\n\nJoin here: ${url}\n\nHope to see you there!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // ─── Join Group ──────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      const { error } = await supabase
        .from('study_group_requests')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: 'I would like to join this study group!',
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          alert('You already have a pending request for this group.');
        } else {
          alert('Failed to send join request: ' + error.message);
        }
        return;
      }

      alert('✅ Join request sent! The group admin will review your request.');
      fetchGroupDetails();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to send join request. Please try again.');
    }
  };

  // ─── Leave Group ──────────────────────────────────────────────────────
  const handleLeave = async () => {
    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        alert('Failed to leave group: ' + error.message);
        return;
      }

      alert('You have left the group.');
      setShowLeaveConfirm(false);
      navigate('/study-groups');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to leave group. Please try again.');
    }
  };

  // ─── Handle Post Image Change ──────────────────────────────────────
  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Format Time ──────────────────────────────────────────────────────
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="text-center">
          <div className="inline-block h-10 w-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="text-center">
          <p className="text-stone-500 dark:text-stone-400">{error || 'Group not found'}</p>
          <Link to="/study-groups">
            <button className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-full">
              Back to Groups
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getMeetingIcon = (type) => {
    switch (type) {
      case 'virtual': return <FaVideo className="text-blue-500" />;
      case 'in-person': return <FaMapMarkerAlt className="text-amber-500" />;
      case 'hybrid': return <FaUsers className="text-purple-500" />;
      default: return <FaVideo className="text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* ─── Back Button ────────────────────────────────────────────── */}
        <Link
          to="/study-groups"
          className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors mb-4 md:mb-6 text-sm"
        >
          <FaArrowLeft className="text-xs" />
          Back to Groups
        </Link>

        {/* ─── Main Card ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-stone-900 rounded-2xl md:rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl"
        >
          {/* ─── Cover Image ────────────────────────────────────────────── */}
          <div className="relative h-40 sm:h-48 md:h-56 bg-gradient-to-r from-amber-500/30 to-orange-500/30">
            {group.cover_image_url ? (
              <img src={group.cover_image_url} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Logo */}
            <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-4 border-white dark:border-stone-900 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-xl overflow-hidden">
                {group.image_url ? (
                  <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  group.name?.charAt(0).toUpperCase() || 'G'
                )}
              </div>
            </div>
          </div>

          {/* ─── Content ────────────────────────────────────────────────── */}
          <div className="p-4 sm:p-6 pt-12 sm:pt-14">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">
                  {group.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {group.subject}
                  </span>
                  <span className="text-stone-300 dark:text-stone-600">•</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {group.level}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isAdmin && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full">
                    <FaShieldAlt className="text-[10px]" />
                    Admin
                  </span>
                )}
                {group.status === 'full' && (
                  <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-full">
                    Full
                  </span>
                )}
                <span className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <FaUsers className="text-[10px]" />
                  {members.length} members
                </span>
              </div>
            </div>

            {/* Description */}
            {group.description && (
              <div className="mt-3">
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {group.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                  {getMeetingIcon(group.meeting_type)}
                </div>
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Meeting Type</p>
                  <p className="text-sm font-medium text-stone-900 dark:text-white capitalize">
                    {group.meeting_type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <FaClock className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Schedule</p>
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    {group.schedule || 'Flexible'}
                  </p>
                </div>
              </div>

              {group.meeting_link && (
                <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl sm:col-span-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <FaVideo className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 dark:text-stone-400">Meeting Link</p>
                    <a
                      href={group.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline truncate block"
                    >
                      {group.meeting_link}
                    </a>
                  </div>
                </div>
              )}

              {group.location && (
                <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl sm:col-span-2">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Location</p>
                    <p className="text-sm font-medium text-stone-900 dark:text-white">
                      {group.location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── CREATE POST ────────────────────────────────────────── */}
            {isMember && (
              <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex-1 text-left px-4 py-2.5 bg-white dark:bg-stone-900 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-400 dark:text-stone-500 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
                  >
                    What's on your mind, {user?.name?.split(' ')[0] || 'User'}?
                  </button>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="p-2.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    <FaImage className="text-green-500 text-lg" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── Posts Section ────────────────────────────────────────── */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <FaNewspaper className="text-amber-500" />
                  Posts ({posts.length})
                </h3>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 dark:bg-stone-800/30 rounded-xl">
                  <FaNewspaper className="text-4xl text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                  <p className="text-sm text-stone-500 dark:text-stone-400">
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
                      isMember={isMember}
                      onDelete={() => setDeletePostModal(post)}
                      onLike={() => handleLike(post.id)}
                      isLiked={likedPosts[post.id]}
                      onToggleComments={() => toggleComments(post.id)}
                      showComments={showComments[post.id]}
                      comments={comments[post.id] || []}
                      commentText={commentText[post.id] || ''}
                      onCommentChange={(text) => setCommentText(prev => ({ ...prev, [post.id]: text }))}
                      onCommentSubmit={() => handleCommentSubmit(post.id)}
                      submittingComment={submittingComment[post.id]}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─── Share Section ────────────────────────────────────────── */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                Share this group
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  <FaCopy className="text-sm" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp className="text-sm" />
                  WhatsApp
                </button>
                <button
                  onClick={shareEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <FaEnvelope className="text-sm" />
                  Email
                </button>
              </div>
            </div>

            {/* ─── Members List ──────────────────────────────────────────── */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                Members ({members.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 dark:bg-stone-800/50 rounded-full"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {member.users?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs text-stone-700 dark:text-stone-300">
                      {member.users?.name || 'Anonymous'}
                    </span>
                    {member.role === 'admin' && (
                      <FaShieldAlt className="text-[10px] text-amber-500" title="Admin" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Actions ────────────────────────────────────────────────── */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
              {isMember ? (
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/study-group-chat/${groupId}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all text-sm"
                  >
                    <FaComments className="inline mr-2" />
                    Go to Chat
                  </Link>
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm"
                  >
                    Leave Group
                  </button>
                </div>
              ) : group.status === 'full' ? (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 rounded-xl font-semibold cursor-not-allowed text-sm"
                >
                  Group is Full
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                >
                  <FaUserPlus className="inline mr-2" />
                  Join Group
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Create Post Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200/50 dark:border-stone-800/50"
            >
              <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">Create Post</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Share with {group.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCreatePost(false); setPostData({ title: '', content: '', image_url: '' }); setPostImageFile(null); setPostImagePreview(null); }}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300"
                >
                  <FaTimes className="text-stone-500 dark:text-stone-400 text-lg" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-4 sm:p-6 space-y-4">
                <div>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData({...postData, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                    placeholder="Post title..."
                  />
                </div>

                <div>
                  <textarea
                    value={postData.content}
                    onChange={(e) => setPostData({...postData, content: e.target.value})}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700 rounded-xl focus:border-amber-400 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>

                <div>
                  <div
                    className="relative h-32 rounded-xl overflow-hidden border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-amber-400 transition-all cursor-pointer group bg-stone-50 dark:bg-stone-800/50"
                    onClick={() => postFileInputRef.current?.click()}
                  >
                    {postImagePreview ? (
                      <img src={postImagePreview} alt="Post preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <FaCamera className="text-3xl text-stone-400 dark:text-stone-500 group-hover:scale-110 transition-transform" />
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Click to upload image</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium flex items-center gap-2"><FaUpload /> Change Image</span>
                    </div>
                    <input ref={postFileInputRef} type="file" accept="image/*" onChange={handlePostImageChange} className="hidden" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 dark:border-stone-800 pt-4">
                  <button
                    type="button"
                    onClick={() => postFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm text-stone-600 dark:text-stone-400"
                  >
                    <FaImage className="text-green-500" />
                    Photo
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm text-stone-600 dark:text-stone-400"
                  >
                    <FaSmile className="text-yellow-500" />
                    Feeling
                  </button>
                  <span className="ml-auto text-xs text-stone-400">
                    <FaGlobe className="inline mr-1" /> Public
                  </span>
                </div>

                <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => { setShowCreatePost(false); setPostData({ title: '', content: '', image_url: '' }); setPostImageFile(null); setPostImagePreview(null); }}
                    className="flex-1 px-4 py-2.5 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing || !postData.title.trim() || !postData.content.trim()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? <FaSpinner className="animate-spin text-lg" /> : <><FaPaperPlane className="text-sm" /> Post</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Post Confirmation Modal ───────────────────────────── */}
      <AnimatePresence>
        {deletePostModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-stone-900 p-6 rounded-2xl max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/30 flex items-center justify-center">
                  <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                  Delete Post
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletePostModal(null)}
                    className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePost(deletePostModal.id)}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Leave Confirmation Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-stone-900 p-6 rounded-2xl max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/30 flex items-center justify-center">
                  <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                  Leave Group
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Are you sure you want to leave this group? You can always rejoin later if space is available.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeave}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
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

// ─── Post Card Component ──────────────────────────────────────────────
const PostCard = ({ 
  post, 
  user, 
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
  formatTimeAgo
}) => {
  const isOwner = user?.id === post.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Post Header */}
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {post.users?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-stone-900 dark:text-white">
                  {post.users?.name || 'Anonymous'}
                </span>
                {post.users?.is_premium && (
                  <span className="text-amber-500 text-[8px]">⭐</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500">
                <span>{formatTimeAgo(post.created_at)}</span>
                <span>•</span>
                <FaGlobe className="text-[8px]" />
              </div>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-500 transition-colors"
            >
              <FaTrash className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-3 pt-2">
        <h4 className="text-sm font-semibold text-stone-900 dark:text-white">
          {post.title}
        </h4>
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
          {post.content}
        </p>
        {post.image_url && (
          <div className="mt-2 rounded-xl overflow-hidden max-h-64 bg-stone-100 dark:bg-stone-800">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full object-contain max-h-64"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500">
          <span className="font-medium">{post.likes || 0}</span>
          <span>likes</span>
        </div>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 hover:text-amber-500 transition-colors"
        >
          <span className="font-medium">{post.comments || 0}</span>
          <span>comments</span>
        </button>
      </div>

      {/* Post Actions */}
      <div className="px-2 py-1 flex items-center justify-around">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            isLiked
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          {isLiked ? (
            <FaHeart className="text-sm" />
          ) : (
            <FaRegHeart className="text-sm" />
          )}
          <span>Like</span>
        </button>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <FaComments className="text-sm" />
          <span>Comment</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <FaShareAlt className="text-sm" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-stone-100 dark:border-stone-800 p-3 bg-stone-50 dark:bg-stone-900/50"
          >
            {/* Comment Input */}
            {isMember && (
              <div className="flex gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => onCommentChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onCommentSubmit()}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-sm focus:border-amber-400 outline-none transition-colors"
                  />
                  <button
                    onClick={onCommentSubmit}
                    disabled={submittingComment || !commentText.trim()}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
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

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-[10px] text-stone-400 dark:text-stone-500 py-2">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                      {comment.users?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-stone-800 rounded-xl px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-stone-900 dark:text-white">
                            {comment.users?.name || 'Anonymous'}
                          </span>
                          <span className="text-[8px] text-stone-400 dark:text-stone-500">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GroupDetail;