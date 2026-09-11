import React, { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  FaPaperPlane, FaUser, FaUsers, FaTimes, FaSearch, FaBell,
  FaUserPlus, FaPhone, FaVideo as FaVideoCall,
  FaCheck, FaTimes as FaTimesIcon, FaSpinner, FaBan, FaUndo,
  FaBars, FaTrash, FaCheckDouble, FaComment, 
  FaArrowLeft as FaBack, FaPhone as FaPhoneIcon, FaMicrophone,
  FaMicrophoneSlash, FaPhoneSlash, FaClipboardList, FaSignOutAlt,
  FaVolumeUp, FaImage, FaReply, FaVolumeOff,
  FaStop, FaPlay, FaPause, FaMicrophone as FaMicrophoneIcon,
  FaDownload, FaExpand, FaCompress
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  X, 
  Search, 
  UserPlus, 
  Bell, 
  UserMinus,
  Check,
  Loader2,
  Users,
  MessageCircle,
  Phone as PhoneIcon,
  Video,
  ArrowLeft,
  Send,
  Smile,
  Image as ImageIcon,
  Mic,
  Volume2,
  VolumeX,
  User,
  Settings,
  CheckCheck,
  Download as DownloadIcon,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

// Speech Synthesis
const speakNotification = (message, onEnd) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK Female'));
  if (femaleVoice) utterance.voice = femaleVoice;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

// Emojis
const STICKER_CATEGORIES = [
  { name: 'Happy', emojis: ['😊', '😄', '😁', '🥳', '😍', '🤗', '😎', '🌟'] },
  { name: 'Sad', emojis: ['😢', '😭', '😔', '🥺', '😞', '💔', '😩'] },
  { name: 'Angry', emojis: ['😠', '😡', '🤬', '😤', '👿', '💢'] },
  { name: 'Love', emojis: ['❤️', '💕', '💗', '💖', '💘', '💝', '🥰'] },
  { name: 'Celebrate', emojis: ['🎉', '🎊', '✨', '🎈', '🎁', '🏆', '💪'] },
  { name: 'Funny', emojis: ['😂', '🤣', '😅', '🤪', '🤡', '😜', '👻'] },
  { name: 'Study', emojis: ['📚', '📝', '✏️', '📖', '🎓', '🧠', '💡'] },
  { name: 'Animals', emojis: ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦄'] },
];

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => {
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.frequency.value = 1000; o2.type = 'sine';
      g2.gain.setValueAtTime(0.2, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      o2.start(ctx.currentTime); o2.stop(ctx.currentTime + 0.2);
    }, 150);
  } catch (e) {}
};

const playMessageSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 600; osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AvatarWithFallback = ({ 
  seed, 
  name, 
  avatarUrl, 
  size = 'h-10 w-10', 
  textSize = 'text-sm', 
  className = '',
  rounded = 'rounded-full'
}) => {
  const displayName = name || seed || 'User';
  const initials = getInitials(displayName);
  const imageUrl = avatarUrl || seed?.avatar_url || null;

  return (
    <div className={`${size} ${rounded} bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold ${textSize} shadow-lg overflow-hidden flex-shrink-0 ${className}`}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={displayName} 
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span 
        className="items-center justify-center w-full h-full"
        style={{ display: imageUrl ? 'none' : 'flex' }}
      >
        {initials}
      </span>
    </div>
  );
};

// ✅ NEW: Full-screen Image Viewer
const ImageViewer = ({ imageUrl, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top toolbar */}
      <div 
        className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            title="Zoom out (-)"
          >
            <ZoomOut size={18} />
          </button>
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-md min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            title="Zoom in (+)"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
            title="Download"
          >
            <DownloadIcon size={18} />
          </button>
        </div>
      </div>

      {/* Image */}
      <motion.img
        src={imageUrl}
        alt="Full view"
        className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg select-none"
        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s ease' }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-xs opacity-70">
        Tap outside or press Esc to close
      </div>
    </motion.div>
  );
};

// Voice Call Modal
const VoiceCallModal = ({ isOpen, onClose, callerName, callerAvatar, onAccept, onReject, onEndCall, callStatus }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (callStatus === 'active') interval = setInterval(() => setCallDuration(p => p + 1), 1000);
    else setCallDuration(0);
    return () => clearInterval(interval);
  }, [callStatus]);

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-stone-800 to-stone-950 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="relative inline-block mb-6">
          {callerAvatar ? (
            <img src={callerAvatar} alt={callerName} className="h-24 w-24 rounded-full object-cover ring-4 ring-amber-500/30 mx-auto" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
              {callerName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {callStatus === 'active' && (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-stone-950" />
          )}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{callerName || 'Unknown'}</h3>
        <p className="text-sm text-stone-400 mb-6">
          {callStatus === 'incoming' && 'Incoming call...'}
          {callStatus === 'outgoing' && 'Calling...'}
          {callStatus === 'active' && `In progress • ${fmt(callDuration)}`}
          {callStatus === 'ended' && 'Call ended'}
        </p>
        <div className="flex items-center justify-center gap-4">
          {callStatus === 'incoming' && (
            <>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onReject}
                className="p-4 rounded-full bg-red-500 text-white">
                <FaPhoneSlash className="text-xl" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onAccept}
                className="p-4 rounded-full bg-emerald-500 text-white">
                <FaPhoneIcon className="text-xl" />
              </motion.button>
            </>
          )}
          {(callStatus === 'outgoing' || callStatus === 'active') && (
            <>
              {callStatus === 'active' && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full ${isMuted ? 'bg-amber-500' : 'bg-stone-700'} text-white`}>
                  {isMuted ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onEndCall}
                className="p-4 rounded-full bg-red-500 text-white">
                <FaPhoneSlash className="text-xl" />
              </motion.button>
            </>
          )}
        </div>
        {callStatus === 'ended' && (
          <button onClick={onClose} className="mt-6 px-6 py-2 rounded-xl bg-stone-700 text-white text-sm">Close</button>
        )}
      </motion.div>
    </motion.div>
  );
};

// Reply Preview
const ReplyPreview = ({ replyTo, onCancelReply }) => {
  if (!replyTo) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border-l-4 border-amber-500 rounded-lg mb-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Replying to {replyTo.sender === 'user' ? 'yourself' : replyTo.senderName || 'User'}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
          {replyTo.text && replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + '...' : replyTo.text}
        </p>
      </div>
      <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700">
        <X size={14} className="text-stone-400" />
      </button>
    </motion.div>
  );
};

// Message Actions
const MessageActions = ({ message, onClose, onDelete, onReply }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
        className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-amber-500 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Message Options</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">What would you like to do?</p>
          <div className="space-y-2">
            <button onClick={() => { onReply(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors">
              <FaReply className="text-sm" />
              <span className="font-medium">Reply</span>
            </button>
            <button onClick={() => { onDelete(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">
              <FaTrash className="text-sm" />
              <span className="font-medium">Delete</span>
            </button>
            <button onClick={onClose}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors">
              <span className="font-medium">Cancel</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState(null);
  const [messagesChannel, setMessagesChannel] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [showUnapproveConfirm, setShowUnapproveConfirm] = useState(false);
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
  const [userToUnapprove, setUserToUnapprove] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserList, setShowUserList] = useState(true);

  // ✅ NEW: Image viewer state
  const [viewingImage, setViewingImage] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playingMessageId, setPlayingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hideTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callerInfo, setCallerInfo] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const streamRef = useRef(null);

  const updateUserStatus = async (status) => {
    if (!user) return;
    try {
      await supabase.from('user_status').upsert(
        { user_id: user.id, status, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    } catch (e) {}
  };

  useEffect(() => {
    if (user) updateUserStatus('online');
    return () => { if (user) updateUserStatus('offline'); };
  }, [user]);

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (chatRequests.length > 0) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setShowRequests(true);
      if (!isMuted) {
        const name = chatRequests[chatRequests.length - 1]?.sender_name || 'Someone';
        speakNotification(`New chat request from ${name}`);
      }
      hideTimerRef.current = setTimeout(() => { setShowRequests(false); hideTimerRef.current = null; }, 3000);
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [chatRequests.length]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) window.speechSynthesis.cancel();
    showNotification(isMuted ? 'Sound enabled' : 'Sound muted', 'info');
  };

  const toggleRequestsPanel = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const newState = !showRequests;
    setShowRequests(newState);
    if (newState && chatRequests.length > 0) {
      hideTimerRef.current = setTimeout(() => { setShowRequests(false); hideTimerRef.current = null; }, 3000);
    }
  };

  // Socket
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    let newSocket = null;
    if (socket) return;

    const connectSocket = () => {
      if (newSocket) return;
      newSocket = io(SOCKET_URL, { transports: ['websocket'], reconnectionAttempts: 5 });

      newSocket.on('connect', () => {
        if (!isMounted) return;
        if (user) newSocket.emit('register-user', user.id);
      });

      newSocket.on('online-users', (onlineUsers) => {
        if (!isMounted) return;
        setAllUsers(prev => prev.map(u => ({ ...u, online: onlineUsers.includes(u.id) })));
      });

      newSocket.on('user-online', (userId) => {
        if (!isMounted) return;
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, online: true } : u));
      });

      newSocket.on('user-offline', (userId) => {
        if (!isMounted) return;
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, online: false } : u));
      });

      newSocket.on('incoming-call', ({ from, signal }) => {
        if (!isMounted) return;
        const callerUser = allUsers.find(u => u.id === from);
        if (callerUser) {
          setCallerInfo({ id: from, name: getUserDisplayName(callerUser), avatar: getUserAvatar(callerUser) });
          setCallStatus('incoming');
          setCallModalOpen(true);
          window._incomingSignal = signal;
          window._callerId = from;
          playNotificationSound();
          if (!isMuted) speakNotification(`Incoming call from ${getUserDisplayName(callerUser)}`);
          showNotification(`Incoming call from ${getUserDisplayName(callerUser)}`, 'request');
        }
      });

      newSocket.on('call-accepted', ({ signal }) => {
        if (!isMounted) return;
        if (peer) { peer.signal(signal); setCallStatus('active'); setIsInCall(true); playNotificationSound(); showNotification('Call connected!', 'success'); }
      });

      newSocket.on('call-rejected', () => {
        if (!isMounted) return;
        setCallStatus('ended'); setIsInCall(false);
        if (peer) { peer.destroy(); setPeer(null); }
        showNotification('Call rejected', 'info');
      });

      newSocket.on('call-ended', () => {
        if (!isMounted) return;
        setCallStatus('ended'); setIsInCall(false);
        if (peer) { peer.destroy(); setPeer(null); }
        showNotification('Call ended', 'info');
      });

      setSocket(newSocket);
    };

    connectSocket();
    return () => {
      isMounted = false;
      if (newSocket) {
        if (user) newSocket.emit('unregister-user', user.id);
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, [user]);

  const initPeer = (isInitiator, stream) => {
    const newPeer = new Peer({ initiator: isInitiator, stream, trickle: false });
    newPeer.on('signal', (data) => {
      if (socket && selectedUser) {
        if (isInitiator) socket.emit('call-user', { from: user.id, to: selectedUser.id, signalData: data });
        else socket.emit('accept-call', { to: window._callerId || selectedUser.id, signalData: data });
      }
    });
    newPeer.on('stream', (remoteStream) => {
      if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = remoteStream; remoteAudioRef.current.play(); }
    });
    newPeer.on('connect', () => { setCallStatus('active'); setIsInCall(true); });
    newPeer.on('close', () => { setCallStatus('ended'); setIsInCall(false); });
    newPeer.on('error', () => { setCallStatus('ended'); setIsInCall(false); });
    return newPeer;
  };

  const startCall = async (receiverId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      if (localAudioRef.current) { localAudioRef.current.srcObject = stream; localAudioRef.current.play(); }
      const newPeer = initPeer(true, stream);
      setPeer(newPeer);
      setCallStatus('outgoing');
      setCallModalOpen(true);
      const targetUser = allUsers.find(u => u.id === receiverId);
      if (targetUser) setCallerInfo({ id: targetUser.id, name: getUserDisplayName(targetUser), avatar: getUserAvatar(targetUser) });
    } catch (e) { showNotification('Failed to start call', 'error'); }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      if (localAudioRef.current) { localAudioRef.current.srcObject = stream; localAudioRef.current.play(); }
      const newPeer = initPeer(false, stream);
      setPeer(newPeer);
      if (window._incomingSignal) newPeer.signal(window._incomingSignal);
      setCallStatus('active'); setIsInCall(true); playNotificationSound();
    } catch (e) { showNotification('Failed to accept call', 'error'); }
  };

  const rejectCall = () => {
    if (socket && window._callerId) socket.emit('reject-call', { to: window._callerId });
    setCallStatus('ended'); setCallModalOpen(false); setIsInCall(false);
    showNotification('Call rejected', 'info');
  };

  const endCall = () => {
    if (socket && selectedUser) socket.emit('end-call', { to: selectedUser.id });
    if (peer) { peer.destroy(); setPeer(null); }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCallStatus('ended'); setIsInCall(false); setCallModalOpen(false);
    showNotification('Call ended', 'info');
  };

  useEffect(() => {
    return () => {
      if (peer) peer.destroy();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      window.speechSynthesis.cancel();
    };
  }, []);

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        sendVoiceMessage(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => { if (prev >= 60) { stopRecording(); return prev; } return prev + 1; });
      }, 1000);
    } catch (e) { showNotification('Failed to access microphone', 'error'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    }
  };

  const sendVoiceMessage = async (blob) => {
    if (!selectedUser) return;
    if (blockedUsers.includes(selectedUser.id)) { showNotification('User blocked', 'info'); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Audio = e.target?.result;
      if (!base64Audio) return;
      const tempId = Date.now();
      const newMessage = {
        id: tempId, sender: "user", text: base64Audio,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true, delivered: true, type: "voice", duration: recordingDuration,
        replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
      };
      setMessages(prev => [...prev, newMessage]);
      playMessageSound();
      try {
        const { data, error } = await supabase.from('messages').insert([{
          sender_id: user.id, receiver_id: selectedUser.id, content: base64Audio,
          created_at: new Date().toISOString(), read: false, message_type: 'voice',
          reply_to: replyingTo ? replyingTo.id : null, duration: recordingDuration
        }]).select();
        if (error) throw error;
        if (data?.length > 0) setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data[0].id } : m));
        setReplyingTo(null);
      } catch (err) { showNotification('Failed to send voice', 'error'); setMessages(prev => prev.filter(m => m.id !== tempId)); }
    };
    reader.readAsDataURL(blob);
  };

  const playVoiceMessage = (message) => {
    if (playingMessageId === message.id) {
      if (audioPlayerRef.current) { audioPlayerRef.current.pause(); setPlayingMessageId(null); }
      return;
    }
    if (audioPlayerRef.current) { audioPlayerRef.current.pause(); audioPlayerRef.current = null; }
    const audio = new Audio(message.text);
    audioPlayerRef.current = audio;
    audio.onended = () => { setPlayingMessageId(null); audioPlayerRef.current = null; };
    audio.onplay = () => setPlayingMessageId(message.id);
    audio.onpause = () => setPlayingMessageId(null);
    audio.play().catch(() => showNotification('Failed to play', 'error'));
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ✅ Load profile including avatar
  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      setUserProfile(data);
    } catch (e) {
      console.log('Error loading profile:', e);
    } finally { 
      setLoadingProfile(false); 
    }
  };

  const getUserDisplayName = (u) => u?.full_name || u?.name || u?.email || 'User';
  const getUserAvatar = (u) => u?.avatar_url || u?.avatar || null;

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUsers();
      loadChatRequests();
      loadPendingRequests();
      loadBlockedUsers();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const reqChannel = supabase.channel('chat_requests_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_requests', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          setChatRequests(prev => [...prev, payload.new]);
          playNotificationSound();
          if (!isMuted) speakNotification(`New chat request from ${payload.new.sender_name || 'a user'}`);
          showNotification(`New chat request from ${payload.new.sender_name || 'a user'}`, 'request');
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_requests' },
        () => { loadChatRequests(); loadPendingRequests(); loadUsers(); })
      .subscribe();
    setChannel(reqChannel);

    const msgChannel = supabase.channel('messages_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          if (selectedUser && selectedUser.id === payload.new.sender_id) {
            const newMsg = {
              id: payload.new.id, sender: 'other', text: payload.new.content,
              timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false, delivered: true, type: payload.new.message_type || 'text', duration: payload.new.duration || 0
            };
            setMessages(prev => [...prev, newMsg]);
            playNotificationSound();
          } else {
            playNotificationSound();
            if (!isMuted) speakNotification(`New message from ${payload.new.sender_name || 'a user'}`);
            showNotification(`New message from ${payload.new.sender_name || 'a user'}`, 'message');
            loadUsers();
          }
        })
      .subscribe();
    setMessagesChannel(msgChannel);

    return () => {
      if (reqChannel) reqChannel.unsubscribe();
      if (msgChannel) msgChannel.unsubscribe();
      window.speechSynthesis.cancel();
    };
  }, [user, selectedUser, isMuted]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadBlockedUsers = async () => {
    try {
      const { data } = await supabase.from('blocked_users').select('blocked_user_id').eq('user_id', user.id);
      setBlockedUsers(data?.map(b => b.blocked_user_id) || []);
    } catch (e) {}
  };

  const blockUser = async (userId) => {
    try {
      await supabase.from('blocked_users').insert([{ user_id: user.id, blocked_user_id: userId }]);
      setBlockedUsers(prev => [...prev, userId]);
      showNotification('User blocked', 'success');
      if (selectedUser?.id === userId) { setSelectedUser(null); setMessages([]); setShowUserList(true); }
      loadUsers();
    } catch (e) { showNotification('Failed to block', 'error'); }
  };

  const unblockUser = async (userId) => {
    try {
      await supabase.from('blocked_users').delete().eq('user_id', user.id).eq('blocked_user_id', userId);
      setBlockedUsers(prev => prev.filter(id => id !== userId));
      showNotification('User unblocked', 'success');
      loadUsers();
    } catch (e) { showNotification('Failed to unblock', 'error'); }
  };

  const unapproveUser = async (userId) => {
    try {
      const { data: requests } = await supabase.from('chat_requests').select('*').eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      if (!requests || requests.length === 0) { showNotification('No approved chat found', 'info'); return; }
      await supabase.from('chat_requests').update({ status: 'pending' }).eq('id', requests[0].id);
      showNotification('Partner removed', 'success');
      if (selectedUser?.id === userId) { setSelectedUser(null); setMessages([]); setShowUserList(true); }
      loadUsers();
      setUserToUnapprove(null); setShowUnapproveConfirm(false);
    } catch (e) { showNotification('Failed', 'error'); }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    setDeletingMessage(messageId);
    try {
      await supabase.from('messages').delete().eq('id', messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      showNotification('Message deleted', 'success');
      if (replyingTo?.id === messageId) setReplyingTo(null);
    } catch (e) { showNotification('Failed to delete', 'error'); }
    finally { setDeletingMessage(null); }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    try {
      await supabase.from('messages').delete().or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),` +
        `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
      );
      setMessages([]);
      showNotification('Chat cleared', 'success');
      setShowClearChatConfirm(false);
    } catch (e) { showNotification('Failed to clear', 'error'); }
  };

  const handleCallClick = (type) => {
    if (!selectedUser || !selectedUser.isApproved) { showNotification('Select approved partner', 'info'); return; }
    if (type === 'voice') startCall(selectedUser.id);
    else showNotification('Video calls coming soon!', 'info');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showNotification('Image < 5MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { showNotification('Upload an image', 'error'); return; }
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Image = ev.target?.result;
      if (!base64Image) { setUploadingImage(false); return; }
      await sendMessageWithImage(base64Image);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const sendMessageWithImage = async (imageData) => {
    if (!selectedUser || blockedUsers.includes(selectedUser.id)) return;
    const tempId = Date.now();
    const newMessage = {
      id: tempId, sender: "user", text: imageData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true, delivered: true, type: "image",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
    };
    setMessages(prev => [...prev, newMessage]);
    playMessageSound();
    try {
      const { data, error } = await supabase.from('messages').insert([{
        sender_id: user.id, receiver_id: selectedUser.id, content: imageData,
        created_at: new Date().toISOString(), read: false, message_type: 'image',
        reply_to: replyingTo ? replyingTo.id : null
      }]).select();
      if (error) throw error;
      if (data?.length > 0) setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data[0].id } : m));
      setReplyingTo(null);
    } catch (e) { showNotification('Failed to send image', 'error'); setMessages(prev => prev.filter(m => m.id !== tempId)); }
  };

  const sendSticker = async (sticker) => {
    if (!selectedUser || blockedUsers.includes(selectedUser.id)) return;
    const tempId = Date.now();
    const newMessage = {
      id: tempId, sender: "user", text: sticker,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true, delivered: true, type: "sticker",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
    };
    setMessages(prev => [...prev, newMessage]);
    setShowStickerPicker(false);
    playMessageSound();
    try {
      const { data, error } = await supabase.from('messages').insert([{
        sender_id: user.id, receiver_id: selectedUser.id, content: sticker,
        created_at: new Date().toISOString(), read: false, message_type: 'sticker',
        reply_to: replyingTo ? replyingTo.id : null
      }]).select();
      if (error) throw error;
      if (data?.length > 0) setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data[0].id } : m));
      setReplyingTo(null);
    } catch (e) { showNotification('Failed to send', 'error'); setMessages(prev => prev.filter(m => m.id !== tempId)); }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: usersData } = await supabase.from('users').select('*').neq('id', user.id);
      const { data: userSettings } = await supabase.from('user_settings').select('*');
      const { data: approvedChats } = await supabase.from('chat_requests').select('*').eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const { data: statusData } = await supabase.from('user_status').select('*');

      const usersWithStatus = (usersData || []).map(u => {
        const status = statusData?.find(s => s.user_id === u.id);
        const settings = userSettings?.find(s => s.user_id === u.id);
        const isApproved = approvedChats?.some(c => c.sender_id === u.id || c.receiver_id === u.id);
        return {
          ...u,
          full_name: settings?.full_name || u.name,
          avatar_url: settings?.avatar_url || settings?.avatar || null,
          online: status?.status === 'online' || false,
          isApproved: isApproved || false,
          isBlocked: blockedUsers.includes(u.id)
        };
      });
      setAllUsers(usersWithStatus);
    } catch (e) {} finally { setLoading(false); }
  };

  const loadChatRequests = async () => {
    try {
      const { data } = await supabase.from('chat_requests').select('*').eq('receiver_id', user.id).eq('status', 'pending');
      setChatRequests(data || []);
    } catch (e) {}
  };

  const loadPendingRequests = async () => {
    try {
      const { data } = await supabase.from('chat_requests').select('*').eq('sender_id', user.id).eq('status', 'pending');
      setPendingRequests(data || []);
    } catch (e) {}
  };

  const sendChatRequest = async (receiverId, receiverName) => {
    try {
      if (blockedUsers.includes(receiverId)) { showNotification('User blocked', 'info'); return; }
      if (pendingRequests.find(r => r.receiver_id === receiverId)) { showNotification('Already sent', 'info'); return; }
      const senderName = userProfile?.full_name || user.name || user.email || 'User';
      await supabase.from('chat_requests').insert([{
        sender_id: user.id, sender_name: senderName, receiver_id: receiverId,
        receiver_name: receiverName || 'User', status: 'pending', created_at: new Date().toISOString()
      }]);
      playNotificationSound();
      showNotification('Request sent!', 'success');
      loadPendingRequests(); loadUsers();
    } catch (e) { showNotification('Failed to send', 'error'); }
  };

  const acceptRequest = async (requestId) => {
    try {
      await supabase.from('chat_requests').update({ status: 'accepted' }).eq('id', requestId);
      playNotificationSound();
      showNotification('Accepted!', 'success');
      loadChatRequests(); loadUsers();
      const request = chatRequests.find(r => r.id === requestId);
      if (request) {
        const sender = allUsers.find(u => u.id === request.sender_id);
        if (sender) { setSelectedUser(sender); loadMessages(sender.id); setShowUserList(false); }
      }
      setTimeout(() => setShowRequests(false), 500);
    } catch (e) {}
  };

  const rejectRequest = async (requestId) => {
    try {
      await supabase.from('chat_requests').update({ status: 'rejected' }).eq('id', requestId);
      showNotification('Rejected', 'info');
      loadChatRequests();
      setTimeout(() => setShowRequests(false), 500);
    } catch (e) {}
  };

  const loadMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const { data } = await supabase.from('messages').select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });

      const formatted = (data || []).map(msg => ({
        id: msg.id, sender: msg.sender_id === user.id ? 'user' : 'other',
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: msg.read || false, delivered: true, type: msg.message_type || 'text',
        replyTo: msg.reply_to || null, duration: msg.duration || 0
      }));
      setMessages(formatted);
    } catch (e) {} finally { setLoading(false); }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedUser) return;
    if (blockedUsers.includes(selectedUser.id)) { showNotification('User blocked', 'info'); return; }
    const userMessage = inputText.trim();
    const tempId = Date.now();
    const newMessage = {
      id: tempId, sender: "user", text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true, delivered: true, type: "text",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    playMessageSound();
    try {
      const { data, error } = await supabase.from('messages').insert([{
        sender_id: user.id, receiver_id: selectedUser.id, content: userMessage,
        created_at: new Date().toISOString(), read: false, message_type: 'text',
        reply_to: replyingTo ? replyingTo.id : null
      }]).select();
      if (error) throw error;
      if (data?.length > 0) setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data[0].id } : m));
      setReplyingTo(null);
    } catch (e) { showNotification('Failed to send', 'error'); setMessages(prev => prev.filter(m => m.id !== tempId)); }
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo({ id: message.id, text: message.text, sender: message.sender });
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isUserApproved = (userId) => allUsers.find(u => u.id === userId)?.isApproved || false;
  const isUserBlocked = (userId) => blockedUsers.includes(userId);

  const filteredUsers = allUsers.filter(u => 
    !u.isBlocked && getUserDisplayName(u).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (u) => {
    if (isUserApproved(u.id)) {
      setSelectedUser(u);
      loadMessages(u.id);
      setShowUserList(false);
    } else if (pendingRequests.some(r => r.receiver_id === u.id)) {
      showNotification('Request pending...', 'info');
    } else if (chatRequests.some(r => r.sender_id === u.id)) {
      showNotification('You have a request from this user', 'info');
    } else {
      showNotification('Send a request to chat', 'info');
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-stone-50 to-amber-50/30 dark:from-stone-950 dark:to-stone-900">
        <div className="text-center">
          <FaSpinner className="text-4xl text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-gradient-to-br from-stone-50 via-white to-amber-50/20 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      {/* ✅ Full-screen Image Viewer */}
      <AnimatePresence>
        {viewingImage && (
          <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
        )}
      </AnimatePresence>

      <VoiceCallModal
        isOpen={callModalOpen}
        onClose={() => { if (callStatus === 'active') endCall(); else { setCallModalOpen(false); setCallStatus('idle'); } }}
        callerName={callerInfo?.name || 'Unknown'}
        callerAvatar={callerInfo?.avatar}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEndCall={endCall}
        callStatus={callStatus}
      />

      {showMessageActions && selectedMessage && (
        <MessageActions
          message={selectedMessage}
          onClose={() => { setShowMessageActions(false); setSelectedMessage(null); }}
          onDelete={() => deleteMessage(selectedMessage.id)}
          onReply={() => handleReplyToMessage(selectedMessage)}
        />
      )}

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 max-w-sm w-full"
          >
            <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-lg border ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700' :
              notification.type === 'request' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700' :
              'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  notification.type === 'success' ? 'bg-green-100 dark:bg-green-800' :
                  notification.type === 'request' ? 'bg-amber-100 dark:bg-amber-800' :
                  'bg-blue-100 dark:bg-blue-800'
                }`}>
                  {notification.type === 'success' ? <Check className="text-green-600 dark:text-green-300 text-sm" /> :
                   notification.type === 'request' ? <UserPlus className="text-amber-600 dark:text-amber-300 text-sm" /> :
                   <MessageCircle className="text-blue-600 dark:text-blue-300 text-sm" />}
                </div>
                <p className="flex-1 text-sm font-medium text-stone-900 dark:text-white">{notification.message}</p>
                <button onClick={() => setNotification(null)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700">
                  <X size={14} className="text-stone-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full w-full max-w-7xl mx-auto overflow-hidden flex">

          {/* USER LIST PANEL */}
          <div className={`${showUserList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 xl:w-96 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-r border-stone-200/60 dark:border-stone-800/60 flex-shrink-0`}>
            <div className="p-4 border-b border-stone-200/60 dark:border-stone-800/60 bg-gradient-to-r from-amber-50/50 to-white dark:from-stone-900/50 dark:to-stone-900/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <AvatarWithFallback 
                      seed={user?.id || 'user'} 
                      name={userProfile?.full_name || user?.email || 'User'}
                      avatarUrl={userProfile?.avatar_url || userProfile?.avatar}
                      size="h-11 w-11" 
                      textSize="text-base font-semibold" 
                      className="rounded-2xl ring-2 ring-amber-500/20"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-stone-900 bg-emerald-500">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm truncate">{userProfile?.full_name || user?.email || 'User'}</h3>
                    <p className="text-[11px] text-stone-400">{allUsers.filter(u => !u.isBlocked).length} contacts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={toggleMute}
                    className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button onClick={toggleRequestsPanel}
                    className="relative p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">
                    <Bell size={16} className="text-stone-500 dark:text-stone-400" />
                    {chatRequests.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {chatRequests.length > 9 ? '9+' : chatRequests.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-0 bg-stone-100/80 dark:bg-stone-800/80 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all" />
              </div>
            </div>

            <AnimatePresence>
              {showRequests && chatRequests.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="border-b border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Bell size={12} /> Requests ({chatRequests.length})
                      </h4>
                      <button onClick={() => setShowRequests(false)} className="p-0.5 rounded-full hover:bg-amber-100">
                        <X size={12} className="text-amber-500" />
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {chatRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 rounded-xl bg-white/80 dark:bg-stone-900/50 border border-amber-200/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <AvatarWithFallback 
                              seed={request.sender_id} 
                              name={request.sender_name} 
                              size="h-8 w-8" 
                              textSize="text-[10px]" 
                              className="rounded-xl" 
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-stone-900 dark:text-white truncate max-w-[100px]">{request.sender_name || 'User'}</p>
                              <p className="text-[9px] text-stone-400">Wants to connect</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => acceptRequest(request.id)} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600">
                              <Check size={12} />
                            </button>
                            <button onClick={() => rejectRequest(request.id)} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600">
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 size={32} className="text-stone-300 dark:text-stone-700 animate-spin mx-auto mb-3" />
                  <p className="text-xs text-stone-400">Loading contacts...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                    <Users size={28} className="text-stone-300 dark:text-stone-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No contacts</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Start connecting</p>
                </div>
              ) : (
                filteredUsers.map((u, index) => {
                  const hasPendingRequest = pendingRequests.some(r => r.receiver_id === u.id);
                  const hasIncomingRequest = chatRequests.some(r => r.sender_id === u.id);
                  const displayName = getUserDisplayName(u);
                  const isSelected = selectedUser?.id === u.id;

                  return (
                    <motion.button
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectUser(u)}
                      className={`relative w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 shadow-lg shadow-amber-500/5'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 border-2 border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <AvatarWithFallback 
                          seed={u.id} 
                          name={displayName} 
                          avatarUrl={u.avatar_url}
                          size="h-12 w-12" 
                          textSize="text-sm font-semibold" 
                          className="rounded-2xl"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-stone-900 ${
                          u.online ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
                        }`}>
                          {u.online && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">{displayName}</p>
                          {u.isApproved && (
                            <span className="shrink-0 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">✓</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                          {u.online ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {hasPendingRequest ? (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-full">Pending</span>
                        ) : hasIncomingRequest ? (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Request
                          </span>
                        ) : u.isApproved ? (
                          <button onClick={(e) => { e.stopPropagation(); setUserToUnapprove(u); setShowUnapproveConfirm(true); }}
                            className="p-2 rounded-xl text-stone-300 dark:text-stone-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                            title="Remove partner">
                            <UserMinus size={14} />
                          </button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); sendChatRequest(u.id, displayName); }}
                            className="p-2 rounded-xl text-stone-300 dark:text-stone-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all">
                            <UserPlus size={14} />
                          </button>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            <div className="border-t border-stone-200/60 dark:border-stone-800/60 p-3 bg-gradient-to-r from-amber-50/30 to-white dark:from-stone-900/50 dark:to-stone-900/80">
              <div className="flex items-center gap-3">
                <AvatarWithFallback 
                  seed={user?.id} 
                  name={userProfile?.full_name || user?.email} 
                  avatarUrl={userProfile?.avatar_url || userProfile?.avatar}
                  size="h-9 w-9" 
                  textSize="text-xs font-semibold" 
                  className="rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-white truncate">{userProfile?.full_name || user?.email || 'User'}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <p className="text-[10px] text-stone-400">Online</p>
                  </div>
                </div>
                <button onClick={() => navigate('/settings')} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800">
                  <Settings size={16} className="text-stone-400" />
                </button>
              </div>
            </div>
          </div>

          {/* CHAT AREA */}
          <div className={`${showUserList ? 'hidden' : 'flex'} lg:flex flex-1 flex-col overflow-hidden`}>
            {selectedUser ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/60 dark:border-stone-800/60 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setShowUserList(true)} className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800">
                      <ArrowLeft size={18} className="text-stone-600 dark:text-stone-300" />
                    </button>

                    <div className="relative shrink-0">
                      <AvatarWithFallback 
                        seed={selectedUser.id} 
                        name={getUserDisplayName(selectedUser)} 
                        avatarUrl={selectedUser.avatar_url}
                        size="h-10 w-10" 
                        textSize="text-sm font-semibold" 
                        className="rounded-2xl"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-stone-900 ${
                        selectedUser.online ? 'bg-emerald-500' : 'bg-stone-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-stone-900 dark:text-white truncate">{getUserDisplayName(selectedUser)}</h2>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        {selectedUser.online ? '🟢 Online' : '⚫ Offline'}{selectedUser.isApproved && ' • ✓ Approved'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {selectedUser.isApproved && (
                      <>
                        <div className="relative group">
                          <button onClick={() => handleCallClick('voice')} className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-500 transition-colors">
                            <PhoneIcon size={18} />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Voice Call
                          </span>
                        </div>

                        <div className="relative group hidden sm:block">
                          <button onClick={() => handleCallClick('video')} className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
                            <Video size={18} />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Video Call
                          </span>
                        </div>

                        <div className="relative group">
                          <button onClick={() => setShowClearChatConfirm(true)} className="p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-500 transition-colors">
                            <FaTrash size={16} />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Clear Chat
                          </span>
                        </div>

                        <div className="relative group">
                          <button onClick={() => { setUserToUnapprove(selectedUser); setShowUnapproveConfirm(true); }} className="p-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-500 transition-colors">
                            <FaUndo size={16} />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Remove Partner
                          </span>
                        </div>

                        <div className="relative group">
                          <button onClick={() => blockUser(selectedUser.id)} className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors">
                            <FaBan size={16} />
                          </button>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Block User
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-stone-50/50 to-white dark:from-stone-950 dark:to-stone-900">
                  {!selectedUser.isApproved ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mb-4">
                        <UserPlus size={32} className="text-amber-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-1">Waiting for Approval</h3>
                      <p className="text-sm text-stone-400 mb-4">Send a request to start chatting</p>
                      <button onClick={() => sendChatRequest(selectedUser.id, getUserDisplayName(selectedUser))}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg shadow-amber-500/30">
                        Send Request
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                        <MessageCircle size={32} className="text-stone-300 dark:text-stone-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-1">No messages yet</h3>
                      <p className="text-sm text-stone-400">Say hello to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isUser = message.sender === "user";
                      const isDeleting = deletingMessage === message.id;
                      const isImage = message.type === 'image';
                      const isSticker = message.type === 'sticker';
                      const isVoice = message.type === 'voice';
                      const hasReply = message.replyTo;
                      const isPlayingAudio = playingMessageId === message.id;

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
                          onMouseEnter={() => !isDeleting && setShowMessageMenu(message.id)}
                          onMouseLeave={() => setShowMessageMenu(null)}
                        >
                          <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0 mb-1">
                              {isUser ? (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
                                  {userProfile?.avatar_url || userProfile?.avatar ? (
                                    <img src={userProfile.avatar_url || userProfile.avatar} alt="You" className="h-full w-full object-cover" />
                                  ) : (
                                    <User size={14} />
                                  )}
                                </div>
                              ) : (
                                <AvatarWithFallback 
                                  seed={selectedUser.id} 
                                  name={getUserDisplayName(selectedUser)} 
                                  avatarUrl={selectedUser.avatar_url}
                                  size="h-8 w-8" 
                                  textSize="text-[10px] font-bold" 
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {hasReply && (
                                <div className={`text-[10px] mb-1 px-3 py-1 rounded-xl max-w-full truncate ${
                                  isUser ? 'bg-amber-400/20 text-amber-100' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                                }`}>
                                  <span className="font-medium">Replying to {hasReply.sender === 'user' ? 'yourself' : getUserDisplayName(selectedUser)}:</span>
                                  <span className="ml-1 opacity-80">{hasReply.text?.substring(0, 30)}...</span>
                                </div>
                              )}

                              <div className={`rounded-2xl px-4 py-2.5 relative ${
                                isUser
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 rounded-br-md'
                                  : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-lg border border-stone-200/60 dark:border-stone-700/60 rounded-bl-md'
                              }`}>
                                {isDeleting ? (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FaSpinner className="animate-spin" />
                                    <span>Deleting...</span>
                                  </div>
                                ) : isImage ? (
                                  /* ✅ Clickable image opens full-screen viewer */
                                  <div 
                                    className="relative group/img cursor-pointer overflow-hidden rounded-xl"
                                    onClick={() => setViewingImage(message.text)}
                                  >
                                    <img 
                                      src={message.text} 
                                      alt="Shared" 
                                      className="max-w-[200px] sm:max-w-[280px] rounded-xl transition-transform duration-300 group-hover/img:scale-105" 
                                      loading="lazy" 
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                      <div className="p-2 rounded-full bg-white/90 backdrop-blur-sm">
                                        <FaExpand className="text-stone-900" size={14} />
                                      </div>
                                    </div>
                                  </div>
                                ) : isSticker ? (
                                  <span className="text-5xl block text-center">{message.text}</span>
                                ) : isVoice ? (
                                  <div className="flex items-center gap-3 min-w-[180px]">
                                    <button onClick={() => playVoiceMessage(message)}
                                      className={`p-2 rounded-full transition-all ${isPlayingAudio ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>
                                      {isPlayingAudio ? <FaPause size={14} /> : <FaPlay size={14} />}
                                    </button>
                                    <div className="flex-1">
                                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: '0%' }} animate={{ width: isPlayingAudio ? '100%' : '0%' }}
                                          transition={{ duration: isPlayingAudio ? message.duration || 3 : 0 }}
                                          className="h-full bg-white rounded-full" />
                                      </div>
                                      <div className="flex justify-between mt-1">
                                        <span className="text-[9px] opacity-70">{formatDuration(message.duration || 0)}</span>
                                        <span className="text-[9px] opacity-70">Voice</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                                )}

                                {isUser && showMessageMenu === message.id && !isDeleting && !isImage && (
                                  <div className="absolute -top-2 -right-2 flex gap-1">
                                    <button onClick={() => handleReplyToMessage(message)} className="p-1.5 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600">
                                      <FaReply size={10} />
                                    </button>
                                    <button onClick={() => { setSelectedMessage(message); setShowMessageActions(true); }} className="p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600">
                                      <FaTrash size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : ''}`}>
                                <span className="text-[10px] text-stone-400">{message.timestamp}</span>
                                {isUser && <CheckCheck size={12} className="text-amber-500" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedUser.isApproved && !isUserBlocked(selectedUser.id) && (
                  <div className="border-t border-stone-200/60 dark:border-stone-800/60 p-3 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl flex-shrink-0 relative">
                    {replyingTo && (
                      <ReplyPreview
                        replyTo={{ ...replyingTo, senderName: replyingTo.sender === 'user' ? 'you' : getUserDisplayName(selectedUser) }}
                        onCancelReply={() => setReplyingTo(null)}
                      />
                    )}

                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={replyingTo ? 'Reply...' : `Message ${getUserDisplayName(selectedUser)}...`}
                          rows="1"
                          className="w-full px-4 py-3 pr-28 rounded-3xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none text-sm min-h-[48px] max-h-[120px]"
                          style={{ height: 'auto' }}
                        />
                        <div className="absolute right-2 bottom-3 flex items-center gap-0.5">
                          <button onClick={() => setShowStickerPicker(!showStickerPicker)}
                            className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                            <Smile size={18} className="text-stone-400" />
                          </button>
                          <button onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors" disabled={uploadingImage}>
                            {uploadingImage ? <FaSpinner className="text-stone-400 animate-spin" size={16} /> : <ImageIcon size={18} className="text-stone-400" />}
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          <button onClick={isRecording ? stopRecording : startRecording}
                            className={`p-1.5 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}>
                            {isRecording ? <FaStop size={16} /> : <Mic size={18} className="text-stone-400" />}
                          </button>
                        </div>
                      </div>

                      {isRecording && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 rounded-full">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-medium text-red-500">{formatDuration(recordingDuration)}</span>
                        </div>
                      )}

                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage}
                        disabled={!inputText.trim()}
                        className="p-3.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                        <Send size={20} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {showStickerPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.9 }}
                          className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-4 max-h-[400px] overflow-y-auto z-50"
                        >
                          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {STICKER_CATEGORIES.map((category, idx) => (
                              <button key={idx} onClick={() => setSelectedStickerCategory(idx)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                  selectedStickerCategory === idx
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                                }`}>
                                {category.name}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {STICKER_CATEGORIES[selectedStickerCategory].emojis.map((emoji, idx) => (
                              <motion.button key={idx} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                                onClick={() => sendSticker(emoji)}
                                className="text-3xl p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                          <button onClick={() => setShowStickerPicker(false)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
                            <X size={14} className="text-stone-400" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {isUserBlocked(selectedUser.id) && (
                  <div className="border-t border-stone-200/60 dark:border-stone-800/60 p-4 bg-red-50 dark:bg-red-950/20 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                      <FaBan /> You have blocked this user
                      <button onClick={() => unblockUser(selectedUser.id)}
                        className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full hover:bg-emerald-600">
                        Unblock
                      </button>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 flex items-center justify-center mb-6">
                  <MessageCircle size={48} className="text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Welcome to Chat</h2>
                <p className="text-sm text-stone-400 dark:text-stone-500 max-w-xs">
                  Select a contact from the list to start a conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Partner Confirmation Modal */}
      <AnimatePresence>
        {showUnapproveConfirm && userToUnapprove && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => { setShowUnapproveConfirm(false); setUserToUnapprove(null); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <FaUndo className="text-3xl text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Remove Chat Partner</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                  Remove <span className="font-semibold text-stone-900 dark:text-white">{getUserDisplayName(userToUnapprove)}</span> from your approved chat partners?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowUnapproveConfirm(false); setUserToUnapprove(null); }}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium">
                    Cancel
                  </button>
                  <button onClick={() => unapproveUser(userToUnapprove.id)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all">
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Chat Confirmation Modal */}
      <AnimatePresence>
        {showClearChatConfirm && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearChatConfirm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-3xl text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Clear Chat</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                  Delete all messages between you and <span className="font-semibold text-stone-900 dark:text-white">{getUserDisplayName(selectedUser)}</span>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowClearChatConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium">
                    Cancel
                  </button>
                  <button onClick={clearChat}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                    Clear Chat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;