// pages/StudyPosts.jsx - Modern Design with Small Search Bar
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaNewspaper,
  FaComments,
  FaExclamationTriangle,
  FaShare,
  FaPlus,
  FaBookmark,
  FaSpinner,
  FaCamera,
  FaImage,
  FaUsers,
  FaGlobe,
  FaFire,
  FaRegBookmark,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaRegHeart,
  FaPaperPlane,
  FaTimes,
  FaUpload,
  FaDownload,
  FaExpand,
  FaVideo,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaSearch,
  FaEllipsisH,
  FaRetweet,
  FaChartBar,
  FaRegSmile,
  FaDollarSign,
  FaPoll,
  FaSmile,
  FaHashtag,
  FaAt,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const StudyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  
  // ─── Editor States ──────────────────────────────────────────────────
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [postMediaFile, setPostMediaFile] = useState(null);
  const [postMediaPreview, setPostMediaPreview] = useState(null);
  const [uploadType, setUploadType] = useState('image');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [postPrice, setPostPrice] = useState('');
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('7d');
  
  // ─── Other States ──────────────────────────────────────────────────
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [fullscreenMediaType, setFullscreenMediaType] = useState('image');
  const [videoPlaying, setVideoPlaying] = useState({});
  const [videoMuted, setVideoMuted] = useState({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [videoVisibility, setVideoVisibility] = useState({});
  const [videoProgress, setVideoProgress] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRefs = useRef({});
  const videoContainerRefs = useRef({});
  const observerRef = useRef(null);

  const isVideoFile = (file) => file && file.type && file.type.startsWith('video/');
  const isImageFile = (file) => file && file.type && file.type.startsWith('image/');

  const getMediaTypeFromUrl = (url) => {
    if (!url) return 'image';
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
    return videoExtensions.includes(extension) ? 'video' : 'image';
  };

  // ─── Link Detection ──────────────────────────────────────────────────
  const detectLinks = (text) => {
    if (!text) return false;
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|io|dev|app|xyz|online|tech|co|uk|in|ai|netlify|vercel|github|heroku|replit|glitch|codepen|stackblitz)\b)/i;
    return urlPattern.test(text);
  };

  // ─── Detect Hashtags and Mentions ──────────────────────────────────
  const detectHashtagsAndMentions = (text) => {
    if (!text) return { hashtags: [], mentions: [] };
    
    const hashtagPattern = /#[\w\u0590-\u05fe]+/g;
    const mentionPattern = /@[\w\u0590-\u05fe]+/g;
    
    const hashtags = text.match(hashtagPattern) || [];
    const mentions = text.match(mentionPattern) || [];
    
    return { hashtags, mentions };
  };

  // ─── Render Content with Links, Hashtags & Mentions ──────────────
  const renderContentWithLinks = (text) => {
    if (!text) return text;
    
    const { hashtags, mentions } = detectHashtagsAndMentions(text);
    
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|io|dev|app|xyz|online|tech|co|uk|in|ai|netlify|vercel|github|heroku|replit|glitch|codepen|stackblitz)\b)/gi;
    const hashtagPattern = /#[\w\u0590-\u05fe]+/g;
    const mentionPattern = /@[\w\u0590-\u05fe]+/g;
    
    const combinedPattern = new RegExp(`(${urlPattern.source}|${hashtagPattern.source}|${mentionPattern.source})`, 'gi');
    
    const parts = text.split(combinedPattern);
    const matches = text.match(combinedPattern) || [];
    
    let result = [];
    let matchIndex = 0;
    
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        if (part) {
          result.push(part);
        }
      } else if (matchIndex < matches.length) {
        const match = matches[matchIndex];
        
        if (match.match(urlPattern)) {
          result.push(
            <a 
              key={index}
              href={match.startsWith('http') ? match : `https://${match}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline font-medium break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {match}
            </a>
          );
        } else if (match.match(hashtagPattern)) {
          result.push(
            <span 
              key={index}
              className="text-amber-500 hover:text-amber-600 font-medium cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?q=${encodeURIComponent(match)}`);
              }}
            >
              {match}
            </span>
          );
        } else if (match.match(mentionPattern)) {
          const username = match.substring(1);
          result.push(
            <span 
              key={index}
              className="text-blue-400 hover:text-blue-500 font-medium cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${encodeURIComponent(username)}`);
              }}
            >
              {match}
            </span>
          );
        } else {
          result.push(match);
        }
        matchIndex++;
      }
    });
    
    return result;
  };

  // ─── Filter posts by search query ──────────────────────────────────
  const getFilteredPosts = () => {
    let filtered = posts;
    
    switch (activeFilter) {
      case 'trending':
        filtered = filtered.filter(p => (p.likes || 0) > 5);
        break;
      case 'saved':
        filtered = filtered.filter(p => savedPosts[p.id]);
        break;
      default:
        break;
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post => {
        if (post.title?.toLowerCase().includes(query)) return true;
        if (post.content?.toLowerCase().includes(query)) return true;
        if (post.users?.name?.toLowerCase().includes(query)) return true;
        if (post.study_groups?.name?.toLowerCase().includes(query)) return true;
        if (post.content && detectHashtagsAndMentions(post.content).hashtags.some(h => h.toLowerCase().includes(query))) return true;
        if (post.content && detectHashtagsAndMentions(post.content).mentions.some(m => m.toLowerCase().includes(query))) return true;
        return false;
      });
    }
    
    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  // ─── Emoji List ──────────────────────────────────────────────────────
  const emojis = [
    '😊', '😂', '🤣', '❤️', '🔥', '👏', '👍', '🙏', '💯', '✨', 
    '🎉', '🥳', '😍', '🤗', '😎', '💪', '🧠', '📚', '🌟', '⭐',
    '💡', '🎯', '🏆', '🎓', '📝', '✏️', '📖', '🔍', '💻', '📱',
    '🎮', '🎵', '🎶', '🎨', '🌈', '⚡', '🔥', '💎', '👑', '🚀'
  ];

  useEffect(() => {
    fetchPosts();
    fetchUserGroups();
    const saved = localStorage.getItem('saved_posts');
    if (saved) {
      try { setSavedPosts(JSON.parse(saved)); } catch (e) { console.error('Error parsing saved posts:', e); }
    }
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && fullscreenMedia) setFullscreenMedia(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [fullscreenMedia]);

  useEffect(() => {
    posts.forEach(post => {
      const mediaType = post.media_type || getMediaTypeFromUrl(post.image_url);
      if (mediaType === 'video' && !videoMuted[post.id]) {
        setVideoMuted(prev => ({ ...prev, [post.id]: false }));
        setVideoPlaying(prev => ({ ...prev, [post.id]: true }));
        setVideoVisibility(prev => ({ ...prev, [post.id]: true }));
        setVideoProgress(prev => ({ ...prev, [post.id]: 0 }));
      }
    });
  }, [posts]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.dataset.postId;
          if (!postId) return;

          const isVisible = entry.isIntersecting;
          setVideoVisibility(prev => ({ ...prev, [postId]: isVisible }));

          const video = videoRefs.current[postId];
          if (video) {
            if (isVisible) {
              video.play().catch(e => console.log('Play error:', e));
              setVideoPlaying(prev => ({ ...prev, [postId]: true }));
              video.muted = false;
              setVideoMuted(prev => ({ ...prev, [postId]: false }));
            } else {
              video.pause();
              setVideoPlaying(prev => ({ ...prev, [postId]: false }));
              video.muted = true;
              setVideoMuted(prev => ({ ...prev, [postId]: true }));
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    Object.values(videoContainerRefs.current).forEach((container) => {
      if (container) observerRef.current.observe(container);
    });

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [posts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Object.values(videoContainerRefs.current).forEach((container) => {
        if (container && observerRef.current) observerRef.current.observe(container);
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [posts]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('study_group_posts')
        .select(`*, users:user_id (name, email, avatar_url), study_groups:group_id (id, name)`)
        .order('created_at', { ascending: false });

      if (error) { console.error('Error fetching posts:', error); setError('Failed to load posts'); return; }
      setPosts(data || []);
      
      if (user) {
        const { data: likedData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);
        if (likedData) {
          const likedMap = {};
          likedData.forEach(item => { likedMap[item.post_id] = true; });
          setLikedPosts(likedMap);
        }
      }
    } catch (err) { console.error('Error:', err); setError('Failed to load posts'); }
    finally { setLoading(false); }
  };

  const fetchUserGroups = async () => {
    if (!user) { setLoadingGroups(false); return; }
    setLoadingGroups(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('study_group_members')
        .select('group_id, role')
        .eq('user_id', user.id);

      if (memberError || !memberData || memberData.length === 0) {
        setUserGroups([]);
        setLoadingGroups(false);
        return;
      }

      const groupIds = memberData.map(m => m.group_id);
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('id, name')
        .in('id', groupIds);

      if (groupsData && groupsData.length > 0) {
        const groups = groupsData.map(group => ({ id: group.id, name: group.name || 'Unknown Group' }));
        setUserGroups(groups);
        setSelectedGroup(groups[0].id);
      } else {
        setUserGroups([]);
      }
    } catch (err) { console.error('Error in fetchUserGroups:', err); setUserGroups([]); }
    finally { setLoadingGroups(false); }
  };

  const uploadMedia = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `post-media/${fileName}`;
    const { error } = await supabase.storage.from('study-group-images').upload(filePath, file);
    if (error) { console.error('Error uploading media:', error); return null; }
    const { data: urlData } = supabase.storage.from('study-group-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleLike = async (postId) => {
    if (!user) { alert('Please sign in to like posts'); return; }
    const isLiked = likedPosts[postId];
    const currentPost = posts.find(p => p.id === postId);
    const currentLikes = currentPost?.likes || 0;
    const newLikeCount = isLiked ? currentLikes - 1 : currentLikes + 1;
    
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: newLikeCount } : post
    ));

    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id, created_at: new Date().toISOString() });
      }
      await supabase.from('study_group_posts').update({ likes: newLikeCount }).eq('id', postId);
    } catch (err) { 
      console.error('Error toggling like:', err);
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: currentLikes } : post
      ));
      alert('Failed to update like. Please try again.');
    }
  };

  const handleSave = (postId) => {
    const isSaved = savedPosts[postId];
    const newSaved = { ...savedPosts, [postId]: !isSaved };
    setSavedPosts(newSaved);
    localStorage.setItem('saved_posts', JSON.stringify(newSaved));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (isVideoFile(file)) setUploadType('video');
      else if (isImageFile(file)) setUploadType('image');
      else { alert('Please upload an image or video file'); return; }
      setPostMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPostMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setPostMediaFile(null);
    setPostMediaPreview(null);
    setUploadType('image');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadMedia = async (mediaUrl, filename) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'media';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error('Error downloading media:', err); alert('Failed to download media. Please try again.'); }
  };

  // ─── Add poll option ──────────────────────────────────────────────────
  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // ─── Handle create post ──────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (userGroups.length === 0) {
      alert('You need to join or create a study group first before creating a post.');
      return;
    }
    if (!postContent.trim() && !postMediaFile && !isPoll) {
      alert('Please add some content, media, or a poll.');
      return;
    }
    if (!selectedGroup) {
      alert('Please select a group.');
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl = null, mediaType = 'image';
      if (postMediaFile) { mediaUrl = await uploadMedia(postMediaFile); mediaType = uploadType; }

      let pollData = null;
      if (isPoll) {
        const validOptions = pollOptions.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          alert('Please add at least 2 poll options.');
          setSubmitting(false);
          return;
        }
        pollData = {
          options: validOptions,
          duration: pollDuration,
          votes: validOptions.map(() => 0),
          totalVotes: 0,
          created_at: new Date().toISOString()
        };
      }

      const postData = {
        title: postTitle || 'Untitled Post',
        content: postContent,
        group_id: selectedGroup,
        user_id: user.id,
        image_url: mediaUrl,
        media_type: mediaType,
        price: postPrice || null,
        is_poll: isPoll || false,
        poll_data: pollData,
        likes: 0,
        comments: 0,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('study_group_posts')
        .insert([postData])
        .select();

      if (error) { console.error('Error creating post:', error); alert('Failed to create post: ' + error.message); return; }

      if (data && data.length > 0) {
        const newPost = {
          ...data[0],
          users: { name: user.name, email: user.email, avatar_url: user.avatar_url },
          study_groups: { id: selectedGroup, name: userGroups.find(g => g.id === selectedGroup)?.name || 'Unknown Group' }
        };
        setPosts(prev => [newPost, ...prev]);
      }

      // Reset form
      setPostContent('');
      setPostTitle('');
      setPostMediaFile(null);
      setPostMediaPreview(null);
      setUploadType('image');
      setShowPriceInput(false);
      setPostPrice('');
      setIsPoll(false);
      setPollOptions(['', '']);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) { console.error('Error:', err); alert('Failed to create post. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error } = await supabase.from('study_group_posts').delete().eq('id', postId).eq('user_id', user.id);
      if (error) { alert('Failed to delete post: ' + error.message); return; }
      setPosts(prev => prev.filter(p => p.id !== postId));
      alert('Post deleted successfully!');
    } catch (err) { console.error('Error:', err); alert('Failed to delete post. Please try again.'); }
  };

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`*, users:user_id (name, email, avatar_url)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) { console.error('Error fetching comments:', error); return; }
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (err) { console.error('Error:', err); }
  };

  const toggleComments = async (postId) => {
    const isOpen = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen && !comments[postId]) await fetchComments(postId);
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) { alert('Please sign in to comment'); return; }
    if (!commentText[postId]?.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, user_id: user.id, content: commentText[postId], created_at: new Date().toISOString() })
        .select();

      if (error) { console.error('Error submitting comment:', error); alert('Failed to submit comment'); return; }

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
      await supabase.from('study_group_posts').update({ comments: (posts.find(p => p.id === postId)?.comments || 0) + 1 }).eq('id', postId);
      setPosts(prev => prev.map(post => post.id === postId ? { ...post, comments: (post.comments || 0) + 1 } : post));
    } catch (err) { console.error('Error:', err); }
    finally { setSubmittingComment(prev => ({ ...prev, [postId]: false })); }
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

  const toggleVideoPlay = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      if (video.paused) {
        video.play().catch(e => console.log('Play error:', e));
        setVideoPlaying(prev => ({ ...prev, [postId]: true }));
        video.muted = false;
        setVideoMuted(prev => ({ ...prev, [postId]: false }));
      } else {
        video.pause();
        setVideoPlaying(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const toggleVideoMute = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      const newMuted = !video.muted;
      video.muted = newMuted;
      setVideoMuted(prev => ({ ...prev, [postId]: newMuted }));
    }
  };

  const handleVideoPlay = (postId) => setVideoPlaying(prev => ({ ...prev, [postId]: true }));
  const handleVideoPause = (postId) => setVideoPlaying(prev => ({ ...prev, [postId]: false }));

  const handleVideoTimeUpdate = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(prev => ({ ...prev, [postId]: progress }));
    }
  };

  // ─── Render Poll UI ──────────────────────────────────────────────────
  const renderPoll = (post) => {
    if (!post.is_poll || !post.poll_data) return null;
    
    const pollData = post.poll_data;
    const totalVotes = pollData.totalVotes || pollData.votes?.reduce((a, b) => a + b, 0) || 0;
    
    return (
      <div className="mt-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2 mb-3">
          <FaPoll className="text-amber-500" />
          <span className="text-sm font-semibold text-stone-900 dark:text-white">Poll</span>
          <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">{totalVotes} votes</span>
        </div>
        {pollData.options?.map((option, index) => {
          const votes = pollData.votes?.[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          return (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-stone-700 dark:text-stone-300">{option}</span>
                <span className="text-stone-400 dark:text-stone-500">{percentage}%</span>
              </div>
              <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMedia = (post) => {
    if (!post.image_url) return null;
    const mediaType = post.media_type || getMediaTypeFromUrl(post.image_url);
    const isVideo = mediaType === 'video';
    const isPlaying = videoPlaying[post.id] || false;
    const isMuted = videoMuted[post.id] || false;
    const isHovered = hoveredVideo === post.id;
    const progress = videoProgress[post.id] || 0;

    if (isVideo) {
      return (
        <div
          ref={el => videoContainerRefs.current[post.id] = el}
          data-post-id={post.id}
          className="mt-2 bg-black rounded-xl overflow-hidden relative group cursor-pointer"
          onMouseEnter={() => setHoveredVideo(post.id)}
          onMouseLeave={() => setHoveredVideo(null)}
          onClick={() => { setFullscreenMedia(post.image_url); setFullscreenMediaType('video'); }}
        >
          <video
            ref={el => videoRefs.current[post.id] = el}
            src={post.image_url}
            className="w-full object-contain max-h-[500px]"
            autoPlay playsInline loop muted={false}
            onPlay={() => handleVideoPlay(post.id)}
            onPause={() => handleVideoPause(post.id)}
            onTimeUpdate={() => handleVideoTimeUpdate(post.id)}
            onClick={(e) => { e.stopPropagation(); setFullscreenMedia(post.image_url); setFullscreenMediaType('video'); }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={(e) => { e.stopPropagation(); toggleVideoPlay(post.id); }} className="p-4 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full transition-all duration-300 transform hover:scale-110">
              {isPlaying ? <FaPause className="text-white text-3xl" /> : <FaPlay className="text-white text-3xl ml-0.5" />}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={(e) => { e.stopPropagation(); toggleVideoMute(post.id); }} className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors">
              {isMuted ? <FaVolumeMute className="text-xs" /> : <FaVolumeUp className="text-xs" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); downloadMedia(post.image_url, `post-${post.id}.mp4`); }} className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors">
              <FaDownload className="text-xs" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => { setFullscreenMedia(post.image_url); setFullscreenMediaType('image'); }}>
        <img src={post.image_url} alt={post.title} className="w-full object-contain max-h-[500px]" loading="lazy" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button onClick={(e) => { e.stopPropagation(); setFullscreenMedia(post.image_url); setFullscreenMediaType('image'); }} className="p-3 bg-white/90 dark:bg-stone-800/90 rounded-full hover:scale-110 transition-transform">
            <FaExpand className="text-stone-700 dark:text-stone-300 text-lg" />
          </button>
        </div>
        <button onClick={(e) => { e.stopPropagation(); downloadMedia(post.image_url, `post-${post.id}.jpg`); }} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FaDownload className="text-xs" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="inline-block h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-3 font-medium">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-stone-900 rounded-2xl">
          <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-4" />
          <p className="text-stone-600 dark:text-stone-300">{error}</p>
          <button onClick={fetchPosts} className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* ─── TOP BAR - Modern with Small Search ────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Left: Logo/Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/20">
                <FaNewspaper className="text-white text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 dark:text-white truncate">
                  Feed
                </h1>
              </div>
            </div>

            {/* Right: Search + Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* ─── Small Search Bar - Always Visible ────────────────── */}
              <div className="relative flex items-center">
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 rounded-full px-2.5 py-1.5 w-[140px] sm:w-[160px]">
                  <FaSearch className="text-stone-400 text-xs flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent outline-none text-xs text-stone-900 dark:text-white placeholder:text-stone-400 min-w-[60px]"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex-shrink-0"
                    >
                      <FaTimes className="text-stone-400 text-[8px]" />
                    </button>
                  )}
                </div>
          
              </div>
              
              {/* Create Post Button */}
              <button
                onClick={() => {
                  if (userGroups.length === 0) {
                    alert('You need to join or create a study group first.');
                    return;
                  }
                  document.getElementById('post-input')?.focus();
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
              >
                <span className="hidden xs:inline">Create Post</span>
                <span className="xs:hidden">+ Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        {/* ─── FILTER TABS ────────────────────────────────────────────── */}
        <div className="flex items-center border-b border-stone-200 dark:border-stone-800 mb-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'trending', label: 'Trending' },
            { id: 'saved', label: 'Saved' },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex-1 min-w-[50px] px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                  isActive
                    ? 'text-stone-900 dark:text-white'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── CREATE POST WIDGET - Clean with Group Selector ────────────────────── */}
        <div className="py-3 sm:py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 sm:gap-3 items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {/* ─── Group Selector - Modern ────────────────────────────────── */}
                <div className="flex items-center gap-2 mb-1.5">
                  {loadingGroups ? (
                    <div className="flex items-center gap-1">
                      <FaSpinner className="animate-spin text-xs text-stone-400" />
                      <span className="text-xs text-stone-400">Loading groups...</span>
                    </div>
                  ) : userGroups.length > 0 ? (
                    <div className="flex items-center gap-1.5 bg-stone-100/80 dark:bg-stone-800/80 rounded-lg px-2 py-0.5 border border-stone-200/50 dark:border-stone-700/50">
                      <FaUsers className="text-amber-500 text-[10px] sm:text-xs" />
                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="bg-transparent outline-none text-[10px] sm:text-xs text-stone-600 dark:text-stone-300 font-medium py-0.5 pr-1 max-w-[120px] sm:max-w-[180px] truncate cursor-pointer"
                      >
                        {userGroups.map(group => (
                          <option key={group.id} value={group.id} className="bg-white dark:bg-stone-900">
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="text-stone-400 text-[8px] sm:text-[10px]" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-amber-500">⚠️ No groups</span>
                      <Link to="/study-groups" className="text-xs text-amber-600 hover:underline">
                        Join
                      </Link>
                    </div>
                  )}
                </div>

                {/* ─── Input Field ────────────────────────────────────────── */}
                <div className="relative">
                  <input
                    id="post-input"
                    type="text"
                    placeholder="What's on your mind? #hashtag @mention..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:border-amber-400 outline-none transition-colors text-stone-900 dark:text-white placeholder:text-stone-400 pr-10"
                  />
                  {/* ─── Detection Badges ────────────────────────────────── */}
                  {postContent && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {detectLinks(postContent) && (
                        <span className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaGlobe className="text-[8px]" /> Link
                        </span>
                      )}
                      {detectHashtagsAndMentions(postContent).hashtags.length > 0 && (
                        <span className="text-[10px] font-medium text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaHashtag className="text-[8px]" /> {detectHashtagsAndMentions(postContent).hashtags.length}
                        </span>
                      )}
                      {detectHashtagsAndMentions(postContent).mentions.length > 0 && (
                        <span className="text-[10px] font-medium text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaAt className="text-[8px]" /> {detectHashtagsAndMentions(postContent).mentions.length}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* ─── Attachment Icons ────────────────────────────────────────── */}
                <div className="flex items-center gap-3 sm:gap-4 mt-2 border-t border-stone-100 dark:border-stone-800 pt-2 flex-wrap">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 sm:gap-1.5 text-stone-500 hover:text-amber-500 transition-colors text-xs sm:text-sm"
                  >
                    <FaImage className="text-amber-500 text-sm sm:text-base" />
                    <span>Photo</span>
                  </button>
                  <button 
                    onClick={() => {
                      setUploadType('video');
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1 sm:gap-1.5 text-stone-500 hover:text-amber-500 transition-colors text-xs sm:text-sm"
                  >
                    <FaVideo className="text-red-500 text-sm sm:text-base" />
                    <span>Video</span>
                  </button>
                  <button 
                    onClick={() => setShowPriceInput(!showPriceInput)}
                    className="flex items-center gap-1 sm:gap-1.5 text-stone-500 hover:text-amber-500 transition-colors text-xs sm:text-sm"
                  >
                    <FaDollarSign className="text-green-500 text-sm sm:text-base" />
                    <span>Price</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsPoll(!isPoll);
                      if (!isPoll) setPollOptions(['', '']);
                    }}
                    className="flex items-center gap-1 sm:gap-1.5 text-stone-500 hover:text-amber-500 transition-colors text-xs sm:text-sm"
                  >
                    <FaPoll className="text-purple-500 text-sm sm:text-base" />
                    <span>Poll</span>
                  </button>
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center gap-1 sm:gap-1.5 text-stone-500 hover:text-amber-500 transition-colors text-xs sm:text-sm"
                  >
                    <FaSmile className="text-amber-500 text-sm sm:text-base" />
                    <span>Emoji</span>
                  </button>
                  
                  {/* ─── Post Button ────────────────────────────────────────── */}
                  <button
                    onClick={handleCreatePost}
                    disabled={submitting || (!postContent.trim() && !postMediaFile && !isPoll) || userGroups.length === 0}
                    className="ml-auto px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <><FaPaperPlane className="text-xs" /> Post</>
                    )}
                  </button>
                </div>

                {/* ─── Media Preview ────────────────────────────────────────── */}
                {postMediaPreview && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                    {uploadType === 'video' ? (
                      <video src={postMediaPreview} className="w-full max-h-[200px] object-cover" controls playsInline />
                    ) : (
                      <img src={postMediaPreview} alt="Preview" className="w-full max-h-[200px] object-cover" />
                    )}
                    <button
                      onClick={removeMedia}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                )}

                {/* ─── Price Input ────────────────────────────────────────── */}
                {showPriceInput && (
                  <div className="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 mt-2">
                    <FaDollarSign className="text-green-500 text-sm" />
                    <input
                      type="number"
                      placeholder="Set a price..."
                      value={postPrice}
                      onChange={(e) => setPostPrice(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                      min="0"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPriceInput(false)}
                      className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* ─── Poll Creator ────────────────────────────────────────── */}
                {isPoll && (
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-white">Create a Poll</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPoll(false);
                          setPollOptions(['', '']);
                        }}
                        className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-600 text-sm focus:border-amber-400 outline-none transition-colors"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removePollOption(index)}
                            className="text-red-400 hover:text-red-500 transition-colors p-1"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 10 && (
                      <button
                        type="button"
                        onClick={addPollOption}
                        className="text-xs text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1 mt-1"
                      >
                        <FaPlus className="text-[10px]" /> Add option
                      </button>
                    )}
                    <div className="mt-2">
                      <label className="text-xs text-stone-500 dark:text-stone-400">Duration:</label>
                      <select
                        value={pollDuration}
                        onChange={(e) => setPollDuration(e.target.value)}
                        className="ml-2 px-2 py-0.5 bg-white dark:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-600 text-xs"
                      >
                        <option value="1d">1 day</option>
                        <option value="3d">3 days</option>
                        <option value="7d">7 days</option>
                        <option value="14d">14 days</option>
                        <option value="30d">30 days</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ─── Emoji Picker ────────────────────────────────────────── */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-stone-100 dark:bg-stone-800 rounded-xl p-3 border border-stone-200 dark:border-stone-700 mt-2"
                    >
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setPostContent(postContent + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 transition-colors text-xl sm:text-2xl"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="mt-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Close emoji picker
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── POSTS LIST ────────────────────────────────────────────── */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <FaNewspaper className="text-4xl sm:text-5xl text-stone-300 dark:text-stone-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-stone-700 dark:text-stone-300">
              {searchQuery ? 'No results found' : (activeFilter === 'saved' ? 'No saved posts' : 'No posts yet')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 dark:text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? `No posts match "${searchQuery}"` 
                : (activeFilter === 'saved' 
                  ? 'Save posts to read them later' 
                  : userGroups.length === 0
                  ? 'Join or create a study group to see posts here'
                  : 'Posts from study groups will appear here')}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full text-xs sm:text-sm font-medium"
              >
                Clear search
              </button>
            ) : (
              (activeFilter === 'all' && userGroups.length > 0) && (
                <button
                  onClick={() => {
                    if (userGroups.length === 0) {
                      alert('You need to join or create a study group first.');
                      return;
                    }
                    document.getElementById('post-input')?.focus();
                  }}
                  className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs sm:text-sm font-medium"
                >
                  Create First Post
                </button>
              )
            )}
            {userGroups.length === 0 && !searchQuery && (
              <Link to="/study-groups">
                <button className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs sm:text-sm font-medium">
                  Join or Create a Study Group
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="py-3 sm:py-4 px-0 sm:px-1 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors duration-200"
              >
                <div className="flex gap-2 sm:gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {post.users?.avatar_url ? (
                      <img
                        src={post.users.avatar_url}
                        alt={post.users.name}
                        className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                        {post.users?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                        {post.users?.name || 'Anonymous'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 truncate max-w-[60px] sm:max-w-[100px]">
                        @{post.users?.name?.toLowerCase().replace(/\s/g, '') || 'user'}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs">·</span>
                      <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {formatTimeAgo(post.created_at)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                        in
                      </span>
                      <span className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 truncate max-w-[80px] sm:max-w-[120px]">
                        {post.study_groups?.name || 'Unknown Group'}
                      </span>
                      {(post.media_type === 'video' || getMediaTypeFromUrl(post.image_url) === 'video') && (
                        <span className="flex items-center gap-0.5 text-[8px] sm:text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                          <FaVideo className="text-[8px] sm:text-[10px]" /> Video
                        </span>
                      )}
                      {post.price && (
                        <span className="flex items-center gap-0.5 text-[8px] sm:text-[10px] font-medium text-green-500 bg-green-50 dark:bg-green-950/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                          <FaDollarSign className="text-[8px] sm:text-[10px]" /> ${post.price}
                        </span>
                      )}
                      {post.is_poll && (
                        <span className="flex items-center gap-0.5 text-[8px] sm:text-[10px] font-medium text-purple-500 bg-purple-50 dark:bg-purple-950/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                          <FaPoll className="text-[8px] sm:text-[10px]" /> Poll
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white mt-0.5 leading-snug">
                      {post.title}
                    </h3>

                    {/* Content - With Link Detection */}
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap mt-0.5 line-clamp-3 sm:line-clamp-none">
                      {renderContentWithLinks(post.content)}
                    </p>

                    {/* Poll */}
                    {renderPoll(post)}

                    {/* Media */}
                    {renderMedia(post)}

                    {/* Stats */}
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 text-stone-500 dark:text-stone-400 text-[10px] sm:text-xs flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <span className="font-bold">{post.likes || 0}</span>
                        <span>Likes</span>
                      </span>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-0.5 hover:text-amber-500 transition-colors"
                      >
                        <span className="font-bold">{post.comments || 0}</span>
                        <span>Comments</span>
                      </button>
                      <span className="flex items-center gap-0.5">
                        <span className="font-bold">{post.shares || 0}</span>
                        <span>Shares</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium transition-all ${
                          likedPosts[post.id]
                            ? 'text-red-500 bg-red-50 dark:bg-red-950/20'
                            : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {likedPosts[post.id] ? <FaHeart className="text-red-500 text-xs sm:text-sm" /> : <FaRegHeart className="text-xs sm:text-sm" />}
                        <span className="hidden xs:inline">{likedPosts[post.id] ? 'Liked' : 'Like'}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                      >
                        <FaComments className="text-xs sm:text-sm" />
                        <span className="hidden xs:inline">Comment</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); const url = window.location.origin + `/study-posts/${post.id}`; navigator.clipboard.writeText(url); alert('Link copied!'); }}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                      >
                        <FaShare className="text-xs sm:text-sm" />
                        <span className="hidden xs:inline">Share</span>
                      </button>

                      <button
                        onClick={() => handleSave(post.id)}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium transition-all ${
                          savedPosts[post.id] ? 'text-amber-500' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {savedPosts[post.id] ? <FaBookmark className="text-xs sm:text-sm" /> : <FaRegBookmark className="text-xs sm:text-sm" />}
                        <span className="hidden xs:inline">{savedPosts[post.id] ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Comments */}
                    <AnimatePresence>
                      {showComments[post.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2"
                        >
                          <div className="flex gap-1.5 sm:gap-2">
                            <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 flex gap-1 sm:gap-2 min-w-0">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 dark:bg-stone-800 border border-transparent focus:border-amber-400 rounded-full text-xs sm:text-sm focus:outline-none transition-colors text-stone-900 dark:text-white placeholder:text-stone-400 min-w-0"
                              />
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={submittingComment[post.id] || !commentText[post.id]?.trim()}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs sm:text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0"
                              >
                                {submittingComment[post.id] ? (
                                  <FaSpinner className="animate-spin text-xs" />
                                ) : (
                                  <FaPaperPlane className="text-xs sm:text-sm" />
                                )}
                              </button>
                            </div>
                          </div>

                          {comments[post.id]?.length === 0 ? (
                            <p className="text-center text-xs text-stone-400 dark:text-stone-500 py-2">
                              No comments yet. Be the first!
                            </p>
                          ) : (
                            comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="flex gap-1.5 sm:gap-2">
                                <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                  {comment.users?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-stone-100 dark:bg-stone-800 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                      <span className="text-[10px] sm:text-xs font-semibold text-stone-900 dark:text-white">
                                        {comment.users?.name || 'Anonymous'}
                                      </span>
                                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                        {formatTimeAgo(comment.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-0.5 break-words">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── FULLSCREEN MEDIA VIEWER ────────────────────────────────────── */}
      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setFullscreenMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {fullscreenMediaType === 'video' ? (
                <video
                  src={fullscreenMedia}
                  className="w-full h-full max-h-[90vh] rounded-lg"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={fullscreenMedia}
                  alt="Fullscreen view"
                  className="w-full h-full object-contain max-h-[90vh] rounded-lg"
                />
              )}
              
              <button
                onClick={() => setFullscreenMedia(null)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <FaTimes className="text-base sm:text-xl" />
              </button>

              <button
                onClick={() => {
                  const filename = fullscreenMediaType === 'video' ? 'video.mp4' : 'image.jpg';
                  downloadMedia(fullscreenMedia, filename);
                }}
                className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <FaDownload className="text-base sm:text-xl" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyPosts;